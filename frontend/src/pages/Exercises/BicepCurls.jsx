import Exercise from "./Exercise";

const BicepCurls = () => (
  <Exercise
    title="BicepCurls"
    statusUrl="http://localhost:5001/bicep/status"
    liveUrl="http://localhost:5001/bicep/live"
    mapData={(data) => {
      console.log("📡 STATUS API RAW DATA:", data);

      return {
        counters: data.counters || {},
        feedback: data.feedback || {},
        model_feedback: data.model_feedback || {}, // currently EMPTY
      };
    }}
  />
);

export default BicepCurls;
