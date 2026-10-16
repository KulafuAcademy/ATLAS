/**
 * Minimal hand-written types for the browser Web Speech API
 * (SpeechRecognition), which is missing from TypeScript's DOM lib.
 * Chrome and Safari expose it as `webkitSpeechRecognition`; the global
 * augmentation at the bottom adds both names to `Window`.
 */

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

const smallNumberWords = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen",
];
const tensWords = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty",
  "ninety",
];

/**
 * Spells out a non-negative integer ("7" -> "seven", "42" -> "forty two").
 * Speech recognizers return digits for numbers, but lesson text uses words.
 */
function numberToWords(value: number): string {
  if (value < 20) {
    return smallNumberWords[value];
  }

  if (value < 100) {
    const ones = value % 10;

    return ones ? `${tensWords[Math.floor(value / 10)]} ${smallNumberWords[ones]}` : tensWords[Math.floor(value / 10)];
  }

  if (value < 1000) {
    const rest = value % 100;
    const head = `${smallNumberWords[Math.floor(value / 100)]} hundred`;

    return rest ? `${head} ${numberToWords(rest)}` : head;
  }

  if (value < 1_000_000) {
    const rest = value % 1000;
    const head = `${numberToWords(Math.floor(value / 1000))} thousand`;

    return rest ? `${head} ${numberToWords(rest)}` : head;
  }

  // Too large to be spoken in a lesson; fall back to digit-by-digit.
  return String(value).split("").map((digit) => smallNumberWords[Number(digit)]).join(" ");
}

/**
 * Normalizes text into comparable word tokens so that these all line up:
 * - case and punctuation: "Right by the light!" == "right by the light"
 * - digits vs. words:     "7" == "seven"
 * - acronym-style output: "V.A.T." -> "v a t" (re-joined by tokensMatch)
 */
export function normalizeSentence(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    // "1,000" -> "1000" so the comma doesn't split the number.
    .replace(/(\d),(?=\d{3}\b)/g, "$1")
    // Spell out every run of digits.
    .replace(/\d+/g, (digits) => ` ${numberToWords(Number(digits))} `)
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Longest run of adjacent tokens that may be glued into one word. */
const maxJoinedTokens = 4;

/**
 * Word-level comparison that tolerates spacing differences. The recognizer
 * and the lesson text often disagree on where words break ("sunrise" vs
 * "sun rise", "VAT" vs "v a t"). At each position we accept either an exact
 * token match, or a run of tokens on one side whose concatenation equals a
 * token (or run) on the other. Unlike deleting all spaces, word order and
 * boundaries elsewhere in the sentence still have to match, and nothing
 * needs to be listed per word, so new lessons work without changes.
 */
function tokensMatch(heard: string[], target: string[]): boolean {
  function join(tokens: string[], start: number, count: number) {
    return tokens.slice(start, start + count).join("");
  }

  function walk(h: number, t: number): boolean {
    if (h === heard.length || t === target.length) {
      return h === heard.length && t === target.length;
    }

    for (let heardCount = 1; heardCount <= maxJoinedTokens; heardCount += 1) {
      if (h + heardCount > heard.length) {
        break;
      }

      for (let targetCount = 1; targetCount <= maxJoinedTokens; targetCount += 1) {
        if (t + targetCount > target.length) {
          break;
        }

        // Only merge on one side at a time ("sun"+"rise" vs "sunrise").
        if (heardCount > 1 && targetCount > 1) {
          continue;
        }

        if (
          join(heard, h, heardCount) === join(target, t, targetCount) &&
          walk(h + heardCount, t + targetCount)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  return walk(0, 0);
}

/**
 * 100% match: every word must be present, in order, with nothing extra.
 * Formatting differences (case, punctuation, digits, word spacing) are
 * ignored because they are speech-to-text formatting, not pronunciation.
 */
export function sentenceMatches(heardText: string, targetSentence: string) {
  const heard = normalizeSentence(heardText);

  if (heard === "") {
    return false;
  }

  return tokensMatch(heard.split(" "), normalizeSentence(targetSentence).split(" "));
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
      const heardText = `${collectedText} ${sessionText}`.trim();

      // Debug: raw recognizer output vs. what the check actually compares.
      console.log("[SentenceCheck] heard:", heardText);
      console.log("[SentenceCheck] normalized heard:", normalizeSentence(heardText));
      console.log("[SentenceCheck] normalized target:", normalizeSentence(targetSentence));

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
