import { PageHeader } from "@/components/common/PageHeader";
import { FilterableIpaList } from "@/components/ipa/FilterableIpaList";
import { getSymbolsByCategory } from "@/lib/ipa";

export default function ConsonantsPage() {
  const consonants = getSymbolsByCategory("consonant");

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow={{ en: "Consonants", ja: "子音" }}
        title={{ en: "English consonant sounds", ja: "英語の子音" }}
        description={{
          en: "Search and filter consonant symbols by place, manner, voicing, and example words.",
          ja: "調音位置・調音方法・有声性・例語から、英語の子音記号を検索できます。",
        }}
      />
      <FilterableIpaList category="consonant" symbols={consonants} />
    </div>
  );
}
