import { PageHeader } from "@/components/common/PageHeader";
import { LearningPath } from "@/components/ipa/LearningPath";

export default function LearnPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Learning Path"
        title="A suggested order for English IPA."
        description="Move from frequent foundation sounds into contrast sets, then into recognition builders for dictionary reading."
      />
      <LearningPath />
    </div>
  );
}
