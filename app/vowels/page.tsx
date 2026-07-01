import { PageHeader } from "@/components/common/PageHeader";
import { IpaPreviewGrid } from "@/components/ipa/IpaPreviewGrid";
import { getSymbolsByCategory } from "@/lib/ipa";

export default function VowelsPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Vowels"
        title="English vowel sounds"
        description="A starter section for vowel symbols, example words, and articulatory labels."
      />
      <IpaPreviewGrid symbols={getSymbolsByCategory("vowel")} />
    </div>
  );
}
