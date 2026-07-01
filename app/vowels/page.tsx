import { PageHeader } from "@/components/common/PageHeader";
import { FilterableIpaList } from "@/components/ipa/FilterableIpaList";
import { getSymbolsByCategory } from "@/lib/ipa";

export default function VowelsPage() {
  const vowels = getSymbolsByCategory("vowel");

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Vowels"
        title="English vowel sounds"
        description="Search and filter vowel symbols by tongue backness, height, and example words."
      />
      <FilterableIpaList category="vowel" symbols={vowels} />
    </div>
  );
}
