import React, { useState } from "react";
import axios from "axios";

export default function ReportTest() {
  const [summary, setSummary] = useState("");

  const handleGenerate = async () => {
    const payload = {
      patientName: "John Doe",
      weekData: {
        exercises: [
          { name: "Bicep Curl", sessions: 5, avgScore: 85 },
          { name: "Squat", sessions: 4, avgScore: 78 }
        ],
        feedback: "Good posture improvement, moderate fatigue midweek."
      }
    };

    try {
      const res = await axios.post("http://localhost:5000/api/report", payload);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setSummary("Error generating report.");
    }
  };

  return (
    <div className="p-6">
      <h1>Generate Report Test</h1>
      <button onClick={handleGenerate}>Generate Report</button>
      <pre className="mt-4 bg-gray-100 p-4">{summary}</pre>
    </div>
  );
}
