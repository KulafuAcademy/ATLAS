import { PageHeader } from "@/components/common/PageHeader";
import { FilterableIpaList } from "@/components/ipa/FilterableIpaList";
import { getSymbolsByCategory } from "@/lib/ipa";

export default function ConsonantsPage() {
  const consonants = getSymbolsByCategory("consonant");

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Consonants"
        title="English consonant sounds"
        description="Search and filter consonant symbols by place, manner, voicing, and example words."
      />
      <FilterableIpaList category="consonant" symbols={consonants} />
    </div>
  );
}
