from flask import Flask, Response, jsonify
import cv2
from final_bicep_tracker import process_bicep  # Import your bicep processing function
from final_squat_tracker import process_frame as process_squat  # Import your squat processing function
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 
# Single global webcam capture object
cap = cv2.VideoCapture(0)
# Global to store latest counters and feedback
latest_status = {"counters": {"left": 0, "right": 0}, "feedback": {"left": "not detected", "right": "not detected"}}

@app.route("/bicep/live")
def bicep_live():
    def generate():
        global latest_status
        while True:
            ret, frame = cap.read()
            if not ret:
                continue
            counters, feedback, overlay = process_bicep(frame)
            # Update latest status
            latest_status["counters"] = counters
            latest_status["feedback"] = feedback

            _, buffer = cv2.imencode('.jpg', overlay)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/bicep/status")
def bicep_status():
    # Simply return the latest processed counters/feedback
    return jsonify({
        "exercise": "bicep",
        "counters": latest_status["counters"],
        "feedback": latest_status["feedback"]
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

if __name__ == "__main__":
    app.run(port=5001, debug=False, use_reloader=False)
