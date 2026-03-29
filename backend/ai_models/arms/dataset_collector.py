import cv2
import numpy as np
import tensorflow as tf

from rep_segmenter import RepBuffer
from dataset_logger import log_rep
from angle_utils import calculate_angle

# Load MoveNet
interpreter = tf.lite.Interpreter(model_path="movenet.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
input_height, input_width = input_details[0]['shape'][1:3]

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
            
def run_movenet(frame):
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img = tf.image.resize_with_pad(np.expand_dims(img, axis=0), input_height, input_width)
    img = tf.cast(img, dtype=tf.float32)
    interpreter.set_tensor(input_details[0]['index'], img.numpy())
    interpreter.invoke()
    return interpreter.get_tensor(output_details[0]['index'])[0][0]

def get_point(kp, idx, w, h):
    return (int(kp[idx][1] * w), int(kp[idx][0] * h))

KP = {
    "l_shoulder": 5, "r_shoulder": 6,
    "l_elbow": 7, "r_elbow": 8,
    "l_wrist": 9, "r_wrist": 10,
    "l_hip": 11, "r_hip": 12
}

ARM_CONNECTIONS = [
    (5, 7),   # left shoulder → elbow
    (7, 9),   # left elbow → wrist
    (6, 8),   # right shoulder → elbow
    (8, 10),  # right elbow → wrist
    (5, 6)    # shoulder line
]

cap = cv2.VideoCapture(0)

collecting = False
buffer = None
pending_label = None

label_map = {
    'c': 'correct',
    'l': 'low_range',
    'b': 'bent_elbow'
}

print("Press 's' to START, 'e' to END rep, then label key")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape

    keypoints = run_movenet(frame)
    display = frame.copy()

    required = [5,6,7,8,9,10]

    if all(keypoints[i][2] > 0.4 for i in required):
        r_sh = get_point(keypoints, KP["r_shoulder"], w, h)
        r_el = get_point(keypoints, KP["r_elbow"], w, h)
        r_wr = get_point(keypoints, KP["r_wrist"], w, h)

        l_sh = get_point(keypoints, KP["l_shoulder"], w, h)
        l_el = get_point(keypoints, KP["l_elbow"], w, h)
        l_wr = get_point(keypoints, KP["l_wrist"], w, h)

        r_hp = get_point(keypoints, KP["r_hip"], w, h)
        l_hp = get_point(keypoints, KP["l_hip"], w, h)
        
        r_angle = calculate_angle(r_hp, r_sh, r_el)
        l_angle = calculate_angle(l_hp, l_sh, l_el)

        cv2.putText(display, f"R: {int(r_angle)}", (30,50),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0),2)

        cv2.putText(display, f"L: {int(l_angle)}", (30,80),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0),2)
        
        if collecting:
            buffer.add_frame(
                r_sh, r_el, r_wr,
                l_sh, l_el, l_wr,
                r_hp, l_hp
            )

        draw_keypoints(display, keypoints)
        draw_connections(display, keypoints, ARM_CONNECTIONS)

    cv2.imshow("Arm Raise Collector", display)
    key = cv2.waitKey(1) & 0xFF

    if key == 27:
        break

    elif key == ord('s') and not collecting:
        collecting = True
        buffer = RepBuffer()
        print("Started collecting")

    elif key == ord('e') and collecting:
        collecting = False
        pending_label = True
        print("Press label key")

    elif pending_label and key in [ord(k) for k in label_map]:
        label = label_map[chr(key)]
        features = buffer.summarize(label)
        log_rep(features)
        print(f"Saved: {label}")
        pending_label = None
        buffer = None

cap.release()
cv2.destroyAllWindows()