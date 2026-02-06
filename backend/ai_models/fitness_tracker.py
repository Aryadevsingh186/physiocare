from flask import Flask, Response, jsonify, request
import cv2
from bicep_processor import process_bicep_frame, get_status  # auto-detection processor
from final_squat_tracker import process_frame as process_squat  # Import your squat processing function
from neck_tracker import process_neck
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 
# Single global webcam capture object
cap = cv2.VideoCapture(0)
# Global to store latest counters and feedback
latest_neck = {"count": 0}

@app.route("/bicep/live")
def bicep_live():
    def generate():
        while True:
            ret, frame = cap.read()
            if not ret:
                continue
            counters, feedback, overlay = process_bicep_frame(frame)

            _, buffer = cv2.imencode('.jpg', overlay)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/bicep/status")
def bicep_status():
    # Return current processor status - auto-detection handles everything
    status = get_status()
    return jsonify({
        "exercise": "bicep",
        "counters": status.get("counters"),
        "feedback": status.get("feedback"),
        "collecting": status.get("collecting")
    })


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


@app.route("/neck/live")
def neck_live():
    def generate():
        global latest_neck
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            count, overlay = process_neck(frame)
            latest_neck["count"] = count

            _, buffer = cv2.imencode('.jpg', overlay)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")
@app.route("/neck/status")
def neck_status():
    # Only return the latest counter from live feed
    return jsonify({"exercise": "neck", "counter": latest_neck["count"]})

if __name__ == "__main__":
    app.run(port=5001, debug=False, use_reloader=False)

