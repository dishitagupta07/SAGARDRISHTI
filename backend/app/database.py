import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient


BASE_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise RuntimeError("MONGODB_URL is not set in backend/.env")

client = MongoClient(
    MONGODB_URL,
    tls=True,
    tlsAllowInvalidCertificates=True,
    serverSelectionTimeoutMS=30000,
)

db = client["sagardrishti"]

incidents_collection = db["incidents"]
detections_collection = db["detections"]