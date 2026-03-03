import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SessionTimer from "./SessionTimer";
import useSpeechFeedback from "./useSpeechFeedback";

const Exercise = ({ title, statusUrl, liveUrl, mapData }) => {
  const [counters, setCounters] = useState({});
  const [feedback, setFeedback] = useState({});
  const [model_feedback, setModelFeedback] = useState({});
  const [sessionId, setSessionId] = useState(null);

  // Enable audio feedback
  const { audioEnabled, enableAudio } = useSpeechFeedback(counters, feedback, model_feedback);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(statusUrl);
        const data = await res.json();
        const { counters, feedback, model_feedback } = mapData(data);
        setCounters(counters);
        setFeedback(feedback);
        setModelFeedback(model_feedback || {});
      } catch (err) {
        console.error(`Error fetching ${title} status:`, err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [statusUrl, title, mapData]);

    useEffect(() => {
    const startSession = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/exercise/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: 2, // replace later with real user
            exercise_type: title.toLowerCase(),
          }),
        });

        const data = await res.json();
        setSessionId(data.session_id);
        console.log("Session started:", data.session_id);
      } catch (err) {
        console.error("Failed to start session:", err);
      }
    };

    startSession();
  }, [title]);

  // 🔥 Complete session when timer finishes
  const handleSessionComplete = async () => {
    if (!sessionId) return;

    try {
      await fetch("http://localhost:5000/api/exercise/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      console.log("Session completed");
    } catch (err) {
      console.error("Error completing session:", err);
    }
  };

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", color: "#232323" }}>
      {/* Header */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          padding: "0 44px 12px",
          gap: 18,
        }}
      >
        <Link
          to="/progress"
          style={{
            fontWeight: 500,
            color: "#232323",
            textDecoration: "none",
            fontSize: "1.11rem",
            marginRight: 18,
            background: "#fff",
            borderRadius: 4,
            padding: "7px 18px",
            border: "1px solid #ececec",
          }}
        >
          ← Back
        </Link>
        <span style={{ fontWeight: 700, fontSize: "1.42rem" }}>{title}</span>
      </div>

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 44px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 34,
        }}
      >
        <div style={{ display: "flex", gap: 32, marginBottom: 10, position: "relative" }}>
          {/* AI Instructor block */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 10,
              padding: "30px 28px",
              minWidth: 350,
              boxShadow: "0 2px 12px rgba(42,53,112,0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 7,
                width: "100%",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "1.26rem" }}>AI Instructor</div>
              <button
                onClick={enableAudio}
                style={{
                  fontSize: "0.85rem",
                  background: audioEnabled ? "#4CAF50" : "#eef3fc",
                  color: audioEnabled ? "#fff" : "#232323",
                  border: "none",
                  borderRadius: 10,
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {audioEnabled ? "🎤 Audio On" : "🎤 Enable Audio"}
              </button>
            </div>

            {/* Video instead of placeholder */}
            <video
              src={ title === "Squats" ? "/videos/squat.mp4" : ( title === "BicepCurls" ? "/videos/bicepcurl.mp4" : "/videos/neck.mp4")}
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: "100%",
                maxHeight: 280,
                borderRadius: 10,
                objectFit: "cover",
                background: "#000",
              }}
            />
          </div>

          {/* Your Form block */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 10,
              padding: 16,
              minWidth: 350,
              minHeight: 400,
              boxShadow: "0 2px 12px rgba(42,53,112,0.1)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                marginBottom: 20,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 24 }}>Your Form</span>
            </div>

            {/* Live MJPEG stream from Flask */}
            <img
              src={liveUrl}
              alt={`${title} Live Feed`}
              style={{
                width: "100%",
                height: 340,
                borderRadius: 10,
                objectFit: "cover",
                background: "#000",
              }}
            />
          </div>

          {/* Session timer absolutely positioned */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: -50,
              padding: "10px 12px",
              borderRadius: 8,
              zIndex: 20,
            }}
          >
            <SessionTimer storageKey={`session-${title}`} initialMinutes={3} autoStart={true} onFinish={handleSessionComplete} />
          </div>
        </div>

        {/* Feedback row */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: "34px 30px",
              minWidth: 560,
              boxShadow: "0 2px 14px rgba(42,53,112,0.13)",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "1.21rem",
                color: "#232323",
                marginBottom: 16,
              }}
            >
              Feedback
            </div>

            {Object.keys(counters).map((key) => (
              <p key={key}>
                <strong>{key}:</strong> {counters[key]} reps | {feedback[key] ?? ""} {model_feedback[key] && model_feedback[key] !== "none" ? `| 🤖 ${model_feedback[key]}` : ""}
              </p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Exercise;