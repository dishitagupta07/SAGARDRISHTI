# ---------------------------------------------------
# SPILL / ML OUTPUT VALIDATION
# ---------------------------------------------------

def validate_spill_data(spill_data):
    """
    Validate spill detection output received from ML model.
    """

    required_fields = [
        "latitude",
        "longitude",
        "area_km2",
        "confidence"
    ]

    missing_fields = [
        field
        for field in required_fields
        if field not in spill_data
    ]

    if missing_fields:
        raise ValueError(
            f"Missing spill fields: {missing_fields}"
        )

    return True


# ---------------------------------------------------
# CONVERT SPILL OUTPUT
# ---------------------------------------------------

def prepare_spill_data(spill_data):
    """
    Prepare ML spill output in structured format.
    """

    validate_spill_data(spill_data)

    prepared_data = {
        "latitude": float(spill_data["latitude"]),
        "longitude": float(spill_data["longitude"]),
        "area_km2": float(spill_data["area_km2"]),
        "confidence": float(spill_data["confidence"])
    }

    return prepared_data


# ---------------------------------------------------
# TESTING
# ---------------------------------------------------

if __name__ == "__main__":

    sample_spill = {
        "latitude": 19.08,
        "longitude": 72.88,
        "area_km2": 12.5,
        "confidence": 0.91
    }

    print("===================================")
    print("      SPILL DATA PROCESSING")
    print("===================================")

    prepared_spill = prepare_spill_data(
        sample_spill
    )

    print("\nPrepared spill data:")

    print(prepared_spill)

    print("\nSpill data is valid!")

    print("\n===================================")
    print("   SPILL PROCESSING COMPLETE")
    print("===================================")