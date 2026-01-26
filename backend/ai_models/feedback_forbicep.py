feedback_engine.py
import numpy as np

FPS = 30   # change if your camera FPS is different

def generate_feedback(min_angle, rep_frames, left_reps, right_reps,
                      elbow_drift=None):
    fb = {
        "range": "",
        "speed": "",
        "symmetry": "",
        "fatigue": "",
        "form": ""
    }

    # ---------------- RANGE OF MOTION ----------------
    if min_angle < 55:
        fb["range"] = "Full curl"
    elif min_angle < 75:
        fb["range"] = "Partial curl"
    else:
        fb["range"] = "Not curling fully"

    # ---------------- SPEED ----------------
    rep_time = rep_frames / FPS

    if rep_time < 1:
        fb["speed"] = "Too fast"
    elif rep_time > 4:
        fb["speed"] = "Too slow"
    else:
        fb["speed"] = "Good tempo"

    # ---------------- SYMMETRY ----------------
    diff = abs(left_reps - right_reps)
    if diff == 0:
        fb["symmetry"] = "Balanced arms"
    elif diff <= 2:
        fb["symmetry"] = "Slight imbalance"
    else:
        fb["symmetry"] = "Major imbalance"

    # ---------------- FATIGUE (basic) ----------------
    if min_angle > 80:
        fb["fatigue"] = "Fatigue: losing range"
    else:
        fb["fatigue"] = "No fatigue"

    # ---------------- FORM (elbow cheat) ----------------
    if elbow_drift is not None:
        if elbow_drift > 40:
            fb["form"] = "Keep elbows stable"
        else:
            fb["form"] = "Good form"

    return fb