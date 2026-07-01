import { ipaSymbols } from "@/data/ipa";
import type {
  ConsonantSymbol,
  IpaCategory,
  IpaSymbol,
  VowelSymbol,
} from "@/types/ipa";

export function getSymbolsByCategory(category: "vowel"): VowelSymbol[];
export function getSymbolsByCategory(category: "consonant"): ConsonantSymbol[];
export function getSymbolsByCategory(category: IpaCategory): IpaSymbol[] {
  return ipaSymbols.filter((symbol) => symbol.category === category);
}

export function getSymbolBySlug(slug: string) {
  return ipaSymbols.find((symbol) => symbol.slug === slug);
}

export function getRelatedSymbols(symbol: IpaSymbol) {
  return ipaSymbols
    .filter((candidate) => {
      if (candidate.slug === symbol.slug || candidate.category !== symbol.category) {
        return false;
      }

      if (symbol.category === "vowel" && candidate.category === "vowel") {
        return (
          candidate.height === symbol.height ||
          candidate.backness === symbol.backness
        );
      }

      if (
        symbol.category === "consonant" &&
        candidate.category === "consonant"
      ) {
        return (
          candidate.place === symbol.place ||
          candidate.manner === symbol.manner ||
          candidate.voicing === symbol.voicing
        );
      }

      return false;
    })
    .slice(0, 4);
}
