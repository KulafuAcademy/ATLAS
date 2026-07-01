import { PageHeader } from "@/components/common/PageHeader";
import { IpaPreviewGrid } from "@/components/ipa/IpaPreviewGrid";
import { getSymbolsByCategory } from "@/lib/ipa";

export default function ConsonantsPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Consonants"
        title="English consonant sounds"
        description="A placeholder section for consonant symbols. Place, manner, and voicing can be added later."
      />
      <IpaPreviewGrid symbols={getSymbolsByCategory("consonant")} />
    </div>
  );
}
