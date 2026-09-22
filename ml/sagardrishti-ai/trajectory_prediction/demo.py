"""
Demo: predict a spill's forward trajectory (future spread) and backward hindcast
(possible origin), using the synthetic spill event, and plot it.

Run:
    python data/generate_synthetic_ais.py   # if not already run
    python trajectory_prediction/demo.py
Outputs:
    trajectory_prediction/trajectory_plot.png
"""
import json
import os
import sys

import matplotlib.pyplot as plt

sys.path.append(os.path.dirname(__file__))
from drift_model import (
    SinusoidalTidalField, predict_trajectory, bounding_footprint,
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic")
OUT_PATH = os.path.join(os.path.dirname(__file__), "trajectory_plot.png")


def main():
    spill_path = os.path.join(DATA_DIR, "spill_event.json")
    if not os.path.exists(spill_path):
        print("Synthetic data not found. Run: python data/generate_synthetic_ais.py")
        return

    with open(spill_path) as f:
        spill = json.load(f)

    origin_lat, origin_lon = spill["latitude"], spill["longitude"]

    current_field = SinusoidalTidalField(mean_u=0.15, mean_v=-0.05)
    wind_field = SinusoidalTidalField(mean_u=2.0, mean_v=1.0, tidal_amp=1.5, period_hours=24)

    # Forward: where will the spill spread over the next 48h?
    fwd_positions, fwd_times = predict_trajectory(
        origin_lat, origin_lon, current_field, wind_field,
        n_particles=300, duration_hours=48, direction=1,
    )

    # Backward: where might the spill have originated from, up to 12h before detection?
    back_positions, back_times = predict_trajectory(
        origin_lat, origin_lon, current_field, wind_field,
        n_particles=300, duration_hours=12, direction=-1, seed=7,
    )

    footprint_24h = bounding_footprint(fwd_positions, step=24)
    footprint_48h = bounding_footprint(fwd_positions, step=-1)
    print(f"Spill origin: ({origin_lat:.4f}, {origin_lon:.4f})")
    print(f"Predicted 24h footprint (lat_min,lat_max,lon_min,lon_max): "
          f"{tuple(round(v,4) for v in footprint_24h)}")
    print(f"Predicted 48h footprint: {tuple(round(v,4) for v in footprint_48h)}")

    fig, ax = plt.subplots(figsize=(8, 8))
    ax.scatter(fwd_positions[-1, :, 1], fwd_positions[-1, :, 0],
               s=8, alpha=0.4, color="crimson", label="Predicted spread (+48h)")
    ax.scatter(fwd_positions[24, :, 1], fwd_positions[24, :, 0],
               s=8, alpha=0.4, color="orange", label="Predicted spread (+24h)")
    ax.scatter(back_positions[-1, :, 1], back_positions[-1, :, 0],
               s=8, alpha=0.4, color="steelblue", label="Hindcast possible origin (-12h)")
    ax.scatter([origin_lon], [origin_lat], s=120, color="black", marker="*",
               label="Detected spill location", zorder=5)

    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    ax.set_title(f"SAGARDRISHTI — Predicted trajectory for {spill['spill_id']}")
    ax.legend(loc="best")
    ax.grid(alpha=0.3)

    fig.tight_layout()
    fig.savefig(OUT_PATH, dpi=150)
    print(f"Saved plot to {OUT_PATH}")


if __name__ == "__main__":
    main()
