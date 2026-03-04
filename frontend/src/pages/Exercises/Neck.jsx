import Exercise from "./Exercise";

const Neck = () => (
  <Exercise
    title="Neck"
    statusUrl="http://localhost:5001/neck/status"
    liveUrl="http://localhost:5001/neck/live"
    mapData={(data) => ({
      counters: { neck: data.counter || 0 },
      feedback: { neck: data.feedback || "" },
      model_feedback: { neck: data.model_feedback || "" },
    })}
  />
);

export default Neck;
