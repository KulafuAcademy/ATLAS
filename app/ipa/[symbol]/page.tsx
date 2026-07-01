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
        description={ipaSymbol.description}
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
              Status
            </p>
            <p className="leading-7">
              Placeholder detail page. Pronunciation, audio, quizzes, and
              learning logic are intentionally out of scope for Version 0.1.0.
            </p>
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
