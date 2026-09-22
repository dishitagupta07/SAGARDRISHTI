"""
Demo: run the vessel attribution engine against the synthetic AIS + spill data.

Run this after generating synthetic data:
    python data/generate_synthetic_ais.py
    python vessel_attribution/demo.py
"""
import json
import os
import sys

import pandas as pd

sys.path.append(os.path.dirname(__file__))
from attribution_engine import attribute_spill

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic")


def main():
    ais_path = os.path.join(DATA_DIR, "ais_tracks.csv")
    spill_path = os.path.join(DATA_DIR, "spill_event.json")

    if not os.path.exists(ais_path):
        print("Synthetic data not found. Run: python data/generate_synthetic_ais.py")
        return

    ais_df = pd.read_csv(ais_path, parse_dates=["BaseDateTime"])
    with open(spill_path) as f:
        spill = json.load(f)

    spill_time = pd.Timestamp(spill["detected_time"])

    active, ruled_out = attribute_spill(
        ais_df, spill["latitude"], spill["longitude"], spill_time
    )

    print(f"\nSpill {spill['spill_id']} at ({spill['latitude']:.4f}, {spill['longitude']:.4f}), "
          f"detected {spill['detected_time']}\n")

    print("=== Vessel Attribution (ranked) ===")
    for s in active:
        print(f"MMSI {s.mmsi} ({s.vessel_name}, {s.vessel_type}): "
              f"{s.attribution_pct}% attribution")
        for e in s.evidence:
            print(f"    - {e}")
    print()

    print(f"=== Ruled Out (negative evidence) — {len(ruled_out)} vessels ===")
    for s in ruled_out:
        print(f"MMSI {s.mmsi} ({s.vessel_name}, {s.vessel_type}): {s.ruled_out_reason}")

    if "true_culprit_mmsi" in spill:
        top = active[0].mmsi if active else None
        match = "MATCH" if top == spill["true_culprit_mmsi"] else "MISMATCH"
        print(f"\n[Validation] Top-ranked vessel: {top} | "
              f"Ground truth: {spill['true_culprit_mmsi']} | {match}")


if __name__ == "__main__":
    main()
