"use client";

import Link from "next/link";
import { useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { ListeningTestSession } from "@/components/training/ListeningTestSession";
import { saveTrainingTestResult } from "@/lib/trainingProgress";
import type { MinimalPair, TrainingCategory } from "@/types/training";

type CategoryTestPageProps = {
  category: TrainingCategory;
  pairs: MinimalPair[];
};

type TestResult = {
  score: number;
  total: number;
  bestScore: number;
};

const testPageCopy = {
  en: {
    back: "Back to curriculum",
    eyebrow: "Listening test",
    prompt: "Listen carefully and choose the sound you hear.",
    saved: "Your result is saved on this device and updates this lesson’s progress bar.",
    completed: (score: number, total: number) =>
      `Test complete. You scored ${score} out of ${total}.`,
    best: "Best score",
    latest: "Latest score",
  },
  ja: {
    back: "カリキュラムに戻る",
    eyebrow: "聞き取りテスト",
    prompt: "音をよく聞いて、聞こえた音を選んでください。",
    saved: "結果はこの端末に保存され、レッスンの進捗バーに反映されます。",
    completed: (score: number, total: number) =>
      `テスト完了です。${total}問中${score}問正解しました。`,
    best: "ベストスコア",
    latest: "今回のスコア",
  },
};

export function CategoryTestPage({ category, pairs }: CategoryTestPageProps) {
  const { language, text } = useLanguage();
  const copy = testPageCopy[language];
  const [result, setResult] = useState<TestResult | null>(null);

  function recordResult(score: number, total: number) {
    const savedProgress = saveTrainingTestResult(category.id, score, total);
    setResult({ score, total, bestScore: savedProgress[category.id].bestScore });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/#curriculum"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium text-white/75 transition hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
      >
        <span aria-hidden="true">←</span>
        {copy.back}
      </Link>

      <header className="space-y-4 border-b border-white/10 pb-7">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/70">
          {copy.eyebrow}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
          {text(category.title)}
        </h1>
        <p className="max-w-2xl leading-7 text-white/65">
          {text(category.description)}
        </p>
        <p className="text-sm text-white/45">{copy.prompt}</p>
      </header>

      <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <ListeningTestSession
          title={category.title}
          pairs={pairs}
          onComplete={recordResult}
        />

        {result ? (
          <div
            role="status"
            aria-live="polite"
            className="space-y-3 rounded-xl border border-cyan-200/20 bg-cyan-200/[0.06] p-4"
          >
            <p className="font-semibold text-white">
              {copy.completed(result.score, result.total)}
            </p>
            <p className="text-sm text-white/65">
              {copy.saved} {copy.best}: {result.bestScore} / {result.total} · {copy.latest}: {result.score} / {result.total}
            </p>
            <Link
              href="/#curriculum"
              className="inline-flex min-h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {copy.back}
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
