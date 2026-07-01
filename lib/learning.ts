import { learningStages } from "@/data/learning";
import { getSymbolBySlug } from "@/lib/ipa";
import type { IpaSymbol } from "@/types/ipa";

function isIpaSymbol(symbol: IpaSymbol | undefined): symbol is IpaSymbol {
  return Boolean(symbol);
}

export function getLearningPath() {
  return learningStages.map((stage) => ({
    ...stage,
    symbols: stage.slugs.map(getSymbolBySlug).filter(isIpaSymbol),
  }));
}

export function getLearningStepBySlug(slug: string) {
  let position = 0;

  for (const stage of learningStages) {
    const index = stage.slugs.indexOf(slug);

    if (index >= 0) {
      return {
        stage,
        stageIndex: learningStages.indexOf(stage),
        index,
        position: position + index + 1,
      };
    }

    position += stage.slugs.length;
  }

  return null;
}

export function getNextLearningSymbol(slug: string) {
  const flattenedSlugs = learningStages.flatMap((stage) => stage.slugs);
  const index = flattenedSlugs.indexOf(slug);

  if (index < 0 || index === flattenedSlugs.length - 1) {
    return null;
  }

  return getSymbolBySlug(flattenedSlugs[index + 1]) ?? null;
}

export function getRecommendedStartSymbols() {
  return learningStages[0].slugs
    .slice(0, 4)
    .map(getSymbolBySlug)
    .filter(isIpaSymbol);
}
