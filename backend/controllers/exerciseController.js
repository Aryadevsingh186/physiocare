import fetch from "node-fetch";

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
