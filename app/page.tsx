import { PageHeader } from "@/components/common/PageHeader";
import { SectionLink } from "@/components/common/SectionLink";
import { IpaPreviewGrid } from "@/components/ipa/IpaPreviewGrid";
import { ipaSections, ipaSymbols } from "@/data/ipa";

export default function HomePage() {
  return (
    <div className="space-y-20">
      <PageHeader
        eyebrow="Version 0.6.0"
        title="ATLAS"
        description="A minimal English IPA learning app with searchable sound maps and study-focused IPA pages."
      />

      <section className="grid gap-4 md:grid-cols-2">
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
