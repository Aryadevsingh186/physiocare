import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBullseye, FaClock, FaFire, FaStar } from "react-icons/fa";
import { BsAward } from "react-icons/bs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const Progress = () => {
  const navigate = useNavigate();

  // Chart data
  const lineData = {
    labels: ["1", "2", "3", "4", "5", "6", "7"],
    datasets: [
      {
        label: "Accuracy",
        data: [67, 72, 74, 77, 80, 84, 91],
        borderColor: "#1496f3",
        tension: 0.25,
        pointBackgroundColor: "#1496f3",
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 100, ticks: { stepSize: 25 } } }
  };
  const pieData = {
    labels: ["Neck", "Shoulders", "Back", "Hips"],
    datasets: [{
      data: [35, 25, 20, 20],
      backgroundColor: ["#2f8fff", "#1cc7d0", "#ffd966", "#ff8456"],
      borderWidth: 1
    }]
  };
  const pieOptions = { responsive: true, plugins: { legend: { display: false } } };
  const sessions = [
    { name: "Neck Rotation", ago: "2 hours ago", accuracy: 87, result: "Great", time: "5:42" },
    { name: "Shoulder Squeeze", ago: "1 day ago", accuracy: 82, result: "Good", time: "8:15" },
    { name: "Back Extension", ago: "2 days ago", accuracy: 79, result: "Good", time: "7:30" },
    { name: "Hip Flexor", ago: "3 days ago", accuracy: 91, result: "Great", time: "10:20" },
    { name: "Neck Rotation", ago: "4 days ago", accuracy: 84, result: "Good", time: "6:10" },
  ];

  return (
    <div style={{ background: "#F7F8FA", minHeight: "100vh", fontFamily: "inherit" }}>
      {/* Top Header */}
      <header style={{
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 44px",
        borderBottom: "1px solid #eee",
        minHeight: "62px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <Link to="/dashboard" style={{ color: "#232323", fontWeight: 500, fontSize: "1.15rem", textDecoration: "none" }}>← Back</Link>
          <span style={{ fontWeight: 600, fontSize: "1.3rem", color: "#232323" }}>Progress Dashboard</span>
          <span style={{ fontWeight: 500, fontSize: "1.04rem", color: "#888", marginLeft: "22px" }}>Track your physiotherapy journey</span>
        </div>
      </header>

      {/* Dashboard Main Body */}
      <main style={{ maxWidth: 1140, margin: "0 auto", padding: "38px 30px 0 30px" }}>
        {/* Stat Cards */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
          <div style={{ flex: 1, background: "#fff", borderRadius: "16px", boxShadow: "0 1px 6px rgba(25,39,52,0.07)", padding: "24px 18px", display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 700, fontSize: "2rem", color: "#232323", marginBottom: "3px" }}>47</span>
            <span style={{ color: "#888", fontSize: "1.08rem", marginBottom: "7px" }}>Total Sessions</span>
            <span style={{ color: "#1496f3", fontWeight: 600, fontSize: ".95rem" }}>+12% this week</span>
            <FaBullseye style={{ fontSize: 20, marginTop: 7, color: "#444" }} />
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: "16px", boxShadow: "0 1px 6px rgba(25,39,52,0.07)", padding: "24px 18px", display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 700, fontSize: "2rem", color: "#232323", marginBottom: "3px" }}>84%</span>
            <span style={{ color: "#888", fontSize: "1.08rem", marginBottom: "7px" }}>Avg Accuracy</span>
            <span style={{ color: "green", fontWeight: 600, fontSize: ".95rem" }}>+5% improvement</span>
            <BsAward style={{ fontSize: 20, marginTop: 7, color: "#FFD700" }} />
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: "16px", boxShadow: "0 1px 6px rgba(25,39,52,0.07)", padding: "24px 18px", display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 700, fontSize: "2rem", color: "#232323", marginBottom: "3px" }}>18.5h</span>
            <span style={{ color: "#888", fontSize: "1.08rem", marginBottom: "7px" }}>Total Time</span>
            <span style={{ color: "#1496f3", fontWeight: 600, fontSize: ".95rem" }}>2.3h this week</span>
            <FaClock style={{ fontSize: 20, marginTop: 7, color: "#1496f3" }} />
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: "16px", boxShadow: "0 1px 6px rgba(25,39,52,0.07)", padding: "24px 18px", display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 700, fontSize: "2rem", color: "#232323", marginBottom: "3px" }}>23</span>
            <span style={{ color: "#888", fontSize: "1.08rem", marginBottom: "7px" }}>Current Streak</span>
            <span style={{ color: "#ff6600", fontWeight: 600, fontSize: ".95rem" }}>days</span>
            <FaFire style={{ fontSize: 20, marginTop: 7, color: "#ff6600" }} />
          </div>
        </div>
        {/* Charts+Recent Section */}
        <div style={{ display: "flex", gap: "34px", marginBottom: "28px", flexWrap: "wrap" }}>
          {/* Line Chart */}
          <div style={{ flex: 1, background: "#fff", borderRadius: "18px", padding: "28px 24px", minWidth: "320px", boxShadow: "0 1px 11px rgba(25,39,52,0.09)" }}>
            <div style={{ fontWeight: 600, fontSize: "1.15rem", marginBottom: "7px" }}>Accuracy Improvement</div>
            <div style={{ color: "#7F8CA0", fontSize: "1.02rem", marginBottom: "22px" }}>Your form accuracy over the last 7 days</div>
            <Line data={lineData} options={lineOptions} />
          </div>
          {/* Pie Chart */}
          <div style={{ flex: 1, background: "#fff", borderRadius: "18px", padding: "28px 24px", minWidth: "320px", boxShadow: "0 1px 11px rgba(25,39,52,0.09)", }}>
            <div style={{ fontWeight: 600, fontSize: "1.15rem", marginBottom: "7px" }}>Focus Areas</div>
            <div style={{ color: "#7F8CA0", fontSize: "1.02rem", marginBottom: "22px" }}>Distribution of exercises by body part</div>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
        {/* Recent Sessions */}
        <div style={{ background: "#fff", borderRadius: "18px", padding: "28px 24px", boxShadow: "0 1px 11px rgba(25,39,52,0.09)", marginBottom: 28 }}>
          <div style={{ fontWeight: 600, fontSize: "1.15rem", marginBottom: "7px" }}>Recent Sessions</div>
          <div style={{ color: "#7F8CA0", fontSize: "1.02rem", marginBottom: "13px" }}>Your last 5 completed sessions</div>
          {sessions.map((sess, idx) => (
            <div key={idx} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "13px 0",
              borderBottom: idx < sessions.length - 1 ? "1px solid #f1f1f7" : "none",
              fontSize: "1.03rem"
            }}>
              {/* Make exercise name clickable */}
              <div>
                <button onClick={() => navigate("/neck-rotation")}
                  style={{ fontWeight: 500, background: "none", border: "none", color: "#232323", fontSize: "1.08rem", cursor: "pointer", textAlign: "left", padding: 0 }}>
                  {sess.name}
                </button>
                <div style={{ fontSize: ".98rem", color: "#888" }}>{sess.ago}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontWeight: 600 }}>{sess.accuracy}%</span>
                <span style={{
                  background: sess.result === "Great" ? "#181822" : "#eaeaea",
                  color: sess.result === "Great" ? "#fff" : "#232323",
                  padding: "4px 11px",
                  borderRadius: "7px",
                  fontWeight: 600,
                  fontSize: ".95rem"
                }}>
                  {sess.result}
                </span>
                <span style={{ fontWeight: 500, color: "#888" }}>{sess.time}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Progress;
