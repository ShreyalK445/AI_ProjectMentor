# pyrefly: ignore [missing-import]
from pymongo import MongoClient
import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://localhost:27017/"
)

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=500)
    client.admin.command("ping")
    db = client["ai_project_mentor"]
    is_connected = True
except Exception:
    client = None
    db = None
    is_connected = False

students_collection = db["students"] if db is not None else None
projects_collection = db["projects"] if db is not None else None
progress_collection = db["progress"] if db is not None else None
timeline_collection = db["timelines"] if db is not None else None
risks_collection = db["risks"] if db is not None else None
mentor_chats_collection = db["mentor_chats"] if db is not None else None
documentation_collection = db["documentation"] if db is not None else None

def test_connection():
    if not client:
        return False
    try:
        client.admin.command("ping")
        return True
    except Exception as e:
        print("MongoDB connection error:", e)
        return False