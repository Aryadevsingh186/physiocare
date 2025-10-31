import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import cors from 'cors'
import 'dotenv/config'
import userProfileRoutes from "./routes/userprofileRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/exercise", exerciseRoutes);
app.use("/api/report", reportRoutes);

//PORT 
const PORT = process.env.PORT || 5000
app.use("/api/user", userProfileRoutes);

app.get("/", (req, res) => res.send("✅ API Working"));

// Improved error handling for debugging
app.use((err, req, res, next) => {
  console.error("🔥 Error message:", err.message);
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
