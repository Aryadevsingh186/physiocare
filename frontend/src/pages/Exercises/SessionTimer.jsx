import React, { useEffect, useRef, useState } from "react";

const formatMs = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const SessionTimer = ({
  storageKey = "session-timer",
  initialMinutes = 3,
  autoStart = true,
  onFinish,
  onStop,
}) => {
  const initialMs = initialMinutes * 60 * 1000;
  const [running, setRunning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(initialMs);
  const tickRef = useRef(null);

  const persist = (obj) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(obj));
    } catch (e) {
      console.warn("SessionTimer persist error", e);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        let rem = typeof parsed.remainingMs === "number" ? parsed.remainingMs : initialMs;
        if (parsed.running && parsed.lastUpdated) {
          const elapsed = Date.now() - parsed.lastUpdated;
          rem = Math.max(0, rem - elapsed);
        }
        setRemainingMs(rem);
        if (autoStart && rem > 0) {
          persist({ running: true, remainingMs: rem, lastUpdated: Date.now() });
          setRunning(true);
        }
      } else {
        setRemainingMs(initialMs);
        if (autoStart) {
          persist({ running: true, remainingMs: initialMs, lastUpdated: Date.now() });
          setRunning(true);
        }
      }
    } catch (e) {
      console.warn("SessionTimer load error", e);
      setRemainingMs(initialMs);
      if (autoStart) {
        persist({ running: true, remainingMs: initialMs, lastUpdated: Date.now() });
        setRunning(true);
      }
    }
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (running) {
      tickRef.current = setInterval(() => {
        setRemainingMs((prev) => {
          const next = Math.max(0, prev - 250);
          if (next === 0) {
            clearInterval(tickRef.current);
            setRunning(false);
            persist({ running: false, remainingMs: 0, lastUpdated: null });
            onFinish && onFinish();
            onStop && onStop();
          } else {
            persist({ running: true, remainingMs: next, lastUpdated: Date.now() });
          }
          return next;
        });
      }, 250);
    } else {
      clearInterval(tickRef.current);
      persist({ running: false, remainingMs, lastUpdated: null });
    }
    return () => clearInterval(tickRef.current);
  }, [running]);

  const handlePause = () => {
    if (running) setRunning(false);
  };

  const handleResume = () => {
    if (!running) setRunning(true);
  };

  const handleReset = () => {
    // reset to initial and start immediately
    clearInterval(tickRef.current);
    const startMs = initialMs;
    setRemainingMs(startMs);
    persist({ running: true, remainingMs: startMs, lastUpdated: Date.now() });
    setRunning(true);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{formatMs(remainingMs)}</div>
      <div style={{ display: "flex", gap: 8 }}>
        {running ? (
          <button onClick={handlePause} style={{ padding: "6px 10px", borderRadius: 6 , background: "#1496f3", color: "#fff", border: "none" }}>
            Pause
          </button>
        ) : (
          <button onClick={handleResume} style={{ padding: "6px 10px", borderRadius: 6, background: "#1496f3", color: "#fff", border: "none" }}>
            Resume
          </button>
        )}
        <button onClick={handleReset} style={{ padding: "6px 10px", borderRadius: 6 
          , background: "#1496f3", color: "#fff", border: "none" }}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default SessionTimer;