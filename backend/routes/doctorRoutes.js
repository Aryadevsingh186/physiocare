import express from "express";
import { verifyToken, verifyDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

// Doctor dashboard
router.get("/dashboard", verifyToken, verifyDoctor, (req, res) => {
  res.json({
    success: true,
    message: "Welcome Doctor",
    doctor: req.user,
  });
});

// Example: Get all patients
router.get("/patients", verifyToken, verifyDoctor, async (req, res) => {
  res.json({
    success: true,
    message: "Doctor can view patients here",
  });
});

export default router;