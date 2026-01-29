# utils/curl_logger.py
import csv
import numpy as np

CSV_FILE = "bicep_feedback_dataset.csv"

# ---------------------------
# Rule-based labeling
# ---------------------------
def assign_label(angle_buffer, flexion_threshold=60, extension_threshold=150):
    min_angle = min(angle_buffer)
    max_angle = max(angle_buffer)

    if min_angle < flexion_threshold and max_angle > extension_threshold:
        return "perfect"
    elif min_angle < (flexion_threshold + 5) and max_angle > (extension_threshold - 10):
        return "partial"
    else:
        return "imperfect"

# ---------------------------
# Speed calculation
# ---------------------------
def calculate_speed(angle_buffer):
    if len(angle_buffer) < 2:
        return 0.0
    diffs = [abs(angle_buffer[i] - angle_buffer[i-1])
             for i in range(1, len(angle_buffer))]
    return float(np.mean(diffs))  # degrees per frame

# ---------------------------
# Logging function
# ---------------------------
def log_curl(side, angle_buffer, rep_count):
    if len(angle_buffer) == 0:
        return

    min_angle = float(np.min(angle_buffer))
    max_angle = float(np.max(angle_buffer))
    mean_angle = float(np.mean(angle_buffer))
    speed = calculate_speed(angle_buffer)

    duration_flexion = int(sum(a < 65 for a in angle_buffer))
    duration_extension = int(sum(a > 100 for a in angle_buffer))

    label = assign_label(angle_buffer)

    row = {
        "side": side,
        "rep_count": rep_count,
        "min_angle": min_angle,
        "max_angle": max_angle,
        "mean_angle": mean_angle,
        "speed": speed,
        "duration_flexion": duration_flexion,
        "duration_extension": duration_extension,
        "label": label
    }

    with open(CSV_FILE, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=row.keys())
        if f.tell() == 0:
            writer.writeheader()
        writer.writerow(row)

    print(f"Logged curl → {side} | rep {rep_count} | {label} | speed={speed:.2f}")
