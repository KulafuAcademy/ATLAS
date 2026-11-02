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
import { countPassedTries, READY_MS, TRY_COUNT } from "@/lib/guidedWordSession";
import type { SessionOutcome } from "@/lib/guidedWordSession";
import type { Language } from "@/lib/i18n";
import type { AnalyzeWordSuccess } from "@/lib/pronunciationApi";

import {
  AssessmentResults,
  CheckingIndicator,
  panelCopy,
  PlaybackButton,
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
    best: (tryNumber: number) => `Your best was try ${tryNumber}!`,
    passed: (count: number, total: number) => `You got ${count}/${total}!`,
    nonePassed: "Keep going, you can do it!",
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
    best: (tryNumber: number) => `いちばん よかったのは ${tryNumber}かいめ！`,
    passed: (count: number, total: number) => `${count}/${total} できたよ！`,
    nonePassed: "つぎは きっと できるよ！",
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

// Two calm tones of one hue and one bright accent. Only SPEAK is bright, and
// the tones also differ in lightness, so they read without colour vision.
const phaseStyles = {
  ready: { backgroundColor: "#22303f", color: "#ffffff" },
  speak: { backgroundColor: "#facc15", color: "#000000" },
  rest: { backgroundColor: "#121a22", color: "#ffffff" },
};

const bigPrimaryClassName =
  "inline-flex min-h-16 w-full items-center justify-center gap-2 border border-white bg-white px-6 text-2xl font-bold text-black transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/40 disabled:hover:bg-white/10";

const bigSecondaryClassName =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 border border-white/20 bg-black px-6 text-lg font-semibold text-white transition hover:border-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50";

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
 * The guided "say it 3 times" flow for a single word, in a modal. Render it
 * with a target from the child's tap. Closing it (×, Esc) stops everything.
 * See docs/pronunciation-assessment.md.
 */
export function GuidedWordModal({
  target,
  onClose,
  onResult,
}: {
  target: GuidedWordTarget | null;
  onClose: () => void;
  onResult?: (result: AnalyzeWordSuccess) => void;
}) {
  const copy = useGuidedCopy();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  // A stray tap beside the panel mustn't end a session that's running.
  const runningRef = useRef(false);
  const isOpen = target !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Keep the page behind the modal from scrolling.
  useEffect(() => {
    if (!isOpen) return;

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";

    return () => {
      root.style.overflow = previous;
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={copy.title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (isOpen) onClose();
      }}
      onClick={(event) => {
        // A click on the dialog itself (not its content) is on the backdrop.
        if (event.target === event.currentTarget && !runningRef.current) {
          onClose();
        }
      }}
      className="m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-xl overflow-y-auto border border-white/10 bg-black p-0 text-white backdrop:bg-black/80"
    >
      {target ? (
        <GuidedWordFlow
          key={target.word}
          target={target}
          onClose={onClose}
          onResult={onResult}
          runningRef={runningRef}
        />
      ) : null}
    </dialog>
  );
}

function GuidedWordFlow({
  target,
  onClose,
  onResult,
  runningRef,
}: {
  target: GuidedWordTarget;
  onClose: () => void;
  onResult?: (result: AnalyzeWordSuccess) => void;
  runningRef: { current: boolean };
}) {
  const copy = useGuidedCopy();
  const { session, state, micStream } = useGuidedWordSession(target.word);
  const play = useRecordedAudio();
  const onResultRef = useRef(onResult);
  const { phase, outcome } = state;
  const isGuiding = phase === "ready" || phase === "speak" || phase === "rest";

  useEffect(() => {
    onResultRef.current = onResult;
    runningRef.current = isGuiding || phase === "uploading" || state.requestingMic;
  });

  useEffect(() => {
    if (outcome?.kind !== "success") return;

    const { letter } = outcome.response.grade;

    // No error sound here: a child who tried three times has done well.
    if (letter === "A" || letter === "B") playCorrectSound();
    onResultRef.current?.(outcome.response);
  }, [outcome]);

  function listen() {
    play(target.audioPath, target.word);
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-white">{copy.title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close}
          className="grid h-12 w-12 place-items-center border border-white/10 text-white/70 transition hover:border-white/35 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            ×
          </span>
        </button>
      </div>

      {phase === "idle" ? (
        <IntroScreen
          word={target.word}
          requestingMic={state.requestingMic}
          micError={state.micError}
          onListen={listen}
          onStart={session.start}
        />
      ) : null}

      {isGuiding && state.tryNumber !== null ? (
        <GuidedPanel
          phase={phase}
          word={target.word}
          tryNumber={state.tryNumber}
          doneTries={state.doneTries}
          speakMs={session.speakMs}
          micStream={micStream}
        />
      ) : null}

      {phase === "uploading" ? (
        <div className="space-y-5 border border-white/10 p-6 text-center">
          <p className="break-words text-4xl font-bold">{target.word}</p>
          <ProgressDots doneTries={TRY_COUNT} className="justify-center" />
          <CheckingIndicator label={copy.checking} />
        </div>
      ) : null}

      {isGuiding || phase === "uploading" ? (
        <button
          type="button"
          onClick={session.cancel}
          className={bigSecondaryClassName}
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
    </div>
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
    <div className="space-y-5">
      <div className="space-y-5 border border-white/10 bg-white/[0.02] p-6 text-center">
        <p className="break-words text-5xl font-bold sm:text-7xl">{word}</p>
        <button
          type="button"
          onClick={onListen}
          disabled={requestingMic}
          className={bigSecondaryClassName}
        >
          <SpeakerIcon className="h-6 w-6 shrink-0 text-white/60" />
          {copy.listen}
        </button>
        <p className="text-xl font-semibold text-white">{copy.hint}</p>
        <ProgressDots doneTries={0} className="justify-center" />
      </div>

      {micError ? (
        <p
          role="alert"
          className="border border-white/30 bg-white/[0.04] p-4 text-lg leading-8 text-white"
        >
          {copy.micErrors[micError]}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onStart}
        disabled={requestingMic}
        className={bigPrimaryClassName}
      >
        {requestingMic ? copy.startingMic : copy.start}
      </button>
    </div>
  );
}

/**
 * One try's GET READY, SPEAK or REST. They differ by colour, by the
 * character (and its ring) and by text.
 */
function GuidedPanel({
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
  const reducedMotion = useReducedMotion();
  const label =
    phase === "ready" ? copy.ready : phase === "speak" ? copy.speak : copy.rest;

  return (
    <div
      data-phase={phase}
      className="flex min-h-[26rem] flex-col items-center justify-between gap-4 p-5 text-center sm:p-6"
      style={phaseStyles[phase]}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <p className="text-2xl font-bold">{copy.tryLabel(tryNumber)}</p>
        <ProgressDots doneTries={doneTries} current={tryNumber} />
      </div>

      <div className="relative h-36 w-36 sm:h-44 sm:w-44">
        <Character
          key={`${phase}-${tryNumber}`}
          phase={phase}
          speakMs={speakMs}
          animate={!reducedMotion}
        />
      </div>

      <div className="w-full space-y-3">
        {phase === "rest" ? null : (
          <SecondsLeft
            key={`${phase}-${tryNumber}`}
            durationMs={phase === "speak" ? speakMs : READY_MS}
          />
        )}
        <p
          role="status"
          aria-live="assertive"
          className="text-3xl font-bold [word-break:keep-all] sm:text-4xl"
        >
          {label}
        </p>
        {phase === "rest" ? null : (
          <p
            className={`break-words font-bold ${
              phase === "speak" ? "text-5xl sm:text-7xl" : "text-4xl"
            }`}
          >
            {word}
          </p>
        )}
        {phase === "ready" ? (
          <p className="text-xl font-semibold">{copy.hint}</p>
        ) : null}
        {phase === "speak" && micStream ? (
          <LevelMeter stream={micStream} onBright />
        ) : null}
      </div>
    </div>
  );
}

/**
 * A face that needs no reading: a closed mouth to get ready, a wide-open
 * mouth with an emptying ring to speak, and closed eyes with "Zz" to rest.
 */
function Character({
  phase,
  speakMs,
  animate,
}: {
  phase: "ready" | "speak" | "rest";
  speakMs: number;
  animate: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      {phase === "speak" ? (
        <circle
          cx="50"
          cy="50"
          r="46"
          strokeWidth="7"
          pathLength="100"
          strokeDasharray="100"
          transform="rotate(-90 50 50)"
          style={
            animate
              ? { animation: `guided-ring-empty ${speakMs}ms linear forwards` }
              : undefined
          }
        />
      ) : null}
      {phase === "ready" ? (
        <circle cx="50" cy="50" r="46" strokeWidth="2" strokeDasharray="3 6" />
      ) : null}

      <circle cx="50" cy="50" r="34" strokeWidth="3" />

      {phase === "rest" ? (
        <>
          <path d="M34 43q5 5 10 0M56 43q5 5 10 0" strokeWidth="3" />
          <path d="M43 62q7 5 14 0" strokeWidth="3" />
          <path d="M80 12h10l-10 12h10" strokeWidth="3" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <circle cx="39" cy="42" r="3.5" fill="currentColor" stroke="none" />
          <circle cx="61" cy="42" r="3.5" fill="currentColor" stroke="none" />
        </>
      )}
      {phase === "ready" ? <path d="M42 62h16" strokeWidth="3" /> : null}
      {phase === "speak" ? (
        <ellipse cx="50" cy="63" rx="12" ry="13" fill="currentColor" stroke="none" />
      ) : null}
    </svg>
  );
}

// The seconds left in a phase. With reduced motion, it replaces the ring's animation.
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
    <p aria-hidden="true" className="text-5xl font-bold tabular-nums">
      {Math.ceil(remainingMs / 1000)}
    </p>
  );
}

/**
 * One numbered dot per try. Done is filled (never a tick: it says the try is
 * over, not that it was right), the current one has a thick outline, and the
 * best one gets a star.
 */
function ProgressDots({
  doneTries,
  current,
  best,
  className = "",
}: {
  doneTries: number;
  current?: number;
  best?: number;
  className?: string;
}) {
  const copy = useGuidedCopy();

  return (
    <ol className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: TRY_COUNT }, (_, index) => {
        const tryNumber = index + 1;
        const isDone = tryNumber <= doneTries;
        const isBest = tryNumber === best;
        const isCurrent = tryNumber === current && !isDone;

        return (
          <li
            key={tryNumber}
            aria-label={copy.tryLabel(tryNumber)}
            aria-current={isCurrent ? "step" : undefined}
            className={`grid place-items-center rounded-full border-current font-bold ${
              isBest ? "h-14 w-14 border-4 text-2xl" : "h-10 w-10 text-lg"
            } ${isCurrent ? "border-4" : "border"} ${isDone || isCurrent ? "" : "opacity-70"}`}
          >
            {/* Filled with the text colour, so it follows the panel behind it. */}
            {isBest ? (
              <span aria-hidden="true">★</span>
            ) : isDone ? (
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
  const again = (
    <button type="button" onClick={onAgain} className={bigPrimaryClassName}>
      {copy.again}
    </button>
  );

  if (outcome.kind === "success") {
    const passedTries = countPassedTries(outcome.response.attempts);

    return (
      <div className="space-y-5">
        <div aria-live="polite" className="space-y-4 text-center">
          <p className="text-2xl font-bold leading-9 text-white [word-break:keep-all]">
            {copy.best(outcome.bestTry)}
          </p>
          <p className="text-xl font-semibold text-white [word-break:keep-all]">
            {/* No "0/3": that would only discourage a child who tried. */}
            {passedTries > 0
              ? copy.passed(passedTries, TRY_COUNT)
              : copy.nonePassed}
          </p>
          <ProgressDots
            doneTries={TRY_COUNT}
            best={outcome.bestTry}
            className="justify-center"
          />
        </div>

        <AssessmentResults
          result={outcome.response}
          target={null}
          copy={resultCopy[language]}
          language={language}
        />

        {outcome.bestClip ? (
          <div className="grid">
            <BestClipPlayback blob={outcome.bestClip.blob} />
          </div>
        ) : null}
        {again}
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
    <div className="space-y-5">
      <div className="space-y-4 border border-white/10 bg-white/[0.02] p-6 text-center">
        <p className="break-words text-4xl font-bold">{word}</p>
        <p role="status" aria-live="polite" className="text-xl font-semibold leading-9">
          {message}
        </p>
      </div>
      {canResend ? (
        <>
          <button type="button" onClick={onResend} className={bigPrimaryClassName}>
            {copy.resend}
          </button>
          <button type="button" onClick={onAgain} className={bigSecondaryClassName}>
            {copy.again}
          </button>
        </>
      ) : (
        again
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

  return url ? <PlaybackButton key={url} url={url} copy={resultCopy[language]} /> : null;
}
