import { PageHeader } from "@/components/common/PageHeader";
import { ConsonantClassifiedList } from "@/components/ipa/IpaClassifiedList";
import { getSymbolsByCategory } from "@/lib/ipa";

export default function ConsonantsPage() {
  const consonants = getSymbolsByCategory("consonant");

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Consonants"
        title="English consonant sounds"
        description="A classified view of consonant symbols by place and manner of articulation."
      />
      <ConsonantClassifiedList symbols={consonants} />
    </div>
  );
}
