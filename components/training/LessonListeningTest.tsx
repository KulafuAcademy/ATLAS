"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import { ListeningTestSession } from "@/components/training/ListeningTestSession";
import type { TrainingSection } from "@/data/trainingSections";
import { getTestHref } from "@/lib/training";
import { getDailyPairs, saveTestResult } from "@/lib/trainingProgress";

const takeTestCopy = {
  en: "Take test",
  ja: "テストを受ける",
};

// Same daily question set and progress storage as the home page curriculum,
// so a score here shows up on the category cards.
export function LessonListeningTest({ section }: { section: TrainingSection }) {
  const { language } = useLanguage();

  return (
    <div className="space-y-4">
      <Link
        href={getTestHref(section.id)}
        className="flex h-11 w-full items-center justify-center border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none sm:w-auto sm:inline-flex"
      >
        {takeTestCopy[language]}
      </Link>
      <section className="border border-white/10 bg-black px-5">
        <ListeningTestSession
          onComplete={(score, total) => saveTestResult(section.id, score, total)}
          title={section.title}
          pairs={getDailyPairs(`${section.id}:listening`, section.pairs)}
        />
      </section>
    </div>
  );
}
