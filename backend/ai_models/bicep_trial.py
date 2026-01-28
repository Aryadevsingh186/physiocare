# final_bicep_tracker.py
import cv2
import numpy as np
import tensorflow as tf
from collections import deque
from feedback_forbicep import generate_feedback

# -------------------------------
# Utility
# -------------------------------
def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180.0 else angle

# -------------------------------
# Load MoveNet TFLite
# -------------------------------
interpreter = tf.lite.Interpreter(model_path="movenet.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
input_height, input_width = input_details[0]['shape'][1:3]

# -------------------------------
# Persistent State
# -------------------------------
counters = {"left": 0, "right": 0}
states = {"left": "down", "right": "down"}
angle_buffers = {"left": deque(maxlen=10), "right": deque(maxlen=10)}
frames_in_state = {"left": 0, "right": 0}
elbow_start_pos = {"left": None, "right": None}

flexion_threshold, extension_threshold = 65, 100
min_confidence = 0.5

# -------------------------------
# Process Frame
# -------------------------------
def process_bicep(frame):
    global counters, states, angle_buffers, frames_in_state, elbow_start_pos

    h, w, _ = frame.shape
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img = tf.image.resize_with_pad(np.expand_dims(img, axis=0), input_height, input_width)
    input_image = tf.cast(img, dtype=tf.float32)

    interpreter.set_tensor(input_details[0]['index'], input_image.numpy())
    interpreter.invoke()
    keypoints = interpreter.get_tensor(output_details[0]['index']).copy()[0][0]

    arms = {
        "left":  {"shoulder": (int(keypoints[5,1]*w), int(keypoints[5,0]*h)),
                  "elbow":   (int(keypoints[7,1]*w), int(keypoints[7,0]*h)),
                  "wrist":   (int(keypoints[9,1]*w), int(keypoints[9,0]*h)),
                  "ids": [5,7,9]},
        "right": {"shoulder": (int(keypoints[6,1]*w), int(keypoints[6,0]*h)),
                  "elbow":   (int(keypoints[8,1]*w), int(keypoints[8,0]*h)),
                  "wrist":   (int(keypoints[10,1]*w), int(keypoints[10,0]*h)),
                  "ids": [6,8,10]}
    }

    feedback_dict = {"left": {}, "right": {}}

    for side, data in arms.items():
        s, e, w_ = data["shoulder"], data["elbow"], data["wrist"]
        id_s, id_e, id_w = data["ids"]

        if keypoints[id_s,2]>min_confidence and keypoints[id_e,2]>min_confidence and keypoints[id_w,2]>min_confidence:
            elbow_angle = calculate_angle(s,e,w_)
            angle_buffers[side].append(elbow_angle)
            smooth_angle = np.mean(angle_buffers[side])
            frames_in_state[side] += 1

            # -------- State Logic --------
            if smooth_angle < flexion_threshold and states[side]=="down" and frames_in_state[side]>3:
                states[side] = "up"
                frames_in_state[side] = 0

            elif smooth_angle > extension_threshold and states[side]=="up" and frames_in_state[side]>3:
                states[side] = "down"
                counters[side] += 1

                # Elbow drift
                if elbow_start_pos[side] is None:
                    elbow_start_pos[side] = e
                elbow_drift = np.linalg.norm(np.array(e) - np.array(elbow_start_pos[side]))

                # Generate feedback
                feedback_dict[side] = generate_feedback(
                    min(angle_buffers[side]),
                    frames_in_state[side],
                    counters["left"],
                    counters["right"],
                    elbow_drift
                )

                frames_in_state[side] = 0
            else:
                # If rep not completed, feedback based on angle only
                feedback_dict[side] = generate_feedback(
                    smooth_angle,
                    frames_in_state[side],
                    counters["left"],
                    counters["right"]
                )

            # -------- Draw Skeleton --------
            cv2.line(frame, s, e, (0,255,0), 3)
            cv2.line(frame, e, w_, (0,255,0), 3)
            cv2.circle(frame, s, 5, (0,0,255), -1)
            cv2.circle(frame, e, 5, (0,0,255), -1)
            cv2.circle(frame, w_, 5, (0,0,255), -1)
            cv2.putText(frame, f"{side.capitalize()} {int(smooth_angle)}°",
                        (e[0]-50, e[1]-20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255),2)
        else:
            feedback_dict[side] = {"range":"not detected","speed":"","symmetry":"","fatigue":"","form":""}

    # -------- Draw Feedback Panel --------
    panel_x, panel_y = 20, 20
    line_height = 25
    for i, side in enumerate(["left","right"]):
        y = panel_y + i*6*line_height
        cv2.putText(frame, f"{side.capitalize()} Arm:", (panel_x, y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,255),2)
        fb = feedback_dict[side]
        for j, (k, v) in enumerate(fb.items()):
            cv2.putText(frame, f"{k.capitalize()}: {v}", (panel_x+10, y+(j+1)*line_height), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255),1)

    return counters.copy(), feedback_dict.copy(), frame