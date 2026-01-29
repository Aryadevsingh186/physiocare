import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const Exercise = ({ title, statusUrl, liveUrl, mapData }) => {
  const [counters, setCounters] = useState({});
  const [feedback, setFeedback] = useState({});
  const [activated, setActivated] = useState(false);
  const [transcript, setTranscript] = useState(""); // Live transcription

  const sessionId = useRef(`sess-${Date.now()}`);

  /* ---------------- SPEECH REFS ---------------- */
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const started = useRef(false);

  /* ---------------- SPEAK ---------------- */
  const speak = (text) => {
    if (!text) return;

    stopListening(); // prevent AI hearing itself
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    utterance.onend = () => {
      if (activated) startListening(); // resume mic
    };

    speechSynthesis.speak(utterance);
  };

  /* ---------------- LISTEN ---------------- */
  const startListening = () => {
    if (!recognitionRef.current || listeningRef.current) return;
    listeningRef.current = true;
    recognitionRef.current.start();
  };

  const stopListening = () => {
    listeningRef.current = false;
    recognitionRef.current?.stop();
  };

  /* ---------------- INIT SPEECH RECOGNITION ---------------- */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true; // shows partial words

    recognition.onresult = (event) => {
      const last =
        event.results[event.results.length - 1][0].transcript.trim();

      if (last.length > 0) {
        setTranscript(last); // Show live transcript
        console.log("AI HEARD:", last); // Log in console
        // Commented out for testing, uncomment later for AI replies
        // sendAgentReply(last);
      }
    };

    recognition.onend = () => {
      if (listeningRef.current) recognition.start();
    };

    recognitionRef.current = recognition;
  }, []);

  /* ---------------- AGENT START ---------------- */
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    fetch("http://localhost:5001/agent/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId.current,
        exercise: title.toLowerCase()
      })
    })
      .then((res) => res.json())
      .then((data) => speak(data.message));
  }, [title]);

  /* ---------------- ACTIVATE AI (USER GESTURE) ---------------- */
  const activateAI = () => {
    setActivated(true);
    startListening();
  };

  /* ---------------- AGENT UPDATE ---------------- */
  const sendAgentReply = (text) => {
    fetch("http://localhost:5001/agent/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId.current,
        user_input: text
      })
    })
      .then((res) => res.json())
      .then((data) => speak(data.message));
  };

  /* ---------------- STATUS POLLING ---------------- */
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(statusUrl);
      const data = await res.json();
      const mapped = mapData(data);
      setCounters(mapped.counters);
      setFeedback(mapped.feedback);
    }, 500);

    return () => clearInterval(interval);
  }, [statusUrl, mapData]);

  /* ---------------- UI ---------------- */
  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px" }}>
        <Link to="/progress">← Back</Link>
        <h2>{title}</h2>

        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h3>AI Instructor</h3>

            {!activated && (
              <button
                onClick={activateAI}
                style={{
                  padding: "10px 16px",
                  background: "#2a3570",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                ▶ Activate AI Coach
              </button>
            )}

            <video
              src={
                title === "Squats"
                  ? "/videos/squat.mp4"
                  : title === "BicepCurls"
                  ? "/videos/bicepcurl.mp4"
                  : "/videos/neck.mp4"
              }
              autoPlay
              muted
              loop
              style={{ width: "100%", marginTop: 10 }}
            />

            <div style={{ marginTop: 20 }}>
              <h4>Live Transcript (AI hears):</h4>
              <p
                style={{
                  background: "#fff",
                  padding: 10,
                  borderRadius: 6,
                  minHeight: 50,
                  border: "1px solid #ccc"
                }}
              >
                {transcript}
              </p>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3>Your Form</h3>
            <img src={liveUrl} alt="Live" style={{ width: "100%" }} />
          </div>
        </div>

        <div>
          <h3>Feedback</h3>
          {Object.keys(counters).map((key) => (
            <p key={key}>
              {key}: {counters[key]} | {feedback[key]}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Exercise;
