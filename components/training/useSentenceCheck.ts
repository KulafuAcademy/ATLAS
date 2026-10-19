/**
 * Minimal hand-written types for the browser Web Speech API
 * (SpeechRecognition), which is missing from TypeScript's DOM lib.
 * Chrome and Safari expose it as `webkitSpeechRecognition`; the global
 * augmentation at the bottom adds both names to `Window`.
 */

"use client";

import { useEffect, useRef, useState } from "react";

import { spellOutNumbers } from "@/lib/numberToWords";

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
 * "right by the light read it right" compare equal. Numbers are spelled
 * out first, so a recognizer writing "3" still matches "three".
 */
export function normalizeSentence(value: string) {
  return spellOutNumbers(value)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type WordGroup = { heard: string[]; target: string[] };

/**
 * Pairs heard words with target words, letting either side merge adjacent
 * words so "sun rise" ↔ "sunrise" and "any one" ↔ "anyone" line up, since
 * recognizers split compounds inconsistently. Returns null on a mismatch.
 */
export function alignWords(
  heard: string[],
  target: string[],
): WordGroup[] | null {
  const groups: WordGroup[] = [];
  let heardIndex = 0;
  let targetIndex = 0;

  while (heardIndex < heard.length && targetIndex < target.length) {
    const group: WordGroup = {
      heard: [heard[heardIndex++]],
      target: [target[targetIndex++]],
    };
    let heardJoined = group.heard[0];
    let targetJoined = group.target[0];

    while (heardJoined !== targetJoined) {
      if (targetJoined.startsWith(heardJoined) && heardIndex < heard.length) {
        group.heard.push(heard[heardIndex]);
        heardJoined += heard[heardIndex++];
      } else if (
        heardJoined.startsWith(targetJoined) &&
        targetIndex < target.length
      ) {
        group.target.push(target[targetIndex]);
        targetJoined += target[targetIndex++];
      } else {
        return null;
      }
    }

    groups.push(group);
  }

  return heardIndex === heard.length && targetIndex === target.length
    ? groups
    : null;
}

/**
 * 100% match: every word must be present, in order, with nothing extra.
 * Word breaks inside compounds ("sunrise" vs "sun rise") don't count.
 */
export function sentenceMatches(heardText: string, targetSentence: string) {
  const heard = normalizeSentence(heardText);

  return (
    heard !== "" &&
    alignWords(heard.split(" "), normalizeSentence(targetSentence).split(" ")) !==
      null
  );
}

export function useSentenceCheck(
  onResult: (result: SentenceCheckResult) => void,
) {
  const [isListening, setIsListening] = useState(false);
  const runIdRef = useRef(0);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const stopRequestedRef = useRef(false);
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
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    runIdRef.current = runId;
    recognitionRef.current = recognition;
    stopRequestedRef.current = false;
    setIsListening(true);
    onResultRef.current({ status: "listening" });

    let finished = false;
    // Text from earlier recognizer sessions in this run, plus the current one.
    let collectedText = "";
    let sessionText = "";

    function finish(result: SentenceCheckResult) {
      if (runIdRef.current !== runId || finished) {
        return;
      }

      finished = true;
      recognitionRef.current = null;
      setIsListening(false);
      onResultRef.current(result);
    }

    function evaluate() {
      // Spelled out so the learner sees words, not the recognizer's digits.
      const heardText = spellOutNumbers(
        `${collectedText} ${sessionText}`.trim(),
      );

      if (!normalizeSentence(heardText)) {
        finish({ status: "nothingHeard" });
        return;
      }

      finish(
        sentenceMatches(heardText, targetSentence)
          ? { status: "correct", heardText }
          : { status: "incorrect", heardText },
      );
    }

    // Results only accumulate; the answer is judged when the countdown ends.
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

      sessionText = segments.join(" ").trim();
    };

    recognition.onerror = (event) => {
      // Silence or a dropped session is not the end; onend restarts listening.
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }

      evaluate();
    };

    recognition.onend = () => {
      if (runIdRef.current !== runId || finished) {
        return;
      }

      if (stopRequestedRef.current) {
        evaluate();
        return;
      }

      // The browser ended the session early (e.g. the user paused). Keep
      // listening until the countdown asks us to stop.
      collectedText = `${collectedText} ${sessionText}`.trim();
      sessionText = "";

      try {
        recognition.start();
      } catch {
        evaluate();
      }
    };

    try {
      recognition.start();
    } catch {
      finish({ status: "failedToStart" });
    }
  }

  /** Ends recording but still lets the recognizer deliver what it heard. */
  function finishListening() {
    stopRequestedRef.current = true;
    recognitionRef.current?.stop();
  }

  return { isListening, start, stop, finishListening };
}
