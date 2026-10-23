"use client";

import { useEffect, useRef, useState } from "react";

import { microphoneConstraints, withInputGain } from "@/components/hardware/audioSettings";

/** Recording stops on its own after this many seconds. */
export const maxRecordingSeconds = 15;

// First supported type wins: Opus in WebM on Chrome/Firefox, MP4 on Safari.
const mimeTypeCandidates = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];

export type RecorderError =
  | "insecure"
  | "unsupported"
  | "denied"
  | "noMicrophone"
  | "failed";

export type Recording = {
  blob: Blob;
  /** Object URL for playback; revoked when replaced or on unmount. */
  url: string;
  /** recording.webm / recording.mp4 / recording.ogg, matching the blob type. */
  fileName: string;
  seconds: number;
};

export type RecorderStatus = "idle" | "starting" | "recording";

function pickMimeType() {
  if (typeof MediaRecorder.isTypeSupported !== "function") return undefined;

  return mimeTypeCandidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function fileNameFor(mimeType: string) {
  if (mimeType.includes("mp4")) return "recording.mp4";
  if (mimeType.includes("ogg")) return "recording.ogg";
  return "recording.webm";
}

function toRecorderError(error: unknown): RecorderError {
  const name = error instanceof DOMException ? error.name : "";

  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "noMicrophone";
  }
  return "failed";
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

/**
 * Records the microphone with MediaRecorder and returns the blob untouched;
 * the server converts it, so nothing is re-encoded here.
 *
 * `prepare()` asks for the mic ahead of time (call it from the tap, which
 * iOS Safari prefers) so `start()` can begin recording instantly later,
 * e.g. when a countdown reaches "speak now". `start()` also works alone.
 * Recording stops on `stop()` or automatically at maxRecordingSeconds.
 */
export function useVoiceRecorder({
  onRecorded,
}: {
  /** Called when a recording ends; null if nothing usable was captured. */
  onRecorded?: (recording: Recording | null) => void;
} = {}) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [error, setError] = useState<RecorderError | null>(null);
  const statusRef = useRef<RecorderStatus>("idle");
  const preparedStreamRef = useRef<MediaStream | null>(null);
  const preparingRef = useRef<Promise<MediaStream | null> | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const stopRequestedRef = useRef(false);
  const timersRef = useRef<{ tick?: number; autoStop?: number }>({});
  const recordingUrlRef = useRef<string | null>(null);
  const onRecordedRef = useRef(onRecorded);
  const mountedRef = useRef(true);

  useEffect(() => {
    onRecordedRef.current = onRecorded;
  });

  function updateStatus(next: RecorderStatus) {
    statusRef.current = next;
    setStatus(next);
  }

  function clearTimers() {
    window.clearInterval(timersRef.current.tick);
    window.clearTimeout(timersRef.current.autoStop);
    timersRef.current = {};
  }

  function replaceRecording(next: Recording | null) {
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    recordingUrlRef.current = next?.url ?? null;
    setRecording(next);
  }

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearTimers();

      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      stopTracks(recorder?.stream ?? null);
      stopTracks(preparedStreamRef.current);

      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    };
  }, []);

  async function acquireStream() {
    if (preparedStreamRef.current?.active) return preparedStreamRef.current;
    if (preparingRef.current) return preparingRef.current;

    if (!window.isSecureContext) {
      setError("insecure");
      return null;
    }

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("unsupported");
      return null;
    }

    preparingRef.current = navigator.mediaDevices
      .getUserMedia({
        audio: microphoneConstraints({ echoCancellation: true, noiseSuppression: true }),
      })
      .then((micStream) => {
        if (!mountedRef.current) {
          stopTracks(micStream);
          return null;
        }
        preparedStreamRef.current = micStream;
        return micStream;
      })
      .catch((micError: unknown) => {
        if (mountedRef.current) setError(toRecorderError(micError));
        return null;
      })
      .finally(() => {
        preparingRef.current = null;
      });

    return preparingRef.current;
  }

  /** Asks for mic access now. Resolves to false if it's unavailable. */
  async function prepare() {
    setError(null);
    return (await acquireStream()) !== null;
  }

  async function start() {
    if (statusRef.current !== "idle") return;

    setError(null);
    replaceRecording(null);
    stopRequestedRef.current = false;
    updateStatus("starting");

    const micStream = await acquireStream();

    if (!mountedRef.current) return;

    if (!micStream) {
      updateStatus("idle");
      return;
    }

    // The stream now belongs to this recording and stops with it.
    preparedStreamRef.current = null;

    // Input gain from the hardware test page.
    const gained = withInputGain(micStream);
    const mimeType = pickMimeType();
    let recorder: MediaRecorder;

    try {
      recorder = mimeType
        ? new MediaRecorder(gained.stream, { mimeType })
        : new MediaRecorder(gained.stream);
    } catch {
      stopTracks(micStream);
      gained.close();
      updateStatus("idle");
      setError("failed");
      return;
    }

    const chunks: Blob[] = [];
    const startedAt = performance.now();

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    recorder.onstop = () => {
      clearTimers();
      stopTracks(micStream);
      gained.close();
      recorderRef.current = null;

      if (!mountedRef.current) return;

      updateStatus("idle");
      setStream(null);
      setElapsed(0);

      const type =
        recorder.mimeType || mimeType || chunks[0]?.type || "audio/webm";
      const blob = new Blob(chunks, { type });

      if (blob.size === 0) {
        setError("failed");
        onRecordedRef.current?.(null);
        return;
      }

      const next = {
        blob,
        url: URL.createObjectURL(blob),
        fileName: fileNameFor(type),
        seconds: Math.min(
          (performance.now() - startedAt) / 1000,
          maxRecordingSeconds,
        ),
      };

      replaceRecording(next);
      onRecordedRef.current?.(next);
    };

    recorder.onerror = () => {
      if (recorder.state !== "inactive") recorder.stop();
    };

    recorderRef.current = recorder;
    // No timeslice: Safari delivers the whole clip reliably in one chunk on stop.
    recorder.start();
    setStream(gained.stream);
    updateStatus("recording");
    setElapsed(0);

    timersRef.current = {
      tick: window.setInterval(() => {
        setElapsed((performance.now() - startedAt) / 1000);
      }, 200),
      autoStop: window.setTimeout(stop, maxRecordingSeconds * 1000),
    };

    // stop() was called while the mic was still starting.
    if (stopRequestedRef.current) stop();
  }

  function stop() {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else if (statusRef.current === "starting") {
      stopRequestedRef.current = true;
    }
  }

  /** Stops recording and drops a prepared mic stream without recording. */
  function cancel() {
    stop();
    stopTracks(preparedStreamRef.current);
    preparedStreamRef.current = null;
  }

  /** Throws away the current recording and any error. */
  function reset() {
    setError(null);
    replaceRecording(null);
  }

  return {
    status,
    isRecording: status === "recording",
    elapsed,
    /** The live mic stream while recording, for the level meter. */
    stream,
    recording,
    error,
    prepare,
    start,
    stop,
    cancel,
    reset,
  };
}
