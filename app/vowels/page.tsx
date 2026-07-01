import { PageHeader } from "@/components/common/PageHeader";
import { IpaPreviewGrid } from "@/components/ipa/IpaPreviewGrid";
import { getSymbolsByCategory } from "@/lib/ipa";

export default function VowelsPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Vowels"
        title="English vowel sounds"
        description="A placeholder section for vowel symbols. Real IPA content will be added after the foundation is stable."
      />
      <IpaPreviewGrid symbols={getSymbolsByCategory("vowel")} />
    </div>
  );
}
