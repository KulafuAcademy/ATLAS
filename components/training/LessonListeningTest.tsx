"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import { ListeningTestSession } from "@/components/training/ListeningTestSession";
import type { TrainingSection } from "@/data/trainingSections";
import { getTestHref } from "@/lib/training";
import { getDailyPairs, saveTestResult } from "@/lib/trainingProgress";

const takeTestCopy = {
  en: {
    title: "Pair test mode",
    description: (count: number) =>
      `Go through all ${count} pairs one by one: listen, answer, say each word, then try the tongue twister.`,
    start: "Take test",
  },
  ja: {
    title: "ペアテストモード",
    description: (count: number) =>
      `${count}ペアをひとつずつ進めます。聞いて答え、単語を発音し、最後に早口言葉に挑戦します。`,
    start: "テストを受ける",
  },
};

// Same daily question set and progress storage as the home page curriculum,
// so a score here shows up on the category cards.
export function LessonListeningTest({ section }: { section: TrainingSection }) {
  const { language, text } = useLanguage();
  const copy = takeTestCopy[language];

  return (
    <div className="space-y-4">
      <section className="border border-white/10 bg-black px-5">
        <ListeningTestSession
          onComplete={(score, total) => saveTestResult(section.id, score, total)}
          title={section.title}
          pairs={getDailyPairs(`${section.id}:listening`, section.pairs)}
          useRecordedAudio
        />
      </section>
      <section className="flex flex-col gap-5 border border-white/10 bg-black px-5 py-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">{copy.title}</p>
          <p className="text-sm leading-6 text-white/55">
            {text(section.title)}: {copy.description(section.pairs.length)}
          </p>
        </div>
        <Link
          href={getTestHref(section.id)}
          className="inline-flex h-11 shrink-0 items-center justify-center self-start border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none lg:self-auto"
        >
          {copy.start}
        </Link>
      </section>
    </div>
  );
}
