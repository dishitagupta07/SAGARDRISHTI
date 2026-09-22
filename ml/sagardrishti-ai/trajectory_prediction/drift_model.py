"""
Simplified Lagrangian particle drift model for oil spill trajectory prediction.

Advects a cloud of particles (representing the spill) using:
    velocity = current_velocity + wind_drift_factor * wind_velocity + random diffusion

This is a simplified stand-in for OpenDrift -- good enough for a convincing demo and
heatmap. Swap in real OpenDrift + real current/wind fields (ERA5, CMEMS) once available
(see data/download_datasets.md); the interface (a `predict_trajectory` function that
takes a current/wind field and returns particle positions over time) is designed to be
a drop-in replacement point.

Also supports backward hindcasting (reverse time) to estimate possible spill origin,
matching the "Backward hindcasting + future prediction" item in the pitch deck.
"""
import numpy as np

# Oil drifts at roughly 3% of wind speed, in the wind direction (empirical rule of thumb
# used in real oil-spill trajectory models).
WIND_DRIFT_FACTOR = 0.03
KM_PER_DEG_LAT = 111.0


def km_per_deg_lon(lat):
    return 111.0 * np.cos(np.radians(lat))


class ConstantField:
    """A trivial current/wind field: constant vector everywhere. Use for a quick demo,
    or subclass/replace with a real gridded field (e.g. loaded from ERA5/CMEMS netCDF)."""

    def __init__(self, u=0.0, v=0.0):
        self.u = u  # eastward component, m/s
        self.v = v  # northward component, m/s

    def sample(self, lat, lon, t_hours):
        return self.u, self.v


class SinusoidalTidalField:
    """A more interesting synthetic field: a tidal current that oscillates, plus a
    steady background current. Good for demoing a non-trivial trajectory without real data."""

    def __init__(self, mean_u=0.15, mean_v=-0.05, tidal_amp=0.25, period_hours=12.4):
        self.mean_u = mean_u
        self.mean_v = mean_v
        self.tidal_amp = tidal_amp
        self.period_hours = period_hours

    def sample(self, lat, lon, t_hours):
        phase = 2 * np.pi * t_hours / self.period_hours
        u = self.mean_u + self.tidal_amp * np.sin(phase)
        v = self.mean_v + self.tidal_amp * 0.5 * np.cos(phase)
        return u, v


def predict_trajectory(
    origin_lat, origin_lon,
    current_field, wind_field,
    n_particles=200, duration_hours=48, dt_hours=1.0,
    diffusion_std_m_per_step=150.0,
    direction=1,  # +1 = forward (future spread), -1 = backward (hindcast possible origin)
    seed=42,
):
    """
    Returns:
        positions: np.ndarray of shape (n_steps+1, n_particles, 2) -- [lat, lon] per step
        timestamps_hours: np.ndarray of shape (n_steps+1,) -- hours from origin time
                           (negative if direction=-1)
    """
    rng = np.random.default_rng(seed)
    n_steps = int(duration_hours / dt_hours)

    lats = np.full(n_particles, origin_lat, dtype=np.float64)
    lons = np.full(n_particles, origin_lon, dtype=np.float64)

    # small initial spread so it looks like a spill patch, not a single point
    lats += rng.normal(0, 0.002, size=n_particles)
    lons += rng.normal(0, 0.002, size=n_particles)

    positions = np.zeros((n_steps + 1, n_particles, 2))
    positions[0, :, 0] = lats
    positions[0, :, 1] = lons
    timestamps_hours = np.zeros(n_steps + 1)

    dt_seconds = dt_hours * 3600.0

    for step in range(1, n_steps + 1):
        t_hours = direction * step * dt_hours
        for p in range(n_particles):
            cu, cv = current_field.sample(lats[p], lons[p], t_hours)
            wu, wv = wind_field.sample(lats[p], lons[p], t_hours)

            u = cu + WIND_DRIFT_FACTOR * wu
            v = cv + WIND_DRIFT_FACTOR * wv

            # random walk diffusion (turbulent spreading), in meters
            diff_east_m = rng.normal(0, diffusion_std_m_per_step)
            diff_north_m = rng.normal(0, diffusion_std_m_per_step)

            dx_m = direction * u * dt_seconds + diff_east_m
            dy_m = direction * v * dt_seconds + diff_north_m

            dlat = dy_m / 1000.0 / KM_PER_DEG_LAT
            dlon = dx_m / 1000.0 / km_per_deg_lon(lats[p])

            lats[p] += dlat
            lons[p] += dlon

        positions[step, :, 0] = lats
        positions[step, :, 1] = lons
        timestamps_hours[step] = t_hours

    return positions, timestamps_hours


def bounding_footprint(positions, step=-1, percentile=90):
    """Returns a rough (lat_min, lat_max, lon_min, lon_max) footprint of the spill
    cloud at a given step, trimming outlier particles at the given percentile."""
    lats = positions[step, :, 0]
    lons = positions[step, :, 1]
    lo, hi = (100 - percentile) / 2, 100 - (100 - percentile) / 2
    return (
        np.percentile(lats, lo), np.percentile(lats, hi),
        np.percentile(lons, lo), np.percentile(lons, hi),
    )
