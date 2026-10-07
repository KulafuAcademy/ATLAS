"use client";

import { useEffect, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { Language, LocalizedText } from "@/lib/i18n";
import {
  getBrowserSpeechVoices,
  getSavedBrowserSpeechVoice,
  saveBrowserSpeechVoice,
} from "@/lib/speechVoices";
import { playBrowserSpeech, stopSpeechPlayback } from "@/lib/speechPlayback";
import type { MinimalPair } from "@/types/training";

type QuizTarget = "A" | "B";

type ListeningQuestion = {
  pair: MinimalPair;
  target: QuizTarget;
};

type FeedbackTone = "neutral" | "success" | "error";
type VoicePreviewMessage = "" | "starting" | "started" | "error";
type FeedbackState =
  | { tone: "neutral"; kind: "ready" }
  | { tone: "error"; kind: "unsupported" | "playbackError" }
  | { tone: "success"; kind: "correct" }
  | { tone: "error"; kind: "incorrect"; target: QuizTarget }
  | { tone: "error"; kind: "incorrectWord"; word: string }
  | { tone: "success"; kind: "complete"; score: number; total: number };

type ListeningTestSessionProps = {
  onComplete?: (score: number, total: number) => void;
  pairs: MinimalPair[];
  title: LocalizedText;
  enhancedLayout?: boolean;
  browserVoice?: string;
  showVoiceControls?: boolean;
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
    readyStatus: "Ready to begin",
    activeStatus: "Listening test",
    completedStatus: "Test complete",
    instructions: "Start the test, listen to each word, and choose whether you heard A or B.",
    voice: "Practice voice",
    testVoice: "Test voice",
    previewStarting: "Playing voice preview…",
    previewStarted: "Voice preview started.",
    voicePlaybackError: "Browser speech playback failed. Try another available voice.",
    practiceFirst: "Practice first",
    slowMode: "Slow mode",
    questionHeading: "Which word do you hear?",
    chooseWord: "Choose the word you heard",
    incorrectWord: (word: string) => `Good try. The word was “${word}”. Listen for its first sound on the next question.`,
    allAnswered: "All questions answered",
    progressLabel: "Test progress",
    questionProgress: (current: number, total: number) => `Question ${current} of ${total}`,
    correct: "Correct — you identified the word. Continue to the next question.",
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
    readyStatus: "テスト開始前",
    activeStatus: "聞き取りテスト",
    completedStatus: "テスト完了",
    instructions: "テストを始めて、単語を聞き、AかBを選んでください。",
    voice: "練習音声",
    testVoice: "音声を試す",
    previewStarting: "音声プレビューを再生しています…",
    previewStarted: "音声プレビューを再生しました。",
    voicePlaybackError: "ブラウザ音声を再生できません。別の音声を試してください。",
    practiceFirst: "まずは練習",
    slowMode: "ゆっくり再生",
    questionHeading: "どの単語が聞こえますか？",
    chooseWord: "聞こえた単語を選んでください",
    incorrectWord: (word: string) => `惜しいです。正解は「${word}」です。次の問題では最初の音に注目してみましょう。`,
    allAnswered: "すべての問題に回答しました",
    progressLabel: "テストの進捗",
    questionProgress: (current: number, total: number) => `${total}問中${current}問目`,
    correct: "正解です。単語を聞き取れました。次の問題に進みましょう。",
    incorrect: (target: QuizTarget) => `惜しいです。正解は${target}でした。`,
    complete: (score: number, total: number) => `完了です。スコア: ${score} / ${total}`,
    unsupported: "このブラウザでは音声再生に対応していません。",
  },
};

function getFeedbackText(feedback: FeedbackState, language: "en" | "ja") {
  const copy = listeningTestCopy[language];

  switch (feedback.kind) {
    case "ready":
      return copy.ready;
    case "unsupported":
      return copy.unsupported;
    case "playbackError":
      return copy.voicePlaybackError;
    case "correct":
      return copy.correct;
    case "incorrect":
      return copy.incorrect(feedback.target);
    case "incorrectWord":
      return copy.incorrectWord(feedback.word);
    case "complete":
      return copy.complete(feedback.score, feedback.total);
  }
}

const buttonClassName =
  "h-11 border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/25 disabled:hover:bg-white/10 disabled:hover:text-white/25";

export function ListeningTestSession({
  onComplete,
  pairs,
  title,
  enhancedLayout = false,
  browserVoice,
  showVoiceControls = true,
}: ListeningTestSessionProps) {
  const { language, text } = useLanguage();
  const copy = listeningTestCopy[language];
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voicePreviewMessage, setVoicePreviewMessage] =
    useState<VoicePreviewMessage>("");
  const [slowPlayback, setSlowPlayback] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<QuizTarget | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const activeVoice = browserVoice ?? selectedVoice;
  const feedbackText = feedback ? getFeedbackText(feedback, language) : "";
  const isRunning = questions.length > 0 && currentIndex < questions.length;
  const isComplete = questions.length > 0 && currentIndex >= questions.length;
  const currentQuestion = isRunning ? questions[currentIndex] : null;

  useEffect(() => {
    const updateVoices = () => setAvailableVoices(getBrowserSpeechVoices());
    setSelectedVoice(getSavedBrowserSpeechVoice());
    updateVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", updateVoices);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", updateVoices);
      stopSpeechPlayback();
    };
  }, []);

  async function previewSelectedVoice() {
    setVoicePreviewMessage("starting");
    try {
      await playBrowserSpeech(
        "Hello, this is the selected practice voice.",
        selectedVoice,
      );
      setVoicePreviewMessage("started");
    } catch {
      setVoicePreviewMessage("error");
    }
  }

  function startSession() {
    const nextQuestions = pairs.slice(0, 10).map((pair) => ({
      pair,
      target: Math.random() > 0.5 ? "A" as const : "B" as const,
    }));

    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setFeedback({ tone: "neutral", kind: "ready" });
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
      setFeedback({ tone: "error", kind: "unsupported" });
      return;
    }

    setFeedback({ tone: "neutral", kind: "ready" });
    void playBrowserSpeech(
      word,
      activeVoice,
      slowPlayback ? "slow" : "normal",
    ).catch(() => {
      playIncorrectSound();
      setFeedback({ tone: "error", kind: "playbackError" });
    });
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
      setFeedback({ tone: "success", kind: "correct" });
    } else {
      playIncorrectSound();
      if (enhancedLayout) {
        setFeedback({
          tone: "error",
          kind: "incorrectWord",
          word:
            currentQuestion.target === "A"
              ? currentQuestion.pair.wordA
              : currentQuestion.pair.wordB,
        });
      } else {
        setFeedback({
          tone: "error",
          kind: "incorrect",
          target: currentQuestion.target,
        });
      }
    }
  }

  function goNext() {
    const nextIndex = currentIndex + 1;

    setSelectedAnswer(null);

    if (nextIndex >= questions.length) {
      setCurrentIndex(nextIndex);
      setFeedback({ tone: "success", kind: "complete", score, total: questions.length });
      onComplete?.(score, questions.length);
      return;
    }

    setCurrentIndex(nextIndex);
    setFeedback({ tone: "neutral", kind: "ready" });
  }

  return (
    <section className={enhancedLayout ? "overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.015] p-5 shadow-[0_24px_80px_-48px_rgba(80,210,235,0.22)] sm:p-7" : "border-b border-white/10 py-6"}>
      {(!enhancedLayout || !isRunning) ? <div className={enhancedLayout ? "flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between" : "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"}>
        <div className={enhancedLayout ? "space-y-3" : "space-y-2"}>
          <div className="flex items-center gap-3">
            {enhancedLayout ? <span className="grid size-10 place-items-center rounded-xl border border-cyan-100/15 bg-cyan-100/[0.07] text-lg text-cyan-100" aria-hidden="true">♪</span> : null}
            <div>
              <p className="text-sm font-semibold text-white">{copy.title}</p>
              {enhancedLayout ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-100/60">{questions.length === 0 ? copy.readyStatus : isComplete ? copy.completedStatus : copy.activeStatus}</p> : null}
            </div>
          </div>
          <p className="text-sm leading-6 text-white/60">
            {text(title)}: {copy.description}
          </p>
          {enhancedLayout && questions.length === 0 ? (
            <p className="text-xs leading-5 text-white/40">{copy.instructions}</p>
          ) : null}
        </div>

        <div className={enhancedLayout ? "flex shrink-0 flex-wrap items-end gap-3" : "flex flex-wrap gap-3"}>
          {enhancedLayout && showVoiceControls && questions.length === 0 ? (
            <div className="grid min-w-48 gap-1.5 text-xs font-medium text-white/65">
              <label htmlFor="take-test-voice">{copy.voice}</label>
              <div className="flex gap-2">
                <select
                  id="take-test-voice"
                  value={selectedVoice}
                  onChange={(event) => {
                    const voice = event.target.value;
                    setSelectedVoice(voice);
                    saveBrowserSpeechVoice(voice);
                    stopSpeechPlayback();
                    setVoicePreviewMessage("");
                  }}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-white/15 bg-[#101313] px-3 text-sm text-white outline-none transition focus:border-cyan-100/60 focus:ring-2 focus:ring-cyan-100/30"
                >
                  <option value="atlas-recordings" disabled>
                    ATLAS Voice (recordings coming soon)
                  </option>
                  <option value="">Default browser voice</option>
                  {availableVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} · {voice.lang}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void previewSelectedVoice()}
                  className="h-11 shrink-0 rounded-lg border border-cyan-100/30 bg-cyan-100/[0.06] px-3 text-xs font-semibold text-cyan-50 transition hover:border-cyan-100/60 hover:bg-cyan-100/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
                >
                  {copy.testVoice}
                </button>
              </div>
              {voicePreviewMessage ? (
                <span role="status" aria-live="polite" className="text-[0.68rem] leading-4 text-cyan-50/65">
                  {voicePreviewMessage === "starting"
                    ? copy.previewStarting
                    : voicePreviewMessage === "started"
                      ? copy.previewStarted
                      : copy.voicePlaybackError}
                </span>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={startSession}
            className={enhancedLayout ? `${buttonClassName} min-h-12 rounded-lg px-5 shadow-[0_8px_30px_-16px_rgba(255,255,255,0.5)]` : buttonClassName}
          >
            {questions.length > 0 ? copy.restart : copy.start}
          </button>

          {isRunning ? (
            <button
              type="button"
              onClick={playCurrentQuestion}
              className={enhancedLayout ? "min-h-12 rounded-lg border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:border-cyan-100/40 hover:bg-cyan-100/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100" : buttonClassName}
            >
              {enhancedLayout ? <span aria-hidden="true" className="mr-2 text-cyan-100">▶</span> : null}
              {copy.play}
            </button>
          ) : null}
        </div>
      </div> : null}

      {enhancedLayout && (isRunning || isComplete) ? (
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs font-medium text-white/55">
            <span>{isComplete ? copy.allAnswered : copy.questionProgress(currentIndex + 1, questions.length)}</span>
            <span>{copy.score(score, questions.length)}</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label={copy.progressLabel}
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={isComplete ? questions.length : currentIndex + 1}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-sky-400 transition-[width] duration-500"
              style={{ width: `${(Math.min(currentIndex + 1, questions.length) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      ) : null}
      {!enhancedLayout && isRunning ? (
        <p className="mt-3 text-sm text-white/45">
          {copy.question(currentIndex + 1, questions.length)} / {copy.score(score, questions.length)}
        </p>
      ) : null}
      {!enhancedLayout && isComplete ? (
        <p className="mt-3 text-sm text-white/70">{copy.score(score, questions.length)}</p>
      ) : null}
      {isRunning && currentQuestion && enhancedLayout ? (
        <div className="mt-7 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
                {copy.practiceFirst}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {copy.questionHeading}
              </h2>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="rounded-full border border-cyan-100/15 bg-cyan-100/[0.07] px-3 py-1.5 text-xs font-semibold tabular-nums text-cyan-100">
                {currentIndex + 1} / {questions.length}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={slowPlayback}
                aria-label={copy.slowMode}
                onClick={() => setSlowPlayback((enabled) => !enabled)}
                className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 ${slowPlayback ? "border-cyan-100/40 bg-cyan-100/[0.1] text-cyan-50" : "border-white/15 bg-white/[0.03] text-white/60 hover:border-white/30"}`}
              >
                <span
                  aria-hidden="true"
                  className={`relative h-4 w-7 rounded-full transition ${slowPlayback ? "bg-cyan-200/70" : "bg-white/20"}`}
                >
                  <span className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${slowPlayback ? "left-3.5" : "left-0.5"}`} />
                </span>
                {copy.slowMode}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 py-2">
            <button
              type="button"
              onClick={playCurrentQuestion}
              aria-label={copy.play}
              className="grid size-[4.5rem] place-items-center rounded-full border border-cyan-100/20 bg-cyan-100/[0.08] text-cyan-100 shadow-[0_12px_40px_-18px_rgba(103,232,249,0.55)] transition hover:scale-105 hover:bg-cyan-100/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-7">
                <path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <p className="text-sm text-white/55">{copy.chooseWord}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(["A", "B"] as const).map((answer) => {
              const word = answer === "A" ? currentQuestion.pair.wordA : currentQuestion.pair.wordB;
              const isSelected = selectedAnswer === answer;
              const isCorrectChoice = currentQuestion.target === answer;
              const choiceState = selectedAnswer
                ? isCorrectChoice
                  ? "border-cyan-100/70 bg-cyan-100/[0.09] text-cyan-50"
                  : isSelected
                    ? "border-rose-300/60 bg-rose-300/[0.07] text-white/75"
                    : "border-white/10 bg-white/[0.02] text-white/40"
                : "border-white/20 bg-white/[0.025] text-white hover:border-cyan-100/55 hover:bg-cyan-100/[0.06]";

              return (
                <button
                  key={answer}
                  type="button"
                  disabled={Boolean(selectedAnswer)}
                  onClick={() => answerQuestion(answer)}
                  aria-pressed={isSelected}
                  className={`flex min-h-[4.5rem] items-center justify-center rounded-xl border px-5 text-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 disabled:cursor-default ${choiceState}`}
                >
                  {word}
                </button>
              );
            })}
          </div>

          {selectedAnswer ? (
            <div className={`flex flex-col gap-4 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${feedback?.tone === "success" ? "border-cyan-100/15 bg-cyan-100/[0.07]" : "border-white/10 bg-white/[0.035]"}`}>
              {feedback ? (
                <ListeningFeedback
                  language={language}
                  tone={feedback.tone}
                  text={feedbackText}
                />
              ) : null}
              <button
                type="button"
                onClick={goNext}
                className="min-h-10 shrink-0 rounded-lg bg-white px-5 text-sm font-semibold text-black transition hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {currentIndex === questions.length - 1 ? copy.finish : copy.next}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {isRunning && currentQuestion && !enhancedLayout ? (
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
              className={buttonClassName}
            >
              {copy.answerA}
            </button>
            <button
              type="button"
              disabled={Boolean(selectedAnswer)}
              onClick={() => answerQuestion("B")}
              className={buttonClassName}
            >
              {copy.answerB}
            </button>
            <button
              type="button"
              disabled={!selectedAnswer}
              onClick={goNext}
              className={buttonClassName}
            >
              {currentIndex === questions.length - 1 ? copy.finish : copy.next}
            </button>
          </div>
        </div>
      ) : null}

      {feedback && !enhancedLayout ? (
        <ListeningFeedback
          language={language}
          tone={feedback.tone}
          text={feedbackText}
        />
      ) : null}
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
  language,
  tone,
  text,
}: {
  language: Language;
  tone: FeedbackTone;
  text: string;
}) {
  const icon =
    tone === "success" ? (language === "ja" ? "○" : "✓") : tone === "error" ? "×" : null;
  const className =
    tone === "success"
      ? "border-white bg-white text-black"
      : tone === "error"
        ? "border-white/20 bg-white/[0.04] text-white"
        : "border-white/10 bg-white/[0.02] text-white/70";

  return (
    <p className={`mt-4 flex items-center gap-2 border px-3 py-2 text-sm font-medium ${className}`}>
      {icon ? (
        <span
          aria-hidden="true"
          className={`font-bold ${tone === "success" ? (language === "ja" ? "text-rose-500" : "text-emerald-600") : "text-rose-400"}`}
        >
          {icon}
        </span>
      ) : null}
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
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

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
