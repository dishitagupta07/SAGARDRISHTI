"""
Stable integration interface for vessel attribution.

Your teammate should only ever call `attribute()`. It accepts plain data (a CSV path or
already-loaded records) and returns plain JSON-serializable dicts -- no pandas DataFrames
or custom classes leak across the boundary, so the backend doesn't need to know anything
about how the scoring works internally.

CONTRACT
--------
attribute(ais_source, spill_lat, spill_lon, spill_time_iso) -> dict:
{
    "spill": {"latitude": ..., "longitude": ..., "time": "..."},
    "ranked_vessels": [
        {
            "mmsi": int, "vessel_name": str, "vessel_type": str,
            "attribution_pct": float,
            "closest_distance_km": float, "closest_time_delta_hours": float,
            "evidence": [str, ...]
        }, ...
    ],
    "ruled_out_vessels": [
        {"mmsi": int, "vessel_name": str, "vessel_type": str, "reason": str}, ...
    ]
}

ais_source can be:
    - a path to a CSV with columns MMSI, BaseDateTime, LAT, LON, SOG, COG, Heading,
      VesselName, VesselType  (the MarineCadastre schema)
    - a pandas DataFrame with the same columns (for callers already holding data in memory)
"""
import os
import sys

import pandas as pd

sys.path.append(os.path.dirname(__file__))
from attribution_engine import attribute_spill


def attribute(ais_source, spill_lat, spill_lon, spill_time_iso):
    if isinstance(ais_source, pd.DataFrame):
        ais_df = ais_source.copy()
    else:
        if not os.path.exists(ais_source):
            raise FileNotFoundError(f"AIS data file not found: {ais_source}")
        ais_df = pd.read_csv(ais_source)

    ais_df["BaseDateTime"] = pd.to_datetime(ais_df["BaseDateTime"])
    spill_time = pd.Timestamp(spill_time_iso)

    active, ruled_out = attribute_spill(ais_df, spill_lat, spill_lon, spill_time)

    return {
        "spill": {
            "latitude": spill_lat,
            "longitude": spill_lon,
            "time": spill_time.isoformat(),
        },
        "ranked_vessels": [
            {
                "mmsi": int(s.mmsi),
                "vessel_name": s.vessel_name,
                "vessel_type": s.vessel_type,
                "attribution_pct": s.attribution_pct,
                "closest_distance_km": s.closest_distance_km,
                "closest_time_delta_hours": s.closest_time_delta_hours,
                "evidence": s.evidence,
            }
            for s in active
        ],
        "ruled_out_vessels": [
            {
                "mmsi": int(s.mmsi),
                "vessel_name": s.vessel_name,
                "vessel_type": s.vessel_type,
                "reason": s.ruled_out_reason,
            }
            for s in ruled_out
        ],
    }


if __name__ == "__main__":
    import argparse
    import json
    parser = argparse.ArgumentParser()
    parser.add_argument("--ais_csv", required=True)
    parser.add_argument("--lat", type=float, required=True)
    parser.add_argument("--lon", type=float, required=True)
    parser.add_argument("--time", required=True, help="ISO timestamp, e.g. 2026-08-01T14:00:00")
    args = parser.parse_args()
    result = attribute(args.ais_csv, args.lat, args.lon, args.time)
    print(json.dumps(result, indent=2))
