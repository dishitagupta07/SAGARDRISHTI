from fastapi import APIRouter

from backend.app.models.detection import Detection
from backend.app.models.incident import Incident
from backend.app.database import detections_collection, incidents_collection


router = APIRouter(
    prefix="/api/detections",
    tags=["Detections"]
)


@router.post("/")
def create_detection(detection: Detection):

    detection_data = detection.model_dump()

    # Save detection
    detection_result = detections_collection.insert_one(detection_data)

    # Create incident from detection
    incident = Incident(
        latitude=detection.latitude,
        longitude=detection.longitude,
        area_km2=detection.area_km2,
        confidence=detection.confidence,
        severity=detection.severity,
        status="Active"
    )

    incident_data = incident.model_dump()
    incident_result = incidents_collection.insert_one(incident_data)

    return {
        "message": "Detection processed successfully",
        "detection_id": str(detection_result.inserted_id),
        "incident_id": str(incident_result.inserted_id)
    }


@router.get("/")
def get_detections():

    detections = list(detections_collection.find())

    for detection in detections:
        detection["_id"] = str(detection["_id"])

    return detections