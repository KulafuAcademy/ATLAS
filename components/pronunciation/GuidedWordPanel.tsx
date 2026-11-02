"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import { useRecordedAudio } from "@/components/training/audio";
import { playCorrectSound } from "@/components/training/feedbackSounds";
import { READY_MS, TRY_COUNT } from "@/lib/guidedWordSession";
import type { SessionOutcome } from "@/lib/guidedWordSession";
import type { Language } from "@/lib/i18n";

import {
  AssessmentResults,
  CheckingIndicator,
  labelClassName,
  panelCopy,
  PlaybackButton,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "./PronunciationPanel";
import type { PanelCopy } from "./PronunciationPanel";
import { LevelMeter } from "./LevelMeter";
import { useGuidedWordSession } from "./useGuidedWordSession";
import type { RecorderError } from "./useVoiceRecorder";

const guidedCopy = {
  en: {
    title: "Say it 3 times",
    close: "Close",
    start: "Start",
    startingMic: "Getting the microphone ready…",
    listen: "Listen",
    hint: "Say it slowly and clearly",
    tryLabel: (tryNumber: number) => `Try ${tryNumber}`,
    ready: "Get ready…",
    speak: "Say it now!",
    rest: "Done! Take a rest",
    checking: "Listening to your tries… just a moment",
    cancel: "Stop",
    again: "Try again",
    rejected: "We couldn't hear you. Try saying it a little louder!",
    resend: "Send again",
    resendMessage: "We couldn't send your voice. It's still saved, so let's send it again!",
    failedMessage: "Something went wrong. Let's say it again!",
    apiKeyMessage: "This isn't working right now. Please tell your teacher.",
    micErrors: {
      insecure: "The microphone can't be used on this page. Please ask a grown-up.",
      unsupported: "This browser can't record sound. Please ask a grown-up.",
      denied:
        "We need your microphone to hear you! Allow the microphone in your browser settings, then press Start again. Ask a grown-up if you need help.",
      noMicrophone: "We couldn't find a microphone. Plug one in and press Start again.",
      failed: "The microphone didn't start. Please press Start again.",
    } satisfies Record<RecorderError, string>,
  },
  // Hiragana, with only grade 1-2 kanji.
  ja: {
    title: "3かい 言って みよう",
    close: "とじる",
    start: "はじめる",
    startingMic: "マイクを じゅんび中…",
    listen: "お手本を 聞く",
    hint: "ゆっくり、はっきり 言おう",
    tryLabel: (tryNumber: number) => `${tryNumber}かいめ`,
    ready: "じゅんび…",
    speak: "いま 言って！",
    rest: "おわり！ひとやすみ",
    checking: "きいているよ… ちょっと まってね",
    cancel: "やめる",
    again: "もう いちど",
    rejected: "きこえなかったよ。もう すこし 大きな こえで 言って みよう！",
    resend: "もう いちど おくる",
    resendMessage: "おくれなかったよ。あなたの こえは のこって いるから、もう いちど おくって みよう！",
    failedMessage: "うまく いかなかったよ。もう いちど 言って みよう！",
    apiKeyMessage: "うまく うごいて いないよ。せんせいに つたえてね。",
    micErrors: {
      insecure: "この ページでは マイクが つかえないよ。おとなの人に 聞いてみてね。",
      unsupported: "この ブラウザでは ろくおん できないよ。おとなの人に 聞いてみてね。",
      denied:
        "こえを 聞くには マイクが ひつようだよ。ブラウザの せっていで マイクを「きょか」に してから、もう いちど おしてね。わからない ときは、おとなの人に 聞いてみてね。",
      noMicrophone: "マイクが 見つからないよ。マイクを つないで、もう いちど おしてね。",
      failed: "マイクが うごかなかったよ。もう いちど おしてね。",
    } satisfies Record<RecorderError, string>,
  },
};

// The result UI is shared, so only the words children see here are swapped.
const resultCopy: Record<Language, PanelCopy> = {
  en: panelCopy.en,
  ja: {
    ...panelCopy.ja,
    listen: "じぶんの こえを 聞く",
    aiAssessment: "ATLASから",
    wordByWord: "ことば",
    tapWord: "ことばを おすと、正しい 音が 見られるよ。",
    notHeard: "この ことばは 聞こえなかったよ。もう すこし 大きな こえで 言って みよう！",
    shouldBe: "正しい 音",
    youSaid: "あなたの 音",
    ipaHint: "上：正しい 音　下：聞こえた 音",
    nothingToFix: "直すところは ないよ。ふつうの はやさでも 言って みよう。",
  },
};

function useGuidedCopy() {
  const { language } = useLanguage();

  return guidedCopy[language];
}

const panelBoxClassName = "border border-white/10 bg-white/[0.02]";

const bigPrimaryClassName =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 border border-white bg-white px-4 text-lg font-bold text-black transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/40 disabled:hover:bg-white/10";

// Each phase differs by more than colour: the box, the face and the text too.
const phaseClassNames = {
  ready: `${panelBoxClassName} text-white`,
  speak: "border border-white bg-white text-black",
  rest: "border border-dashed border-white/30 bg-black text-white/80",
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);

  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}

export type GuidedWordTarget = {
  word: string;
  /** Recorded model pronunciation; falls back to speech synthesis. */
  audioPath: string;
};

/**
 * The guided "say it 3 times" flow for a single word, in the page. Removing it
 * (×, or unmounting) stops everything. While `onRunningChange` reports true,
 * the page must keep other audio from being started, so that it can't end up
 * in a recording. See docs/pronunciation-assessment.md.
 */
export function GuidedWordPanel({
  target,
  onClose,
  onRunningChange,
  className = "",
}: {
  target: GuidedWordTarget;
  onClose: () => void;
  onRunningChange?: (running: boolean) => void;
  className?: string;
}) {
  return (
    <GuidedWordFlow
      key={target.word}
      target={target}
      onClose={onClose}
      onRunningChange={onRunningChange}
      className={className}
    />
  );
}

function GuidedWordFlow({
  target,
  onClose,
  onRunningChange,
  className,
}: {
  target: GuidedWordTarget;
  onClose: () => void;
  onRunningChange?: (running: boolean) => void;
  className: string;
}) {
  const copy = useGuidedCopy();
  const { session, state, micStream } = useGuidedWordSession(target.word);
  const play = useRecordedAudio();
  const panelRef = useRef<HTMLElement | null>(null);
  const onRunningChangeRef = useRef(onRunningChange);
  const { phase, outcome } = state;
  const isGuiding = phase === "ready" || phase === "speak" || phase === "rest";
  const isRunning = isGuiding || phase === "uploading" || state.requestingMic;
  const view = phase === "idle" ? "intro" : phase === "result" ? "result" : "guiding";

  useEffect(() => {
    onRunningChangeRef.current = onRunningChange;
  });

  useEffect(() => {
    onRunningChangeRef.current?.(isRunning);
  }, [isRunning]);

  useEffect(() => () => onRunningChangeRef.current?.(false), []);

  // There's no modal to bring this to the child's attention.
  useEffect(() => {
    panelRef.current?.scrollIntoView({
      behavior: window.matchMedia(reducedMotionQuery).matches ? "auto" : "smooth",
      block: view === "result" ? "start" : "center",
    });
  }, [view]);

  useEffect(() => {
    if (outcome?.kind !== "success") return;

    const { letter } = outcome.response.grade;

    // No error sound here: a child who tried three times has done well.
    if (letter === "A" || letter === "B") playCorrectSound();
  }, [outcome]);

  return (
    <section
      ref={panelRef}
      data-guided-word
      aria-label={copy.title}
      className={`scroll-mt-28 space-y-4 border border-white/10 bg-black p-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={labelClassName}>{copy.title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close}
          className="grid h-11 w-11 place-items-center border border-white/10 text-white/70 transition hover:border-white/35 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            ×
          </span>
        </button>
      </div>

      {phase === "idle" ? (
        <IntroScreen
          word={target.word}
          requestingMic={state.requestingMic}
          micError={state.micError}
          onListen={() => play(target.audioPath, target.word)}
          onStart={session.start}
        />
      ) : null}

      {isGuiding && state.tryNumber !== null ? (
        <GuidedBox
          phase={phase}
          word={target.word}
          tryNumber={state.tryNumber}
          doneTries={state.doneTries}
          speakMs={session.speakMs}
          micStream={micStream}
        />
      ) : null}

      {phase === "uploading" ? (
        <div className={`space-y-4 p-5 text-center ${panelBoxClassName}`}>
          <p className="break-words text-3xl font-bold text-white">{target.word}</p>
          <ProgressDots doneTries={TRY_COUNT} className="justify-center" />
          <CheckingIndicator label={copy.checking} />
        </div>
      ) : null}

      {isGuiding || phase === "uploading" ? (
        <button
          type="button"
          onClick={session.cancel}
          className={`${secondaryButtonClassName} w-full`}
        >
          {copy.cancel}
        </button>
      ) : null}

      {phase === "result" && outcome ? (
        <ResultScreen
          word={target.word}
          outcome={outcome}
          onAgain={session.start}
          onResend={session.resend}
        />
      ) : null}
    </section>
  );
}

function IntroScreen({
  word,
  requestingMic,
  micError,
  onListen,
  onStart,
}: {
  word: string;
  requestingMic: boolean;
  micError: RecorderError | null;
  onListen: () => void;
  onStart: () => void;
}) {
  const copy = useGuidedCopy();

  return (
    <div className="space-y-4">
      <div className={`space-y-4 p-5 text-center ${panelBoxClassName}`}>
        <p className="break-words text-5xl font-bold text-white">{word}</p>
        <p className="text-lg font-semibold text-white">{copy.hint}</p>
        <ProgressDots doneTries={0} className="justify-center" />
      </div>

      {micError ? (
        <p
          role="alert"
          className="border border-white/20 bg-white/[0.04] px-3 py-2 text-base font-medium leading-7 text-white"
        >
          {copy.micErrors[micError]}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onListen}
          disabled={requestingMic}
          className={`${secondaryButtonClassName} min-h-14`}
        >
          <SpeakerIcon className="h-5 w-5 shrink-0 text-white/50" />
          {copy.listen}
        </button>
        <button
          type="button"
          onClick={onStart}
          disabled={requestingMic}
          className={bigPrimaryClassName}
        >
          {requestingMic ? copy.startingMic : copy.start}
        </button>
      </div>
    </div>
  );
}

/** One try's GET READY, SPEAK or REST. */
function GuidedBox({
  phase,
  word,
  tryNumber,
  doneTries,
  speakMs,
  micStream,
}: {
  phase: "ready" | "speak" | "rest";
  word: string;
  tryNumber: number;
  doneTries: number;
  speakMs: number;
  micStream: MediaStream | null;
}) {
  const copy = useGuidedCopy();
  const label =
    phase === "ready" ? copy.ready : phase === "speak" ? copy.speak : copy.rest;

  return (
    <div
      data-phase={phase}
      className={`flex min-h-[21rem] flex-col items-center justify-center gap-3 p-4 text-center ${phaseClassNames[phase]}`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <p className="text-lg font-bold">{copy.tryLabel(tryNumber)}</p>
        <ProgressDots doneTries={doneTries} current={tryNumber} />
      </div>

      <Face phase={phase} />

      {phase === "rest" ? null : (
        <SecondsLeft
          key={`${phase}-${tryNumber}`}
          durationMs={phase === "speak" ? speakMs : READY_MS}
        />
      )}
      <p
        role="status"
        aria-live="assertive"
        className="text-2xl font-bold [word-break:keep-all]"
      >
        {label}
      </p>
      {phase === "rest" ? null : (
        <p
          className={`max-w-full break-words font-bold ${
            phase === "speak" ? "text-5xl" : "text-3xl"
          }`}
        >
          {word}
        </p>
      )}
      {phase === "ready" ? (
        <p className="text-base font-semibold">{copy.hint}</p>
      ) : null}
      {phase === "speak" ? (
        <div className="w-full space-y-2">
          <EmptyingBar key={tryNumber} durationMs={speakMs} />
          {micStream ? <LevelMeter stream={micStream} onBright /> : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A face that needs no reading: a closed mouth to get ready, a wide-open
 * mouth to speak, and closed eyes with "Z" to rest.
 */
function Face({ phase }: { phase: "ready" | "speak" | "rest" }) {
  return (
    <svg
      viewBox="10 5 85 90"
      aria-hidden="true"
      className="h-16 w-16 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <circle cx="50" cy="50" r="34" strokeWidth="4" />

      {phase === "rest" ? (
        <>
          <path d="M34 43q5 5 10 0M56 43q5 5 10 0" strokeWidth="4" />
          <path d="M43 62q7 5 14 0" strokeWidth="4" />
          <path d="M78 10h12l-12 13h12" strokeWidth="4" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <circle cx="39" cy="42" r="4" fill="currentColor" stroke="none" />
          <circle cx="61" cy="42" r="4" fill="currentColor" stroke="none" />
        </>
      )}
      {phase === "ready" ? <path d="M42 62h16" strokeWidth="4" /> : null}
      {phase === "speak" ? (
        <ellipse cx="50" cy="63" rx="12" ry="13" fill="currentColor" stroke="none" />
      ) : null}
    </svg>
  );
}

function SecondsLeft({ durationMs }: { durationMs: number }) {
  const [remainingMs, setRemainingMs] = useState(durationMs);

  useEffect(() => {
    const startedAt = performance.now();
    const intervalId = window.setInterval(() => {
      setRemainingMs(Math.max(0, durationMs - (performance.now() - startedAt)));
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [durationMs]);

  return (
    <p aria-hidden="true" className="text-5xl font-bold leading-none tabular-nums">
      {Math.ceil(remainingMs / 1000)}
    </p>
  );
}

// Shows how long is left. With reduced motion it stays full: the number counts.
function EmptyingBar({ durationMs }: { durationMs: number }) {
  const reducedMotion = useReducedMotion();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setStarted(true));

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div aria-hidden="true" className="h-3 w-full overflow-hidden border border-black/30">
      <div
        data-emptying-bar
        className="h-full bg-black"
        style={
          reducedMotion
            ? undefined
            : {
                width: started ? "0%" : "100%",
                transition: `width ${durationMs}ms linear`,
              }
        }
      />
    </div>
  );
}

/**
 * One numbered dot per try. Done is filled (never a tick: it says the try is
 * over, not that it was right), and the current one has a thick outline.
 */
function ProgressDots({
  doneTries,
  current,
  className = "",
}: {
  doneTries: number;
  current?: number;
  className?: string;
}) {
  const copy = useGuidedCopy();

  return (
    <ol className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: TRY_COUNT }, (_, index) => {
        const tryNumber = index + 1;
        const isDone = tryNumber <= doneTries;
        const isCurrent = tryNumber === current && !isDone;

        return (
          <li
            key={tryNumber}
            aria-label={copy.tryLabel(tryNumber)}
            aria-current={isCurrent ? "step" : undefined}
            className={`grid h-9 w-9 place-items-center rounded-full border-current text-base font-bold ${
              isCurrent ? "border-4" : "border"
            } ${isDone || isCurrent ? "" : "opacity-70"}`}
          >
            {/* Filled with the text colour, so it follows the box behind it. */}
            {isDone ? (
              <span
                aria-hidden="true"
                className="grid h-full w-full place-items-center rounded-full bg-current"
              >
                <span className="mix-blend-difference text-white">{tryNumber}</span>
              </span>
            ) : (
              <span aria-hidden="true">{tryNumber}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ResultScreen({
  word,
  outcome,
  onAgain,
  onResend,
}: {
  word: string;
  outcome: SessionOutcome;
  onAgain: () => void;
  onResend: () => void;
}) {
  const { language } = useLanguage();
  const copy = guidedCopy[language];

  if (outcome.kind === "success") {
    return (
      <div className="space-y-5">
        <div aria-live="polite">
          <AssessmentResults
            result={outcome.response}
            target={null}
            copy={resultCopy[language]}
            language={language}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {outcome.bestClip ? (
            <BestClipPlayback blob={outcome.bestClip.blob} />
          ) : null}
          <button
            type="button"
            onClick={onAgain}
            className={`${primaryButtonClassName} ${
              outcome.bestClip ? "" : "sm:col-span-2"
            }`}
          >
            {copy.again}
          </button>
        </div>
      </div>
    );
  }

  const message =
    outcome.kind === "rejected"
      ? copy.rejected
      : outcome.canResend
        ? copy.resendMessage
        : outcome.status === 401
          ? copy.apiKeyMessage
          : copy.failedMessage;
  const canResend = outcome.kind === "uploadFailed" && outcome.canResend;

  return (
    <div className="space-y-4">
      <div className={`space-y-3 p-5 text-center ${panelBoxClassName}`}>
        <p className="break-words text-3xl font-bold text-white">{word}</p>
        <p
          role="status"
          aria-live="polite"
          className="text-lg font-semibold leading-8 text-white"
        >
          {message}
        </p>
      </div>
      {canResend ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onAgain} className={secondaryButtonClassName}>
            {copy.again}
          </button>
          <button type="button" onClick={onResend} className={primaryButtonClassName}>
            {copy.resend}
          </button>
        </div>
      ) : (
        <button type="button" onClick={onAgain} className={bigPrimaryClassName}>
          {copy.again}
        </button>
      )}
    </div>
  );
}

function BestClipPlayback({ blob }: { blob: Blob }) {
  const { language } = useLanguage();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const nextUrl = URL.createObjectURL(blob);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- tied to the object URL's lifetime
    setUrl(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [blob]);

  return url ? (
    <PlaybackButton key={url} url={url} copy={resultCopy[language]} />
  ) : null;
}
