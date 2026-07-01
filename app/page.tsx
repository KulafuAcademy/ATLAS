import { MinimalPairTrainer } from "@/components/training/MinimalPairTrainer";
import { rVsLPairs } from "@/data/minimalPairs";

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
            AI Pronunciation Trainer
          </p>
        </div>
        <p className="max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
          Practice difficult English sounds through minimal pairs.
        </p>
      </section>

      <MinimalPairTrainer
        title="R vs L"
        description="A first set for Japanese learners practicing one of the most common English sound contrasts."
        pairs={rVsLPairs}
      />
    </div>
  );
}
