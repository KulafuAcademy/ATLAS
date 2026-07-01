import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/PageHeader";
import { getRelatedSymbols, getSymbolBySlug } from "@/lib/ipa";

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
  const relatedSymbols = getRelatedSymbols(ipaSymbol);
  const learningFocus =
    ipaSymbol.category === "vowel"
      ? [
          `Tongue height: ${ipaSymbol.height}`,
          `Tongue position: ${ipaSymbol.backness}`,
          `Lip shape: ${ipaSymbol.rounded ? "rounded" : "unrounded"}`,
        ]
      : [
          `Place: ${ipaSymbol.place}`,
          `Manner: ${ipaSymbol.manner}`,
          `Voicing: ${ipaSymbol.voicing}`,
        ];

  return (
    <div className="space-y-16">
      <PageHeader
        eyebrow="Study"
        title={ipaSymbol.symbol}
        description={ipaSymbol.label}
      />

      <section className="grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="border border-white/10 p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-white/35">
              Symbol
            </p>
            <p className="mt-6 text-8xl font-semibold text-white md:text-9xl">
              {ipaSymbol.symbol}
            </p>
            <p className="mt-6 text-xl text-white/75">{ipaSymbol.label}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {learningFocus.map((item) => (
              <div key={item} className="border border-white/10 p-4">
                <p className="text-sm text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <StudyPanel title="What To Notice">
            <p>{ipaSymbol.description}</p>
          </StudyPanel>

          <StudyPanel title="Example Words">
            <div className="grid gap-3 sm:grid-cols-3">
              {ipaSymbol.exampleWords.map((word) => (
                <div key={word} className="border border-white/10 p-4">
                  <p className="text-lg text-white">{word}</p>
                </div>
              ))}
            </div>
          </StudyPanel>

          <StudyPanel title="Articulation">
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
          </StudyPanel>

          <StudyPanel title="Notes">
            <p>{ipaSymbol.notes}</p>
          </StudyPanel>
        </div>
      </section>

      <section className="space-y-6 border-t border-white/10 pt-10">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-white/35">
            Compare
          </p>
          <h2 className="mt-3 text-2xl font-medium text-white">
            Nearby sounds
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedSymbols.map((related) => (
            <Link
              key={related.slug}
              href={`/ipa/${related.slug}`}
              className="border border-white/10 p-5 transition hover:border-white/35"
            >
              <p className="text-4xl font-semibold text-white">
                {related.symbol}
              </p>
              <p className="mt-3 text-sm font-medium text-white/75">
                {related.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 pt-10">
        <Link
          href={backHref}
          className="inline-flex text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
        >
          Back to {ipaSymbol.category}s
        </Link>
      </section>
    </div>
  );
}

function StudyPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-white/35">
        {title}
      </p>
      <div className="mt-4 leading-7 text-white/65">{children}</div>
    </section>
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
