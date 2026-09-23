import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("../backend/.env")

MONGODB_URL = os.getenv("MONGODB_URL")

client = MongoClient(MONGODB_URL)

db = client["sagardrishti"]

incidents_collection = db["incidents"]

detections_collection = db["detections"]
