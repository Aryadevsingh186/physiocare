import cron from "node-cron";
import db from "../config/db.js";
import transporter from "../config/mailer.js";

const startMissedExerciseCron = () => {
  // Runs every day at 9 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Checking missed exercises...");

    try {
      const result = await db.query(`
        SELECT u.email, u.name, e.session_id
        FROM exercise_sessions e
        JOIN users u ON e.user_id = u.user_id
        WHERE e.completed = FALSE
        AND e.scheduled_date < NOW()
        AND (
          e.last_notified_at IS NULL
          OR e.last_notified_at < NOW() - INTERVAL '1 day'
        )
      `);

      for (const row of result.rows) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: row.email,
          subject: "Missed Exercise Reminder - PhysioCare",
          text: `Hi ${row.name}, you missed your scheduled exercise. Please complete it today to stay on track 💪`,
        });

        await db.query(
          `UPDATE exercise_sessions
           SET last_notified_at = NOW()
           WHERE session_id = $1`,
          [row.session_id]
        );
      }

      console.log("✅ Reminder check complete");
    } catch (err) {
      console.error("❌ Cron Error:", err);
    }
  });
};

export default startMissedExerciseCron;