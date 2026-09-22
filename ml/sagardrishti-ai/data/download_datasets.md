# Getting real data

## 1. Oil spill SAR imagery (for `oil_spill_detection/`)

Best options, easiest first:

- **Kaggle "Oil Spill Detection" dataset** (SAR images + binary segmentation masks, already
  preprocessed, good for a first working model):
  search "oil spill detection dataset SAR Kaggle" — download via `kaggle datasets download`.
  Expected layout after download:
  ```
  data/spill_dataset/
    images/  *.png or *.jpg   (SAR image chips)
    masks/   *.png            (binary mask, same filename as image, white = oil)
  ```
  This matches what `oil_spill_detection/dataset.py` expects out of the box.

- **Copernicus Sentinel-1 (raw, for later / real deployment)**:
  https://dataspace.copernicus.eu — free ESA account, download GRD products over your area of
  interest (e.g. Chennai / East Coast of India per your reference paper). Needs preprocessing
  (calibration, speckle filtering, land masking) before it looks like the Kaggle chips — use
  `snappy`/SNAP or `asf_search` + `rasterio` for this. Do this only once the simple pipeline works.

- The link in your slide (`share.google/UIwU378Dahb48RpHs`) — open it directly in a browser on your
  machine; Claude can't fetch Google Drive share links.

## 2. AIS vessel data (for `vessel_attribution/`)

- **MarineCadastre AIS data**: https://hub.marinecadastre.gov/pages/vesseltraffic — free, by
  region/year, CSV format with `MMSI, BaseDateTime, LAT, LON, SOG, COG, Heading, VesselName, VesselType`.
- Until you download this, use `data/generate_synthetic_ais.py` — it produces AIS tracks and a spill
  event with the exact same column schema, so your attribution code doesn't need to change later.

## 3. Wind / ocean current data (for `trajectory_prediction/`)

- **ERA5 (wind)**: https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels — free,
  needs a CDS API key. Pull `10m_u_component_of_wind` and `10m_v_component_of_wind`.
- **Ocean currents**: Copernicus Marine Service (CMEMS) — https://data.marine.copernicus.eu —
  free account, global ocean physics reanalysis product gives u/v current velocity.
- Until you have these, `trajectory_prediction/drift_model.py` can run with a synthetic constant or
  sinusoidal current/wind field (built in) so you can demo the physics immediately.

## Practical tip for the hackathon

Don't block the demo on real data. Get the synthetic pipeline working end-to-end first (detection →
trajectory → attribution → report), record that as your safety-net demo, then swap in real data
wherever you have time.
