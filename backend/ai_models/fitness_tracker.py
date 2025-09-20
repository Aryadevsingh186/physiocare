from flask import Flask, Response, jsonify
import cv2
import threading
from final_squat_tracker import process_frame as process_squat
from final_bicep_tracker import process_bicep

app = Flask(__name__)

# -------------------------------
# SQUAT
# -------------------------------
cap_squat = cv2.VideoCapture(0)

@app.route("/squat/live")
def squat_live():
    def generate():
        while True:
            ret, frame = cap_squat.read()
            if not ret:
                break
            count, feedback, overlay = process_squat(frame)
            _, buffer = cv2.imencode('.jpg', overlay)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/squat/status")
def squat_status():
    ret, frame = cap_squat.read()
    count, feedback, _ = process_squat(frame)
    return jsonify({"exercise": "squat", "count": count, "feedback": feedback})


# -------------------------------
# BICEP
# -------------------------------
cap_bicep = cv2.VideoCapture(0)

@app.route("/bicep/live")
def bicep_live():
    def generate():
        while True:
            ret, frame = cap_bicep.read()
            if not ret:
                break
            counters, fb, overlay = process_bicep(frame)
            _, buffer = cv2.imencode('.jpg', overlay)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/bicep/status")
def bicep_status():
    ret, frame = cap_bicep.read()
    counters, fb, _ = process_bicep(frame)
    return jsonify({"exercise": "bicep", "counters": counters, "feedback": fb})


# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":
    app.run(port=5001, debug=True , use_reloader=False )
