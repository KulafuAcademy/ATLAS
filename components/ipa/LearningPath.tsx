import Link from "next/link";

import { getLearningPath } from "@/lib/learning";

export function LearningPath() {
  const stages = getLearningPath();

  return (
    <div className="space-y-8">
      {stages.map((stage, stageIndex) => (
        <section key={stage.title} className="border border-white/10 p-6">
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/35">
                Level {stageIndex + 1}
              </p>
              <h2 className="mt-3 text-2xl font-medium text-white">
                {stage.title}
              </h2>
              <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/35">
                {stage.level}
              </p>
              <p className="mt-4 leading-7 text-white/55">
                {stage.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stage.symbols.map((symbol, index) => (
                <Link
                  key={symbol.slug}
                  href={`/ipa/${symbol.slug}`}
                  className="border border-white/10 p-4 transition hover:border-white/35"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-4xl font-semibold text-white">
                      {symbol.symbol}
                    </p>
                    <p className="text-xs text-white/35">
                      {stageIndex + 1}.{index + 1}
                    </p>
                  </div>
                  <p className="mt-3 text-sm font-medium text-white/80">
                    {symbol.label}
                  </p>
                  <p className="mt-2 text-sm capitalize text-white/40">
                    {symbol.category}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
