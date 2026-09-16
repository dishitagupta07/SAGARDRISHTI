from fastapi import APIRouter
from backend.app.models.detection import Detection
from backend.app.database import incidents_collection


router = APIRouter(
    prefix="/api/detections",
    tags=["Detections"]
)


@router.post("/")
def create_detection(detection: Detection):

    detection_data = detection.model_dump()

    result = incidents_collection.insert_one(detection_data)

    return {
        "message": "Detection received successfully",
        "incident_id": str(result.inserted_id)
    }