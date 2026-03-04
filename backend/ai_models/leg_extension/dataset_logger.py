import csv
import os

FILE = "leg_extension_data.csv"
FIELDNAMES = [
    "r_knee_angle_range", "l_knee_angle_range", 
    "r_ankle_y_range", "l_ankle_y_range", 
    "hip_stability_var", "knee_hip_dx_mean", 
    "frames", "label"
]

def log_rep(features):
    if not features: return
    file_exists = os.path.isfile(FILE)
    with open(FILE, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        if not file_exists:
            writer.writeheader()
        writer.writerow(features)