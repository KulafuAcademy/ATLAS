import { IpaSymbolCard } from "@/components/ipa/IpaSymbolCard";
import type { IpaSymbol } from "@/types/ipa";

type IpaPreviewGridProps = {
  symbols: IpaSymbol[];
};

export function IpaPreviewGrid({ symbols }: IpaPreviewGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {symbols.map((symbol) => (
        <IpaSymbolCard key={symbol.slug} symbol={symbol} />
      ))}
    </div>
  );
}
