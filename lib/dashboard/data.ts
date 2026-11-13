// Browser-side data access for the dashboard. It only calls this app's own
// staff-only /api/dashboard/daily-stats route; the Supabase URL and key stay
// on the server (see lib/dashboard/server.ts).

import type { DailyRow } from "@/lib/dashboard/aggregate";

/**
 * `daily_stats` rows from `start` (inclusive; null = all time) to `end`
 * (inclusive). The focus filter is applied client-side so the by-focus chart
 * can still show every focus.
 */
export async function fetchDailyStats(start: string | null, end: string): Promise<DailyRow[]> {
  const search = new URLSearchParams({ end });
  if (start) search.set("start", start);
  const res = await fetch(`/api/dashboard/daily-stats?${search.toString()}`, { cache: "no-store" });
  const body = (await res.json().catch(() => null)) as { rows?: DailyRow[]; error?: string } | null;
  if (!res.ok || !body?.rows) throw new Error(body?.error ?? `Request failed (${res.status}).`);
  return body.rows;
}
