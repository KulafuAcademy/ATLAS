import type { TwisterWordType } from "@/data/twisterGlossary";

type Localized = { en: string; ja: string };

export type WordSense = {
  type: TwisterWordType;
  meaning: Localized;
  // Only set where a picture helps; abstract senses have none.
  image?: string;
  // Each example uses the word in this sense, with a Japanese translation.
  examples: Localized[];
};

export type WordDetail = {
  // Lowercase, and the same spelling as wordA / wordB in minimalPairs.ts.
  word: string;
  // Other spellings that should open this page from a sentence (plural, past tense...).
  forms?: string[];
  senses: WordSense[];
};
