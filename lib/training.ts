import type { MinimalPair } from "@/types/training";

/** The pair's own tongue twister, or a generated one based on its sound focus. */
export function getTongueTwister(pair: MinimalPair) {
  if (pair.tongueTwister) {
    return pair.tongueTwister;
  }

  const { wordA, wordB } = pair;

  if (pair.soundFocus === "B vs V") {
    return {
      text: `${wordA} and ${wordB} move from closed lips to clear voice.`,
      note: {
        en: "Close the lips for B, then use the lower lip and voice for V.",
        ja: "Bは唇を閉じ、Vは下唇と声を使う意識で練習します。",
      },
    };
  }

  if (pair.soundFocus === "S vs SH") {
    return {
      text: `${wordA}, ${wordB}; say ${wordA}, then ${wordB} softly.`,
      note: {
        en: "Keep S narrow and sharp, then make SH wider and softer.",
        ja: "Sは細く鋭く、SHは少し広くやわらかく出します。",
      },
    };
  }

  if (pair.soundFocus === "Short I vs Long E") {
    return {
      text: `${wordA} and ${wordB} sit in a clean little line.`,
      note: {
        en: "Keep the short vowel relaxed, then make the long vowel clearer.",
        ja: "短い母音は力を抜き、長い母音はよりはっきり伸ばします。",
      },
    };
  }

  if (pair.soundFocus === "TH sounds") {
    return {
      text: `${wordA} then ${wordB}; keep the tongue light and clear.`,
      note: {
        en: "Let the tongue come forward lightly for TH before moving on.",
        ja: "THでは舌を軽く前に出してから、次の音へ移ります。",
      },
    };
  }

  if (pair.soundFocus === "Final consonants") {
    return {
      text: `${wordA}, ${wordB}; finish each word clean and short.`,
      note: {
        en: "Do not add an extra vowel after the final consonant.",
        ja: "語尾の子音の後に、余計な母音を足さないようにします。",
      },
    };
  }

  return {
    text: `${wordA}, ${wordB}, ${wordA} again, then ${wordB}.`,
    note: {
      en: "Practice both target sounds inside one short sentence.",
      ja: "学んだ2つの音を、ひとつの短い文の中で練習します。",
    },
  };
}
