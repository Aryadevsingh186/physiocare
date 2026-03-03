# dataset_collector.py
import cv2
import numpy as np
import tensorflow as tf

from rep_segmenter import RepBuffer
from dataset_logger import log_rep  # Make sure this writes as CSV with exact columns
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
# MoveNet helpers
# -------------------------------
def run_movenet(frame):
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img = tf.image.resize_with_pad(np.expand_dims(img, axis=0), input_height, input_width)
    img = tf.cast(img, dtype=tf.float32)
    interpreter.set_tensor(input_details[0]['index'], img.numpy())
    interpreter.invoke()
    keypoints = interpreter.get_tensor(output_details[0]['index'])[0][0]
    return keypoints

def get_point(kp, idx, w, h):
    return (int(kp[idx][1] * w), int(kp[idx][0] * h))

# -------------------------------
# MoveNet keypoints - Updated for Squat
# -------------------------------
KP = {
    "nose": 0,
    "l_shoulder": 5, "r_shoulder": 6,
    "l_hip": 11, "r_hip": 12,
    "l_knee": 13, "r_knee": 14,
    "l_ankle": 15, "r_ankle": 16
}

# -------------------------------
# Camera
# -------------------------------
cap = cv2.VideoCapture(0)

# -------------------------------
# Manual state
# -------------------------------
collecting = False
buffer = None
frame_id = 0
FRAME_SKIP = 3
CONF_THRESH = 0.4
pending_label = None

# -------------------------------
# Labels - Squat specific
# -------------------------------
label_map = {
    'c': 'correct',
    's': 'shallow_depth',
    'd': 'excessive_depth',
    'f': 'forward_lean',
    'k': 'knees_caving',
    'h': 'heels_up'
}

print("Press 's' to START a rep, 'e' to END a rep.")
print("After ending, press label key: c/s/d/f/k/h")
print("  c=correct, s=shallow, d=deep, f=forward_lean, k=knees_in, h=heels_up")
print("ESC to quit.")

# -------------------------------
# Main loop
# -------------------------------
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    frame_id += 1

    # Run MoveNet every frame
    keypoints = run_movenet(frame)
    display_frame = frame.copy()

    # Only require KNEES and ANKLES (stay visible when squatting down - hips disappear)
    required_leg = [
        KP["r_knee"], KP["r_ankle"],
        KP["l_knee"], KP["l_ankle"]
    ]
    
    hips_visible = keypoints[KP["r_hip"]][2] > CONF_THRESH and keypoints[KP["l_hip"]][2] > CONF_THRESH
    shoulders_visible = keypoints[KP["r_shoulder"]][2] > CONF_THRESH and keypoints[KP["l_shoulder"]][2] > CONF_THRESH

    if all(keypoints[i][2] > CONF_THRESH for i in required_leg):
        # Extract points for squat
        r_kn = get_point(keypoints, KP["r_knee"], w, h)
        r_an = get_point(keypoints, KP["r_ankle"], w, h)
        l_kn = get_point(keypoints, KP["l_knee"], w, h)
        l_an = get_point(keypoints, KP["l_ankle"], w, h)
        
        # Get shoulders
        r_sh = get_point(keypoints, KP["r_shoulder"], w, h) if shoulders_visible else (w//2 + 30, h//2 - 50)
        l_sh = get_point(keypoints, KP["l_shoulder"], w, h) if shoulders_visible else (w//2 - 30, h//2 - 50)
        
        # Get hips - if hidden (common in squat descent), estimate from knee + shoulder
        if hips_visible:
            r_hp = get_point(keypoints, KP["r_hip"], w, h)
            l_hp = get_point(keypoints, KP["l_hip"], w, h)
        else:
            # Estimate hip: between shoulder and knee
            r_hp = (r_sh[0], r_kn[1] - 60)
            l_hp = (l_sh[0], l_kn[1] - 60)
        
        neck = get_point(keypoints, KP["nose"], w, h) if keypoints[KP["nose"]][2] > CONF_THRESH else ((r_sh[0] + l_sh[0]) // 2, r_sh[1] - 40)

        # Display knee angles and posture
        r_knee_angle = calculate_angle(r_hp, r_kn, r_an)
        l_knee_angle = calculate_angle(l_hp, l_kn, l_an)
        torso_angle = calculate_angle(r_sh, (r_hp[0], r_hp[1]), (r_hp[0], r_hp[1] - 100))
        cv2.putText(display_frame, f"Right Knee: {int(r_knee_angle)}°", (30,50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0),2)
        cv2.putText(display_frame, f"Left Knee: {int(l_knee_angle)}°", (30,90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0),2)
        cv2.putText(display_frame, f"Torso: {int(torso_angle)}°", (30,130), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0),2)

        # -------------------------------
        # Collect frames for dataset
        # -------------------------------
        if collecting and frame_id % FRAME_SKIP == 0:
            buffer.add_frame(
                r_hp, r_kn, r_an,
                l_hp, l_kn, l_an,
                r_sh, l_sh,
                neck
            )

        # Draw skeleton - squat pose (with loose threshold for visibility)
        pairs = [
            (KP["r_shoulder"], KP["r_hip"]),
            (KP["r_hip"], KP["r_knee"]),
            (KP["r_knee"], KP["r_ankle"]),
            (KP["l_shoulder"], KP["l_hip"]),
            (KP["l_hip"], KP["l_knee"]),
            (KP["l_knee"], KP["l_ankle"]),
            (KP["l_shoulder"], KP["r_shoulder"]),
            (KP["l_hip"], KP["r_hip"])
        ]
        for a,b in pairs:
            # Check if points are detected, use lower threshold for hip if hidden
            thresh_a = 0.1 if a in [KP["r_hip"], KP["l_hip"]] else CONF_THRESH
            thresh_b = 0.1 if b in [KP["r_hip"], KP["l_hip"]] else CONF_THRESH
            
            if keypoints[a][2] > thresh_a and keypoints[b][2] > thresh_b:
                pa = get_point(keypoints, a, w, h)
                pb = get_point(keypoints, b, w, h)
                cv2.line(display_frame, pa, pb, (0,255,0), 2)
    else:
        detected_knee_ankle = sum(1 for i in required_leg if keypoints[i][2] > CONF_THRESH)
        cv2.putText(display_frame, f"Move into frame - Show knees & ankles ({detected_knee_ankle}/4)", (20,400), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,0,255),2)

    # Show live frame
    cv2.imshow("MoveNet Collector", display_frame)
    key = cv2.waitKey(1) & 0xFF

    # -------------------------------
    # Controls (non-blocking)
    # -------------------------------
    if key == 27:
        break
    elif key == ord('s') and not collecting:
        collecting = True
        buffer = RepBuffer()
        frame_id = 0
        print("▶ Started new rep collection")
    elif key == ord('e') and collecting:
        collecting = False
        pending_label = True
        print("⏸ Rep ended. Press label key: c/p/t/s/e/h")
    elif pending_label and key in [ord(k) for k in label_map]:
        label = label_map[chr(key)]
        features = buffer.summarize(label)
        log_rep(features)  # Writes to CSV with columns exactly:
        # r_wrist_y_range,l_wrist_y_range,hip_y_range,neck_hip_angle_mean,neck_forward_shift,
        # frames,r_elbow_shoulder_dx_mean,l_elbow_shoulder_dx_mean,r_elbow_range,l_elbow_range,label
        print(f"✔ Rep logged: {label}")
        buffer = None
        pending_label = None

cap.release()
cv2.destroyAllWindows()
