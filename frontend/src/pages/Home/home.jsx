import React from "react";
import NavBar from "../Navigationbar/navigation";
import "./Home.css"; // your custom styles

const Home = () => (
  <main style={{ background: "#fff", minHeight: "100vh" }}>
    <NavBar />

    {/* Main Section */}
    <section
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "64px 84px 0 84px",
        gap: "48px",
        flexWrap: "wrap",
      }}
    >
      {/* Left Content */}
      <div style={{ flex: 1, minWidth: "320px" }}>
        <h1
          style={{
            fontSize: "2.6rem",
            fontWeight: "600",
            color: "#1596f3",
            lineHeight: "1.08",
            textAlign: "left",
          }}
        >
          Personalized AI-Powered Physiotherapy at Your Fingertips
        </h1>
        <p style={{ fontSize: "1.2rem", marginTop: "28px" }}>
          Experience intelligent physiotherapy at home with real-time AI posture tracking,
          expert guidance, and personalized feedback to accelerate your recovery journey.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginTop: "38px",
          }}
        >
          <button
            style={{
              background: "#1496f3",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "14px 28px",
              fontWeight: "500",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Get Started Free
          </button>
          <button
            style={{
              background: "#fff",
              color: "#232323",
              border: "1px solid #1496f3",
              borderRadius: "6px",
              padding: "14px 28px",
              fontWeight: "500",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Watch Demo
          </button>
        </div>

        <div
          style={{
            marginTop: "33px",
            display: "flex",
            gap: "24px",
            color: "#626262",
            fontSize: "1.08rem",
          }}
        >
          <span>✓ No equipment needed</span>
          <span>✓ Doctor approved</span>
          <span>✓ Real-time feedback</span>
        </div>
      </div>

      {/* Right Image */}
      <div style={{ flex: 1, textAlign: "center", minWidth: "320px" }}>
        <img
          src={process.env.PUBLIC_URL + "/homephoto.jpg"}
          alt="Physiotherapy"
          className="blend-image"
        />
      </div>
    </section>
  </main>
);

export default Home;
