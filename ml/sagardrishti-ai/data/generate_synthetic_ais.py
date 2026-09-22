"""
Generates synthetic AIS vessel tracks + a synthetic oil spill event, in the same
schema you'd get from MarineCadastre AIS data. Lets you build/test the vessel
attribution engine and trajectory model before real data is available.

Run:
    python data/generate_synthetic_ais.py
Outputs:
    data/synthetic/ais_tracks.csv
    data/synthetic/spill_event.json
"""
import json
import os
import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)

OUT_DIR = os.path.join(os.path.dirname(__file__), "synthetic")
os.makedirs(OUT_DIR, exist_ok=True)

# A rough box off the Chennai coast, matching your reference paper's study area
LAT_RANGE = (12.7, 13.3)
LON_RANGE = (80.1, 80.6)

N_VESSELS = 12
TRACK_HOURS = 24
POINTS_PER_HOUR = 2  # AIS ping every 30 min


def make_vessel_track(mmsi, vessel_type, is_culprit=False, spill_time=None, spill_pos=None):
    """Simulate one vessel's track as a slightly noisy straight-line / loitering path."""
    n_points = TRACK_HOURS * POINTS_PER_HOUR
    start_lat = RNG.uniform(*LAT_RANGE)
    start_lon = RNG.uniform(*LON_RANGE)
    heading = RNG.uniform(0, 360)
    speed_knots = RNG.uniform(8, 18)

    # convert heading/speed to rough per-step lat/lon deltas
    dt_hours = 1 / POINTS_PER_HOUR
    dlat_per_step = (speed_knots * dt_hours / 60) * np.cos(np.radians(heading))
    dlon_per_step = (speed_knots * dt_hours / 60) * np.sin(np.radians(heading))

    lats, lons, times, sogs, cogs = [], [], [], [], []
    lat, lon = start_lat, start_lon
    base_time = pd.Timestamp("2026-08-01 00:00:00")

    for i in range(n_points):
        t = base_time + pd.Timedelta(hours=i * dt_hours)
        jitter = RNG.normal(0, 0.002, size=2)
        lat_i, lon_i = lat + jitter[0], lon + jitter[1]

        # If this is the culprit vessel, force it to pass near the spill location
        # around the spill time -- this is the signal the attribution engine should find.
        if is_culprit and spill_time is not None and abs((t - spill_time).total_seconds()) < 1800:
            lat_i = spill_pos[0] + RNG.normal(0, 0.01)
            lon_i = spill_pos[1] + RNG.normal(0, 0.01)

        lats.append(lat_i)
        lons.append(lon_i)
        times.append(t)
        sogs.append(max(0, speed_knots + RNG.normal(0, 1)))
        cogs.append((heading + RNG.normal(0, 5)) % 360)

        lat += dlat_per_step
        lon += dlon_per_step

    return pd.DataFrame({
        "MMSI": mmsi,
        "BaseDateTime": times,
        "LAT": lats,
        "LON": lons,
        "SOG": sogs,
        "COG": cogs,
        "Heading": cogs,
        "VesselName": f"VESSEL_{mmsi}",
        "VesselType": vessel_type,
    })


def main():
    spill_time = pd.Timestamp("2026-08-01 14:00:00")
    spill_pos = (
        RNG.uniform(*LAT_RANGE),
        RNG.uniform(*LON_RANGE),
    )

    culprit_mmsi = 200000001
    all_tracks = []
    vessel_types = ["Tanker", "Cargo", "Tanker", "Fishing", "Cargo", "Tanker",
                     "Passenger", "Cargo", "Tanker", "Fishing", "Cargo", "Tug"]

    for i in range(N_VESSELS):
        mmsi = 200000000 + i + 1
        is_culprit = (mmsi == culprit_mmsi)
        df = make_vessel_track(
            mmsi, vessel_types[i % len(vessel_types)],
            is_culprit=is_culprit, spill_time=spill_time, spill_pos=spill_pos
        )
        all_tracks.append(df)

    ais_df = pd.concat(all_tracks, ignore_index=True)
    ais_path = os.path.join(OUT_DIR, "ais_tracks.csv")
    ais_df.to_csv(ais_path, index=False)

    spill_event = {
        "spill_id": "SPILL_0001",
        "detected_time": spill_time.isoformat(),
        "latitude": spill_pos[0],
        "longitude": spill_pos[1],
        "estimated_area_km2": round(float(RNG.uniform(0.5, 5.0)), 2),
        "confidence": round(float(RNG.uniform(0.75, 0.98)), 2),
        "true_culprit_mmsi": culprit_mmsi,  # kept here only for validating the engine, not used as a feature
    }
    spill_path = os.path.join(OUT_DIR, "spill_event.json")
    with open(spill_path, "w") as f:
        json.dump(spill_event, f, indent=2)

    print(f"Wrote {len(ais_df)} AIS pings for {N_VESSELS} vessels -> {ais_path}")
    print(f"Wrote spill event -> {spill_path}")
    print(f"(Ground-truth culprit for validation: MMSI {culprit_mmsi} — don't use this field as a feature!)")


if __name__ == "__main__":
    main()
