
import os
import sys
import torch
import numpy as np
from torch.utils.data import DataLoader

sys.path.append(os.path.dirname(__file__))

from dataset import OilSpillDataset
from model import UNet


def calculate_metrics(pred, target):
    pred = pred.astype(bool)
    target = target.astype(bool)

    intersection = np.logical_and(pred, target).sum()
    union = np.logical_or(pred, target).sum()

    dice = (2 * intersection) / (
        pred.sum() + target.sum() + 1e-8
    )

    iou = intersection / (union + 1e-8)

    return dice, iou


def evaluate():

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    print("Using device:", device)

    data_dir = "data/spill_dataset_test"
    checkpoint_path = "checkpoints/unet_best.pt"

    dataset = OilSpillDataset(
        data_dir,
        img_size=256,
        augment=False
    )

    loader = DataLoader(
        dataset,
        batch_size=1,
        shuffle=False
    )

    checkpoint = torch.load(
        checkpoint_path,
        map_location=device
    )

    model = UNet(
        base_channels=checkpoint["base_channels"]
    ).to(device)

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model.eval()

    dice_scores = []
    iou_scores = []

    with torch.no_grad():

        for images, masks in loader:

            images = images.to(device)

            logits = model(images)

            probabilities = torch.sigmoid(logits)

            predictions = (
                probabilities > 0.5
            ).cpu().numpy()

            targets = masks.numpy()

            dice, iou = calculate_metrics(
                predictions[0, 0],
                targets[0, 0]
            )

            dice_scores.append(dice)
            iou_scores.append(iou)

    print("\n==============================")
    print("TEST RESULTS")
    print("==============================")

    print(
        f"Mean Dice: {np.mean(dice_scores):.4f}"
    )

    print(
        f"Mean IoU:  {np.mean(iou_scores):.4f}"
    )

    print("\nIndividual images:")

    for i, (dice, iou) in enumerate(
        zip(dice_scores, iou_scores), 1
    ):
        print(
            f"Image {i}: Dice={dice:.4f}, IoU={iou:.4f}"
        )


if __name__ == "__main__":
    evaluate()
