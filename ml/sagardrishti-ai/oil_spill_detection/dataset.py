"""
PyTorch Dataset for oil spill segmentation.

Expects:
    data_dir/
        images/  *.png or *.jpg   (SAR image chips, grayscale or RGB)
        masks/   *.png            (binary mask, same base filename, white=oil/255, black=background/0)

This matches the layout of the common Kaggle "oil spill detection" SAR datasets.
"""
import os
import glob
import numpy as np
import cv2
from torch.utils.data import Dataset


class OilSpillDataset(Dataset):
    def __init__(self, data_dir, img_size=256, augment=False):
        self.img_dir = os.path.join(data_dir, "images")
        self.mask_dir = os.path.join(data_dir, "masks")
        self.img_size = img_size
        self.augment = augment

        self.image_paths = sorted(
            glob.glob(os.path.join(self.img_dir, "*.png"))
            + glob.glob(os.path.join(self.img_dir, "*.jpg"))
        )
        if len(self.image_paths) == 0:
            raise FileNotFoundError(
                f"No images found in {self.img_dir}. "
                "See data/download_datasets.md for how to get the SAR dataset."
            )

    def __len__(self):
        return len(self.image_paths)

    def _mask_path_for(self, img_path):
        base = os.path.splitext(os.path.basename(img_path))[0]
        for ext in (".png", ".jpg"):
            candidate = os.path.join(self.mask_dir, base + ext)
            if os.path.exists(candidate):
                return candidate
        raise FileNotFoundError(f"No mask found for image {img_path}")

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        mask_path = self._mask_path_for(img_path)

        image = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)

        image = cv2.resize(image, (self.img_size, self.img_size))
        mask = cv2.resize(mask, (self.img_size, self.img_size), interpolation=cv2.INTER_NEAREST)

        if self.augment:
            if np.random.rand() < 0.5:
                image = np.fliplr(image).copy()
                mask = np.fliplr(mask).copy()
            if np.random.rand() < 0.5:
                image = np.flipud(image).copy()
                mask = np.flipud(mask).copy()

        image = image.astype(np.float32) / 255.0
        mask = (mask > 127).astype(np.float32)

        image = image[np.newaxis, :, :]   # (1, H, W)
        mask = mask[np.newaxis, :, :]     # (1, H, W)

        return image, mask
