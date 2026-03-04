import Exercise from "./Exercise";

const LegExtension = () => (
  <Exercise
    title="Leg Extension"
    statusUrl="http://localhost:5001/leg/status"
    liveUrl="http://localhost:5001/leg/live"
    mapData={(data) => {
      console.log("📡 LEG STATUS:", data);

      return {
        // Leg extensions use the same 'left' and 'right' structure
        counters: data.counters || { left: 0, right: 0 },
        feedback: data.feedback || { left: "Waiting...", right: "Waiting..." },
        model_feedback: data.model_feedback || { left: "none", right: "none" },
        collecting: data.collecting || { left: false, right: false }
      };
    }}
  />
);

export default LegExtension;