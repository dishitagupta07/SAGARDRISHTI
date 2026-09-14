from pydantic import BaseModel


class Detection(BaseModel):
    latitude: float
    longitude: float
    area_km2: float
    confidence: float
    severity: str