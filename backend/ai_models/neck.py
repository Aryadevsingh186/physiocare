import cv2
import numpy as np
import tensorflow as tf
from collections import deque

# ================================
# Load MoveNet
# ================================
interpreter = tf.lite.Interpreter(model_path="movenet.tflite")
interpreter.allocate_tensors()
inp = interpreter.get_input_details()
out = interpreter.get_output_details()
H, W = inp[0]['shape'][1:3]

# ================================
# Utils
# ================================
def angle(a, b, c):
    ba = a - b
    bc = c - b
    return np.degrees(
        np.arccos(
            np.clip(
                np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6),
                -1.0, 1.0
            )
        )
    )

def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-6)

def normalize(v):
    return (v - np.mean(v)) / (np.std(v) + 1e-6)

# ================================
# Feature Extraction (FIXED)
# ================================
def extract_vector(frame):
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    rgb = tf.image.resize_with_pad(np.expand_dims(rgb, 0), H, W)
    interpreter.set_tensor(inp[0]['index'], rgb.numpy())
    interpreter.invoke()
    kp = interpreter.get_tensor(out[0]['index'])[0][0]

    def pt(i): 
        return np.array([kp[i, 1] * w, kp[i, 0] * h])

    ls, rs = pt(5), pt(6)
    le, re = pt(7), pt(8)
    lw, rw = pt(9), pt(10)
    hip = pt(11)
    nose = pt(0)

    # ---- REAL PHYSICS FEATURES ----
    neck_extension = angle(nose, ls, hip)          # head moving back
    head_back_dist = np.linalg.norm(nose - hip)    # head translation
    shoulder_open  = np.linalg.norm(ls - rs)       # chest opening
    left_elbow     = angle(ls, le, lw)
    right_elbow    = angle(rs, re, rw)

    vec = np.array([
        neck_extension,
        head_back_dist,
        shoulder_open,
        left_elbow,
        right_elbow
    ])

    points = [ls, rs, le, re, lw, rw, hip, nose]
    return vec, points

# ================================
# Load Reference Poses
# ================================
start_img = cv2.imread("start.png")
end_img = cv2.imread("end.png")

start_vec, _ = extract_vector(start_img)
end_vec, _ = extract_vector(end_img)

start_vec = normalize(start_vec)
end_vec   = normalize(end_vec)

print("Reference loaded")

# ================================
# Buffers
# ================================
sim_start_buf = deque(maxlen=10)
sim_end_buf   = deque(maxlen=10)
speed_buf     = deque(maxlen=20)

# ================================
# State Machine
# ================================
rep_count = 0
state = "AT_START"
ready_buf = deque(maxlen=5)

# ================================
# Main Loop
# ================================
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    vec, points = extract_vector(frame)
    vec = normalize(vec)

    sim_start = cosine(vec, start_vec)
    sim_end   = cosine(vec, end_vec)

    # ---- smoothing ----
    sim_start_buf.append(sim_start)
    sim_end_buf.append(sim_end)
    sim_start_avg = np.mean(sim_start_buf)
    sim_end_avg   = np.mean(sim_end_buf)

    # ---- ready pose ----
    ready_buf.append(sim_start_avg > 0.7)
    ready_flag = all(ready_buf)

    # ---- speed ----
    speed_buf.append(sim_end_avg)
    if len(speed_buf) > 1:
        speed = abs(speed_buf[-1] - speed_buf[-2]) * 1000
    else:
        speed = 0

    # ---- STATE MACHINE ----
    if ready_flag:
        if state == "AT_START" and sim_end_avg > sim_start_avg + 0.05:
            state = "GOING_BACK"

        elif state == "GOING_BACK" and sim_end_avg > 0.9:
            state = "AT_END"

        elif state == "AT_END" and sim_start_avg > sim_end_avg + 0.05:
            state = "RETURNING"

        elif state == "RETURNING" and sim_start_avg > 0.9:
            state = "AT_START"
            rep_count += 1

    # ================================
    # FEEDBACK
    # ================================
    if state == "GOING_BACK":
        phase = "Stretching back"
    elif state == "RETURNING":
        phase = "Returning"
    else:
        phase = state.replace("_", " ")

    if sim_end_avg > 0.85:
        posture_fb = "Perfect stretch"
    elif sim_end_avg > 0.75:
        posture_fb = "Almost there"
    else:
        posture_fb = "Open chest more"

    if speed > 6:
        speed_fb = "Too fast"
    elif speed < 1.5:
        speed_fb = "Too slow"
    else:
        speed_fb = "Good pace"

    feedback = f"{posture_fb} | {speed_fb}"

    # ================================
    # DRAW
    # ================================
    for p in points:
        cv2.circle(frame, tuple(p.astype(int)), 5, (0, 255, 0), -1)

    cv2.putText(frame, f"Reps: {rep_count}", (20, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)

    cv2.putText(frame, f"Start sim: {sim_start_avg:.2f}", (20, 70),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.putText(frame, f"End sim: {sim_end_avg:.2f}", (20, 100),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.putText(frame, phase, (20, 140),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    cv2.putText(frame, feedback, (20, 180),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 200, 255), 2)

    cv2.imshow("Posture Stretch AI", frame)
    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()
