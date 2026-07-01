import { PageHeader } from "@/components/common/PageHeader";
import { IpaPreviewGrid } from "@/components/ipa/IpaPreviewGrid";
import { getSymbolsByCategory } from "@/lib/ipa";

export default function ConsonantsPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Consonants"
        title="English consonant sounds"
        description="A starter section for consonant symbols with place, manner, and voicing."
      />
      <IpaPreviewGrid symbols={getSymbolsByCategory("consonant")} />
    </div>
  );
}
