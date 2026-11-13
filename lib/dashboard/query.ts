import { isSoundFocus, type SoundFocus } from "@/lib/dashboard/aggregate";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export type DashboardQuery = { start: string | null; end: string; focus: SoundFocus | null };

/** Parses and validates ?start=&end=&focus= for the /api/dashboard/* routes; null if invalid. */
export function parseDashboardQuery(url: string): DashboardQuery | null {
  const params = new URL(url).searchParams;
  const start = params.get("start");
  const end = params.get("end");
  const focus = params.get("focus");
  if (!end || !DAY.test(end) || (start !== null && !DAY.test(start))) return null;
  if (focus !== null && !isSoundFocus(focus)) return null;
  return { start, end, focus };
}
