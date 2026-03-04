import cv2
import numpy as np
import tensorflow as tf
from rep_segmenter import RepBuffer
from dataset_logger import log_rep
from angle_utils import calculate_angle

# --- 1. Load Model ---
interpreter = tf.lite.Interpreter(model_path="movenet.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
ih, iw = input_details[0]['shape'][1:3]

def run_movenet(frame):
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img = tf.image.resize_with_pad(np.expand_dims(img, axis=0), ih, iw)
    img = tf.cast(img, dtype=tf.float32)
    interpreter.set_tensor(input_details[0]['index'], img.numpy())
    interpreter.invoke()
    return interpreter.get_tensor(output_details[0]['index'])[0][0]

def get_pt(kp, idx, w, h):
    return (int(kp[idx][1] * w), int(kp[idx][0] * h))

# --- 2. Config ---
# 11:L_Hip, 12:R_Hip, 13:L_Knee, 14:R_Knee, 15:L_Ankle, 16:R_Ankle
label_map = {'c': 'correct', 'p': 'partial_extension', 'f': 'too_fast'}

# ULTRA LOW THRESHOLD to force points to show
CONF_THRESH = 0.10 

cap = cv2.VideoCapture(0)
collecting, pending_label, buffer = False, False, None

while True:
    ret, frame = cap.read()
    if not ret: break
    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    keypoints = run_movenet(frame)
    display_frame = frame.copy()

    # --- 3. DETECT AND DRAW ALL JOINTS ---
    pts = {}
    for i in [11, 12, 13, 14, 15, 16]:
        conf = keypoints[i][2]
        p = get_pt(keypoints, i, w, h)
        
        if conf > CONF_THRESH:
            pts[i] = p
            # Green for Left (11, 13, 15), Blue for Right (12, 14, 16)
            color = (0, 255, 0) if i % 2 != 0 else (255, 0, 0)
            cv2.circle(display_frame, p, 8, color, -1)
            cv2.putText(display_frame, f"{int(conf*100)}%", (p[0], p[1]-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

    # --- 4. SKELETON LOGIC (WITH RECOVERY) ---
    # Try to get Right Leg (12, 14, 16)
    r_valid = all(k in pts for k in [12, 14, 16])
    l_valid = all(k in pts for k in [11, 13, 15])

    # Draw Left Skeleton (Green)
    if l_valid:
        cv2.line(display_frame, pts[11], pts[13], (0, 255, 0), 2)
        cv2.line(display_frame, pts[13], pts[15], (0, 255, 0), 2)

    # Draw Right Skeleton (Blue)
    if r_valid:
        cv2.line(display_frame, pts[12], pts[14], (255, 0, 0), 2)
        cv2.line(display_frame, pts[14], pts[16], (255, 0, 0), 2)

    # --- 5. RECORDING LOGIC ---
    # If the right side is missing, we "Borrow" from the left for the dataset
    if r_valid or l_valid:
        # Determine which side to use for the primary angle display
        main_hp = pts[12] if r_valid else pts[11]
        main_kn = pts[14] if r_valid else pts[13]
        main_ak = pts[16] if r_valid else pts[15]
        
        angle = calculate_angle(main_hp, main_kn, main_ak)
        side_text = "Right" if r_valid else "Left (Mirror)"
        cv2.putText(display_frame, f"{side_text} Angle: {int(angle)}", (20, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        if collecting:
            # Prepare 6 points for the buffer. Use existing side to fill missing side.
            r_hp, r_kn, r_ak = (pts[12], pts[14], pts[16]) if r_valid else (pts[11], pts[13], pts[15])
            l_hp, l_kn, l_ak = (pts[11], pts[13], pts[15]) if l_valid else (pts[12], pts[14], pts[16])
            
            buffer.add_frame(r_hp, r_kn, r_ak, l_hp, l_kn, l_ak)
            cv2.circle(display_frame, (w-30, 30), 12, (0, 0, 255), -1)

    else:
        cv2.putText(display_frame, "CANNOT FIND EITHER LEG", (20, h-30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    # Label UI
    if pending_label:
        cv2.putText(display_frame, "C:Correct | P:Partial | F:Fast", (w//6, h//2), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

    cv2.imshow("Leg Extension Collector", display_frame)
    
    key = cv2.waitKey(1) & 0xFF
    if key == 27: break
    elif key == ord('s'):
        collecting, buffer, pending_label = True, RepBuffer(), False
        print("Recording...")
    elif key == ord('e'):
        collecting, pending_label = False, True
    elif pending_label and chr(key) in label_map:
        log_rep(buffer.summarize(label_map[chr(key)]))
        pending_label = False
        print(f"✔ Saved: {label_map[chr(key)]}")

cap.release()
cv2.destroyAllWindows()