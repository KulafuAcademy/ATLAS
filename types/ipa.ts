export type IpaCategory = "vowel" | "consonant";

export type VowelHeight = "close" | "near-open" | "open";

export type VowelBackness = "front" | "central" | "back";

export type ConsonantPlace =
  | "bilabial"
  | "labiodental"
  | "dental"
  | "alveolar"
  | "postalveolar"
  | "velar"
  | "glottal";

export type ConsonantManner =
  | "stop"
  | "fricative"
  | "affricate"
  | "nasal"
  | "approximant";

export type Voicing = "voiceless" | "voiced";

export type IpaSection = {
  title: string;
  href: string;
  description: string;
};

type IpaSymbolBase = {
  symbol: string;
  slug: string;
  category: IpaCategory;
  label: string;
  description: string;
  exampleWords: string[];
  notes: string;
};

export type VowelSymbol = IpaSymbolBase & {
  category: "vowel";
  height: VowelHeight;
  backness: VowelBackness;
  rounded: boolean;
};

export type ConsonantSymbol = IpaSymbolBase & {
  category: "consonant";
  place: ConsonantPlace;
  manner: ConsonantManner;
  voicing: Voicing;
};

export type IpaSymbol = VowelSymbol | ConsonantSymbol;
