"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { LevelMeter } from "@/components/pronunciation/LevelMeter";
import { PronunciationPanel } from "@/components/pronunciation/PronunciationPanel";
import {
  usePronunciationAssessment,
  type AssessmentOutcome,
} from "@/components/pronunciation/usePronunciationAssessment";
import type { LocalizedText } from "@/lib/i18n";
import { markPairCompleted, usePairCompleted } from "@/lib/pairCompletion";
import { gradeByLetter } from "@/lib/pronunciationGrades";
import type { MinimalPair } from "@/types/training";

import { getPublicAudioPath } from "./audio";
import { LockIcon } from "./LockIcon";
import {
  PairProgressTracker,
  type TrackerSection,
} from "./PairProgressTracker";
import {
  createAudioContext,
  playCorrectSound,
  playIncorrectSound,
  playTone,
} from "./feedbackSounds";
import type {
  BrowserSpeechRecognition,
  BrowserSpeechRecognitionResultEvent,
} from "./speechRecognitionTypes";
import {
  stopPronunciationCheckEvent,
  useSentenceCheck,
  type SentenceCheckResult,
} from "./useSentenceCheck";

type QuizTarget = "A" | "B";

type ActiveQuiz = {
  pairId: string;
  target: QuizTarget;
} | null;

type FeedbackType =
  | "listen"
  | "listening"
  | "pronunciation"
  | "tongueTwister"
  | "tongueTwisterPlayback";
// "pending": work in progress (e.g. the AI check), shown with animated dots.
type FeedbackTone = "neutral" | "pending" | "success" | "error";

type CardFeedback = {
  pairId: string;
  type: FeedbackType;
  tone: FeedbackTone;
  text: string;
  language: "en" | "ja";
} | null;

type CountdownState = {
  kind: "pronunciation" | "tongueTwister";
  phase: "prepare" | "answer";
  remaining: number;
} | null;

type TrainerCopy = typeof trainerCopy.en;

const prepareSeconds = 3;
const pronunciationAnswerSeconds = 3;
const tongueTwisterAnswerSeconds = 8;
const slowPlaybackRate = 0.75;
// AI score (0-100) needed to clear steps 3 and 4 on the per-pair page.
export const passingScore = 60;

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
    listenDescription: (wordA: string, wordB: string) =>
      `Start by listening to the difference between ${wordA} and ${wordB}`,
    listen: (word: string) => `Listen to ${word}`,
    listeningTitle: "Listening test",
    listeningDescription: "Play the audio and pick the correct option below.",
    playQuiz: "Play quiz",
    answer: (word: string) => `I hear ${word}`,
    pronunciationTitle: "Pronunciation test",
    pronunciationDescription: "Say the target word and let Atlas check it.",
    speak: (word: string) => `Say ${word}`,
    tongueTwisterTitle: "Tongue twister",
    tongueTwisterDescription:
      "Practice both sounds together inside one short sentence.",
    listenTongueTwister: "Listen to the sentence",
    saySentence: "Say the sentence",
    saySentencePrompt: "Say the whole sentence. Every word must be correct.",
    sentenceCorrect: "Perfect. You said the whole sentence correctly.",
    sentenceRetry: (heardText: string) =>
      `Not 100% yet. Heard: "${heardText}". Try again.`,
    speechPlaybackUnsupported:
      "Speech playback is not supported in this browser.",
    speedLabel: "Playback speed",
    speedNormal: "Normal",
    speedSlow: "Slow (0.75x)",
    playing: (word: string) => `Playing: ${word}`,
    whichWord: "Which word did you hear?",
    correct: "Correct.",
    listeningIncorrect: (word: string) =>
      `Not quite. The answer was "${word}".`,
    pronunciationUnsupported:
      "Pronunciation check is not supported in this browser. Try Chrome or Edge.",
    sayWord: (word: string) => `Say "${word}". Atlas will check what it hears.`,
    pronunciationCorrect: (heardText: string) =>
      `Correct. Heard: "${heardText}"`,
    pronunciationRetry: (heardText: string, word: string) =>
      `Try again. Heard: "${heardText}" / Target: "${word}"`,
    couldNotHear: "I could not hear it. Try again.",
    couldNotRecognize: (word: string) =>
      `I could not recognize "${word}". Try again.`,
    checkCouldNotStart: "Pronunciation check could not start. Try again.",
    getReady: "Get ready...",
    speakNow: "Speak now",
    secondsLeft: (seconds: number) => `${seconds}s`,
    sayAfterCountdown: (word: string) => `Say "${word}" after countdown ends.`,
    saySentenceAfterCountdown: "Say the whole sentence after countdown ends.",
    aiChecking: "Checking your pronunciation…",
    aiScore: (score: number, verdict: string) =>
      `Score ${score} · ${verdict}. See the details below.`,
    aiFailed: "Couldn't score that one. See below and try again.",
    micUnavailable: "The microphone isn't available. See below.",
    sayThis: "Say this",
    readThis: "Read this",
    locked: (step: number) => `Finish step ${step} to unlock this.`,
    cleared: "Cleared!",
    listenGoal: "Tap both buttons and listen to each word.",
    listeningGoal:
      "Get 2 right in a row, one for each word. A wrong answer starts over.",
    pronunciationGoal: `Get ${passingScore} points or more on both words.`,
    tongueTwisterGoal: `Get ${passingScore} points or more to unlock the next word pair.`,
    points: (points: number) => `${points} pts`,
    sentence: "Sentence",
  },
  ja: {
    firstTraining: "最初のトレーニング",
    guide: "まずは単語を聞いて、聞き取りか発音を試しましょう。",
    listenTitle: "音を確認",
    listenDescription: (wordA: string, wordB: string) =>
      `まずは${wordA}と${wordB}の違いを耳で確認します。`,
    listen: (word: string) => `${word}を聞く`,
    listeningTitle: "聞き取りテスト",
    listeningDescription: "音声を聞いて、下の正しい答えを選びましょう。",
    playQuiz: "クイズ再生",
    answer: (word: string) => `${word}だと思う`,
    pronunciationTitle: "発音テスト",
    pronunciationDescription:
      "ターゲットの単語を発音して、Atlasにチェックしてもらいましょう。",
    speak: (word: string) => `${word}を発音する`,

    tongueTwisterTitle: "Tongue Twister",
    tongueTwisterDescription:
      "学んだ2つの音を、ひとつの短い文の中で練習します。",
    listenTongueTwister: "文を聞く",
    saySentence: "文を発音する",
    saySentencePrompt:
      "文全体を発音してください。すべての単語が正しい必要があります。",
    sentenceCorrect: "完璧です。文全体を正しく発音できました。",
    sentenceRetry: (heardText: string) =>
      `まだ100%ではありません。聞こえた文: "${heardText}"。もう一度試してください。`,
    speechPlaybackUnsupported: "このブラウザでは音声再生に対応していません。",
    speedLabel: "再生速度",
    speedNormal: "通常",
    speedSlow: "ゆっくり (0.75倍)",
    playing: (word: string) => `再生中: ${word}`,
    whichWord: "どちらの単語に聞こえましたか？",
    correct: "正解です。",
    listeningIncorrect: (word: string) =>
      `惜しいです。正解は「${word}」でした。`,
    pronunciationUnsupported:
      "このブラウザでは発音チェックに対応していません。Chrome / Edgeで試してください。",
    sayWord: (word: string) =>
      `「${word}」を発音してください。Atlasが聞き取った内容を判定します。`,
    pronunciationCorrect: (heardText: string) =>
      `正解です。聞こえた単語: "${heardText}"`,
    pronunciationRetry: (heardText: string, word: string) =>
      `もう一度。聞こえた単語: "${heardText}" / 目標: "${word}"`,
    couldNotHear: "聞き取れませんでした。もう一度試してください。",
    couldNotRecognize: (word: string) =>
      `「${word}」として認識できませんでした。もう一度試してください。`,
    checkCouldNotStart:
      "発音チェックを開始できませんでした。もう一度試してください。",
    getReady: "準備してください...",
    speakNow: "今話してください",
    secondsLeft: (seconds: number) => `${seconds}秒`,
    sayAfterCountdown: (word: string) =>
      `カウントダウン後に「${word}」を発音してください。`,
    saySentenceAfterCountdown: "カウントダウン後に文全体を発音してください。",
    aiChecking: "発音をチェックしています…",
    aiScore: (score: number, verdict: string) =>
      `スコア ${score}・${verdict}。くわしくは下を見てね。`,
    aiFailed: "スコアを出せませんでした。下を見て、もう一度ためしてね。",
    micUnavailable: "マイクが使えません。下を見てください。",
    sayThis: "これを言おう",
    readThis: "これを読もう",
    locked: (step: number) => `ステップ${step}をクリアすると、ここがひらくよ。`,
    cleared: "クリア！",
    listenGoal: "2つのボタンを両方（りょうほう）おして、音を聞いてみよう。",
    listeningGoal:
      "2つの単語を1回ずつ、つづけて当てよう！まちがえると、さいしょからだよ。",
    pronunciationGoal: `どちらの単語も${passingScore}点いじょうをとろう！`,
    tongueTwisterGoal: `文を読んで${passingScore}点いじょうとると、次のペアにすすめるよ！`,
    points: (points: number) => `${points}点`,
    sentence: "文",
  },
};

function isTouchDevice() {
  return typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
}

/**
 * Section wrapper for one minimal pair training set (e.g. R vs L).
 * Renders the heading and one PairPracticeCard per word pair.
 */

export function MinimalPairTrainer({
  id,
  title,
  description,
  pairs,
}: MinimalPairTrainerProps) {
  const { language, text } = useLanguage();
  const copy = trainerCopy[language];

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
          <PairPracticeCard
            key={pair.id}
            copy={copy}
            language={language}
            pair={pair}
            text={text}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * A single PairPracticeCard on its own, used by the per-pair test page.
 */

export function SinglePairPractice({
  pair,
  section,
}: {
  pair: MinimalPair;
  section: TrackerSection;
}) {
  const { language, text } = useLanguage();

  return (
    <PairPracticeCard
      copy={trainerCopy[language]}
      language={language}
      pair={pair}
      section={section}
      text={text}
      useAiAssessment
    />
  );
}

/**
 * One word pair with four practice steps:
 *   1. Listen: hear each word (recorded MP3 if available, else speech
 *      synthesis).
 *   2. Listening test: hear a random word, pick A or B.
 *   3. Pronunciation test: say one word after a countdown; the first
 *      recognized word is compared to the target.
 *   4. Tongue twister: say a whole sentence after a countdown; judged by
 *      useSentenceCheck and must match 100%.
 *
 * With `useAiAssessment`, steps 3 and 4 record the learner during the
 * answer window instead and score the clip with the wav2vec2 server; the
 * steps are split into separate boxes and the full result shows in a
 * PronunciationPanel right under the step that ran the check.
 * See docs/pronunciation-assessment.md.
 *
 * With `useAiAssessment` the steps are also gated: each stays locked until
 * the one before it is cleared.
 *   1 is cleared by listening to both words.
 *   2 by answering correctly twice in a row, once for each word (a wrong
 *     answer resets the streak).
 *   3 by scoring `passingScore` or more on both words.
 *   4 by scoring `passingScore` or more on the sentence, which marks the
 *     pair completed (lib/pairCompletion.ts) and unlocks the "Next" pair
 *     link in LessonStepNav.
 * A completed pair opens with every step unlocked. Progress inside a pair
 * lives in component state; only completion is saved.
 *
 * With a `section`, a PairProgressTracker sidebar shows the steps, results
 * and the category's cleared pairs.
 *
 * Only one mic session runs at a time. Steps 3 and 4 share the countdown
 * state, and `isBusy` disables their buttons while either is active.
 */

function PairPracticeCard({
  copy,
  language,
  pair,
  section,
  text,
  useAiAssessment = false,
}: {
  copy: TrainerCopy;
  language: "en" | "ja";
  pair: MinimalPair;
  section?: TrackerSection;
  text: (value: LocalizedText) => string;
  useAiAssessment?: boolean;
}) {
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz>(null);
  const [aiCheckTarget, setAiCheckTarget] = useState<string | null>(null);
  const [cardFeedback, setCardFeedback] = useState<CardFeedback>(null);
  const speechRecognitionRunIdRef = useRef(0);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const stopRequestedRef = useRef(false);
  const [countdown, setCountdown] = useState<CountdownState>(null);
  const countdownRef = useRef<CountdownState>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Separate speed settings: words (steps 1-2) and the tongue twister (step 4).
  const [wordSlow, setWordSlow] = useState(false);
  const [twisterSlow, setTwisterSlow] = useState(false);
  const tongueTwister = getTongueTwister(pair);
  const assessment = usePronunciationAssessment({ enabled: useAiAssessment });
  const aiResultsRef = useRef<HTMLDivElement | null>(null);

  // Step locking (per-pair page only); see the comment above.
  const gated = useAiAssessment;
  const pairCompleted = usePairCompleted(gated ? pair.id : null);
  const [heardWords, setHeardWords] = useState<string[]>([]);
  const [correctStreak, setCorrectStreak] = useState<QuizTarget[]>([]);
  const [listeningPassed, setListeningPassed] = useState(false);
  const [bestWordScores, setBestWordScores] = useState<Record<string, number>>(
    {},
  );
  const [bestTwisterScore, setBestTwisterScore] = useState<number | null>(null);
  // Counts for the progress tracker's results.
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [pronunciationAttempts, setPronunciationAttempts] = useState(0);
  const [twisterAttempts, setTwisterAttempts] = useState(0);
  const listenCleared =
    pairCompleted ||
    (heardWords.includes(pair.wordA) && heardWords.includes(pair.wordB));
  const listeningCleared = pairCompleted || (listenCleared && listeningPassed);
  const pronunciationCleared =
    pairCompleted ||
    (listeningCleared &&
      [pair.wordA, pair.wordB].every(
        (word) => (bestWordScores[word] ?? 0) >= passingScore,
      ));

  // Bring a freshly loaded AI result into view.
  useEffect(() => {
    if (!assessment.result) return;

    aiResultsRef.current?.scrollIntoView({
      behavior: scrollBehavior(),
      block: "start",
    });
  }, [assessment.result]);

  function updateCountdown(next: CountdownState) {
    countdownRef.current = next;
    setCountdown(next);
  }

  function clearCountdown() {
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    updateCountdown(null);
  }

  // Runs the two-phase countdown shared by steps 3 and 4:
  //   "prepare" (get ready ticks) -> begin() starts the mic -> "answer"
  //   (speak window) -> endAnswer() asks the recognizer to stop and judge.
  // Any countdown already running is cancelled first.
  function startCountdown(
    kind: NonNullable<CountdownState>["kind"],
    answerSeconds: number,
    begin: () => void,
    endAnswer: () => void,
  ) {
    clearCountdown();

    let phase: "prepare" | "answer" = "prepare";
    let remaining = prepareSeconds;

    updateCountdown({ kind, phase, remaining });
    playCountdownTick();

    countdownTimerRef.current = window.setInterval(() => {
      remaining -= 1;

      if (remaining > 0) {
        updateCountdown({ kind, phase, remaining });

        if (phase === "prepare") {
          playCountdownTick();
        }

        return;
      }

      if (phase === "prepare") {
        phase = "answer";
        remaining = answerSeconds;
        updateCountdown({ kind, phase, remaining });
        playCountdownGo();
        begin();
        return;
      }

      clearCountdown();
      endAnswer();
    }, 1000);
  }

  useEffect(() => {
    function stopRecognition() {
      // Another check starting cancels a pending "get ready" countdown. The
      // card's own countdown is already in its answer phase when it dispatches.
      if (countdownRef.current?.phase === "prepare") {
        clearCountdown();
      }

      speechRecognitionRunIdRef.current += 1;
      speechRecognitionRef.current?.abort();
      speechRecognitionRef.current = null;
      setAiCheckTarget(null);
    }

    window.addEventListener(stopPronunciationCheckEvent, stopRecognition);

    return () => {
      window.removeEventListener(stopPronunciationCheckEvent, stopRecognition);
      clearCountdown();
      stopRecognition();
      audioRef.current?.pause();
      audioRef.current = null;
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Plays the recorded MP3 at `audioPath` when it exists, otherwise falls
  // back to browser speech synthesis.
  async function speak(
    textToSpeak: string,
    feedbackType: FeedbackType = "listen",
    audioPath?: string,
    showPlayingFeedback = true,
    slow = false,
  ) {
    // Stop any MP3 or speech that is already playing.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (audioPath) {
      const audio = new Audio(audioPath);
      let fellBack = false;

      const fallbackToTts = () => {
        if (fellBack) return;
        fellBack = true;

        if (audioRef.current === audio) {
          audioRef.current = null;
        }

        speakWithTts(textToSpeak, feedbackType, showPlayingFeedback, slow);
      };

      // MP3 files in the public folder are recorded at normal speed.
      audio.playbackRate = slow ? slowPlaybackRate : 1;
      audioRef.current = audio;

      audio.onended = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };
      audio.onerror = fallbackToTts;

      if (showPlayingFeedback) {
        showFeedback(feedbackType, "neutral", copy.playing(textToSpeak));
      }

      try {
        await audio.play();
      } catch {
        fallbackToTts();
      }

      return;
    }

    speakWithTts(textToSpeak, feedbackType, showPlayingFeedback, slow);
  }

  function speakWithTts(
    textToSpeak: string,
    feedbackType: FeedbackType,
    showPlayingFeedback = true,
    slow = false,
  ) {
    if (!("speechSynthesis" in window)) {
      playIncorrectSound();
      showFeedback(feedbackType, "error", copy.speechPlaybackUnsupported);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-US";
    utterance.rate = slow ? 0.85 * slowPlaybackRate : 0.85;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);

    if (showPlayingFeedback) {
      showFeedback(feedbackType, "neutral", copy.playing(textToSpeak));
    }
  }

  // Tongue twister "say the sentence" check. Kept separate from the
  // single-word pronunciation test above (see useSentenceCheck.ts).
  function handleSentenceResult(result: SentenceCheckResult) {
    switch (result.status) {
      case "listening":
        showFeedback("tongueTwister", "neutral", copy.saySentencePrompt);
        return;
      case "correct":
        playCorrectSound();
        showFeedback("tongueTwister", "success", copy.sentenceCorrect);
        return;
      case "incorrect":
        playIncorrectSound();
        showFeedback(
          "tongueTwister",
          "error",
          copy.sentenceRetry(result.heardText),
        );
        return;
      case "unsupported":
        playIncorrectSound();
        showFeedback("tongueTwister", "error", copy.pronunciationUnsupported);
        return;
      case "failedToStart":
        playIncorrectSound();
        showFeedback("tongueTwister", "error", copy.checkCouldNotStart);
        return;
      case "nothingHeard":
        playIncorrectSound();
        showFeedback("tongueTwister", "error", copy.couldNotHear);
        return;
    }
  }

  const sentenceCheck = useSentenceCheck(handleSentenceResult);

  const isChecking = useAiAssessment
    ? assessment.recorder.status !== "idle"
    : countdown?.kind === "tongueTwister"
      ? sentenceCheck.isListening
      : Boolean(aiCheckTarget);

  // The answer countdown ends as soon as the recognizer finishes or fails.
  useEffect(() => {
    if (countdown?.phase === "answer" && !isChecking) {
      clearCountdown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, isChecking]);

  function startQuiz() {
    const target: QuizTarget = Math.random() > 0.5 ? "A" : "B";
    const word = target === "A" ? pair.wordA : pair.wordB;

    setActiveQuiz({ pairId: pair.id, target });
    showFeedback("listening", "neutral", copy.whichWord);
    void speak(
      word,
      "listening",
      getPublicAudioPath("words", pair.soundFocus, word),
      false,
      wordSlow,
    );
  }

  // The "I hear …" buttons stay disabled until "Play quiz" sets a quiz for
  // this pair, and again after each answer.
  const quizReady = activeQuiz?.pairId === pair.id;

  function answerQuiz(answer: QuizTarget) {
    if (!activeQuiz || !quizReady) return;

    setQuizAnswered(true);

    if (answer === activeQuiz.target) {
      playCorrectSound();
      showFeedback("listening", "success", copy.correct);

      const streak = correctStreak.includes(activeQuiz.target)
        ? correctStreak
        : [...correctStreak, activeQuiz.target];

      setCorrectStreak(streak);
      if (streak.length === 2) {
        setListeningPassed(true);
      }
    } else {
      playIncorrectSound();
      setCorrectStreak([]);
      const correctWord = activeQuiz.target === "A" ? pair.wordA : pair.wordB;
      showFeedback("listening", "error", copy.listeningIncorrect(correctWord));
    }

    setActiveQuiz(null);
  }

  const isBusy =
    countdown !== null ||
    sentenceCheck.isListening ||
    Boolean(aiCheckTarget) ||
    (useAiAssessment && assessment.isBusy);

  // AI mode for steps 3 and 4: ask for the mic on the tap, record during the
  // answer window, then send the clip when the countdown ends.
  function startAiAssessment(
    kind: "pronunciation" | "tongueTwister",
    target: string,
  ) {
    window.speechSynthesis?.cancel();
    window.dispatchEvent(new Event(stopPronunciationCheckEvent));
    showFeedback(
      kind,
      "neutral",
      kind === "pronunciation"
        ? copy.sayAfterCountdown(target)
        : copy.saySentenceAfterCountdown,
    );

    void assessment.prepare(target).then((ready) => {
      if (ready) return;

      clearCountdown();
      playIncorrectSound();
      showFeedback(kind, "error", copy.micUnavailable);
    });

    startCountdown(
      kind,
      kind === "pronunciation"
        ? pronunciationAnswerSeconds
        : tongueTwisterAnswerSeconds,
      () => assessment.startRecording(),
      () => {
        showFeedback(kind, "pending", copy.aiChecking);
        assessment.finish((outcome) => handleAiOutcome(kind, target, outcome));
      },
    );
  }

  function handleAiOutcome(
    kind: "pronunciation" | "tongueTwister",
    target: string,
    outcome: AssessmentOutcome,
  ) {
    if (outcome.kind === "failed") {
      playIncorrectSound();
      showFeedback(kind, "error", copy.aiFailed);
      return;
    }

    const { score, grade } = outcome.result;

    if (kind === "pronunciation") {
      setPronunciationAttempts((count) => count + 1);
      setBestWordScores((scores) => ({
        ...scores,
        [target]: Math.max(scores[target] ?? 0, score),
      }));
    } else {
      setTwisterAttempts((count) => count + 1);
      setBestTwisterScore((best) => Math.max(best ?? 0, score));

      if (score >= passingScore) {
        markPairCompleted(pair.id);
      }
    }

    const passed = grade.letter === "A" || grade.letter === "B";
    const verdict =
      gradeByLetter(grade.letter)?.verdict[language] ?? grade.verdict;

    if (passed) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
    showFeedback(
      kind,
      passed ? "success" : "error",
      copy.aiScore(score, verdict),
    );
  }

  function startPronunciationTest(target: QuizTarget) {
    if (useAiAssessment) {
      startAiAssessment(
        "pronunciation",
        target === "A" ? pair.wordA : pair.wordB,
      );
      return;
    }

    window.speechSynthesis?.cancel();
    showFeedback(
      "pronunciation",
      "neutral",
      copy.sayAfterCountdown(target === "A" ? pair.wordA : pair.wordB),
    );
    startCountdown(
      "pronunciation",
      pronunciationAnswerSeconds,
      () => startAiPronunciationCheck(target),
      () => {
        stopRequestedRef.current = true;
        speechRecognitionRef.current?.stop();
      },
    );
  }

  // Single-word recognition for step 3. Listens continuously during the
  // answer window, restarting if the browser ends the session early, and
  // judges only the first recognized word when the countdown calls stop().
  // Note: this duplicates the recognizer loop in useSentenceCheck.ts; the
  // difference is first-word-only matching instead of whole-sentence matching.
  function startAiPronunciationCheck(target: QuizTarget) {
    const word = target === "A" ? pair.wordA : pair.wordB;
    const SpeechRecognitionConstructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      playIncorrectSound();
      showFeedback("pronunciation", "error", copy.pronunciationUnsupported);
      return;
    }

    window.dispatchEvent(new Event(stopPronunciationCheckEvent));

    const recognition = new SpeechRecognitionConstructor();
    const recognitionRunId = speechRecognitionRunIdRef.current + 1;

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    speechRecognitionRunIdRef.current = recognitionRunId;
    speechRecognitionRef.current = recognition;
    stopRequestedRef.current = false;
    setAiCheckTarget(word);
    showFeedback("pronunciation", "neutral", copy.sayWord(word));

    function getFirstRecognizedWord(transcript: string) {
      const normalized = normalizeRecognizedText(transcript);

      return normalized.split(" ")[0] ?? "";
    }

    let finished = false;
    // Transcripts from earlier recognizer sessions, plus the current one.
    let collected: string[] = [];
    let sessionTranscripts: string[] = [];

    function evaluate() {
      if (speechRecognitionRunIdRef.current !== recognitionRunId || finished) {
        return;
      }

      finished = true;
      setAiCheckTarget(null);
      speechRecognitionRef.current = null;

      // Speech recognition may return something like:
      // "Road Hello. Hello, hello."
      // Only use the first recognized word.
      const heardWord = getFirstRecognizedWord(
        [...collected, ...sessionTranscripts].join(" "),
      );

      if (!heardWord) {
        playIncorrectSound();
        showFeedback("pronunciation", "error", copy.couldNotHear);
        return;
      }

      if (transcriptMatchesWord(heardWord, word)) {
        playCorrectSound();
        showFeedback(
          "pronunciation",
          "success",
          copy.pronunciationCorrect(heardWord),
        );
      } else {
        playIncorrectSound();
        showFeedback(
          "pronunciation",
          "error",
          copy.pronunciationRetry(heardWord, word),
        );
      }
    }

    // Results only accumulate; the answer is judged when the countdown ends.
    recognition.onresult = (event) => {
      if (speechRecognitionRunIdRef.current !== recognitionRunId) {
        return;
      }

      const transcripts: string[] = [];

      for (let index = 0; index < event.results.length; index += 1) {
        const transcript = event.results[index]?.[0]?.transcript.trim();

        if (transcript) {
          transcripts.push(transcript);
        }
      }

      sessionTranscripts = transcripts;
    };

    recognition.onerror = (event) => {
      // Silence or a dropped session is not the end; onend restarts listening.
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }

      evaluate();
    };

    recognition.onnomatch = () => {
      // Keep listening; the countdown decides when the answer is judged.
    };

    recognition.onend = () => {
      if (speechRecognitionRunIdRef.current !== recognitionRunId || finished) {
        return;
      }

      if (stopRequestedRef.current) {
        evaluate();
        return;
      }

      // The browser ended the session early (e.g. the user paused). Keep
      // listening until the countdown asks us to stop.
      collected = [...collected, ...sessionTranscripts];
      sessionTranscripts = [];

      try {
        recognition.start();
      } catch {
        evaluate();
      }
    };

    try {
      recognition.start();
    } catch {
      if (speechRecognitionRunIdRef.current !== recognitionRunId) {
        return;
      }

      playIncorrectSound();
      showFeedback("pronunciation", "error", copy.checkCouldNotStart);
      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    }
  }

  const playbackFeedback = getFeedback("tongueTwisterPlayback");
  const answerFeedback = getFeedback("tongueTwister");

  // With the AI check, each step sits in its own box and the AI result
  // appears right under the step that ran it.
  const separate = useAiAssessment;
  // The AI recording's own mic stream drives the step's level meter.
  const aiRecordingStream = useAiAssessment ? assessment.recorder.stream : null;
  // While an AI check counts down or records, everything except that step
  // is dimmed and the text to read is highlighted.
  const focusKind: "pronunciation" | "tongueTwister" | null =
    useAiAssessment && countdown
      ? countdown.kind
      : useAiAssessment && assessment.recorder.status !== "idle"
        ? assessment.target === tongueTwister.text
          ? "tongueTwister"
          : "pronunciation"
        : null;
  const dimmedUnless = (kind: "pronunciation" | "tongueTwister" | "none") =>
    focusKind !== null && focusKind !== kind;
  const focusTargetRef = useRef<HTMLDivElement | null>(null);

  // Each attempt (tap or Try again) starts from no focus, so this runs once
  // per attempt, after the "Say this" card or highlighted sentence renders.
  useEffect(() => {
    if (!focusKind) return;

    focusTargetRef.current?.scrollIntoView({
      behavior: scrollBehavior(),
      block: "center",
    });
  }, [focusKind]);
  const resultsKind =
    assessment.target === null
      ? null
      : assessment.target === tongueTwister.text
        ? "tongueTwister"
        : "pronunciation";

  const pairHeader = (
    <div className="space-y-5">
      <p className="text-xs uppercase tracking-[0.24em] text-white/35">
        {pair.soundFocus}
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <WordLabel word={pair.wordA} />
        <span className="text-sm text-white/30">vs</span>
        <WordLabel word={pair.wordB} />
      </div>
    </div>
  );

  const wordSpeedToggle = (
    <SpeedToggle
      copy={copy}
      slow={wordSlow}
      onToggle={() => setWordSlow((value) => !value)}
    />
  );

  const twisterSpeedToggle = (
    <SpeedToggle
      copy={copy}
      slow={twisterSlow}
      onToggle={() => setTwisterSlow((value) => !value)}
    />
  );

  // As its own box, step 1 has the word speed toggle as its top row
  // (like step 4 with the sentence speed).
  const listenStep = (
    <TestGroup
      step="1"
      anchorId={`step-1`}
      title={copy.listenTitle}
      description={copy.listenDescription(pair.wordA, pair.wordB)}
      actionsClassName={separate ? "grid gap-3 sm:grid-cols-2" : undefined}
      feedback={getFeedback("listen")}
      separate={separate}
      dimmed={dimmedUnless("none")}
      header={separate ? wordSpeedToggle : undefined}
      goal={
        gated ? (
          <StepGoal
            copy={copy}
            text={copy.listenGoal}
            cleared={listenCleared}
            items={[pair.wordA, pair.wordB].map((word) => ({
              label: word,
              done: listenCleared || heardWords.includes(word),
            }))}
          />
        ) : undefined
      }
    >
      {[pair.wordA, pair.wordB].map((word) => (
        <ActionButton
          key={word}
          onClick={() => {
            setHeardWords((words) =>
              words.includes(word) ? words : [...words, word],
            );
            void speak(
              word,
              "listen",
              getPublicAudioPath("words", pair.soundFocus, word),
              true,
              wordSlow,
            );
          }}
        >
          {copy.listen(word)}
        </ActionButton>
      ))}
    </TestGroup>
  );

  const listeningStep = (
    <TestGroup
      step="2"
      anchorId={`step-2`}
      title={copy.listeningTitle}
      description={copy.listeningDescription}
      actionsClassName="grid gap-3"
      feedback={getFeedback("listening")}
      separate={separate}
      dimmed={dimmedUnless("none")}
      locked={gated && !listenCleared ? copy.locked(1) : undefined}
      goal={
        gated ? (
          <StepGoal
            copy={copy}
            text={copy.listeningGoal}
            cleared={listeningCleared}
            items={(["A", "B"] as const).map((target) => ({
              label: target === "A" ? pair.wordA : pair.wordB,
              done: listeningCleared || correctStreak.includes(target),
            }))}
          />
        ) : undefined
      }
    >
      <ActionButton intent="primary" onClick={startQuiz}>
        {copy.playQuiz}
      </ActionButton>
      <div className="grid gap-3 sm:grid-cols-2">
        <ActionButton disabled={!quizReady} onClick={() => answerQuiz("A")}>
          {copy.answer(pair.wordA)}
        </ActionButton>
        <ActionButton disabled={!quizReady} onClick={() => answerQuiz("B")}>
          {copy.answer(pair.wordB)}
        </ActionButton>
      </div>
    </TestGroup>
  );

  const pronunciationStep = (
    <TestGroup
      step="3"
      anchorId={`step-3`}
      title={copy.pronunciationTitle}
      description={copy.pronunciationDescription}
      actionsClassName={separate ? "grid gap-3 sm:grid-cols-2" : undefined}
      feedback={getFeedback("pronunciation")}
      separate={separate}
      dimmed={dimmedUnless("pronunciation")}
      locked={gated && !listeningCleared ? copy.locked(2) : undefined}
      goal={
        gated ? (
          <StepGoal
            copy={copy}
            text={copy.pronunciationGoal}
            cleared={pronunciationCleared}
            items={[pair.wordA, pair.wordB].map((word) => {
              const best = bestWordScores[word];

              return {
                label:
                  best === undefined ? word : `${word} · ${copy.points(best)}`,
                done: pronunciationCleared || (best ?? 0) >= passingScore,
              };
            })}
          />
        ) : undefined
      }
    >
      <ActionButton
        intent="primary"
        disabled={isBusy}
        onClick={() => startPronunciationTest("A")}
      >
        {copy.speak(pair.wordA)}
      </ActionButton>
      <ActionButton
        intent="primary"
        disabled={isBusy}
        onClick={() => startPronunciationTest("B")}
      >
        {copy.speak(pair.wordB)}
      </ActionButton>
      {focusKind === "pronunciation" && assessment.target ? (
        <div
          ref={focusTargetRef}
          className="col-span-full border border-white bg-white/[0.06] px-4 py-5 text-center"
        >
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-white motion-safe:animate-pulse"
            />
            {copy.sayThis}
          </p>
          <p className="mt-2 text-5xl font-semibold text-white md:text-6xl">
            {assessment.target}
          </p>
        </div>
      ) : null}
      <CountdownDisplay
        copy={copy}
        countdown={countdown}
        kind="pronunciation"
      />
      {aiRecordingStream && countdown?.kind === "pronunciation" ? (
        <LevelMeter stream={aiRecordingStream} className="col-span-full" />
      ) : null}
      {aiCheckTarget && !isTouchDevice() ? <MicLevelMeter /> : null}
    </TestGroup>
  );

  const tongueTwisterStep = (
    <TestGroup
      step="4"
      anchorId={`step-4`}
      title={copy.tongueTwisterTitle}
      description={copy.tongueTwisterDescription}
      actionsClassName="grid gap-3"
      feedback={null}
      separate={separate}
      dimmed={dimmedUnless("tongueTwister")}
      header={separate ? twisterSpeedToggle : undefined}
      locked={gated && !pronunciationCleared ? copy.locked(3) : undefined}
      goal={
        gated ? (
          <StepGoal
            copy={copy}
            text={copy.tongueTwisterGoal}
            cleared={pairCompleted}
            items={[
              {
                label:
                  bestTwisterScore === null
                    ? copy.sentence
                    : `${copy.sentence} · ${copy.points(bestTwisterScore)}`,
                done: pairCompleted,
              },
            ]}
          />
        ) : undefined
      }
    >
      <div
        ref={focusKind === "tongueTwister" ? focusTargetRef : undefined}
        className={`border px-4 transition-colors ${
          focusKind === "tongueTwister"
            ? "border-white bg-white/[0.06] py-5 text-center"
            : "border-white/10 bg-black py-3"
        }`}
      >
        {focusKind === "tongueTwister" ? (
          <p className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-white motion-safe:animate-pulse"
            />
            {copy.readThis}
          </p>
        ) : null}
        <p
          className={`font-semibold text-white ${
            focusKind === "tongueTwister"
              ? "text-3xl leading-tight md:text-4xl"
              : "text-lg leading-8"
          }`}
        >
          {tongueTwister.text}
        </p>
        {/* Hidden while the learner reads it out, so the sentence has room. */}
        {focusKind === "tongueTwister" ? null : (
          <p className="mt-2 text-sm leading-6 text-white/50">
            {text(tongueTwister.note)}
          </p>
        )}
      </div>
      <ActionButton
        disabled={isBusy}
        onClick={() =>
          void speak(
            tongueTwister.text,
            "tongueTwisterPlayback",
            getPublicAudioPath("twisters", pair.soundFocus, pair.id),
            true,
            twisterSlow,
          )
        }
      >
        {copy.listenTongueTwister}
      </ActionButton>
      {playbackFeedback ? (
        <FeedbackMessage feedback={playbackFeedback} />
      ) : null}
      <ActionButton
        intent="primary"
        disabled={isBusy}
        onClick={() => {
          if (useAiAssessment) {
            startAiAssessment("tongueTwister", tongueTwister.text);
            return;
          }

          window.speechSynthesis?.cancel();
          showFeedback(
            "tongueTwister",
            "neutral",
            copy.saySentenceAfterCountdown,
          );
          startCountdown(
            "tongueTwister",
            tongueTwisterAnswerSeconds,
            () => sentenceCheck.start(tongueTwister.text),
            () => sentenceCheck.finishListening(),
          );
        }}
      >
        {copy.saySentence}
      </ActionButton>
      <CountdownDisplay
        copy={copy}
        countdown={countdown}
        kind="tongueTwister"
      />
      {aiRecordingStream && countdown?.kind === "tongueTwister" ? (
        <LevelMeter stream={aiRecordingStream} />
      ) : null}
      {sentenceCheck.isListening && !isTouchDevice() ? <MicLevelMeter /> : null}
      {answerFeedback ? <FeedbackMessage feedback={answerFeedback} /> : null}
    </TestGroup>
  );

  if (!useAiAssessment) {
    return (
      <article className="flex min-h-56 flex-col justify-between border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/30">
        {pairHeader}

        <div className="mt-8 space-y-1 border-t border-white/10 pt-5">
          {wordSpeedToggle}
          {listenStep}
          {listeningStep}
          {pronunciationStep}
          {twisterSpeedToggle}
          {tongueTwisterStep}
        </div>
      </article>
    );
  }

  const resultsPanel = (
    <div
      ref={aiResultsRef}
      className={`scroll-mt-28 ${focusDimClassName(focusKind !== null)}`}
    >
      <PronunciationPanel
        assessment={assessment}
        tryAgainDisabled={isBusy}
        onTryAgain={() => {
          const target = assessment.target;
          if (!target) return;

          const kind =
            target === tongueTwister.text ? "tongueTwister" : "pronunciation";

          startAiAssessment(kind, target);
        }}
      />
    </div>
  );

  const steps = (
    <div className="min-w-0 space-y-4">
      <section
        className={`border border-white/10 bg-white/[0.02] p-5 ${focusDimClassName(
          dimmedUnless("none"),
        )}`}
      >
        {pairHeader}
      </section>
      {listenStep}
      {listeningStep}
      {pronunciationStep}
      {resultsKind === "pronunciation" ? resultsPanel : null}
      {tongueTwisterStep}
      {resultsKind === "tongueTwister" ? resultsPanel : null}
    </div>
  );

  if (!section) {
    return steps;
  }

  const trackerProps = {
    pairId: pair.id,
    section,
    steps: [
      {
        anchorId: "step-1",
        title: copy.listenTitle,
        done: listenCleared,
        unlocked: true,
      },
      {
        anchorId: "step-2",
        title: copy.listeningTitle,
        done: listeningCleared,
        unlocked: listenCleared,
      },
      {
        anchorId: "step-3",
        title: copy.pronunciationTitle,
        done: pronunciationCleared,
        unlocked: listeningCleared,
      },
      {
        anchorId: "step-4",
        title: copy.tongueTwisterTitle,
        done: pairCompleted,
        unlocked: pronunciationCleared,
      },
    ],
    results: {
      // Same streak as the step's goal: one correct answer per word.
      listening: {
        correct: listeningCleared ? 2 : correctStreak.length,
        needed: 2,
        answered: quizAnswered,
      },
      wordScores: [pair.wordA, pair.wordB].map((word) => ({
        word,
        best: bestWordScores[word],
      })),
      pronunciationAttempts,
      twisterBest: bestTwisterScore,
      twisterAttempts,
    },
  };
  const trackerClassName = `min-[1700px]:sticky min-[1700px]:top-28 min-[1700px]:max-h-[calc(100vh-8rem)] min-[1700px]:overflow-y-auto ${focusDimClassName(
    dimmedUnless("none"),
  )}`;

  // When the window is wide enough, the tracker sits in the empty margins
  // beside the page column: this pair's steps and results on the left, the
  // category's cleared pairs on the right. Each stays in view while
  // scrolling (the absolute box spans the steps' height so the sticky aside
  // can travel). Otherwise this pair's progress sits above the steps and
  // the cleared pairs follow them. Flex gap (not space-y) so the absolute
  // trackers don't push the steps down on wide windows.
  return (
    <div className="relative flex flex-col gap-4">
      <div className="min-[1700px]:absolute min-[1700px]:inset-y-0 min-[1700px]:right-[calc(100%+2rem)] min-[1700px]:w-64">
        <PairProgressTracker
          {...trackerProps}
          part="pair"
          className={trackerClassName}
        />
      </div>
      {steps}
      <div className="min-[1700px]:absolute min-[1700px]:inset-y-0 min-[1700px]:left-[calc(100%+2rem)] min-[1700px]:w-64">
        <PairProgressTracker
          {...trackerProps}
          part="category"
          className={trackerClassName}
        />
      </div>
    </div>
  );
}

// Faded and not clickable while another step's check runs (so a stray tap
// can't play audio into the recording).
function focusDimClassName(dimmed: boolean) {
  return `transition-opacity duration-300 ${
    dimmed ? "pointer-events-none opacity-30" : ""
  }`;
}

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
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

// Shows the big "get ready" number, then a "speak now" timer bar.
// Renders only for the step whose countdown is active (`kind`).
function CountdownDisplay({
  copy,
  countdown,
  kind,
}: {
  copy: TrainerCopy;
  countdown: CountdownState;
  kind: NonNullable<CountdownState>["kind"];
}) {
  if (!countdown || countdown.kind !== kind) {
    return null;
  }

  const isPrepare = countdown.phase === "prepare";
  const totalSeconds = isPrepare
    ? prepareSeconds
    : kind === "tongueTwister"
      ? tongueTwisterAnswerSeconds
      : pronunciationAnswerSeconds;

  if (isPrepare) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="col-span-full flex flex-col items-center justify-center gap-2 border border-white/10 bg-black px-4 py-5"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          {copy.getReady}
        </p>
        <p className="text-5xl font-bold leading-none tabular-nums text-white">
          {countdown.remaining}
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-full space-y-2">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-between text-sm"
      >
        <span className="text-white/70">{copy.speakNow}</span>
        <span className="font-semibold tabular-nums text-white">
          {copy.secondsLeft(countdown.remaining)}
        </span>
      </div>
      <CountdownBar key={countdown.phase} seconds={totalSeconds} highlight />
    </div>
  );
}

// Drains from full to empty over `seconds`; remount (via key) to restart.
function CountdownBar({
  seconds,
  highlight,
}: {
  seconds: number;
  highlight: boolean;
}) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setStarted(true));

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="h-1.5 w-full overflow-hidden border border-white/10"
    >
      <div
        className={`h-full ${highlight ? "bg-white" : "bg-white/40"}`}
        style={{
          width: started ? "0%" : "100%",
          transition: `width ${seconds}s linear`,
        }}
      />
    </div>
  );
}

const meterWeights = [0.45, 0.75, 1, 0.75, 0.45];

/**
 * Animated 5-bar mic level indicator shown while recording.
 * Opens its own getUserMedia stream and reads volume (RMS) through an
 * AnalyserNode, updating bar heights directly via refs to avoid re-renders.
 * Purely visual: if mic access fails, recognition still works.
 * Hidden on touch devices, where a second mic stream can conflict with speech recognition.
 */
function MicLevelMeter() {
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;

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
          frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
      } catch {
        // Mic level unavailable; recognition still works without the animation.
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

function SpeedToggle({
  copy,
  slow,
  onToggle,
}: {
  copy: TrainerCopy;
  slow: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-white/50">
      <span>{copy.speedLabel}</span>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-white">
          {slow ? copy.speedSlow : copy.speedNormal}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={slow}
          aria-label={copy.speedLabel}
          onClick={onToggle}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            slow ? "bg-[#3498db]" : "bg-white/20"
          }`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-[#ecf0f1] transition-transform ${
              slow ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function WordLabel({ word }: { word: string }) {
  return (
    <p className="text-3xl font-semibold text-white md:text-4xl">{word}</p>
  );
}

function TestGroup({
  step,
  anchorId,
  title,
  description,
  actionsClassName = "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
  feedback,
  separate = false,
  header,
  dimmed = false,
  locked,
  goal,
  children,
}: {
  step: string;
  /** Element ID the progress tracker links to; separate boxes only. */
  anchorId?: string;
  title: string;
  description: string;
  actionsClassName?: string;
  feedback: CardFeedback;
  /** Render as its own box instead of a row inside the pair card. */
  separate?: boolean;
  /** Full-width row above the step (e.g. a speed toggle); separate boxes only. */
  header?: ReactNode;
  /** Fade out while another step's check is running; separate boxes only. */
  dimmed?: boolean;
  /** Hint shown while the step is locked; its actions can't be used. */
  locked?: string;
  /** What clears the step, under the description (hidden while locked). */
  goal?: ReactNode;
  children: ReactNode;
}) {
  const actions = <div className={actionsClassName}>{children}</div>;

  const content = (
    <div className="grid gap-4 sm:grid-cols-[3rem_1fr]">
      <div className="flex h-9 w-9 items-center justify-center border border-white/15 text-sm font-semibold text-white">
        {locked ? <LockIcon /> : step}
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-sm leading-6 text-white/50">{description}</p>
        </div>
        {locked ? (
          <p className="flex items-center gap-2 border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/70">
            <LockIcon />
            <span>{locked}</span>
          </p>
        ) : (
          goal
        )}
        {locked ? (
          <div inert className="opacity-30">
            {actions}
          </div>
        ) : (
          actions
        )}
        {feedback && !locked ? <FeedbackMessage feedback={feedback} /> : null}
      </div>
    </div>
  );

  if (!separate) {
    return <div className="border-b border-white/10 py-5">{content}</div>;
  }

  return (
    <div
      id={anchorId}
      className={`scroll-mt-28 border border-white/10 bg-white/[0.02] p-5 ${focusDimClassName(dimmed)}`}
    >
      {header ? (
        <div
          inert={Boolean(locked)}
          className={`mb-5 border-b border-white/10 pb-4 ${
            locked ? "opacity-30" : ""
          }`}
        >
          {header}
        </div>
      ) : null}
      {content}
    </div>
  );
}

// The goal sentence for a gated step, with a chip per thing left to do.
function StepGoal({
  copy,
  text,
  cleared,
  items,
}: {
  copy: TrainerCopy;
  text: string;
  cleared: boolean;
  items: { label: string; done: boolean }[];
}) {
  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-white/70">
        {cleared ? (
          <span className="border border-white bg-white px-2 py-0.5 text-xs font-semibold text-black">
            {copy.cleared}
          </span>
        ) : null}
        <span>{text}</span>
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item.label}
            className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${
              item.done
                ? "border-white bg-white text-black"
                : "border-white/15 text-white/50"
            }`}
          >
            <span aria-hidden="true">{item.done ? "✓" : "○"}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
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
    <p
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 border px-3 py-2 text-sm font-medium ${feedbackClassName}`}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {feedback.tone === "pending" ? <PendingDots /> : null}
      <span>{feedback.text}</span>
    </p>
  );
}

// Three bouncing dots for "still working" messages.
function PendingDots() {
  return (
    <span aria-hidden="true" className="flex items-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
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

function getSpeechRecognitionTranscripts(
  event: BrowserSpeechRecognitionResultEvent,
) {
  const transcripts: string[] = [];

  for (
    let resultIndex = 0;
    resultIndex < event.results.length;
    resultIndex += 1
  ) {
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

  return normalizedTranscript === normalizedTarget;
}

function normalizeRecognizedText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let countdownAudioContext: AudioContext | null = null;

// Shared context so the per-second ticks don't open a new one each time.
function getCountdownAudioContext() {
  if (!countdownAudioContext || countdownAudioContext.state === "closed") {
    countdownAudioContext = createAudioContext();
  }

  if (countdownAudioContext?.state === "suspended") {
    void countdownAudioContext.resume();
  }

  return countdownAudioContext;
}

// Short, soft tick for each "get ready" second.
function playCountdownTick() {
  const audioContext = getCountdownAudioContext();

  if (audioContext) {
    playTone(audioContext, 660, 0, 0.09, "sine");
  }
}

// Higher, slightly longer beep when it's time to speak.
function playCountdownGo() {
  const audioContext = getCountdownAudioContext();

  if (audioContext) {
    playTone(audioContext, 1320, 0, 0.2, "sine");
  }
}
