import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";


/* ===================================================
   🧾 REGISTER ROUTE (Supabase)
   =================================================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, age, gender, phone } = req.body;

    // 1️⃣ Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Insert user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role,
          age,
          gender,
          phone,
        },
      ])
      .select(
        "user_id, name, email, role, age, gender, phone"
      )
      .single();

    if (insertError) throw insertError;

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
   🔐 LOGIN ROUTE (Supabase)
   =================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1️⃣ Fetch user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("role", role)
      .single();

    if (error || !user) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
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
    res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;
