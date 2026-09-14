from pydantic import BaseModel


class Incident(BaseModel):
    latitude: float
    longitude: float
    area_km2: float
    confidence: float
    severity: str
    status: str