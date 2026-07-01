import { PageHeader } from "@/components/common/PageHeader";
import { LocalizedText } from "@/components/common/LocalizedText";
import { SectionLink } from "@/components/common/SectionLink";
import { IpaPreviewGrid } from "@/components/ipa/IpaPreviewGrid";
import { ipaSections, ipaSymbols } from "@/data/ipa";
import { getRecommendedStartSymbols } from "@/lib/learning";

export default function HomePage() {
  const recommendedSymbols = getRecommendedStartSymbols();

  return (
    <div className="space-y-20">
      <PageHeader
        eyebrow="Version 0.8.0"
        title="ATLAS"
        description={{
          en: "A minimal English IPA learning app with searchable sound maps, study pages, and a suggested learning path.",
          ja: "検索できる音声マップ、学習ページ、推奨学習順を備えた英語IPA学習アプリです。",
        }}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <SectionLink
          title={{ en: "Learning Path", ja: "学習順序" }}
          description={{
            en: "Follow a suggested order from foundation sounds into contrast sets.",
            ja: "基礎の音から対比セットへ進む、推奨の学習順です。",
          }}
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
            <LocalizedText
              value={{ en: "Recommended Start", ja: "最初のおすすめ" }}
            />
          </p>
          <h2 className="text-2xl font-medium md:text-3xl">
            <LocalizedText
              value={{
                en: "Begin with these sounds",
                ja: "この音から始めましょう",
              }}
            />
          </h2>
        </div>
        <IpaPreviewGrid symbols={recommendedSymbols} />
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            <LocalizedText value={{ en: "Preview", ja: "プレビュー" }} />
          </p>
          <h2 className="text-2xl font-medium md:text-3xl">
            <LocalizedText
              value={{ en: "Starter IPA entries", ja: "IPAエントリー一覧" }}
            />
          </h2>
        </div>
        <IpaPreviewGrid symbols={ipaSymbols.slice(0, 4)} />
      </section>
    </div>
  );
}
