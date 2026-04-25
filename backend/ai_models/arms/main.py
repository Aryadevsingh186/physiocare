import cv2
import numpy as np
import tensorflow as tf
import joblib
import pandas as pd

from rep_segmenter import RepBuffer
from dataset_logger import log_rep
from angle_utils import calculate_angle

# -------------------------------
# Load MoveNet
# -------------------------------
interpreter = tf.lite.Interpreter(model_path="movenet.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
input_height, input_width = input_details[0]['shape'][1:3]

# -------------------------------
# Load Model
# -------------------------------
model = joblib.load("arm_svm_model.pkl")
le = joblib.load("arm_label_encoder.pkl")

# ✅ MUST match your dataset EXACTLY
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

        # -------------------------------
        # Angles (for display only)
        # -------------------------------
        l_angle = calculate_angle(l_sh, l_el, l_wr)
        r_angle = calculate_angle(r_sh, r_el, r_wr)

        cv2.putText(frame, f"L Elbow: {int(l_angle)}°", (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)
        cv2.putText(frame, f"R Elbow: {int(r_angle)}°", (30, 90),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)

        # -------------------------------
        # Collect Frames
        # -------------------------------
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
        # Draw skeleton
        # -------------------------------
        pairs = [
            (KP["l_shoulder"], KP["l_elbow"]),
            (KP["l_elbow"], KP["l_wrist"]),
            (KP["r_shoulder"], KP["r_elbow"]),
            (KP["r_elbow"], KP["r_wrist"]),
            (KP["l_shoulder"], KP["r_shoulder"]),
            (KP["l_hip"], KP["r_hip"])
        ]

        for a, b in pairs:
            pa = get_point(keypoints, a, w, h)
            pb = get_point(keypoints, b, w, h)
            cv2.line(frame, pa, pb, (0,255,0), 2)

    else:
        cv2.putText(frame, "Show full upper body",
                    (50, 400), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

    # -------------------------------
    # Display Prediction
    # -------------------------------
    cv2.imshow("Arm Raise Live Feedback", frame)
    key = cv2.waitKey(2) & 0xFF

    # -------------------------------
    # Controls
    # -------------------------------
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

        rep_df = pd.DataFrame([features])

        # Safety check
        for col in FEATURE_ORDER:
            if col not in rep_df.columns:
                print(f"❌ Missing feature: {col}")

        if "label" in rep_df.columns:
            rep_df = rep_df.drop(columns=["label"])

        print("Features:", rep_df)  # DEBUG

        X = rep_df[FEATURE_ORDER].values
        pred = model.predict(X)
        pred_label = le.inverse_transform(pred)[0]

        print("✅ Live feedback:", pred_label)

        # Display on screen
        cv2.putText(frame, f"Form: {pred_label}",
                    (50,150), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0,255,0), 3)

        log_rep(features)

        buffer = None

cap.release()
cv2.destroyAllWindows()