"use client";

import { useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
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

const curriculumCopy = {
  en: {
    lessons: "Lessons",
    show: "Open",
    hide: "Close",
    pairs: "pairs",
  },
  ja: {
    lessons: "レッスン",
    show: "開く",
    hide: "閉じる",
    pairs: "問",
  },
};

export function TrainingCurriculum({
  categories,
  sections,
}: TrainingCurriculumProps) {
  const { language, text } = useLanguage();
  const copy = curriculumCopy[language];
  const [openSectionIds, setOpenSectionIds] = useState<string[]>(["r-vs-l"]);

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

            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28 border border-white/10 bg-black"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={sectionIsOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-white/[0.03]"
                >
                  <span className="space-y-2">
                    <span className="block text-2xl font-semibold text-white">
                      {text(section.title)}
                    </span>
                    <span className="block text-sm leading-6 text-white/55">
                      {text(section.description)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-sm text-white/45 sm:inline">
                      {section.pairs.length} {copy.pairs}
                    </span>
                    <span className="border border-white/15 px-3 py-2 text-sm font-medium text-white">
                      {sectionIsOpen ? copy.hide : copy.show}
                    </span>
                  </span>
                </button>

                {sectionIsOpen ? (
                  <div className="border-t border-white/10 px-5 pb-6">
                    <MinimalPairTrainer
                      title={section.title}
                      description={section.description}
                      pairs={section.pairs}
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
