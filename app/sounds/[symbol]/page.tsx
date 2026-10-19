import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/PageHeader";
import { SoundDetail } from "@/components/sounds/SoundDetail";
import { ipaSymbols } from "@/data/ipa";
import { getRelatedSymbols, getSymbolBySlug } from "@/lib/ipa";
import { getLearningStepBySlug, getNextLearningSymbol } from "@/lib/learning";

type SoundPageProps = {
  params: Promise<{
    symbol: string;
  }>;
};

export function generateStaticParams() {
  return ipaSymbols.map((symbol) => ({ symbol: symbol.slug }));
}

export default async function SoundPage({ params }: SoundPageProps) {
  const { symbol: slug } = await params;
  const symbol = getSymbolBySlug(slug);

  if (!symbol) {
    notFound();
  }

  const step = getLearningStepBySlug(slug);

  return (
    <div className="space-y-16">
      <PageHeader
        eyebrow={{ en: "Deep sound study", ja: "音を深く学ぶ" }}
        title={{ en: `The ${symbol.symbol} sound`, ja: `${symbol.symbol} の音` }}
        description={{
          en: "Understand the articulation and practise with example words.",
          ja: "口と舌の使い方を理解して、例語を聞きながら練習します。",
        }}
      />
      <SoundDetail
        symbol={symbol}
        related={getRelatedSymbols(symbol)}
        learningStep={step ? { stage: step.stage, position: step.position } : null}
        next={getNextLearningSymbol(slug)}
      />
    </div>
  );
}
