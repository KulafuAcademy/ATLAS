import type { IpaSection, IpaSymbol } from "@/types/ipa";

export const ipaSections: IpaSection[] = [
  {
    title: "Vowels",
    href: "/vowels",
    description: "A structured home for English vowel symbols and future lessons.",
  },
  {
    title: "Consonants",
    href: "/consonants",
    description:
      "A structured home for English consonant symbols and future lessons.",
  },
];

export const placeholderSymbols: IpaSymbol[] = [
  {
    symbol: "i",
    slug: "i",
    category: "vowel",
    description: "Placeholder close front vowel entry.",
  },
  {
    symbol: "ae",
    slug: "ae",
    category: "vowel",
    description: "Placeholder near-open front vowel entry.",
  },
  {
    symbol: "p",
    slug: "p",
    category: "consonant",
    description: "Placeholder voiceless bilabial stop entry.",
  },
  {
    symbol: "sh",
    slug: "sh",
    category: "consonant",
    description: "Placeholder voiceless postalveolar fricative entry.",
  },
];
