import { placeholderSymbols } from "@/data/ipa";
import type { IpaCategory } from "@/types/ipa";

export function getSymbolsByCategory(category: IpaCategory) {
  return placeholderSymbols.filter((symbol) => symbol.category === category);
}

export function getSymbolBySlug(slug: string) {
  return placeholderSymbols.find((symbol) => symbol.slug === slug);
}
