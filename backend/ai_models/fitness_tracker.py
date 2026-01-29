from flask import Flask, Response, jsonify, request
import cv2
from final_bicep_tracker import process_bicep
from final_squat_tracker import process_frame as process_squat
from neck_tracker import process_neck
from flask_cors import CORS
from physio_agent import PhysioAgent

app = Flask(__name__)
CORS(app)

cap = cv2.VideoCapture(0)

latest_status = {
    "counters": {"left": 0, "right": 0},
    "feedback": {"left": "not detected", "right": "not detected"}
}
latest_neck = {"count": 0}

agent_sessions = {}

# ================== BICEP ==================
@app.route("/bicep/live")
def bicep_live():
    def generate():
        global latest_status
        while True:
            ret, frame = cap.read()
            if not ret:
                continue
            counters, feedback, overlay = process_bicep(frame)
            latest_status["counters"] = counters
            latest_status["feedback"] = feedback

            _, buffer = cv2.imencode(".jpg", overlay)
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" +
                   buffer.tobytes() + b"\r\n")

    return Response(generate(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/bicep/status")
def bicep_status():
    return jsonify({
        "exercise": "bicep",
        "counters": latest_status["counters"],
        "feedback": latest_status["feedback"]
    })


# ================== SQUAT ==================
@app.route("/squat/live")
def squat_live():
    def generate():
        while True:
            ret, frame = cap.read()
            if not ret:
                continue
            count, feedback, overlay = process_squat(frame)
            _, buffer = cv2.imencode(".jpg", overlay)
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" +
                   buffer.tobytes() + b"\r\n")

    return Response(generate(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/squat/status")
def squat_status():
    ret, frame = cap.read()
    if not ret:
        return jsonify({"count": 0, "feedback": ""})

    count, feedback, _ = process_squat(frame)
    return jsonify({"count": count, "feedback": feedback})


# ================== NECK ==================
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

            _, buffer = cv2.imencode(".jpg", overlay)
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" +
                   buffer.tobytes() + b"\r\n")

    return Response(generate(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/neck/status")
def neck_status():
    return jsonify({"counter": latest_neck["count"]})


# ================== AGENT ==================
@app.route("/agent/start", methods=["POST", "GET"])
def start_agent():
    if request.method == "GET":
        return jsonify({"message": "Use POST"}), 405
    data = request.json
    session_id = data["session_id"]
    exercise = data["exercise"]

    agent_sessions[session_id] = PhysioAgent(exercise)

    return jsonify({
        "message": agent_sessions[session_id].get_prompt(),
        "state": "READY"
    })


@app.route("/agent/update", methods=["POST", "GET"])
def update_agent():
    if request.method == "GET":
        return jsonify({"message": "Use POST"}), 405
    data = request.json
    session_id = data["session_id"]
    user_input = data.get("user_input", "")

    agent = agent_sessions.get(session_id)
    if not agent:
        return jsonify({"error": "Session not found"}), 404

    reps = latest_status["counters"]["left"]
    feedback = latest_status["feedback"]["left"]

    agent.update(user_input=user_input, feedback=feedback, reps=reps)

    return jsonify({
        "message": agent.get_prompt(),
        "state": agent.state,
        "reps": agent.rep_count
    })


if __name__ == "__main__":
    app.run(port=5001, debug=False)
