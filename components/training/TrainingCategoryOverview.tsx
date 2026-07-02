"use client";

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
    title: "Choose a sound category",
    description:
      "Start with the most common pronunciation contrasts for Japanese learners, then move into vowels, TH sounds, and word endings.",
    examples: "Examples",
    learn: "Learn",
    test: "Take test",
    progress: "Progress",
    noProgress: "No test yet",
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
    best: "ベスト",
    last: "前回",
    attempts: "回数",
  },
};

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
          const bestPercentage = progress
            ? Math.round((progress.bestScore / progress.total) * 100)
            : 0;

          return (
            <article
              key={category.id}
              className="flex min-h-64 flex-col justify-between border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="space-y-5">
                <h3 className="text-2xl font-semibold text-white">
                  {text(category.title)}
                </h3>

                <p className="text-sm leading-6 text-white/60">
                  {text(category.description)}
                </p>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                    {copy.examples}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.examples.map((example) => (
                      <span
                        key={example}
                        className="border border-white/10 px-2 py-1 text-xs text-white/65"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                      {copy.progress}
                    </p>
                    <p className="text-xs text-white/45">
                      {progress
                        ? `${copy.attempts}: ${progress.attempts}`
                        : copy.noProgress}
                    </p>
                  </div>
                  <div className="h-1.5 bg-white/10">
                    <div
                      className="h-full bg-white"
                      style={{ width: `${bestPercentage}%` }}
                    />
                  </div>
                  {progress ? (
                    <p className="text-xs text-white/55">
                      {copy.best}: {progress.bestScore} / {progress.total} ·{" "}
                      {copy.last}: {progress.lastScore} / {progress.total}
                    </p>
                  ) : null}
                </div>
              </div>

              {isAvailable ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onStart?.(category.id, "learn")}
                    className="h-11 border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/85"
                  >
                    {copy.learn}
                  </button>
                  <button
                    type="button"
                    onClick={() => onStart?.(category.id, "test")}
                    className="h-11 border border-white/15 px-4 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black"
                  >
                    {copy.test}
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
