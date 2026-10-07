"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";
import {
  getBrowserSpeechVoices,
  getSavedBrowserSpeechVoice,
  saveBrowserSpeechVoice,
} from "@/lib/speechVoices";
import { playBrowserSpeech, stopSpeechPlayback } from "@/lib/speechPlayback";
import type { MinimalPair } from "@/types/training";

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
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
  stop: () => void;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onnomatch: (() => void) | null;
  onspeechstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onsoundstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onsoundend: (() => void) | null;
  onaudioend: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null;
};

type BrowserSpeechRecognitionErrorEvent = Event & {
  error?: string;
  message?: string;
};

type BrowserSpeechRecognitionResultEvent = Event & {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
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

type TrainerCopy = typeof trainerCopy.en;

type ListenKey = "A" | "B" | "sentence";

type ListenSession = {
  runId: number;
  key: ListenKey;
  target: string;
  heard: string;
  speechDetected: boolean;
  log: SpeechLogger;
  finished: boolean;
  timers: number[];
};

// Finish a single-word check shortly after a word is heard instead of
// waiting for the browser's own end-of-speech detection.
const wordSettleMs = 450;
const sentenceSettleMs = 1200;
// Keep a short window for browsers that deliver the final transcript after
// `end`, without making users wait several seconds when only interim text exists.
const finalResultGraceMs = 1200;
const noSpeechTimeoutMs = 6000;
const maxListenMs = { word: 8000, sentence: 12000 };
const holdThresholdMs = 500;

type SpeechLogger = (event: string, detail?: unknown) => void;

// Mic diagnostics go to the browser console in development, or anywhere after
// running localStorage.setItem("atlas.debugSpeech", "1").
function isSpeechDebugEnabled() {
  if (process.env.NODE_ENV !== "production") return true;
  try {
    return window.localStorage.getItem("atlas.debugSpeech") === "1";
  } catch {
    return false;
  }
}

function createSpeechLogger(label: string): SpeechLogger {
  const startedAt = performance.now();
  return (event, detail) => {
    if (!isSpeechDebugEnabled()) return;
    const elapsed = Math.round(performance.now() - startedAt);
    console.info(`[ATLAS mic ${label}] +${elapsed}ms ${event}`, detail ?? "");
  };
}

const stopPronunciationCheckEvent = "atlas:stop-pronunciation-check";

// Sound focuses that offer slow playback in steps 1, 2 and 4 (listening and the tongue twister).
const slowModeSoundFocuses = new Set(["R vs L"]);

type MinimalPairTrainerProps = {
  id?: string;
  title: LocalizedText;
  description: LocalizedText;
  pairs: MinimalPair[];
  showPairControls?: boolean;
  browserVoice?: string;
  showVoiceControls?: boolean;
};

const trainerCopy = {
  en: {
    firstTraining: "First training",
    guide: "Listen first, then try the listening or pronunciation test.",
    pairs: "pairs",
    allPairs: "All pairs",
    todaysTen: "Today's 10",
    open: "Open",
    close: "Close",
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
    pronunciationDescriptionRvsL:
      "Say the target word. Browser speech recognition will transcribe what it hears.",
    pronunciationPromptRvsL: (word: string) =>
      'Say "' + word + '". Speech recognition will transcribe it.',
    practiceVoice: "Practice voice",
    testVoice: "Test voice",
    voiceHelp: "This voice is used for R vs L practice and its listening test.",
    previewStarting: "Playing voice preview…",
    previewStarted: "Voice preview started.",
    voicePlaybackError: "Browser speech playback failed. Try another available voice.",
    speakA: "Say A",
    speakB: "Say B",
    tongueTwisterTitle: "Tongue twister",
    tongueTwisterDescription:
      "Practice both sounds together inside one short sentence.",
    listenTongueTwister: "Listen sentence",
    recordTongueTwister: "Speak and check",
    tongueTwisterPrompt: (sentence: string) => `Say: “${sentence}”`,
    tongueTwisterCorrect: (heardText: string) =>
      `Both target sounds were recognized. Heard: “${heardText}”`,
    tongueTwisterRetry: (heardText: string) =>
      `Try again and focus on both sounds. Heard: “${heardText}”`,
    speechPlaybackUnsupported:
      "Speech playback is not supported in this browser.",
    playing: (word: string) => `Playing: ${word}`,
    playingSlow: (word: string) => `Playing slowly: ${word}`,
    slowMode: "Slow",
    slowModeLabel: "Slow playback",
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
    preparingMicrophone: "Getting the microphone ready…",
    micHint: "Tap to start, tap again to check. Or hold while you speak and release.",
    listeningNow: "Listening…",
    hearing: (heardText: string) => `Hearing: “${heardText}”`,
    stopAndCheck: "Stop & check",
    cancelListening: "Cancel",
    noSpeechRecognized: "no speech recognized",
    micBlocked:
      "Microphone access is blocked. Allow the microphone for this site and try again.",
    noSpeechDetected:
      "No speech was detected. Check that the right microphone is selected in your browser and system settings, then try again.",
    noMicrophone: "No microphone was found. Connect or select a microphone and try again.",
    speechServiceUnreachable:
      "The browser's speech recognition service could not be reached. Check your internet connection, or use Chrome or Edge.",
    recognitionError: (code: string) => `Speech recognition failed (${code}). Try again.`,
    speechNotTranscribed:
      "Speech was detected, but the browser did not return a transcript. Try again, or check your browser's speech-recognition connection.",
  },
  ja: {
    firstTraining: "最初のトレーニング",
    guide: "まずは単語を聞いて、聞き取りか発音を試しましょう。",
    pairs: "問",
    allPairs: "全問",
    todaysTen: "今日の10問",
    open: "開く",
    close: "閉じる",
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
    pronunciationDescriptionRvsL:
      "目標の単語を発音してください。ブラウザの音声認識が聞き取った内容を表示します。",
    pronunciationPromptRvsL: (word: string) =>
      "「" + word + "」を発音してください。音声認識が聞き取った内容を表示します。",
    practiceVoice: "練習音声",
    testVoice: "音声を試す",
    voiceHelp: "この音声はRとLの練習と聞き取りテストで使われます。",
    previewStarting: "音声プレビューを再生しています…",
    previewStarted: "音声プレビューを再生しました。",
    voicePlaybackError: "ブラウザ音声を再生できません。別の音声を試してください。",
    speakA: "Aを発音する",
    speakB: "Bを発音する",
    tongueTwisterTitle: "Tongue Twister",
    tongueTwisterDescription:
      "学んだ2つの音を、ひとつの短い文の中で練習します。",
    listenTongueTwister: "文を聞く",
    recordTongueTwister: "発音して確認",
    tongueTwisterPrompt: (sentence: string) => `発音してください:「${sentence}」`,
    tongueTwisterCorrect: (heardText: string) =>
      `両方の音を認識しました。聞こえた内容:「${heardText}」`,
    tongueTwisterRetry: (heardText: string) =>
      `両方の音を意識して、もう一度試してください。聞こえた内容:「${heardText}」`,
    speechPlaybackUnsupported: "このブラウザでは音声再生に対応していません。",
    playing: (word: string) => `再生中: ${word}`,
    playingSlow: (word: string) => `ゆっくり再生中: ${word}`,
    slowMode: "ゆっくり",
    slowModeLabel: "ゆっくり再生",
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
    checkCouldNotStart:
      "発音チェックを開始できませんでした。もう一度試してください。",
    preparingMicrophone: "マイクを準備しています…",
    micHint: "タップで開始、もう一度タップで判定。押したまま話して、離して判定することもできます。",
    listeningNow: "聞き取り中…",
    hearing: (heardText: string) => `聞き取り中:「${heardText}」`,
    stopAndCheck: "停止して判定",
    cancelListening: "キャンセル",
    noSpeechRecognized: "音声を認識できませんでした",
    micBlocked:
      "マイクへのアクセスがブロックされています。このサイトのマイクを許可してから、もう一度試してください。",
    noSpeechDetected:
      "音声が検出されませんでした。ブラウザとシステム設定で正しいマイクが選ばれているか確認して、もう一度試してください。",
    noMicrophone: "マイクが見つかりません。マイクを接続または選択してから、もう一度試してください。",
    speechServiceUnreachable:
      "ブラウザの音声認識サービスに接続できません。インターネット接続を確認するか、Chrome / Edgeを使ってください。",
    recognitionError: (code: string) => `音声認識に失敗しました（${code}）。もう一度試してください。`,
    speechNotTranscribed:
      "音声は検出されましたが、ブラウザから文字起こし結果が返りませんでした。もう一度試すか、ブラウザの音声認識の接続を確認してください。",
  },
};

export function MinimalPairTrainer({
  id,
  title,
  description,
  pairs,
  showPairControls = false,
  browserVoice,
  showVoiceControls = true,
}: MinimalPairTrainerProps) {
  const { language, text } = useLanguage();
  const copy = trainerCopy[language];
  const isRvsL = pairs.some((pair) => pair.soundFocus === "R vs L");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voicePreviewMessage, setVoicePreviewMessage] = useState("");
  const [pairMode, setPairMode] = useState<"all" | "daily">("all");
  const [practiceOpen, setPracticeOpen] = useState(true);
  const activeVoice = browserVoice ?? selectedVoice;
  const visiblePairs =
    showPairControls && pairMode === "daily"
      ? getDailyPracticePairs(
          id ?? (typeof title === "string" ? title : title.en),
          pairs,
        )
      : pairs;

  useEffect(() => {
    if (!isRvsL) return;
    const updateVoices = () => setAvailableVoices(getBrowserSpeechVoices());
    setSelectedVoice(getSavedBrowserSpeechVoice());
    updateVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", updateVoices);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", updateVoices);
      stopSpeechPlayback();
    };
  }, [isRvsL]);

  async function previewSelectedVoice() {
    setVoicePreviewMessage(copy.previewStarting);
    try {
      await playBrowserSpeech(
        "Hello, this is the selected practice voice.",
        selectedVoice,
      );
      setVoicePreviewMessage(copy.previewStarted);
    } catch (error) {
      setVoicePreviewMessage(
        error instanceof Error ? error.message : copy.voicePlaybackError,
      );
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
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p
            role="status"
            aria-live="polite"
            className="border border-white/10 px-4 py-3 text-sm text-white/70"
          >
            {copy.guide}
          </p>
          {showPairControls ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-white/45">
                {visiblePairs.length} / {pairs.length} {copy.pairs}
              </span>
              <div className="grid grid-cols-2 border border-white/10 text-xs font-medium">
                <button
                  type="button"
                  aria-pressed={pairMode === "all"}
                  onClick={() => setPairMode("all")}
                  className={`h-9 border border-white px-3 text-black transition ${pairMode === "all" ? "bg-white" : "bg-white/75 hover:bg-white"}`}
                >
                  {copy.allPairs}
                </button>
                <button
                  type="button"
                  aria-pressed={pairMode === "daily"}
                  onClick={() => setPairMode("daily")}
                  className={`h-9 border border-white px-3 text-black transition ${pairMode === "daily" ? "bg-white" : "bg-white/75 hover:bg-white"}`}
                >
                  {copy.todaysTen}
                </button>
              </div>
              <button
                type="button"
                aria-expanded={practiceOpen}
                onClick={() => setPracticeOpen((open) => !open)}
                className="h-9 border border-white bg-white px-3 text-xs font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none"
              >
                {practiceOpen ? copy.close : copy.open}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {practiceOpen && isRvsL && showVoiceControls ? (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="grid min-w-48 flex-1 gap-1.5 text-xs font-medium text-white/65">
            <label htmlFor="rvsl-practice-voice">{copy.practiceVoice}</label>
            <select
              id="rvsl-practice-voice"
              value={selectedVoice}
              onChange={(event) => {
                const voice = event.target.value;
                setSelectedVoice(voice);
                saveBrowserSpeechVoice(voice);
                stopSpeechPlayback();
                setVoicePreviewMessage("");
              }}
              className="h-11 rounded-lg border border-white/15 bg-[#101313] px-3 text-sm text-white outline-none transition focus:border-cyan-100/60 focus:ring-2 focus:ring-cyan-100/30"
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
          </div>
          <button
            type="button"
            onClick={() => void previewSelectedVoice()}
            className="h-11 rounded-lg border border-cyan-100/30 bg-cyan-100/[0.06] px-4 text-sm font-semibold text-cyan-50 transition hover:border-cyan-100/60 hover:bg-cyan-100/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
          >
            {copy.testVoice}
          </button>
          <p className="basis-full text-xs leading-5 text-white/40" role="status" aria-live="polite">
            {voicePreviewMessage || copy.voiceHelp}
          </p>
        </div>
      ) : null}

      {practiceOpen ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visiblePairs.map((pair) => (
            <PairPracticeCard
              key={pair.id}
              copy={copy}
              language={language}
              pair={pair}
              text={text}
              browserVoice={activeVoice}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function getDailyPracticePairs(sectionId: string, pairs: MinimalPair[]) {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return [...pairs]
    .sort((pairA, pairB) => {
      const scoreA = hashPracticePair(`${dateKey}:${sectionId}:${pairA.id}`);
      const scoreB = hashPracticePair(`${dateKey}:${sectionId}:${pairB.id}`);
      return scoreA - scoreB;
    })
    .slice(0, 10);
}

function hashPracticePair(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function PairPracticeCard({
  copy,
  language,
  pair,
  text,
  browserVoice,
}: {
  copy: TrainerCopy;
  language: "en" | "ja";
  pair: MinimalPair;
  text: (value: LocalizedText) => string;
  browserVoice: string;
}) {
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz>(null);
  const [listeningKey, setListeningKey] = useState<ListenKey | null>(null);
  const [cardFeedback, setCardFeedback] = useState<CardFeedback>(null);
  const speechRecognitionRunIdRef = useRef(0);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const listenSessionRef = useRef<ListenSession | null>(null);
  const holdingRef = useRef(false);
  const setHolding = (pressed: boolean) => {
    holdingRef.current = pressed;
  };
  const tongueTwister = getTongueTwister(pair);
  const hasSlowMode = slowModeSoundFocuses.has(pair.soundFocus);
  const [slowListen, setSlowListen] = useState(false);
  const [slowQuiz, setSlowQuiz] = useState(false);
  const [slowTongueTwister, setSlowTongueTwister] = useState(false);

  useEffect(() => {
    function stopRecognition() {
      listenSessionRef.current?.log("cancelled (Cancel button or another check started)");
      speechRecognitionRunIdRef.current += 1;
      speechRecognitionRef.current?.abort();
      speechRecognitionRef.current = null;
      clearListenSession();
      setListeningKey(null);
      // Drop the "Say …" prompt left behind when another card takes the mic.
      setCardFeedback((current) =>
        current?.tone === "neutral" &&
        (current.type === "pronunciation" || current.type === "tongueTwister")
          ? null
          : current,
      );
    }

    window.addEventListener(stopPronunciationCheckEvent, stopRecognition);

    return () => {
      window.removeEventListener(stopPronunciationCheckEvent, stopRecognition);
      stopRecognition();
      stopSpeechPlayback();
    };
  }, []);

  function showFeedback(
    type: FeedbackType,
    tone: FeedbackTone,
    textValue: string,
  ) {
    setCardFeedback({
      pairId: pair.id,
      type,
      tone,
      text: textValue,
      language,
    });
  }

  function getFeedback(type: FeedbackType) {
    if (
      cardFeedback?.pairId !== pair.id ||
      cardFeedback.type !== type ||
      cardFeedback.language !== language
    ) {
      return null;
    }

    return cardFeedback;
  }

  function speak(word: string, feedbackType: FeedbackType = "listen", slow = false) {
    const playingText = slow ? copy.playingSlow(word) : copy.playing(word);

    if (!("speechSynthesis" in window)) {
      playIncorrectSound();
      showFeedback(feedbackType, "error", copy.speechPlaybackUnsupported);
      return;
    }

    showFeedback(feedbackType, "neutral", playingText);
    void playBrowserSpeech(word, browserVoice, slow ? "slow" : "normal").catch(() => {
      playIncorrectSound();
      showFeedback(feedbackType, "error", copy.voicePlaybackError);
    });
  }

  function startQuiz() {
    const target: QuizTarget = Math.random() > 0.5 ? "A" : "B";
    const word = target === "A" ? pair.wordA : pair.wordB;

    setActiveQuiz({ pairId: pair.id, target });
    speak(word, "listen", hasSlowMode && slowQuiz);
    showFeedback("listening", "neutral", copy.whichWord);
  }

  function answerQuiz(answer: QuizTarget) {
    if (!activeQuiz || activeQuiz.pairId !== pair.id) {
      playIncorrectSound();
      showFeedback("listening", "error", copy.playQuizFirst);
      return;
    }

    if (answer === activeQuiz.target) {
      playCorrectSound();
      showFeedback("listening", "success", copy.correct);
    } else {
      playIncorrectSound();
      showFeedback(
        "listening",
        "error",
        copy.listeningIncorrect(activeQuiz.target),
      );
    }

    setActiveQuiz(null);
  }

  function clearListenSession() {
    listenSessionRef.current?.timers.forEach((timer) => window.clearTimeout(timer));
    listenSessionRef.current = null;
  }

  function feedbackTypeFor(key: ListenKey): FeedbackType {
    return key === "sentence" ? "tongueTwister" : "pronunciation";
  }

  // Closes out one check exactly once; later events from that run are ignored.
  function completeListening(runId: number) {
    if (speechRecognitionRunIdRef.current !== runId) return false;

    speechRecognitionRunIdRef.current += 1;
    speechRecognitionRef.current?.abort();
    speechRecognitionRef.current = null;
    clearListenSession();
    setListeningKey(null);
    return true;
  }

  function evaluateHeard(key: ListenKey, heardText: string) {
    if (key === "sentence") {
      const normalizedHeard = normalizeRecognizedText(heardText);
      const heardBothSounds = [pair.wordA, pair.wordB].every((word) =>
        normalizedHeard.split(" ").includes(normalizeRecognizedText(word)),
      );

      if (heardBothSounds) {
        playCorrectSound();
        showFeedback("tongueTwister", "success", copy.tongueTwisterCorrect(heardText));
      } else {
        playIncorrectSound();
        showFeedback(
          "tongueTwister",
          "error",
          copy.tongueTwisterRetry(heardText || copy.noSpeechRecognized),
        );
      }
      return;
    }

    const word = key === "A" ? pair.wordA : pair.wordB;

    if (transcriptMatchesWord(heardText, word)) {
      playCorrectSound();
      showFeedback("pronunciation", "success", copy.pronunciationCorrect(heardText));
    } else {
      playIncorrectSound();
      showFeedback("pronunciation", "error", copy.pronunciationRetry(heardText, word));
    }
  }

  // Stops listening now and judges whatever has been heard so far.
  function finishListening(reason: string) {
    const session = listenSessionRef.current;
    if (!session || session.finished) return;

    session.log("finish requested", {
      reason,
      heard: session.heard,
    });

    session.finished = true;
    session.timers.forEach((timer) => window.clearTimeout(timer));
    session.timers = [];

    // stop() asks the browser for a final transcript. Do not abort just because
    // no interim transcript arrived; some browsers only return final results.
    try {
      speechRecognitionRef.current?.stop();
    } catch (error) {
      session.log("stop() failed; waiting for recognition end", error);
    }

    session.timers.push(window.setTimeout(() => {
      if (!completeListening(session.runId)) return;

      if (session.heard) {
        session.log("no final result after stop(); judging last interim", session.heard);
        evaluateHeard(session.key, session.heard);
        return;
      }

      playIncorrectSound();
      showFeedback(
        feedbackTypeFor(session.key),
        "error",
        session.speechDetected ? copy.speechNotTranscribed : copy.noSpeechDetected,
      );
    }, finalResultGraceMs));
  }

  // Letting go of a held button only checks once something has been heard;
  // otherwise it keeps listening as if the button had been tapped.
  function releaseHold() {
    const session = listenSessionRef.current;
    if (session?.heard) {
      finishListening("button released");
    } else {
      listenSessionRef.current?.log("button released before any words; still listening");
    }
  }

  function describeRecognitionError(code = "unknown") {
    switch (code) {
      case "not-allowed":
      case "service-not-allowed":
        return copy.micBlocked;
      case "no-speech":
        return copy.noSpeechDetected;
      case "audio-capture":
        return copy.noMicrophone;
      case "network":
        return copy.speechServiceUnreachable;
      default:
        return copy.recognitionError(code);
    }
  }

  function cancelListening() {
    window.dispatchEvent(new Event(stopPronunciationCheckEvent));
  }

  function startListening(key: ListenKey) {
    const feedbackType = feedbackTypeFor(key);
    const SpeechRecognitionConstructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      playIncorrectSound();
      showFeedback(feedbackType, "error", copy.pronunciationUnsupported);
      return;
    }

    window.dispatchEvent(new Event(stopPronunciationCheckEvent));
    stopSpeechPlayback();

    const recognition = new SpeechRecognitionConstructor();
    const runId = speechRecognitionRunIdRef.current + 1;
    const target =
      key === "sentence" ? tongueTwister.text : key === "A" ? pair.wordA : pair.wordB;
    const log = createSpeechLogger(`#${runId} ${pair.id}/${key}`);
    const session: ListenSession = {
      runId,
      key,
      target,
      heard: "",
      speechDetected: false,
      log,
      finished: false,
      timers: [],
    };

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    speechRecognitionRunIdRef.current = runId;
    speechRecognitionRef.current = recognition;
    listenSessionRef.current = session;
    setListeningKey(key);
    log("start", { target, lang: recognition.lang, interimResults: true });

    if (key === "sentence") {
      showFeedback(feedbackType, "neutral", copy.tongueTwisterPrompt(tongueTwister.text));
    } else {
      const word = key === "A" ? pair.wordA : pair.wordB;
      showFeedback(
        feedbackType,
        "neutral",
        pair.soundFocus === "R vs L"
          ? copy.pronunciationPromptRvsL(word)
          : copy.sayWord(word),
      );
    }

    session.timers.push(
      window.setTimeout(() => {
        if (!session.heard && !session.speechDetected) {
          finishListening(`no speech detected within ${noSpeechTimeoutMs}ms`);
        }
      }, noSpeechTimeoutMs),
      window.setTimeout(
        () => finishListening("max listening time reached"),
        key === "sentence" ? maxListenMs.sentence : maxListenMs.word,
      ),
    );
    let settleTimer = 0;

    recognition.onresult = (event) => {
      log("result", describeResults(event));
      if (speechRecognitionRunIdRef.current !== runId) return;

      let heardText = "";
      let isFinal = true;
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        heardText += ` ${result[0]?.transcript ?? ""}`;
        isFinal &&= result.isFinal;
      }
      heardText = heardText.replace(/\s+/g, " ").trim();
      if (heardText) session.heard = heardText;

      if (isFinal) {
        if (completeListening(runId)) {
          log("judge final result", { heard: session.heard, target });
          evaluateHeard(key, session.heard);
        }
        return;
      }

      if (session.heard && !session.finished) {
        showFeedback(feedbackType, "neutral", copy.hearing(session.heard));
        window.clearTimeout(settleTimer);
        const settle = () => {
          // While the button is held, the release decides when to check.
          if (holdingRef.current) {
            settleTimer = window.setTimeout(settle, 200);
            session.timers.push(settleTimer);
            return;
          }
          finishListening("words settled");
        };
        settleTimer = window.setTimeout(
          settle,
          key === "sentence" ? sentenceSettleMs : wordSettleMs,
        );
        session.timers.push(settleTimer);
      }
    };

    recognition.onaudiostart = () => log("audiostart (browser opened the mic)");
    recognition.onsoundstart = () => log("soundstart (any sound)");
    recognition.onspeechstart = () => {
      log("speechstart (speech detected)");
      session.speechDetected = true;
    };
    recognition.onspeechend = () => {
      log("speechend");
    };
    recognition.onsoundend = () => log("soundend");
    recognition.onaudioend = () => log("audioend");

    recognition.onerror = (event) => {
      log("error", { error: event.error, message: event.message });
      if (event.error === "aborted" || !completeListening(runId)) return;

      playIncorrectSound();
      showFeedback(feedbackType, "error", describeRecognitionError(event.error));
    };

    recognition.onnomatch = () => {
      log("nomatch");
      if (!completeListening(runId)) return;

      playIncorrectSound();
      showFeedback(
        feedbackType,
        "error",
        copy.couldNotRecognize(
          key === "sentence" ? tongueTwister.text : key === "A" ? pair.wordA : pair.wordB,
        ),
      );
    };

    recognition.onend = () => {
      log("end", { heard: session.heard, alreadyHandled: speechRecognitionRunIdRef.current !== runId });
      if (speechRecognitionRunIdRef.current !== runId) return;

      // Keep the session alive briefly after `end`; some browser engines deliver
      // the final result late, and aborting here would discard that transcript.
      if (session.finished) {
        log("ended while waiting for final result", { heard: session.heard });
        return;
      }

      session.finished = true;
      session.timers.forEach((timer) => window.clearTimeout(timer));
      session.timers = [];

      if (session.heard) {
        if (completeListening(runId)) evaluateHeard(key, session.heard);
        return;
      }

      log("ended without transcript; waiting for any delayed result");
      session.timers.push(window.setTimeout(() => {
        if (!completeListening(runId)) return;

        playIncorrectSound();
        showFeedback(
          feedbackType,
          "error",
          session.speechDetected ? copy.speechNotTranscribed : copy.noSpeechDetected,
        );
      }, finalResultGraceMs));
    };

    try {
      recognition.start();
    } catch (error) {
      log("start() threw", error);
      if (!completeListening(runId)) return;

      playIncorrectSound();
      showFeedback(feedbackType, "error", copy.checkCouldNotStart);
    }
  }

  return (
    <article className="flex min-h-56 flex-col justify-between border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/30">
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
          copy={copy}
          step="1"
          title={copy.listenTitle}
          description={copy.listenDescription}
          feedback={getFeedback("listen")}
          headerAction={
            hasSlowMode ? (
              <SlowToggle copy={copy} enabled={slowListen} onChange={setSlowListen} />
            ) : null
          }
        >
          <ActionButton onClick={() => speak(pair.wordA, "listen", hasSlowMode && slowListen)}>
            {copy.listenA}
          </ActionButton>

          <ActionButton onClick={() => speak(pair.wordB, "listen", hasSlowMode && slowListen)}>
            {copy.listenB}
          </ActionButton>
        </TestGroup>

        <TestGroup
          copy={copy}
          step="2"
          title={copy.listeningTitle}
          description={copy.listeningDescription}
          actionsClassName="grid gap-3"
          feedback={getFeedback("listening")}
          headerAction={
            hasSlowMode ? (
              <SlowToggle copy={copy} enabled={slowQuiz} onChange={setSlowQuiz} />
            ) : null
          }
        >
          <ActionButton intent="primary" onClick={startQuiz}>
            {copy.playQuiz}
          </ActionButton>
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionButton onClick={() => answerQuiz("A")}>
              {copy.answerA}
            </ActionButton>
            <ActionButton onClick={() => answerQuiz("B")}>
              {copy.answerB}
            </ActionButton>
          </div>
        </TestGroup>

        <TestGroup
          copy={copy}
          step="3"
          title={copy.pronunciationTitle}
          description={
            pair.soundFocus === "R vs L"
              ? copy.pronunciationDescriptionRvsL
              : copy.pronunciationDescription
          }
          feedback={getFeedback("pronunciation")}
        >
          <MicButton
            active={listeningKey === "A"}
            disabled={listeningKey === "B"}
            label={copy.speakA}
            activeLabel={copy.listeningNow}
            onStart={() => startListening("A")}
            onFinish={() => finishListening("button tapped again")}
            onRelease={releaseHold}
            onPressChange={setHolding}
          />
          <MicButton
            active={listeningKey === "B"}
            disabled={listeningKey === "A"}
            label={copy.speakB}
            activeLabel={copy.listeningNow}
            onStart={() => startListening("B")}
            onFinish={() => finishListening("button tapped again")}
            onRelease={releaseHold}
            onPressChange={setHolding}
          />
          {listeningKey === "A" || listeningKey === "B" ? (
            <ListeningControls
              copy={copy}
              onFinish={() => finishListening("Stop & check button")}
              onCancel={cancelListening}
            />
          ) : (
            <p className="col-span-full text-xs leading-5 text-white/40">
              {copy.micHint}
            </p>
          )}
        </TestGroup>

        <TestGroup
          copy={copy}
          step="4"
          title={copy.tongueTwisterTitle}
          description={copy.tongueTwisterDescription}
          actionsClassName="grid gap-3"
          feedback={getFeedback("tongueTwister")}
          headerAction={
            hasSlowMode ? (
              <SlowToggle
                copy={copy}
                enabled={slowTongueTwister}
                onChange={setSlowTongueTwister}
              />
            ) : null
          }
        >
          <div className="border border-white/10 bg-black px-4 py-3">
            <p className="text-lg font-semibold leading-8 text-white">
              {tongueTwister.text}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/50">
              {text(tongueTwister.note)}
            </p>
          </div>
          <ActionButton
            onClick={() =>
              speak(tongueTwister.text, "tongueTwister", hasSlowMode && slowTongueTwister)
            }
          >
            {copy.listenTongueTwister}
          </ActionButton>
          <MicButton
            active={listeningKey === "sentence"}
            label={copy.recordTongueTwister}
            activeLabel={copy.listeningNow}
            onStart={() => startListening("sentence")}
            onFinish={() => finishListening("button tapped again")}
            onRelease={releaseHold}
            onPressChange={setHolding}
          />
          {listeningKey === "sentence" ? (
            <ListeningControls
              copy={copy}
              onFinish={() => finishListening("Stop & check button")}
              onCancel={cancelListening}
            />
          ) : (
            <p className="text-xs leading-5 text-white/40">{copy.micHint}</p>
          )}
        </TestGroup>
      </div>
    </article>
  );
}

function getTongueTwister(pair: MinimalPair) {
  if (pair.tongueTwister) {
    return pair.tongueTwister;
  }

  const { wordA, wordB } = pair;

  if (pair.soundFocus === "B vs V") {
    return {
      text: `${wordA} and ${wordB} move from closed lips to clear voice.`,
      note: {
        en: "Close the lips for B, then use the lower lip and voice for V.",
        ja: "Bは唇を閉じ、Vは下唇と声を使う意識で練習します。",
      },
    };
  }

  if (pair.soundFocus === "S vs SH") {
    return {
      text: `${wordA}, ${wordB}; say ${wordA}, then ${wordB} softly.`,
      note: {
        en: "Keep S narrow and sharp, then make SH wider and softer.",
        ja: "Sは細く鋭く、SHは少し広くやわらかく出します。",
      },
    };
  }

  if (pair.soundFocus === "Short I vs Long E") {
    return {
      text: `${wordA} and ${wordB} sit in a clean little line.`,
      note: {
        en: "Keep the short vowel relaxed, then make the long vowel clearer.",
        ja: "短い母音は力を抜き、長い母音はよりはっきり伸ばします。",
      },
    };
  }

  if (pair.soundFocus === "TH sounds") {
    return {
      text: `${wordA} then ${wordB}; keep the tongue light and clear.`,
      note: {
        en: "Let the tongue come forward lightly for TH before moving on.",
        ja: "THでは舌を軽く前に出してから、次の音へ移ります。",
      },
    };
  }

  if (pair.soundFocus === "Final consonants") {
    return {
      text: `${wordA}, ${wordB}; finish each word clean and short.`,
      note: {
        en: "Do not add an extra vowel after the final consonant.",
        ja: "語尾の子音の後に、余計な母音を足さないようにします。",
      },
    };
  }

  return {
    text: `${wordA}, ${wordB}, ${wordA} again, then ${wordB}.`,
    note: {
      en: "Practice both target sounds inside one short sentence.",
      ja: "学んだ2つの音を、ひとつの短い文の中で練習します。",
    },
  };
}

const meterWeights = [0.45, 0.75, 1, 0.75, 0.45];

function MicLevelMeter() {
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    const log = createSpeechLogger("meter");

    function setBars(level: number, time: number) {
      barRefs.current.forEach((bar, index) => {
        if (!bar) return;
        const wobble = 0.85 + 0.15 * Math.sin(time / 90 + index * 1.7);
        const scale = Math.min(1, 0.12 + level * meterWeights[index] * wobble);
        bar.style.transform = `scaleY(${scale})`;
      });
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const track = stream.getAudioTracks()[0];
        log("opened microphone", {
          device: track?.label,
          muted: track?.muted,
          settings: track?.getSettings(),
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        audioContext = createAudioContext();
        if (!audioContext) return;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        audioContext.createMediaStreamSource(stream).connect(analyser);

        const samples = new Uint8Array(analyser.fftSize);
        let smoothed = 0;
        let peak = 0;
        let lastReportAt = 0;

        const tick = (time: number) => {
          analyser.getByteTimeDomainData(samples);

          let sumSquares = 0;
          for (const sample of samples) {
            const normalized = (sample - 128) / 128;
            sumSquares += normalized * normalized;
          }

          const rms = Math.sqrt(sumSquares / samples.length);
          const level = Math.min(1, rms * 6);

          // fast attack, slow release so the bars feel natural
          smoothed =
            level > smoothed
              ? smoothed * 0.4 + level * 0.6
              : smoothed * 0.9 + level * 0.1;

          setBars(smoothed, time);

          peak = Math.max(peak, level);
          if (time - lastReportAt >= 1000) {
            log("input level peak (0-1)", Number(peak.toFixed(2)));
            peak = 0;
            lastReportAt = time;
          }
          frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
      } catch (error) {
        // Mic level unavailable; recognition still works without the animation.
        log("level meter unavailable", error);
      }
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      stream?.getTracks().forEach((track) => track.stop());
      void audioContext?.close();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="col-span-full flex h-10 items-center justify-center gap-1.5 border border-white/10 bg-white/[0.02]"
    >
      {meterWeights.map((_, index) => (
        <span
          key={index}
          ref={(element) => {
            barRefs.current[index] = element;
          }}
          className="h-6 w-1.5 origin-center bg-white"
          style={{ transform: "scaleY(0.12)" }}
        />
      ))}
    </div>
  );
}

// Tap to start and tap again to check, or hold while speaking and release.
function MicButton({
  active,
  disabled = false,
  label,
  activeLabel,
  onStart,
  onFinish,
  onRelease,
  onPressChange,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  activeLabel: string;
  onStart: () => void;
  onFinish: () => void;
  onRelease: () => void;
  onPressChange: (pressed: boolean) => void;
}) {
  const pressStartedAtRef = useRef<number | null>(null);
  const handledByPointerRef = useRef(false);

  function releasePress() {
    const startedAt = pressStartedAtRef.current;
    pressStartedAtRef.current = null;
    onPressChange(false);

    if (startedAt !== null && Date.now() - startedAt >= holdThresholdMs) {
      onRelease();
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        handledByPointerRef.current = true;

        if (active) {
          onFinish();
          return;
        }

        pressStartedAtRef.current = Date.now();
        onPressChange(true);
        event.currentTarget.setPointerCapture?.(event.pointerId);
        onStart();
      }}
      onPointerUp={releasePress}
      onPointerCancel={releasePress}
      onKeyDown={() => {
        handledByPointerRef.current = false;
      }}
      onClick={() => {
        // Pointer presses are handled above; this path is for the keyboard.
        if (handledByPointerRef.current) {
          handledByPointerRef.current = false;
          return;
        }

        if (active) {
          onFinish();
        } else {
          onStart();
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
      className={`flex h-11 touch-none select-none items-center justify-center gap-2 border px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/25 ${
        active
          ? "border-white bg-black text-white"
          : "border-white bg-white text-black hover:bg-black hover:text-white"
      }`}
    >
      {active ? (
        <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-rose-400" />
      ) : null}
      {active ? activeLabel : label}
    </button>
  );
}

function ListeningControls({
  copy,
  onFinish,
  onCancel,
}: {
  copy: TrainerCopy;
  onFinish: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="col-span-full grid gap-3">
      <MicLevelMeter />
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <ActionButton onClick={onFinish}>{`■ ${copy.stopAndCheck}`}</ActionButton>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 border border-white/20 px-4 text-sm font-semibold text-white transition hover:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span aria-hidden="true">✕ </span>
          {copy.cancelListening}
        </button>
      </div>
    </div>
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
  copy,
  headerAction,
  children,
}: {
  step: string;
  title: string;
  description: string;
  actionsClassName?: string;
  feedback: CardFeedback;
  copy: TrainerCopy;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 border-b border-white/10 py-5 sm:grid-cols-[3rem_1fr]">
      <div className="flex h-9 w-9 items-center justify-center border border-white/15 text-sm font-semibold text-white">
        {step}
      </div>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-sm leading-6 text-white/50">{description}</p>
          </div>
          {headerAction}
        </div>
        <div className={actionsClassName}>{children}</div>
        {feedback ? <FeedbackMessage feedback={feedback} /> : null}
      </div>
    </div>
  );
}

function SlowToggle({
  copy,
  enabled,
  onChange,
}: {
  copy: TrainerCopy;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={copy.slowModeLabel}
      onClick={() => onChange(!enabled)}
      className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
        enabled
          ? "border-white bg-white text-black"
          : "border-white/20 text-white/70 hover:border-white/50 hover:text-white"
      }`}
    >
      <span
        aria-hidden="true"
        className={`relative h-3.5 w-6 rounded-full transition ${enabled ? "bg-black" : "bg-white/20"}`}
      >
        <span
          className={`absolute top-0.5 size-2.5 rounded-full transition-all ${
            enabled ? "left-3 bg-white" : "left-0.5 bg-white/70"
          }`}
        />
      </span>
      {copy.slowMode}
    </button>
  );
}

function FeedbackMessage({
  feedback,
}: {
  feedback: NonNullable<CardFeedback>;
}) {
  const icon =
    feedback.tone === "success"
      ? "⭕️"
      : feedback.tone === "error"
        ? "❌"
        : null;
  const feedbackClassName =
    feedback.tone === "success"
      ? "border-white bg-white text-black"
      : feedback.tone === "error"
        ? "border-white/20 bg-white/[0.04] text-white"
        : "border-white/10 bg-white/[0.02] text-white/70";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`border px-3 py-2 text-sm font-medium ${feedbackClassName}`}
    >
      <div className="flex items-center gap-2">
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <span className="flex-1">{feedback.text}</span>
      </div>
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
  intent?: "primary" | "secondary";
  onClick: () => void;
}) {
  const buttonClassName =
    "h-11 border border-white bg-white px-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/25 disabled:hover:bg-white/10 disabled:hover:text-white/25";

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

function describeResults(event: BrowserSpeechRecognitionResultEvent) {
  const results = [];
  for (let index = 0; index < event.results.length; index += 1) {
    const result = event.results[index];
    const alternatives = [];
    for (let alt = 0; alt < result.length; alt += 1) {
      alternatives.push(result[alt]?.transcript);
    }
    results.push({ isFinal: result.isFinal, alternatives });
  }
  return results;
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
