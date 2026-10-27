"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import type { Language } from "@/lib/i18n";
import type {
  AnalyzeSuccess,
  PronunciationIssue,
  PronunciationWord,
} from "@/lib/pronunciationApi";
import { alignPhonemes, groupStepsByWord } from "@/lib/phonemeAlignment";
import type { PhonemeStep } from "@/lib/phonemeAlignment";
import { gradeByLetter, gradeFor } from "@/lib/pronunciationGrades";

import type { PronunciationAssessmentState } from "./usePronunciationAssessment";
import type { ServerStatus } from "./useServerStatus";
import type { RecorderError } from "./useVoiceRecorder";

export const panelCopy = {
  en: {
    title: "Results",
    attempts: (count: number) => (count === 1 ? "1 attempt" : `${count} attempts`),
    empty:
      "Press a “Say …” button. Your score and tips will show up here.",
    practicing: "Practicing",
    listening: "Listening…",
    listen: "Listen to me",
    stopListening: "Stop",
    checking: "Checking… this can take a few seconds.",
    score: "Score",
    grade: "Grade",
    everyCorrect: "Every sound was correct",
    wordsToPractice: (count: number, total: number) =>
      `${count} of ${total} ${total === 1 ? "word needs" : "words need"} practice`,
    target: (target: string) => `Target: “${target}”`,
    aiAssessment: "ATLAS Assessment",
    wordByWord: "Word by word",
    tapWord: "Tap a word to see how it should sound.",
    sayItLike: "Say it like",
    weHeard: "We heard",
    notHeard: "We didn't hear this word. Try saying it a little louder!",
    ipa: "IPA",
    shouldBe: "Should be",
    youSaid: "You said",
    ipaHint: "Top: how it should sound. Bottom: what we heard.",
    phonemeLegend: {
      match: "Correct",
      substitute: "Different sound",
      missing: "Missing",
      extra: "Extra sound",
    } satisfies Record<PhonemeStep["kind"], string>,
    whatToFix: "What to fix",
    nothingToFix: "Nothing to fix. Try it again at normal speed to lock it in.",
    tip: "Tip",
    tryAgain: "Try again",
    tooQuiet: "Didn't catch that - the recording was too short or too quiet.",
    recorderErrors: {
      insecure:
        "The microphone only works on a secure page (https or localhost).",
      unsupported:
        "This browser can't record sound. Try Chrome, Edge, Firefox or Safari.",
      denied:
        "We need your microphone to hear you! Please allow the microphone in your browser settings, then try again.",
      noMicrophone: "We couldn't find a microphone. Plug one in and try again.",
      failed: "The microphone didn't start. Please try again.",
    } satisfies Record<RecorderError, string>,
    apiError: (status: number) => {
      switch (status) {
        case 0:
          return "We couldn't reach the checker. Check your internet and try again.";
        case 400:
          return "There was nothing to check. Please try again.";
        case 401:
          return "The checker isn't set up correctly (API key). Please tell your teacher.";
        case 413:
          return "That recording is too long. Try a shorter one!";
        case 415:
          return "We couldn't play that recording. Please record again.";
        default:
          return "Something went wrong. Please try again.";
      }
    },
    server: {
      checking: "Connecting…",
      online: "Checker is ready",
      offline: "Checker is offline",
    } satisfies Record<ServerStatus, string>,
  },
  ja: {
    title: "結果",
    attempts: (count: number) => `${count}回目`,
    empty: "「〜を発音する」ボタンを押すと、ここにスコアとコツが表示されます。",
    practicing: "練習中",
    listening: "聞いています…",
    listen: "自分の声を聞く",
    stopListening: "とめる",
    checking: "チェック中… 数秒かかることがあります。",
    score: "スコア",
    grade: "評価",
    everyCorrect: "すべての音が正しく言えました",
    wordsToPractice: (count: number, total: number) =>
      `${total}語中${count}語を練習しよう`,
    target: (target: string) => `目標：「${target}」`,
    aiAssessment: "ATLAS評価",
    wordByWord: "単語ごと",
    tapWord: "単語をタップすると、正しい音が見られます。",
    sayItLike: "こう言おう",
    weHeard: "聞こえた音",
    notHeard: "この単語は聞こえませんでした。もう少し大きな声で言ってみよう！",
    ipa: "IPA",
    shouldBe: "正しい発音",
    youSaid: "あなたの発音",
    ipaHint: "上：正しい発音　下：聞こえた発音",
    phonemeLegend: {
      match: "正しい",
      substitute: "ちがう音",
      missing: "ぬけた音",
      extra: "よけいな音",
    } satisfies Record<PhonemeStep["kind"], string>,
    whatToFix: "直すところ",
    nothingToFix: "直すところはありません。普通の速さでもう一度言って、身につけよう。",
    tip: "コツ",
    tryAgain: "もう一度",
    tooQuiet: "うまく聞き取れませんでした。録音が短すぎるか、声が小さすぎます。",
    recorderErrors: {
      insecure:
        "マイクは安全なページ（https または localhost）でのみ使えます。",
      unsupported:
        "このブラウザでは録音できません。Chrome / Edge / Firefox / Safari をお試しください。",
      denied:
        "声を聞くにはマイクが必要です。ブラウザの設定でマイクを許可してから、もう一度ためしてね。",
      noMicrophone: "マイクが見つかりません。マイクをつないで、もう一度ためしてね。",
      failed: "マイクが起動しませんでした。もう一度ためしてね。",
    } satisfies Record<RecorderError, string>,
    apiError: (status: number) => {
      switch (status) {
        case 0:
          return "チェッカーにつながりませんでした。インターネットを確認して、もう一度ためしてね。";
        case 400:
          return "チェックする内容がありませんでした。もう一度ためしてね。";
        case 401:
          return "チェッカーの設定に問題があります（APIキー）。先生に伝えてください。";
        case 413:
          return "録音が長すぎます。短くしてみよう！";
        case 415:
          return "録音を再生できませんでした。もう一度録音してね。";
        default:
          return "うまくいきませんでした。もう一度ためしてね。";
      }
    },
    server: {
      checking: "接続中…",
      online: "チェッカー準備OK",
      offline: "チェッカーはオフラインです",
    } satisfies Record<ServerStatus, string>,
  },
};

export type PanelCopy = (typeof panelCopy)[Language];

export const primaryButtonClassName =
  "inline-flex h-11 items-center justify-center gap-2 border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/25 disabled:hover:bg-white/10 disabled:hover:text-white/25";

export const secondaryButtonClassName =
  "inline-flex h-11 items-center justify-center gap-2 border border-white/10 bg-black px-4 text-sm font-semibold text-white transition hover:border-white/35 focus:outline-none disabled:cursor-not-allowed disabled:text-white/30 disabled:hover:border-white/10";

export const labelClassName =
  "text-xs font-semibold uppercase tracking-[0.2em] text-white/40";

/** The learner-facing text for a mic or server problem, or null if none. */
export function assessmentNoticeText(
  assessment: PronunciationAssessmentState,
  copy: PanelCopy,
  language: Language,
) {
  const { recorder, notice } = assessment;

  if (recorder.error) return copy.recorderErrors[recorder.error];
  if (notice?.kind === "tooQuiet") {
    return language === "en" ? notice.message || copy.tooQuiet : copy.tooQuiet;
  }
  if (notice?.kind === "api") return copy.apiError(notice.status);
  return null;
}

/**
 * Shows the AI pronunciation assessment for the pair card's "Say …" checks:
 * live recording state, "Checking…", errors, playback and the scored result.
 * Recording itself is started by the card (steps 3 and 4).
 */
export function PronunciationPanel({
  assessment,
  onTryAgain,
  tryAgainDisabled = false,
}: {
  assessment: PronunciationAssessmentState;
  /** Re-runs the same check (same word or sentence). */
  onTryAgain: () => void;
  tryAgainDisabled?: boolean;
}) {
  const { language } = useLanguage();
  const copy = panelCopy[language];
  const { recorder, result, target, isChecking } = assessment;
  const isIdle = recorder.status === "idle" && !isChecking;
  const noticeText = assessmentNoticeText(assessment, copy, language);

  return (
    <section
      aria-label={copy.title}
      className="border border-white/10 bg-white/[0.02]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
          {copy.title}
        </p>
        {result && assessment.attempts > 0 ? (
          <p className="text-xs text-white/50">{copy.attempts(assessment.attempts)}</p>
        ) : (
          <ServerStatusBadge status={assessment.serverStatus} copy={copy} />
        )}
      </div>

      <div className="space-y-4 p-5">
      {result ? null : target ? (
        <div className="border border-white/10 bg-black px-4 py-3">
          <p className={labelClassName}>{copy.practicing}</p>
          <p className="mt-1 text-lg font-semibold leading-7 text-white">
            {target}
          </p>
        </div>
      ) : (
        <p className="border border-white/10 bg-black px-4 py-6 text-center text-sm leading-6 text-white/50">
          {copy.empty}
        </p>
      )}

      {recorder.isRecording ? <ListeningIndicator label={copy.listening} /> : null}

      {isChecking ? <CheckingIndicator label={copy.checking} /> : null}

      {noticeText ? (
        <p
          role="status"
          aria-live="polite"
          className="border border-white/20 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white"
        >
          {noticeText}
        </p>
      ) : null}

      {result ? (
        <div aria-live="polite">
          <AssessmentResults
            key={recorder.recording?.url}
            result={result}
            target={target}
            copy={copy}
            language={language}
          />
        </div>
      ) : null}

      {target && isIdle && (result || noticeText || recorder.recording) ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {recorder.recording ? (
            <PlaybackButton
              key={recorder.recording.url}
              url={recorder.recording.url}
              copy={copy}
            />
          ) : null}
          <button
            type="button"
            onClick={onTryAgain}
            disabled={tryAgainDisabled}
            className={`${primaryButtonClassName} ${
              recorder.recording ? "" : "sm:col-span-2"
            }`}
          >
            {copy.tryAgain}
          </button>
        </div>
      ) : null}
      </div>
    </section>
  );
}

function ServerStatusBadge({
  status,
  copy,
}: {
  status: ServerStatus;
  copy: PanelCopy;
}) {
  const dotClassName =
    status === "online"
      ? "bg-white"
      : status === "offline"
        ? "border border-white/40 bg-transparent"
        : "bg-white/40 motion-safe:animate-pulse";

  return (
    <p
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-xs ${
        status === "online"
          ? "border-white/20 text-white/80"
          : "border-white/10 text-white/50"
      }`}
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotClassName}`} />
      {copy.server[status]}
    </p>
  );
}

// The live mic meter sits in the step under "Speak now"; here we only say
// that the recording is running.
function ListeningIndicator({ label }: { label: string }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 border border-white/10 bg-black px-4 py-3 text-sm text-white/70"
    >
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-full bg-white motion-safe:animate-pulse"
      />
      {label}
    </p>
  );
}

export function PlaybackButton({ url, copy }: { url: string; copy: PanelCopy }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.currentTime = 0;
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={url}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      <button type="button" onClick={toggle} className={secondaryButtonClassName}>
        <SpeakerIcon className="h-4 w-4 shrink-0 text-white/50" />
        {playing ? copy.stopListening : copy.listen}
      </button>
    </>
  );
}

export function CheckingIndicator({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 border border-white/10 bg-black px-4 py-4"
    >
      <span aria-hidden="true" className="flex gap-1.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 rounded-full bg-white motion-safe:animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span className="text-sm font-medium text-white/70">{label}</span>
    </div>
  );
}

/**
 * IPA for display, wrapped in exactly one pair of slashes. Uses `ipa` when
 * the server sends it, otherwise joins the IPA `phonemes`. Null if neither.
 */
export function formatIpa(ipa?: string | null, phonemes?: string[]) {
  const raw = ipa?.trim() || phonemes?.join("") || "";
  const bare = raw.replace(/^\/+|\/+$/g, "");

  return bare ? `/${bare}/` : null;
}

export function isPerfect(word: PronunciationWord | undefined) {
  return word !== undefined && word.score >= 100;
}

export function findWord(words: PronunciationWord[], text: string) {
  return words.find((word) => word.word.toLowerCase() === text.toLowerCase());
}

function AssessmentResults({
  result,
  target,
  copy,
  language,
}: {
  result: AnalyzeSuccess;
  target: string | null;
  copy: PanelCopy;
  language: Language;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedWord =
    selectedIndex === null ? undefined : result.words[selectedIndex];
  const verdict =
    language === "ja"
      ? (gradeByLetter(result.grade.letter)?.verdict.ja ?? result.grade.verdict)
      : result.grade.verdict;
  // Words that already scored 100 have nothing left to fix.
  const fixableIssues = result.issues.filter(
    (issue) => !isPerfect(findWord(result.words, issue.word)),
  );
  const wordsToFix = new Set(
    fixableIssues.map((issue) => issue.word.toLowerCase()),
  ).size;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <ScoreRing
          score={result.score}
          color={result.grade.color}
          label={copy.score}
        />
        <div className="min-w-0 space-y-1">
          <p className="flex flex-wrap items-baseline gap-2">
            <span
              className="text-2xl font-bold"
              style={{ color: result.grade.color }}
              aria-label={`${copy.grade} ${result.grade.letter}`}
            >
              {result.grade.letter}
            </span>
            <span className="text-lg font-semibold text-white">{verdict}</span>
          </p>
          {result.allWordsCorrect ? (
            <p className="flex items-center gap-1.5 text-sm text-white/60">
              <span aria-hidden="true">⭕️</span>
              {copy.everyCorrect}
            </p>
          ) : wordsToFix > 0 ? (
            <p className="text-sm text-white/60">
              {copy.wordsToPractice(wordsToFix, result.words.length)}
            </p>
          ) : null}
          {target ? (
            <p className="break-words text-xs text-white/40">
              {copy.target(target)}
            </p>
          ) : null}
        </div>
      </div>

      {result.feedback ? (
        <AiAssessmentBox label={copy.aiAssessment} text={result.feedback} />
      ) : null}

      <ResultSection title={copy.wordByWord}>
        <p className="text-sm text-white/50">{copy.tapWord}</p>
        <div className="flex flex-wrap gap-2">
          {result.words.map((word, index) => (
            <WordChip
              key={`${word.word}-${index}`}
              word={word}
              selected={index === selectedIndex}
              onClick={() =>
                setSelectedIndex((current) => (current === index ? null : index))
              }
            />
          ))}
        </div>
        {selectedWord ? <WordDetail word={selectedWord} copy={copy} /> : null}
      </ResultSection>

      {result.words.some((word) => word.phonemes?.length) ? (
        <ResultSection title={copy.ipa}>
          <IpaComparison
            words={result.words}
            heardPhonemes={result.heard?.phonemes}
            copy={copy}
          />
        </ResultSection>
      ) : null}

      <ResultSection title={copy.whatToFix}>
        {fixableIssues.length > 0 ? (
          <ul className="space-y-2">
            {fixableIssues.map((issue, index) => (
              <IssueItem
                key={`${issue.word}-${index}`}
                issue={issue}
                words={result.words}
                copy={copy}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-white/70">{copy.nothingToFix}</p>
        )}
      </ResultSection>
    </div>
  );
}

// How each heard sound is drawn. Colours reuse the grade bands (A correct,
// D different, C extra); a missing sound is a struck-through theme grey so it
// can't be confused with a different (red) one.
const phonemeStyles: Record<
  PhonemeStep["kind"],
  { color?: string; className: string }
> = {
  match: { color: gradeByLetter("A")?.color, className: "" },
  substitute: { color: gradeByLetter("D")?.color, className: "" },
  missing: { className: "text-white/40 line-through" },
  extra: { color: gradeByLetter("C")?.color, className: "" },
};

/**
 * One box per word: the expected IPA on top and what was heard below, each
 * heard sound coloured by whether it matched (see lib/phonemeAlignment.ts).
 */
export function IpaComparison({
  words,
  heardPhonemes,
  copy,
}: {
  words: PronunciationWord[];
  heardPhonemes: string[] | undefined;
  copy: PanelCopy;
}) {
  const expected = words.flatMap((word) => word.phonemes ?? []);
  const heardByWord = heardPhonemes?.length
    ? groupStepsByWord(
        alignPhonemes(expected, heardPhonemes),
        words.map((word) => word.phonemes?.length ?? 0),
      )
    : null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50">{copy.ipaHint}</p>
      <div className="flex flex-wrap gap-2">
        {words.map((word, index) => (
          <div
            key={`${word.word}-${index}`}
            className="min-w-16 border border-white/10 bg-black px-3 py-2"
          >
            <p className="text-xs text-white/50">{word.word}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-white">
              <span className="sr-only">{copy.shouldBe}: </span>
              <span className="text-white/30">/</span>
              {word.phonemes?.join("")}
              <span className="text-white/30">/</span>
            </p>
            {heardByWord ? (
              <p className="font-mono text-lg font-semibold">
                <span className="sr-only">{copy.youSaid}: </span>
                <span className="text-white/30">/</span>
                {heardByWord[index]?.map((step, stepIndex) => (
                  <PhonemeMark key={stepIndex} step={step} copy={copy} />
                ))}
                <span className="text-white/30">/</span>
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {heardByWord ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
          {(Object.keys(phonemeStyles) as PhonemeStep["kind"][]).map((kind) => (
            <li key={kind} className="flex items-center gap-1.5">
              {/* A sample sound drawn exactly like the marks above. */}
              <span
                aria-hidden="true"
                className={`font-mono text-sm font-semibold ${phonemeStyles[kind].className}`}
                style={{ color: phonemeStyles[kind].color }}
              >
                a
              </span>
              {copy.phonemeLegend[kind]}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function PhonemeMark({ step, copy }: { step: PhonemeStep; copy: PanelCopy }) {
  const { color, className } = phonemeStyles[step.kind];
  const label = copy.phonemeLegend[step.kind];

  if (step.kind === "missing") {
    // Shows the sound that should have been there, struck through.
    return (
      <span title={`${label}: ${step.expected}`} className={className}>
        {step.expected}
      </span>
    );
  }

  return (
    <span
      title={
        step.kind === "substitute"
          ? `${label}: ${step.heard} (${copy.shouldBe}: ${step.expected})`
          : `${label}: ${step.heard}`
      }
      className={className}
      style={{ color }}
    >
      {step.heard}
    </span>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-white/10 pt-5">
      <h3 className={labelClassName}>{title}</h3>
      {children}
    </section>
  );
}

const ringRadius = 40;
const ringCircumference = 2 * Math.PI * ringRadius;

// Circular score gauge; the arc fills to `score`% in the grade colour.
export function ScoreRing({
  score,
  color,
  label,
}: {
  score: number;
  color: string;
  label: string;
}) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setFilled(true));

    return () => cancelAnimationFrame(frameId);
  }, []);

  const progress = Math.max(0, Math.min(100, score)) / 100;

  return (
    <div
      role="img"
      aria-label={`${label} ${score}`}
      className="relative grid h-24 w-24 shrink-0 place-items-center"
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={ringRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          className="text-white/10"
        />
        <circle
          cx="50"
          cy="50"
          r={ringRadius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={ringCircumference}
          strokeDashoffset={ringCircumference * (1 - (filled ? progress : 0))}
          className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700 motion-safe:ease-out"
        />
      </svg>
      <span className="text-2xl font-bold tabular-nums text-white">{score}</span>
    </div>
  );
}

function WordChip({
  word,
  selected,
  onClick,
}: {
  word: PronunciationWord;
  selected: boolean;
  onClick: () => void;
}) {
  const grade = gradeFor(word.score);

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${word.word}: ${word.score}`}
      onClick={onClick}
      className={`min-h-11 border border-b-4 px-3 text-xl font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
        selected ? "bg-white/[0.09]" : "bg-black hover:bg-white/[0.04]"
      }`}
      style={{ color: grade.color, borderColor: grade.color }}
    >
      {word.word}
    </button>
  );
}

function WordDetail({
  word,
  copy,
}: {
  word: PronunciationWord;
  copy: PanelCopy;
}) {
  const grade = gradeFor(word.score);
  const expectedIpa = formatIpa(word.ipa, word.phonemes);
  // The current server sends no per-word "heard" data (undefined), so the
  // column only shows when it does; null means the word wasn't heard.
  const hasHeard = word.heardIpa !== undefined;

  return (
    <div
      className={`grid gap-3 border border-white/10 bg-white/[0.02] p-3 ${
        hasHeard ? "sm:grid-cols-2" : ""
      }`}
    >
      <div className={`flex items-center gap-3 ${hasHeard ? "sm:col-span-2" : ""}`}>
        <p className="text-xl font-semibold text-white">{word.word}</p>
        <ScoreTag score={word.score} color={grade.color} />
      </div>
      <div>
        <p className={labelClassName}>{copy.sayItLike}</p>
        <p className="mt-1 text-lg font-semibold text-white">{word.soundsLike}</p>
        {expectedIpa ? (
          <p className="font-mono text-sm text-white/50">{expectedIpa}</p>
        ) : null}
      </div>
      {hasHeard ? (
        <div>
          <p className={labelClassName}>{copy.weHeard}</p>
          {word.heardIpa ? (
            <p className="mt-1 font-mono text-lg text-white">
              {formatIpa(word.heardIpa)}
            </p>
          ) : (
            <p className="mt-1 text-sm leading-6 text-white/70">{copy.notHeard}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ScoreTag({ score, color }: { score: number; color: string }) {
  return (
    <span
      className="inline-flex h-7 min-w-10 shrink-0 items-center justify-center border-2 px-1.5 text-xs font-bold tabular-nums"
      style={{ borderColor: color, color }}
    >
      {score}
    </span>
  );
}

export function IssueItem({
  issue,
  words,
  copy,
}: {
  issue: PronunciationIssue;
  words: PronunciationWord[];
  copy: PanelCopy;
}) {
  const match = words.find(
    (word) => word.word.toLowerCase() === issue.word.toLowerCase(),
  );

  return (
    <li className="space-y-2 border border-white/10 bg-black p-3">
      <div className="flex items-center gap-2">
        {match ? (
          <ScoreTag score={match.score} color={gradeFor(match.score).color} />
        ) : null}
        <p className="font-semibold text-white">{issue.word}</p>
      </div>
      <p className="text-sm leading-6 text-white/70">{issue.message}</p>
      {issue.tip ? (
        <p className="border-l-2 border-white/30 pl-3 text-sm leading-6 text-white/70">
          <span className="font-semibold text-white">{copy.tip}: </span>
          {issue.tip}
        </p>
      ) : null}
    </li>
  );
}

// The AI coach's feedback, labelled so it's clear it comes from the AI.
function AiAssessmentBox({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className={labelClassName}>{label}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white">
        {text}
      </p>
    </div>
  );
}
