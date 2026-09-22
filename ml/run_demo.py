"""
End-to-end CLI demo of the full SagarDrishti AI pipeline, no server needed:

    Detect (U-Net on a sample SAR chip)
        -> Attribute (rank synthetic AIS traffic near the detected spill)
        -> Predict (24h / 48h drift trajectory)

This exercises the exact same code the FastAPI backend calls in
backend/main.py, so it doubles as a smoke test. Requires torch (see
requirements.txt) -- it is not run inside this chat sandbox, which
doesn't have network access to install torch, but it is exactly what
your own environment (which already trained the checkpoint) should run.

Usage:
    python run_demo.py [--image data/spill_dataset_test/images/20191015.png]

For the demo we treat the sample SAR chip as covering a small,
made-up bounding box near the Mumbai coast so the detected pixel
centroid can be turned into a (lat, lon) for the attribution and
trajectory steps. Replace DEMO_BBOX with the real Sentinel-1 scene
footprint once images are georeferenced.
"""
import argparse
import json
import os
import sys

import torch

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "oil_spill_detection"))

from oil_spill_detection.infer import load_model, run_inference, make_overlay
from vessel_attribution import generate_synthetic_ais, attribute
from trajectory_prediction import predict_trajectory
import cv2

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# Made-up scene footprint for the demo SAR chips (south-west, north-east corners).
DEMO_BBOX = {"lat_min": 18.90, "lat_max": 19.20, "lon_min": 72.60, "lon_max": 72.90}

# Made-up environmental conditions for the drift model demo.
DEMO_ENV = {
    "current_speed_knots": 0.8,
    "current_bearing_deg": 60.0,
    "wind_speed_knots": 12.0,
    "wind_bearing_deg": 100.0,
}


def pixel_to_latlon(x, y, width, height, bbox):
    lon = bbox["lon_min"] + (x / width) * (bbox["lon_max"] - bbox["lon_min"])
    # image row 0 is the top (north), so latitude decreases as y increases
    lat = bbox["lat_max"] - (y / height) * (bbox["lat_max"] - bbox["lat_min"])
    return lat, lon


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--image",
        default=os.path.join(ROOT_DIR, "data", "spill_dataset_test", "images", "20191015.png"),
    )
    parser.add_argument("--checkpoint", default=os.path.join(ROOT_DIR, "checkpoints", "unet_best.pt"))
    parser.add_argument("--threshold", type=float, default=0.5)
    parser.add_argument("--out_dir", default=os.path.join(ROOT_DIR, "demo_output"))
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ---------------- 1. DETECT ----------------
    print("[1/3] Detecting spill with U-Net ...")
    model, img_size = load_model(args.checkpoint, device)
    mask, probs = run_inference(model, args.image, img_size, device, args.threshold)
    orig_gray = cv2.imread(args.image, cv2.IMREAD_GRAYSCALE)
    overlay = make_overlay(orig_gray, mask)

    cv2.imwrite(os.path.join(args.out_dir, "mask.png"), mask)
    cv2.imwrite(os.path.join(args.out_dir, "overlay.png"), overlay)

    spill_pixels = int((mask > 0).sum())
    if spill_pixels == 0:
        print("No spill detected above threshold; stopping before attribution/prediction.")
        return

    ys, xs = (mask > 0).nonzero()
    cx, cy = float(xs.mean()), float(ys.mean())
    height, width = mask.shape
    spill_lat, spill_lon = pixel_to_latlon(cx, cy, width, height, DEMO_BBOX)
    print(f"    -> spill centroid pixel=({cx:.1f}, {cy:.1f})  demo lat/lon=({spill_lat:.5f}, {spill_lon:.5f})")

    # ---------------- 2. ATTRIBUTE ----------------
    print("[2/3] Ranking nearby AIS traffic ...")
    vessels = generate_synthetic_ais(spill_lat, spill_lon, n_vessels=8, seed=7)
    attribution_result = attribute(spill_lat, spill_lon, vessels)
    top = attribution_result["most_likely_source"]
    print(f"    -> most likely source: MMSI {top['mmsi']} ({top['vessel_type']}), score={top['suspicion_score']}")

    # ---------------- 3. PREDICT ----------------
    print("[3/3] Predicting 24h/48h drift ...")
    traj_points = predict_trajectory(
        spill_lat,
        spill_lon,
        DEMO_ENV["current_speed_knots"],
        DEMO_ENV["current_bearing_deg"],
        DEMO_ENV["wind_speed_knots"],
        DEMO_ENV["wind_bearing_deg"],
    )
    for p in traj_points:
        print(f"    -> +{int(p.hours)}h: ({p.lat:.5f}, {p.lon:.5f})  drift={p.distance_km:.2f}km")

    # ---------------- Final combined dashboard summary ----------------
    summary = {
        "detection": {
            "spill_pixel_count": spill_pixels,
            "area_fraction": spill_pixels / mask.size,
            "centroid_latlon": {"lat": spill_lat, "lon": spill_lon},
        },
        "attribution": attribution_result["most_likely_source"],
        "trajectory": [
            {"hours": p.hours, "lat": round(p.lat, 5), "lon": round(p.lon, 5), "distance_km": round(p.distance_km, 2)}
            for p in traj_points
        ],
    }
    summary_path = os.path.join(args.out_dir, "summary.json")
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\nDone. Outputs in {args.out_dir}/ (mask.png, overlay.png, summary.json)")


if __name__ == "__main__":
    main()
