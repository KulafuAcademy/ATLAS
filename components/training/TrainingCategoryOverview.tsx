"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language/LanguageProvider";
import type { TrainingCategory, TrainingProgress } from "@/types/training";

type TrainingCategoryOverviewProps = {
  categories: TrainingCategory[];
  onStart?: (categoryId: string, target: "learn" | "test") => void;
  progressByCategory?: Record<string, TrainingProgress>;
};

const overviewCopy = {
  en: {
    eyebrow: "Curriculum",
    title: "Choose a lesson",
    description:
      "Start with the most common pronunciation contrasts for Japanese learners, then move into vowels, TH sounds, and word endings.",
    examples: "Examples",
    learn: "Learn",
    test: "Take test",
    tested: "Tested",
    progress: "Progress",
    noProgress: "No test yet",
    best: "Best",
    last: "Last",
    attempts: "Attempts",
  },
  ja: {
    eyebrow: "カリキュラム",
    title: "レッスンを選ぶ",
    description:
      "日本語話者が苦手になりやすい音から始めて、母音・TH・語尾の子音へ進みます。",
    examples: "例",
    learn: "学ぶ",
    test: "テストを受ける",
    tested: "テスト済み",
    progress: "進捗",
    noProgress: "まだテストなし",
    best: "ベスト",
    last: "前回",
    attempts: "回数",
  },
};

const learnButtonClassName =
  "flex h-10 items-center justify-center rounded-md border border-white bg-white px-3 text-xs font-semibold text-black transition hover:bg-white/85 focus:outline-none focus:ring-2 focus:ring-cyan-200/60";
const testButtonClassName =
  "flex h-10 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] px-3 text-xs font-semibold text-white transition hover:border-white/50 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-cyan-200/60";

export function TrainingCategoryOverview({
  categories,
  onStart,
  progressByCategory = {},
}: TrainingCategoryOverviewProps) {
  const { language, text } = useLanguage();
  const copy = overviewCopy[language];

  return (
    <section aria-labelledby="lesson-list-title" className="space-y-6 border-t border-white/10 pt-10">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm uppercase tracking-[0.28em] text-white/40">
          {copy.eyebrow}
        </p>
        <h2 id="lesson-list-title" className="text-3xl font-semibold text-white md:text-4xl">
          {copy.title}
        </h2>
        <p className="leading-7 text-white/60">{copy.description}</p>
      </div>

      <div className="grid items-stretch gap-3 sm:grid-cols-2 md:grid-cols-3">
        {categories.map((category) => {
          const isAvailable = category.status === "available";
          const progress = progressByCategory[category.id];
          const bestPercentage = progress
            ? Math.round((progress.bestScore / progress.total) * 100)
            : 0;

          return (
            <article
              key={category.id}
              className="relative flex min-h-[268px] flex-col justify-between gap-4 rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#111] via-[#090909] to-[#050505] p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.28)] transition-all duration-200 ease-out hover:z-10 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.42)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-4"
            >
              <div className="space-y-3.5">
                <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {text(category.title)}
                </h3>

                <p className="min-h-9 text-xs leading-5 text-white/55 sm:min-h-10">
                  {text(category.description)}
                </p>

                <div className="space-y-1.5">
                  <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-white/40">
                    {copy.examples}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {category.examples.map((example) => (
                      <span
                        key={example}
                        className="rounded-sm border border-white/[0.1] bg-black/30 px-1.5 py-1 text-[10px] text-white/65"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border border-white/[0.08] bg-black/40 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/45">
                      {copy.progress}
                    </p>
                    <p className={`rounded-full px-2 py-1 text-[9px] ${progress ? "border border-cyan-200/15 bg-cyan-200/[0.07] text-cyan-100/80" : "text-white/40"}`}>
                      {progress ? `${copy.tested} · ${copy.attempts}: ${progress.attempts}` : copy.noProgress}
                    </p>
                  </div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
                    role="progressbar"
                    aria-label={`${text(category.title)} ${copy.progress}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={bestPercentage}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-sky-300 transition-[width] duration-500"
                      style={{ width: `${bestPercentage}%` }}
                    />
                  </div>
                  {progress ? (
                    <p className="text-[10px] text-white/50">
                      {copy.best}: {progress.bestScore} / {progress.total} ·{" "}
                      {copy.last}: {progress.lastScore} / {progress.total}
                    </p>
                  ) : null}
                </div>
              </div>

              {isAvailable ? (
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onStart?.(category.id, "learn")}
                    className={learnButtonClassName}
                  >
                    {copy.learn}
                  </button>
                  <Link
                    href={`/tests/${category.id}`}
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
