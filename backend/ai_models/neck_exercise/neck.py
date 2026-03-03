import cv2
import numpy as np
import tensorflow as tf
from collections import deque

# ======================================
# Load MoveNet
# ======================================
interpreter = tf.lite.Interpreter(model_path="movenet.tflite")
interpreter.allocate_tensors()
inp = interpreter.get_input_details()
out = interpreter.get_output_details()
H, W = inp[0]['shape'][1:3]

# ======================================
# Angle Function
# ======================================
def angle(a, b, c):
    ba = a - b
    bc = c - b
    cos_val = np.dot(ba, bc) / (
        np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6
    )
    return np.degrees(np.arccos(np.clip(cos_val, -1.0, 1.0)))

# ======================================
# Extract Pose
# ======================================
def extract_pose(frame):
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    rgb = tf.image.resize_with_pad(np.expand_dims(rgb, 0), H, W)

    interpreter.set_tensor(inp[0]['index'], rgb.numpy())
    interpreter.invoke()
    kp = interpreter.get_tensor(out[0]['index'])[0][0]

    def pt(i):
        return np.array([kp[i, 1] * w, kp[i, 0] * h])

    nose = pt(0)
    ls, rs = pt(5), pt(6)
    le, re = pt(7), pt(8)
    lw, rw = pt(9), pt(10)

    return [nose, ls, rs, le, re, lw, rw]

# ======================================
# GLOBAL VARIABLES
# ======================================
rep_count = 0
angle_buffer = deque(maxlen=7)

EXPAND_ANGLE = 140
RELAX_ANGLE = 120

movement_direction = "DOWN"

prev_angle = 0
prev_nose_y = None

ANGLE_DELTA_THRESHOLD = 1.5      # ignore tiny jitter
NOSE_DELTA_THRESHOLD = 3         # ignore tiny head jitter

# ======================================
# MAIN PROCESS FUNCTION
# ======================================
def process_frame(frame):
    global rep_count, movement_direction
    global prev_angle, prev_nose_y

    points = extract_pose(frame)
    nose, ls, rs, le, re, lw, rw = points

    # ---- Shoulder Angle ----
    left_angle = angle(le, ls, rs)
    right_angle = angle(re, rs, ls)
    shoulder_angle = (left_angle + right_angle) / 2

    angle_buffer.append(shoulder_angle)
    smooth_angle = np.mean(angle_buffer)

    # Initialize previous nose position safely
    if prev_nose_y is None:
        prev_nose_y = nose[1]

    # ======================================
    # MOVEMENT DETECTION
    # ======================================

    angle_change = smooth_angle - prev_angle
    nose_change = prev_nose_y - nose[1]  # positive = chin going up

    arms_expanding = angle_change > ANGLE_DELTA_THRESHOLD
    chin_lifting = nose_change > NOSE_DELTA_THRESHOLD

    prev_angle = smooth_angle
    prev_nose_y = nose[1]

    feedback = ""

    # ======================================
    # REP COUNT LOGIC
    # ======================================

    if smooth_angle > EXPAND_ANGLE and movement_direction == "DOWN":
        movement_direction = "UP"

    if smooth_angle < RELAX_ANGLE and movement_direction == "UP":
        rep_count += 1
        movement_direction = "DOWN"

    # ======================================
    # COORDINATION ALERT
    # ======================================

    if arms_expanding and not chin_lifting:
        feedback = "Lift your chin while opening arms"

    # ======================================
    # DRAWING
    # ======================================
    overlay = frame.copy()

    for p in points:
        cv2.circle(overlay, tuple(p.astype(int)), 6, (0,255,0), -1)

    def line(a,b):
        cv2.line(overlay,
                 tuple(a.astype(int)),
                 tuple(b.astype(int)),
                 (255,0,0),2)

    line(ls, le)
    line(le, lw)
    line(rs, re)
    line(re, rw)
    line(ls, rs)

    cv2.putText(overlay,
                f"Reps: {rep_count}",
                (30,50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.2,
                (0,255,0),
                3)

    cv2.putText(overlay,
                f"Angle: {int(smooth_angle)}",
                (30,90),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (0,255,255),
                2)

    if feedback != "":
        cv2.putText(overlay,
                    feedback,
                    (30,130),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0,0,255),
                    2)

    return overlay

# ======================================
# CAMERA LOOP
# ======================================
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    output = process_frame(frame)

    cv2.imshow("Chest Expansion Counter", output)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()