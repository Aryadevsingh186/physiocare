import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        🩺 Weekly Progress Report
      </h2>
      <button
        onClick={handleGenerateReport}
        disabled={loading}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "600",
          transition: "background 0.3s ease",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#1e40af")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#2563eb")}
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {report && (
        <div
          style={{
            marginTop: "2rem",
            background: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            lineHeight: "1.7",
            fontSize: "1rem",
          }}
        >
          <ReactMarkdown
            children={report}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1
                  style={{
                    fontSize: "1.5rem",
                    color: "#1e40af",
                    borderBottom: "2px solid #e5e7eb",
                    paddingBottom: "0.25rem",
                    marginTop: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  style={{
                    fontSize: "1.25rem",
                    color: "#2563eb",
                    marginTop: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {children}
                </h2>
              ),
              strong: ({ children }) => (
                <strong style={{ color: "#111827" }}>{children}</strong>
              ),
              li: ({ children }) => (
                <li style={{ marginBottom: "0.25rem", marginLeft: "1rem" }}>
                  {children}
                </li>
              ),
              p: ({ children }) => (
                <p style={{ marginBottom: "0.75rem" }}>{children}</p>
              ),
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Report;
