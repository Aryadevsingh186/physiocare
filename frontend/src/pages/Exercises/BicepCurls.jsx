import Exercise from "./Exercise";

const BicepCurls = () => (
  <Exercise
    title="BicepCurls"
    statusUrl="http://localhost:5001/bicep/status"
    liveUrl="http://localhost:5001/bicep/live"
    mapData={(data) => ({
      counters: data.counters,       // { left, right }
      feedback: data.feedback,       // { left, right }
      model_feedback: data.model_feedback,  // { left, right } - model predictions
    })}
  />
);

export default BicepCurls;
