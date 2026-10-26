"use client";

import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import { useRecordedAudio } from "@/components/training/audio";
import {
  playCorrectSound,
  playCountdownGo,
  playCountdownTick,
  playIncorrectSound,
} from "@/components/training/feedbackSounds";
import { stopPronunciationCheckEvent } from "@/components/training/useSentenceCheck";
import type { Language } from "@/lib/i18n";
import type { AnalyzeSuccess } from "@/lib/pronunciationApi";
import { gradeByLetter } from "@/lib/pronunciationGrades";

import { LevelMeter } from "./LevelMeter";
import {
  assessmentNoticeText,
  CheckingIndicator,
  findWord,
  formatIpa,
  IpaComparison,
  isPerfect,
  labelClassName,
  panelCopy,
  PlaybackButton,
  primaryButtonClassName,
  ScoreRing,
} from "./PronunciationPanel";
import type { PanelCopy } from "./PronunciationPanel";
import { usePronunciationAssessment } from "./usePronunciationAssessment";

const prepareSeconds = 3;
const answerSeconds = 3;

const modalCopy = {
  en: {
    title: "Pronunciation check",
    listenModel: "Listen",
    close: "Close",
    getReady: "Get ready...",
    speakNow: "Speak now",
    secondsLeft: (seconds: number) => `${seconds}s`,
  },
  ja: {
    title: "発音チェック",
    listenModel: "お手本を聞く",
    close: "閉じる",
    getReady: "準備してください...",
    speakNow: "今話してください",
    secondsLeft: (seconds: number) => `${seconds}秒`,
  },
};

type WordTarget = {
  word: string;
  /** Recorded model pronunciation, played by the "Listen" button. */
  audioPath: string;
};

type CountdownState = {
  phase: "prepare" | "answer";
  remaining: number;
} | null;

/**
 * Single-word AI check for the practice page: "Get ready" 3-2-1, record
 * for `answerSeconds`, then send the clip. `start()` must run from the tap
 * so the mic is requested inside the gesture (see usePronunciationAssessment).
 */
export function useWordCheck() {
  const assessment = usePronunciationAssessment();
  const [target, setTarget] = useState<WordTarget | null>(null);
  const [countdown, setCountdown] = useState<CountdownState>(null);
  const timerRef = useRef<number | null>(null);

  function clearCountdown() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
  }

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    },
    [],
  );

  function start(next: WordTarget) {
    window.speechSynthesis?.cancel();
    window.dispatchEvent(new Event(stopPronunciationCheckEvent));
    clearCountdown();
    setTarget(next);

    void assessment.prepare(next.word).then((ready) => {
      if (ready) return;

      clearCountdown();
      playIncorrectSound();
    });

    let phase: "prepare" | "answer" = "prepare";
    let remaining = prepareSeconds;

    setCountdown({ phase, remaining });
    playCountdownTick();

    timerRef.current = window.setInterval(() => {
      remaining -= 1;

      if (remaining > 0) {
        setCountdown({ phase, remaining });
        if (phase === "prepare") playCountdownTick();
        return;
      }

      if (phase === "prepare") {
        phase = "answer";
        remaining = answerSeconds;
        setCountdown({ phase, remaining });
        playCountdownGo();
        assessment.startRecording();
        return;
      }

      clearCountdown();
      assessment.finish((outcome) => {
        const letter = outcome.kind === "result" ? outcome.result.grade.letter : "";

        if (letter === "A" || letter === "B") {
          playCorrectSound();
        } else {
          playIncorrectSound();
        }
      });
    }, 1000);
  }

  /** Closes the check: stops the countdown, the mic and any request. */
  function close() {
    clearCountdown();
    assessment.cancel();
    setTarget(null);
  }

  return { assessment, target, countdown, start, close };
}

export type WordCheckState = ReturnType<typeof useWordCheck>;

/**
 * A simplified version of PronunciationPanel in a modal: countdown, live
 * mic meter, then score, verdict, how the word should sound and one tip.
 */
export function WordAssessmentModal({ check }: { check: WordCheckState }) {
  const { language } = useLanguage();
  const copy = modalCopy[language];
  const resultCopy = panelCopy[language];
  const playModel = useRecordedAudio();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const { assessment, target, countdown } = check;
  const { recorder, result, isChecking } = assessment;
  const isOpen = target !== null;
  const isBusy = countdown !== null || assessment.isBusy;
  const noticeText = assessmentNoticeText(assessment, resultCopy, language);

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
        check.close();
      }}
      onClose={() => {
        if (isOpen) check.close();
      }}
      onClick={(event) => {
        // A click on the dialog itself (not its content) is on the backdrop.
        if (event.target === event.currentTarget) check.close();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto sm:max-w-xl lg:max-w-2xl border border-white/10 bg-black p-0 text-white backdrop:bg-black/80"
    >
      {target ? (
        <div className="space-y-5 p-5 sm:space-y-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
              {copy.title}
            </p>
            <button
              type="button"
              onClick={check.close}
              aria-label={copy.close}
              className="grid h-9 w-9 place-items-center border border-white/10 text-white/70 transition hover:border-white/35 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 border border-white/10 bg-white/[0.02] px-4 py-3">
            <p className="min-w-0 break-words text-3xl font-semibold text-white sm:text-4xl">
              {target.word}
            </p>
            <button
              type="button"
              onClick={() => playModel(target.audioPath, target.word)}
              disabled={isBusy}
              className="inline-flex h-10 shrink-0 items-center gap-2 border border-white/10 bg-black px-3 text-sm font-semibold text-white transition hover:border-white/35 focus:outline-none disabled:cursor-not-allowed disabled:text-white/30 disabled:hover:border-white/10"
            >
              <SpeakerIcon className="h-4 w-4 text-white/50" />
              {copy.listenModel}
            </button>
          </div>

          {countdown?.phase === "prepare" ? (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center justify-center gap-2 border border-white/10 bg-black px-4 py-5"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                {copy.getReady}
              </p>
              <p className="text-5xl font-bold leading-none tabular-nums text-white">
                {countdown.remaining}
              </p>
            </div>
          ) : null}

          {countdown?.phase === "answer" ? (
            <div className="space-y-2">
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
              {recorder.stream ? <LevelMeter stream={recorder.stream} /> : null}
            </div>
          ) : null}

          {isChecking ? <CheckingIndicator label={resultCopy.checking} /> : null}

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
              <WordResult
                result={result}
                word={target.word}
                copy={resultCopy}
                language={language}
              />
            </div>
          ) : null}

          {!isBusy && (result || noticeText || recorder.recording) ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {recorder.recording ? (
                <PlaybackButton
                  key={recorder.recording.url}
                  url={recorder.recording.url}
                  copy={resultCopy}
                />
              ) : null}
              <button
                type="button"
                onClick={() => check.start(target)}
                className={`${primaryButtonClassName} ${
                  recorder.recording ? "" : "sm:col-span-2"
                }`}
              >
                {resultCopy.tryAgain}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}

function WordResult({
  result,
  word,
  copy,
  language,
}: {
  result: AnalyzeSuccess;
  word: string;
  copy: PanelCopy;
  language: Language;
}) {
  const scored = findWord(result.words, word) ?? result.words[0];
  const expectedIpa = scored ? formatIpa(scored.ipa, scored.phonemes) : null;
  const verdict =
    language === "ja"
      ? (gradeByLetter(result.grade.letter)?.verdict.ja ?? result.grade.verdict)
      : result.grade.verdict;
  // Same rule as the full panel: a word that scored 100 has nothing to fix.
  const issue = result.issues.find(
    (item) => !isPerfect(findWord(result.words, item.word)),
  );

  return (
    <div className="space-y-4">
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
          ) : null}
        </div>
      </div>

      {scored?.soundsLike || expectedIpa ? (
        <div className="border border-white/10 bg-white/[0.02] p-3">
          <p className={labelClassName}>{copy.sayItLike}</p>
          {scored?.soundsLike ? (
            <p className="mt-1 text-lg font-semibold text-white">
              {scored.soundsLike}
            </p>
          ) : null}
          {expectedIpa ? (
            <p className="font-mono text-sm text-white/50">{expectedIpa}</p>
          ) : null}
        </div>
      ) : null}

      {/* Correct, different, missing and extra sounds, as in the full panel. */}
      {result.words.some((item) => item.phonemes?.length) ? (
        <div className="space-y-2">
          <p className={labelClassName}>{copy.ipa}</p>
          <IpaComparison
            words={result.words}
            heardPhonemes={result.heard?.phonemes}
            copy={copy}
          />
        </div>
      ) : null}

      {issue ? (
        <div className="space-y-2 border-l-2 border-white/30 pl-3 text-sm leading-6 text-white/70">
          <p>{issue.message}</p>
          {issue.tip ? (
            <p>
              <span className="font-semibold text-white">{copy.tip}: </span>
              {issue.tip}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
