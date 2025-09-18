import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const NeckRotation = () => {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    let stream;
    if (cameraActive) {
      (async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          alert("Camera access denied or not available!");
          setCameraActive(false);
        }
      })();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  const handleOpenCamera = () => {
    setCameraActive(true);
  };

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", color: "#232323", fontFamily: "inherit" }}>
      {/* Instruction Box */}
      <div style={{
        background: "#eef3fc",
        borderRadius: 10,
        padding: "15px 26px",
        color: "#232323",
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontSize: "1.13rem",
        fontWeight: 600,
        maxWidth: 800,
        margin: "20px auto 32px auto",
        boxShadow: "0 1px 7px rgba(21,150,243,0.10)",
        justifyContent: "center"
      }}>
        <svg width={27} height={27} viewBox="0 0 24 24" fill="none">
          <circle cx={12} cy={12} r={12} fill="#33a9ff" />
        </svg>
        <span>Position yourself in front of the camera</span>
        <span style={{ color: "#7b7b88", fontWeight: 500 }}>Keep your movements slow and controlled</span>
      </div>

      {/* Header */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        padding: "0 44px 12px",
        gap: 18,
      }}>
        <Link to="/progress" style={{
          fontWeight: 500,
          color: "#232323",
          textDecoration: "none",
          fontSize: "1.11rem",
          marginRight: 18,
          background: "#fff",
          borderRadius: 4,
          padding: "7px 18px",
          border: "1px solid #ececec",
        }}>
          ← Back
        </Link>
        <span style={{ fontWeight: 700, fontSize: "1.42rem" }}>Neck Rotation</span>
        <span style={{ fontSize: "1.02rem", color: "#7b7b88", marginLeft: 18, fontWeight: 500 }}>Rep 1 of 10</span>
      </div>

      <main style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 44px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 34,
      }}>
        {/* AI Instructor and Your Form Row */}
        <div style={{ display: "flex", gap: 32, marginBottom: 10 }}>
          
          {/* AI Instructor block */}
          <div style={{
            flex: 1,
            background: "#fff",
            borderRadius: 10,
            padding: "30px 28px",
            minWidth: 350,
            boxShadow: "0 2px 12px rgba(42,53,112,0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <div style={{ fontWeight: 700, fontSize: "1.26rem" }}>AI Instructor</div>
              <span style={{
                fontSize: "0.98rem",
                background: "#eef3fc",
                color: "#232323",
                borderRadius: 10,
                padding: "7px 18px",
              }}>
                Demo
              </span>
            </div>
            <div style={{ margin: "22px 0", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{
                background: "linear-gradient(120deg,#7851ff 0%,#5329d5 100%)",
                borderRadius: 10,
                width: 260,
                height: 110,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}>
                <svg width={52} height={52} viewBox="0 0 24 24" fill="none">
                  <circle cx={12} cy={12} r={12} fill="#fff" />
                  <path d="M8 6v12l10-6-10-6z" fill="#232323" />
                </svg>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <button style={{
                background: "#1496f3",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 28px",
                fontWeight: 500,
                fontSize: 18,
                cursor: "pointer",
              }}>Play</button>
              <button style={{
                background: "#f3f6fa",
                color: "#232323",
                border: "none",
                borderRadius: 10,
                padding: "12px 28px",
                fontWeight: 500,
                fontSize: 18,
                cursor: "pointer",
              }}>Restart</button>
            </div>
          </div>

          {/* Your Form block (same size, bigger video, no accuracy label) */}
          <div style={{
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
            alignItems: "center"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginBottom: 20
            }}>
              <span style={{ fontWeight: 700, fontSize: 24 }}>Your Form</span>
              {/* Removed accuracy label as requested */}
            </div>

            <video
              ref={videoRef}
              autoPlay
              muted
              style={{
                width: "100%",
                height: 340,
                borderRadius: 10,
                objectFit: "cover",
                background: "#000",
                zIndex: 0
              }}
            />

            {!cameraActive && (
              <button
                onClick={handleOpenCamera}
                style={{
                  position: "absolute",
                  top: "45%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "#fff",
                  color: "#1496f3",
                  border: "none",
                  borderRadius: "50%",
                  width: 50,
                  height: 50,
                  fontSize: 28,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <FaPlus />
              </button>
            )}
          </div>
        </div>

        {/* Feedback row */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{
            background: "#fff",
            borderRadius: 8,
            padding: "34px 30px",
            minWidth: 560,
            boxShadow: "0 2px 14px rgba(42,53,112,0.13)",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
            <div style={{ fontWeight: 700, fontSize: "1.21rem", color: "#232323" }}>Feedback</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NeckRotation;
