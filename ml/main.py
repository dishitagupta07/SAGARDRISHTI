"""
SagarDrishti AI -- integration backend.

Wires the three existing modules into one FastAPI service, matching the
"one continuous system" flow from the handoff doc:

    Detect (oil_spill_detection) -> Attribute (vessel_attribution)
        -> Predict (trajectory_prediction)

Run with (from the project root, i.e. one level above this file):

    uvicorn backend.main:app --reload --port 8000

Requires the same environment as oil_spill_detection (torch, opencv,
etc. -- see requirements.txt) plus fastapi, uvicorn, python-multipart.
"""
import base64
import io
import os
import sys
import time
from typing import List, Optional

import cv2
import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)
sys.path.append(os.path.join(ROOT_DIR, "oil_spill_detection"))

from oil_spill_detection.infer import load_model, run_inference, make_overlay  # noqa: E402
from vessel_attribution import generate_synthetic_ais, attribute  # noqa: E402
from trajectory_prediction import predict_trajectory, to_geojson  # noqa: E402

CHECKPOINT_PATH = os.path.join(ROOT_DIR, "checkpoints", "unet_best.pt")

app = FastAPI(title="SagarDrishti AI - Integration API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before production deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_model = None
_img_size = 256


def get_model():
    """Lazy-load the checkpoint once, on first request."""
    global _model, _img_size
    if _model is None:
        if not os.path.exists(CHECKPOINT_PATH):
            raise HTTPException(
                status_code=500,
                detail=f"Checkpoint not found at {CHECKPOINT_PATH}. "
                "Make sure checkpoints/unet_best.pt from the ML handoff is in place.",
            )
        _model, _img_size = load_model(CHECKPOINT_PATH, _device)
    return _model, _img_size


def _encode_png_base64(image_array: np.ndarray) -> str:
    success, buffer = cv2.imencode(".png", image_array)
    if not success:
        raise RuntimeError("PNG encoding failed")
    return base64.b64encode(buffer.tobytes()).decode("ascii")


# ---------------------------------------------------------------------------
# 1. DETECT -- oil_spill_detection
# ---------------------------------------------------------------------------


@app.post("/api/detect-spill")
async def detect_spill(image: UploadFile = File(...), threshold: float = 0.5):
    """
    Run the trained U-Net on an uploaded SAR image chip.

    Returns the binary mask + red overlay as base64 PNGs, plus summary
    stats (spill area %, mean confidence, and a pixel-space centroid
    that the frontend/attribution step can map to a real-world lat/lon
    once the image is georeferenced).
    """
    model, img_size = get_model()

    contents = await image.read()
    file_bytes = np.frombuffer(contents, dtype=np.uint8)
    orig_gray = cv2.imdecode(file_bytes, cv2.IMREAD_GRAYSCALE)
    if orig_gray is None:
        raise HTTPException(status_code=400, detail="Could not decode image. Expected a grayscale SAR PNG/JPG.")

    # run_inference reads from disk, so we round-trip through a temp file
    # to reuse the exact, already-validated inference code unchanged.
    tmp_path = f"/tmp/_sagardrishti_{int(time.time() * 1000)}.png"
    cv2.imwrite(tmp_path, orig_gray)
    try:
        mask, probs = run_inference(model, tmp_path, img_size, _device, threshold)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    overlay = make_overlay(orig_gray, mask)

    spill_pixels = int((mask > 0).sum())
    total_pixels = int(mask.size)
    area_fraction = spill_pixels / total_pixels
    mean_confidence = float(probs[mask > 0].mean()) if spill_pixels > 0 else 0.0

    ys, xs = np.where(mask > 0)
    centroid_px = None
    if len(xs) > 0:
        centroid_px = {"x": float(xs.mean()), "y": float(ys.mean())}

    return {
        "spill_detected": spill_pixels > 0,
        "spill_pixel_count": spill_pixels,
        "total_pixels": total_pixels,
        "area_fraction": round(area_fraction, 5),
        "mean_confidence": round(mean_confidence, 3),
        "centroid_px": centroid_px,
        "image_shape": {"height": int(orig_gray.shape[0]), "width": int(orig_gray.shape[1])},
        "mask_png_base64": _encode_png_base64(mask),
        "overlay_png_base64": _encode_png_base64(overlay),
        "model_notes": (
            "Prototype U-Net, mean Dice 0.424 / mean IoU 0.302 on held-out test set. "
            "Treat as a probable-region indicator, not a certified detection."
        ),
    }


# ---------------------------------------------------------------------------
# 2. ATTRIBUTE -- vessel_attribution
# ---------------------------------------------------------------------------


class AttributionRequest(BaseModel):
    spill_lat: float
    spill_lon: float
    n_vessels: int = 8
    seed: Optional[int] = None


@app.post("/api/attribute-vessel")
async def attribute_vessel(req: AttributionRequest):
    """
    Rank nearby AIS traffic by likelihood of being the spill source.

    Uses a synthetic AIS snapshot for the demo; swap
    `generate_synthetic_ais` for a real AIS feed query in production
    without touching the scoring logic in attribution.py.
    """
    vessels = generate_synthetic_ais(
        req.spill_lat, req.spill_lon, n_vessels=req.n_vessels, seed=req.seed
    )
    result = attribute(req.spill_lat, req.spill_lon, vessels)
    return result


# ---------------------------------------------------------------------------
# 3. PREDICT -- trajectory_prediction
# ---------------------------------------------------------------------------


class TrajectoryRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    current_speed_knots: float
    current_bearing_deg: float
    wind_speed_knots: float
    wind_bearing_deg: float
    horizons_hours: List[float] = [24, 48]


@app.post("/api/predict-trajectory")
async def predict_trajectory_endpoint(req: TrajectoryRequest):
    points = predict_trajectory(
        req.origin_lat,
        req.origin_lon,
        req.current_speed_knots,
        req.current_bearing_deg,
        req.wind_speed_knots,
        req.wind_bearing_deg,
        horizons_hours=req.horizons_hours,
    )
    geojson = to_geojson(req.origin_lat, req.origin_lon, points)
    return {
        "predictions": [
            {
                "hours": p.hours,
                "lat": round(p.lat, 5),
                "lon": round(p.lon, 5),
                "distance_km": round(p.distance_km, 2),
                "uncertainty_radius_km": round(p.uncertainty_radius_km, 2),
            }
            for p in points
        ],
        "geojson": geojson,
    }


@app.get("/api/health")
async def health():
    return {"status": "ok", "checkpoint_found": os.path.exists(CHECKPOINT_PATH)}
