import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const generateReportSummary = async (req, res) => {
  try {
    const { patientName, weekData } = req.body;

    const prompt = `
      You are a physiotherapy assistant AI.
      Generate a clear and professional weekly progress report for patient ${patientName}.
      Use this data:
      ${JSON.stringify(weekData, null, 2)}

      Include sections:
      1. Weekly Summary
      2. Exercise Performance (Bicep Curls, Squats, etc.)
      3. Observations (form, fatigue, consistency)
      4. Recommendations for next week
    `;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-8b-instruct", // ✅ stable and widely available model
        messages: [
          { role: "system", content: "You are a physiotherapy assistant AI generating reports." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "PhysioAssist",
        },
      }
    );

    const summary =
      response?.data?.choices?.[0]?.message?.content || "No report generated.";

    res.status(200).json({ summary });
  } catch (error) {
    console.error("AI Report Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to generate report summary",
      details: error.response?.data || error.message,
    });
  }
};
