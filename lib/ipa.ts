import { ipaSymbols } from "@/data/ipa";
import type { IpaCategory } from "@/types/ipa";

export function getSymbolsByCategory(category: IpaCategory) {
  return ipaSymbols.filter((symbol) => symbol.category === category);
}

export function getSymbolBySlug(slug: string) {
  return ipaSymbols.find((symbol) => symbol.slug === slug);
}
