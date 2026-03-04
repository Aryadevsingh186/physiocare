from flask import Flask, Response, jsonify
import cv2
from flask_cors import CORS

from bicep_processor import process_bicep_frame, get_status
from final_squat_tracker import process_frame as process_squat
from neck_processor import process_neck_frame, get_status as get_neck_status


app = Flask(__name__)
CORS(app)

# Single global webcam
cap = cv2.VideoCapture(0)


# ==========================
# BICEP ROUTES
# ==========================

@app.route("/bicep/live")
def bicep_live():

    def generate():
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            counters, feedback, overlay = process_bicep_frame(frame)

            _, buffer = cv2.imencode(".jpg", overlay)

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + buffer.tobytes()
                + b"\r\n"
            )

    return Response(generate(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/bicep/status")
def bicep_status():

    status = get_status()

    return jsonify({
        "exercise": "bicep",
        "counter": status["counters"].get("bicep", 0),
        "feedback": status["feedback"].get("bicep", ""),
        "collecting": status["collecting"].get("bicep", False)
    })


# ==========================
# SQUAT ROUTES
# ==========================

@app.route("/squat/live")
def squat_live():

    def generate():
        while True:
            ret, frame = cap.read()

            if not ret:
                continue

            count, feedback, overlay = process_squat(frame)

            _, buffer = cv2.imencode(".jpg", overlay)

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + buffer.tobytes()
                + b"\r\n"
            )

    return Response(generate(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/squat/status")
def squat_status():

    ret, frame = cap.read()

    if not ret:
        return jsonify({
            "exercise": "squat",
            "counter": 0,
            "feedback": ""
        })

    count, feedback, _ = process_squat(frame)

    return jsonify({
        "exercise": "squat",
        "counter": count,
        "feedback": feedback
    })


# ==========================
# NECK ROUTES
# ==========================

@app.route("/neck/live")
def neck_live():

    def generate():
        while True:

            ret, frame = cap.read()
            if not ret:
                continue

            counters, feedback, overlay = process_neck_frame(frame)

            status = get_neck_status()

            # Display ML feedback on video
            model_feedback = status["model_feedback"].get("neck", "none")

            if model_feedback != "none":
                cv2.putText(
                    overlay,
                    f"Model: {model_feedback}",
                    (30, 60),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 255),
                    2
                )

            _, buffer = cv2.imencode(".jpg", overlay)

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + buffer.tobytes()
                + b"\r\n"
            )

    return Response(generate(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/neck/status")
def neck_status():

    status = get_neck_status()

    return jsonify({
        "exercise": "neck",
        "counter": status["counters"].get("neck", 0),
        "feedback": status["feedback"].get("neck", ""),
        "model_feedback": status["model_feedback"].get("neck", "none"),
        "collecting": status["collecting"].get("neck", False)
    })


# ==========================
# MAIN
# ==========================

if __name__ == "__main__":
    app.run(port=5001, debug=False, use_reloader=False)