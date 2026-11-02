"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
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
import type { GuidedWordState } from "./useGuidedWordSession";
import type { RecorderError } from "./useVoiceRecorder";

const guidedCopy = {
  en: {
    title: "Say it 3 times",
    sayThis: "Say this",
    close: "Close",
    startingMic: "Getting the microphone ready…",
    hint: "Say it slowly and clearly",
    tryLabel: (tryNumber: number) => `Try ${tryNumber}`,
    ready: "Get ready…",
    speak: "Say it now!",
    restNext: "Prepare for the next try",
    restLast: "All done! Let's see how you did",
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
        "We need your microphone to hear you! Allow the microphone in your browser settings, then press Try again. Ask a grown-up if you need help.",
      noMicrophone: "We couldn't find a microphone. Plug one in and press Try again.",
      failed: "The microphone didn't start. Please press Try again.",
    } satisfies Record<RecorderError, string>,
  },
  // Hiragana, with only grade 1-2 kanji.
  ja: {
    title: "3かい 言って みよう",
    sayThis: "これを 言おう",
    close: "とじる",
    startingMic: "マイクを じゅんび中…",
    hint: "ゆっくり、はっきり 言おう",
    tryLabel: (tryNumber: number) => `${tryNumber}かいめ`,
    ready: "じゅんび…",
    speak: "いま 言って！",
    restNext: "つぎの じゅんびを しよう",
    restLast: "ぜんぶ おわり！けっかを 見よう",
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
    title: "けっか",
    target: (target: string) => `ことば：「${target}」`,
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

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia(reducedMotionQuery).matches ? "auto" : "smooth";
}

/**
 * The guided "say it 3 times" flow for a single word, in the page: the word
 * to say and the three tries. GuidedWordResults takes over once they're done.
 * See docs/pronunciation-assessment.md.
 */
export function GuidedWordPanel({
  guided,
  className = "",
}: {
  guided: GuidedWordState;
  className?: string;
}) {
  const copy = useGuidedCopy();
  const panelRef = useRef<HTMLElement | null>(null);
  const { target, session, state, micStream } = guided;
  const { phase } = state;
  const isGuiding = phase === "ready" || phase === "speak" || phase === "rest";
  // A cancelled session (the page was hidden) is idle with nothing to show.
  const isOpen =
    target !== null &&
    phase !== "result" &&
    (phase !== "idle" || state.requestingMic || state.micError !== null);

  // Keep the word in the middle of the screen, on each opening and each retry.
  useEffect(() => {
    if (!isOpen) return;

    panelRef.current?.scrollIntoView({
      behavior: scrollBehavior(),
      block: "center",
    });
  }, [isOpen, target]);

  if (!target || !session || !isOpen) return null;

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
          onClick={guided.close}
          aria-label={copy.close}
          className="grid h-11 w-11 place-items-center border border-white/10 text-white/70 transition hover:border-white/35 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            ×
          </span>
        </button>
      </div>

      {phase === "uploading" ? null : (
        <WordCard word={target.word} dimmed={phase === "rest"} />
      )}

      {phase === "idle" ? (
        <MicStatus
          requestingMic={state.requestingMic}
          micError={state.micError}
          onRetry={session.start}
        />
      ) : null}

      {isGuiding && state.tryNumber !== null ? (
        <GuidedBox
          phase={phase}
          tryNumber={state.tryNumber}
          doneTries={state.doneTries}
          speakMs={session.speakMs}
          micStream={micStream}
        />
      ) : null}

      {phase === "uploading" ? (
        <div className={`space-y-4 p-5 ${panelBoxClassName}`}>
          <ProgressDots doneTries={TRY_COUNT} className="justify-center text-white" />
          <CheckingIndicator label={copy.checking} />
        </div>
      ) : null}

      {isGuiding || phase === "uploading" ? (
        <button
          type="button"
          onClick={guided.close}
          className={`${secondaryButtonClassName} w-full`}
        >
          {copy.cancel}
        </button>
      ) : null}
    </section>
  );
}

// The word to read. It fades during REST, when there's nothing to say.
function WordCard({ word, dimmed }: { word: string; dimmed: boolean }) {
  const copy = useGuidedCopy();

  return (
    <div
      className={`border px-4 py-5 text-center transition-opacity duration-300 ${
        dimmed ? "border-white/20 opacity-30" : "border-white bg-white/[0.06]"
      }`}
    >
      <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-white motion-safe:animate-pulse"
        />
        {copy.sayThis}
      </p>
      <p className="mt-2 break-words text-5xl font-semibold text-white md:text-6xl">
        {word}
      </p>
    </div>
  );
}

// Before the first try: waiting for the mic, or why it can't be used.
function MicStatus({
  requestingMic,
  micError,
  onRetry,
}: {
  requestingMic: boolean;
  micError: RecorderError | null;
  onRetry: () => void;
}) {
  const copy = useGuidedCopy();

  if (requestingMic || !micError) {
    return (
      <p role="status" className="text-center text-lg font-semibold text-white">
        {copy.startingMic}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p
        role="alert"
        className="border border-white/20 bg-white/[0.04] px-3 py-2 text-base font-medium leading-7 text-white"
      >
        {copy.micErrors[micError]}
      </p>
      <button type="button" onClick={onRetry} className={bigPrimaryClassName}>
        {copy.again}
      </button>
    </div>
  );
}

/** One try's GET READY, SPEAK or REST. */
function GuidedBox({
  phase,
  tryNumber,
  doneTries,
  speakMs,
  micStream,
}: {
  phase: "ready" | "speak" | "rest";
  tryNumber: number;
  doneTries: number;
  speakMs: number;
  micStream: MediaStream | null;
}) {
  const copy = useGuidedCopy();
  const label =
    phase === "ready"
      ? copy.ready
      : phase === "speak"
        ? copy.speak
        : tryNumber < TRY_COUNT
          ? copy.restNext
          : copy.restLast;

  return (
    <div
      data-phase={phase}
      className={`flex min-h-[17rem] flex-col items-center justify-center gap-3 p-4 text-center ${phaseClassNames[phase]}`}
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

/**
 * The outcome of the three tries, in its own section so the page can place it
 * under the step instead of inside it. Renders nothing until there is one.
 */
export function GuidedWordResults({
  guided,
  className = "",
}: {
  guided: GuidedWordState;
  className?: string;
}) {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { target, session, state } = guided;
  const { outcome } = state;
  const isShown = state.phase === "result" && outcome !== null;

  useEffect(() => {
    if (!isShown) return;

    sectionRef.current?.scrollIntoView({
      behavior: scrollBehavior(),
      block: "start",
    });
  }, [isShown]);

  useEffect(() => {
    if (outcome?.kind !== "success") return;

    const { letter } = outcome.response.grade;

    // No error sound here: a child who tried three times has done well.
    if (letter === "A" || letter === "B") playCorrectSound();
  }, [outcome]);

  if (!target || !session || !isShown) return null;

  const copy = resultCopy[language];

  return (
    <section
      ref={sectionRef}
      data-guided-results
      aria-label={copy.title}
      className={`scroll-mt-28 border border-white/10 bg-white/[0.02] ${className}`}
    >
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
          {copy.title}
        </p>
      </div>
      <div className="p-5">
        <ResultContent
          word={target.word}
          outcome={outcome}
          onAgain={session.start}
          onResend={session.resend}
        />
      </div>
    </section>
  );
}

function ResultContent({
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
            target={word}
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
      <div className="space-y-3 text-center">
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
