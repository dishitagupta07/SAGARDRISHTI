from fastapi import FastAPI
from backend.app.api.incidents import router as incidents_router
from backend.app.api.detections import router as detections_router


app = FastAPI(title="SAGARDRISHTI API")


@app.get("/")
def home():
    return {"message": "SAGARDRISHTI backend is running"}


app.include_router(incidents_router)
app.include_router(detections_router)