import Exercise from "./Exercise";

const Squats = () => (
  <Exercise
    title="Squats"
    statusUrl="http://localhost:5001/squat/status"
    liveUrl="http://localhost:5001/squat/live"
    mapData={(data) => ({
      counters: { squat: data.count }, // map count → squat
      feedback: { squat: data.feedback }, // map feedback → squat
    })}
  />
);

export default Squats;
