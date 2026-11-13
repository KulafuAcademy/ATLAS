import { PageHeader } from "@/components/common/PageHeader";
import { ItemList } from "@/components/dashboard/ItemList";
import { isSoundFocus } from "@/lib/dashboard/aggregate";
import { isRangeKey, todayInManila } from "@/lib/dashboard/dates";

type ItemsPageProps = {
  searchParams: Promise<{
    kind?: string;
    range?: string;
    focus?: string;
  }>;
};

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const query = await searchParams;

  return (
    <div className="space-y-10">
      <PageHeader
        compact
        eyebrow={{ en: "Teacher dashboard", ja: "先生用ダッシュボード" }}
        title={{ en: "Words & tongue twisters", ja: "単語と早口文" }}
        description={{
          en: "Every practiced word and tongue twister with its class totals. Select one to see how it is going over time.",
          ja: "練習された単語と早口文のクラス全体の集計です。項目を選ぶと推移を確認できます。",
        }}
      />
      <ItemList
        initialKind={query.kind === "tongue_twisters" ? "tongue_twisters" : "words"}
        initialRange={isRangeKey(query.range) ? query.range : "all"}
        initialFocus={isSoundFocus(query.focus) ? query.focus : null}
        today={todayInManila()}
      />
    </div>
  );
}
