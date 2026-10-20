import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PairLesson } from "@/components/training/PairLesson";
import { getTrainingSection, trainingSections } from "@/data/trainingSections";

type LessonPageProps = {
  params: Promise<{
    sectionId: string;
    pairId: string;
  }>;
};

export function generateStaticParams() {
  return trainingSections.flatMap((section) =>
    section.pairs.map((pair) => ({ sectionId: section.id, pairId: pair.id })),
  );
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { sectionId, pairId } = await params;
  const pair = getTrainingSection(sectionId)?.pairs.find(
    (candidate) => candidate.id === pairId,
  );

  return pair ? { title: `${pair.wordA} vs ${pair.wordB}` } : {};
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { sectionId, pairId } = await params;
  const section = getTrainingSection(sectionId);
  const pairIndex =
    section?.pairs.findIndex((candidate) => candidate.id === pairId) ?? -1;

  if (!section || pairIndex === -1) {
    notFound();
  }

  return (
    <PairLesson
      // Remount between lessons so recordings and results don't carry over.
      key={pairId}
      sectionId={section.id}
      sectionTitle={section.title}
      pair={section.pairs[pairIndex]}
      lessonNumber={pairIndex + 1}
      lessonCount={section.pairs.length}
      previousPairId={section.pairs[pairIndex - 1]?.id ?? null}
      nextPairId={section.pairs[pairIndex + 1]?.id ?? null}
    />
  );
}
