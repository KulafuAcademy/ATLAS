import type { LearningStage } from "@/types/ipa";

export const learningStages: LearningStage[] = [
  {
    title: { en: "Foundation Sounds", ja: "基礎の音" },
    level: "foundation",
    description: {
      en: "Start with high-frequency sounds that make the IPA chart feel less abstract.",
      ja: "IPA表を抽象的に感じにくくするために、頻度の高い音から始めます。",
    },
    slugs: ["i", "ih", "schwa", "p", "b", "t", "d"],
  },
  {
    title: { en: "Core Vowel Contrasts", ja: "母音の基本対比" },
    level: "contrast",
    description: {
      en: "Build useful listening contrasts across front, central, and back vowels.",
      ja: "前舌・中舌・後舌の母音を比べながら、聞き分けの軸を作ります。",
    },
    slugs: ["e", "ae", "uh", "aa", "uu", "u"],
  },
  {
    title: { en: "Core Consonant Contrasts", ja: "子音の基本対比" },
    level: "contrast",
    description: {
      en: "Compare place, manner, and voicing with common English consonant pairs.",
      ja: "英語でよく出る子音ペアを使って、調音位置・方法・有声性を比べます。",
    },
    slugs: ["k", "g", "f", "v", "s", "z", "th", "dh"],
  },
  {
    title: { en: "Recognition Builders", ja: "認識力を広げる音" },
    level: "advanced",
    description: {
      en: "Add less transparent spellings and sounds that help with dictionary reading.",
      ja: "綴りから分かりにくい音を加えて、辞書の発音表記を読みやすくします。",
    },
    slugs: ["sh", "zh", "ch", "j", "ng", "l", "r", "w", "y"],
  },
];
