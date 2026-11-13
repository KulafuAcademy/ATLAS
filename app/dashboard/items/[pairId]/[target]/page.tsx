import { notFound } from "next/navigation";

import { ItemDetail } from "@/components/dashboard/ItemDetail";
import { isTarget } from "@/lib/dashboard/aggregate";
import { isRangeKey, todayInManila } from "@/lib/dashboard/dates";

type ItemPageProps = {
  params: Promise<{ pairId: string; target: string }>;
  searchParams: Promise<{ range?: string }>;
};

export default async function ItemPage({ params, searchParams }: ItemPageProps) {
  const { pairId, target } = await params;
  const query = await searchParams;
  const id = Number(pairId);
  if (!Number.isInteger(id) || id <= 0 || !isTarget(target)) notFound();

  return (
    <ItemDetail
      key={`${id}-${target}`}
      pairId={id}
      target={target}
      initialRange={isRangeKey(query.range) ? query.range : "all"}
      today={todayInManila()}
    />
  );
}
