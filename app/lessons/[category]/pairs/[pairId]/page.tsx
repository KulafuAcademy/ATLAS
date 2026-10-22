import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/PageHeader";
import { LessonStepNav } from "@/components/training/LessonStepNav";
import { SinglePairPractice } from "@/components/training/MinimalPairTrainer";
import { trainingSections } from "@/data/trainingSections";
import { getLessonHref, getPairHref, getPairWithNeighbors } from "@/lib/training";

type PairPageProps = {
  params: Promise<{
    category: string;
    pairId: string;
  }>;
};

export function generateStaticParams() {
  return trainingSections.flatMap((section) =>
    section.pairs.map((pair) => ({ category: section.id, pairId: pair.id })),
  );
}

export default async function PairPage({ params }: PairPageProps) {
  const { category, pairId } = await params;
  const result = getPairWithNeighbors(category, pairId);

  if (!result) {
    notFound();
  }

  const { section, pair, position, total, previous, next } = result;

  return (
    <div className="space-y-10">
      <PageHeader
        compact
        eyebrow={{
          en: `${section.title.en} · Pair ${position} / ${total}`,
          ja: `${section.title.ja} · ${position} / ${total} ペア`,
        }}
        title={`${pair.wordA} / ${pair.wordB}`}
        description={{
          en: "Listen, take the listening and pronunciation tests, then try the tongue twister.",
          ja: "音を聞いて、聞き取りと発音のテストに挑戦し、最後に早口言葉を練習します。",
        }}
      />
      <div className="max-w-3xl">
        <SinglePairPractice key={pair.id} pair={pair} />
      </div>
      <LessonStepNav
        back={{
          href: getLessonHref(section.id),
          label: { en: "Back to lesson", ja: "レッスンへ戻る" },
        }}
        previous={
          previous
            ? {
                href: getPairHref(section.id, previous.id),
                label: `${previous.wordA} / ${previous.wordB}`,
              }
            : null
        }
        next={
          next
            ? {
                href: getPairHref(section.id, next.id),
                label: `${next.wordA} / ${next.wordB}`,
              }
            : null
        }
      />
    </div>
  );
}
