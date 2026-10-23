"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import { createAudioContext } from "@/components/training/feedbackSounds";
import type { Language } from "@/lib/i18n";
import type {
  AnalyzeSuccess,
  PronunciationIssue,
  PronunciationWord,
} from "@/lib/pronunciationApi";
import { gradeByLetter, gradeFor } from "@/lib/pronunciationGrades";

import type { PronunciationAssessmentState } from "./usePronunciationAssessment";
import type { ServerStatus } from "./useServerStatus";
import { maxRecordingSeconds } from "./useVoiceRecorder";
import type { RecorderError } from "./useVoiceRecorder";

const panelCopy = {
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
    aiAssessment: "AI Assessment",
    wordByWord: "Word by word",
    tapWord: "Tap a word to see how it should sound.",
    sayItLike: "Say it like",
    weHeard: "We heard",
    notHeard: "We didn't hear this word. Try saying it a little louder!",
    ipa: "IPA",
    shouldBe: "Should be",
    youSaid: "You said",
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
    aiAssessment: "AI評価",
    wordByWord: "単語ごと",
    tapWord: "単語をタップすると、正しい音が見られます。",
    sayItLike: "こう言おう",
    weHeard: "聞こえた音",
    notHeard: "この単語は聞こえませんでした。もう少し大きな声で言ってみよう！",
    ipa: "IPA",
    shouldBe: "正しい発音",
    youSaid: "あなたの発音",
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

type PanelCopy = (typeof panelCopy)[Language];

const primaryButtonClassName =
  "inline-flex h-11 items-center justify-center gap-2 border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/25 disabled:hover:bg-white/10 disabled:hover:text-white/25";

const secondaryButtonClassName =
  "inline-flex h-11 items-center justify-center gap-2 border border-white/10 bg-black px-4 text-sm font-semibold text-white transition hover:border-white/35 focus:outline-none disabled:cursor-not-allowed disabled:text-white/30 disabled:hover:border-white/10";

const labelClassName =
  "text-xs font-semibold uppercase tracking-[0.2em] text-white/40";

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
  const { recorder, notice, result, target, isChecking } = assessment;
  const isIdle = recorder.status === "idle" && !isChecking;

  const noticeText = recorder.error
    ? copy.recorderErrors[recorder.error]
    : notice?.kind === "tooQuiet"
      ? language === "en"
        ? notice.message || copy.tooQuiet
        : copy.tooQuiet
      : notice?.kind === "api"
        ? copy.apiError(notice.status)
        : null;

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

      {recorder.isRecording ? (
        <RecordingStatus
          label={copy.listening}
          elapsed={recorder.elapsed}
          stream={recorder.stream}
        />
      ) : null}

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

function formatSeconds(seconds: number) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function RecordingStatus({
  label,
  elapsed,
  stream,
}: {
  label: string;
  elapsed: number;
  stream: MediaStream | null;
}) {
  return (
    <div className="space-y-2 border border-white/10 bg-black p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-white/70">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full bg-white motion-safe:animate-pulse"
          />
          {label}
        </span>
        <span className="font-semibold tabular-nums text-white">
          {formatSeconds(elapsed)}
          <span className="text-white/40"> / {formatSeconds(maxRecordingSeconds)}</span>
        </span>
      </div>
      {stream ? <LevelMeter stream={stream} /> : null}
    </div>
  );
}

const meterWeights = [0.45, 0.75, 1, 0.75, 0.45];

/**
 * 5-bar mic level meter for the live recording stream. Reads volume (RMS)
 * through an AnalyserNode and sets bar heights via refs to avoid re-renders.
 * Purely visual; the stream itself is owned and stopped by the recorder.
 */
function LevelMeter({ stream }: { stream: MediaStream }) {
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const audioContext = createAudioContext();
    if (!audioContext) return;

    let frameId = 0;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    // iOS Safari may create the context suspended outside a tap.
    void audioContext.resume().catch(() => {});

    const samples = new Uint8Array(analyser.fftSize);
    let smoothed = 0;

    const tick = (time: number) => {
      analyser.getByteTimeDomainData(samples);

      let sumSquares = 0;
      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        sumSquares += normalized * normalized;
      }

      const level = Math.min(1, Math.sqrt(sumSquares / samples.length) * 6);
      // fast attack, slow release so the bars feel natural
      smoothed =
        level > smoothed
          ? smoothed * 0.4 + level * 0.6
          : smoothed * 0.9 + level * 0.1;

      barRefs.current.forEach((bar, index) => {
        if (!bar) return;
        const wobble = 0.85 + 0.15 * Math.sin(time / 90 + index * 1.7);
        const scale = Math.min(1, 0.12 + smoothed * meterWeights[index] * wobble);
        bar.style.transform = `scaleY(${scale})`;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      source.disconnect();
      void audioContext.close();
    };
  }, [stream]);

  return (
    <div
      aria-hidden="true"
      className="flex h-10 items-center justify-center gap-1.5 border border-white/10 bg-white/[0.02]"
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

function PlaybackButton({ url, copy }: { url: string; copy: PanelCopy }) {
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

function CheckingIndicator({ label }: { label: string }) {
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

/** The server's IPA may already be wrapped in slashes; show exactly one pair. */
function formatIpa(ipa: string) {
  return `/${ipa.trim().replace(/^\/+|\/+$/g, "")}/`;
}

function isPerfect(word: PronunciationWord | undefined) {
  return word !== undefined && word.score >= 100;
}

function findWord(words: PronunciationWord[], text: string) {
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

      <ResultSection title={copy.ipa}>
        <dl className="grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-white/50">{copy.shouldBe}</dt>
          <dd className="break-words font-mono font-semibold text-white">
            {formatIpa(result.expected.ipa)}
          </dd>
          <dt className="text-white/50">{copy.youSaid}</dt>
          <dd className="break-words font-mono font-semibold text-white">
            {formatIpa(result.heard.ipa)}
          </dd>
        </dl>
      </ResultSection>

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
function ScoreRing({
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

  return (
    <div className="grid gap-3 border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-2">
      <div className="flex items-center gap-3 sm:col-span-2">
        <p className="text-xl font-semibold text-white">{word.word}</p>
        <ScoreTag score={word.score} color={grade.color} />
      </div>
      <div>
        <p className={labelClassName}>{copy.sayItLike}</p>
        <p className="mt-1 text-lg font-semibold text-white">{word.soundsLike}</p>
        <p className="font-mono text-sm text-white/50">{formatIpa(word.ipa)}</p>
      </div>
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

function IssueItem({
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
