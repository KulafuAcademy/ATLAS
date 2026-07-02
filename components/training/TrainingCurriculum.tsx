"use client";

import { useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { ListeningTestSession } from "@/components/training/ListeningTestSession";
import { MinimalPairTrainer } from "@/components/training/MinimalPairTrainer";
import { TrainingCategoryOverview } from "@/components/training/TrainingCategoryOverview";
import type { LocalizedText } from "@/lib/i18n";
import type { MinimalPair, TrainingCategory } from "@/types/training";

type TrainingSection = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  pairs: MinimalPair[];
};

type TrainingCurriculumProps = {
  categories: TrainingCategory[];
  sections: TrainingSection[];
};

type PracticeMode = "all" | "daily";

const curriculumCopy = {
  en: {
    lessons: "Lessons",
    show: "Open",
    hide: "Close",
    pairs: "pairs",
    allPairs: "All pairs",
    todaysTen: "Today's 10",
  },
  ja: {
    lessons: "レッスン",
    show: "開く",
    hide: "閉じる",
    pairs: "問",
    allPairs: "全問",
    todaysTen: "今日の10問",
  },
};

export function TrainingCurriculum({
  categories,
  sections,
}: TrainingCurriculumProps) {
  const { language, text } = useLanguage();
  const copy = curriculumCopy[language];
  const [openSectionIds, setOpenSectionIds] = useState<string[]>(["r-vs-l"]);
  const [practiceModes, setPracticeModes] = useState<Record<string, PracticeMode>>(
    {},
  );

  function isOpen(sectionId: string) {
    return openSectionIds.includes(sectionId);
  }

  function toggleSection(sectionId: string) {
    setOpenSectionIds((currentSectionIds) =>
      currentSectionIds.includes(sectionId)
        ? currentSectionIds.filter((currentSectionId) => currentSectionId !== sectionId)
        : [...currentSectionIds, sectionId],
    );
  }

  function setPracticeMode(sectionId: string, mode: PracticeMode) {
    setPracticeModes((currentModes) => ({
      ...currentModes,
      [sectionId]: mode,
    }));
  }

  function openAndScrollToSection(sectionId: string) {
    setOpenSectionIds((currentSectionIds) =>
      currentSectionIds.includes(sectionId)
        ? currentSectionIds
        : [...currentSectionIds, sectionId],
    );

    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="space-y-16">
      <TrainingCategoryOverview
        categories={categories}
        onStart={openAndScrollToSection}
      />

      <section className="space-y-4 border-t border-white/10 pt-10">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            {copy.lessons}
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => {
            const sectionIsOpen = isOpen(section.id);
            const practiceMode = practiceModes[section.id] ?? "all";
            const visiblePairs =
              practiceMode === "daily"
                ? getDailyPairs(section.id, section.pairs)
                : section.pairs;

            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28 border border-white/10 bg-black"
              >
                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={sectionIsOpen}
                    className="space-y-2 text-left"
                  >
                    <span className="block text-2xl font-semibold text-white">
                      {text(section.title)}
                    </span>
                    <span className="block text-sm leading-6 text-white/55">
                      {text(section.description)}
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="hidden text-sm text-white/45 sm:inline">
                      {visiblePairs.length} / {section.pairs.length} {copy.pairs}
                    </span>

                    <div className="grid grid-cols-2 border border-white/10 text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => setPracticeMode(section.id, "all")}
                        className={`h-10 px-3 transition ${
                          practiceMode === "all"
                            ? "bg-white text-black"
                            : "text-white/55 hover:text-white"
                        }`}
                      >
                        {copy.allPairs}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPracticeMode(section.id, "daily")}
                        className={`h-10 px-3 transition ${
                          practiceMode === "daily"
                            ? "bg-white text-black"
                            : "text-white/55 hover:text-white"
                        }`}
                      >
                        {copy.todaysTen}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      aria-expanded={sectionIsOpen}
                      className="h-10 border border-white/15 px-3 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black"
                    >
                      {sectionIsOpen ? copy.hide : copy.show}
                    </button>
                  </div>
                </div>

                {sectionIsOpen ? (
                  <div className="border-t border-white/10 px-5 pb-6">
                    <ListeningTestSession
                      title={section.title}
                      pairs={getDailyPairs(`${section.id}:listening`, section.pairs)}
                    />
                    <MinimalPairTrainer
                      title={section.title}
                      description={section.description}
                      pairs={visiblePairs}
                    />
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function getDailyPairs(sectionId: string, pairs: MinimalPair[]) {
  return [...pairs]
    .sort((pairA, pairB) => {
      const dateKey = getLocalDateKey();
      const scoreA = hashString(`${dateKey}:${sectionId}:${pairA.id}`);
      const scoreB = hashString(`${dateKey}:${sectionId}:${pairB.id}`);

      return scoreA - scoreB;
    })
    .slice(0, 10);
}

function getLocalDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}
