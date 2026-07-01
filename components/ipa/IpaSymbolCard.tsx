"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import { formatCategory, getSymbolCopy } from "@/lib/i18n";
import type { IpaSymbol } from "@/types/ipa";

type IpaSymbolCardProps = {
  symbol: IpaSymbol;
};

export function IpaSymbolCard({ symbol }: IpaSymbolCardProps) {
  const { language } = useLanguage();
  const copy = getSymbolCopy(symbol, language);

  return (
    <Link
      href={`/ipa/${symbol.slug}`}
      className="group flex min-h-56 flex-col justify-between border border-white/10 p-6 transition hover:border-white/35"
    >
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-white/35">
          {formatCategory(symbol.category, language)}
        </p>
        <p className="text-6xl font-semibold text-white">{symbol.symbol}</p>
        <p className="text-lg font-medium text-white/85">{copy.label}</p>
      </div>
      <p className="leading-7 text-white/55 transition group-hover:text-white/75">
        {copy.description}
      </p>
    </Link>
  );
}
