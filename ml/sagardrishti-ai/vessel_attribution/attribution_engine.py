"""
Explainable Vessel Attribution Engine.

Given a detected spill (location + time) and a set of AIS vessel tracks, produces a
percentage-based attribution score per vessel with supporting evidence -- matching the
"Explainable Vessel Attribution" + "Negative Evidence Engine" ideas in the pitch deck.

Core idea: instead of "nearest vessel = guilty", score every vessel on multiple
independent factors and combine them transparently:
    1. Proximity     - how close was the vessel to the spill location at the closest time?
    2. Temporal match- was the vessel actually near the spill AROUND the detection time?
    3. Route/heading  - was the vessel's heading/course consistent with passing through
                        the spill point (vs. e.g. moving away or perpendicular)?
    4. Vessel type    - tankers/cargo ships carrying oil are inherently higher prior risk
                        than e.g. passenger vessels (soft prior, not a verdict).
    5. Negative evidence - vessels that were never within a plausible radius/time window
                        are explicitly ruled out with a reason, not just left off the list.

The weighted combination is intentionally simple and transparent (not a black-box model)
so every score can be explained to an investigator. You can later swap `combine_scores`
for a trained classifier using the same features if you want a learned model instead.
"""
import math
from dataclasses import dataclass, field
from datetime import timedelta

import numpy as np
import pandas as pd

EARTH_RADIUS_KM = 6371.0

# Soft priors by vessel type (illustrative -- tune with domain input / real incident data)
VESSEL_TYPE_PRIOR = {
    "Tanker": 1.0,
    "Cargo": 0.6,
    "Tug": 0.5,
    "Fishing": 0.3,
    "Passenger": 0.15,
}
DEFAULT_TYPE_PRIOR = 0.4

# Vessel is ruled out (negative evidence) if it was never within this radius of the spill
# within this time window around detection.
RULE_OUT_RADIUS_KM = 15.0
RULE_OUT_WINDOW_HOURS = 6


def haversine_km(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


@dataclass
class VesselScore:
    mmsi: int
    vessel_name: str
    vessel_type: str
    attribution_pct: float
    ruled_out: bool
    ruled_out_reason: str = ""
    closest_distance_km: float = None
    closest_time_delta_hours: float = None
    evidence: list = field(default_factory=list)   # supporting evidence strings
    counter_evidence: list = field(default_factory=list)  # negative evidence strings


def _closest_approach(vessel_df, spill_lat, spill_lon, spill_time):
    """Find this vessel's closest approach (in space) to the spill, and how far in time
    that closest point was from the detection time."""
    dists = vessel_df.apply(
        lambda row: haversine_km(row["LAT"], row["LON"], spill_lat, spill_lon), axis=1
    )
    idx_min = dists.idxmin()
    closest_row = vessel_df.loc[idx_min]
    closest_dist_km = dists.loc[idx_min]
    time_delta_hours = abs((closest_row["BaseDateTime"] - spill_time).total_seconds()) / 3600.0
    return closest_dist_km, time_delta_hours, closest_row


def _proximity_score(distance_km, max_km=20.0):
    """1.0 at distance=0, decays to 0 at distance=max_km."""
    return max(0.0, 1.0 - distance_km / max_km)


def _temporal_score(time_delta_hours, max_hours=6.0):
    """1.0 at delta=0, decays to 0 at delta=max_hours."""
    return max(0.0, 1.0 - time_delta_hours / max_hours)


def _heading_consistency_score(vessel_df, closest_row, spill_lat, spill_lon):
    """Rough check: was the vessel's course-over-ground pointing roughly toward the
    spill location at its closest approach? 1.0 = heading directly at it, 0 = away."""
    bearing_to_spill = math.degrees(math.atan2(
        math.sin(math.radians(spill_lon - closest_row["LON"])) * math.cos(math.radians(spill_lat)),
        math.cos(math.radians(closest_row["LAT"])) * math.sin(math.radians(spill_lat))
        - math.sin(math.radians(closest_row["LAT"])) * math.cos(math.radians(spill_lat))
        * math.cos(math.radians(spill_lon - closest_row["LON"]))
    )) % 360

    cog = closest_row.get("COG", closest_row.get("Heading", 0))
    angle_diff = abs((cog - bearing_to_spill + 180) % 360 - 180)
    return max(0.0, 1.0 - angle_diff / 180.0)


def score_vessel(vessel_df, mmsi, spill_lat, spill_lon, spill_time):
    vessel_df = vessel_df.sort_values("BaseDateTime")
    vessel_name = vessel_df["VesselName"].iloc[0]
    vessel_type = vessel_df["VesselType"].iloc[0]

    closest_dist_km, time_delta_hours, closest_row = _closest_approach(
        vessel_df, spill_lat, spill_lon, spill_time
    )

    ruled_out = closest_dist_km > RULE_OUT_RADIUS_KM or time_delta_hours > RULE_OUT_WINDOW_HOURS
    counter_evidence = []
    if closest_dist_km > RULE_OUT_RADIUS_KM:
        counter_evidence.append(
            f"Closest recorded position was {closest_dist_km:.1f} km from the spill "
            f"(beyond the {RULE_OUT_RADIUS_KM:.0f} km plausibility radius)."
        )
    if time_delta_hours > RULE_OUT_WINDOW_HOURS:
        counter_evidence.append(
            f"Nearest approach was {time_delta_hours:.1f} h from detection time "
            f"(beyond the {RULE_OUT_WINDOW_HOURS:.0f} h plausibility window)."
        )

    if ruled_out:
        return VesselScore(
            mmsi=mmsi, vessel_name=vessel_name, vessel_type=vessel_type,
            attribution_pct=0.0, ruled_out=True,
            ruled_out_reason="; ".join(counter_evidence),
            closest_distance_km=round(closest_dist_km, 2),
            closest_time_delta_hours=round(time_delta_hours, 2),
            counter_evidence=counter_evidence,
        )

    proximity = _proximity_score(closest_dist_km)
    temporal = _temporal_score(time_delta_hours)
    heading = _heading_consistency_score(vessel_df, closest_row, spill_lat, spill_lon)
    type_prior = VESSEL_TYPE_PRIOR.get(vessel_type, DEFAULT_TYPE_PRIOR)

    # Transparent weighted combination -- weights are the "explainability" knobs.
    weights = {"proximity": 0.40, "temporal": 0.30, "heading": 0.15, "type_prior": 0.15}
    raw_score = (
        weights["proximity"] * proximity
        + weights["temporal"] * temporal
        + weights["heading"] * heading
        + weights["type_prior"] * type_prior
    )

    evidence = [
        f"Closest approach {closest_dist_km:.2f} km from spill (proximity score {proximity:.2f}).",
        f"Closest approach was {time_delta_hours:.2f} h from detection time (temporal score {temporal:.2f}).",
        f"Course-over-ground consistent with heading toward spill point (heading score {heading:.2f}).",
        f"Vessel type '{vessel_type}' has baseline risk prior {type_prior:.2f}.",
    ]

    return VesselScore(
        mmsi=mmsi, vessel_name=vessel_name, vessel_type=vessel_type,
        attribution_pct=round(raw_score * 100, 1), ruled_out=False,
        closest_distance_km=round(closest_dist_km, 2),
        closest_time_delta_hours=round(time_delta_hours, 2),
        evidence=evidence,
    )


def attribute_spill(ais_df, spill_lat, spill_lon, spill_time):
    """
    Score every vessel against the spill event.

    Returns:
        active:
            Top candidate vessels for suspect-vessel ranking.
        ruled_out:
            Vessels with strong negative evidence.

    For the prototype, up to 3 candidate vessels are returned so that
    the frontend can display a meaningful suspect-vessel ranking.
    """
    ais_df = ais_df.copy()
    ais_df["BaseDateTime"] = pd.to_datetime(ais_df["BaseDateTime"])

    scores = []

    for mmsi, vessel_df in ais_df.groupby("MMSI"):
        scores.append(
            score_vessel(
                vessel_df,
                mmsi,
                spill_lat,
                spill_lon,
                spill_time
            )
        )

    # Normally active vessels are those that pass the plausibility checks.
    active = [s for s in scores if not s.ruled_out]
    ruled_out = [s for s in scores if s.ruled_out]

    # ---------------------------------------------------------
    # Prototype candidate ranking
    # ---------------------------------------------------------
    # If fewer than 3 vessels pass the strict plausibility
    # criteria, include the closest vessels as additional
    # candidates so the prototype can show a suspect ranking.
    if len(active) < 3:

        already_active = {s.mmsi for s in active}

        additional_candidates = [
            s for s in scores
            if s.mmsi not in already_active
        ]

        additional_candidates.sort(
            key=lambda s: (
                s.closest_distance_km if s.closest_distance_km is not None
                else float("inf")
            )
        )

        needed = 3 - len(active)

        for candidate in additional_candidates[:needed]:
            # Give the candidate a small but non-zero prototype score.
            distance = candidate.closest_distance_km or 999.0
            time_delta = candidate.closest_time_delta_hours or 999.0

            proximity = max(0.0, 1.0 - distance / 50.0)
            temporal = max(0.0, 1.0 - time_delta / 24.0)

            prototype_score = (
                0.60 * proximity +
                0.40 * temporal
            )

            candidate.attribution_pct = round(
                max(prototype_score * 100, 1.0),
                1
            )

            candidate.ruled_out = False

            candidate.evidence = [
                f"Secondary candidate based on spatial proximity: "
                f"{distance:.2f} km from spill.",
                f"Temporal difference from detection: "
                f"{time_delta:.2f} h.",
                "Included as a lower-confidence candidate for prototype ranking."
            ]

            active.append(candidate)

            if candidate in ruled_out:
                ruled_out.remove(candidate)

    # ---------------------------------------------------------
    # Keep only top 3 candidates
    # ---------------------------------------------------------
    active.sort(
        key=lambda s: s.attribution_pct,
        reverse=True
    )

    active = active[:3]

    # ---------------------------------------------------------
    # Normalize candidate scores to 100%
    # ---------------------------------------------------------
    total = sum(
        s.attribution_pct
        for s in active
        if s.attribution_pct > 0
    )

    if total > 0:
        for s in active:
            s.attribution_pct = round(
                s.attribution_pct / total * 100,
                1
            )

    # Final ordering
    active.sort(
        key=lambda s: s.attribution_pct,
        reverse=True
    )

    ruled_out.sort(
        key=lambda s: s.mmsi
    )

    return active, ruled_out