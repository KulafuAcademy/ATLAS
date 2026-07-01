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

type FeedbackType = "listen" | "listening" | "pronunciation";
type FeedbackTone = "neutral" | "success" | "error";

type CardFeedback = {
  pairId: string;
  type: FeedbackType;
  tone: FeedbackTone;
  text: string;
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
  const [cardFeedback, setCardFeedback] = useState<CardFeedback>(null);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      speechRecognitionRef.current?.abort();
    };
  }, []);

  function showFeedback(
    pairId: string,
    type: FeedbackType,
    tone: FeedbackTone,
    text: string,
  ) {
    setCardFeedback({ pairId, type, tone, text });
    setMessage(text);
  }

  function getFeedback(pairId: string, type: FeedbackType) {
    if (cardFeedback?.pairId !== pairId || cardFeedback.type !== type) {
      return null;
    }

    return cardFeedback;
  }

  function speak(word: string, pairId?: string) {
    if (!("speechSynthesis" in window)) {
      playIncorrectSound();
      const text = "このブラウザでは音声再生に対応していません。";

      if (pairId) {
        showFeedback(pairId, "listen", "error", text);
      } else {
        setMessage(text);
      }

      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
    const text = `再生中: ${word}`;

    if (pairId) {
      showFeedback(pairId, "listen", "neutral", text);
    } else {
      setMessage(text);
    }
  }

  function startQuiz(pair: MinimalPair) {
    const target: QuizTarget = Math.random() > 0.5 ? "A" : "B";
    const word = target === "A" ? pair.wordA : pair.wordB;

    setActiveQuiz({ pairId: pair.id, target });
    speak(word, pair.id);
    showFeedback(pair.id, "listening", "neutral", "どちらの単語に聞こえましたか？");
  }

  function answerQuiz(pair: MinimalPair, answer: QuizTarget) {
    if (!activeQuiz || activeQuiz.pairId !== pair.id) {
      playIncorrectSound();
      showFeedback(
        pair.id,
        "listening",
        "error",
        "先に「クイズ再生」を押してから、AかBを選んでください。",
      );
      return;
    }

    if (answer === activeQuiz.target) {
      playCorrectSound();
      showFeedback(pair.id, "listening", "success", "正解です。");
    } else {
      playIncorrectSound();
      showFeedback(
        pair.id,
        "listening",
        "error",
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
      showFeedback(
        pair.id,
        "pronunciation",
        "error",
        "このブラウザでは発音チェックに対応していません。Chrome / Edgeで試してください。",
      );
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
    showFeedback(
      pair.id,
      "pronunciation",
      "neutral",
      `「${word}」を発音してください。聞き取れたら判定します。`,
    );

    recognition.onresult = (event) => {
      const transcripts = getSpeechRecognitionTranscripts(event);
      const isCorrect = transcripts.some((transcript) =>
        transcriptMatchesWord(transcript, word),
      );
      const heardText = transcripts[0] ?? "unrecognized speech";

      if (isCorrect) {
        playCorrectSound();
        showFeedback(
          pair.id,
          "pronunciation",
          "success",
          `正解です。聞こえた単語: "${heardText}"`,
        );
      } else {
        playIncorrectSound();
        showFeedback(
          pair.id,
          "pronunciation",
          "error",
          `もう一度。聞こえた単語: "${heardText}" / 目標: "${word}"`,
        );
      }

      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    };

    recognition.onerror = () => {
      playIncorrectSound();
      showFeedback(
        pair.id,
        "pronunciation",
        "error",
        "聞き取れませんでした。もう一度試してください。",
      );
      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    };

    recognition.onnomatch = () => {
      playIncorrectSound();
      showFeedback(
        pair.id,
        "pronunciation",
        "error",
        `「${word}」として認識できませんでした。もう一度試してください。`,
      );
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
      showFeedback(
        pair.id,
        "pronunciation",
        "error",
        "発音チェックを開始できませんでした。もう一度試してください。",
      );
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

            <div className="mt-8 space-y-1 border-t border-white/10 pt-5">
              <TestGroup
                step="1"
                title="音を確認"
                description="まずはAとBの違いを耳で確認します。"
                feedback={getFeedback(pair.id, "listen")}
              >
                <ActionButton onClick={() => speak(pair.wordA, pair.id)}>
                  Aを聞く
                </ActionButton>
                <ActionButton onClick={() => speak(pair.wordB, pair.id)}>
                  Bを聞く
                </ActionButton>
              </TestGroup>

              <TestGroup
                step="2"
                title="聞き取りテスト"
                description="ランダム再生を聞いて、AかBを選びます。"
                actionsClassName="grid gap-3"
                feedback={getFeedback(pair.id, "listening")}
              >
                <ActionButton intent="primary" onClick={() => startQuiz(pair)}>
                  クイズ再生
                </ActionButton>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ActionButton onClick={() => answerQuiz(pair, "A")}>
                    Aだと思う
                  </ActionButton>
                  <ActionButton onClick={() => answerQuiz(pair, "B")}>
                    Bだと思う
                  </ActionButton>
                </div>
              </TestGroup>

              <TestGroup
                step="3"
                title="発音テスト"
                description="目標の単語を発音して、ブラウザAIで判定します。"
                feedback={getFeedback(pair.id, "pronunciation")}
              >
                <ActionButton
                  intent="primary"
                  disabled={Boolean(aiCheckTarget)}
                  onClick={() => startAiPronunciationCheck(pair, "A")}
                >
                  Aを発音する
                </ActionButton>
                <ActionButton
                  intent="primary"
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
  step,
  title,
  description,
  actionsClassName = "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
  feedback,
  children,
}: {
  step: string;
  title: string;
  description: string;
  actionsClassName?: string;
  feedback: CardFeedback;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 border-b border-white/10 py-5 sm:grid-cols-[3rem_1fr]">
      <div className="flex h-9 w-9 items-center justify-center border border-white/15 text-sm font-semibold text-white">
        {step}
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-sm leading-6 text-white/50">{description}</p>
        </div>
        <div className={actionsClassName}>{children}</div>
        {feedback ? <FeedbackMessage feedback={feedback} /> : null}
      </div>
    </div>
  );
}

function FeedbackMessage({ feedback }: { feedback: NonNullable<CardFeedback> }) {
  const icon =
    feedback.tone === "success" ? "⭕️" : feedback.tone === "error" ? "❌" : null;
  const feedbackClassName =
    feedback.tone === "success"
      ? "border-white bg-white text-black"
      : feedback.tone === "error"
        ? "border-white/20 bg-white/[0.04] text-white"
        : "border-white/10 bg-white/[0.02] text-white/70";

  return (
    <p
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 border px-3 py-2 text-sm font-medium ${feedbackClassName}`}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{feedback.text}</span>
    </p>
  );
}

function ActionButton({
  children,
  disabled = false,
  intent = "secondary",
  onClick,
}: {
  children: string;
  disabled?: boolean;
  intent?: "primary" | "secondary";
  onClick: () => void;
}) {
  const buttonClassName =
    intent === "primary"
      ? "h-11 border border-white bg-white px-3 text-sm font-semibold text-black transition hover:bg-white/85 focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/25"
      : "h-11 border border-white/15 px-3 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black focus:border-white focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/25 disabled:hover:bg-transparent disabled:hover:text-white/25";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName}
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
