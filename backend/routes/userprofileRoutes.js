import express from "express";
import supabase from "../config/supabase.js";
import { verifyToken, verifyPatient } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===================================================
   👤 GET PROFILE (PATIENT ONLY)
   =================================================== */
router.get("/profile", verifyToken, verifyPatient, async (req, res) => {
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
   ✏️ UPDATE PROFILE (PATIENT ONLY)
   =================================================== */
router.put("/update", verifyToken, verifyPatient, async (req, res) => {
  try {
    let { name, age, gender, phone } = req.body;

    if (!name && !age && !gender && !phone) {
      return res.status(400).json({
        success: false,
        message: "No fields provided",
      });
    }

    const userId = req.user.user_id;

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