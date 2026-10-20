import { PageHeader } from "@/components/common/PageHeader";
import { LearningPath } from "@/components/sounds/LearningPath";
import { getLearningPath } from "@/lib/learning";

export default function PathPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        compact
        eyebrow={{ en: "Learning path", ja: "学習順序" }}
        title={{
          en: "Build from foundation sounds, one step at a time.",
          ja: "基礎の音から、少しずつ広げよう。",
        }}
        description={{
          en: "The complete Atlas path across foundations, vowel contrasts, consonant contrasts, and advanced recognition.",
          ja: "学習順序を、基礎・母音対比・子音対比・発展の4段階で収録しています。",
        }}
      />
      <LearningPath stages={getLearningPath()} />
    </div>
  );
}
