import pandas as pd
from pathlib import Path


# ---------------------------------------------------
# 1. LOAD ENVIRONMENT DATA
# ---------------------------------------------------

def load_environment_data(file_path):
    """
    Load wind and ocean current data from CSV.
    """

    df = pd.read_csv(file_path)

    required_columns = [
        "latitude",
        "longitude",
        "timestamp",
        "wind_speed",
        "wind_direction",
        "current_speed",
        "current_direction"
    ]

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
# 2. CLEAN ENVIRONMENT DATA
# ---------------------------------------------------

def clean_environment_data(df):
    """
    Clean wind and ocean current data.
    """

    df = df.copy()

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

    numeric_columns = [
        "latitude",
        "longitude",
        "wind_speed",
        "wind_direction",
        "current_speed",
        "current_direction"
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    df = df.dropna(
        subset=[
            "latitude",
            "longitude",
            "timestamp",
            "wind_speed",
            "wind_direction",
            "current_speed",
            "current_direction"
        ]
    )

    return df


# ---------------------------------------------------
# 3. FILTER ENVIRONMENT DATA BY AREA
# ---------------------------------------------------

def get_environment_by_area(
    df,
    min_lat,
    max_lat,
    min_lon,
    max_lon
):
    """
    Get environmental data for a specific area.
    """

    filtered_df = df[
        (df["latitude"] >= min_lat) &
        (df["latitude"] <= max_lat) &
        (df["longitude"] >= min_lon) &
        (df["longitude"] <= max_lon)
    ]

    return filtered_df


# ---------------------------------------------------
# 4. FILTER ENVIRONMENT DATA BY TIME
# ---------------------------------------------------

def get_environment_by_time(
    df,
    start_time,
    end_time
):
    """
    Get environmental data for a specific time range.
    """

    start_time = pd.to_datetime(start_time)
    end_time = pd.to_datetime(end_time)

    filtered_df = df[
        (df["timestamp"] >= start_time) &
        (df["timestamp"] <= end_time)
    ]

    return filtered_df


# ---------------------------------------------------
# 5. CONVERT TO STRUCTURED RECORDS
# ---------------------------------------------------

def convert_environment_to_records(df):
    """
    Convert environment DataFrame into structured records.
    """

    records = []

    for _, row in df.iterrows():

        record = {
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "timestamp": row["timestamp"].isoformat(),
            "wind_speed": float(row["wind_speed"]),
            "wind_direction": float(row["wind_direction"]),
            "current_speed": float(row["current_speed"]),
            "current_direction": float(
                row["current_direction"]
            )
        }

        records.append(record)

    return records


# ---------------------------------------------------
# 6. TESTING
# ---------------------------------------------------

if __name__ == "__main__":

    file_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "environment"
        / "sample_environment.csv"
    )

    print("===================================")
    print("   ENVIRONMENT DATA PROCESSING")
    print("===================================")

    print("\n1. Loading environment data...")

    environment_data = load_environment_data(
        file_path
    )

    print("Environment data loaded successfully!")

    print("\nOriginal data:")
    print(environment_data)

    print("\n2. Cleaning environment data...")

    environment_data = clean_environment_data(
        environment_data
    )

    print("Environment data cleaned successfully!")

    print("\nCleaned data:")
    print(environment_data)

    print("\n3. Filtering by area...")

    area_data = get_environment_by_area(
        environment_data,
        19.0,
        19.15,
        72.80,
        73.00
    )

    print(area_data)

    print("\n4. Filtering by time...")

    time_data = get_environment_by_time(
        environment_data,
        "2026-09-14 10:00:00",
        "2026-09-14 10:10:00"
    )

    print(time_data)

    print("\n5. Structured environment data...")

    records = convert_environment_to_records(
        time_data
    )

    for record in records:
        print(record)

    print("\n===================================")
    print(" ENVIRONMENT PROCESSING COMPLETE")
    print("===================================")