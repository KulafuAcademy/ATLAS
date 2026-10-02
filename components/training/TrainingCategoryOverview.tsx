"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { TrainingCategory, TrainingProgress } from "@/types/training";

type TrainingCategoryOverviewProps = {
  categories: TrainingCategory[];
  onStart?: (categoryId: string) => void;
  progressByCategory?: Record<string, TrainingProgress>;
};

const overviewCopy = {
  en: {
    eyebrow: "Curriculum",
    title: "Choose a sound category",
    description:
      "Start with the most common pronunciation contrasts for Japanese learners, then move into vowels, TH sounds, and word endings.",
    examples: "Examples",
    learn: "Learn",
    test: "Take test",
    progress: "Progress",
    noProgress: "No test yet",
    tested: "Tested",
    best: "Best",
    last: "Last",
    attempts: "Attempts",
  },
  ja: {
    eyebrow: "カリキュラム",
    title: "音のカテゴリを選ぶ",
    description:
      "日本語話者が苦手になりやすい音から始めて、母音・TH・語尾の子音へ進みます。",
    examples: "例",
    learn: "学ぶ",
    test: "テストを受ける",
    progress: "進捗",
    noProgress: "まだテストなし",
    tested: "テスト済み",
    best: "ベスト",
    last: "前回",
    attempts: "回数",
  },
};

const learnButtonClassName =
  "h-11 rounded-lg border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black";
const testButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-lg border border-white/20 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

export function TrainingCategoryOverview({
  categories,
  onStart,
  progressByCategory = {},
}: TrainingCategoryOverviewProps) {
  const { language, text } = useLanguage();
  const copy = overviewCopy[language];

  return (
    <section className="space-y-6 border-t border-white/10 pt-10">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm uppercase tracking-[0.28em] text-white/40">
          {copy.eyebrow}
        </p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          {copy.title}
        </h2>
        <p className="leading-7 text-white/60">{copy.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const isAvailable = category.status === "available";
          const progress = progressByCategory[category.id];
          const hasTested = Boolean(progress && progress.attempts > 0);
          const bestPercentage = hasTested && progress.total > 0
            ? Math.min(100, Math.max(0, Math.round((progress.bestScore / progress.total) * 100)))
            : 0;

          return (
            <article
              key={category.id}
              className="group relative flex min-h-72 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-5 transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:from-white/[0.07]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-200/[0.035] blur-2xl transition group-hover:bg-cyan-200/[0.08]"
              />
              <div className="space-y-5">
                <h3 className="relative text-2xl font-semibold tracking-tight text-white">
                  {text(category.title)}
                </h3>

                <p className="relative min-h-12 text-sm leading-6 text-white/60">
                  {text(category.description)}
                </p>

                <div className="relative space-y-2">
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white/40">
                    {copy.examples}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.examples.map((example) => (
                      <span
                        key={example}
                        className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white/70 transition group-hover:border-white/15"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative space-y-3 rounded-xl border border-white/[0.07] bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white/45">
                      {copy.progress}
                    </p>
                    {hasTested ? (
                      <p className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-2.5 py-1 text-[0.7rem] font-medium text-cyan-100">
                        {copy.tested} · {copy.attempts}: {progress.attempts}
                      </p>
                    ) : (
                      <p className="text-xs text-white/45">{copy.noProgress}</p>
                    )}
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${text(category.title)} ${copy.progress}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={bestPercentage}
                    aria-valuetext={
                      hasTested
                        ? `${copy.best}: ${progress.bestScore} / ${progress.total}`
                        : copy.noProgress
                    }
                    className="h-2.5 overflow-hidden rounded-full bg-white/10"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-sky-300 transition-[width] duration-500 ease-out"
                      style={{ width: `${bestPercentage}%` }}
                    />
                  </div>
                  {hasTested ? (
                    <p className="text-xs tabular-nums text-white/60">
                      {copy.best}: {progress.bestScore} / {progress.total} ·{" "}
                      {copy.last}: {progress.lastScore} / {progress.total}
                    </p>
                  ) : null}
                </div>
              </div>

              {isAvailable ? (
                <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onStart?.(category.id)}
                    className={learnButtonClassName}
                  >
                    {copy.learn}
                  </button>
                  <Link
                    href={`/test/${category.id}`}
                    className={testButtonClassName}
                  >
                    {copy.test}
                  </Link>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
