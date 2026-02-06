import { useEffect, useRef, useState } from "react";

// Convert feedback data to natural language sentences
const convertToNaturalLanguage = (counters, feedback, modelFeedback, lastCountersRef, lastModelFeedbackRef, lastFeedbackRef) => {
  const messages = [];

  for (const side in counters) {
    const count = counters[side];
    const lastCount = lastCountersRef.current[side] || 0;
    const sideText = side === "left" ? "left" : "right";
    
    // Check feedback string for non-angle updates
    const feedbackStr = feedback[side] || "";
    const lastFeedbackStr = lastFeedbackRef.current[side] || "";
    
    // If counter increased, announce new count
    if (count > lastCount) {
      messages.push(`${count} rep${count !== 1 ? "s" : ""}`);
      lastCountersRef.current[side] = count;
    }
    
    // If feedback changed (excluding "detected" angles), announce it
    if (feedbackStr && feedbackStr !== lastFeedbackStr) {
      // Skip the "detected - angle" messages
      if (!feedbackStr.includes("detected -") && feedbackStr !== "not detected") {
        // Remove the model feedback part and clean up
        let displayFeedback = feedbackStr.replace(/\s*\|\s*Feedback:.*/, "");
        messages.push(displayFeedback);
      }
      lastFeedbackRef.current[side] = feedbackStr;
    }

    // Model feedback - only announce when it changes
    const modelMsg = modelFeedback[side];
    const lastModelMsg = lastModelFeedbackRef.current[side];
    
    if (modelMsg && modelMsg !== "none" && modelMsg !== lastModelMsg) {
      const modelTextMap = {
        correct: "excellent form",
        elbow_out_of_place: "keep your elbow closer to your body",
        partial_motion: "increase your range of motion",
      };
      const naturalMsg = modelTextMap[modelMsg] || modelMsg;
      messages.push(naturalMsg);
      lastModelFeedbackRef.current[side] = modelMsg;
    }
  }

  return messages.length > 0 ? messages.join(". ") : "";
};

const useSpeechFeedback = (counters, feedback, modelFeedback) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const lastMessageRef = useRef("");
  const lastCountersRef = useRef({});
  const lastModelFeedbackRef = useRef({});
  const messageQueueRef = useRef([]);
  const speakingRef = useRef(false);

  const enableAudio = () => {
    // Trigger a dummy utterance to unlock speech synthesis with user interaction
    const dummy = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(dummy);
    window.speechSynthesis.cancel();
    setAudioEnabled(true);
    console.log("🎤 Audio enabled");
  };

  const speakMessage = (msg) => {
    if (!msg || speakingRef.current || !audioEnabled) return;

    console.log("🎤 Attempting to speak:", msg);

    speakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.rate = 1.2;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";

    utterance.onstart = () => {
      console.log("✅ Speech STARTED");
    };

    utterance.onend = () => {
      console.log("✅ Speech ENDED");
      speakingRef.current = false;
      if (messageQueueRef.current.length > 0) {
        const nextMsg = messageQueueRef.current.shift();
        speakMessage(nextMsg);
      }
    };

    utterance.onerror = (e) => {
      console.error("❌ Speech ERROR:", e.error);
      speakingRef.current = false;
      if (messageQueueRef.current.length > 0) {
        const nextMsg = messageQueueRef.current.shift();
        speakMessage(nextMsg);
      }
    };

    console.log("🎤 Speaking:", msg);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!audioEnabled) return;

    // Create natural language text from feedback
    const naturalText = convertToNaturalLanguage(counters, feedback, modelFeedback, lastCountersRef, lastModelFeedbackRef);

    console.log("Feedback Update:", {
      naturalText,
      lastMessage: lastMessageRef.current,
      counters,
      modelFeedback,
    });

    // If new message is different, add to queue and speak
    if (naturalText && naturalText !== lastMessageRef.current) {
      lastMessageRef.current = naturalText;
      messageQueueRef.current.push(naturalText);

      // Start speaking if not already speaking
      if (!speakingRef.current) {
        const msg = messageQueueRef.current.shift();
        speakMessage(msg);
      }
    }
  }, [counters, feedback, modelFeedback, audioEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return { audioEnabled, enableAudio };
};

export default useSpeechFeedback;
