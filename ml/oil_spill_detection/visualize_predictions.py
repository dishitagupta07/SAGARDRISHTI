
import os
import sys
import torch
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(os.path.dirname(__file__))

from dataset import OilSpillDataset
from model import UNet


# -----------------------------
# Settings
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

data_dir = "data/spill_dataset_test"
checkpoint_path = "checkpoints/unet_best.pt"
output_dir = "oil_spill_detection/predictions"

os.makedirs(output_dir, exist_ok=True)


# -----------------------------
# Load dataset
# -----------------------------
dataset = OilSpillDataset(
    data_dir,
    img_size=256,
    augment=False
)


# -----------------------------
# Load trained model
# -----------------------------
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

print("Using device:", device)
print("Generating predictions...")


# -----------------------------
# Generate visualizations
# -----------------------------
for i in range(len(dataset)):

    image, mask = dataset[i]

    input_tensor = torch.tensor(
        image,
        dtype=torch.float32
    ).unsqueeze(0).to(device)

    with torch.no_grad():

        logits = model(input_tensor)

        probability = torch.sigmoid(logits)[0, 0].cpu().numpy()

    prediction = probability > 0.5

    # -------------------------
    # Plot
    # -------------------------
    fig, axes = plt.subplots(
        1,
        3,
        figsize=(15, 5)
    )

    # SAR image
    axes[0].imshow(
        image[0],
        cmap="gray"
    )
    axes[0].set_title("SAR Image")
    axes[0].axis("off")

    # Ground truth
    axes[1].imshow(
        mask[0],
        cmap="gray"
    )
    axes[1].set_title("Ground Truth")
    axes[1].axis("off")

    # Prediction
    axes[2].imshow(
        prediction,
        cmap="gray"
    )
    axes[2].set_title("U-Net Prediction")
    axes[2].axis("off")

    plt.tight_layout()

    save_path = os.path.join(
        output_dir,
        f"prediction_{i+1}.png"
    )

    plt.savefig(
        save_path,
        dpi=150,
        bbox_inches="tight"
    )

    plt.close()

    print("Saved:", save_path)

print("\nDone!")
