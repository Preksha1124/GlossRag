import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Video,
  VideoOff,
  Volume2,
  Radio,
  ArrowDown,
  AlertCircle,
  Loader2,
} from "lucide-react";

/**
 * PHASE 1 — FRONTEND ONLY
 * ------------------------------------------------------------------
 * The camera pipeline below is fully real (getUserMedia / WebRTC).
 * The "Raw Signs Detected" and "RAG-Corrected Output" panels are
 * driven by MOCK_TRANSLATIONS on a timer, standing in for the
 * eventual POST /api/process-sign round trip built in Phase 2 & 3.
 * Swap `useMockTranslationFeed` for a real fetch/WebSocket call
 * once the FastAPI server is live — the UI contract will not change.
 * ------------------------------------------------------------------
 */

// Stand-in for what the CNN-LSTM + RAG pipeline will eventually return.
const MOCK_TRANSLATIONS = [
  { raw: "YESTERDAY HOSPITAL GO", corrected: "I went to the hospital yesterday." },
  { raw: "EMERGENCY POLICE CALL", corrected: "Please call the police immediately." },
  { raw: "WHERE DOCTOR MEDICINE", corrected: "Where can I find the doctor and medicine?" },
  { raw: "NAME WHAT YOU", corrected: "What is your name?" },
  { raw: "WATER WANT I", corrected: "I would like some water." },
];

function useMockTranslationFeed(isStreaming) {
  const [index, setIndex] = useState(0);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (!isStreaming) return undefined;
    const cycle = setInterval(() => {
      setIsThinking(true);
      const revealDelay = setTimeout(() => {
        setIndex((prev) => (prev + 1) % MOCK_TRANSLATIONS.length);
        setIsThinking(false);
      }, 650);
      return () => clearTimeout(revealDelay);
    }, 3800);
    return () => clearInterval(cycle);
  }, [isStreaming]);

  return { current: MOCK_TRANSLATIONS[index], isThinking };
}

function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
    } catch (err) {
      setError(
        err?.name === "NotAllowedError"
          ? "Camera access was denied. Allow camera permissions to start translating."
          : "No camera could be reached. Check that a device is connected."
      );
      setIsActive(false);
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsActive(false);
  }, []);

  useEffect(() => stop, [stop]);

  return { videoRef, isActive, error, start, stop };
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function LiveBadge({ active }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate shadow-panel">
      <span className="relative flex h-2 w-2">
        {active && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            active ? "bg-coral" : "bg-slate/30"
          }`}
        />
      </span>
      {active ? "Live" : "Paused"}
    </span>
  );
}

function CameraPanel({ videoRef, isActive, error, onStart, onStop }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-ink shadow-panel">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 text-canvas/90">
          <Video className="h-4 w-4" strokeWidth={2} />
          <h2 className="text-sm font-medium">Live camera</h2>
        </div>
        <LiveBadge active={isActive} />
      </div>

      <div className="relative mx-4 mb-4 flex-1 overflow-hidden rounded-xl bg-black/40">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${isActive ? "opacity-100" : "opacity-0"}`}
        />

        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            {error ? (
              <>
                <AlertCircle className="h-8 w-8 text-coral" />
                <p className="max-w-xs text-sm text-canvas/70">{error}</p>
              </>
            ) : (
              <p className="max-w-xs text-sm text-canvas/60">
                Start the camera to begin translating continuous sign language in real time.
              </p>
            )}
            <button
              onClick={onStart}
              className="rounded-lg bg-mint px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-mint/90"
            >
              Start camera
            </button>
          </div>
        )}
      </div>

      {isActive && (
        <div className="flex justify-end px-4 pb-4">
          <button
            onClick={onStop}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium text-canvas/90 transition-colors hover:bg-white/15"
          >
            <VideoOff className="h-4 w-4" />
            Stop camera
          </button>
        </div>
      )}
    </div>
  );
}

function RawSignsPanel({ tokens, isThinking }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-panel">
      <div className="mb-3 flex items-center gap-2 text-slate">
        <Radio className="h-4 w-4 text-amber" strokeWidth={2} />
        <h2 className="text-sm font-medium">Raw signs detected</h2>
      </div>
      <div className="min-h-[3.25rem] rounded-lg bg-amber/10 px-4 py-3">
        {isThinking ? (
          <div className="flex items-center gap-2 text-amber/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Reading gesture sequence…</span>
          </div>
        ) : (
          <p className="font-mono text-base tracking-wide text-ink">{tokens}</p>
        )}
      </div>
      <p className="mt-2 text-xs text-slate/60">
        Unprocessed gloss tokens straight from the CNN-LSTM classifier.
      </p>
    </div>
  );
}

function CorrectedOutputPanel({ sentence, isThinking, onSpeak }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-panel">
      <div className="mb-3 flex items-center gap-2 text-slate">
        <span className="flex h-4 w-4 items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-mint" />
        </span>
        <h2 className="text-sm font-medium">RAG-corrected output</h2>
      </div>
      <div className="min-h-[4.5rem] rounded-lg bg-mint/10 px-4 py-3">
        {isThinking ? (
          <div className="flex items-center gap-2 text-mint/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Aligning to natural grammar…</span>
          </div>
        ) : (
          <p className="text-lg font-medium leading-snug text-ink">{sentence}</p>
        )}
      </div>
      <button
        onClick={() => onSpeak(sentence)}
        disabled={isThinking}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Volume2 className="h-4 w-4" />
        Speak this sentence
      </button>
    </div>
  );
}

export default function App() {
  const { videoRef, isActive, error, start, stop } = useCamera();
  const { current, isThinking } = useMockTranslationFeed(isActive);

  return (
    <div className="min-h-screen bg-canvas px-6 py-8 md:px-10 lg:px-16">
      <header className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Sign2Talk</h1>
          <p className="text-sm text-slate/70">
            Continuous sign language translation, corrected in context.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-h-[420px] lg:min-h-0">
          <CameraPanel
            videoRef={videoRef}
            isActive={isActive}
            error={error}
            onStart={start}
            onStop={stop}
          />
        </div>

        <div className="flex flex-col gap-4">
          <RawSignsPanel tokens={current.raw} isThinking={isThinking} />

          <div className="flex justify-center text-slate/30" aria-hidden="true">
            <ArrowDown className="h-4 w-4" />
          </div>

          <CorrectedOutputPanel
            sentence={current.corrected}
            isThinking={isThinking}
            onSpeak={speak}
          />
        </div>
      </main>
    </div>
  );
}
