"""
Stable integration interface for trajectory prediction.

Your teammate should only ever call `predict()`. Returns plain JSON-serializable dicts
(lists of lat/lon points per timestep) ready to hand straight to the React-Leaflet
digital twin -- no numpy arrays or custom classes cross the boundary.

CONTRACT
--------
predict(origin_lat, origin_lon, forward_hours=48, backward_hours=12) -> dict:
{
    "origin": {"latitude": ..., "longitude": ...},
    "forward": [                      # predicted future spread
        {"hours_from_now": 0, "footprint": [[lat, lon], ...]},
        {"hours_from_now": 1, "footprint": [[lat, lon], ...]},
        ...
    ],
    "backward": [ ... same shape, hours_from_now is negative ... ],
    "footprint_summary": {
        "at_24h": {"lat_min":..,"lat_max":..,"lon_min":..,"lon_max":..} or None,
        "at_48h": {...} or None,
    }
}

By default this uses the built-in synthetic tidal current/wind field (good enough for a
demo). Once you have real ERA5/CMEMS data, replace `current_field`/`wind_field` here with
a gridded field loader -- the rest of the contract (and everything downstream in the app)
does not need to change.
"""
import os
import sys

sys.path.append(os.path.dirname(__file__))
from drift_model import SinusoidalTidalField, predict_trajectory, bounding_footprint


def _positions_to_json(positions, timestamps_hours):
    steps = []
    for i, t in enumerate(timestamps_hours):
        footprint = [[round(float(lat), 5), round(float(lon), 5)]
                     for lat, lon in positions[i]]
        steps.append({"hours_from_now": round(float(t), 2), "footprint": footprint})
    return steps


def _footprint_dict(positions, step):
    if step >= positions.shape[0]:
        return None
    lat_min, lat_max, lon_min, lon_max = bounding_footprint(positions, step=step)
    return {
        "lat_min": round(float(lat_min), 5), "lat_max": round(float(lat_max), 5),
        "lon_min": round(float(lon_min), 5), "lon_max": round(float(lon_max), 5),
    }


def predict(origin_lat, origin_lon, forward_hours=48, backward_hours=12,
            n_particles=200, current_field=None, wind_field=None):
    current_field = current_field or SinusoidalTidalField(mean_u=0.15, mean_v=-0.05)
    wind_field = wind_field or SinusoidalTidalField(
        mean_u=2.0, mean_v=1.0, tidal_amp=1.5, period_hours=24
    )

    fwd_positions, fwd_times = predict_trajectory(
        origin_lat, origin_lon, current_field, wind_field,
        n_particles=n_particles, duration_hours=forward_hours, direction=1,
    )
    back_positions, back_times = predict_trajectory(
        origin_lat, origin_lon, current_field, wind_field,
        n_particles=n_particles, duration_hours=backward_hours, direction=-1, seed=7,
    )

    return {
        "origin": {"latitude": origin_lat, "longitude": origin_lon},
        "forward": _positions_to_json(fwd_positions, fwd_times),
        "backward": _positions_to_json(back_positions, back_times),
        "footprint_summary": {
            "at_24h": _footprint_dict(fwd_positions, 24) if forward_hours >= 24 else None,
            "at_48h": _footprint_dict(fwd_positions, -1),
        },
    }


if __name__ == "__main__":
    import argparse
    import json
    parser = argparse.ArgumentParser()
    parser.add_argument("--lat", type=float, required=True)
    parser.add_argument("--lon", type=float, required=True)
    parser.add_argument("--forward_hours", type=int, default=48)
    parser.add_argument("--backward_hours", type=int, default=12)
    args = parser.parse_args()
    result = predict(args.lat, args.lon, args.forward_hours, args.backward_hours)
    # print a trimmed version so stdout isn't thousands of points
    trimmed = {
        "origin": result["origin"],
        "footprint_summary": result["footprint_summary"],
        "forward_steps": len(result["forward"]),
        "backward_steps": len(result["backward"]),
    }
    print(json.dumps(trimmed, indent=2))
