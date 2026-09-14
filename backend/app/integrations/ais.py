import pandas as pd
from pathlib import Path


# ---------------------------------------------------
# 1. LOAD AIS DATA
# ---------------------------------------------------

def load_ais_data(file_path):
    """
    Load AIS vessel data from CSV file.
    """

    df = pd.read_csv(file_path)

    required_columns = [
        "vessel_id",
        "latitude",
        "longitude",
        "timestamp",
        "speed",
        "heading"
    ]

    # Check whether all required columns exist
    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    return df


# ---------------------------------------------------
# 2. CLEAN AIS DATA
# ---------------------------------------------------

def clean_ais_data(df):
    """
    Clean and prepare AIS data.
    """

    df = df.copy()

    # Convert timestamp to datetime
    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

    # Convert numeric columns
    numeric_columns = [
        "latitude",
        "longitude",
        "speed",
        "heading"
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # Remove invalid rows
    df = df.dropna(
        subset=[
            "vessel_id",
            "latitude",
            "longitude",
            "timestamp",
            "speed",
            "heading"
        ]
    )

    return df


# ---------------------------------------------------
# 3. FILTER VESSELS BY AREA
# ---------------------------------------------------

def get_vessels_by_area(
    df,
    min_lat,
    max_lat,
    min_lon,
    max_lon
):
    """
    Get vessels inside a specific geographic area.
    """

    filtered_df = df[
        (df["latitude"] >= min_lat) &
        (df["latitude"] <= max_lat) &
        (df["longitude"] >= min_lon) &
        (df["longitude"] <= max_lon)
    ]

    return filtered_df


# ---------------------------------------------------
# 4. FILTER VESSELS BY TIME
# ---------------------------------------------------

def get_vessels_by_time(
    df,
    start_time,
    end_time
):
    """
    Get vessels within a specific time range.
    """

    start_time = pd.to_datetime(start_time)
    end_time = pd.to_datetime(end_time)

    filtered_df = df[
        (df["timestamp"] >= start_time) &
        (df["timestamp"] <= end_time)
    ]

    return filtered_df


# ---------------------------------------------------
# 5. GET VESSELS BY AREA + TIME
# ---------------------------------------------------

def get_vessel_data(
    df,
    min_lat,
    max_lat,
    min_lon,
    max_lon,
    start_time,
    end_time
):
    """
    Get vessel data for a specific area and time range.
    """

    # First filter by area
    area_data = get_vessels_by_area(
        df,
        min_lat,
        max_lat,
        min_lon,
        max_lon
    )

    # Then filter by time
    filtered_data = get_vessels_by_time(
        area_data,
        start_time,
        end_time
    )

    return filtered_data


# ---------------------------------------------------
# 6. CONVERT DATA INTO STRUCTURED RECORDS
# ---------------------------------------------------

def convert_to_records(df):
    """
    Convert DataFrame into structured records.
    """

    records = []

    for _, row in df.iterrows():

        record = {
            "vessel_id": row["vessel_id"],
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "timestamp": row["timestamp"].isoformat(),
            "speed": float(row["speed"]),
            "heading": float(row["heading"])
        }

        records.append(record)

    return records


# ---------------------------------------------------
# 7. TESTING
# ---------------------------------------------------

if __name__ == "__main__":

    # Path of sample AIS dataset
    file_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "ais"
        / "sample_ais.csv"
    )

    print("===================================")
    print("       AIS DATA PROCESSING")
    print("===================================")

    # Load data
    print("\n1. Loading AIS data...")

    ais_data = load_ais_data(file_path)

    print("AIS data loaded successfully!")

    print("\nOriginal AIS data:")
    print(ais_data)


    # Clean data
    print("\n2. Cleaning AIS data...")

    ais_data = clean_ais_data(ais_data)

    print("AIS data cleaned successfully!")

    print("\nCleaned AIS data:")
    print(ais_data)


    # Area filtering
    print("\n3. Filtering vessels by area...")

    area_data = get_vessels_by_area(
        ais_data,
        19.0,
        19.15,
        72.80,
        73.00
    )

    print("\nVessels in selected area:")
    print(area_data)


    # Time filtering
    print("\n4. Filtering vessels by time...")

    time_data = get_vessels_by_time(
        ais_data,
        "2026-09-14 10:00:00",
        "2026-09-14 10:15:00"
    )

    print("\nVessels in selected time range:")
    print(time_data)


    # Area + time filtering
    print("\n5. Getting vessels by area + time...")

    final_data = get_vessel_data(
        ais_data,
        19.0,
        19.15,
        72.80,
        73.00,
        "2026-09-14 10:00:00",
        "2026-09-14 10:20:00"
    )

    print("\nFinal filtered vessel data:")
    print(final_data)


    # Convert to structured records
    print("\n6. Converting data into structured records...")

    records = convert_to_records(final_data)

    print("\nStructured vessel data:")

    for record in records:
        print(record)


    print("\n===================================")
    print("       AIS PROCESSING COMPLETE")
    print("===================================")