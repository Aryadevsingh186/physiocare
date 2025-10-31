// backend/routes/userprofileRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Verify JWT middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ success: false, message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Token missing" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid token" });
    if (!decoded.user_id) return res.status(400).json({ success: false, message: "user_id missing in token" });

    const userId = parseInt(decoded.user_id, 10);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: "Invalid user_id in token" });

    req.user = { user_id: userId };
    next();
  });
};

// GET /api/user/profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT user_id, name, email, role, 
              age, 
              gender, 
              phone
       FROM Users WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    // Ensure undefined/empty string fields are replaced with null for JSON safety
    const user = result.rows[0];
    user.age = user.age === "" ? null : user.age;
    user.gender = user.gender === "" ? null : user.gender;
    user.phone = user.phone === "" ? null : user.phone;

    res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/user/update
router.put("/update", verifyToken, async (req, res) => {
  try {
    let { name, age, gender, phone } = req.body;
    if (!name && !age && !gender && !phone)
      return res.status(400).json({ success: false, message: "No fields provided" });

    const userId = req.user.user_id;

    // Normalize empty strings to null and parse age if provided
    name = name || null;
    gender = gender || null;
    phone = phone || null;
    if (age === "") age = null;
    else if (age !== undefined) age = parseInt(age, 10);

    const result = await pool.query(
      `UPDATE Users 
       SET name = COALESCE($1, name),
           age = COALESCE($2, age),
           gender = COALESCE($3, gender),
           phone = COALESCE($4, phone)
       WHERE user_id = $5
       RETURNING user_id, name, email, role, age, gender, phone`,
      [name, age, gender, phone, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "Profile updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
