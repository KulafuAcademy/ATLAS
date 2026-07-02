import type { TrainingCategory } from "@/types/training";

export const trainingCategories: TrainingCategory[] = [
  {
    id: "r-vs-l",
    title: { en: "R vs L", ja: "R vs L" },
    description: {
      en: "The core contrast for Japanese learners, with initial sounds and consonant clusters.",
      ja: "日本語話者にとって最重要の対比。語頭と子音連結を中心に練習します。",
    },
    examples: ["right / light", "pray / play", "fry / fly"],
    status: "available",
  },
  {
    id: "b-v",
    title: { en: "B vs V", ja: "B vs V" },
    description: {
      en: "Practice lip closure for B and lower-lip vibration for V.",
      ja: "Bの唇を閉じる音と、Vの下唇を使う音を分けて練習します。",
    },
    examples: ["ban / van", "berry / very", "boat / vote"],
    status: "planned",
  },
  {
    id: "s-sh",
    title: { en: "S vs SH", ja: "S vs SH" },
    description: {
      en: "Separate clear S sounds from the wider SH sound.",
      ja: "鋭いSの音と、口を少し広く使うSHの音を聞き分けます。",
    },
    examples: ["see / she", "sip / ship", "seat / sheet"],
    status: "planned",
  },
  {
    id: "short-i-long-e",
    title: { en: "Short I vs Long E", ja: "短いI vs 長いE" },
    description: {
      en: "Build control over pairs like sit and seat.",
      ja: "sit と seat のような、日本語話者が混同しやすい母音を練習します。",
    },
    examples: ["sit / seat", "ship / sheep", "bit / beat"],
    status: "planned",
  },
  {
    id: "th",
    title: { en: "TH sounds", ja: "THの音" },
    description: {
      en: "Train the dental fricatives that often become S, Z, or D.",
      ja: "S・Z・Dに寄りやすいTHの音を、舌の位置から練習します。",
    },
    examples: ["think / sink", "thin / sin", "they / day"],
    status: "planned",
  },
  {
    id: "final-consonants",
    title: { en: "Final consonants", ja: "語尾の子音" },
    description: {
      en: "Practice word endings that Japanese speakers often weaken or add vowels to.",
      ja: "母音を足しやすい語尾の子音を、短くはっきり出す練習です。",
    },
    examples: ["cap / cab", "rice / rise", "bet / bed"],
    status: "planned",
  },
];
