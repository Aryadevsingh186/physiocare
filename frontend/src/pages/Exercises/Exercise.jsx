import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Exercise = ({ title, statusUrl, liveUrl, mapData }) => {
  const [counters, setCounters] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(statusUrl);
        const data = await res.json();
        const { counters, feedback } = mapData(data);
        setCounters(counters);
        setFeedback(feedback);
      } catch (err) {
        console.error(`Error fetching ${title} status:`, err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [statusUrl, title, mapData]);

  return (
    <div
      style={{
        background: "#f9fafb",
        minHeight: "100vh",
        color: "#232323"
      }}
    >
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
        <div style={{ display: "flex", gap: 32, marginBottom: 10 }}>
          {/* AI Instructor block */}
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
    <span
      style={{
        fontSize: "0.98rem",
        background: "#eef3fc",
        color: "#232323",
        borderRadius: 10,
        padding: "7px 18px",
      }}
    >
      Demo
    </span>
  </div>

  {/* Video instead of placeholder */}
  <video
    src={ title === "Squats" ? "/videos/squat.mp4" : ( title === "BicepCurls" ? "/videos/bicepcurl.mp4" : "/videos/neck.mp4")}
    autoPlay
    muted
    loop
    playsInline
    style={{
      width: "100%" ,
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
                {key}: {counters[key]} | {feedback[key] ?? ""}
              </p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Exercise;
