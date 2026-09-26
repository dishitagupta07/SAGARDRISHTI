"""
SAGARDRISHTI AI/ML service — unified FastAPI wrapper around all three components.

This is the handoff point for integration: your teammate's React/Node frontend and
backend just call these HTTP endpoints and get back plain JSON. She never needs to
import torch, pandas, or touch any AI/ML code directly.

Run:
    pip install fastapi uvicorn python-multipart
    uvicorn main_api:app --reload --port 8001

Endpoints:
    POST /detect-spill        -- upload a SAR image, get back mask + confidence + area
    POST /attribute-vessel    -- upload/point to AIS CSV + spill info, get ranked vessels
    POST /predict-trajectory  -- spill lat/lon, get forward/backward drift footprints
    GET  /health              -- liveness check

See README.md "API contract" section for exact request/response shapes, or just hit
/docs once the server is running for interactive Swagger docs (FastAPI generates this
automatically).
"""
import os
import shutil
import sys
import tempfile

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

BASE_DIR = os.path.dirname(__file__)

sys.path.insert(0, os.path.join(BASE_DIR, "oil_spill_detection"))
sys.path.insert(0, os.path.join(BASE_DIR, "vessel_attribution"))
sys.path.insert(0, os.path.join(BASE_DIR, "trajectory_prediction"))

app = FastAPI(title="SAGARDRISHTI AI/ML Service", version="0.1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://sagardrishti-uxji.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Oil spill detection
# ---------------------------------------------------------------------------
@app.post("/detect-spill")
async def detect_spill_endpoint(
    file: UploadFile = File(...),
    checkpoint_path: str = Form("checkpoints/unet_best.pt"),
    pixel_size_m: float = Form(None),
):
    from oil_spill_detection.api import detect_spill

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = detect_spill(tmp_path, checkpoint_path=checkpoint_path, pixel_size_m=pixel_size_m)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        os.remove(tmp_path)


# ---------------------------------------------------------------------------
# Vessel attribution
# ---------------------------------------------------------------------------
class AttributionRequest(BaseModel):
    ais_csv_path: str          # path to AIS CSV already on the server/shared storage
    spill_lat: float
    spill_lon: float
    spill_time: str            # ISO timestamp, e.g. "2026-08-01T14:00:00"


@app.post("/attribute-vessel")
def attribute_vessel_endpoint(req: AttributionRequest):
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "vessel_attribution"))
    from api import attribute  # vessel_attribution/api.py

    try:
        return attribute(req.ais_csv_path, req.spill_lat, req.spill_lon, req.spill_time)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ---------------------------------------------------------------------------
# Trajectory prediction
# ---------------------------------------------------------------------------
class TrajectoryRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    forward_hours: int = 48
    backward_hours: int = 12


@app.post("/predict-trajectory")
def predict_trajectory_endpoint(req: TrajectoryRequest):
    from trajectory_prediction.api import predict

    return predict(
        req.origin_lat,
        req.origin_lon,
        req.forward_hours,
        req.backward_hours
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
