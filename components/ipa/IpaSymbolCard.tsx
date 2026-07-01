import Link from "next/link";

import type { IpaSymbol } from "@/types/ipa";

type IpaSymbolCardProps = {
  symbol: IpaSymbol;
};

export function IpaSymbolCard({ symbol }: IpaSymbolCardProps) {
  return (
    <Link
      href={`/ipa/${symbol.slug}`}
      className="group flex min-h-56 flex-col justify-between border border-white/10 p-6 transition hover:border-white/35"
    >
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-white/35">
          {symbol.category}
        </p>
        <p className="text-6xl font-semibold text-white">{symbol.symbol}</p>
        <p className="text-lg font-medium text-white/85">{symbol.label}</p>
      </div>
      <p className="leading-7 text-white/55 transition group-hover:text-white/75">
        {symbol.description}
      </p>
    </Link>
  );
}
