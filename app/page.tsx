import { PageHeader } from "@/components/common/PageHeader";
import { SectionLink } from "@/components/common/SectionLink";
import { IpaPreviewGrid } from "@/components/ipa/IpaPreviewGrid";
import { ipaSections, ipaSymbols } from "@/data/ipa";
import { getRecommendedStartSymbols } from "@/lib/learning";

export default function HomePage() {
  const recommendedSymbols = getRecommendedStartSymbols();

  return (
    <div className="space-y-20">
      <PageHeader
        eyebrow="Version 0.7.0"
        title="ATLAS"
        description="A minimal English IPA learning app with searchable sound maps, study pages, and a suggested learning path."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <SectionLink
          title="Learning Path"
          description="Follow a suggested order from foundation sounds into contrast sets."
          href="/learn"
        />
        {ipaSections.map((section) => (
          <SectionLink
            key={section.href}
            title={section.title}
            description={section.description}
            href={section.href}
          />
        ))}
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            Recommended Start
          </p>
          <h2 className="text-2xl font-medium md:text-3xl">
            Begin with these sounds
          </h2>
        </div>
        <IpaPreviewGrid symbols={recommendedSymbols} />
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            Preview
          </p>
          <h2 className="text-2xl font-medium md:text-3xl">
            Starter IPA entries
          </h2>
        </div>
        <IpaPreviewGrid symbols={ipaSymbols.slice(0, 4)} />
      </section>
    </div>
  );
}
