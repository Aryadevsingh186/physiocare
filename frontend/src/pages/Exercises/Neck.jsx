import Exercise from "./Exercise";

const Neck = () => (
  <Exercise
    title="Neck"
    statusUrl="http://localhost:5001/neck/status"
    liveUrl="http://localhost:5001/neck/live"
    mapData={(data) => ({
      counters: { neck: data.counter }, // map count → squat
      feedback: { }, // map feedback → squat
    })}
  />
);

export default Neck;
