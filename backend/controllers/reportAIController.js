import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const generateReportSummary = async (req, res) => {
  try {
    const { patientName = "Patient", weekData } = req.body || {};

    // If frontend didn't provide structured weekData, try to fetch live status
    // from the Python backend (fitness tracker) running on port 5001.
    let dataForReport = weekData;
    if (!dataForReport) {
      try {
        const [bicepRes, squatRes, neckRes] = await Promise.all([
          axios.get("http://localhost:5001/bicep/status", { timeout: 2000 }).catch(() => null),
          axios.get("http://localhost:5001/squat/status", { timeout: 2000 }).catch(() => null),
          axios.get("http://localhost:5001/neck/status", { timeout: 2000 }).catch(() => null),
        ]);

        const exercises = [];
        if (bicepRes?.data) {
          exercises.push({
            name: "Bicep Curl",
            sessions: 1,
            counters: bicepRes.data.counters || bicepRes.data.count || {},
            feedback: bicepRes.data.model_feedback || bicepRes.data.feedback || {},
          });
        }
        if (squatRes?.data) {
          exercises.push({
            name: "Squat",
            sessions: 1,
            counters: squatRes.data.count ? { total: squatRes.data.count } : squatRes.data.counters || {},
            feedback: squatRes.data.feedback || {},
          });
        }
        if (neckRes?.data) {
          exercises.push({
            name: "Neck",
            sessions: 1,
            counters: { total: neckRes.data.counter || neckRes.data.count || 0 },
            feedback: {},
          });
        }

        dataForReport = { exercises, generatedFrom: "live_status" };
      } catch (err) {
        // If Python service is unavailable, fall back to empty weekData
        console.warn("Could not fetch live statuses from Python service:", err.message || err);
        dataForReport = { exercises: [] };
      }
    }

    const prompt = `
      You are a physiotherapy assistant AI.
      Generate a clear and professional weekly progress report for patient ${patientName}.
      Use this data:
      ${JSON.stringify(dataForReport, null, 2)}

      Include sections:
      1. Weekly Summary
      2. Exercise Performance (Bicep Curls, Squats, etc.)
      3. Observations (form, fatigue, consistency)
      4. Recommendations for next week
    `;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: "You are a physiotherapy assistant AI generating reports." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.HTTP_REFERER || "http://localhost:3000",
          "X-Title": process.env.X_TITLE || "PhysioAssist",
        },
      }
    );

    const summary = response?.data?.choices?.[0]?.message?.content || "No report generated.";

    res.status(200).json({ summary, source: dataForReport.generatedFrom || "provided_weekData" });
  } catch (error) {
    console.error("AI Report Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to generate report summary",
      details: error.response?.data || error.message,
    });
  }
};
