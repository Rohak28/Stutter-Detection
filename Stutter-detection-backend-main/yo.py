import os
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv

# Load the .env file in the current directory
load_dotenv()

mongodb_uri = os.getenv("MONGODB_URI")
print(f"Loaded MONGODB_URI: {mongodb_uri}")

if not mongodb_uri:
    print("ERROR: MONGODB_URI is not set in your .env file!")
    exit(1)

try:
    print("Connecting to MongoClient...")
    client = MongoClient(mongodb_uri)
    
    print("Pinging MongoDB...")
    client.admin.command('ping')
    print("OK: Successfully connected to MongoDB!")
    
    db = client["stutter_db"]
    users_collection = db["users"]
    
    # Let's count users
    user_count = users_collection.count_documents({})
    print(f"OK: Total users in database: {user_count}")
    
    # Print list of users (excluding password hashes for privacy)
    users = list(users_collection.find({}, {"_id": 0, "email": 1, "userType": 1, "name": 1}))
    print("\nRegistered Users in DB:")
    for user in users:
        print(f" - {user.get('name')} ({user.get('email')}): {user.get('userType')}")
        
    print("\nDiagnostic completed successfully!")

except Exception as e:
    print("\nERROR: DIAGNOSTIC FAILED!")
    print(f"Exception Type: {type(e).__name__}")
    print(f"Exception Details: {str(e)}")
