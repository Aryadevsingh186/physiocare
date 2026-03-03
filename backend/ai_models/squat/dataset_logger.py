# dataset_logger.py
import csv
import os

FILE = "edited.csv"

FIELDNAMES = [
    # Knee metrics
    "r_knee_range",
    "l_knee_range",
    "r_knee_avg",
    "l_knee_avg",
    "knee_asymmetry",
    # Hip metrics
    "r_hip_range",
    "l_hip_range",
    "r_hip_avg",
    "l_hip_avg",
    "hip_asymmetry",
    # Ankle metrics
    "r_ankle_avg",
    "l_ankle_avg",
    # Posture (torso)
    "torso_angle_mean",
    "torso_angle_max",
    # Depth
    "hip_y_range",
    "knee_depth_left",
    "knee_depth_right",
    # Alignment
    "knee_width_mean",
    "hip_width_mean",
    # Timing
    "frames",
    # Label
    "label"
]

def log_rep(features):
    if features is None:
        return  # safety

    file_exists = os.path.isfile(FILE)

    with open(FILE, "a", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=FIELDNAMES,
            extrasaction="ignore"  # IMPORTANT safety
        )

        if not file_exists:
            writer.writeheader()

        writer.writerow(features)
