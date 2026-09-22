# SAGARDRISHTI — AI/ML Core (Team Piranhas, SIH 2026, PS 26143)

Starter implementation of the three AI/ML components described in the pitch deck:

1. **Oil spill detection** — U-Net semantic segmentation on Sentinel-1 SAR imagery
2. **Vessel attribution engine** — percentage-based scoring of which vessel likely caused a spill, using AIS data
3. **Trajectory / drift prediction** — simple Lagrangian particle drift model driven by wind + current data

This is a *working baseline*, not the final production system — the goal is something you can run,
demo, and iterate on before the hackathon.

## Folder structure

```
sagardrishti-ai/
├── data/
│   ├── download_datasets.md      # where to get real data
│   └── generate_synthetic_ais.py # makes fake AIS + spill data so you can test NOW
├── oil_spill_detection/
│   ├── dataset.py                # PyTorch Dataset for SAR image + mask pairs
│   ├── model.py                  # U-Net architecture
│   ├── train.py                  # training loop
│   └── infer.py                  # run inference on a new SAR image
├── vessel_attribution/
│   ├── attribution_engine.py     # core scoring logic (spatial+temporal+behavioural)
│   └── demo.py                   # runnable demo with synthetic data
└── trajectory_prediction/
    ├── drift_model.py            # wind+current driven particle drift simulator
    └── demo.py                   # runnable demo
```

## Quick start (no real data needed yet)

```bash
pip install -r requirements.txt

# 1. Generate synthetic AIS + spill data so you can test the pipeline end-to-end
python data/generate_synthetic_ais.py

# 2. Run the vessel attribution demo
python vessel_attribution/demo.py

# 3. Run the trajectory prediction demo
python trajectory_prediction/demo.py

# 4. Oil spill detection needs real SAR images — see data/download_datasets.md,
#    then:
python oil_spill_detection/train.py --data_dir data/spill_dataset --epochs 20
python oil_spill_detection/infer.py --checkpoint checkpoints/unet_best.pt --image path/to/sar_image.png
```

## Integration handoff — what your teammate needs

**She never touches PyTorch, pandas, or any AI/ML internals.** Each component has a stable
function-level contract (`*/api.py`), and all three are also exposed over HTTP via `main_api.py`.

### Run the service she'll integrate against

```bash
pip install fastapi uvicorn python-multipart
python main_api.py          # or: uvicorn main_api:app --reload --port 8001
```

Then open `http://localhost:8001/docs` for interactive Swagger docs (auto-generated).

### Endpoints

| Endpoint | Method | Input | Output |
|---|---|---|---|
| `/detect-spill` | POST (multipart) | SAR image file | `{spill_detected, confidence, estimated_area_km2, mask_path, overlay_path, bbox}` |
| `/attribute-vessel` | POST (JSON) | `{ais_csv_path, spill_lat, spill_lon, spill_time}` | `{ranked_vessels: [...], ruled_out_vessels: [...]}` |
| `/predict-trajectory` | POST (JSON) | `{origin_lat, origin_lon, forward_hours, backward_hours}` | `{forward: [...], backward: [...], footprint_summary: {...}}` |

Exact field names and types are documented as docstrings at the top of each `*/api.py` file
— that docstring is the contract. If the AI/ML internals change (better model, real
OpenDrift, tuned weights), the contract stays the same, so her integration code doesn't
need to change.

### What's ready now vs. needs your training run

- `/attribute-vessel` and `/predict-trajectory` work today with no training — she can
  integrate against them immediately using the synthetic data (`data/generate_synthetic_ais.py`).
- `/detect-spill` returns HTTP 503 with a clear message until a trained checkpoint exists at
  `checkpoints/unet_best.pt`. Once you've trained on real SAR data, it "just works" —
  no code change needed on her end.

## Notes on scope for the hackathon demo

- The U-Net here is intentionally small (fewer channels) so it trains fast on a laptop/Colab GPU.
  Swap in a deeper encoder (ResNet34 backbone, etc.) once you have a working end-to-end demo.
- The vessel attribution engine is rule-based + weighted scoring, which is actually a *feature* for
  a hackathon: it's explainable out of the box, matching your "Explainable Vessel Attribution" pitch.
  You can later replace the weighted sum with a trained classifier (e.g. gradient boosting) using the
  same features if you want a learned model.
- The drift model is a simplified physics-based simulator (advect particles by current + wind), not
  a full OpenDrift install. It's enough for a convincing demo and trajectory heatmap; swap in real
  OpenDrift if you have time before the deadline.
