"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import { useCompletedPairs } from "@/lib/pairCompletion";
import {
  getLessonHref,
  getPairHref,
  getTestHref,
  getTrainingSection,
} from "@/lib/training";
import type { TrainingCategory, TrainingProgress } from "@/types/training";

type TrainingCategoryOverviewProps = {
  categories: TrainingCategory[];
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
    noProgress: "Not started",
    pairsCleared: (cleared: number, total: number) =>
      `${cleared} / ${total} pairs cleared`,
    listeningTest: "Listening test",
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
    noProgress: "まだ始めていません",
    pairsCleared: (cleared: number, total: number) =>
      `${cleared} / ${total} ペアクリア`,
    listeningTest: "聞き取りテスト",
    best: "ベスト",
    last: "前回",
    attempts: "回数",
  },
};

const buttonClassName =
  "flex h-11 items-center justify-center border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none";

export function TrainingCategoryOverview({
  categories,
  progressByCategory = {},
}: TrainingCategoryOverviewProps) {
  const { language, text } = useLanguage();
  const copy = overviewCopy[language];
  const completedPairs = useCompletedPairs();

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
          // Progress is pairs cleared on the per-pair page (tongue twister
          // passed); see lib/pairCompletion.ts.
          const pairs = getTrainingSection(category.id)?.pairs ?? [];
          const clearedCount = pairs.filter((pair) =>
            completedPairs.has(pair.id),
          ).length;
          const clearedPercentage = pairs.length
            ? Math.round((clearedCount / pairs.length) * 100)
            : 0;
          // "Take test" picks up at the first pair not cleared yet.
          const nextPair = pairs.find((pair) => !completedPairs.has(pair.id));
          const testHref = nextPair
            ? getPairHref(category.id, nextPair.id)
            : getTestHref(category.id);
          const progress = progressByCategory[category.id];

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
                      {clearedCount
                        ? copy.pairsCleared(clearedCount, pairs.length)
                        : copy.noProgress}
                    </p>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={copy.progress}
                    aria-valuemin={0}
                    aria-valuemax={pairs.length}
                    aria-valuenow={clearedCount}
                    className="h-1.5 bg-white/10"
                  >
                    <div
                      className="h-full bg-white transition-[width] duration-500"
                      style={{ width: `${clearedPercentage}%` }}
                    />
                  </div>
                  {progress ? (
                    <p className="text-xs text-white/55">
                      {copy.listeningTest} · {copy.best}: {progress.bestScore}{" "}
                      / {progress.total} · {copy.last}: {progress.lastScore} /{" "}
                      {progress.total} · {copy.attempts}: {progress.attempts}
                    </p>
                  ) : null}
                </div>
              </div>

              {isAvailable ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link href={getLessonHref(category.id)} className={buttonClassName}>
                    {copy.learn}
                  </Link>
                  <Link href={testHref} className={buttonClassName}>
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
