import { LocalizedText } from "@/components/common/LocalizedText";
import { MinimalPairTrainer } from "@/components/training/MinimalPairTrainer";
import { TrainingCategoryOverview } from "@/components/training/TrainingCategoryOverview";
import { rVsLPairs } from "@/data/minimalPairs";
import { trainingCategories } from "@/data/trainingCategories";

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

      <MinimalPairTrainer
        id="r-vs-l"
        title={{ en: "R vs L", ja: "R vs L" }}
        description={{
          en: "A first set for Japanese learners practicing one of the most common English sound contrasts.",
          ja: "日本語話者がつまずきやすい代表的な英語の音の違いを練習する最初のセットです。",
        }}
        pairs={rVsLPairs}
      />
    </div>
  );
}
