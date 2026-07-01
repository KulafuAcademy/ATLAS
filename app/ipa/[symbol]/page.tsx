import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/PageHeader";
import { IpaStudyContent } from "@/components/ipa/IpaStudyContent";
import { getSymbolCopy } from "@/lib/i18n";
import { getRelatedSymbols, getSymbolBySlug } from "@/lib/ipa";
import { getLearningStepBySlug, getNextLearningSymbol } from "@/lib/learning";

type IpaDetailPageProps = {
  params: Promise<{
    symbol: string;
  }>;
};

export default async function IpaDetailPage({ params }: IpaDetailPageProps) {
  const { symbol } = await params;
  const ipaSymbol = getSymbolBySlug(symbol);

  if (!ipaSymbol) {
    notFound();
  }

  const relatedSymbols = getRelatedSymbols(ipaSymbol);
  const learningStep = getLearningStepBySlug(ipaSymbol.slug);
  const nextLearningSymbol = getNextLearningSymbol(ipaSymbol.slug);
  const jaCopy = getSymbolCopy(ipaSymbol, "ja");

  return (
    <div className="space-y-16">
      <PageHeader
        eyebrow={{ en: "Study", ja: "学習" }}
        title={ipaSymbol.symbol}
        description={{ en: ipaSymbol.label, ja: jaCopy.label }}
      />

      <IpaStudyContent
        symbol={ipaSymbol}
        relatedSymbols={relatedSymbols}
        learningStep={learningStep}
        nextLearningSymbol={nextLearningSymbol}
      />
    </div>
  );
}
