import { LocalizedText } from "@/components/common/LocalizedText";
import { MinimalPairTrainer } from "@/components/training/MinimalPairTrainer";
import { TrainingCategoryOverview } from "@/components/training/TrainingCategoryOverview";
import {
  bVsVPairs,
  finalConsonantPairs,
  rVsLPairs,
  sVsShPairs,
  shortIVsLongEPairs,
  thPairs,
} from "@/data/minimalPairs";
import { trainingCategories } from "@/data/trainingCategories";

const trainingSections = [
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

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="max-w-4xl space-y-6">
        <p className="text-sm uppercase tracking-[0.32em] text-white/40">
          Version 0.9.0
        </p>
        <div className="space-y-3">
          <h1 className="text-6xl font-semibold leading-none text-white md:text-8xl">
            ATLAS
          </h1>
          <p className="text-3xl font-medium text-white/85 md:text-5xl">
            <LocalizedText
              value={{
                en: "AI Pronunciation Trainer",
                ja: "AI発音トレーナー",
              }}
            />
          </p>
        </div>
        <p className="max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
          <LocalizedText
            value={{
              en: "Practice difficult English sounds through minimal pairs.",
              ja: "ミニマルペアで、日本語話者が苦手な英語の音を練習しましょう。",
            }}
          />
        </p>
      </section>

      <TrainingCategoryOverview categories={trainingCategories} />

      {trainingSections.map((section) => (
        <MinimalPairTrainer
          key={section.id}
          id={section.id}
          title={section.title}
          description={section.description}
          pairs={section.pairs}
        />
      ))}
    </div>
  );
}
