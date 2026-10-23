"use client";

import { useEffect, useRef, useState } from "react";

import {
  analyzePronunciation,
  PronunciationApiError,
} from "@/lib/pronunciationApi";
import type { AnalyzeSuccess } from "@/lib/pronunciationApi";

import { useServerStatus } from "./useServerStatus";
import { useVoiceRecorder } from "./useVoiceRecorder";
import type { Recording } from "./useVoiceRecorder";

export type AssessmentNotice =
  | { kind: "tooQuiet"; message: string }
  | { kind: "api"; status: number };

export type AssessmentOutcome =
  | { kind: "result"; result: AnalyzeSuccess }
  | { kind: "failed" };

type PendingCheck = {
  target: string;
  onDone?: (outcome: AssessmentOutcome) => void;
};

/**
 * Record → POST /analyze → result, driven step by step by the caller:
 *   prepare(target)  on the tap (asks for the mic, clears the last result)
 *   startRecording() when it's time to speak
 *   finish(onDone)   to stop and send the clip to the server
 *
 * `enabled: false` skips the /health polling (e.g. in card grids).
 */
export function usePronunciationAssessment({ enabled = true } = {}) {
  const server = useServerStatus(enabled);
  const [target, setTarget] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeSuccess | null>(null);
  const [notice, setNotice] = useState<AssessmentNotice | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const targetRef = useRef<string | null>(null);
  const pendingRef = useRef<PendingCheck | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const recorder = useVoiceRecorder({
    onRecorded(recording) {
      const pending = pendingRef.current;
      pendingRef.current = null;

      if (!pending) return;

      if (!recording) {
        pending.onDone?.({ kind: "failed" });
        return;
      }

      void analyze(recording, pending);
    },
  });

  useEffect(() => () => requestRef.current?.abort(), []);

  function cancelRequest() {
    requestRef.current?.abort();
    requestRef.current = null;
    setIsChecking(false);
  }

  async function analyze(recording: Recording, pending: PendingCheck) {
    const controller = new AbortController();
    requestRef.current = controller;
    setIsChecking(true);

    try {
      const response = await analyzePronunciation({
        audio: recording.blob,
        fileName: recording.fileName,
        text: pending.target,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      if (response.ok) {
        setResult(response);
        pending.onDone?.({ kind: "result", result: response });
      } else {
        setNotice({ kind: "tooQuiet", message: response.message });
        pending.onDone?.({ kind: "failed" });
      }
    } catch (error) {
      if (controller.signal.aborted) return;

      const status = error instanceof PronunciationApiError ? error.status : -1;
      setNotice({ kind: "api", status });
      if (status === 0) server.recheck();
      pending.onDone?.({ kind: "failed" });
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsChecking(false);
      }
    }
  }

  /** Starts a new attempt for `nextTarget`. Resolves to false if the mic is unavailable. */
  function prepare(nextTarget: string) {
    cancelRequest();
    pendingRef.current = null;
    targetRef.current = nextTarget;
    setTarget(nextTarget);
    setResult(null);
    setNotice(null);
    recorder.reset();
    return recorder.prepare();
  }

  function startRecording() {
    void recorder.start();
  }

  /** Stops recording and sends the clip; `onDone` gets the outcome. */
  function finish(onDone?: (outcome: AssessmentOutcome) => void) {
    if (!targetRef.current) return;

    pendingRef.current = { target: targetRef.current, onDone };
    recorder.stop();
  }

  /** Abandons the attempt: stops the mic and drops any pending request. */
  function cancel() {
    pendingRef.current = null;
    recorder.cancel();
    cancelRequest();
  }

  return {
    serverStatus: server.status,
    target,
    result,
    notice,
    isChecking,
    /** True from the tap until the result (or failure) arrives. */
    isBusy: recorder.status !== "idle" || isChecking,
    recorder,
    prepare,
    startRecording,
    finish,
    cancel,
  };
}

export type PronunciationAssessmentState = ReturnType<
  typeof usePronunciationAssessment
>;
