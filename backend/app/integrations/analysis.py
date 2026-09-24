from pathlib import Path
from math import cos, radians

from backend.app.integrations.ais import (
    load_ais_data,
    clean_ais_data,
    get_vessel_data,
    convert_to_records
)

from backend.app.integrations.environment import (
    load_environment_data,
    clean_environment_data,
    get_environment_by_area,
    get_environment_by_time,
    convert_environment_to_records
)

from backend.app.integrations.spill import prepare_spill_data

from backend.app.attribution.geospatial import find_nearby_vessels

from backend.app.trajectory.data_preparation import prepare_incident_data


BASE_DIR = Path(__file__).resolve().parents[2]

AIS_FILE = BASE_DIR / "data" / "ais" / "sample_ais.csv"
ENVIRONMENT_FILE = BASE_DIR / "data" / "environment" / "sample_environment.csv"


def analyse_incident(
    spill_data,
    start_time,
    end_time,
    radius_km=10
):

    # Prepare spill information
    spill = prepare_spill_data(spill_data)

    latitude = spill["latitude"]
    longitude = spill["longitude"]

    # Approximate geographic area around the spill
    lat_margin = radius_km / 111

    lon_margin = radius_km / (
        111 * max(abs(cos(radians(latitude))), 0.01)
    )

    min_lat = latitude - lat_margin
    max_lat = latitude + lat_margin

    min_lon = longitude - lon_margin
    max_lon = longitude + lon_margin

    # ---------------- AIS DATA ----------------

    ais_df = load_ais_data(AIS_FILE)
    ais_df = clean_ais_data(ais_df)

    vessel_df = get_vessel_data(
        ais_df,
        min_lat,
        max_lat,
        min_lon,
        max_lon,
        start_time,
        end_time
    )

    vessel_records = convert_to_records(vessel_df)

    # Find vessels actually close to the spill
    nearby_vessels = find_nearby_vessels(
        vessel_records,
        latitude,
        longitude,
        radius_km
    )

    # ---------------- ENVIRONMENT DATA ----------------

    environment_df = load_environment_data(ENVIRONMENT_FILE)
    environment_df = clean_environment_data(environment_df)

    environment_area = get_environment_by_area(
        environment_df,
        min_lat,
        max_lat,
        min_lon,
        max_lon
    )

    environment_filtered = get_environment_by_time(
        environment_area,
        start_time,
        end_time
    )

    environment_records = convert_environment_to_records(
        environment_filtered
    )

    # ---------------- FINAL INCIDENT DATA ----------------

    incident_data = prepare_incident_data(
        spill,
        nearby_vessels,
        environment_records
    )

    return incident_data