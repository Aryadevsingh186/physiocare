from flask import Flask, Response, jsonify, request
import cv2
from bicep_processor import process_bicep_frame, get_status  # auto-detection processor
from squat.squat_processor import process_squat_frame, get_status as squat_get_status  # import from squat package
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
    print("[squat/live] 🔴 Endpoint called - starting generator")
    def generate():
        frame_count = 0
        print("[squat/live] 🟢 Generator started, entering loop")
        while True:
            try:
                # Capture frame
                ret, frame = cap.read()
                frame_count += 1
                if frame_count % 30 == 0:  # Log every 30 frames
                    print(f"[squat/live] Frame {frame_count}: ret={ret}, shape={frame.shape if ret else 'None'}")
                
                if not ret:
                    print("[squat/live] ⚠️ Frame capture failed, retrying...")
                    continue  # retry if frame not captured

                # Process frame with squat tracker
                print(f"[squat/live] Processing frame {frame_count}...")
                counters, feedback, overlay = process_squat_frame(frame)
                print(f"[squat/live] ✓ Frame {frame_count} processed: counters={counters}, feedback={feedback.get('squat', 'N/A')[:50]}")

                # Encode and stream overlay
                success, buffer = cv2.imencode('.jpg', overlay)
                if not success:
                    print("[squat/live] ❌ JPEG encoding failed")
                    continue
                
                print(f"[squat/live] ✓ Frame {frame_count} encoded: {len(buffer)} bytes")
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            except Exception as e:
                import traceback
                print(f"[squat/live] 🔥 ERROR: {type(e).__name__}: {e}")
                print(traceback.format_exc())
                continue  # on error, continue streaming
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/squat/status")
def squat_status_route():
    # Use the processor's status API if available (preferred)
    try:
        status = squat_get_status()
        return jsonify({
            "exercise": "squat",
            "counters": status.get("counters"),
            "feedback": status.get("feedback"),
            "model_feedback": status.get("model_feedback"),
            "collecting": status.get("collecting")
        })
    except Exception:
        # Fallback: grab a single frame and run processing
        ret, frame = cap.read()
        if not ret:
            return jsonify({"exercise": "squat", "count": 0, "feedback": ""})
        counters, feedback, _ = process_squat_frame(frame)
        return jsonify({"exercise": "squat", "count": counters.get("squat", 0), "feedback": feedback})


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
    print("\n" + "="*60)
    print("🚀 FLASK LIVE TRACKER STARTING")
    print("="*60)
    print(f"📷 Webcam initialized: {cap.isOpened()}")
    print("📍 Routes available:")
    print("   - /bicep/live")
    print("   - /bicep/status")
    print("   - /squat/live")
    print("   - /squat/status")
    print("   - /neck/live")
    print("   - /neck/status")
    print("="*60 + "\n")
    app.run(port=5001, debug=False, use_reloader=False)

