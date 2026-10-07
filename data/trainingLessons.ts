import {
  bVsVPairs,
  finalConsonantPairs,
  rVsLPairs,
  sVsShPairs,
  shortIVsLongEPairs,
  thPairs,
} from "@/data/minimalPairs";
import type { MinimalPair } from "@/types/training";

export type TrainingLesson = {
  id: string;
  title: { en: string; ja: string };
  description: { en: string; ja: string };
  pairs: MinimalPair[];
};

export const trainingLessons: TrainingLesson[] = [
  {
    id: "r-vs-l",
    title: { en: "R vs L", ja: "R vs L" },
    description: {
      en: "A first set for Japanese learners practicing one of the most common English sound contrasts.",
      ja: "日本語話者がつまずきやすい代表的な英語の音の違いを練習する最初のセットです。",
    },
    pairs: rVsLPairs,
  },
  {
    id: "b-v",
    title: { en: "B vs V", ja: "B vs V" },
    description: {
      en: "Practice the difference between a closed-lip B and a vibrating lower-lip V.",
      ja: "唇を閉じるBと、下唇を使うVの違いを練習します。",
    },
    pairs: bVsVPairs,
  },
  {
    id: "s-sh",
    title: { en: "S vs SH", ja: "S vs SH" },
    description: {
      en: "Train the difference between a sharp S and the wider SH sound.",
      ja: "鋭いSと、口を少し広く使うSHの違いを練習します。",
    },
    pairs: sVsShPairs,
  },
  {
    id: "short-i-long-e",
    title: { en: "Short I vs Long E", ja: "短いI vs 長いE" },
    description: {
      en: "Practice the vowel contrast in pairs like sit and seat.",
      ja: "sit と seat のような短いIと長いEの母音差を練習します。",
    },
    pairs: shortIVsLongEPairs,
  },
  {
    id: "th",
    title: { en: "TH sounds", ja: "THの音" },
    description: {
      en: "Practice TH sounds that often shift toward S, Z, D, or F.",
      ja: "S・Z・D・Fに寄りやすいTHの音を練習します。",
    },
    pairs: thPairs,
  },
  {
    id: "final-consonants",
    title: { en: "Final consonants", ja: "語尾の子音" },
    description: {
      en: "Practice clear word endings without adding an extra vowel.",
      ja: "余分な母音を足さずに、語尾の子音をはっきり出す練習です。",
    },
    pairs: finalConsonantPairs,
  },
];
