import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js"; // ✅ PostgreSQL connection
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

/* ===================================================
   🧾 REGISTER ROUTE
   =================================================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, age, gender, phone } = req.body;

    // 1️⃣ Check if user already exists
    const existingUser = await db.query("SELECT * FROM Users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Insert into DB
    const result = await db.query(
      `INSERT INTO Users (name, email, password, role, age, gender, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, name, email, role, age, gender, phone`,
      [name, email, hashedPassword, role, age, gender, phone]
    );

    const newUser = result.rows[0];

    res.json({
      success: true,
      message: "Registration successful",
      user: newUser,
    });
  } catch (err) {
    console.error("❌ Registration Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===================================================
   🔐 LOGIN ROUTE
   =================================================== */
router.post("/login", async (req, res, next) => {
  const { email, password, role } = req.body;

  try {
    // 1️⃣ Check user by email & role
    const result = await db.query(
      "SELECT * FROM Users WHERE email = $1 AND role = $2",
      [email, role]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // 3️⃣ Generate token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4️⃣ Send response
    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age || "",
        gender: user.gender || "",
        phone: user.phone || "",
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    next(err);
  }
});

export default router;
