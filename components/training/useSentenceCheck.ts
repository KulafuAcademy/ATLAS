"use client";

import { useEffect, useRef, useState } from "react";

import type { BrowserSpeechRecognition } from "./speechRecognitionTypes";

// Same event the single-word pronunciation test listens to, so only one
// microphone session runs at a time across both tests.
export const stopPronunciationCheckEvent = "atlas:stop-pronunciation-check";

export type SentenceCheckResult =
  | { status: "listening" }
  | { status: "unsupported" }
  | { status: "failedToStart" }
  | { status: "nothingHeard" }
  | { status: "correct"; heardText: string }
  | { status: "incorrect"; heardText: string };

/**
 * Normalizes text so that "Right by the light, read it right!" and
 * "right by the light read it right" compare equal.
 */
export function normalizeSentence(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 100% match: every word must be present, in order, with nothing extra. */
export function sentenceMatches(heardText: string, targetSentence: string) {
  const heard = normalizeSentence(heardText);

  return heard !== "" && heard === normalizeSentence(targetSentence);
}

export function useSentenceCheck(
  onResult: (result: SentenceCheckResult) => void,
) {
  const [isListening, setIsListening] = useState(false);
  const runIdRef = useRef(0);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  });

  function stop() {
    runIdRef.current += 1;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
  }

  useEffect(() => {
    window.addEventListener(stopPronunciationCheckEvent, stop);

    return () => {
      window.removeEventListener(stopPronunciationCheckEvent, stop);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function start(targetSentence: string) {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      onResultRef.current({ status: "unsupported" });
      return;
    }

    // Stops any other running check (including the word pronunciation test).
    window.dispatchEvent(new Event(stopPronunciationCheckEvent));

    const recognition = new SpeechRecognitionConstructor();
    const runId = runIdRef.current + 1;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    runIdRef.current = runId;
    recognitionRef.current = recognition;
    setIsListening(true);
    onResultRef.current({ status: "listening" });

    function finish(result: SentenceCheckResult) {
      if (runIdRef.current !== runId) {
        return;
      }

      recognitionRef.current = null;
      setIsListening(false);
      onResultRef.current(result);
    }

    recognition.onresult = (event) => {
      if (runIdRef.current !== runId) {
        return;
      }

      const segments: string[] = [];

      for (let index = 0; index < event.results.length; index += 1) {
        const transcript = event.results[index]?.[0]?.transcript.trim();

        if (transcript) {
          segments.push(transcript);
        }
      }

      const heardText = segments.join(" ").trim();

      if (!normalizeSentence(heardText)) {
        finish({ status: "nothingHeard" });
        return;
      }

      finish(
        sentenceMatches(heardText, targetSentence)
          ? { status: "correct", heardText }
          : { status: "incorrect", heardText },
      );
    };

    recognition.onerror = () => finish({ status: "nothingHeard" });
    recognition.onnomatch = () => finish({ status: "nothingHeard" });

    recognition.onend = () => {
      if (runIdRef.current === runId) {
        recognitionRef.current = null;
        setIsListening(false);
      }
    };

    try {
      recognition.start();
    } catch {
      finish({ status: "failedToStart" });
    }
  }

  return { isListening, start, stop };
}
