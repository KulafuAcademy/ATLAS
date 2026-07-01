import { PageHeader } from "@/components/common/PageHeader";
import { LearningPath } from "@/components/ipa/LearningPath";

export default function LearnPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow={{ en: "Learning Path", ja: "学習順序" }}
        title={{
          en: "A suggested order for English IPA.",
          ja: "英語IPAのおすすめ学習順です。",
        }}
        description={{
          en: "Move from frequent foundation sounds into contrast sets, then into recognition builders for dictionary reading.",
          ja: "頻度の高い基礎音から対比セットへ進み、辞書の発音表記を読める力につなげます。",
        }}
      />
      <LearningPath />
    </div>
  );
}
