import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/PageHeader";
import { getSymbolBySlug } from "@/lib/ipa";

type IpaDetailPageProps = {
  params: Promise<{
    symbol: string;
  }>;
};

export default async function IpaDetailPage({ params }: IpaDetailPageProps) {
  const { symbol } = await params;
  const ipaSymbol = getSymbolBySlug(symbol);

  if (!ipaSymbol) {
    notFound();
  }

  const backHref = ipaSymbol.category === "vowel" ? "/vowels" : "/consonants";

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="IPA Detail"
        title={ipaSymbol.symbol}
        description={ipaSymbol.label}
      />

      <section className="grid gap-8 border-t border-white/10 pt-10 md:grid-cols-[0.8fr_1.2fr]">
        <p className="text-8xl font-semibold text-white">{ipaSymbol.symbol}</p>
        <div className="space-y-8 text-white/65">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.28em] text-white/35">
              Category
            </p>
            <p className="text-xl capitalize text-white">{ipaSymbol.category}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.28em] text-white/35">
              Description
            </p>
            <p className="leading-7">{ipaSymbol.description}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.28em] text-white/35">
              Examples
            </p>
            <p className="leading-7">{ipaSymbol.exampleWords.join(", ")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {ipaSymbol.category === "vowel" ? (
              <>
                <Attribute label="Height" value={ipaSymbol.height} />
                <Attribute label="Backness" value={ipaSymbol.backness} />
                <Attribute
                  label="Rounding"
                  value={ipaSymbol.rounded ? "rounded" : "unrounded"}
                />
              </>
            ) : (
              <>
                <Attribute label="Place" value={ipaSymbol.place} />
                <Attribute label="Manner" value={ipaSymbol.manner} />
                <Attribute label="Voicing" value={ipaSymbol.voicing} />
              </>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.28em] text-white/35">
              Notes
            </p>
            <p className="leading-7">{ipaSymbol.notes}</p>
          </div>
          <Link
            href={backHref}
            className="inline-flex text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
          >
            Back to {ipaSymbol.category}s
          </Link>
        </div>
      </section>
    </div>
  );
}

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="mt-2 capitalize text-white">{value}</p>
    </div>
  );
}
