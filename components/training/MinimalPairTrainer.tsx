"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";
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

type FeedbackType = "listen" | "listening" | "pronunciation" | "tongueTwister";
type FeedbackTone = "neutral" | "success" | "error";

type CardFeedback = {
  pairId: string;
  type: FeedbackType;
  tone: FeedbackTone;
  text: string;
  language: "en" | "ja";
} | null;

type MinimalPairTrainerProps = {
  id?: string;
  title: LocalizedText;
  description: LocalizedText;
  pairs: MinimalPair[];
};

const trainerCopy = {
  en: {
    firstTraining: "First training",
    guide: "Listen first, then try the listening or pronunciation test.",
    listenTitle: "Check the sounds",
    listenDescription: "Start by hearing the difference between A and B.",
    listenA: "Listen A",
    listenB: "Listen B",
    listeningTitle: "Listening test",
    listeningDescription: "Play a random word, then choose A or B.",
    playQuiz: "Play quiz",
    answerA: "I hear A",
    answerB: "I hear B",
    pronunciationTitle: "Pronunciation test",
    pronunciationDescription: "Say the target word and let AI check it.",
    speakA: "Say A",
    speakB: "Say B",
    tongueTwisterTitle: "Tongue twister",
    tongueTwisterDescription:
      "Practice both sounds together inside one short sentence.",
    listenTongueTwister: "Listen sentence",
    speechPlaybackUnsupported:
      "Speech playback is not supported in this browser.",
    playing: (word: string) => `Playing: ${word}`,
    whichWord: "Which word did you hear?",
    playQuizFirst: "Press Play quiz first, then choose A or B.",
    correct: "Correct.",
    listeningIncorrect: (target: QuizTarget) =>
      `Not quite. The answer was ${target}.`,
    pronunciationUnsupported:
      "Pronunciation check is not supported in this browser. Try Chrome or Edge.",
    sayWord: (word: string) => `Say "${word}". AI will check what it hears.`,
    pronunciationCorrect: (heardText: string) =>
      `Correct. Heard: "${heardText}"`,
    pronunciationRetry: (heardText: string, word: string) =>
      `Try again. Heard: "${heardText}" / Target: "${word}"`,
    couldNotHear: "I could not hear it. Try again.",
    couldNotRecognize: (word: string) =>
      `I could not recognize "${word}". Try again.`,
    checkCouldNotStart: "Pronunciation check could not start. Try again.",
  },
  ja: {
    firstTraining: "最初のトレーニング",
    guide: "まずは単語を聞いて、聞き取りか発音を試しましょう。",
    listenTitle: "音を確認",
    listenDescription: "まずはAとBの違いを耳で確認します。",
    listenA: "Aを聞く",
    listenB: "Bを聞く",
    listeningTitle: "聞き取りテスト",
    listeningDescription: "ランダム再生を聞いて、AかBを選びます。",
    playQuiz: "クイズ再生",
    answerA: "Aだと思う",
    answerB: "Bだと思う",
    pronunciationTitle: "発音テスト",
    pronunciationDescription: "目標の単語を発音して、AIで判定します。",
    speakA: "Aを発音する",
    speakB: "Bを発音する",
    tongueTwisterTitle: "Tongue Twister",
    tongueTwisterDescription:
      "学んだ2つの音を、ひとつの短い文の中で練習します。",
    listenTongueTwister: "文を聞く",
    speechPlaybackUnsupported: "このブラウザでは音声再生に対応していません。",
    playing: (word: string) => `再生中: ${word}`,
    whichWord: "どちらの単語に聞こえましたか？",
    playQuizFirst: "先に「クイズ再生」を押してから、AかBを選んでください。",
    correct: "正解です。",
    listeningIncorrect: (target: QuizTarget) =>
      `惜しいです。正解は${target}でした。`,
    pronunciationUnsupported:
      "このブラウザでは発音チェックに対応していません。Chrome / Edgeで試してください。",
    sayWord: (word: string) =>
      `「${word}」を発音してください。聞き取れたら判定します。`,
    pronunciationCorrect: (heardText: string) =>
      `正解です。聞こえた単語: "${heardText}"`,
    pronunciationRetry: (heardText: string, word: string) =>
      `もう一度。聞こえた単語: "${heardText}" / 目標: "${word}"`,
    couldNotHear: "聞き取れませんでした。もう一度試してください。",
    couldNotRecognize: (word: string) =>
      `「${word}」として認識できませんでした。もう一度試してください。`,
    checkCouldNotStart: "発音チェックを開始できませんでした。もう一度試してください。",
  },
};

export function MinimalPairTrainer({
  id,
  title,
  description,
  pairs,
}: MinimalPairTrainerProps) {
  const { language, text } = useLanguage();
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz>(null);
  const [aiCheckTarget, setAiCheckTarget] = useState<string | null>(null);
  const [cardFeedback, setCardFeedback] = useState<CardFeedback>(null);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const copy = trainerCopy[language];

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
    setCardFeedback({ pairId, type, tone, text, language });
  }

  function getFeedback(pairId: string, type: FeedbackType) {
    if (
      cardFeedback?.pairId !== pairId ||
      cardFeedback.type !== type ||
      cardFeedback.language !== language
    ) {
      return null;
    }

    return cardFeedback;
  }

  function speak(
    word: string,
    pairId?: string,
    feedbackType: FeedbackType = "listen",
  ) {
    if (!("speechSynthesis" in window)) {
      playIncorrectSound();
      const feedbackText = copy.speechPlaybackUnsupported;

      if (pairId) {
        showFeedback(pairId, feedbackType, "error", feedbackText);
      }

      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
    const feedbackText = copy.playing(word);

    if (pairId) {
      showFeedback(pairId, feedbackType, "neutral", feedbackText);
    }
  }

  function startQuiz(pair: MinimalPair) {
    const target: QuizTarget = Math.random() > 0.5 ? "A" : "B";
    const word = target === "A" ? pair.wordA : pair.wordB;

    setActiveQuiz({ pairId: pair.id, target });
    speak(word, pair.id);
    showFeedback(pair.id, "listening", "neutral", copy.whichWord);
  }

  function answerQuiz(pair: MinimalPair, answer: QuizTarget) {
    if (!activeQuiz || activeQuiz.pairId !== pair.id) {
      playIncorrectSound();
      showFeedback(
        pair.id,
        "listening",
        "error",
        copy.playQuizFirst,
      );
      return;
    }

    if (answer === activeQuiz.target) {
      playCorrectSound();
      showFeedback(pair.id, "listening", "success", copy.correct);
    } else {
      playIncorrectSound();
      showFeedback(
        pair.id,
        "listening",
        "error",
        copy.listeningIncorrect(activeQuiz.target),
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
        copy.pronunciationUnsupported,
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
      copy.sayWord(word),
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
          copy.pronunciationCorrect(heardText),
        );
      } else {
        playIncorrectSound();
        showFeedback(
          pair.id,
          "pronunciation",
          "error",
          copy.pronunciationRetry(heardText, word),
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
        copy.couldNotHear,
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
        copy.couldNotRecognize(word),
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
        copy.checkCouldNotStart,
      );
      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    }
  }

  return (
    <section id={id} className="scroll-mt-28 space-y-8">
      <div className="flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            {copy.firstTraining}
          </p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            {text(title)}
          </h2>
          <p className="max-w-2xl leading-7 text-white/60">
            {text(description)}
          </p>
        </div>
        <p
          role="status"
          aria-live="polite"
          className="border border-white/10 px-4 py-3 text-sm text-white/70"
        >
          {copy.guide}
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
                title={copy.listenTitle}
                description={copy.listenDescription}
                feedback={getFeedback(pair.id, "listen")}
              >
                <ActionButton onClick={() => speak(pair.wordA, pair.id)}>
                  {copy.listenA}
                </ActionButton>
                <ActionButton onClick={() => speak(pair.wordB, pair.id)}>
                  {copy.listenB}
                </ActionButton>
              </TestGroup>

              <TestGroup
                step="2"
                title={copy.listeningTitle}
                description={copy.listeningDescription}
                actionsClassName="grid gap-3"
                feedback={getFeedback(pair.id, "listening")}
              >
                <ActionButton intent="primary" onClick={() => startQuiz(pair)}>
                  {copy.playQuiz}
                </ActionButton>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ActionButton onClick={() => answerQuiz(pair, "A")}>
                    {copy.answerA}
                  </ActionButton>
                  <ActionButton onClick={() => answerQuiz(pair, "B")}>
                    {copy.answerB}
                  </ActionButton>
                </div>
              </TestGroup>

              <TestGroup
                step="3"
                title={copy.pronunciationTitle}
                description={copy.pronunciationDescription}
                feedback={getFeedback(pair.id, "pronunciation")}
              >
                <ActionButton
                  intent="primary"
                  disabled={Boolean(aiCheckTarget)}
                  onClick={() => startAiPronunciationCheck(pair, "A")}
                >
                  {copy.speakA}
                </ActionButton>
                <ActionButton
                  intent="primary"
                  disabled={Boolean(aiCheckTarget)}
                  onClick={() => startAiPronunciationCheck(pair, "B")}
                >
                  {copy.speakB}
                </ActionButton>
              </TestGroup>

              {pair.tongueTwister ? (
                <TestGroup
                  step="4"
                  title={copy.tongueTwisterTitle}
                  description={copy.tongueTwisterDescription}
                  actionsClassName="grid gap-3"
                  feedback={getFeedback(pair.id, "tongueTwister")}
                >
                  <div className="border border-white/10 bg-black px-4 py-3">
                    <p className="text-lg font-semibold leading-8 text-white">
                      {pair.tongueTwister.text}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      {text(pair.tongueTwister.note)}
                    </p>
                  </div>
                  <ActionButton
                    onClick={() =>
                      speak(
                        pair.tongueTwister?.text ?? "",
                        pair.id,
                        "tongueTwister",
                      )
                    }
                  >
                    {copy.listenTongueTwister}
                  </ActionButton>
                </TestGroup>
              ) : null}
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
