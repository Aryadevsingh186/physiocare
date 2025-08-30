import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const poseAnalysis = [
  { part: "Head", status: "Good" },
  { part: "Shoulders", status: "Needs Attention" },
  { part: "Elbows", status: "Good" },
  { part: "Wrists", status: "Good" },
  { part: "Spine", status: "Good" },
  { part: "Hips", status: "Needs Attention" },
  { part: "Knees", status: "Good" },
  { part: "Ankles", status: "Good" }
];

const NeckRotation = () => (
  <div style={{ background: "#181822", minHeight: "100vh", color: "#fff", fontFamily: "inherit" }}>
    <header style={{
      padding: "24px 46px 8px 46px",
      display: "flex",
      alignItems: "center",
      fontSize: "1.35rem"
    }}>
      <Link to="/progress" style={{ fontWeight: 500, color: "#fff", textDecoration: "none", fontSize: "1.1rem", marginRight: "16px" }}>← Back</Link>
      <span style={{ fontWeight: 600 }}>Neck Rotation</span>
      <span style={{ fontSize: "1.05rem", color: "#b8b8d3", marginLeft: "22px" }}>Rep 1 of 10</span>
    </header>
    <main style={{ maxWidth: 1220, margin: "0 auto", padding: "0 46px 32px", display: "flex", flexDirection: "column", gap: "28px" }}>
      <div style={{ display: "flex", gap: "24px", marginBottom: "18px", flexWrap: "wrap" }}>
        {/* AI Instructor */}
        <div style={{ flex: 2, background: "#22263a", borderRadius: "16px", padding: "24px", minWidth: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
            <div style={{ fontWeight: 700, fontSize: "1.13rem" }}>AI Instructor</div>
            <span style={{
              fontSize: ".92rem", background: "#323758", borderRadius: "8px", padding: "4px 14px"
            }}>Demo</span>
          </div>
          <div style={{ margin: "36px 0 27px 0", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{
              background: "linear-gradient(120deg,#7851ff 0%,#5329d5 100%)",
              borderRadius: "18px", width: "230px", height: "120px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="28" fill="#fff" />
                <path d="M8 6v12l10-6-10-6z" fill="#232323" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button style={{
              background: "#181822", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 500, cursor: "pointer"
            }}>Play</button>
            <button style={{
              background: "none", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 500, cursor: "pointer"
            }}>Restart</button>
          </div>
        </div>
        {/* Your Form */}
        <div style={{ flex: 2, background: "#22263a", borderRadius: "16px", padding: "24px", minWidth: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
            <div style={{ fontWeight: 700, fontSize: "1.13rem" }}>Your Form</div>
            <span style={{
              background: "#323758", borderRadius: "8px", padding: "4px 13px", fontWeight: 600
            }}>85% Accuracy</span>
          </div>
          <div style={{
            margin: "32px 0", display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <div style={{
              background: "#33d181", borderRadius: "50%", width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="20" fill="#fff" />
                <path d="M12 8l0 8m-4-4l8 0" stroke="#232323" strokeWidth="1.5" />
              </svg>
            </div>
            <div style={{ marginTop: "12px", fontSize: "1.08rem", color: "#fff" }}>Live Camera Feed</div>
          </div>
          <div style={{ color: "#b8b8d3", marginTop: 18, fontSize: ".98rem" }}>Rep Progress</div>
          <div style={{
            background: "#323758", borderRadius: "8px", height: "7px", width: "100%", marginTop: "7px"
          }}>
            <div style={{ height: "7px", width: "12%", background: "#33d181", borderRadius: "8px" }}></div>
          </div>
          <div style={{ textAlign: "right", color: "#fff", marginTop: "2px", fontSize: ".96rem" }}>12%</div>
        </div>
        {/* Session Progress */}
        <div style={{ flex: 1, background: "#22263a", borderRadius: "16px", padding: "24px", minWidth: 240 }}>
          <div style={{ fontWeight: 700, fontSize: "1.13rem", color: "#fff", marginBottom: "8px" }}>Session Progress</div>
          <div style={{ color: "#b8b8d3", fontSize: ".99rem", marginBottom: "8px" }}>Repetitions</div>
          <div style={{
            background: "#323758", borderRadius: "6px", height: "10px", width: "100%", marginBottom: "10px"
          }}>
            <div style={{ height: "10px", width: "0%", background: "#ffd966", borderRadius: "8px" }}></div>
          </div>
          <div style={{ color: "#b8b8d3", fontSize: ".99rem", marginBottom: "12px" }}>Overall Accuracy</div>
          <div style={{
            background: "#323758", borderRadius: "6px", height: "10px", width: "100%", marginBottom: "18px"
          }}>
            <div style={{ height: "10px", width: "85%", background: "#33d181", borderRadius: "8px" }}></div>
          </div>
          <div style={{ fontWeight: 600, color: "#33d181", fontSize: "1.04rem", marginBottom: "13px" }}>85%</div>
          <div style={{ color: "#b8b8d3", fontSize: ".99rem" }}>Time Elapsed</div>
          <div style={{ fontWeight: 600, color: "#fff", fontSize: "1.07rem", marginTop: "4px" }}>02:34</div>
        </div>
        {/* Pose Analysis */}
        <div style={{ flex: 1, background: "#22263a", borderRadius: "16px", padding: "24px", minWidth: 230 }}>
          <div style={{ fontWeight: 700, fontSize: "1.13rem", color: "#fff", marginBottom: "13px" }}>Pose Analysis</div>
          {poseAnalysis.map((item, idx) => (
            <div key={idx} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "13px", fontSize: "1.04rem"
            }}>
              <div>{item.part}</div>
              <div style={{
                color: item.status === "Good" ? "#33d181" : "#FFD600", fontWeight: 600, display: "flex", alignItems: "center", gap: 7
              }}>
                {item.status === "Good"
                  ? <FaCheckCircle style={{ color: "#33d181" }} />
                  : <FaExclamationCircle style={{ color: "#FFD600" }} />}
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Instruction Box */}
      <div style={{
        marginTop: "18px",
        background: "#1e2240",
        borderRadius: "14px",
        padding: "18px 26px",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontSize: "1.08rem"
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#33a9ff" />
        </svg>
        <span style={{ fontWeight: 600 }}>
          Position yourself in front of the camera
        </span>
        <span style={{ color: "#b8b8d3" }}>
          Keep your movements slow and controlled
        </span>
      </div>
    </main>
  </div>
);

export default NeckRotation;
