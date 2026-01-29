import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBullseye, FaClock, FaFire, FaStar } from "react-icons/fa";
import { FiSettings, FiFilter } from "react-icons/fi";
import { AiOutlineBarChart } from "react-icons/ai";
const stats = [
  { label: "This Week", value: 12, icon: <FaBullseye /> },
  { label: "Total Time", value: "4.2h", icon: <FaClock /> },
  { label: "Accuracy", value: "94%", icon: <FaStar /> },
  { label: "Streak", value: "7 days", icon: <FaFire /> },
];

const areas = ["All Areas", "Neck", "Back", "Hips", "Knees", "Ankles", "Shoulders"];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const tabs = ["Overview", "Exercises", "Calendar", "Achievements"];

const exercises = [
  { name: "Neck Rotation", rating: 4.8 },
  { name: "Shoulder Blade Squeeze", rating: 4.9 },
  { name: "Hip Flexor Stretch", rating: 4.7 },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selectedArea, setSelectedArea] = useState(areas[0]);
  const [selectedLevel, setSelectedLevel] = useState(levels[0]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Placeholder initial for user icon
  const userInitial = "U";

  return (
    <div style={{ background: "#F7F8FA", minHeight: "100vh" }}>
      <header
        style={{
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 44px",
          borderBottom: "1px solid #eee",
          minHeight: "62px",
          fontSize: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <img src="\logo.jpg" alt="logo" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <span style={{ fontWeight: 600, fontSize: "1.23rem", color: "#1496f3" }}>PhysioCare</span>
          <span style={{ fontWeight: 500, fontSize: "1.04rem", color: "#888", marginLeft: 22 }}>
            Exercise Selection
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32, position: "relative" }}>
          <Link
            to="/progress"
            style={{
              fontWeight: 500,
              color: "#232323",
              display: "flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
            }}
          >
            <AiOutlineBarChart />
            Progress
          </Link>
          <button
            type="button"
            onClick={() => setSettingsOpen(!settingsOpen)}
            style={{
              fontWeight: 500,
              color: "#232323",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            <FiSettings />
            Settings
          </button>
          {settingsOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "#fff",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                borderRadius: 8,
                marginTop: 6,
                zIndex: 999,
                minWidth: 140,
                padding: "10px 0",
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "10px 20px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontWeight: 500,
                  color: "#e53935",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#fddede")}
                onMouseLeave={(e) => (e.target.style.background = "transparent")}
              >
                Logout
              </button>
            </div>
          )}
          {/* User Profile Circle */}
          <div
            onClick={() => navigate("/userprofile")}
            style={{
              background: "#eaf1fb",
              color: "#1496f3",
              fontWeight: 600,
              borderRadius: "50%",
              width: 39,
              height: 39,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.07rem",
              cursor: "pointer",
              userSelect: "none",
            }}
            title="User Profile"
          >
            {userInitial}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1140, margin: "0 auto", padding: "42px 30px 60px 30px" }}>
        <h1 style={{ fontWeight: 600, fontSize: "2.2rem", marginBottom: 6 }}>Welcome back!</h1>
        <p style={{ fontSize: "1.25rem", color: "#444", marginBottom: 28 }}>
          Choose your next exercise to continue your recovery journey.
        </p>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            background: "#ececf6",
            borderRadius: 11,
            marginBottom: 26,
            overflow: "hidden",
            fontSize: "1.08rem",
            fontWeight: 500,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                cursor: "pointer",
                border: "none",
                background: activeTab === tab ? "#fff" : "transparent",
                color: activeTab === tab ? "#232323" : "#75757B",
                padding: "13px 0",
                borderRadius: activeTab === tab ? 10 : 0,
                fontWeight: 500,
                outline: "none",
                transition: "background 0.2s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search exercises..."
            style={{
              flex: 1,
              minWidth: 200,
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #e4e7ef",
              padding: "11px 14px",
              fontSize: "1.1rem",
            }}
          />
          <button
            style={{
              background: "#fff",
              border: "1px solid #e4e7ef",
              borderRadius: 8,
              padding: "8px 22px",
              fontWeight: 600,
              fontSize: "1.05rem",
              color: "#232323",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <FiFilter size={20} /> Filters
          </button>
        </div>

        {/* Area Buttons */}
        <div
          style={{
            display: "flex",
            gap: 18,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              style={{
                background: area === selectedArea ? "#fff" : "#ebebf6",
                color: area === selectedArea ? "#232323" : "#75757B",
                fontWeight: 600,
                fontSize: "1.1rem",
                padding: "10px 28px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Level Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 30,
            flexWrap: "wrap",
          }}
        >
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              style={{
                background: level === selectedLevel ? "#181822" : "#fff",
                color: level === selectedLevel ? "#fff" : "#232323",
                fontWeight: 600,
                fontSize: "1rem",
                padding: "9px 26px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: level === selectedLevel ? "0 2px 10px rgba(25,39,52,0.15)" : "none",
                flexShrink: 0,
              }}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Exercises Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 28,
          }}
        >
          {exercises.map((exercise, idx) => (
            <div
              key={idx}
              style={{
                background: "linear-gradient(120deg, #e1ecff 0%, #f3fafd 100%)",
                borderRadius: 18,
                boxShadow: "0 2px 9px rgba(25,39,52,0.08)",
                padding: "30px 25px 25px",
                display: "flex",
                flexDirection: "column",
                minHeight: 168,
                position: "relative",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: "1 1 auto",
                  marginBottom: 15,
                }}
              >
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path d="M8 6v12l10-6-10-6z" fill="#232323" />
                </svg>
              </div>
              <div
                style={{ fontWeight: 600, fontSize: "1.2rem", color: "#232323" }}
              >
                {exercise.name}
              </div>
              <div
                style={{ color: "#757575", fontSize: "1rem", fontWeight: 600, marginTop: 3 }}
              >
                Exercise
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 15,
                  right: 20,
                  color: "#FFC107",
                  fontWeight: 700,
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaStar style={{ marginRight: 6 }} /> {exercise.rating}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
