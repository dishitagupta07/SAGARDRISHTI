from fastapi import APIRouter, HTTPException
from bson import ObjectId

from backend.app.models.incident import Incident
from backend.app.database import incidents_collection


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"]
)


@router.post("/")
def create_incident(incident: Incident):
    incident_data = incident.model_dump()

    result = incidents_collection.insert_one(incident_data)

    return {
        "message": "Incident saved successfully",
        "incident_id": str(result.inserted_id)
    }


@router.get("/")
def get_incidents():
    incidents = list(incidents_collection.find())

    for incident in incidents:
        incident["_id"] = str(incident["_id"])

    return incidents


@router.get("/{incident_id}")
def get_incident(incident_id: str):

    if not ObjectId.is_valid(incident_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid incident ID"
        )

    incident = incidents_collection.find_one(
        {"_id": ObjectId(incident_id)}
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incident["_id"] = str(incident["_id"])

    return incident


@router.put("/{incident_id}")
def update_incident(
    incident_id: str,
    incident: Incident
):

    if not ObjectId.is_valid(incident_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid incident ID"
        )

    # Safely extract dictionary while excluding immutable ID fields
    update_data = incident.model_dump(exclude_unset=True, exclude={"id", "_id"})

    result = incidents_collection.update_one(
        {"_id": ObjectId(incident_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return {
        "message": "Incident updated successfully",
        "incident_id": incident_id
    }


@router.delete("/{incident_id}")
def delete_incident(incident_id: str):

    if not ObjectId.is_valid(incident_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid incident ID"
        )

    result = incidents_collection.delete_one(
        {"_id": ObjectId(incident_id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return {
        "message": "Incident deleted successfully"
    }