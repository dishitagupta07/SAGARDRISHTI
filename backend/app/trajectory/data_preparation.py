def prepare_incident_data(
    spill_data,
    vessel_data,
    environment_data
):
    """
    Combine spill, AIS and environmental data
    into one structured object.
    """

    incident_data = {
        "spill": spill_data,
        "vessels": vessel_data,
        "environment": environment_data
    }

    return incident_data


# ---------------------------------------------------
# TESTING
# ---------------------------------------------------

if __name__ == "__main__":

    spill_data = {
        "latitude": 19.08,
        "longitude": 72.88,
        "area_km2": 12.5,
        "confidence": 0.91
    }

    vessel_data = [
        {
            "vessel_id": "V001",
            "latitude": 19.08,
            "longitude": 72.88,
            "timestamp": "2026-09-14T10:00:00",
            "speed": 12.5,
            "heading": 90
        }
    ]

    environment_data = [
        {
            "latitude": 19.08,
            "longitude": 72.88,
            "timestamp": "2026-09-14T10:00:00",
            "wind_speed": 12.5,
            "wind_direction": 90,
            "current_speed": 0.8,
            "current_direction": 180
        }
    ]

    incident = prepare_incident_data(
        spill_data,
        vessel_data,
        environment_data
    )

    print("===================================")
    print("       INCIDENT DATA")
    print("===================================")

    print(incident)

    print("\n===================================")
    print("     DATA PREPARATION COMPLETE")
    print("===================================")