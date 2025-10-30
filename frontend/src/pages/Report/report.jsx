import React, { useState } from "react";

const Report = () => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReport("");

    // Sample data for now (replace with actual from DB later)
    const weekData = {
      exercises: [
        { name: "Bicep Curl", sessions: 5, avgScore: 85 },
        { name: "Squat", sessions: 4, avgScore: 78 },
      ],
      feedback: "Good improvement in form, slight fatigue mid-week.",
    };

    try {
      const response = await fetch("http://localhost:5000/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: "John Doe", weekData }),
      });

      const data = await response.json();
      setReport(data.summary);
    } catch (error) {
      console.error("Error generating report:", error);
      setReport("❌ Failed to generate report.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "2rem" }}>
      <h2>🩺 Weekly Progress Report</h2>
      <button
        onClick={handleGenerateReport}
        disabled={loading}
        style={{
          backgroundColor: "#3b82f6",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {report && (
        <div
          style={{
            marginTop: "2rem",
            background: "#f9fafb",
            padding: "1.5rem",
            borderRadius: "10px",
            whiteSpace: "pre-wrap",
            lineHeight: "1.6",
          }}
        >
          {report}
        </div>
      )}
    </div>
  );
};

export default Report;
