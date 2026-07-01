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
