import { PageHeader } from "@/components/common/PageHeader";
import { SoundLibrary } from "@/components/sounds/SoundLibrary";
import { ipaSymbols } from "@/data/ipa";

export default function SoundsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        compact
        eyebrow={{ en: "Sound library", ja: "音の図鑑" }}
        title={{
          en: "Find and explore every English sound.",
          ja: "英語の音を、見つけて深く学ぶ。",
        }}
        description={{
          en: "Search vowels and consonants by IPA symbol, articulation, and example words.",
          ja: "母音・子音を、IPA記号、口の使い方、例語から検索できます。",
        }}
      />
      <SoundLibrary symbols={ipaSymbols} />
    </div>
  );
}
