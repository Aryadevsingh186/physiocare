import cv2
import numpy as np
import tensorflow as tf
import joblib
import pandas as pd

from rep_segmenter import RepBuffer
from dataset_logger import log_rep
from angle_utils import calculate_angle

# -------------------------------
# Load MoveNet TFLite
# -------------------------------
interpreter = tf.lite.Interpreter(model_path="movenet.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
input_height, input_width = input_details[0]['shape'][1:3]

# -------------------------------
# Load trained SVM pipeline
# -------------------------------
model = joblib.load("rep_svm_model.pkl")  # pipeline: scaler + SVC
le = joblib.load("label_encoder.pkl")

FEATURE_ORDER = [
    "r_wrist_y_range",
    "l_wrist_y_range",
    "hip_y_range",
    "neck_hip_angle_mean",
    "neck_forward_shift",
    "frames",
    "r_elbow_shoulder_dx_mean",
    "l_elbow_shoulder_dx_mean",
    "r_elbow_range",
    "l_elbow_range",
]

# -------------------------------
# MoveNet helpers
# -------------------------------
def run_movenet(frame):
    h, w, _ = frame.shape
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img = tf.image.resize_with_pad(np.expand_dims(img, axis=0), input_height, input_width)
    img = tf.cast(img, dtype=tf.float32)

    interpreter.set_tensor(input_details[0]['index'], img.numpy())
    interpreter.invoke()
    keypoints = interpreter.get_tensor(output_details[0]['index'])[0][0]
    return keypoints, w, h

def get_point(kp, idx, w, h):
    return (int(kp[idx][1] * w), int(kp[idx][0] * h))

# -------------------------------
# Keypoints index
# -------------------------------
KP = {
    "nose": 0,
    "l_shoulder": 5, "r_shoulder": 6,
    "l_elbow": 7, "r_elbow": 8,
    "l_wrist": 9, "r_wrist": 10,
    "l_hip": 11, "r_hip": 12
}

# -------------------------------
# Camera & state
# -------------------------------
cap = cv2.VideoCapture(0)
collecting = False
buffer = None
frame_id = 0
FRAME_SKIP = 3
CONF_THRESH = 0.4

print("Press 's' to START rep, 'e' to END rep, ESC to quit")

# -------------------------------
# Main loop
# -------------------------------
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    keypoints, w, h = run_movenet(frame)

    required = [
        KP["r_shoulder"], KP["r_elbow"], KP["r_wrist"], KP["r_hip"],
        KP["l_shoulder"], KP["l_elbow"], KP["l_wrist"], KP["l_hip"],
        KP["nose"]
    ]

    if all(keypoints[i][2] > CONF_THRESH for i in required):

        r_sh, r_el, r_wr, r_hp = [get_point(keypoints, KP[x], w, h) for x in ["r_shoulder","r_elbow","r_wrist","r_hip"]]
        l_sh, l_el, l_wr, l_hp = [get_point(keypoints, KP[x], w, h) for x in ["l_shoulder","l_elbow","l_wrist","l_hip"]]
        neck = get_point(keypoints, KP["nose"], w, h)

        # Display elbow angles
        r_angle = calculate_angle(r_sh, r_el, r_wr)
        l_angle = calculate_angle(l_sh, l_el, l_wr)
        cv2.putText(frame, f"R: {int(r_angle)}°", (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)
        cv2.putText(frame, f"L: {int(l_angle)}°", (30, 90),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)

        # -------------------------------
        # Collect frames
        # -------------------------------
        if collecting:
            frame_id += 1
            if frame_id % FRAME_SKIP == 0:
                buffer.add_frame(r_sh, r_el, r_wr, r_hp,
                                 l_sh, l_el, l_wr, l_hp,
                                 neck)

        # Draw skeleton
        pairs = [
            (KP["r_shoulder"], KP["r_elbow"]),
            (KP["r_elbow"], KP["r_wrist"]),
            (KP["l_shoulder"], KP["l_elbow"]),
            (KP["l_elbow"], KP["l_wrist"]),
            (KP["l_shoulder"], KP["r_shoulder"]),
            (KP["l_hip"], KP["r_hip"])
        ]
        for a, b in pairs:
            pa = get_point(keypoints, a, w, h)
            pb = get_point(keypoints, b, w, h)
            cv2.line(frame, pa, pb, (0,255,0), 2)

    else:
        cv2.putText(frame, "Move fully into frame", (50, 400),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

    cv2.imshow("MoveNet Live Feedback", frame)
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
        print("Started rep collection")

    elif key == ord('e') and collecting:
        collecting = False
        print("Ended rep. Predicting...")

        # Get features from rep
        features = buffer.summarize("NA")  # label placeholder

        # Convert to DataFrame
        rep_df = pd.DataFrame([features])
        if "label" in rep_df.columns:
            rep_df = rep_df.drop(columns=["label"])
        X = rep_df[FEATURE_ORDER].values

        # Predict using SVM pipeline (with scaling)
        pred = model.predict(X)
        pred_label = le.inverse_transform(pred)[0]
        print("Live feedback:", pred_label)

        # Optional logging
        log_rep(features)

        buffer = None

cap.release()
cv2.destroyAllWindows()
