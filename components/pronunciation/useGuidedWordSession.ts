"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { stopRecordedAudioEvent } from "@/components/training/audio";
import {
  playReadyChime,
  unlockCountdownAudio,
} from "@/components/training/feedbackSounds";
import { stopPronunciationCheckEvent } from "@/components/training/useSentenceCheck";
import { GuidedWordSession } from "@/lib/guidedWordSession";
import type { SessionClip, SessionEffects } from "@/lib/guidedWordSession";
import { analyzeWordAttempts } from "@/lib/pronunciationApi";

import {
  audioExtensionFor,
  micConstraints,
  pickMimeType,
  stopTracks,
  toRecorderError,
} from "./useVoiceRecorder";

// A recorder normally reports these within milliseconds. They only stop a
// misbehaving browser from freezing the flow.
const recorderStartTimeoutMs = 500;
const recorderStopTimeoutMs = 2000;

function waitFor(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const finish = () => {
      window.clearTimeout(timeoutId);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timeoutId = window.setTimeout(finish, ms);

    signal.addEventListener("abort", finish);
    if (signal.aborted) finish();
  });
}

/**
 * The browser side of the flow: one mic stream kept open across the tries,
 * with a new MediaRecorder for each one. No timeslice: Safari delivers the
 * whole clip reliably in one chunk on stop.
 */
function createBrowserEffects(
  word: string,
): SessionEffects & { getMicStream: () => MediaStream | null } {
  let stream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  let finished: Promise<SessionClip | null> = Promise.resolve(null);
  // Bumped on release, so a mic granted after a cancel is closed straight away.
  let micGeneration = 0;

  return {
    getMicStream: () => stream,

    async requestMic() {
      // Inside the tap, which is what lets iOS Safari play the chime later.
      unlockCountdownAudio();

      if (!window.isSecureContext) return "insecure";

      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      ) {
        return "unsupported";
      }

      const generation = micGeneration;

      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: micConstraints,
        });

        if (generation !== micGeneration) {
          stopTracks(micStream);
          return "failed";
        }

        stream = micStream;
        return null;
      } catch (error) {
        return toRecorderError(error);
      }
    },

    releaseMic() {
      micGeneration += 1;
      stopTracks(stream);
      stream = null;
    },

    stopAudio() {
      window.speechSynthesis?.cancel();
      window.dispatchEvent(new Event(stopRecordedAudioEvent));
      window.dispatchEvent(new Event(stopPronunciationCheckEvent));
    },

    playChime: playReadyChime,

    startRecording(tryNumber) {
      return new Promise<void>((resolve, reject) => {
        if (!stream?.active) {
          reject(new Error("The microphone stream has ended."));
          return;
        }

        const mimeType = pickMimeType();
        const next = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
        const chunks: Blob[] = [];

        next.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };

        finished = new Promise((resolveClip) => {
          next.onstop = () => {
            const type = next.mimeType || mimeType || chunks[0]?.type || "audio/webm";
            const blob = new Blob(chunks, { type });

            resolveClip(
              blob.size > 0
                ? {
                    blob,
                    fileName: `try${tryNumber}.${audioExtensionFor(type)}`,
                    tryNumber,
                  }
                : null,
            );
          };
        });

        next.onerror = () => {
          if (next.state !== "inactive") next.stop();
        };

        const timeoutId = window.setTimeout(resolve, recorderStartTimeoutMs);

        next.onstart = () => {
          window.clearTimeout(timeoutId);
          resolve();
        };

        recorder = next;
        next.start();
      });
    },

    stopRecording() {
      const current = recorder;
      recorder = null;

      if (current && current.state !== "inactive") current.stop();

      return Promise.race([
        finished,
        new Promise<null>((resolve) => {
          window.setTimeout(() => resolve(null), recorderStopTimeoutMs);
        }),
      ]);
    },

    discardRecording() {
      const current = recorder;
      recorder = null;
      if (!current) return;

      current.ondataavailable = null;
      current.onstop = null;
      if (current.state !== "inactive") current.stop();
    },

    upload(clips, signal) {
      return analyzeWordAttempts({ clips, text: word, signal });
    },

    wait: waitFor,
  };
}

/**
 * Binds a GuidedWordSession to the component's lifetime. Hiding the page or
 * unmounting stops everything and discards the clips. Mount it once per word.
 */
export function useGuidedWordSession(word: string) {
  const [{ session, getMicStream }] = useState(() => {
    const effects = createBrowserEffects(word);

    return {
      session: new GuidedWordSession(word, effects),
      getMicStream: effects.getMicStream,
    };
  });
  const state = useSyncExternalStore(
    session.subscribe,
    session.getState,
    session.getState,
  );

  useEffect(() => {
    const cancelIfHidden = () => {
      if (document.hidden && session.isRunning) session.cancel();
    };
    const cancelIfRunning = () => {
      if (session.isRunning) session.cancel();
    };

    document.addEventListener("visibilitychange", cancelIfHidden);
    window.addEventListener("pagehide", cancelIfRunning);

    return () => {
      document.removeEventListener("visibilitychange", cancelIfHidden);
      window.removeEventListener("pagehide", cancelIfRunning);
      session.cancel();
    };
  }, [session]);

  return {
    session,
    state,
    /** The open mic stream, for the level meter. */
    micStream: getMicStream(),
  };
}
