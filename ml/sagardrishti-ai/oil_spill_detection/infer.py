"""
Run inference with a trained U-Net checkpoint on a single SAR image.

Usage:
    python oil_spill_detection/infer.py --checkpoint checkpoints/unet_best.pt --image path/to/image.png
Outputs:
    <image>_mask.png       -- binary predicted mask
    <image>_overlay.png    -- original image with predicted spill region overlaid in red
Also prints estimated spill area (in pixels, and km^2 if --pixel_size_m is given) and mean confidence.
"""
import argparse
import os
import sys

import cv2
import numpy as np
import torch

sys.path.append(os.path.dirname(__file__))
from model import UNet


def load_model(checkpoint_path, device):
    ckpt = torch.load(checkpoint_path, map_location=device)
    model = UNet(base_channels=ckpt.get("base_channels", 32)).to(device)
    model.load_state_dict(ckpt["model_state_dict"])
    model.eval()
    return model, ckpt.get("img_size", 256)


def run_inference(model, image_path, img_size, device, threshold=0.5):
    orig = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if orig is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    orig_h, orig_w = orig.shape

    resized = cv2.resize(orig, (img_size, img_size)).astype(np.float32) / 255.0
    tensor = torch.from_numpy(resized[np.newaxis, np.newaxis, :, :]).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.sigmoid(logits)[0, 0].cpu().numpy()

    mask = (probs > threshold).astype(np.uint8) * 255
    mask_full = cv2.resize(mask, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)
    probs_full = cv2.resize(probs, (orig_w, orig_h))

    return mask_full, probs_full


def make_overlay(orig_gray, mask):
    color = cv2.cvtColor(orig_gray, cv2.COLOR_GRAY2BGR)
    red = np.zeros_like(color)
    red[:, :, 2] = mask
    overlay = cv2.addWeighted(color, 1.0, red, 0.5, 0)
    return overlay


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--image", required=True)
    parser.add_argument("--threshold", type=float, default=0.5)
    parser.add_argument("--pixel_size_m", type=float, default=None,
                         help="Ground resolution in meters/pixel, if known, to estimate area in km^2")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, img_size = load_model(args.checkpoint, device)

    mask, probs = run_inference(model, args.image, img_size, device, args.threshold)

    orig_gray = cv2.imread(args.image, cv2.IMREAD_GRAYSCALE)
    overlay = make_overlay(orig_gray, mask)

    base = os.path.splitext(args.image)[0]
    cv2.imwrite(f"{base}_mask.png", mask)
    cv2.imwrite(f"{base}_overlay.png", overlay)

    spill_pixels = int((mask > 0).sum())
    total_pixels = mask.size
    mean_confidence = float(probs[mask > 0].mean()) if spill_pixels > 0 else 0.0

    print(f"Spill pixels: {spill_pixels} / {total_pixels} ({100*spill_pixels/total_pixels:.2f}%)")
    print(f"Mean confidence over detected region: {mean_confidence:.3f}")
    if args.pixel_size_m:
        area_km2 = spill_pixels * (args.pixel_size_m ** 2) / 1e6
        print(f"Estimated spill area: {area_km2:.3f} km^2")
    print(f"Saved: {base}_mask.png, {base}_overlay.png")
