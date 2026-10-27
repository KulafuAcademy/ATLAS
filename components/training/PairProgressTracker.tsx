"use client";

import type { ReactNode } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";
import { useCompletedPairs } from "@/lib/pairCompletion";
import type { MinimalPair } from "@/types/training";

import { LockIcon } from "./LockIcon";

export type TrackerStep = {
  anchorId: string;
  title: string;
  done: boolean;
  unlocked: boolean;
};

export type TrackerResults = {
  /** The listening step's streak: words answered right in a row. */
  listening: { correct: number; needed: number; answered: boolean };
  /** Best AI score per word, only for words that were scored. */
  wordScores: { word: string; best: number | undefined }[];
  pronunciationAttempts: number;
  twisterBest: number | null;
  twisterAttempts: number;
};

export type TrackerSection = {
  id: string;
  title: LocalizedText;
  pairs: MinimalPair[];
};

const trackerCopy = {
  en: {
    thisPair: "This pair",
    stepsDone: (done: number, total: number) => `${done} / ${total} steps`,
    results: "Results",
    listening: "Listening",
    pronunciation: "Pronunciation",
    tongueTwister: "Tongue twister",
    correctOf: (correct: number, needed: number) =>
      `${correct} / ${needed} correct`,
    best: (points: number) => `Best ${points} pts`,
    attempts: (count: number) =>
      `${count} ${count === 1 ? "attempt" : "attempts"}`,
    notTried: "Not tried yet",
    clearedEarlier: "Cleared",
    pairsCleared: (cleared: number, total: number) =>
      `${cleared} / ${total} pairs cleared`,
    current: "Current",
    locked: "Locked",
  },
  ja: {
    thisPair: "このペア",
    stepsDone: (done: number, total: number) => `${done} / ${total} ステップ`,
    results: "けっか",
    listening: "聞き取り",
    pronunciation: "発音",
    tongueTwister: "早口言葉",
    correctOf: (correct: number, needed: number) =>
      `${correct} / ${needed} せいかい`,
    best: (points: number) => `ベスト ${points}点`,
    attempts: (count: number) => `${count}回`,
    notTried: "まだやっていないよ",
    clearedEarlier: "クリア",
    pairsCleared: (cleared: number, total: number) =>
      `${cleared} / ${total} ペアクリア`,
    current: "いまここ",
    locked: "まだひらいていないよ",
  },
};

/**
 * Sidebar on the per-pair page: the four steps of this pair, the learner's
 * results so far, and how many pairs of the category are cleared. Step state
 * comes from PairPracticeCard; pair completion from lib/pairCompletion.ts.
 */
export function PairProgressTracker({
  pairId,
  section,
  steps,
  results,
  part = "all",
  className = "",
}: {
  pairId: string;
  section: TrackerSection;
  steps: TrackerStep[];
  results: TrackerResults;
  /** "pair": steps and results only; "category": cleared pairs only. */
  part?: "all" | "pair" | "category";
  className?: string;
}) {
  const { language, text } = useLanguage();
  const copy = trackerCopy[language];
  const completedPairs = useCompletedPairs();

  const doneSteps = steps.filter((step) => step.done).length;
  const currentStep = steps.find((step) => step.unlocked && !step.done);
  const clearedPairs = section.pairs.filter((pair) =>
    completedPairs.has(pair.id),
  ).length;
  // Step 1 has no score, so only steps 2-4 get a results row.
  const [, listeningStep, pronunciationStep, twisterStep] = steps;

  function resultLine(
    done: boolean | undefined,
    tried: boolean,
    value: string,
  ) {
    if (tried) return value;

    return done ? copy.clearedEarlier : copy.notTried;
  }

  return (
    <aside className={`space-y-4 ${className}`}>
      {part === "category" ? null : (
        <>
          <section className="space-y-4 border border-white/10 bg-white/[0.02] p-5">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                  {copy.thisPair}
                </p>
                <p className="text-xs font-semibold text-white/60">
                  {copy.stepsDone(doneSteps, steps.length)}
                </p>
              </div>
              <ProgressBar
                value={doneSteps}
                max={steps.length}
                label={copy.thisPair}
              />
            </div>
            <ol className="space-y-1">
              {steps.map((step, index) => {
                const isCurrent = step === currentStep;

                return (
                  <li key={step.anchorId}>
                    <a
                      href={`#${step.anchorId}`}
                      aria-current={isCurrent ? "step" : undefined}
                      title={step.unlocked ? undefined : copy.locked}
                      className={`flex items-center gap-3 border px-3 py-2 text-sm transition ${
                        isCurrent
                          ? "border-white text-white"
                          : step.unlocked
                            ? "border-white/15 text-white hover:border-white/40"
                            : "border-dashed border-white/10 text-white/25"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-6 w-6 shrink-0 items-center justify-center border text-xs font-semibold ${
                          step.done
                            ? "border-white bg-white text-black"
                            : step.unlocked
                              ? "border-white/40"
                              : "border-dashed border-white/15"
                        }`}
                      >
                        {step.done ? (
                          "✓"
                        ) : step.unlocked ? (
                          index + 1
                        ) : (
                          <LockIcon className="opacity-40" />
                        )}
                      </span>
                      <span className="font-medium">{step.title}</span>
                      {isCurrent ? (
                        <span className="ml-auto text-[0.65rem] uppercase tracking-[0.18em] text-white/50">
                          {copy.current}
                        </span>
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="space-y-3 border border-white/10 bg-white/[0.02] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/35">
              {copy.results}
            </p>
            <dl className="space-y-3 text-sm">
              <ResultRow
                label={copy.listening}
                value={resultLine(
                  listeningStep?.done,
                  results.listening.answered,
                  copy.correctOf(
                    results.listening.correct,
                    results.listening.needed,
                  ),
                )}
              />
              <ResultRow
                label={copy.pronunciation}
                value={resultLine(
                  pronunciationStep?.done,
                  results.pronunciationAttempts > 0,
                  copy.attempts(results.pronunciationAttempts),
                )}
              >
                {results.pronunciationAttempts > 0 ? (
                  <ul className="mt-1 space-y-0.5 text-white/55">
                    {results.wordScores.map(({ word, best }) => (
                      <li key={word} className="flex justify-between gap-3">
                        <span>{word}</span>
                        <span>{best === undefined ? "–" : copy.best(best)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </ResultRow>
              <ResultRow
                label={copy.tongueTwister}
                value={resultLine(
                  twisterStep?.done,
                  results.twisterAttempts > 0,
                  `${copy.best(results.twisterBest ?? 0)} · ${copy.attempts(results.twisterAttempts)}`,
                )}
              />
            </dl>
          </section>
        </>
      )}

      {part === "pair" ? null : (
        <section className="space-y-3 border border-white/10 bg-white/[0.02] p-5">
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                {text(section.title)}
              </p>
              <p className="text-xs font-semibold text-white/60">
                {copy.pairsCleared(clearedPairs, section.pairs.length)}
              </p>
            </div>
            <ProgressBar
              value={clearedPairs}
              max={section.pairs.length}
              label={text(section.title)}
            />
          </div>
          {/* Status only: pairs are reached through the step nav below the
              steps, which keeps the next pair locked until this one is cleared. */}
          <ul className="flex flex-wrap gap-1.5">
            {section.pairs.map((pair, index) => {
              const cleared = completedPairs.has(pair.id);
              const isCurrent = pair.id === pairId;
              // A pair opens once the one before it is cleared.
              const unlocked =
                cleared ||
                isCurrent ||
                index === 0 ||
                completedPairs.has(section.pairs[index - 1]?.id ?? "");

              return (
                <li
                  key={pair.id}
                  aria-current={isCurrent ? "step" : undefined}
                  title={unlocked ? undefined : copy.locked}
                  className={`flex cursor-default select-none items-center gap-1 border px-2 py-1 text-xs font-semibold ${
                    cleared
                      ? "border-white bg-white text-black"
                      : isCurrent
                        ? "border-white text-white"
                        : unlocked
                          ? "border-white/30 text-white/80"
                          : "border-dashed border-white/10 text-white/25"
                  }`}
                >
                  {cleared ? (
                    <span aria-hidden="true">✓</span>
                  ) : unlocked ? null : (
                    <LockIcon className="opacity-40" />
                  )}
                  {pair.wordA}/{pair.wordB}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </aside>
  );
}

function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const percentage = max ? Math.round((value / max) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-1.5 w-full overflow-hidden bg-white/10"
    >
      <div
        className="h-full bg-white transition-[width] duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <dt className="text-white/50">{label}</dt>
        <dd className="text-right font-medium text-white">{value}</dd>
      </div>
      {children}
    </div>
  );
}
