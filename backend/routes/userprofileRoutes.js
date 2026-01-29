import express from "express";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

/* ===================================================
   🔐 TOKEN VERIFICATION (UUID safe)
   =================================================== */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id missing in token",
      });
    }

    // ✅ UUID → keep as string (NO parseInt)
    req.user = { user_id: decoded.user_id };

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/* ===================================================
   👤 GET PROFILE
   =================================================== */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { data: user, error } = await supabase
      .from("users")
      .select("user_id, name, email, role, age, gender, phone")
      .eq("user_id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* ===================================================
   ✏️ UPDATE PROFILE
   =================================================== */
router.put("/update", verifyToken, async (req, res) => {
  try {
    let { name, age, gender, phone } = req.body;

    if (!name && !age && !gender && !phone) {
      return res.status(400).json({
        success: false,
        message: "No fields provided",
      });
    }

    const userId = req.user.user_id;

    // Normalize values
    const updates = {
      name: name || null,
      gender: gender || null,
      phone: phone || null,
      age: age ? parseInt(age, 10) : null,
    };

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updates)
      .eq("user_id", userId)
      .select("user_id, name, email, role, age, gender, phone")
      .single();

    if (error || !updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
