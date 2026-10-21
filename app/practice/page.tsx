import { PageHeader } from "@/components/common/PageHeader";
import { PracticeLibrary } from "@/components/practice/PracticeLibrary";
import { trainingCategories } from "@/data/trainingCategories";
import { trainingSections } from "@/data/trainingSections";

type PracticePageProps = {
  searchParams: Promise<{
    category?: string;
    mode?: string;
  }>;
};

const lessonPageCopy: Record<
  string,
  { title: { en: string; ja: string }; description: { en: string; ja: string } }
> = {
  "r-vs-l": {
    title: { en: "R and L Lesson", ja: "RとLの学習" },
    description: {
      en: "See whether the tongue tip touches, then practice with words such as right and light.",
      ja: "舌先が触れるか触れないかを見て、right / light などの単語で練習します。",
    },
  },
  "b-v": {
    title: { en: "B and V Lesson", ja: "BとVの学習" },
    description: {
      en: "Compare closed lips for B with upper teeth on the lower lip for V.",
      ja: "両唇を閉じるBと、上の歯を下唇に当てるVを見比べて練習します。",
    },
  },
  "s-sh": {
    title: { en: "S and SH Lesson", ja: "SとSHの学習" },
    description: {
      en: "See how tongue placement and lip rounding separate a sharp S from a wider SH.",
      ja: "舌を置く位置と唇の丸め方を見て、鋭いSと幅のあるSHを区別します。",
    },
  },
  "short-i-long-e": {
    title: { en: "Short I and Long E Lesson", ja: "短いIと長いEの学習" },
    description: {
      en: "Practice differences in tongue height and jaw opening with words such as sit and seat.",
      ja: "sit / seat のような単語で、舌の高さと口の開き方の違いを練習します。",
    },
  },
  th: {
    title: { en: "TH Lesson", ja: "THの学習" },
    description: {
      en: "Compare TH with the tongue between the teeth and S with the tongue behind them.",
      ja: "舌先を前歯の間に置くTHと、舌を歯の後ろに置くSの違いを確認します。",
    },
  },
  "final-consonants": {
    title: { en: "Final Consonants Lesson", ja: "語尾の子音の学習" },
    description: {
      en: "Practice stopping on the final consonant without adding an extra vowel.",
      ja: "語尾の子音で音を止め、あとに余分な母音を足さない発音を練習します。",
    },
  },
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const query = await searchParams;
  const selectedIndex = trainingSections.findIndex(
    (section) => section.id === query.category,
  );
  const copy = query.category ? lessonPageCopy[query.category] : undefined;
  const lessonNumber = String(selectedIndex + 1).padStart(2, "0");

  return (
    <div className="space-y-10">
      <PageHeader
        compact
        eyebrow={
          selectedIndex >= 0
            ? { en: `Pronunciation lesson ${lessonNumber}`, ja: `発音レッスン ${lessonNumber}` }
            : { en: "All practice", ja: "すべての実践" }
        }
        title={
          copy?.title ?? {
            en: "Build your listening and speaking skills.",
            ja: "聞く力と、話す力を育てよう。",
          }
        }
        description={
          copy?.description ?? {
            en: "Practice minimal-pair listening, pronunciation checks, and tongue twisters.",
            ja: "ミニマルペアの聞き分けと、発音チェック・早口文を練習できます。",
          }
        }
      />
      <PracticeLibrary
        categories={trainingCategories}
        sections={trainingSections}
        initialCategory={query.category}
        initialMode={
          query.mode === "speaking" || query.mode === "learn" ? "speaking" : "listening"
        }
      />
    </div>
  );
}
