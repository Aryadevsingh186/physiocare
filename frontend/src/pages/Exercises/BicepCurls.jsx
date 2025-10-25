import Exercise from "./Exercise";

const BicepCurls = () => (
  <Exercise
    title="Bicep Curls"
    statusUrl="http://localhost:5001/bicep/status"
    liveUrl="http://localhost:5001/bicep/live"
    mapData={(data) => ({
      counters: data.counters,   // { left, right }
      feedback: data.feedback,   // { left, right }
    })}
  />
);

export default BicepCurls;
