from flask import Flask, Response, jsonify
import cv2
from final_bicep_tracker import process_bicep  # Import your bicep processing function
from final_squat_tracker import process_frame as process_squat  # Import your squat processing function

app = Flask(__name__)

# Single global webcam capture object
cap = cv2.VideoCapture(0)

@app.route("/bicep/live")
def bicep_live():
    def generate():
        while True:
            try:
                ret, frame = cap.read()
                if not ret:
                    continue  # retry if frame not captured
                
                # Process frame with bicep tracker
                counters, feedback, overlay = process_bicep(frame)
                
                # Encode and stream overlay
                _, buffer = cv2.imencode('.jpg', overlay)
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            except Exception:
                continue  # on error, continue streaming
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/bicep/status")
def bicep_status():
    ret, frame = cap.read()
    if not ret:
        return jsonify({"exercise": "bicep", "counters": {"left": 0, "right": 0}, "feedback": {"left": "", "right": ""}})
    counters, feedback, _ = process_bicep(frame)
    return jsonify({"exercise": "bicep", "counters": counters, "feedback": feedback})

@app.route("/squat/live")
def squat_live():
    def generate():
        while True:
            try:
                ret, frame = cap.read()
                if not ret:
                    continue  # retry if frame not captured
                
                # Process frame with squat tracker
                count, feedback, overlay = process_squat(frame)
                
                # Encode and stream overlay
                _, buffer = cv2.imencode('.jpg', overlay)
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            except Exception:
                continue  # on error, continue streaming
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/squat/status")
def squat_status():
    ret, frame = cap.read()
    if not ret:
        return jsonify({"exercise": "squat", "count": 0, "feedback": ""})
    count, feedback, _ = process_squat(frame)
    return jsonify({"exercise": "squat", "count": count, "feedback": feedback})

if __name__ == "__main__":
    app.run(port=5001, debug=False, use_reloader=False)
