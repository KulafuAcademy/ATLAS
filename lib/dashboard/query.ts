const DAY = /^\d{4}-\d{2}-\d{2}$/;

export type DashboardQuery = { start: string | null; end: string };

/** Parses and validates ?start=&end= for /api/dashboard/daily-stats; null if invalid. */
export function parseDashboardQuery(url: string): DashboardQuery | null {
  const params = new URL(url).searchParams;
  const start = params.get("start");
  const end = params.get("end");
  if (!end || !DAY.test(end) || (start !== null && !DAY.test(start))) return null;
  return { start, end };
}
