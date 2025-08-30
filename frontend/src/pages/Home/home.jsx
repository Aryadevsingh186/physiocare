import React from "react";
import NavBar from "../Navigationbar/navigation";  // adjust relative path as needed

const Home = () => (
  <main style={{ background: "#fff", minHeight: "100vh" }}>
    <NavBar />
    {/* Main Section */}
    <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "64px 84px 0 84px", gap: "48px" }}>
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: "600",
          color: "#1596f3",
          lineHeight: "1.08"
        }}>
          Personalized AI-Powered Physiotherapy at Your Fingertips
        </h1>
        <p style={{ fontSize: "1.2rem", marginTop: "28px" }}>
          Experience intelligent physiotherapy at home with real-time AI posture tracking, expert guidance, and personalized feedback to accelerate your recovery journey.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "18px", marginTop: "38px" }}>
          <button style={{
            background: "#1496f3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "14px 28px",
            fontWeight: "500",
            fontSize: "1rem",
            cursor: "pointer"
          }}>Get Started Free</button>
          <button style={{
            background: "#fff",
            color: "#232323",
            border: "1px solid #1496f3",
            borderRadius: "6px",
            padding: "14px 28px",
            fontWeight: "500",
            fontSize: "1rem",
            cursor: "pointer"
          }}>Watch Demo</button>
        </div>
        <div style={{ marginTop: "33px", display: "flex", gap: "24px", color: "#626262", fontSize: "1.08rem" }}>
          <span>✓ No equipment needed</span>
          <span>✓ Doctor approved</span>
          <span>✓ Real-time feedback</span>
        </div>
      </div>
      <div style={{
        flex: 1, background: "rgba(21,150,243,0.06)",
        borderRadius: "18px",
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "295px"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            background: "#1496f3",
            borderRadius: "50%",
            width: "68px",
            height: "68px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "auto"
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M8 6v12l10-6-10-6z" fill="#fff" />
            </svg>
          </div>
          <div style={{ marginTop: "18px", fontSize: "1.09rem", color: "#232323" }}>
            AI Exercise Demo
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default Home;
