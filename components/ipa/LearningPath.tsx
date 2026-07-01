"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import { formatCategory, formatTerm, getSymbolCopy, resolveText, uiText } from "@/lib/i18n";
import { getLearningPath } from "@/lib/learning";

export function LearningPath() {
  const { language, text } = useLanguage();
  const stages = getLearningPath();

  return (
    <div className="space-y-8">
      {stages.map((stage, stageIndex) => (
        <section
          key={resolveText(stage.title, "en")}
          className="border border-white/10 p-6"
        >
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/35">
                {text(uiText.level)} {stageIndex + 1}
              </p>
              <h2 className="mt-3 text-2xl font-medium text-white">
                {resolveText(stage.title, language)}
              </h2>
              <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/35">
                {formatTerm(stage.level, language)}
              </p>
              <p className="mt-4 leading-7 text-white/55">
                {resolveText(stage.description, language)}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stage.symbols.map((symbol, index) => {
                const copy = getSymbolCopy(symbol, language);

                return (
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
                      {copy.label}
                    </p>
                    <p className="mt-2 text-sm capitalize text-white/40">
                      {formatCategory(symbol.category, language)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
