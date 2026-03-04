import cv2
import numpy as np
import tensorflow as tf
import joblib
import pandas as pd
from rep_segmenter import RepBuffer
from dataset_logger import log_rep
from angle_utils import calculate_angle

# -------------------------------
# 1. Load MoveNet TFLite
# -------------------------------
interpreter = tf.lite.Interpreter(model_path="movenet.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
input_height, input_width = input_details[0]['shape'][1:3]

# -------------------------------
# 2. Load trained SVM pipeline
# -------------------------------
# Ensure these filenames match what you saved in train.py
try:
    model = joblib.load("leg_extension_model.pkl") 
    le = joblib.load("leg_label_encoder.pkl")
except FileNotFoundError:
    print("Error: Model files not found. Please run train.py first.")
    exit()

# MUST match the keys in rep_segmenter.py summarize() method
FEATURE_ORDER = [
    "r_knee_angle_range",
    "l_knee_angle_range",
    "r_ankle_y_range",
    "l_ankle_y_range",
    "hip_stability_var",
    "knee_hip_dx_mean",
    "frames"
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
# Keypoints index (Lower Body)
# -------------------------------
KP = {
    "l_hip": 11, "r_hip": 12,
    "l_knee": 13, "r_knee": 14,
    "l_ankle": 15, "r_ankle": 16
}

# -------------------------------
# Camera & state
# -------------------------------
cap = cv2.VideoCapture(0)
collecting = False
buffer = None
frame_id = 0
FRAME_SKIP = 3
CONF_THRESH = 0.25 # Matches your collector sensitivity
last_feedback = "Waiting..."

print("--- LEG EXTENSION LIVE AI COACH ---")
print("Press 's' to START rep, 'e' to END rep, ESC to quit")

# -------------------------------
# Main loop
# -------------------------------
while True:
    ret, frame = cap.read()
    if not ret: break

    frame = cv2.flip(frame, 1)
    keypoints, w, h = run_movenet(frame)
    display_frame = frame.copy()

    # Required points for leg extension logic
    required = [KP["r_hip"], KP["r_knee"], KP["r_ankle"]]

    if all(keypoints[i][2] > CONF_THRESH for i in required):
        # Extract points
        r_hp, r_kn, r_ak = [get_point(keypoints, KP[x], w, h) for x in ["r_hip","r_knee","r_ankle"]]
        l_hp, l_kn, l_ak = [get_point(keypoints, KP[x], w, h) for x in ["l_hip","l_knee","l_ankle"]]

        # Display Knee angle
        current_angle = calculate_angle(r_hp, r_kn, r_ak)
        cv2.putText(display_frame, f"Angle: {int(current_angle)}", (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Display Last Feedback
        color = (0, 255, 0) if last_feedback == "correct" else (0, 165, 255)
        cv2.putText(display_frame, f"Result: {last_feedback}", (30, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, color, 3)

        # -------------------------------
        # Collect frames during rep
        # -------------------------------
        if collecting:
            frame_id += 1
            if frame_id % FRAME_SKIP == 0:
                # Use left-side fallbacks if points are missing
                l_hp_final = get_point(keypoints, 11, w, h) if keypoints[11][2] > CONF_THRESH else r_hp
                l_kn_final = get_point(keypoints, 13, w, h) if keypoints[13][2] > CONF_THRESH else r_kn
                l_ak_final = get_point(keypoints, 15, w, h) if keypoints[15][2] > CONF_THRESH else r_ak
                
                buffer.add_frame(r_hp, r_kn, r_ak, l_hp_final, l_kn_final, l_ak_final)
            
            # Recording Dot
            cv2.circle(display_frame, (w - 30, 30), 10, (0, 0, 255), -1)

        # Draw Skeleton lines
        cv2.line(display_frame, r_hp, r_kn, (255, 0, 0), 2)
        cv2.line(display_frame, r_kn, r_ak, (255, 0, 0), 2)
        cv2.circle(display_frame, r_kn, 5, (0, 255, 0), -1)

    else:
        cv2.putText(display_frame, "Legs not visible", (50, 400),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    cv2.imshow("MoveNet Live Feedback", display_frame)
    key = cv2.waitKey(1) & 0xFF

    if key == 27: # ESC
        break

    elif key == ord('s') and not collecting:
        collecting = True
        buffer = RepBuffer()
        frame_id = 0
        last_feedback = "Recording..."
        print("Started rep collection")

    elif key == ord('e') and collecting:
        collecting = False
        print("Predicting...")

        # Get features
        raw_features = buffer.summarize("NA") 

        if raw_features and raw_features['frames'] > 5:
            # Convert to DataFrame to ensure correct column order
            rep_df = pd.DataFrame([raw_features])
            X = rep_df[FEATURE_ORDER].values

            # Predict
            pred = model.predict(X)
            last_feedback = le.inverse_transform(pred)[0]
            print(f"Prediction: {last_feedback}")
        else:
            last_feedback = "Rep too short"

        buffer = None

cap.release()
cv2.destroyAllWindows()