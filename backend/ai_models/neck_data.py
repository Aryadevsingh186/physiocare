import cv2
import numpy as np
import tensorflow as tf
import csv
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
# Feature Extraction
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

    neck_extension = angle(nose, ls, hip)
    head_back_dist = np.linalg.norm(nose - hip)
    shoulder_open  = np.linalg.norm(ls - rs)
    left_elbow     = angle(ls, le, lw)
    right_elbow    = angle(rs, re, rw)

    vec = np.array([
        neck_extension,
        head_back_dist,
        shoulder_open,
        left_elbow,
        right_elbow
    ])

    return vec

# ================================
# Heuristic score
# ================================
def heuristic_score(vec, sim_end, speed):
    neck, head_dist, shoulder, le, re = vec
    s1 = np.clip(sim_end, 0, 1)
    s2 = np.clip(shoulder / 300, 0, 1)
    s3 = np.clip(neck / 60, 0, 1)
    s4 = np.clip(1 - abs(speed - 3) / 5, 0, 1)
    return (0.35*s1 + 0.25*s2 + 0.25*s3 + 0.15*s4) * 100

# ================================
# CSV Setup
# ================================
csv_file = open("dataset.csv", "a", newline="")
writer = csv.writer(csv_file)
writer.writerow([
    "neck_extension",
    "head_back_dist",
    "shoulder_open",
    "left_elbow",
    "right_elbow",
    "sim_end",
    "speed",
    "heuristic_score",
    "final_score"
])

# ================================
# Load reference poses
# ================================
start_img = cv2.imread("start.png")
end_img   = cv2.imread("end.png")

start_vec = normalize(extract_vector(start_img))
end_vec   = normalize(extract_vector(end_img))

# ================================
# Buffers & State
# ================================
sim_start_buf = deque(maxlen=10)
sim_end_buf   = deque(maxlen=10)
speed_buf     = deque(maxlen=20)

state = "AT_START"
ready_buf = deque(maxlen=5)

cap = cv2.VideoCapture(0)

print("DATASET COLLECTION STARTED")

# ================================
# Main Loop
# ================================
while True:
    ret, frame = cap.read()
    if not ret:
        continue

    vec = normalize(extract_vector(frame))
    sim_start = cosine(vec, start_vec)
    sim_end   = cosine(vec, end_vec)

    sim_start_buf.append(sim_start)
    sim_end_buf.append(sim_end)
    sim_start_avg = np.mean(sim_start_buf)
    sim_end_avg   = np.mean(sim_end_buf)

    ready_buf.append(sim_start_avg > 0.7)
    ready_flag = all(ready_buf)

    speed_buf.append(sim_end_avg)
    if len(speed_buf) > 1:
        speed = abs(speed_buf[-1] - speed_buf[-2]) * 1000
    else:
        speed = 0

    # ---- state machine ----
    if ready_flag:
        if state == "AT_START" and sim_end_avg > sim_start_avg + 0.05:
            state = "GOING_BACK"

        elif state == "GOING_BACK" and sim_end_avg > 0.9:
            state = "AT_END"

        elif state == "AT_END" and sim_start_avg > sim_end_avg + 0.05:
            state = "RETURNING"

        elif state == "RETURNING" and sim_start_avg > 0.9:
            state = "AT_START"

            # ---- record rep ----
            h_score = heuristic_score(vec, sim_end_avg, speed)
            final_score = int(h_score)

            print("\nSuggested score:", final_score)
            print("Enter=save | +/- adjust | q=skip")

            while True:
                k = cv2.waitKey(0)
                if k == 13:
                    break
                elif k == ord('+'):
                    final_score = min(100, final_score + 5)
                    print("Adjusted:", final_score)
                elif k == ord('-'):
                    final_score = max(0, final_score - 5)
                    print("Adjusted:", final_score)
                elif k == ord('q'):
                    final_score = None
                    break

            if final_score is not None:
                writer.writerow([
                    vec[0], vec[1], vec[2], vec[3], vec[4],
                    sim_end_avg, speed, h_score, final_score
                ])
                print("Saved.")

    cv2.putText(frame, f"State: {state}", (20,30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
    cv2.imshow("Collector", frame)

    if cv2.waitKey(1) == 27:
        break

cap.release()
csv_file.close()
cv2.destroyAllWindows()
