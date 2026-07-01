export type IpaCategory = "vowel" | "consonant";

export type IpaSection = {
  title: string;
  href: string;
  description: string;
};

export type IpaSymbol = {
  symbol: string;
  slug: string;
  category: IpaCategory;
  description: string;
};
