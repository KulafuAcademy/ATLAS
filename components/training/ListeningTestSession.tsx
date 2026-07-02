"use client";

import { useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";
import type { MinimalPair } from "@/types/training";

type QuizTarget = "A" | "B";

type ListeningQuestion = {
  pair: MinimalPair;
  target: QuizTarget;
};

type FeedbackTone = "neutral" | "success" | "error";

type ListeningTestSessionProps = {
  onComplete?: (score: number, total: number) => void;
  pairs: MinimalPair[];
  title: LocalizedText;
};

const listeningTestCopy = {
  en: {
    title: "Listening test mode",
    description: "Answer 10 questions in a row and check your score.",
    start: "Start listening test",
    restart: "Restart",
    play: "Play question",
    next: "Next",
    finish: "Show score",
    answerA: "A",
    answerB: "B",
    question: (current: number, total: number) => `Question ${current} / ${total}`,
    score: (score: number, total: number) => `Score: ${score} / ${total}`,
    ready: "Press Play question, then choose A or B.",
    correct: "Correct.",
    incorrect: (target: QuizTarget) => `Not quite. The answer was ${target}.`,
    complete: (score: number, total: number) => `Complete. Score: ${score} / ${total}`,
    unsupported: "Speech playback is not supported in this browser.",
  },
  ja: {
    title: "聞き取りテストモード",
    description: "10問連続で答えて、最後にスコアを確認します。",
    start: "聞き取りテストを始める",
    restart: "もう一度",
    play: "問題を再生",
    next: "次へ",
    finish: "スコアを見る",
    answerA: "A",
    answerB: "B",
    question: (current: number, total: number) => `${current} / ${total} 問目`,
    score: (score: number, total: number) => `スコア: ${score} / ${total}`,
    ready: "問題を再生してから、AかBを選びます。",
    correct: "正解です。",
    incorrect: (target: QuizTarget) => `惜しいです。正解は${target}でした。`,
    complete: (score: number, total: number) => `完了です。スコア: ${score} / ${total}`,
    unsupported: "このブラウザでは音声再生に対応していません。",
  },
};

export function ListeningTestSession({
  onComplete,
  pairs,
  title,
}: ListeningTestSessionProps) {
  const { language, text } = useLanguage();
  const copy = listeningTestCopy[language];
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<QuizTarget | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: FeedbackTone;
    text: string;
  } | null>(null);
  const isRunning = questions.length > 0 && currentIndex < questions.length;
  const isComplete = questions.length > 0 && currentIndex >= questions.length;
  const currentQuestion = isRunning ? questions[currentIndex] : null;

  function startSession() {
    const nextQuestions = pairs.slice(0, 10).map((pair) => ({
      pair,
      target: Math.random() > 0.5 ? "A" as const : "B" as const,
    }));

    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setFeedback({ tone: "neutral", text: copy.ready });
  }

  function playCurrentQuestion() {
    if (!currentQuestion) {
      return;
    }

    const word =
      currentQuestion.target === "A"
        ? currentQuestion.pair.wordA
        : currentQuestion.pair.wordB;

    if (!("speechSynthesis" in window)) {
      playIncorrectSound();
      setFeedback({ tone: "error", text: copy.unsupported });
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);

    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    setFeedback({ tone: "neutral", text: copy.ready });
  }

  function answerQuestion(answer: QuizTarget) {
    if (!currentQuestion || selectedAnswer) {
      return;
    }

    const isCorrect = answer === currentQuestion.target;

    setSelectedAnswer(answer);

    if (isCorrect) {
      playCorrectSound();
      setScore((currentScore) => currentScore + 1);
      setFeedback({ tone: "success", text: copy.correct });
    } else {
      playIncorrectSound();
      setFeedback({
        tone: "error",
        text: copy.incorrect(currentQuestion.target),
      });
    }
  }

  function goNext() {
    const nextIndex = currentIndex + 1;

    setSelectedAnswer(null);

    if (nextIndex >= questions.length) {
      setCurrentIndex(nextIndex);
      setFeedback({
        tone: "success",
        text: copy.complete(score, questions.length),
      });
      onComplete?.(score, questions.length);
      return;
    }

    setCurrentIndex(nextIndex);
    setFeedback({ tone: "neutral", text: copy.ready });
  }

  return (
    <section className="border-b border-white/10 py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">{copy.title}</p>
          <p className="text-sm leading-6 text-white/55">
            {text(title)}: {copy.description}
          </p>
          {isRunning ? (
            <p className="text-sm text-white/45">
              {copy.question(currentIndex + 1, questions.length)} /{" "}
              {copy.score(score, questions.length)}
            </p>
          ) : null}
          {isComplete ? (
            <p className="text-sm text-white/70">
              {copy.score(score, questions.length)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startSession}
            className="h-11 border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/85"
          >
            {questions.length > 0 ? copy.restart : copy.start}
          </button>

          {isRunning ? (
            <button
              type="button"
              onClick={playCurrentQuestion}
              className="h-11 border border-white/15 px-4 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              {copy.play}
            </button>
          ) : null}
        </div>
      </div>

      {isRunning && currentQuestion ? (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border border-white/10 bg-white/[0.02] p-4">
            <WordChoice label="A" word={currentQuestion.pair.wordA} />
            <span className="text-sm text-white/30">vs</span>
            <WordChoice label="B" word={currentQuestion.pair.wordB} />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <button
              type="button"
              disabled={Boolean(selectedAnswer)}
              onClick={() => answerQuestion("A")}
              className="h-11 border border-white/15 px-4 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/25 disabled:hover:bg-transparent disabled:hover:text-white/25"
            >
              {copy.answerA}
            </button>
            <button
              type="button"
              disabled={Boolean(selectedAnswer)}
              onClick={() => answerQuestion("B")}
              className="h-11 border border-white/15 px-4 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/25 disabled:hover:bg-transparent disabled:hover:text-white/25"
            >
              {copy.answerB}
            </button>
            <button
              type="button"
              disabled={!selectedAnswer}
              onClick={goNext}
              className="h-11 border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/25"
            >
              {currentIndex === questions.length - 1 ? copy.finish : copy.next}
            </button>
          </div>
        </div>
      ) : null}

      {feedback ? <ListeningFeedback tone={feedback.tone} text={feedback.text} /> : null}
    </section>
  );
}

function WordChoice({ label, word }: { label: QuizTarget; word: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="text-2xl font-semibold text-white">{word}</p>
    </div>
  );
}

function ListeningFeedback({
  tone,
  text,
}: {
  tone: FeedbackTone;
  text: string;
}) {
  const icon = tone === "success" ? "⭕️" : tone === "error" ? "❌" : null;
  const className =
    tone === "success"
      ? "border-white bg-white text-black"
      : tone === "error"
        ? "border-white/20 bg-white/[0.04] text-white"
        : "border-white/10 bg-white/[0.02] text-white/70";

  return (
    <p className={`mt-4 flex items-center gap-2 border px-3 py-2 text-sm font-medium ${className}`}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{text}</span>
    </p>
  );
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
