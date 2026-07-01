"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { MinimalPair } from "@/types/training";

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitAudioContext?: typeof AudioContext;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

type QuizTarget = "A" | "B";

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  abort: () => void;
  start: () => void;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onnomatch: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null;
};

type BrowserSpeechRecognitionErrorEvent = Event & {
  error?: string;
};

type BrowserSpeechRecognitionResultEvent = Event & {
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type ActiveQuiz = {
  pairId: string;
  target: QuizTarget;
} | null;

type MinimalPairTrainerProps = {
  title: string;
  description: string;
  pairs: MinimalPair[];
};

export function MinimalPairTrainer({
  title,
  description,
  pairs,
}: MinimalPairTrainerProps) {
  const [message, setMessage] = useState(
    "まずは単語を聞いて、聞き取りか発音を試しましょう。",
  );
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz>(null);
  const [aiCheckTarget, setAiCheckTarget] = useState<string | null>(null);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      speechRecognitionRef.current?.abort();
    };
  }, []);

  function speak(word: string) {
    if (!("speechSynthesis" in window)) {
      playIncorrectSound();
      setMessage("このブラウザでは音声再生に対応していません。");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
    setMessage(`再生中: ${word}`);
  }

  function startQuiz(pair: MinimalPair) {
    const target: QuizTarget = Math.random() > 0.5 ? "A" : "B";
    const word = target === "A" ? pair.wordA : pair.wordB;

    setActiveQuiz({ pairId: pair.id, target });
    speak(word);
    setMessage("どちらの単語に聞こえましたか？");
  }

  function answerQuiz(pair: MinimalPair, answer: QuizTarget) {
    if (!activeQuiz || activeQuiz.pairId !== pair.id) {
      playIncorrectSound();
      setMessage("先に「クイズ再生」を押してから、AかBを選んでください。");
      return;
    }

    if (answer === activeQuiz.target) {
      playCorrectSound();
      setMessage("正解です。ピンポーン。");
    } else {
      playIncorrectSound();
      setMessage(
        `惜しいです。正解は${activeQuiz.target}でした。`,
      );
    }

    setActiveQuiz(null);
  }

  function startAiPronunciationCheck(pair: MinimalPair, target: QuizTarget) {
    const word = target === "A" ? pair.wordA : pair.wordB;
    const SpeechRecognitionConstructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      playIncorrectSound();
      setMessage("このブラウザでは発音チェックに対応していません。Chrome / Edgeで試してください。");
      return;
    }

    speechRecognitionRef.current?.abort();

    const recognition = new SpeechRecognitionConstructor();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    speechRecognitionRef.current = recognition;
    setAiCheckTarget(word);
    setMessage(`「${word}」を発音してください。聞き取れたら判定します。`);

    recognition.onresult = (event) => {
      const transcripts = getSpeechRecognitionTranscripts(event);
      const isCorrect = transcripts.some((transcript) =>
        transcriptMatchesWord(transcript, word),
      );
      const heardText = transcripts[0] ?? "unrecognized speech";

      if (isCorrect) {
        playCorrectSound();
        setMessage(`正解です。聞こえた単語: "${heardText}"`);
      } else {
        playIncorrectSound();
        setMessage(`もう一度。聞こえた単語: "${heardText}" / 目標: "${word}"`);
      }

      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    };

    recognition.onerror = () => {
      playIncorrectSound();
      setMessage("聞き取れませんでした。もう一度試してください。");
      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    };

    recognition.onnomatch = () => {
      playIncorrectSound();
      setMessage(`「${word}」として認識できませんでした。もう一度試してください。`);
      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    };

    recognition.onend = () => {
      setAiCheckTarget(null);
    };

    try {
      recognition.start();
    } catch {
      playIncorrectSound();
      setMessage("発音チェックを開始できませんでした。もう一度試してください。");
      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            First training
          </p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            {title}
          </h2>
          <p className="max-w-2xl leading-7 text-white/60">{description}</p>
        </div>
        <p
          role="status"
          aria-live="polite"
          className="border border-white/10 px-4 py-3 text-sm text-white/70"
        >
          {message}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pairs.map((pair) => (
          <article
            key={pair.id}
            className="flex min-h-56 flex-col justify-between border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/30"
          >
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                {pair.soundFocus}
              </p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <WordLabel label="A" word={pair.wordA} />
                <span className="text-sm text-white/30">vs</span>
                <WordLabel label="B" word={pair.wordB} />
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <TestGroup title="Listen">
                <ActionButton onClick={() => speak(pair.wordA)}>
                  Aを聞く
                </ActionButton>
                <ActionButton onClick={() => speak(pair.wordB)}>
                  Bを聞く
                </ActionButton>
              </TestGroup>

              <TestGroup title="聞き取りテスト">
                <ActionButton onClick={() => startQuiz(pair)}>
                  クイズ再生
                </ActionButton>
                <ActionButton onClick={() => answerQuiz(pair, "A")}>
                  Aだと思う
                </ActionButton>
                <ActionButton onClick={() => answerQuiz(pair, "B")}>
                  Bだと思う
                </ActionButton>
              </TestGroup>

              <TestGroup title="発音テスト">
                <ActionButton
                  disabled={Boolean(aiCheckTarget)}
                  onClick={() => startAiPronunciationCheck(pair, "A")}
                >
                  Aを発音する
                </ActionButton>
                <ActionButton
                  disabled={Boolean(aiCheckTarget)}
                  onClick={() => startAiPronunciationCheck(pair, "B")}
                >
                  Bを発音する
                </ActionButton>
              </TestGroup>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WordLabel({ label, word }: { label: string; word: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="text-3xl font-semibold text-white md:text-4xl">{word}</p>
    </div>
  );
}

function TestGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  );
}

function ActionButton({
  children,
  disabled = false,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-11 border border-white/15 px-3 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black focus:border-white focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/25 disabled:hover:bg-transparent disabled:hover:text-white/25"
    >
      {children}
    </button>
  );
}

function getSpeechRecognitionTranscripts(
  event: BrowserSpeechRecognitionResultEvent,
) {
  const transcripts: string[] = [];

  for (let resultIndex = 0; resultIndex < event.results.length; resultIndex += 1) {
    const result = event.results[resultIndex];

    for (
      let alternativeIndex = 0;
      alternativeIndex < result.length;
      alternativeIndex += 1
    ) {
      const transcript = result[alternativeIndex]?.transcript.trim();

      if (transcript) {
        transcripts.push(transcript);
      }
    }
  }

  return transcripts;
}

function transcriptMatchesWord(transcript: string, targetWord: string) {
  const normalizedTranscript = normalizeRecognizedText(transcript);
  const normalizedTarget = normalizeRecognizedText(targetWord);

  return normalizedTranscript.split(" ").includes(normalizedTarget);
}

function normalizeRecognizedText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function playCorrectSound() {
  const audioContext = createAudioContext();

  if (!audioContext) {
    return;
  }

  playTone(audioContext, 660, 0, 0.12, "sine");
  playTone(audioContext, 880, 0.13, 0.16, "sine");
}

function playIncorrectSound() {
  const audioContext = createAudioContext();

  if (!audioContext) {
    return;
  }

  playTone(audioContext, 160, 0, 0.28, "sawtooth");
}

function createAudioContext() {
  const AudioContextConstructor =
    window.AudioContext ?? window.webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  return new AudioContextConstructor();
}

function playTone(
  audioContext: AudioContext,
  frequency: number,
  startDelay: number,
  duration: number,
  type: OscillatorType,
) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const startsAt = audioContext.currentTime + startDelay;
  const endsAt = startsAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startsAt);
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.16, startsAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, endsAt);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startsAt);
  oscillator.stop(endsAt);
}
