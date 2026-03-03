import fetch from "node-fetch";
import db from '../config/db.js'

/**
 * Get squat status (count + feedback)
 */
export const getSquatStatus = async (req, res) => {
  try {
    const response = await fetch("http://localhost:5001/squat/status");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching squat status:", err);
    res.status(500).json({ error: "Squat tracker not available" });
  }
};

/**
 * Stream squat live feed (MJPEG video)
 */
export const getSquatLive = async (req, res) => {
  try {
    const response = await fetch("http://localhost:5001/squat/live");
    res.setHeader("Content-Type", "multipart/x-mixed-replace; boundary=frame");
    response.body.pipe(res);
  } catch (err) {
    console.error("Error streaming squat live:", err);
    res.status(500).json({ error: "Squat live feed not available" });
  }
};

/**
 * Get bicep status (counts + feedback)
 */
export const getBicepStatus = async (req, res) => {
  try {
    const response = await fetch("http://localhost:5001/bicep/status");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching bicep status:", err);
    res.status(500).json({ error: "Bicep tracker not available" });
  }
};

/**
 * Stream bicep live feed (MJPEG video)
 */
export const getBicepLive = async (req, res) => {
  try {
    const response = await fetch("http://localhost:5001/bicep/live");
    res.setHeader("Content-Type", "multipart/x-mixed-replace; boundary=frame");
    response.body.pipe(res);
  } catch (err) {
    console.error("Error streaming bicep live:", err);
    res.status(500).json({ error: "Bicep live feed not available" });
  }
};

// Start a new exercise session
export const startSession = async (req, res) => {
  try {
    const { user_id, exercise_type } = req.body;

    const result = await db.query(
      `INSERT INTO exercise_sessions (user_id, exercise_type, scheduled_date, completed)
       VALUES ($1, $2, NOW(), FALSE)
       RETURNING session_id`,
      [user_id, exercise_type]
    );

    res.json({ session_id: result.rows[0].session_id });
  } catch (err) {
    console.error("Start session error:", err);
    res.status(500).json({ error: "Failed to start session" });
  }
};


// Mark session as completed
export const completeSession = async (req, res) => {
  try {
    const { session_id } = req.body;

    await db.query(
      `UPDATE exercise_sessions
       SET completed = TRUE
       WHERE session_id = $1`,
      [session_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Complete session error:", err);
    res.status(500).json({ error: "Failed to complete session" });
  }
};
