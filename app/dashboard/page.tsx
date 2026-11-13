import { PageHeader } from "@/components/common/PageHeader";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { isSoundFocus } from "@/lib/dashboard/aggregate";
import { isRangeKey, todayInManila } from "@/lib/dashboard/dates";

type DashboardPageProps = {
  searchParams: Promise<{
    range?: string;
    focus?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const query = await searchParams;

  return (
    <div className="space-y-10">
      <PageHeader
        compact
        eyebrow={{ en: "Teacher dashboard", ja: "先生用ダッシュボード" }}
        title={{ en: "Speech practice stats", ja: "発音練習の記録" }}
        description={{
          en: "See which sounds and words kids find hardest, and whether they are improving. Totals for the whole class; no individual data.",
          ja: "子どもたちが難しいと感じる音や単語と、上達しているかどうかを確認できます。クラス全体の集計で、個人のデータは含みません。",
        }}
      />
      <Dashboard
        initialRange={isRangeKey(query.range) ? query.range : "4w"}
        initialFocus={isSoundFocus(query.focus) ? query.focus : null}
        today={todayInManila()}
      />
    </div>
  );
}
