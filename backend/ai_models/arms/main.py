import cv2
import numpy as np
import tensorflow as tf
import joblib
import pandas as pd

from rep_segmenter import RepBuffer
from dataset_logger import log_rep
from angle_utils import calculate_angle
from collections import deque

# -------------------------------
# Load MoveNet
# -------------------------------
interpreter = tf.lite.Interpreter(model_path="movenet.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
input_height, input_width = input_details[0]['shape'][1:3]

# -------------------------------
# Load Model (UPDATED ONLY)
# -------------------------------
model = joblib.load("arm_hgb_model.pkl")
le = joblib.load("arm_label_encoder.pkl")

pred_history = deque(maxlen=5)

FEATURE_ORDER = [
    "r_shoulder_range",
    "l_shoulder_range",
    "r_elbow_avg",
    "l_elbow_avg",
    "wrist_y_range",
    "shoulder_asymmetry",
    "torso_angle_mean",
    "frames"
]

# -------------------------------
# Keypoints
# -------------------------------
KP = {
    "nose": 0,
    "l_shoulder": 5, "r_shoulder": 6,
    "l_elbow": 7, "r_elbow": 8,
    "l_wrist": 9, "r_wrist": 10,
    "l_hip": 11, "r_hip": 12
}

# -------------------------------
# NEW: Skeleton helpers (FROM YOUR COLLECTOR)
# -------------------------------
def draw_keypoints(frame, keypoints, threshold=0.4):
    h, w, _ = frame.shape
    for kp in keypoints:
        y, x, conf = kp
        if conf > threshold:
            cx, cy = int(x * w), int(y * h)
            cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)


def draw_connections(frame, keypoints, pairs, threshold=0.4):
    h, w, _ = frame.shape
    for p1, p2 in pairs:
        if keypoints[p1][2] > threshold and keypoints[p2][2] > threshold:
            x1, y1 = int(keypoints[p1][1] * w), int(keypoints[p1][0] * h)
            x2, y2 = int(keypoints[p2][1] * w), int(keypoints[p2][0] * h)
            cv2.line(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)

# -------------------------------
# Helpers
# -------------------------------
def run_movenet(frame):
    h, w, _ = frame.shape
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img = tf.image.resize_with_pad(np.expand_dims(img, axis=0),
                                   input_height, input_width)
    img = tf.cast(img, dtype=tf.float32)

    interpreter.set_tensor(input_details[0]['index'], img.numpy())
    interpreter.invoke()

    keypoints = interpreter.get_tensor(output_details[0]['index'])[0][0]
    return keypoints, w, h


def get_point(kp, idx, w, h):
    return (int(kp[idx][1] * w), int(kp[idx][0] * h))


# -------------------------------
# Camera
# -------------------------------
cap = cv2.VideoCapture(0)

collecting = False
buffer = None
frame_id = 0
FRAME_SKIP = 3
CONF_THRESH = 0.2

print("Press 's' to START rep, 'e' to END rep, ESC to quit")

# -------------------------------
# Main Loop
# -------------------------------
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    keypoints, w, h = run_movenet(frame)

    required = [
        KP["l_shoulder"], KP["r_shoulder"],
        KP["l_elbow"], KP["r_elbow"],
        KP["l_wrist"], KP["r_wrist"],
        KP["l_hip"], KP["r_hip"]
    ]

    display = frame.copy()

    if all(keypoints[i][2] > CONF_THRESH for i in required):

        # Points
        l_sh = get_point(keypoints, KP["l_shoulder"], w, h)
        r_sh = get_point(keypoints, KP["r_shoulder"], w, h)
        l_el = get_point(keypoints, KP["l_elbow"], w, h)
        r_el = get_point(keypoints, KP["r_elbow"], w, h)
        l_wr = get_point(keypoints, KP["l_wrist"], w, h)
        r_wr = get_point(keypoints, KP["r_wrist"], w, h)
        l_hp = get_point(keypoints, KP["l_hip"], w, h)
        r_hp = get_point(keypoints, KP["r_hip"], w, h)

        # Angles (display only)
        l_angle = calculate_angle(l_sh, l_el, l_wr)
        r_angle = calculate_angle(r_sh, r_el, r_wr)

        cv2.putText(display, f"L Elbow: {int(l_angle)}°", (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)
        cv2.putText(display, f"R Elbow: {int(r_angle)}°", (30, 90),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)

        # Collect Frames
        if collecting:
            frame_id += 1
            if frame_id % FRAME_SKIP == 0:
                buffer.add_frame(
                    l_sh, r_sh,
                    l_el, r_el,
                    l_wr, r_wr,
                    l_hp, r_hp
                )

        # -------------------------------
        # 🔥 SKELETON (REPLACED FROM COLLECTOR)
        # -------------------------------
        draw_keypoints(display, keypoints)

        draw_connections(display, keypoints, [
            (KP["l_shoulder"], KP["l_elbow"]),
            (KP["l_elbow"], KP["l_wrist"]),
            (KP["r_shoulder"], KP["r_elbow"]),
            (KP["r_elbow"], KP["r_wrist"]),
            (KP["l_shoulder"], KP["r_shoulder"]),
            (KP["l_hip"], KP["r_hip"])
        ])

    else:
        cv2.putText(display, "Show full upper body",
                    (50, 400), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

    cv2.imshow("Arm Raise Live Feedback", display)
    key = cv2.waitKey(2) & 0xFF

    if key == 27:
        break

    elif key == ord('s') and not collecting:
        collecting = True
        buffer = RepBuffer()
        frame_id = 0
        print("▶ Started rep")

    elif key == ord('e') and collecting:
        collecting = False
        print("⏸ Ended rep. Predicting...")

        features = buffer.summarize("NA")

        if features is None:
            print("No rep detected")
            continue

        rep_df = pd.DataFrame([features])

        if "label" in rep_df.columns:
            rep_df = rep_df.drop(columns=["label"])

        X = rep_df[FEATURE_ORDER].values.reshape(1, -1)

        pred = model.predict(X)[0]
        pred_label_raw = le.inverse_transform([pred])[0]

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X)[0]
            confidence = np.max(probs)
        else:
            confidence = None

        pred_history.append(pred_label_raw)
        pred_label = max(set(pred_history), key=list(pred_history).count)

        l_range = rep_df["l_shoulder_range"].values[0]
        r_range = rep_df["r_shoulder_range"].values[0]
        wrist_range = rep_df["wrist_y_range"].values[0]
        torso = rep_df["torso_angle_mean"].values[0]

        rule_label = pred_label

        if wrist_range < 30:
            rule_label = "LOW_RANGE"
        elif abs(torso) > 25:
            rule_label = "BAD_POSTURE"
        elif abs(l_range - r_range) > 20:
            rule_label = "ASYMMETRY"

        if confidence is not None and confidence < 0.55:
            feedback = rule_label
        else:
            feedback = pred_label

        print("\n===== RESULT =====")
        print("Model:", pred_label)
        print("Final Feedback:", feedback)
        if confidence:
            print("Confidence:", confidence)

        cv2.putText(display, f"Form: {feedback} ({pred_label})",
                    (50, 150),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (0, 255, 0),
                    3)

        log_rep(features)
        buffer = None

cap.release()
cv2.destroyAllWindows()