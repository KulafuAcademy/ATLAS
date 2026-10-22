"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { getLessonHref } from "@/data/trainingSections";
import type { LocalizedText } from "@/lib/i18n";
import { getTongueTwister } from "@/lib/training";
import type { MinimalPair } from "@/types/training";

import { MicLevelMeter } from "./MicLevelMeter";
import {
  checkPronunciationServer,
  useServerPronunciationCheck,
  type PronunciationResult,
  type ServerCheckOutcome,
} from "./pronunciationServer";
import {
  getPublicAudioPath,
  playCorrectSound,
  playCountdownGo,
  playCountdownTick,
  playIncorrectSound,
  playPracticeAudio,
  stopPracticeAudio,
} from "./trainingAudio";

type ScoredResult = Extract<PronunciationResult, { ok: true }>;
type CheckKind = "word" | "twister";
type QuizTarget = "A" | "B";
type ServerStatus = "checking" | "online" | "offline";

type Attempt = {
  id: number;
  kind: CheckKind;
  target: string;
  passed: boolean;
  result: ScoredResult;
};

type Countdown = {
  kind: CheckKind;
  target: string;
  phase: "prepare" | "answer";
  remaining: number;
} | null;

type LessonCopy = typeof lessonCopy.en;

// Messages are stored as functions of the copy so they follow language changes.
type Notice = {
  tone: "neutral" | "success" | "error";
  message: (copy: LessonCopy) => string;
} | null;

const prepareSeconds = 3;
const wordAnswerSeconds = 3;
const twisterAnswerSeconds = 8;
const bestScoresStorageKey = "atlas.pronunciationBest.v1";

const lessonCopy = {
  en: {
    backToCurriculum: "Back to curriculum",
    lesson: (number: number, count: number) => `Lesson ${number} of ${count}`,
    previous: "Previous",
    next: "Next",
    intro:
      "Listen to both words, test your ear, then say each word. Atlas scores every sound you make.",
    speedSlow: "Slow playback",
    serverChecking: "Connecting to scoring server…",
    serverOnline: "Scoring server online",
    serverOffline: "Scoring server offline",
    retry: "Retry",
    offlineHelp:
      "Pronunciation scoring needs the local server. Start it with `python server.py` in the pronunciation_check project, then press Retry.",
    listenAndSay: "Listen and say",
    listenAndSayDescription:
      "Play each word, then press Say it. After a 3-second countdown you have 3 seconds to speak.",
    listen: "Listen",
    sayIt: "Say it",
    best: "Best",
    quizTitle: "Listening quiz",
    quizDescription: "Play a random word and choose which one you heard.",
    playQuiz: "Play a word",
    playAgain: "Play again",
    iHeard: (word: string) => `I heard “${word}”`,
    quizCorrect: "Correct.",
    quizIncorrect: (word: string) => `Not quite. It was “${word}”.`,
    quizPlayFirst: "Play a word first, then choose.",
    quizScore: (correct: number, total: number) =>
      `${correct} / ${total} correct`,
    twisterTitle: "Tongue twister",
    twisterDescription:
      "Put both sounds together in one sentence. You have 8 seconds to say it.",
    listenSentence: "Listen",
    saySentence: "Say the sentence",
    playbackUnsupported: "Audio playback is not supported in this browser.",
    results: "Results",
    attempts: (count: number) =>
      count === 1 ? "1 attempt" : `${count} attempts`,
    emptyResults:
      "Say a word or the tongue twister. Your score, the sounds Atlas heard, and tips to fix them will appear here.",
    getReady: "Get ready",
    speakNow: "Speak now",
    seconds: (value: number) => `${value}s`,
    analyzing: "Scoring your pronunciation…",
    couldNotHear: "I couldn't hear you. Speak a little louder and try again.",
    unsupported: "Recording is not supported in this browser.",
    micFailed: "Couldn't open the microphone. Check the browser's permission.",
    serverError: "The scoring server didn't respond. Is it running?",
    passed: "Every sound was correct",
    notPassed: "Some sounds need work",
    target: "Target",
    sounds: "Sounds",
    expectedSoundsLike: "Should sound like",
    heardSoundsLike: "You sounded like",
    legendCorrect: "correct",
    legendDifferent: "different",
    legendMissing: "missing",
    legendExtra: "extra",
    wordByWord: "Word by word",
    ipa: "IPA",
    expectedIpa: "Should be",
    heardIpa: "You said",
    heardShort: "heard",
    whatToFix: "What to fix",
    nothingToFix: "Nothing to fix. Try it again at normal speed to lock it in.",
    tip: "Tip",
    history: "This session",
  },
  ja: {
    backToCurriculum: "カリキュラムへ戻る",
    lesson: (number: number, count: number) => `レッスン ${number} / ${count}`,
    previous: "前へ",
    next: "次へ",
    intro:
      "2つの単語を聞いて耳で確認し、それぞれ発音しましょう。Atlasがすべての音を採点します。",
    speedSlow: "ゆっくり再生",
    serverChecking: "採点サーバーに接続中…",
    serverOnline: "採点サーバー接続中",
    serverOffline: "採点サーバーに接続できません",
    retry: "再試行",
    offlineHelp:
      "発音の採点にはローカルサーバーが必要です。pronunciation_check プロジェクトで `python server.py` を実行してから「再試行」を押してください。",
    listenAndSay: "聞いて発音する",
    listenAndSayDescription:
      "単語を再生してから「発音する」を押します。3秒のカウントダウン後、3秒間で発音してください。",
    listen: "聞く",
    sayIt: "発音する",
    best: "ベスト",
    quizTitle: "聞き取りクイズ",
    quizDescription: "ランダムな単語を再生して、聞こえた方を選びます。",
    playQuiz: "単語を再生",
    playAgain: "もう一度再生",
    iHeard: (word: string) => `「${word}」に聞こえた`,
    quizCorrect: "正解です。",
    quizIncorrect: (word: string) => `惜しいです。正解は「${word}」でした。`,
    quizPlayFirst: "先に単語を再生してから選んでください。",
    quizScore: (correct: number, total: number) => `${total}問中 ${correct}問正解`,
    twisterTitle: "Tongue Twister",
    twisterDescription:
      "2つの音をひとつの文の中で練習します。8秒以内に言いましょう。",
    listenSentence: "文を聞く",
    saySentence: "文を発音する",
    playbackUnsupported: "このブラウザでは音声再生に対応していません。",
    results: "結果",
    attempts: (count: number) => `${count}回`,
    emptyResults:
      "単語か文を発音すると、スコア・聞き取った音・直し方のヒントがここに表示されます。",
    getReady: "準備",
    speakNow: "今話してください",
    seconds: (value: number) => `${value}秒`,
    analyzing: "発音を採点しています…",
    couldNotHear:
      "聞き取れませんでした。少し大きな声でもう一度試してください。",
    unsupported: "このブラウザでは録音に対応していません。",
    micFailed:
      "マイクを開けませんでした。ブラウザの許可設定を確認してください。",
    serverError: "採点サーバーが応答しません。起動していますか？",
    passed: "すべての音が正しく発音できました",
    notPassed: "直したい音があります",
    target: "目標",
    sounds: "音",
    expectedSoundsLike: "正しい音",
    heardSoundsLike: "あなたの発音",
    legendCorrect: "正しい",
    legendDifferent: "違う音",
    legendMissing: "抜けた音",
    legendExtra: "余分な音",
    wordByWord: "単語ごと",
    ipa: "発音記号 (IPA)",
    expectedIpa: "正しい発音",
    heardIpa: "あなたの発音",
    heardShort: "聞こえた音",
    whatToFix: "直すポイント",
    nothingToFix:
      "直すところはありません。通常の速さでもう一度言って定着させましょう。",
    tip: "ヒント",
    history: "このセッション",
  },
};

type PairLessonProps = {
  sectionId: string;
  sectionTitle: LocalizedText;
  pair: MinimalPair;
  lessonNumber: number;
  lessonCount: number;
  previousPairId: string | null;
  nextPairId: string | null;
};

/**
 * Full-page lesson for one minimal pair. Pronunciation is scored by the
 * local pronunciation server (see pronunciationServer.ts), and the results
 * panel shows the score, sound-by-sound comparison and tips for each attempt.
 */
export function PairLesson({
  sectionId,
  sectionTitle,
  pair,
  lessonNumber,
  lessonCount,
  previousPairId,
  nextPairId,
}: PairLessonProps) {
  const { language, text } = useLanguage();
  const copy = lessonCopy[language];
  const tongueTwister = getTongueTwister(pair);

  const [slow, setSlow] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>("checking");
  const [countdown, setCountdown] = useState<Countdown>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const activeCheckRef = useRef<{ kind: CheckKind; target: string } | null>(
    null,
  );
  const [checkNotice, setCheckNotice] = useState<Notice>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(
    null,
  );
  const attemptIdRef = useRef(0);
  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  const [quizTarget, setQuizTarget] = useState<QuizTarget | null>(null);
  const [quizNotice, setQuizNotice] = useState<Notice>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [playbackNotice, setPlaybackNotice] = useState<Notice>(null);

  const check = useServerPronunciationCheck(handleCheckOutcome);
  const isBusy = countdown !== null || check.isListening || check.isAnalyzing;
  const selectedAttempt =
    attempts.find((attempt) => attempt.id === selectedAttemptId) ??
    attempts[0] ??
    null;

  useEffect(() => {
    const controller = new AbortController();

    void checkPronunciationServer(controller.signal).then((online) => {
      if (!controller.signal.aborted) {
        setServerStatus(online ? "online" : "offline");
      }
    });

    const frameId = window.requestAnimationFrame(() =>
      setBestScores(readBestScores()),
    );

    return () => {
      controller.abort();
      window.cancelAnimationFrame(frameId);

      if (countdownTimerRef.current !== null) {
        window.clearInterval(countdownTimerRef.current);
      }

      stopPracticeAudio();
    };
  }, []);

  function retryServer() {
    setServerStatus("checking");
    void checkPronunciationServer().then((online) =>
      setServerStatus(online ? "online" : "offline"),
    );
  }

  function clearCountdown() {
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setCountdown(null);
  }

  async function play(textToPlay: string, audioPath: string) {
    setPlaybackNotice(null);

    if (!(await playPracticeAudio(textToPlay, audioPath, slow))) {
      setPlaybackNotice({
        tone: "error",
        message: (c) => c.playbackUnsupported,
      });
    }
  }

  // "Get ready" countdown, then the answer window. Recording starts when the
  // answer window opens and is sent to the server when it closes.
  function startCheck(kind: CheckKind, target: string) {
    if (isBusy) {
      return;
    }

    stopPracticeAudio();
    clearCountdown();
    setCheckNotice(null);
    activeCheckRef.current = { kind, target };

    const answerSeconds =
      kind === "word" ? wordAnswerSeconds : twisterAnswerSeconds;
    let phase: "prepare" | "answer" = "prepare";
    let remaining = prepareSeconds;

    setCountdown({ kind, target, phase, remaining });
    playCountdownTick();

    countdownTimerRef.current = window.setInterval(() => {
      remaining -= 1;

      if (remaining > 0) {
        setCountdown({ kind, target, phase, remaining });

        if (phase === "prepare") {
          playCountdownTick();
        }

        return;
      }

      if (phase === "prepare") {
        phase = "answer";
        remaining = answerSeconds;
        setCountdown({ kind, target, phase, remaining });
        playCountdownGo();
        check.start(target);
        return;
      }

      clearCountdown();
      void check.finishListening();
    }, 1000);
  }

  function handleCheckOutcome(outcome: ServerCheckOutcome) {
    const active = activeCheckRef.current;

    switch (outcome.status) {
      case "listening":
        return;
      case "correct":
      case "incorrect": {
        if (!active) {
          return;
        }

        const passed = outcome.status === "correct";
        const id = attemptIdRef.current + 1;
        attemptIdRef.current = id;

        if (passed) {
          playCorrectSound();
        } else {
          playIncorrectSound();
        }

        setServerStatus("online");
        setAttempts((current) => [
          { id, passed, result: outcome.result, ...active },
          ...current,
        ]);
        setSelectedAttemptId(id);
        saveBestScore(active.target, outcome.result.score);
        return;
      }
      case "nothingHeard":
        playIncorrectSound();
        setCheckNotice({ tone: "error", message: (c) => c.couldNotHear });
        return;
      case "unsupported":
        clearCountdown();
        playIncorrectSound();
        setCheckNotice({ tone: "error", message: (c) => c.unsupported });
        return;
      case "failedToStart":
        clearCountdown();
        playIncorrectSound();
        setCheckNotice({ tone: "error", message: (c) => c.micFailed });
        return;
      case "serverError":
        playIncorrectSound();
        // An HTTP error means the server is up; a network error means it isn't.
        if (!outcome.message.startsWith("Pronunciation server error")) {
          setServerStatus("offline");
        }
        setCheckNotice({
          tone: "error",
          message: (c) => `${c.serverError} (${outcome.message})`,
        });
        return;
    }
  }

  function saveBestScore(target: string, score: number) {
    const key = getBestScoreKey(pair.id, target);

    setBestScores((current) => {
      if ((current[key] ?? -1) >= score) {
        return current;
      }

      const next = { ...current, [key]: score };

      try {
        window.localStorage.setItem(bestScoresStorageKey, JSON.stringify(next));
      } catch {
        // Storage unavailable; best scores last for this visit only.
      }

      return next;
    });
  }

  function playQuiz() {
    const target: QuizTarget = Math.random() > 0.5 ? "A" : "B";
    const word = target === "A" ? pair.wordA : pair.wordB;

    setQuizTarget(target);
    setQuizNotice(null);
    void play(word, getPublicAudioPath("words", pair.soundFocus, word));
  }

  function answerQuiz(answer: QuizTarget) {
    if (!quizTarget) {
      setQuizNotice({ tone: "neutral", message: (c) => c.quizPlayFirst });
      return;
    }

    const correctWord = quizTarget === "A" ? pair.wordA : pair.wordB;
    const isCorrect = answer === quizTarget;

    if (isCorrect) {
      playCorrectSound();
      setQuizNotice({ tone: "success", message: (c) => c.quizCorrect });
    } else {
      playIncorrectSound();
      setQuizNotice({
        tone: "error",
        message: (c) => c.quizIncorrect(correctWord),
      });
    }

    setQuizScore((current) => ({
      correct: current.correct + (isCorrect ? 1 : 0),
      total: current.total + 1,
    }));
    setQuizTarget(null);
  }

  const words: [QuizTarget, string][] = [
    ["A", pair.wordA],
    ["B", pair.wordB],
  ];

  return (
    <div className="space-y-10">
      <nav className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link
          href={`/#${sectionId}`}
          className="text-white/60 transition hover:text-white"
        >
          ← {copy.backToCurriculum}
        </Link>
        <div className="flex items-center gap-2">
          <span className="mr-2 text-white/45">
            {copy.lesson(lessonNumber, lessonCount)}
          </span>
          <PagerLink
            href={previousPairId && getLessonHref(sectionId, previousPairId)}
            label={`← ${copy.previous}`}
          />
          <PagerLink
            href={nextPairId && getLessonHref(sectionId, nextPairId)}
            label={`${copy.next} →`}
          />
        </div>
      </nav>

      <header className="space-y-5">
        <p className="text-sm uppercase tracking-[0.32em] text-white/40">
          {text(sectionTitle)}
        </p>
        <h1 className="text-5xl font-semibold leading-tight text-white md:text-7xl">
          {pair.wordA}
          <span className="mx-4 text-2xl font-normal text-white/30 md:text-3xl">
            vs
          </span>
          {pair.wordB}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-white/60">
          {copy.intro}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ServerStatusBadge
            copy={copy}
            status={serverStatus}
            onRetry={retryServer}
          />
          <label className="flex h-9 cursor-pointer items-center gap-3 border border-white/10 px-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={slow}
              onChange={(event) => setSlow(event.target.checked)}
              className="h-4 w-4 accent-[#3498db]"
            />
            {copy.speedSlow}
          </label>
        </div>
        {serverStatus === "offline" ? (
          <p className="max-w-3xl border border-white/20 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/75">
            {copy.offlineHelp}
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start">
        <div className="space-y-6">
          <LessonPanel
            title={copy.listenAndSay}
            description={copy.listenAndSayDescription}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {words.map(([label, word]) => (
                <WordTile
                  key={label}
                  label={label}
                  word={word}
                  best={bestScores[getBestScoreKey(pair.id, word)]}
                  isActive={countdown?.kind === "word" && countdown.target === word}
                  copy={copy}
                  disabled={isBusy}
                  onListen={() =>
                    void play(word, getPublicAudioPath("words", pair.soundFocus, word))
                  }
                  onSay={() => startCheck("word", word)}
                />
              ))}
            </div>
            <NoticeMessage copy={copy} notice={playbackNotice} />
          </LessonPanel>

          <LessonPanel
            title={copy.quizTitle}
            description={copy.quizDescription}
            aside={
              quizScore.total > 0 ? (
                <span className="text-sm tabular-nums text-white/55">
                  {copy.quizScore(quizScore.correct, quizScore.total)}
                </span>
              ) : null
            }
          >
            <div className="grid gap-3">
              <ActionButton onClick={playQuiz}>
                {quizTarget ? copy.playAgain : copy.playQuiz}
              </ActionButton>
              <div className="grid gap-3 sm:grid-cols-2">
                {words.map(([label, word]) => (
                  <ActionButton
                    key={label}
                    variant="secondary"
                    onClick={() => answerQuiz(label)}
                  >
                    {copy.iHeard(word)}
                  </ActionButton>
                ))}
              </div>
              <NoticeMessage copy={copy} notice={quizNotice} />
            </div>
          </LessonPanel>

          <LessonPanel
            title={copy.twisterTitle}
            description={copy.twisterDescription}
            aside={
              <BestScore
                copy={copy}
                score={bestScores[getBestScoreKey(pair.id, tongueTwister.text)]}
              />
            }
          >
            <blockquote
              className={`border bg-black px-5 py-4 transition ${
                countdown?.kind === "twister"
                  ? "border-white"
                  : "border-white/10"
              }`}
            >
              <p className="text-xl font-semibold leading-8 text-white">
                {tongueTwister.text}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/50">
                {text(tongueTwister.note)}
              </p>
            </blockquote>
            <div className="grid gap-3 sm:grid-cols-2">
              <ActionButton
                variant="secondary"
                onClick={() =>
                  void play(
                    tongueTwister.text,
                    getPublicAudioPath("twisters", pair.soundFocus, pair.id),
                  )
                }
              >
                ▶ {copy.listenSentence}
              </ActionButton>
              <ActionButton
                disabled={isBusy}
                onClick={() => startCheck("twister", tongueTwister.text)}
              >
                ● {copy.saySentence}
              </ActionButton>
            </div>
          </LessonPanel>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <section className="border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-white">
                {copy.results}
              </h2>
              {attempts.length > 0 ? (
                <span className="text-xs text-white/45">
                  {copy.attempts(attempts.length)}
                </span>
              ) : null}
            </div>

            <div className="space-y-5 p-5">
              <LiveCheckStatus
                copy={copy}
                countdown={countdown}
                micStream={check.stream}
                isAnalyzing={check.isAnalyzing}
              />
              <NoticeMessage copy={copy} notice={checkNotice} />

              {selectedAttempt ? (
                <PronunciationReport
                  key={selectedAttempt.id}
                  attempt={selectedAttempt}
                  copy={copy}
                />
              ) : isBusy ? null : (
                <p className="text-sm leading-6 text-white/50">
                  {copy.emptyResults}
                </p>
              )}
            </div>

            {attempts.length > 1 ? (
              <AttemptHistory
                attempts={attempts}
                copy={copy}
                selectedId={selectedAttempt?.id ?? null}
                onSelect={setSelectedAttemptId}
              />
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}

function PagerLink({ href, label }: { href: string | null; label: string }) {
  const className =
    "flex h-9 items-center border px-3 text-sm font-semibold transition";

  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={`${className} border-white/10 text-white/25`}
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${className} border-white/20 text-white hover:border-white hover:bg-white hover:text-black`}
    >
      {label}
    </Link>
  );
}

function ServerStatusBadge({
  copy,
  status,
  onRetry,
}: {
  copy: LessonCopy;
  status: ServerStatus;
  onRetry: () => void;
}) {
  const dotClassName =
    status === "online"
      ? "bg-emerald-400"
      : status === "offline"
        ? "bg-red-400"
        : "animate-pulse bg-white/40";
  const label =
    status === "online"
      ? copy.serverOnline
      : status === "offline"
        ? copy.serverOffline
        : copy.serverChecking;

  return (
    <div
      role="status"
      className="flex h-9 items-center gap-2 border border-white/10 px-3 text-sm text-white/70"
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotClassName}`} />
      {label}
      {status === "offline" ? (
        <button
          type="button"
          onClick={onRetry}
          className="ml-1 font-semibold text-white underline underline-offset-4"
        >
          {copy.retry}
        </button>
      ) : null}
    </div>
  );
}

function LessonPanel({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 border border-white/10 bg-white/[0.02] p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-sm leading-6 text-white/50">{description}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function WordTile({
  label,
  word,
  best,
  isActive,
  copy,
  disabled,
  onListen,
  onSay,
}: {
  label: string;
  word: string;
  best: number | undefined;
  isActive: boolean;
  copy: LessonCopy;
  disabled: boolean;
  onListen: () => void;
  onSay: () => void;
}) {
  return (
    <article
      className={`space-y-6 border bg-black p-5 transition ${
        isActive ? "border-white" : "border-white/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.24em] text-white/35">
          {label}
        </span>
        <BestScore copy={copy} score={best} />
      </div>
      <p className="text-4xl font-semibold text-white md:text-5xl">{word}</p>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton variant="secondary" onClick={onListen}>
          ▶ {copy.listen}
        </ActionButton>
        <ActionButton disabled={disabled} onClick={onSay}>
          ● {copy.sayIt}
        </ActionButton>
      </div>
    </article>
  );
}

function BestScore({
  copy,
  score,
}: {
  copy: LessonCopy;
  score: number | undefined;
}) {
  if (score === undefined) {
    return null;
  }

  return (
    <span className="shrink-0 border border-white/15 px-2 py-0.5 text-xs tabular-nums text-white/70">
      {copy.best} {score}
    </span>
  );
}

function LiveCheckStatus({
  copy,
  countdown,
  micStream,
  isAnalyzing,
}: {
  copy: LessonCopy;
  countdown: Countdown;
  micStream: MediaStream | null;
  isAnalyzing: boolean;
}) {
  if (countdown?.phase === "prepare") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-2 border border-white/10 bg-black px-4 py-6"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          {copy.getReady}
        </p>
        <p className="text-6xl font-bold leading-none tabular-nums text-white">
          {countdown.remaining}
        </p>
        <p className="max-w-full truncate text-sm text-white/60">
          “{countdown.target}”
        </p>
      </div>
    );
  }

  if (countdown?.phase === "answer") {
    const total =
      countdown.kind === "word" ? wordAnswerSeconds : twisterAnswerSeconds;

    return (
      <div className="space-y-3 border border-white bg-black px-4 py-4">
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between text-sm"
        >
          <span className="flex items-center gap-2 font-semibold text-white">
            <span
              aria-hidden="true"
              className="h-2 w-2 animate-pulse rounded-full bg-red-500"
            />
            {copy.speakNow}
          </span>
          <span className="font-semibold tabular-nums text-white">
            {copy.seconds(countdown.remaining)}
          </span>
        </div>
        <p className="text-lg font-semibold leading-7 text-white">
          {countdown.target}
        </p>
        <DrainingBar seconds={total} />
        {micStream ? <MicLevelMeter stream={micStream} /> : null}
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 border border-white/10 bg-black px-4 py-4 text-sm text-white/70"
      >
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"
        />
        {copy.analyzing}
      </div>
    );
  }

  return null;
}

// Drains from full to empty over `seconds`.
function DrainingBar({ seconds }: { seconds: number }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setStarted(true));

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div aria-hidden="true" className="h-1.5 w-full bg-white/10">
      <div
        className="h-full bg-white"
        style={{
          width: started ? "0%" : "100%",
          transition: `width ${seconds}s linear`,
        }}
      />
    </div>
  );
}

function PronunciationReport({
  attempt,
  copy,
}: {
  attempt: Attempt;
  copy: LessonCopy;
}) {
  const { result } = attempt;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5">
        <ScoreRing score={result.score} color={result.grade.color} />
        <div className="min-w-0 space-y-1">
          <p className="text-2xl font-semibold" style={{ color: result.grade.color }}>
            {result.grade.letter}
            <span className="ml-2 text-base font-medium text-white">
              {result.grade.verdict}
            </span>
          </p>
          <p className="text-sm text-white/60">
            {attempt.passed ? `⭕️ ${copy.passed}` : copy.notPassed}
          </p>
          <p className="truncate text-xs text-white/40">
            {copy.target}: “{attempt.target}”
          </p>
        </div>
      </div>

      {result.feedback ? (
        <p className="whitespace-pre-line rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/85">
          {result.feedback}
        </p>
      ) : null}

      {/* Sounds section hidden for now
      <ReportSection title={copy.sounds}>
        <PhonemeComparison
          copy={copy}
          expected={result.expected.phonemes}
          heard={result.heard.phonemes}
        />
        <dl className="grid gap-2 text-sm">
          <div className="grid grid-cols-[8rem_1fr] gap-3">
            <dt className="text-white/45">{copy.expectedSoundsLike}</dt>
            <dd className="break-words font-medium text-white">
              {result.expected.soundsLike}
            </dd>
          </div>
          <div className="grid grid-cols-[8rem_1fr] gap-3">
            <dt className="text-white/45">{copy.heardSoundsLike}</dt>
            <dd className="break-words font-medium text-white">
              {result.heard.soundsLike}
            </dd>
          </div>
        </dl>
      </ReportSection>
      */}

      <ReportSection title={copy.wordByWord}>
        <ul className="flex flex-wrap gap-2">
          {result.words.map((word, index) => (
            <li
              key={`${word.word}-${index}`}
              className={`flex min-w-16 flex-col items-center rounded-lg border-2 px-3 py-2 text-center ${getWordScoreClassName(word.score)}`}
            >
              <span className="text-lg font-semibold leading-6">{word.word}</span>
              <span className="text-xs font-medium text-white/80">
                {word.soundsLike}
              </span>
              <span className="font-mono text-xs text-white/70">/{word.ipa}/</span>
              {word.heardIpa !== word.ipa ? (
                <span className="font-mono text-[11px] text-amber-200/80">
                  {copy.heardShort}: {word.heardIpa ? `/${word.heardIpa}/` : "–"}
                </span>
              ) : null}
              <span className="text-xs tabular-nums text-white/60">
                {word.score}%
              </span>
            </li>
          ))}
        </ul>
      </ReportSection>

      <ReportSection title={copy.ipa}>
        <dl className="grid gap-2 text-sm">
          <div className="grid grid-cols-[8rem_1fr] gap-3">
            <dt className="text-white/45">{copy.expectedIpa}</dt>
            <dd className="wrap-break-word font-mono font-medium text-white">
              /{result.expected.ipa}/
            </dd>
          </div>
          <div className="grid grid-cols-[8rem_1fr] gap-3">
            <dt className="text-white/45">{copy.heardIpa}</dt>
            <dd className="wrap-break-word font-mono font-medium text-white">
              /{result.heard.ipa}/
            </dd>
          </div>
        </dl>
      </ReportSection>

      <ReportSection title={copy.whatToFix}>
        {result.issues.length > 0 ? (
          <ul className="space-y-3">
            {result.issues.map((issue, index) => (
              <li
                key={index}
                className="space-y-2 border-l-2 border-amber-400/70 pl-3 text-sm leading-6"
              >
                <p className="text-white">
                  <span className="mr-2 font-semibold">{issue.word}</span>
                  <span className="text-white/75">{issue.message}</span>
                </p>
                {issue.tip ? (
                  <p className="text-white/55">
                    <span className="mr-1 font-semibold text-white/70">
                      {copy.tip}:
                    </span>
                    {issue.tip}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-white/55">{copy.nothingToFix}</p>
        )}
      </ReportSection>
    </div>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-white/10 pt-4">
      <h3 className="text-xs uppercase tracking-[0.24em] text-white/40">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const [shown, setShown] = useState(0);

  // Animate from empty on first render.
  useEffect(() => {
    const frameId = requestAnimationFrame(() => setShown(score));

    return () => cancelAnimationFrame(frameId);
  }, [score]);

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-white/10"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - shown / 100)}
          style={{ transition: "stroke-dashoffset 700ms ease-out" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums text-white">
        {score}
      </span>
    </div>
  );
}

const phonemeStepClassNames: Record<PhonemeStep["type"], string> = {
  match: "border-white/15 text-white",
  substitute: "border-amber-400/70 bg-amber-400/10 text-amber-200",
  missing: "border-dashed border-red-400/70 text-red-300",
  extra: "border-dashed border-sky-400/60 text-sky-300",
};

/** Expected sounds on top, what was heard underneath, aligned sound by sound. */
function PhonemeComparison({
  copy,
  expected,
  heard,
}: {
  copy: LessonCopy;
  expected: string[];
  heard: string[];
}) {
  const steps = alignPhonemes(expected, heard);
  const legend: [PhonemeStep["type"], string][] = [
    ["match", copy.legendCorrect],
    ["substitute", copy.legendDifferent],
    ["missing", copy.legendMissing],
    ["extra", copy.legendExtra],
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {steps.map((step, index) => (
          <span
            key={index}
            className={`flex min-w-9 flex-col items-center border px-1.5 py-1 font-mono text-sm leading-5 ${phonemeStepClassNames[step.type]}`}
          >
            <span>{step.type === "extra" ? "·" : step.expected}</span>
            <span className="text-[11px] opacity-70">
              {step.type === "missing" ? "–" : step.heard}
            </span>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
        {legend.map(([type, label]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 border ${phonemeStepClassNames[type]}`}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function AttemptHistory({
  attempts,
  copy,
  selectedId,
  onSelect,
}: {
  attempts: Attempt[];
  copy: LessonCopy;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="border-t border-white/10 px-5 py-4">
      <h3 className="mb-2 text-xs uppercase tracking-[0.24em] text-white/40">
        {copy.history}
      </h3>
      <ul className="max-h-56 space-y-1 overflow-y-auto">
        {attempts.map((attempt) => (
          <li key={attempt.id}>
            <button
              type="button"
              onClick={() => onSelect(attempt.id)}
              aria-pressed={attempt.id === selectedId}
              className={`grid w-full grid-cols-[1.25rem_1fr_2.5rem] items-center gap-2 px-2 py-1.5 text-left text-sm transition ${
                attempt.id === selectedId
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <span aria-hidden="true">{attempt.passed ? "⭕️" : "·"}</span>
              <span className="truncate">{attempt.target}</span>
              <span
                className="text-right font-semibold tabular-nums"
                style={{ color: attempt.result.grade.color }}
              >
                {attempt.result.score}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoticeMessage({
  copy,
  notice,
}: {
  copy: LessonCopy;
  notice: Notice;
}) {
  if (!notice) {
    return null;
  }

  const className =
    notice.tone === "success"
      ? "border-white bg-white text-black"
      : notice.tone === "error"
        ? "border-white/20 bg-white/[0.04] text-white"
        : "border-white/10 bg-white/[0.02] text-white/70";
  const icon =
    notice.tone === "success" ? "⭕️" : notice.tone === "error" ? "❌" : null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={`flex items-start gap-2 border px-3 py-2 text-sm font-medium ${className}`}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{notice.message(copy)}</span>
    </p>
  );
}

function ActionButton({
  children,
  disabled = false,
  variant = "primary",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  onClick: () => void;
}) {
  const variantClassName =
    variant === "primary"
      ? "border-white bg-white text-black hover:bg-black hover:text-white"
      : "border-white/25 bg-transparent text-white hover:border-white";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`h-11 border px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/25 ${variantClassName}`}
    >
      {children}
    </button>
  );
}

type PhonemeStep =
  | { type: "match" | "substitute"; expected: string; heard: string }
  | { type: "missing"; expected: string; heard?: undefined }
  | { type: "extra"; expected?: undefined; heard: string };

// Symbols the model may output in a different but equivalent form.
const equivalentPhonemes: Record<string, string> = { r: "ɹ", g: "ɡ" };

function samePhoneme(a: string, b: string) {
  return (equivalentPhonemes[a] ?? a) === (equivalentPhonemes[b] ?? b);
}

/** Lines up expected and heard sounds with a minimum-edit-distance alignment. */
function alignPhonemes(expected: string[], heard: string[]): PhonemeStep[] {
  const cost = expected.map(() => new Array<number>(heard.length + 1).fill(0));
  cost.push(new Array<number>(heard.length + 1).fill(0));

  for (let i = 0; i <= expected.length; i += 1) {
    for (let j = 0; j <= heard.length; j += 1) {
      if (i === 0 || j === 0) {
        cost[i][j] = i + j;
        continue;
      }

      cost[i][j] = Math.min(
        cost[i - 1][j - 1] + (samePhoneme(expected[i - 1], heard[j - 1]) ? 0 : 1),
        cost[i - 1][j] + 1,
        cost[i][j - 1] + 1,
      );
    }
  }

  const steps: PhonemeStep[] = [];
  let i = expected.length;
  let j = heard.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const same = samePhoneme(expected[i - 1], heard[j - 1]);

      if (cost[i][j] === cost[i - 1][j - 1] + (same ? 0 : 1)) {
        steps.push({
          type: same ? "match" : "substitute",
          expected: expected[i - 1],
          heard: heard[j - 1],
        });
        i -= 1;
        j -= 1;
        continue;
      }
    }

    if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      steps.push({ type: "missing", expected: expected[i - 1] });
      i -= 1;
    } else {
      steps.push({ type: "extra", heard: heard[j - 1] });
      j -= 1;
    }
  }

  return steps.reverse();
}

// Green when every sound in the word was right, amber when close, red otherwise.
function getWordScoreClassName(score: number) {
  if (score >= 100) return "border-green-600 text-green-500";
  if (score >= 60) return "border-amber-500 text-amber-400";
  return "border-red-500 text-red-400";
}

function getBestScoreKey(pairId: string, target: string) {
  return `${pairId}:${target}`;
}

function readBestScores(): Record<string, number> {
  try {
    const stored = window.localStorage.getItem(bestScoresStorageKey);

    return stored ? (JSON.parse(stored) as Record<string, number>) : {};
  } catch {
    return {};
  }
}
