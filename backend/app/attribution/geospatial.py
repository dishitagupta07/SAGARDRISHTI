from math import radians, sin, cos, sqrt, atan2


# ---------------------------------------------------
# DISTANCE BETWEEN TWO LOCATIONS
# ---------------------------------------------------

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):
    """
    Calculate approximate distance between two
    geographic coordinates in kilometers.
    """

    earth_radius = 6371.0

    lat1 = radians(lat1)
    lon1 = radians(lon1)

    lat2 = radians(lat2)
    lon2 = radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        +
        cos(lat1)
        * cos(lat2)
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = earth_radius * c

    return distance


# ---------------------------------------------------
# FIND NEARBY VESSELS
# ---------------------------------------------------

def find_nearby_vessels(
    vessels,
    spill_latitude,
    spill_longitude,
    radius_km
):
    """
    Find vessels within a given distance
    from the spill location.
    """

    nearby_vessels = []

    for vessel in vessels:

        distance = calculate_distance(
            spill_latitude,
            spill_longitude,
            vessel["latitude"],
            vessel["longitude"]
        )

        if distance <= radius_km:

            vessel_data = vessel.copy()

            vessel_data["distance_from_spill_km"] = round(
                distance,
                3
            )

            nearby_vessels.append(vessel_data)

    return nearby_vessels


# ---------------------------------------------------
# TESTING
# ---------------------------------------------------

if __name__ == "__main__":

    vessels = [
        {
            "vessel_id": "V001",
            "latitude": 19.08,
            "longitude": 72.88
        },
        {
            "vessel_id": "V002",
            "latitude": 19.10,
            "longitude": 72.85
        },
        {
            "vessel_id": "V003",
            "latitude": 19.20,
            "longitude": 73.10
        }
    ]

    spill_latitude = 19.08
    spill_longitude = 72.88

    nearby = find_nearby_vessels(
        vessels,
        spill_latitude,
        spill_longitude,
        10
    )

    print("Nearby vessels:")

    for vessel in nearby:
        print(vessel)