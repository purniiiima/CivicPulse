import math
from typing import Tuple

# Standard city wards configuration
MUNICIPAL_WARDS = [
    "Ward 1 - Downtown Core",
    "Ward 2 - Westside Park",
    "Ward 3 - Metro Transit North",
    "Ward 4 - Eastside District",
    "Ward 5 - Industrial & Port",
    "Ward 6 - South Suburbs",
]


def calculate_haversine_distance(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Calculate the great-circle distance between two points in kilometers."""
    radius_earth_km = 6371.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return radius_earth_km * c
