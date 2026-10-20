import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/PageHeader";
import { LessonStepNav } from "@/components/training/LessonStepNav";
import { MinimalPairTrainer } from "@/components/training/MinimalPairTrainer";
import { trainingSections } from "@/data/trainingSections";
import {
  getAdjacentSections,
  getLessonHref,
  getTrainingSection,
} from "@/lib/training";

type LessonPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export function generateStaticParams() {
  return trainingSections.map((section) => ({ category: section.id }));
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { category } = await params;
  const section = getTrainingSection(category);

  if (!section) {
    notFound();
  }

  const { previous, next } = getAdjacentSections(section.id);

  return (
    <div className="space-y-10">
      <PageHeader
        compact
        eyebrow={{ en: "Lesson", ja: "レッスン" }}
        title={section.title}
        description={section.description}
      />
      <MinimalPairTrainer
        title={section.title}
        description={section.description}
        pairs={section.pairs}
      />
      <LessonStepNav
        back={{ href: "/", label: { en: "Back to curriculum", ja: "カリキュラムへ戻る" } }}
        previous={
          previous ? { href: getLessonHref(previous.id), label: previous.title } : null
        }
        next={next ? { href: getLessonHref(next.id), label: next.title } : null}
      />
    </div>
  );
}
