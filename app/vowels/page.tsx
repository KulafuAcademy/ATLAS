import { PageHeader } from "@/components/common/PageHeader";
import { VowelClassifiedList } from "@/components/ipa/IpaClassifiedList";
import { getSymbolsByCategory } from "@/lib/ipa";

export default function VowelsPage() {
  const vowels = getSymbolsByCategory("vowel");

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Vowels"
        title="English vowel sounds"
        description="A classified view of vowel symbols by tongue backness and height."
      />
      <VowelClassifiedList symbols={vowels} />
    </div>
  );
}
