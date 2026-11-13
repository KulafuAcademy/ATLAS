// Browser-side data access for the dashboard. It only calls this app's own
// staff-only /api/dashboard/* routes; the Supabase URL and key stay on the
// server (see lib/dashboard/server.ts).

import type { AttemptRow, DailyRow, SoundFocus } from "@/lib/dashboard/aggregate";

async function getRows<T>(path: string, params: { start: string | null; end: string; focus?: SoundFocus | null }): Promise<T[]> {
  const search = new URLSearchParams({ end: params.end });
  if (params.start) search.set("start", params.start);
  if (params.focus) search.set("focus", params.focus);
  const res = await fetch(`${path}?${search.toString()}`, { cache: "no-store" });
  const body = (await res.json().catch(() => null)) as { rows?: T[]; error?: string } | null;
  if (!res.ok || !body?.rows) throw new Error(body?.error ?? `Request failed (${res.status}).`);
  return body.rows;
}

/**
 * `daily_stats` rows from `start` (inclusive; null = all time) to `end`
 * (inclusive). The focus filter is applied client-side so the by-focus chart
 * can still show every focus.
 */
export function fetchDailyStats(start: string | null, end: string): Promise<DailyRow[]> {
  return getRows<DailyRow>("/api/dashboard/daily-stats", { start, end });
}

/** Usable attempts (ok = true) in the Manila date range, for the retry chart. */
export function fetchRetryAttempts(start: string | null, end: string, focus: SoundFocus | null): Promise<AttemptRow[]> {
  return getRows<AttemptRow>("/api/dashboard/retry-attempts", { start, end, focus });
}
