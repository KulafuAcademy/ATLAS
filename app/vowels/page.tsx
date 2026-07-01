import { PageHeader } from "@/components/common/PageHeader";
import { FilterableIpaList } from "@/components/ipa/FilterableIpaList";
import { getSymbolsByCategory } from "@/lib/ipa";

export default function VowelsPage() {
  const vowels = getSymbolsByCategory("vowel");

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow={{ en: "Vowels", ja: "母音" }}
        title={{ en: "English vowel sounds", ja: "英語の母音" }}
        description={{
          en: "Search and filter vowel symbols by tongue backness, height, and example words.",
          ja: "舌の前後位置・高さ・例語から、英語の母音記号を検索できます。",
        }}
      />
      <FilterableIpaList category="vowel" symbols={vowels} />
    </div>
  );
}
