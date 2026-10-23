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
import {
  excellentColor,
  gradeByLetter,
  gradeFor,
} from "@/lib/pronunciationGrades";

import type { PronunciationAssessmentState } from "./usePronunciationAssessment";
import type { ServerStatus } from "./useServerStatus";
import { maxRecordingSeconds } from "./useVoiceRecorder";
import type { RecorderError } from "./useVoiceRecorder";

const panelCopy = {
  en: {
    title: "AI pronunciation check",
    empty:
      "Press a “Say …” button. Your score and tips will show up here.",
    youSaid: "Practicing",
    listening: "Listening…",
    listen: "Listen to me",
    stopListening: "Stop",
    checking: "Checking… this can take a few seconds.",
    yourScore: "Your score",
    grade: "Grade",
    allCorrect: "Every word was right! Amazing!",
    tapWord: "Tap a word to see how it should sound.",
    sayItLike: "Say it like",
    weHeard: "We heard",
    notHeard: "We didn't hear this word. Try saying it a little louder!",
    issues: "Sounds to practice",
    tip: "Tip",
    coach: "Coach says",
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
    title: "AI発音チェック",
    empty: "「〜を発音する」ボタンを押すと、ここにスコアとコツが表示されます。",
    youSaid: "練習中",
    listening: "聞いています…",
    listen: "自分の声を聞く",
    stopListening: "とめる",
    checking: "チェック中… 数秒かかることがあります。",
    yourScore: "スコア",
    grade: "評価",
    allCorrect: "全部の単語が言えました！すごい！",
    tapWord: "単語をタップすると、正しい音が見られます。",
    sayItLike: "こう言おう",
    weHeard: "聞こえた音",
    notHeard: "この単語は聞こえませんでした。もう少し大きな声で言ってみよう！",
    issues: "練習したい音",
    tip: "コツ",
    coach: "コーチより",
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
      className="space-y-4 border border-white/10 bg-white/[0.02] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{copy.title}</p>
        <ServerStatusBadge status={assessment.serverStatus} copy={copy} />
      </div>

      {target ? (
        <div className="border border-white/10 bg-black px-4 py-3">
          <p className={labelClassName}>{copy.youSaid}</p>
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

function AssessmentResults({
  result,
  copy,
  language,
}: {
  result: AnalyzeSuccess;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 border border-white/10 bg-black p-4 sm:p-5">
        <div>
          <p className={labelClassName}>{copy.yourScore}</p>
          <p
            className="mt-1 text-6xl font-bold leading-none tabular-nums"
            style={{ color: result.grade.color }}
          >
            {result.score}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p
            className="text-right text-lg font-semibold"
            style={{ color: result.grade.color }}
          >
            {verdict}
          </p>
          <span
            className="grid h-16 w-16 shrink-0 place-items-center border-2 text-3xl font-bold"
            style={{ borderColor: result.grade.color, color: result.grade.color }}
            aria-label={`${copy.grade} ${result.grade.letter}`}
          >
            {result.grade.letter}
          </span>
        </div>
      </div>

      {result.allWordsCorrect ? <Celebration label={copy.allCorrect} /> : null}

      <div className="space-y-3 border border-white/10 bg-black p-4">
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
      </div>

      {result.issues.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">{copy.issues}</p>
          <ul className="space-y-2">
            {result.issues.map((issue, index) => (
              <IssueItem
                key={`${issue.word}-${index}`}
                issue={issue}
                words={result.words}
                copy={copy}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {result.feedback ? (
        <CoachBubble label={copy.coach}>{result.feedback}</CoachBubble>
      ) : null}
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
        <p className="font-mono text-sm text-white/50">/{word.ipa}/</p>
      </div>
      <div>
        <p className={labelClassName}>{copy.weHeard}</p>
        {word.heardIpa ? (
          <p className="mt-1 font-mono text-lg text-white">/{word.heardIpa}/</p>
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

function CoachBubble({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white bg-white text-black"
      >
        <CoachIcon />
      </span>
      <div className="flex-1 border border-white/20 bg-white/[0.04] p-3 sm:p-4">
        <p className={labelClassName}>{label}</p>
        <p className="mt-1 text-base leading-7 text-white">{children}</p>
      </div>
    </div>
  );
}

function Celebration({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 border-2 px-3 py-3 text-center"
      style={{ borderColor: excellentColor }}
    >
      {[0, 120, 240].map((delay) => (
        <span
          key={delay}
          aria-hidden="true"
          className="text-xl motion-safe:animate-bounce"
          style={{ color: excellentColor, animationDelay: `${delay}ms` }}
        >
          ★
        </span>
      ))}
      <p className="font-semibold" style={{ color: excellentColor }}>
        {label}
      </p>
    </div>
  );
}

function CoachIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" />
    </svg>
  );
}
