import Exercise from "./Exercise";

const Squats = () => (
  <Exercise
    title="Squats"
    statusUrl="http://localhost:5001/squat/status"
    liveUrl="http://localhost:5001/squat/live"
    mapData={(data) => ({
      counters: data.counters || {},
      feedback: data.feedback || {},
      model_feedback: data.model_feedback || {}
    })}
  />
);

export default Squats;