"""
Stable integration interface for oil spill detection.

Your teammate (or any backend service) should only ever call `detect_spill()`.
Everything about the model (architecture, checkpoint format, pre/post-processing)
can change without breaking her code, as long as this function's input/output
contract stays the same.

CONTRACT
--------
detect_spill(image_path, checkpoint_path) -> dict:
{
    "spill_detected": bool,
    "confidence": float,          # 0-1, mean model confidence over detected region
    "estimated_area_km2": float or None,   # None if pixel_size_m not provided
    "spill_pixel_fraction": float,         # fraction of image classified as spill, 0-1
    "mask_path": str,             # path to saved binary mask PNG
    "overlay_path": str,          # path to saved visual overlay PNG
    "bbox": [lat_min, lat_max, lon_min, lon_max] or None,  # only if geo-referencing given
}

If no trained checkpoint exists yet, this raises a clear FileNotFoundError rather than
failing silently -- integration code should catch this and show "model not ready" in the UI.
"""
import os
import sys

sys.path.append(os.path.dirname(__file__))


def detect_spill(image_path, checkpoint_path="checkpoints/unet_best.pt",
                  pixel_size_m=None, threshold=0.5, geo_bounds=None):
    """
    geo_bounds: optional (lat_min, lat_max, lon_min, lon_max) of the input image, if you
                want the returned bbox mapped back to real coordinates instead of pixels.
    """
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(
            f"No trained model found at '{checkpoint_path}'. "
            "Train one first with oil_spill_detection/train.py, or point checkpoint_path "
            "at an existing checkpoint."
        )

    import torch
    import numpy as np
    from infer import load_model, run_inference, make_overlay
    import cv2

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, img_size = load_model(checkpoint_path, device)
    mask, probs = run_inference(model, image_path, img_size, device, threshold)

    orig_gray = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    overlay = make_overlay(orig_gray, mask)

    base = os.path.splitext(image_path)[0]
    mask_path = f"{base}_mask.png"
    overlay_path = f"{base}_overlay.png"
    cv2.imwrite(mask_path, mask)
    cv2.imwrite(overlay_path, overlay)

    spill_pixels = int((mask > 0).sum())
    total_pixels = mask.size
    fraction = spill_pixels / total_pixels
    confidence = float(probs[mask > 0].mean()) if spill_pixels > 0 else 0.0

    area_km2 = None
    if pixel_size_m:
        area_km2 = round(spill_pixels * (pixel_size_m ** 2) / 1e6, 4)

    bbox = None
    if geo_bounds and spill_pixels > 0:
        ys, xs = np.where(mask > 0)
        h, w = mask.shape
        lat_min, lat_max, lon_min, lon_max = geo_bounds
        # image row 0 = lat_max (top), row h = lat_min (bottom), assuming north-up image
        lat_top = lat_max - (ys.min() / h) * (lat_max - lat_min)
        lat_bottom = lat_max - (ys.max() / h) * (lat_max - lat_min)
        lon_left = lon_min + (xs.min() / w) * (lon_max - lon_min)
        lon_right = lon_min + (xs.max() / w) * (lon_max - lon_min)
        bbox = [round(lat_bottom, 5), round(lat_top, 5), round(lon_left, 5), round(lon_right, 5)]

    return {
        "spill_detected": spill_pixels > 0,
        "confidence": round(confidence, 3),
        "estimated_area_km2": area_km2,
        "spill_pixel_fraction": round(fraction, 4),
        "mask_path": mask_path,
        "overlay_path": overlay_path,
        "bbox": bbox,
    }


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--checkpoint", default="checkpoints/unet_best.pt")
    args = parser.parse_args()
    result = detect_spill(args.image, args.checkpoint)
    import json
    print(json.dumps(result, indent=2))
