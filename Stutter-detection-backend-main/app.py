from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import threading
import ffmpeg
import shutil
import base64
import bcrypt
import sys
import uuid
import time as _time
import jwt as pyjwt
import hashlib
import secrets
from functools import wraps
from bson.objectid import ObjectId
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
from bson.binary import Binary
from analyzer import SpeechAnalyzer
import json
import boto3
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

app = Flask(__name__)
CORS(app)
load_dotenv()

# AWS S3 Setup
s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

S3_BUCKET = os.getenv("AWS_BUCKET_NAME")

# MongoDB setup
client = MongoClient(os.getenv("MONGODB_URI"), connect=False)
db = client.stutter_db
tasks_collection = db["tasks"]
slp_patient_collection = db["slp_patient"]

analyzer = SpeechAnalyzer()
db = client["stutter_db"]
users_collection = db["users"]
notifications_collection = db["notifications"]
shared_links_collection = db["shared_links"]
slp_profiles_collection = db["slp_profiles"]
slp_assessments_collection = db["slp_assessments"]
admin_activity_collection = db["admin_activity"]


# Media uploads directory
_MEDIA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads", "_sys")
os.makedirs(_MEDIA_DIR, exist_ok=True)

# Profile pictures directory
PROFILE_PICTURES_DIR = "profile_pictures"
os.makedirs(PROFILE_PICTURES_DIR, exist_ok=True)



def extract_audio(mp4_filepath, wav_filepath):
    try:
        ffmpeg.input(mp4_filepath).output(
            wav_filepath, format="wav", acodec="pcm_s16le", ar="16000"
        ).run(overwrite_output=True, quiet=True)
        return True
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return False


def analyze_audio_thread(filepath, task_id, audio_bytes, language=None, video_path=None):
    try:
        if not os.path.exists(filepath):
            raise RuntimeError("Audio file missing before analysis")

        # Start S3 Upload in parallel
        def s3_upload_task():
            filename = os.path.basename(filepath)
            s3_key = f"recordings/{task_id}/{filename}"
            try:
                s3.upload_file(filepath, S3_BUCKET, s3_key)
                s3_video_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{s3_key}"
                # Store S3 URL in a separate field — do NOT overwrite video_url
                # video_url must stay as the local /uploads/ path so nginx can proxy it
                tasks_collection.update_one(
                    {"task_id": task_id},
                    {"$set": {"s3_video_url": s3_video_url}}
                )
                print(f"✅ Uploaded to S3 successfully for task {task_id}")
            except Exception as e:
                print(f"Warning: Failed to upload to S3: {e}")

        threading.Thread(target=s3_upload_task).start()

        audio_filepath = filepath

        # Extract audio if it is a video
        if video_path:
            wav_path = os.path.splitext(filepath)[0] + ".wav"
            if not extract_audio(filepath, wav_path):
                raise RuntimeError("Audio extraction failed")
            audio_filepath = wav_path

        if not os.path.exists(audio_filepath):
            raise RuntimeError("Audio file missing before analysis")

        analysis_results = analyzer.analyze_audio_file(audio_filepath, language=language, task_id=task_id, video_path=video_path)

        if not analysis_results:
            raise RuntimeError("Analysis returned empty result")

        # --- FIX STARTS HERE ---
        # On success, update the task with results and "completed" status
        tasks_collection.update_one(
            {"task_id": task_id},
            {"$set": {
                "status": "completed",
                "results": analysis_results,
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }}
        )
        print(f"✅ Task {task_id} completed and status updated in DB.")
        _fire_webhooks("analysis_completed", {
            "task_id": task_id,
            "fluency_score": analysis_results.get("fluency_score"),
            "severity": analysis_results.get("severity")
        })
        # --- FIX ENDS HERE ---

    except Exception as e:
        print(f"❌ Error during analysis for task {task_id}: {e}")
        
        # --- FIX STARTS HERE ---
        # On failure, update the task with an error message and "failed" status
        tasks_collection.update_one(
            {"task_id": task_id},
            {"$set": {
                "status": "failed",
                "error": str(e),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }}
        )
        print(f"🔥 Task {task_id} failed and status updated in DB.")
        _fire_webhooks("analysis_failed", {
            "task_id": task_id,
            "error": str(e)
        })

    finally:
        task_folder = os.path.join("./results", task_id)
        if os.path.exists(task_folder):
            shutil.rmtree(task_folder)

@app.route("/health", methods=["GET"])
def health():
    """
    Healthcheck endpoint for Docker.
    Returns 200 OK if the Flask app is running.
    """
    return jsonify({"status": "ok"}), 200

@app.route("/api/upload_audio/<task_id>", methods=["POST"])
def upload_audio(task_id):
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    language = request.form.get("language")  # e.g. 'en', 'hi', 'mr'
    user_details = request.form.get("user_details")
    if user_details:
        user_details = json.loads(user_details)  # safe here since it comes from your frontend



    filename = secure_filename(file.filename)

    upload_dir = os.path.join("uploads", task_id)
    os.makedirs(upload_dir, exist_ok=True)

    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)


    local_video_url = f"/uploads/{task_id}/{filename}"
    tasks_collection.update_one(
        {"task_id": task_id},
        {"$setOnInsert": {
            "status": "processing",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "video_url": local_video_url,
            "patient": user_details,
            "language": language or "en"
        }},
        upsert=True
    )
    
    
    VIDEO_EXTENSIONS = (".mp4", ".webm", ".avi", ".mkv", ".mov")
    is_video = filename.lower().endswith(VIDEO_EXTENSIONS)

    if not os.path.exists(filepath) or os.path.getsize(filepath) < 2048:
        tasks_collection.update_one(
            {"task_id": task_id},
            {"$set": {"status": "failed"}}
        )
        return jsonify({
            "error": "Audio file is empty or corrupted. Please record again."
        }), 400

  
    thread = threading.Thread(
        target=analyze_audio_thread,
        args=(filepath, task_id, None),
        kwargs={
            "language": language or "en",
            "video_path": filepath if is_video else None
        }
    )
    thread.start()


    user_id = request.form.get("user_id")
    if user_id:
        tasks_collection.update_one(
            {"task_id": task_id},
            {"$set": {"user_id": user_id}}
        )
        
        try:
            # Find assigned SLP for this patient
            slp_assignment = slp_patient_collection.find_one({"patient_id": user_id})
            if slp_assignment and slp_assignment.get("slp_id"):
                slp_id = slp_assignment["slp_id"]
                
                # Get patient name
                patient_name = user_details.get("name", "A patient") if user_details else "A patient"
                
                # Create notification
                import uuid
                notification = {
                    "notification_id": str(uuid.uuid4()),
                    "recipient_id": slp_id,
                    "type": "new_recording",
                    "title": "New Recording Uploaded",
                    "message": f"{patient_name} has uploaded a new recording for analysis",
                    "patient_name": patient_name,
                    "task_id": task_id,
                    "read": False,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                notifications_collection.insert_one(notification)
                print(f"📢 Notification created for SLP {slp_id}")
        except Exception as e:
            print(f"⚠️ Could not create notification: {e}")

    return jsonify({"message": "Processing started", "task_id": task_id}), 200

@app.route("/api/tasks", methods=["GET"])
def list_tasks():
    """List tasks with optional filtering by user_id or slp_id"""
    try:
        user_id = request.args.get("user_id")
        slp_id = request.args.get("slp_id")
        
        query = {}
        if user_id:
            query["user_id"] = user_id
        elif slp_id:
            # Find all patients for this SLP
            patient_links = list(slp_patient_collection.find({"slp_id": slp_id}))
            patient_ids = [link["patient_id"] for link in patient_links]
            query["user_id"] = {"$in": patient_ids}
            
        tasks = list(
            tasks_collection.find(
                query,
                {
                    "_id": 0,
                    "task_id": 1,
                    "status": 1,
                    "timestamp": 1,
                    "user_id": 1,
                    "video_url": 1,
                    "patient": 1,
                    "language": 1,
                    "results.fluency_score": 1,
                    "results.severity": 1,
                    "results.duration": 1,
                    "results.disfluency_types": 1,
                }
            ).sort("timestamp", -1)
        )

        return jsonify({"status": "success", "count": len(tasks), "tasks": tasks})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/slp_assessed_tasks/<slp_id>", methods=["GET"])
def get_slp_assessed_tasks(slp_id):
    """Return a list of task_ids for which this SLP has saved an assessment.
    Used by the SLP Analyze page to distinguish pending vs completed analyses."""
    try:
        assessments = list(slp_assessments_collection.find(
            {"slp_id": slp_id},
            {"_id": 0, "task_id": 1}
        ))
        assessed_task_ids = [a["task_id"] for a in assessments if a.get("task_id")]
        return jsonify({"status": "success", "assessed_task_ids": assessed_task_ids})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/slps", methods=["GET"])
def list_slps():
    """List all available SLPs"""
    try:
        slps = list(users_collection.find({
            "userType": "slp"
        }, {"_id": 1, "name": 1, "email": 1}))
        for slp in slps:
            slp["_id"] = str(slp["_id"])
        return jsonify({"status": "success", "slps": slps})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/assign_slp", methods=["POST"])
def assign_slp():
    """Assign an SLP to a patient"""
    try:
        data = request.get_json()
        patient_id = data.get("patient_id")
        slp_id = data.get("slp_id")
        
        if not patient_id or not slp_id:
            return jsonify({"error": "Missing patient_id or slp_id"}), 400
            
        slp_patient_collection.update_one(
            {"patient_id": patient_id},
            {"$set": {"slp_id": slp_id, "updatedAt": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        return jsonify({"message": "SLP assigned successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/my_slp/<patient_id>", methods=["GET"])
def get_my_slp(patient_id):
    """Get the assigned SLP for a patient"""
    try:
        link = slp_patient_collection.find_one({"patient_id": patient_id})
        if not link:
            return jsonify({"slp": None}), 200
            
        slp = users_collection.find_one({"_id": ObjectId(link["slp_id"])}, {"_id": 1, "name": 1, "email": 1})
        if slp:
            slp["_id"] = str(slp["_id"])
            
        return jsonify({"slp": slp}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/task_status/<task_id>", methods=["GET"])
def get_task_status(task_id):
    task = tasks_collection.find_one(
        {"task_id": task_id},
        {"_id": 0}
    )

    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    # Get results but exclude large visualization to reduce response size
    results = task.get("results")
    if results:
        # Create a lightweight copy without visualization
        results_light = {k: v for k, v in results.items() if k != "visualization"}
        # Include visualization only if explicitly requested
        include_viz = request.args.get("include_visualization", "false").lower() == "true"
        if include_viz:
            results_light["visualization"] = results.get("visualization")
    else:
        results_light = None

    # Get patient info if user_id exists
    patient_name = None
    patient_id = None
    if task.get("user_id"):
        try:
            user = users_collection.find_one({"_id": ObjectId(task["user_id"])})
            if user:
                patient_name = user.get("name")
                patient_id = user.get("uniqueId")
        except Exception:
            pass
    
    # Fallback to patient info stored in task if no user lookup
    if not patient_name and task.get("patient"):
        patient_name = task["patient"].get("name")
        patient_id = task["patient"].get("email", "")[:8]  # Use partial email as fallback ID

    return jsonify({
        "task_id": task["task_id"],
        "status": task.get("status", "unknown"),
        "results": results_light,
        "video_url": task.get("video_url"),
        "patient_name": patient_name,
        "patient_id": patient_id,
        "error": task.get("error")
    }), 200



@app.route("/api/get_result/<task_id>", methods=["GET"])
def get_result(task_id):
    """Retrieve analysis results.
    
    Query params:
        include_visualization: Set to 'true' to include visualization data (large base64 image).
                              Default is False to reduce response size.
    """
    task = tasks_collection.find_one({"task_id": task_id}, {"_id": 0})

    if not task:
        return jsonify({"error": "Task not found"}), 404

    if task["status"] != "completed":
        return jsonify({"status": task["status"]}), 202

    # Handle cases where "results" field doesn't exist (old tasks)
    if "results" not in task:
        return jsonify({"error": "Results not available for this task"}), 404

    results = task["results"]
    
    # Check if visualization should be included (default: exclude to reduce response size)
    include_viz = request.args.get('include_visualization', 'false').lower() == 'true'
    
    if not include_viz:
        # Return results without the heavy visualization data
        # Note: spectrogram is just a URL string (not base64), so it's safe to include
        results_without_viz = {k: v for k, v in results.items() if k != "visualization"}
        return jsonify(results_without_viz)

    return jsonify(results)

# Ensure UTF-8 for console output (Windows fix)
sys.stdout.reconfigure(encoding='utf-8')


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('userType')

        if not email or not password or not user_type:
            return jsonify({"error": "Missing fields"}), 400


        # Check registration gate
        if get_config("block_login", False):
            return jsonify({"error": "Login is temporarily unavailable"}), 403

        user = users_collection.find_one({"email": email.lower(), "userType": user_type})
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        stored_password = user['password']
        # Ensure stored password is bytes
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')

        if bcrypt.checkpw(password.encode('utf-8'), stored_password):
            user_id = str(user["_id"])
            # Update last login time
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"lastLogin": datetime.now(timezone.utc).isoformat()}}
            )
            # Generate JWT for normal users too (needed for shadow ban checks)
            token = _generate_token({
                "sub": user_id,
                "name": user["name"],
                "type": user_type
            })
            return jsonify({
                "message": "Logged in successfully",
                "userId": user_id,
                "name": user["name"],
                "userType": user_type,
                "uniqueId": user.get("uniqueId"),
                "token": token
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print(f"❌ Login Error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/api/google_login', methods=['POST'])
def google_login():
    try:
        data = request.get_json()
        token = data.get('token')
        user_type = data.get('userType', 'patient')  # Default to patient

        if not token:
            return jsonify({"error": "Missing token"}), 400

        GOOGLE_CLIENT_ID = "**************************.apps.googleusercontent.com"
        
        try:
            # We are verifying the token, but because a placeholder client id is being used
            # We must set verify_aud=False temporarily to allow any dummy/bypass tests.
            # IN PRODUCTION: Remove verify_aud=False
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            email = idinfo['email'].lower()
            name = idinfo.get('name', 'Google User')
        except ValueError:
            return jsonify({"error": "Invalid Google token"}), 401

        # Check if user exists
        user = users_collection.find_one({"email": email})
        
        if not user:
            # Create a new user account if they don't exist
            unique_id = None
            if user_type == "patient":
                patient_count = users_collection.count_documents({"userType": "patient"})
                unique_id = f"P-{str(patient_count + 1).zfill(3)}"
            elif user_type == "slp":
                slp_count = users_collection.count_documents({"userType": "slp"})
                unique_id = f"SLP-{str(slp_count + 1).zfill(3)}"

            new_user = {
                "name": name,
                "email": email,
                "password": b"GOOGLE_SSO_USER",  # Placeholder bytes for SSO
                "userType": user_type,
                "uniqueId": unique_id,
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat(),
                "lastLogin": datetime.now(timezone.utc).isoformat(),
                "isActive": True
            }
            result = users_collection.insert_one(new_user)
            userId = str(result.inserted_id)
        else:
            userId = str(user["_id"])
            user_type = user["userType"]
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"lastLogin": datetime.now(timezone.utc).isoformat()}}
            )

        return jsonify({
            "message": "Logged in successfully",
            "userId": userId,
            "name": user["name"] if user else name,
            "userType": user_type,
            "uniqueId": user.get("uniqueId") if user else unique_id
        }), 200

    except Exception as e:
        print(f"❌ Google Login Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/verify_user", methods=["POST"])
def verify_user():
    try:
        data = request.get_json()
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()  # normalize email

        if not name or not email:
            return jsonify({"error": "Missing fields"}), 400

        # Match only by email (since names may vary)
        user = users_collection.find_one({"email": email})

        if user:
            return jsonify({
                "userId": str(user["_id"]),
                "name": user["name"]
            }), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/user_name/<user_id>", methods=["GET"])
def get_user_name(user_id):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            return jsonify({"name": user["name"]}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('userType')

        if not name or not email or not password or not user_type:
            return jsonify({"error": "Missing fields"}), 400

        # Check if the email already exists
        existing_user = users_collection.find_one({"email": email.lower()})
        if existing_user:
            return jsonify({"error": "Email already in use"}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        unique_id = None
        if user_type == "patient":
            patient_count = users_collection.count_documents({"userType": "patient"})
            unique_id = f"P-{str(patient_count + 1).zfill(3)}"
        elif user_type == "slp":

            slp_count = users_collection.count_documents({"userType": "slp"})
            unique_id = f"SLP-{str(slp_count + 1).zfill(3)}"

        new_user = {
            "name": name,
            "email": email.lower(),
            "password": hashed_password,  # stored as bytes
            "userType": user_type,
            "uniqueId": unique_id,  # P-001 for patients, SLP-001 for SLPs
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "lastLogin": None,
            "isActive": True
        }

        result = users_collection.insert_one(new_user)

        if result.acknowledged:
            _fire_webhooks("new_signup", {"name": name, "email": email, "userType": user_type, "uniqueId": unique_id})
            return jsonify({
                "message": "User created successfully",
                "userId": str(result.inserted_id),
                "uniqueId": unique_id
            }), 201
        else:
            return jsonify({"error": "Failed to create user"}), 500

    except Exception as e:
        print(f"❌ Signup Error: {e}")
        return jsonify({"error": "Internal server error"}), 500



@app.route("/uploads/<task_id>/<filename>")
def serve_video(task_id, filename):
    upload_dir = os.path.join("uploads", task_id)
    file_path = os.path.join(upload_dir, filename)

    # Try exact match first
    if os.path.exists(file_path):
        return send_from_directory(upload_dir, filename)

    if os.path.isdir(upload_dir):
        VIDEO_EXTS = ('.mp4', '.webm', '.avi', '.mkv', '.mov', '.wav', '.mp3', '.ogg')
        for f in os.listdir(upload_dir):
            if f.lower().endswith(VIDEO_EXTS):
                print(f"⚠️ Filename mismatch for task {task_id}: requested '{filename}', serving '{f}'")
                return send_from_directory(upload_dir, f)

    return jsonify({"error": "Video not found"}), 404


@app.route("/analysis_results/<task_id>/<filename>")
def serve_analysis_image(task_id, filename):
    """Serve visualization/spectrogram images from disk (instead of base64 in MongoDB)."""
    return send_from_directory(
        os.path.join("analysis_results", task_id),
        filename
    )

@app.route('/api/dashboard/<user_id>', methods=['GET'])
def get_dashboard(user_id):
    """Get comprehensive dashboard data for a user"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$project": {"_id": 0, "results.visualization": 0}},  # Exclude heavy data
            {"$sort": {"timestamp": -1}},
            {"$limit": 50}  # Limit to 50 most recent
        ]
        user_tasks = list(tasks_collection.aggregate(pipeline, allowDiskUse=True))
        
        completed_tasks = [t for t in user_tasks if t.get("status") == "completed"]
        total_analyses = len(completed_tasks)
        
        fluency_scores = []
        for task in completed_tasks:
            if task.get("results") and task["results"].get("fluency_score"):
                fluency_scores.append(task["results"]["fluency_score"])
        
        avg_fluency = sum(fluency_scores) / len(fluency_scores) if fluency_scores else 0
        
        progress_data = []
        for task in completed_tasks[:10]:
            if task.get("results"):
                progress_data.append({
                    "date": task.get("timestamp", ""),
                    "score": task["results"].get("fluency_score", 0),
                    "task_id": task.get("task_id", "")
                })
        
\        improvement = 0
        if len(fluency_scores) >= 2:
            recent_avg = sum(fluency_scores[:5]) / min(5, len(fluency_scores))
            old_avg = sum(fluency_scores[-5:]) / min(5, len(fluency_scores))
            improvement = recent_avg - old_avg
        
        achievements = calculate_achievements(user_id, total_analyses, avg_fluency, fluency_scores)
        
        def strip_visualization(tasks):
            light_tasks = []
            for task in tasks:
                task_copy = task.copy()
                if task_copy.get("results"):
                    results_copy = {k: v for k, v in task_copy["results"].items() if k != "visualization"}
                    task_copy["results"] = results_copy
                light_tasks.append(task_copy)
            return light_tasks
        
        return jsonify({
            "status": "success",
            "user": {
                "name": user.get("name"),
                "email": user.get("email"),
                "userType": user.get("userType"),
                "memberSince": user.get("createdAt"),
                "lastLogin": user.get("lastLogin")
            },
            "stats": {
                "totalAnalyses": total_analyses,
                "avgFluencyScore": round(avg_fluency, 1),
                "improvement": round(improvement, 1),
                "streak": calculate_streak(user_tasks),
                "totalDuration": sum([t.get("results", {}).get("duration", 0) for t in completed_tasks])
            },
            "progress": progress_data,
            "achievements": achievements,
            "recentTasks": strip_visualization(user_tasks[:5])
        }), 200
        
    except Exception as e:
        print(f"❌ Dashboard Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/slp_dashboard/<slp_id>', methods=['GET'])
def get_slp_dashboard(slp_id):
    """Get dashboard data for an SLP including all patients and their analyses"""
    try:
        slp = users_collection.find_one({"_id": ObjectId(slp_id), "userType": "slp"})
        if not slp:
            return jsonify({"error": "SLP not found"}), 404
        
        patient_links = list(slp_patient_collection.find({"slp_id": slp_id}))
        patient_ids = [link["patient_id"] for link in patient_links]
        
        patients_data = []
        all_patient_tasks = []
        
        for patient_id in patient_ids:
            try:
                patient = users_collection.find_one({"_id": ObjectId(patient_id)})
                if not patient:
                    continue
                    
                # Get patient's tasks
                patient_tasks = list(tasks_collection.find(
                    {"user_id": patient_id},
                    {"_id": 0}
                ).sort("timestamp", -1))
                
                completed_tasks = [t for t in patient_tasks if t.get("status") == "completed"]
                
                # Calculate patient stats
                fluency_scores = [
                    t["results"]["fluency_score"] 
                    for t in completed_tasks 
                    if t.get("results") and t["results"].get("fluency_score")
                ]
                avg_fluency = sum(fluency_scores) / len(fluency_scores) if fluency_scores else 0
                
                patients_data.append({
                    "patient_id": patient_id,
                    "name": patient.get("name", "Unknown"),
                    "email": patient.get("email", ""),
                    "totalAnalyses": len(completed_tasks),
                    "avgFluencyScore": round(avg_fluency, 1),
                    "lastAnalysis": patient_tasks[0].get("timestamp") if patient_tasks else None,
                    "recentTasks": patient_tasks[:3]  # Last 3 tasks for quick view
                })
                
                # Add patient info to each task and collect all tasks
                for task in completed_tasks:
                    task["patientName"] = patient.get("name", "Unknown")
                    task["patientId"] = patient_id
                    all_patient_tasks.append(task)
                    
            except Exception as pe:
                print(f"Error processing patient {patient_id}: {pe}")
                continue
        
        all_patient_tasks.sort(key=lambda t: t.get("timestamp", ""), reverse=True)
        
        def strip_visualization(tasks):
            light_tasks = []
            for task in tasks:
                task_copy = task.copy()
                if task_copy.get("results"):
                    results_copy = {k: v for k, v in task_copy["results"].items() if k != "visualization"}
                    task_copy["results"] = results_copy
                light_tasks.append(task_copy)
            return light_tasks
        
        for patient in patients_data:
            patient["recentTasks"] = strip_visualization(patient.get("recentTasks", []))
        
        return jsonify({
            "status": "success",
            "slp": {
                "name": slp.get("name"),
                "email": slp.get("email")
            },
            "patients": patients_data,
            "totalPatients": len(patients_data),
            "allPatientTasks": strip_visualization(all_patient_tasks[:20]),
            "stats": {
                "totalAnalyses": sum(p["totalAnalyses"] for p in patients_data),
                "avgFluencyScore": round(
                    sum(p["avgFluencyScore"] * p["totalAnalyses"] for p in patients_data) / 
                    max(1, sum(p["totalAnalyses"] for p in patients_data)),
                    1
                ) if patients_data else 0
            }
        }), 200
        
    except Exception as e:
        print(f"❌ SLP Dashboard Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/progress/<user_id>', methods=['GET'])
def get_progress(user_id):
    """Get detailed progress history for a user"""
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        tasks = list(tasks_collection.find({
            "user_id": user_id,
            "status": "completed"
        }).sort("timestamp", -1))
        
        progress = []
        for task in tasks:
            if task.get("results"):
                progress.append({
                    "taskId": task.get("task_id"),
                    "date": task.get("timestamp"),
                    "fluencyScore": task["results"].get("fluency_score", 0),
                    "duration": task["results"].get("duration", 0),
                    "totalWords": task["results"].get("analysis_details", {}).get("totalWords", 0),
                    "stutterEvents": len(task["results"].get("stuttering_events", [])),
                    "disfluencyTypes": task["results"].get("disfluency_types", {})
                })
        
        weekly_data = {}
        for p in progress:
            try:
                date = datetime.fromisoformat(p["date"].replace('Z', '+00:00'))
                week_key = date.strftime("%Y-W%W")
                if week_key not in weekly_data:
                    weekly_data[week_key] = []
                weekly_data[week_key].append(p["fluencyScore"])
            except:
                pass
        
        weekly_averages = [
            {"week": k, "avgScore": round(sum(v)/len(v), 1)}
            for k, v in sorted(weekly_data.items())
        ]
        
        return jsonify({
            "status": "success",
            "progress": progress,
            "weeklyAverages": weekly_averages,
            "totalSessions": len(progress)
        }), 200
        
    except Exception as e:
        print(f"❌ Progress Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user profile information"""
    try:
        data = request.get_json()
        
        update_fields = {}
        allowed_fields = ["name", "phone", "bio", "preferences"]
        
        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]
        
        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400
        
        update_fields["updatedAt"] = datetime.now(timezone.utc).isoformat()
        
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )
        
        if result.modified_count > 0:
            return jsonify({"message": "Profile updated successfully"}), 200
        else:
            return jsonify({"error": "User not found or no changes made"}), 404
            
    except Exception as e:
        print(f"❌ Update User Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats/<user_id>', methods=['GET'])
def get_user_stats(user_id):
    """Get quick statistics for a user"""
    try:
        pipeline = [
            {"$match": {"user_id": user_id, "status": "completed"}},
            {"$group": {
                "_id": None,
                "totalAnalyses": {"$sum": 1},
                "avgScore": {"$avg": "$results.fluency_score"},
                "maxScore": {"$max": "$results.fluency_score"},
                "minScore": {"$min": "$results.fluency_score"},
                "totalDuration": {"$sum": "$results.duration"}
            }}
        ]
        
        result = list(tasks_collection.aggregate(pipeline))
        
        if result:
            stats = result[0]
            return jsonify({
                "status": "success",
                "stats": {
                    "totalAnalyses": stats.get("totalAnalyses", 0),
                    "avgScore": round(stats.get("avgScore", 0), 1),
                    "maxScore": round(stats.get("maxScore", 0), 1),
                    "minScore": round(stats.get("minScore", 0), 1),
                    "totalDuration": stats.get("totalDuration", 0)
                }
            }), 200
        else:
            return jsonify({
                "status": "success",
                "stats": {
                    "totalAnalyses": 0,
                    "avgScore": 0,
                    "maxScore": 0,
                    "minScore": 0,
                    "totalDuration": 0
                }
            }), 200
            
    except Exception as e:
        print(f"❌ Stats Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/patient_history/<patient_email>", methods=["GET"])
def get_patient_history(patient_email):
    """Get all recordings/analyses for a specific patient."""
    try:
        # Find all tasks for this patient
        tasks = list(tasks_collection.find(
            {"patient.email": patient_email},
            {"_id": 0, "task_id": 1, "timestamp": 1, "status": 1, "patient": 1,
             "results.fluency_score": 1, "results.duration": 1, "results.stuttering_events": 1,
             "slp_assessment": 1}
        ).sort("timestamp", -1))
        
        if not tasks:
            return jsonify({
                "status": "success",
                "patient": None,
                "recordings": []
            }), 200
        
        patient_info = tasks[0].get("patient", {})
        
        recordings = []
        for task in tasks:
            recording = {
                "task_id": task.get("task_id"),
                "timestamp": task.get("timestamp"),
                "status": task.get("status"),
                "fluency_score": task.get("results", {}).get("fluency_score", 0),
                "duration": task.get("results", {}).get("duration", 0),
                "stutter_count": len(task.get("results", {}).get("stuttering_events", [])),
                "has_slp_assessment": "slp_assessment" in task,
                "slp_severity": task.get("slp_assessment", {}).get("severity_rating", None)
            }
            recordings.append(recording)
        
        return jsonify({
            "status": "success",
            "patient": patient_info,
            "recordings": recordings,
            "total_recordings": len(recordings)
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting patient history: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/all_results/<user_id>", methods=["GET"])
def get_all_results(user_id):
    """Get all results for a user with pagination and filtering."""
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
        status_filter = request.args.get("status")
        
        query = {"user_id": user_id}
        if status_filter:
            query["status"] = status_filter
        
        total = tasks_collection.count_documents(query)
        
                pipeline = [
            {"$match": query},
            {"$project": {
                "_id": 0, 
                "task_id": 1, 
                "timestamp": 1, 
                "status": 1,
                "video_url": 1,
                "language": 1,
                "results.fluency_score": 1,
                "results.duration": 1,
                "results.severity": 1,
                "results.num_repetitions": 1,
                "results.num_fillers": 1,
                "results.num_prolongations": 1,
                "results.num_blocks": 1,
                "slp_assessment.severity_rating": 1,
                "patient": 1
            }},
            {"$sort": {"timestamp": -1}},
            {"$skip": (page - 1) * per_page},
            {"$limit": per_page}
        ]
        
        tasks = list(tasks_collection.aggregate(pipeline, allowDiskUse=True))
        
        results = []
        for task in tasks:
            # Get patient info from user_id
            patient_name = task.get("patient", {}).get("name", "Unknown")
            
            results.append({
                "task_id": task.get("task_id"),
                "timestamp": task.get("timestamp"),
                "status": task.get("status"),
                "patient_name": patient_name,
                "fluency_score": task.get("results", {}).get("fluency_score", 0),
                "duration": task.get("results", {}).get("duration", 0),
                "severity": task.get("slp_assessment", {}).get("severity_rating") or task.get("results", {}).get("severity", "Not Assessed"),
                "video_url": task.get("video_url"),
                "language": task.get("language", "en"),
                "stutter_counts": {
                    "repetitions": task.get("results", {}).get("num_repetitions", 0),
                    "fillers": task.get("results", {}).get("num_fillers", 0),
                    "prolongations": task.get("results", {}).get("num_prolongations", 0),
                    "blocks": task.get("results", {}).get("num_blocks", 0),
                }
            })
        
        return jsonify({
            "status": "success",
            "results": results,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting all results: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/notifications/<user_id>", methods=["GET"])
def get_notifications(user_id):
    """Get notifications for a user."""
    try:
        notifications = list(notifications_collection.find(
            {"recipient_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(50))
        
        return jsonify({
            "status": "success",
            "notifications": notifications
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting notifications: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/notifications/<user_id>/count", methods=["GET"])
def get_notification_count(user_id):
    """Get unread notification count for a user."""
    try:
        count = notifications_collection.count_documents({
            "recipient_id": user_id,
            "read": False
        })
        
        return jsonify({"unread_count": count}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/notifications/mark_read", methods=["POST"])
def mark_notifications_read():
    """Mark notifications as read."""
    try:
        data = request.json
        notification_ids = data.get("notification_ids", [])
        user_id = data.get("user_id")
        
        if notification_ids:
            notifications_collection.update_many(
                {"notification_id": {"$in": notification_ids}},
                {"$set": {"read": True}}
            )
        elif user_id:
            notifications_collection.update_many(
                {"recipient_id": user_id},
                {"$set": {"read": True}}
            )
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


import secrets

@app.route("/api/share_result/<task_id>", methods=["POST"])
def create_share_link(task_id):
    """Generate a shareable link for a result."""
    try:
        task = tasks_collection.find_one({"task_id": task_id})
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        token = secrets.token_urlsafe(32)
        
        # Create share link record
        share_link = {
            "token": token,
            "task_id": task_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_by": request.json.get("user_id") if request.json else None
        }
        
        shared_links_collection.insert_one(share_link)
        
        return jsonify({
            "status": "success",
            "token": token,
            "share_url": f"/shared/{token}",
            "expires_in_days": 7
        }), 200
        
    except Exception as e:
        print(f"❌ Error creating share link: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/shared/<token>", methods=["GET"])
def get_shared_result(token):
    """Get result via shared link (no auth required)."""
    try:
        share_link = shared_links_collection.find_one({"token": token})
        if not share_link:
            return jsonify({"error": "Invalid or expired link"}), 404
        
        expires_at = datetime.fromisoformat(share_link["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires_at:
            return jsonify({"error": "Link has expired"}), 410
        
        task = tasks_collection.find_one(
            {"task_id": share_link["task_id"]},
            {"_id": 0, "results.visualization": 0}  # Exclude large data
        )
        
        if not task:
            return jsonify({"error": "Result not found"}), 404
        
        patient_name = None
        patient_id = None
        if task.get("user_id"):
            try:
                user = users_collection.find_one({"_id": ObjectId(task["user_id"])})
                if user:
                    patient_name = user.get("name")
                    patient_id = user.get("uniqueId")
            except Exception:
                pass
        
        return jsonify({
            "status": "success",
            "task_id": task.get("task_id"),
            "patient_name": patient_name,
            "patient_id": patient_id,
            "timestamp": task.get("timestamp"),
            "results": task.get("results"),
            "slp_assessment": task.get("slp_assessment"),
            "video_url": task.get("video_url")
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting shared result: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/slp/profile/<user_id>", methods=["GET"])
def get_slp_profile(user_id):
    """Get SLP profile by user ID."""
    try:
        profile = slp_profiles_collection.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        if not profile:
            return jsonify({
                "profile_exists": False,
                "profile": None
            }), 200
        
        return jsonify({
            "profile_exists": True,
            "profile": profile
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting SLP profile: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/slp/profile/<user_id>", methods=["PUT"])
def update_slp_profile(user_id):
    """Create or update SLP profile."""
    try:
        data = request.json
        
        profile = {
            "user_id": user_id,
            "full_name": data.get("full_name", ""),
            "dob": data.get("dob", ""),
            "professional_title": data.get("professional_title", "Speech-Language Pathologist (SLP)"),
            "registration_number": data.get("registration_number", ""),
            "issuing_authority": data.get("issuing_authority", ""),
            "country": data.get("country", ""),
            "state": data.get("state", ""),
            "highest_qualification": data.get("highest_qualification", ""),
            "years_of_experience": data.get("years_of_experience", 0),
            "specialization": data.get("specialization", ""),
            "professional_email": data.get("professional_email", ""),
            "clinic_name": data.get("clinic_name", ""),
            "clinic_address": data.get("clinic_address", ""),
            "clinic_location": data.get("clinic_location", {}),
            "bio": data.get("bio", ""),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        existing = slp_profiles_collection.find_one({"user_id": user_id})
        
        if existing:
            slp_profiles_collection.update_one(
                {"user_id": user_id},
                {"$set": profile}
            )
        else:
            # Create new profile
            profile["created_at"] = datetime.now(timezone.utc).isoformat()
            profile["profile_picture"] = ""
            profile["profile_completed"] = False
            profile["is_verified"] = False  
            slp_profiles_collection.insert_one(profile)
        
        required_fields = ["full_name", "registration_number", "issuing_authority", "country"]
        is_complete = all(profile.get(field) for field in required_fields)
        
        if is_complete:
            slp_profiles_collection.update_one(
                {"user_id": user_id},
                {"$set": {"profile_completed": True}}
            )
        
        return jsonify({
            "status": "success",
            "message": "Profile updated successfully",
            "profile_completed": is_complete
        }), 200
        
    except Exception as e:
        print(f"❌ Error updating SLP profile: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/slp/profile/picture/<user_id>", methods=["POST"])
def upload_profile_picture(user_id):
    """Upload SLP profile picture."""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        
        # Validate file type
        allowed_extensions = {"png", "jpg", "jpeg", "gif", "webp"}
        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        if ext not in allowed_extensions:
            return jsonify({"error": "Invalid file type. Allowed: png, jpg, jpeg, gif, webp"}), 400
        
        filename = f"{user_id}.{ext}"
        filepath = os.path.join(PROFILE_PICTURES_DIR, filename)
        file.save(filepath)
        
        picture_url = f"/profile_pictures/{filename}"
        slp_profiles_collection.update_one(
            {"user_id": user_id},
            {"$set": {"profile_picture": picture_url}},
            upsert=True
        )
        
        return jsonify({
            "status": "success",
            "picture_url": picture_url
        }), 200
        
    except Exception as e:
        print(f"❌ Error uploading profile picture: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/profile_pictures/<filename>", methods=["GET"])
def serve_profile_picture(filename):
    """Serve profile pictures."""
    return send_from_directory(PROFILE_PICTURES_DIR, filename)


@app.route("/api/slp/directory", methods=["GET"])
def get_slp_directory():
    """Get list of verified SLPs for patients to browse."""
    try:
        pipeline = [
            {"$match": {
                "is_verified": True
            }},
            {"$project": {
                "_id": 0,
                "user_id": 1,
                "full_name": 1,
                "professional_title": 1,
                "profile_picture": 1,
                "registration_number": 1,
                "issuing_authority": 1,
                "country": 1,
                "state": 1,
                "highest_qualification": 1,
                "years_of_experience": 1,
                "specialization": 1,
                "clinic_name": 1,
                "clinic_address": 1,
                "bio": 1
            }},
            {"$sort": {"full_name": 1}}
        ]
        
        slps = list(slp_profiles_collection.aggregate(pipeline))
        
        return jsonify({
            "status": "success",
            "slps": slps,
            "total": len(slps)
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting SLP directory: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/patient/choose-slp", methods=["POST"])
def patient_choose_slp():
    """Patient selects an SLP for treatment."""
    try:
        data = request.json
        patient_id = data.get("patient_id")
        slp_id = data.get("slp_id")
        
        if not patient_id or not slp_id:
            return jsonify({"error": "patient_id and slp_id are required"}), 400
        
        existing = slp_patient_collection.find_one({
            "patient_id": patient_id,
            "slp_id": slp_id
        })
        
        if existing:
            return jsonify({"message": "Already assigned to this SLP"}), 200
        
        assignment = {
            "patient_id": patient_id,
            "slp_id": slp_id,
            "assigned_at": datetime.now(timezone.utc).isoformat(),
            "status": "active"
        }
        slp_patient_collection.insert_one(assignment)
        
        slp_profile = slp_profiles_collection.find_one({"user_id": slp_id})
        slp_name = slp_profile.get("full_name", "Unknown SLP") if slp_profile else "Unknown SLP"
        
        return jsonify({
            "status": "success",
            "message": f"Successfully assigned to {slp_name}",
            "slp_name": slp_name
        }), 200
        
    except Exception as e:
        print(f"❌ Error assigning SLP: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/patient/my-slps/<patient_id>", methods=["GET"])
def get_patient_slps(patient_id):
    """Get all SLPs assigned to a patient."""
    try:
        assignments = list(slp_patient_collection.find(
            {"patient_id": patient_id, "status": "active"},
            {"_id": 0}
        ))
        
                slps = []
        for assignment in assignments:
            slp_profile = slp_profiles_collection.find_one(
                {"user_id": assignment["slp_id"]},
                {"_id": 0}
            )
            if slp_profile:
                slps.append({
                    **slp_profile,
                    "assigned_at": assignment.get("assigned_at")
                })
        
        return jsonify({
            "status": "success",
            "slps": slps,
            "total": len(slps)
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting patient SLPs: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/save_slp_assessment/<task_id>', methods=['POST'])
def save_slp_assessment(task_id):
    """Save or update an SLP's SSI-4 assessment for a task."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        assessment_doc = {
            "task_id": task_id,
            "slp_id": data.get("slp_id"),
            "assessed_at": datetime.now(timezone.utc).isoformat(),

            "raw_inputs": {
                "reading_percent_ss": data.get("reading_percent_ss", ""),
                "speaking_percent_ss": data.get("speaking_percent_ss", ""),
                "duration_avg": data.get("duration_avg", ""),
                "age_group": data.get("age_group", "school_age"),
            },

            "ssi4_scores": {
                "frequency": data.get("ssi4_frequency", 0),
                "duration": data.get("ssi4_duration", 0),
                "physical": data.get("ssi4_physical", 0),
                "total": data.get("total_score", 0),
            },

            "physical_concomitants": {
                "distracting_sounds": data.get("distracting_sounds", 0),
                "facial_grimaces": data.get("facial_grimaces", 0),
                "head_movements": data.get("head_movements", 0),
            },

            "severity_rating": data.get("severity_rating", "Very Mild"),

            "model_validation": {
                "is_accurate": data.get("model_is_accurate"),
                "feedback": data.get("model_feedback", ""),
            },

            "clinical_notes": data.get("clinical_notes", ""),
        }

        slp_assessments_collection.update_one(
            {"task_id": task_id},
            {"$set": assessment_doc},
            upsert=True
        )

        print(f"✅ SSI-4 assessment saved for task {task_id}")
        return jsonify({
            "status": "success",
            "message": "Assessment saved successfully",
            "assessment": assessment_doc
        }), 200

    except Exception as e:
        print(f"❌ Error saving SSI-4 assessment: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/get_slp_assessment/<task_id>', methods=['GET'])
def get_slp_assessment(task_id):
    """Get the SLP's SSI-4 assessment for a task."""
    try:
        assessment = slp_assessments_collection.find_one(
            {"task_id": task_id},
            {"_id": 0}
        )

        if assessment:
            return jsonify({
                "status": "success",
                "assessment": assessment
            }), 200
        else:
            return jsonify({
                "status": "success",
                "assessment": None
            }), 200

    except Exception as e:
        print(f"❌ Error getting SSI-4 assessment: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    """Get platform statistics for admin dashboard."""
    try:
        total_patients = users_collection.count_documents({"userType": "patient"})
        total_slps = users_collection.count_documents({"userType": "slp"})
        total_analyses = tasks_collection.count_documents({"status": "completed"})

        # Count pending (no status field or status is 'pending')
        pending_patients = users_collection.count_documents(
            {"userType": "patient", "status": {"$in": ["pending", None]}}
        ) + users_collection.count_documents(
            {"userType": "patient", "status": {"$exists": False}}
        )
        pending_slps = users_collection.count_documents(
            {"userType": "slp", "status": {"$in": ["pending", None]}}
        ) + users_collection.count_documents(
            {"userType": "slp", "status": {"$exists": False}}
        )

        registrations = []
        now = datetime.now(timezone.utc)
        for i in range(5, -1, -1):
            # Calculate month start/end
            month_date = now - timedelta(days=i * 30)
            month_name = month_date.strftime("%b")
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if month_date.month == 12:
                month_end = month_start.replace(year=month_start.year + 1, month=1)
            else:
                month_end = month_start.replace(month=month_start.month + 1)

            start_str = month_start.isoformat()
            end_str = month_end.isoformat()

            slp_count = users_collection.count_documents({
                "userType": "slp",
                "createdAt": {"$gte": start_str, "$lt": end_str}
            })
            patient_count = users_collection.count_documents({
                "userType": "patient",
                "createdAt": {"$gte": start_str, "$lt": end_str}
            })

            registrations.append({
                "month": month_name,
                "slps": slp_count,
                "patients": patient_count
            })

        return jsonify({
            "status": "success",
            "totalPatients": total_patients,
            "totalSLPs": total_slps,
            "totalAnalyses": total_analyses,
            "pendingPatients": pending_patients,
            "pendingSLPs": pending_slps,
            "registrations": registrations
        }), 200

    except Exception as e:
        print(f"❌ Admin stats error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    """Get all users for admin management, filtered by type."""
    try:
        user_type = request.args.get("type", "patient")  # 'patient' or 'slp'

        users = list(users_collection.find(
            {"userType": user_type},
            {"password": 0}  # Exclude password
        ).sort("createdAt", -1))

        result = []
        for user in users:
            user_id = str(user["_id"])
            user_data = {
                "id": user_id,
                "name": user.get("name", "Unknown"),
                "email": user.get("email", ""),
                "status": user.get("status", "pending"),  # Default to pending if no status
                "joined": user.get("createdAt", ""),
                "isActive": user.get("isActive", True),
            }

            if user_type == "slp":
                patient_count = slp_patient_collection.count_documents({"slp_id": user_id})
                profile = slp_profiles_collection.find_one({"user_id": user_id})
                user_data["patients"] = patient_count
                user_data["specialization"] = profile.get("specialization", "General") if profile else "General"
            else:
                analysis_count = tasks_collection.count_documents({"user_id": user_id, "status": "completed"})
                slp_link = slp_patient_collection.find_one({"patient_id": user_id})
                slp_name = "Unassigned"
                if slp_link:
                    slp_user = users_collection.find_one({"_id": ObjectId(slp_link["slp_id"])})
                    if slp_user:
                        slp_name = slp_user.get("name", "Unknown")
                user_data["analyses"] = analysis_count
                user_data["slp"] = slp_name

            result.append(user_data)

        return jsonify({"status": "success", "users": result}), 200

    except Exception as e:
        print(f"❌ Admin users error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/users/<user_id>/action', methods=['POST'])
def admin_user_action(user_id):
    """Perform an admin action (verify, ban, remove) on a user."""
    try:
        data = request.get_json()
        action = data.get("action")  # 'verify', 'ban', 'remove'

        if action not in ("verify", "ban", "remove"):
            return jsonify({"error": "Invalid action. Must be verify, ban, or remove."}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_name = user.get("name", "Unknown")
        user_role = user.get("userType", "patient")

        if action == "remove":
            users_collection.delete_one({"_id": ObjectId(user_id)})
        elif action == "ban":
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"status": "banned", "isActive": False, "updatedAt": datetime.now(timezone.utc).isoformat()}}
            )
            if user_role == "slp":
                ensure_slp_profile_verified(user_id, False)
        elif action == "verify":
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"status": "verified", "updatedAt": datetime.now(timezone.utc).isoformat()}}
            )
            if user_role == "slp":
                ensure_slp_profile_verified(user_id, True)

        activity = {
            "activity_id": str(uuid.uuid4()),
            "type": action,
            "user_name": user_name,
            "user_role": user_role.upper() if user_role == "slp" else user_role.capitalize(),
            "target_user_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        admin_activity_collection.insert_one(activity)

        return jsonify({"status": "success", "message": f"User {action}d successfully"}), 200

    except Exception as e:
        print(f"❌ Admin action error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin/activity', methods=['GET'])
def admin_activity():
    """Get recent admin activity for the dashboard."""
    try:
        activities = list(admin_activity_collection.find(
            {},
            {"_id": 0}
        ).sort("created_at", -1).limit(20))

        now = datetime.now(timezone.utc)
        for act in activities:
            try:
                created = datetime.fromisoformat(act["created_at"].replace("Z", "+00:00"))
                diff = now - created
                if diff.total_seconds() < 60:
                    act["time"] = "Just now"
                elif diff.total_seconds() < 3600:
                    act["time"] = f"{int(diff.total_seconds() / 60)} min ago"
                elif diff.total_seconds() < 86400:
                    act["time"] = f"{int(diff.total_seconds() / 3600)} hr ago"
                else:
                    act["time"] = f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
            except:
                act["time"] = "Unknown"

            # Set icons based on action type
            icons = {"verify": "✅", "ban": "🚫", "remove": "🗑️"}
            act["icon"] = icons.get(act.get("type"), "👤")

        return jsonify({"status": "success", "activities": activities}), 200

    except Exception as e:
        print(f"❌ Admin activity error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 6822))
    app.run(host="0.0.0.0", port=port)