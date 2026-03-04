from flask import Flask, Response, jsonify
import cv2
from flask_cors import CORS
from leg_processor import process_leg_frame, get_status as leg_status 

app = Flask(__name__)
CORS(app)

cap = cv2.VideoCapture(0)

@app.route("/leg/live")
def leg_live():
    def generate():
        while True:
            ret, frame = cap.read()
            if not ret:
                continue
            
            frame = cv2.flip(frame, 1)
            # Unpack the 3-item tuple returned by process_leg_frame
            counters, feedback, overlay = process_leg_frame(frame)
            
            _, buffer = cv2.imencode('.jpg', overlay)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/leg/status")
def status_route():
    return jsonify(leg_status())

if __name__ == "__main__":
    print("AI Gym Server active on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)