# final_squat_tracker.py
import tensorflow as tf
import numpy as np
import cv2

# -------------------------------
# Utility Functions
# -------------------------------
def calculate_angle(a, b):
    """Calculate angle of line ab with vertical (y-axis)."""
    dx, dy = a[0] - b[0], a[1] - b[1]
    angle = np.degrees(np.arctan2(dx, dy))  # angle w.r.t vertical
    return abs(angle)

def draw_keypoints(frame, keypoints, threshold=0.4):
    h, w, c = frame.shape
    shaped = np.squeeze(np.multiply(keypoints, [h, w, 1]))
    for kp in shaped:
        ky, kx, conf = kp
        if conf > threshold:
            cv2.circle(frame, (int(kx), int(ky)), 4, (0, 255, 0), -1)

def draw_connections(frame, keypoints, edges, threshold=0.4):
    h, w, c = frame.shape
    shaped = np.squeeze(np.multiply(keypoints, [h, w, 1]))
    for edge, color in edges.items():
        p1, p2 = edge
        y1, x1, c1 = shaped[p1]
        y2, x2, c2 = shaped[p2]
        if (c1 > threshold) and (c2 > threshold):
            cv2.line(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)

# -------------------------------
# Skeleton Connections
# -------------------------------
EDGES = {
    (0, 1): 'm', (0, 2): 'c',
    (1, 3): 'm', (2, 4): 'c',
    (5, 7): 'm', (7, 9): 'm',
    (6, 8): 'c', (8, 10): 'c',
    (5, 6): 'y',
    (5, 11): 'm', (6, 12): 'c',
    (11, 12): 'y',
    (11, 13): 'm', (13, 15): 'm',
    (12, 14): 'c', (14, 16): 'c'
}

# -------------------------------
# Load MoveNet Model
# -------------------------------
interpreter = tf.lite.Interpreter(model_path="./movenet.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# -------------------------------
# Persistent state
# -------------------------------
squat_count = 0
state_sequence = []
last_state = None
started = False  # prevent early counting

# Thresholds for squat logic
STATE_THRESH = {"s1": 32, "s2": (35, 70), "s3": (75, 95)}

# -------------------------------
# Process Frame Function
# -------------------------------
def process_frame(frame):
    """
    Input: BGR frame (numpy array)
    Returns: (squat_count, feedback, frame_with_skeleton)
    """
    global squat_count, state_sequence, last_state, started

    # Preprocess frame for model
    img = tf.image.resize_with_pad(np.expand_dims(frame.copy(), axis=0), 192, 192)
    input_image = tf.cast(img, dtype=tf.float32)

    # TFLite inference
    interpreter.set_tensor(input_details[0]['index'], np.array(input_image))
    interpreter.invoke()
    keypoints_with_scores = interpreter.get_tensor(output_details[0]['index']).copy()

    h, w, c = frame.shape
    keypoints = np.squeeze(np.multiply(keypoints_with_scores, [h, w, 1]))

    # Left leg points
    hip = keypoints[11][:2]
    knee = keypoints[13][:2]
    ankle = keypoints[15][:2]
    shoulder = keypoints[5][:2]

    # Angles w.r.t vertical
    knee_angle = calculate_angle(knee, hip)
    hip_angle = calculate_angle(hip, shoulder)
    ankle_angle = calculate_angle(ankle, knee)

    # Determine current state
    if knee_angle < STATE_THRESH["s1"]:
        current_state = "s1"
    elif STATE_THRESH["s2"][0] <= knee_angle <= STATE_THRESH["s2"][1]:
        current_state = "s2"
    elif STATE_THRESH["s3"][0] <= knee_angle <= STATE_THRESH["s3"][1]:
        current_state = "s3"
    else:
        current_state = None

    # Track states
    feedback_list = []

    if current_state and current_state != last_state:
        state_sequence.append(current_state)
        last_state = current_state

        if current_state == "s1":
            if not started:
                started = True
                state_sequence = []
            else:
                if state_sequence == ["s2", "s3", "s2", "s1"]:
                    squat_count += 1
                    feedback_list.append("Nice rep!")
                state_sequence = []

    # Additional posture feedback
    if hip_angle < 20:
        feedback_list.append("Bend Forward!")
    elif hip_angle > 45:
        feedback_list.append("Bend Backward!")

    if ankle_angle > 30:
        feedback_list.append("Knees over toes!")

    if knee_angle < 80:
        feedback_list.append("Deep squat")
    elif knee_angle > 95:
        feedback_list.append("Too Deep!")

    if not feedback_list:
        feedback_list.append("Stand tall")  # default positive feedback

    feedback = " | ".join(feedback_list)

    # Draw skeleton
    draw_connections(frame, keypoints_with_scores, EDGES, threshold=0.4)
    draw_keypoints(frame, keypoints_with_scores, threshold=0.4)

    return squat_count, feedback, frame
