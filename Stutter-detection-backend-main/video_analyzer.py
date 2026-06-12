import cv2
import mediapipe as mp
import numpy as np
import logging
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@dataclass
class VideoStutterEvent:
    start_time: float
    end_time: float
    event_type: str
    severity: str
    confidence: float
    details: Dict[str, Any]

class VideoAnalyzer:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Landmark indices
        self.LEFT_EYE = [33, 160, 158, 133, 153, 144]
        self.RIGHT_EYE = [362, 385, 387, 263, 373, 380]
        self.MOUTH = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
        self.INNER_MOUTH = [13, 14, 78, 308]
        
        # --- Calibrated Thresholds ---
        # Eye Aspect Ratio: normal open ~0.25-0.35, blink <0.21
        self.EAR_BLINK_THRESHOLD = 0.21
        # Minimum duration (seconds) for eye closure to count as squeezing (not a normal blink)
        self.EYE_SQUEEZE_MIN_DURATION = 0.20
        # Rapid blink: max number of blinks in a window before it's flagged
        self.RAPID_BLINK_WINDOW = 2.0       # seconds
        self.RAPID_BLINK_MIN_COUNT = 5       # blinks in window
        # Jaw tremor: MAR variance threshold in a 0.5s window
        self.JAW_TREMOR_VARIANCE = 0.005
        # Head jerk: degrees of pose change between frames
        self.HEAD_JERK_THRESHOLD = 4.0
        # Mouth tension: MAR below this for extended period = pressed lips (block)
        self.MOUTH_TENSION_MAR = 0.05
        self.MOUTH_TENSION_MIN_DURATION = 0.3  # seconds
        
    def _calculate_ear(self, landmarks, eye_indices):
        """Calculate Eye Aspect Ratio using 2D (x,y) only for stability."""
        try:
            def pt(idx):
                return np.array(landmarks[idx][:2])  # use only x,y
            v1 = np.linalg.norm(pt(eye_indices[1]) - pt(eye_indices[5]))
            v2 = np.linalg.norm(pt(eye_indices[2]) - pt(eye_indices[4]))
            h = np.linalg.norm(pt(eye_indices[0]) - pt(eye_indices[3]))
            if h == 0:
                return 0.0
            return (v1 + v2) / (2.0 * h)
        except Exception:
            return 0.0

    def _calculate_mar(self, landmarks):
        """Calculate Mouth Aspect Ratio using 2D (x,y) only."""
        try:
            def pt(idx):
                return np.array(landmarks[idx][:2])
            # Vertical: top lip (13) to bottom lip (14)
            v = np.linalg.norm(pt(13) - pt(14))
            # Horizontal: left mouth (78) to right mouth (308)
            h = np.linalg.norm(pt(78) - pt(308))
            if h == 0:
                return 0.0
            return v / h
        except Exception:
            return 0.0

    def get_head_pose(self, landmarks, frame_width, frame_height):
        """Estimate head pose (simplified pitch, yaw, roll)."""
        try:
            face_2d = []
            face_3d = []
            
            indices = [33, 263, 1, 61, 291, 199]
            for idx in indices:
                l = landmarks[idx]
                x, y = int(l[0] * frame_width), int(l[1] * frame_height)
                face_2d.append([x, y])
                face_3d.append([x, y, l[2] * frame_width])  # scale z to pixel space
                
            face_2d = np.array(face_2d, dtype=np.float64)
            face_3d = np.array(face_3d, dtype=np.float64)
            
            focal_length = 1 * frame_width
            cam_matrix = np.array([[focal_length, 0, frame_width / 2],
                                  [0, focal_length, frame_height / 2],
                                  [0, 0, 1]])
            
            dist_matrix = np.zeros((4, 1), dtype=np.float64)
            
            success, rot_vec, trans_vec = cv2.solvePnP(face_3d, face_2d, cam_matrix, dist_matrix)
            rmat, _ = cv2.Rodrigues(rot_vec)
            
            # Extract Euler angles directly from rotation matrix
            sy = np.sqrt(rmat[0, 0] ** 2 + rmat[1, 0] ** 2)
            if sy > 1e-6:
                pitch = np.degrees(np.arctan2(rmat[2, 1], rmat[2, 2]))
                yaw = np.degrees(np.arctan2(-rmat[2, 0], sy))
                roll = np.degrees(np.arctan2(rmat[1, 0], rmat[0, 0]))
            else:
                pitch = np.degrees(np.arctan2(-rmat[1, 2], rmat[1, 1]))
                yaw = np.degrees(np.arctan2(-rmat[2, 0], sy))
                roll = 0.0
            
            return float(pitch), float(yaw), float(roll)
        except Exception:
            return 0.0, 0.0, 0.0

    def analyze_video(self, video_path: str) -> Dict[str, Any]:
        """Perform full video analysis across all frames."""
        logger.info(f"Starting video analysis: {video_path}")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Could not open video file: {video_path}")
            return {"error": "Could not open video file", "events": [], "overall_metrics": {}}
            
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            fps = 30.0  # fallback
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        logger.info(f"Video info: {width}x{height} @ {fps:.1f}fps, {total_frames} frames")
        
        metrics_history = []
        no_face_count = 0
        
        frame_idx = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_time = frame_idx / fps
            
            # Convert to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if results.multi_face_landmarks:
                face_landmarks = results.multi_face_landmarks[0]
                landmarks = [[l.x, l.y, l.z] for l in face_landmarks.landmark]
                
                ear_l = self._calculate_ear(landmarks, self.LEFT_EYE)
                ear_r = self._calculate_ear(landmarks, self.RIGHT_EYE)
                ear = (ear_l + ear_r) / 2.0
                mar = self._calculate_mar(landmarks)
                pitch, yaw, roll = self.get_head_pose(landmarks, width, height)
                
                metrics_history.append({
                    "timestamp": frame_time,
                    "ear": ear,
                    "mar": mar,
                    "pitch": pitch,
                    "yaw": yaw,
                    "roll": roll
                })
            else:
                no_face_count += 1
            
            frame_idx += 1
            if frame_idx % 100 == 0:
                logger.info(f"Analyzed {frame_idx}/{total_frames} frames ({len(metrics_history)} with face)")
                
        cap.release()
        
        logger.info(f"Video analysis complete: {len(metrics_history)} frames with face, {no_face_count} without")
        
        if not metrics_history:
            logger.warning("No face detected in any frame!")
            return {"events": [], "overall_metrics": {}, "duration": frame_idx / fps}
        
        # Log sample metrics for debugging
        if metrics_history:
            sample = metrics_history[len(metrics_history) // 2]
            logger.info(f"Sample metrics (mid-video): EAR={sample['ear']:.4f}, MAR={sample['mar']:.4f}, "
                       f"pitch={sample['pitch']:.2f}, yaw={sample['yaw']:.2f}, roll={sample['roll']:.2f}")
            ears = [h['ear'] for h in metrics_history]
            mars = [h['mar'] for h in metrics_history]
            logger.info(f"EAR range: [{min(ears):.4f}, {max(ears):.4f}], mean={np.mean(ears):.4f}")
            logger.info(f"MAR range: [{min(mars):.4f}, {max(mars):.4f}], var={np.var(mars):.6f}")
        
        # Analyze temporal patterns to detect stutters
        events = self._detect_stutter_patterns(metrics_history, fps)
        
        # Aggregate overall metrics
        overall_metrics = self._calculate_overall_metrics(metrics_history)
        
        logger.info(f"Detected {len(events)} visual stutter events")
        for e in events:
            logger.info(f"  → {e.event_type} @ {e.start_time:.2f}-{e.end_time:.2f}s "
                       f"(severity={e.severity}, confidence={e.confidence:.2f})")
        
        return {
            "events": [vars(e) for e in events],
            "overall_metrics": overall_metrics,
            "duration": frame_idx / fps if fps > 0 else 0
        }

    def _detect_stutter_patterns(self, history: List[Dict], fps: float) -> List[VideoStutterEvent]:
        """Detect specific stutter behaviors in the metrics timeline."""
        events = []
        if not history:
            return events
        
        ear_values = [h['ear'] for h in history]
        mar_values = [h['mar'] for h in history]
        times = [h['timestamp'] for h in history]
        positions = [(h['pitch'], h['yaw'], h['roll']) for h in history]
        
        # ──────────────────────────────────────────
        # 1. Eye Squeezing (prolonged closure)
        # ──────────────────────────────────────────
        in_blink = False
        blink_start = 0
        blink_events = []  # track all blinks for rapid-blink detection
        
        for i, ear in enumerate(ear_values):
            if ear < self.EAR_BLINK_THRESHOLD and not in_blink:
                in_blink = True
                blink_start = times[i]
            elif ear >= self.EAR_BLINK_THRESHOLD and in_blink:
                in_blink = False
                duration = times[i] - blink_start
                blink_events.append({"start": blink_start, "end": times[i], "duration": duration})
                
                if duration > self.EYE_SQUEEZE_MIN_DURATION:
                    severity = "Severe" if duration > 0.6 else "Moderate"
                    events.append(VideoStutterEvent(
                        start_time=blink_start,
                        end_time=times[i],
                        event_type="Eye Squeezing",
                        severity=severity,
                        confidence=min(0.95, 0.6 + duration * 0.5),
                        details={"duration": round(duration, 3)}
                    ))
        
        # ──────────────────────────────────────────
        # 2. Rapid Blink Bursts
        # ──────────────────────────────────────────
        if blink_events:
            blink_starts = [b["start"] for b in blink_events]
            window = self.RAPID_BLINK_WINDOW
            
            i = 0
            while i < len(blink_starts):
                window_end = blink_starts[i] + window
                blinks_in_window = [b for b in blink_starts if blink_starts[i] <= b < window_end]
                
                if len(blinks_in_window) >= self.RAPID_BLINK_MIN_COUNT:
                    events.append(VideoStutterEvent(
                        start_time=blink_starts[i],
                        end_time=min(window_end, times[-1]),
                        event_type="Rapid Blinking",
                        severity="Moderate",
                        confidence=min(0.9, 0.5 + len(blinks_in_window) * 0.08),
                        details={"blink_count": len(blinks_in_window), "window_seconds": window}
                    ))
                    # Skip past this window
                    i = next((j for j, t in enumerate(blink_starts) if t >= window_end), len(blink_starts))
                else:
                    i += 1

        # ──────────────────────────────────────────
        # 3. Jaw Tremors (high-frequency MAR oscillation)
        # ──────────────────────────────────────────
        window_size = max(1, int(fps * 0.5))  # 0.5 seconds
        step = max(1, window_size // 2)
        
        for i in range(0, len(mar_values) - window_size, step):
            window = mar_values[i : i + window_size]
            if not window:
                continue
            variance = np.var(window)
            
            # Count zero-crossings of the derivative (oscillation frequency)
            diffs = np.diff(window)
            sign_changes = np.sum(np.abs(np.diff(np.sign(diffs))) > 0)
            oscillation_rate = sign_changes / (window_size / fps) if fps > 0 else 0
            
            # Tremor = high variance + high oscillation rate
            if variance > self.JAW_TREMOR_VARIANCE and oscillation_rate > 6:
                severity = "Severe" if variance > 0.02 else "Moderate"
                events.append(VideoStutterEvent(
                    start_time=times[i],
                    end_time=times[min(i + window_size, len(times) - 1)],
                    event_type="Jaw Tremor",
                    severity=severity,
                    confidence=min(0.9, 0.5 + variance * 20),
                    details={"variance": round(float(variance), 6), "oscillation_rate": round(oscillation_rate, 1)}
                ))

        # ──────────────────────────────────────────
        # 4. Mouth Tension (lips pressed shut — blocks)
        # ──────────────────────────────────────────
        in_tension = False
        tension_start = 0
        
        for i, mar in enumerate(mar_values):
            if mar < self.MOUTH_TENSION_MAR and not in_tension:
                in_tension = True
                tension_start = times[i]
            elif mar >= self.MOUTH_TENSION_MAR and in_tension:
                in_tension = False
                duration = times[i] - tension_start
                if duration > self.MOUTH_TENSION_MIN_DURATION:
                    events.append(VideoStutterEvent(
                        start_time=tension_start,
                        end_time=times[i],
                        event_type="Mouth Tension",
                        severity="Moderate" if duration < 1.0 else "Severe",
                        confidence=min(0.85, 0.5 + duration * 0.3),
                        details={"duration": round(duration, 3)}
                    ))

        # ──────────────────────────────────────────
        # 5. Head Jerks (sudden pose changes)
        # ──────────────────────────────────────────
        if len(positions) > 2:
            # Smooth positions with a small moving average to reduce noise
            smooth_n = max(1, int(fps * 0.1))  # ~100ms smoothing
            smoothed = []
            for i in range(len(positions)):
                start = max(0, i - smooth_n)
                end = min(len(positions), i + smooth_n + 1)
                avg = np.mean([positions[j] for j in range(start, end)], axis=0)
                smoothed.append(avg)
            
            for i in range(1, len(smoothed)):
                diff = np.linalg.norm(smoothed[i] - smoothed[i-1])
                if diff > self.HEAD_JERK_THRESHOLD:
                    severity = "Severe" if diff > 10.0 else "Moderate"
                    events.append(VideoStutterEvent(
                        start_time=times[i-1],
                        end_time=times[i],
                        event_type="Head Jerk",
                        severity=severity,
                        confidence=min(0.9, 0.5 + diff * 0.05),
                        details={"magnitude": round(float(diff), 2)}
                    ))
                    
        return self._merge_consecutive_events(events)

    def _merge_consecutive_events(self, events: List[VideoStutterEvent]) -> List[VideoStutterEvent]:
        """Merge events of the same type that are very close in time."""
        if not events:
            return []
        sorted_events = sorted(events, key=lambda e: e.start_time)
        merged = [sorted_events[0]]
        
        for current in sorted_events[1:]:
            last = merged[-1]
            if current.event_type == last.event_type and current.start_time - last.end_time < 0.5:
                # Merge
                last.end_time = max(last.end_time, current.end_time)
                last.confidence = max(last.confidence, current.confidence)
                # Escalate severity if merging many events
                if last.severity == "Moderate" and current.severity == "Severe":
                    last.severity = "Severe"
            else:
                merged.append(current)
        return merged

    def _calculate_overall_metrics(self, history: List[Dict]) -> Dict[str, float]:
        """Calculate aggregate metrics for the entire session."""
        if not history:
            return {}
        
        ears = [h['ear'] for h in history]
        mars = [h['mar'] for h in history]
        pitches = [h['pitch'] for h in history]
        yaws = [h['yaw'] for h in history]
        
        return {
            "avg_ear": round(float(np.mean(ears)), 4),
            "avg_mar": round(float(np.mean(mars)), 4),
            "ear_std": round(float(np.std(ears)), 4),
            "mar_std": round(float(np.std(mars)), 4),
            "head_stability_score": round(float(max(0, 100 - np.std(pitches) - np.std(yaws))), 1),
            "facial_tension_index": round(float(np.std(mars) * 100), 2),
            "blink_rate_per_min": round(float(
                sum(1 for i in range(1, len(ears)) 
                    if ears[i] < self.EAR_BLINK_THRESHOLD and ears[i-1] >= self.EAR_BLINK_THRESHOLD)
                / (history[-1]["timestamp"] / 60) if history[-1]["timestamp"] > 0 else 0
            ), 1),
        }
