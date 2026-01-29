// backend/config/db.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "PhysioAssist",
  password: process.env.DB_PASSWORD || "Aryan186",
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));

export default pool;
