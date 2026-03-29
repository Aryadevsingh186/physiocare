import csv
import os

FILE = "arm_raise_dataset_1.csv"

FIELDNAMES = [
    "r_shoulder_range",
    "l_shoulder_range",
    "r_elbow_avg",
    "l_elbow_avg",
    "wrist_y_range",
    "shoulder_asymmetry",
    "torso_angle_mean",
    "frames",
    "label"
]

def log_rep(features):
    if features is None:
        return

    file_exists = os.path.isfile(FILE)

    with open(FILE, "a", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=FIELDNAMES,
            extrasaction="ignore"
        )

        if not file_exists:
            writer.writeheader()

        writer.writerow(features)