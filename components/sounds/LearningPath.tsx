"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import { getSymbolCopy, resolveText } from "@/lib/i18n";
import type { IpaSymbol, LearningStage } from "@/types/ipa";

type LearningPathProps = {
  stages: Array<LearningStage & { symbols: IpaSymbol[] }>;
};

export function LearningPath({ stages }: LearningPathProps) {
  const { language } = useLanguage();

  return (
    <div className="space-y-5">
      {stages.map((stage, stageIndex) => {
        const offset = stages
          .slice(0, stageIndex)
          .reduce((total, item) => total + item.symbols.length, 0);

        return (
          <section
            key={resolveText(stage.title, "en")}
            className="border border-white/10 p-5 sm:p-6"
          >
            <div className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-semibold text-black">
                {stageIndex + 1}
              </span>
              <div>
                <h2 className="text-xl font-medium text-white">
                  {resolveText(stage.title, language)}
                </h2>
                <p className="mt-1 text-sm leading-6 text-white/55">
                  {resolveText(stage.description, language)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {stage.symbols.map((symbol, symbolIndex) => (
                <Link
                  key={symbol.slug}
                  href={`/sounds/${symbol.slug}`}
                  className="flex items-center gap-3 border border-white/10 p-3 transition hover:border-white/35 hover:bg-white/3"
                >
                  <span className="text-2xl font-semibold text-white">
                    {symbol.symbol}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white/85">
                      {getSymbolCopy(symbol, language).label}
                    </p>
                    <p className="text-xs text-white/40">
                      {language === "ja" ? "ステップ" : "Step"}{" "}
                      {offset + symbolIndex + 1}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
