import type { LearningStage } from "@/types/ipa";

export const learningStages: LearningStage[] = [
  {
    title: "Foundation Sounds",
    level: "foundation",
    description:
      "Start with high-frequency sounds that make the IPA chart feel less abstract.",
    slugs: ["i", "ih", "schwa", "p", "b", "t", "d"],
  },
  {
    title: "Core Vowel Contrasts",
    level: "contrast",
    description:
      "Build useful listening contrasts across front, central, and back vowels.",
    slugs: ["e", "ae", "uh", "aa", "uu", "u"],
  },
  {
    title: "Core Consonant Contrasts",
    level: "contrast",
    description:
      "Compare place, manner, and voicing with common English consonant pairs.",
    slugs: ["k", "g", "f", "v", "s", "z", "th", "dh"],
  },
  {
    title: "Recognition Builders",
    level: "advanced",
    description:
      "Add less transparent spellings and sounds that help with dictionary reading.",
    slugs: ["sh", "zh", "ch", "j", "ng", "l", "r", "w", "y"],
  },
];
