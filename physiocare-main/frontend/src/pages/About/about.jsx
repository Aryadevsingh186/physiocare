import React from "react";
import NavBar from "../Navigationbar/navigation";  // adjust relative path as needed
import { FaBullseye, FaUserMd, FaShieldAlt, FaClock, FaAward, FaDollarSign } from "react-icons/fa";

const features = [
  {
    icon: <FaBullseye size={40} />,
    title: "AI Precision Tracking",
    desc: "Advanced computer vision analyzes your posture in real-time, providing instant feedback and corrections for optimal recovery."
  },
  {
    icon: <FaShieldAlt size={40} />,
    title: "Safe at Home",
    desc: "Reduce exposure risks and rehabilitation costs while maintaining professional-grade physiotherapy standards from your living room."
  },
  {
    icon: <FaUserMd size={40} />,
    title: "Doctor Integration",
    desc: "Your physiotherapist can monitor progress, adjust plans, and provide guidance remotely through our integrated platform."
  },
  {
    icon: <FaClock size={40} />,
    title: "24/7 Availability",
    desc: "Access your personalized rehabilitation program anytime, anywhere with consistent guidance and motivation."
  },
  {
    icon: <FaAward size={40} />,
    title: "Evidence-Based",
    desc: "All exercises are based on proven physiotherapy methods and continuously optimized through AI learning algorithms."
  },
  {
    icon: <FaDollarSign size={40} />,
    title: "Cost Effective",
    desc: "Reduce healthcare costs by up to 60% while maintaining professional-quality rehabilitation outcomes."
  }
];

const cardStyleBase = {
  background: "#fff",
  borderRadius: "18px",
  boxShadow: "0 1px 12px rgba(25,39,52,0.07)",
  padding: "32px 26px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  minHeight: "215px",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer",
};

const About = () => {
  // Added inline hover style handler using React state per card
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  return (
    <main style={{ background: "#fafbfc", minHeight: "100vh" }}>
      <NavBar />
      <section style={{ padding: "68px 0" }}>
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <h2 style={{ fontWeight: 600, fontSize: "2.2rem" }}>Why Choose PhysioCare?</h2>
          <p style={{ color: "#606068", fontSize: "1.2rem", marginTop: "12px" }}>
            Bridge the gap between clinic and home with AI-powered rehabilitation
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "34px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {features.map((feature, idx) => {
            const isHovered = idx === hoveredIndex;
            return (
              <div
                key={idx}
                style={{
                  ...cardStyleBase,
                  transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                  boxShadow: isHovered ? "0 8px 24px rgba(25,39,52,0.15)" : cardStyleBase.boxShadow,
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div style={{ color: "#232323", marginBottom: "16px" }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontWeight: 500, fontSize: "1.28rem", marginBottom: "8px" }}>{feature.title}</h3>
                <p style={{ color: "#3d3c3c", fontSize: "1.12rem", lineHeight: "1.53" }}>{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  );
};

export default About;
