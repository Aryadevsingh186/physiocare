import express from "express";
import { generateReportSummary } from "../controllers/reportAIController.js";

const router = express.Router();
router.get("/test", (req, res) => res.send("Report route connected ✅"));
router.post("/", generateReportSummary);

export default router;
