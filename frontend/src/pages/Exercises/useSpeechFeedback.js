import { useEffect, useRef, useState } from "react";

/* ----------- HELPERS ----------- */
const extractFeedbackLabel = (feedbackStr) => {
  if (!feedbackStr) return "none";
  const match = feedbackStr.match(/Feedback:\s*([a-zA-Z_]+)/i);
  return match ? match[1].toLowerCase() : "none";
};

/* ----------- CORE ----------- */
const convertToNaturalLanguage = (
  counters,
  feedback,
  lastCountersRef,
  feedbackLatchRef
) => {
  const messages = [];

  console.log("🧠 INPUT:", { counters, feedback });

  for (const side in counters) {
    const count = counters[side];
    const lastCount = lastCountersRef.current[side] || 0;

    const feedbackStr = feedback?.[side] || "";
    const extracted = extractFeedbackLabel(feedbackStr);

    /* ---------- REP DETECTED ---------- */
    if (count > lastCount) {
      lastCountersRef.current[side] = count;

      console.log(`🎯 REP DETECTED [${side}]:`, count);

      // 🔒 LATCH feedback at rep moment
      if (extracted !== "none") {
        feedbackLatchRef.current[side] = extracted;
        console.log(
          `🔒 FEEDBACK LATCHED [${side}]:`,
          extracted
        );
      }

      // 🗣️ Compose speech using latched feedback
      const feedbackMap = {
        correct: "excellent form",
        elbow_out_of_place: "keep your elbow closer to your body",
        partial_motion: "increase your range of motion",
      };

      const latched = feedbackLatchRef.current[side];
      const spokenFeedback =
        latched && feedbackMap[latched]
          ? feedbackMap[latched]
          : latched;

      const msg = spokenFeedback
        ? `${count} reps, ${spokenFeedback}`
        : `${count} reps`;

      console.log("🎤 FINAL AUDIO:", msg);

      messages.push(msg);

      // 🔓 Clear latch AFTER speaking
      feedbackLatchRef.current[side] = null;
    }
  }

  return messages.length ? messages.join(". ") : "";
};

/* ----------- HOOK ----------- */
const useSpeechFeedback = (counters, feedback) => {
  const [audioEnabled, setAudioEnabled] = useState(false);

  const lastCountersRef = useRef({});
  const feedbackLatchRef = useRef({});
  const speakingRef = useRef(false);
  const queueRef = useRef([]);

  const enableAudio = () => {
    const dummy = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(dummy);
    window.speechSynthesis.cancel();
    setAudioEnabled(true);
    console.log("🎤 AUDIO ENABLED");
  };

  const speak = (msg) => {
    if (!msg || speakingRef.current || !audioEnabled) return;

    speakingRef.current = true;
    console.log("🗣️ SPEAKING:", msg);

    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.rate = 1.1;
    utterance.lang = "en-US";

    utterance.onend = () => {
      speakingRef.current = false;
      if (queueRef.current.length) {
        speak(queueRef.current.shift());
      }
    };

    utterance.onerror = () => {
      speakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!audioEnabled) return;

    const msg = convertToNaturalLanguage(
      counters,
      feedback,
      lastCountersRef,
      feedbackLatchRef
    );

    if (msg) {
      queueRef.current.push(msg);
      if (!speakingRef.current) {
        speak(queueRef.current.shift());
      }
    }
  }, [counters, feedback, audioEnabled]);

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return { audioEnabled, enableAudio };
};

export default useSpeechFeedback;
