// Date-only helpers for the dashboard. Days are plain 'YYYY-MM-DD' strings in
// Asia/Manila time. Never pass one to `new Date('YYYY-MM-DD')`: that parses as
// UTC midnight and can render as the previous day. All arithmetic here goes
// through Date.UTC on the parsed parts, so it is independent of the viewer's
// time zone.

export const SCHOOL_TIME_ZONE = "Asia/Manila";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parts(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return { y, m, d };
}

function toUtc(day: string) {
  const { y, m, d } = parts(day);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number) {
  const date = new Date(ms);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today's date in Manila as 'YYYY-MM-DD'. */
export function todayInManila(now: Date = new Date()) {
  return manilaDay(now);
}

/** The Manila calendar day of an instant. */
export function manilaDay(instant: Date | string) {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addDays(day: string, n: number) {
  return fromUtc(toUtc(day) + n * 86_400_000);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(day: string) {
  return (new Date(toUtc(day)).getUTCDay() + 6) % 7;
}

/** Monday of the week containing `day`. */
export function weekStart(day: string) {
  return addDays(day, -weekdayIndex(day));
}

export function daysBetweenInclusive(start: string, end: string) {
  return Math.round((toUtc(end) - toUtc(start)) / 86_400_000) + 1;
}

/** "Oct 12" */
export function formatDay(day: string) {
  const { m, d } = parts(day);
  return `${MONTHS[m - 1]} ${d}`;
}

/** "Oct 12, 2026" */
export function formatDayLong(day: string) {
  const { y } = parts(day);
  return `${formatDay(day)}, ${y}`;
}

/** "Oct 12–18" or "Oct 26 – Nov 1" for the Monday–Sunday week starting `monday`. */
export function formatWeek(monday: string) {
  const sunday = addDays(monday, 6);
  const a = parts(monday);
  const b = parts(sunday);
  return a.m === b.m ? `${MONTHS[a.m - 1]} ${a.d}–${b.d}` : `${formatDay(monday)} – ${formatDay(sunday)}`;
}

export type RangeKey = "today" | "week" | "month" | "all";

export const RANGE_KEYS: RangeKey[] = ["today", "week", "month", "all"];

/** First day of the month containing `day`. */
export function monthStart(day: string) {
  return `${day.slice(0, 7)}-01`;
}

export type DateRange = {
  key: RangeKey;
  /** Inclusive; null = no lower bound (all time). */
  start: string | null;
  /** Inclusive. */
  end: string;
  /** The period of the same length just before this one; null for all time. */
  previous: { start: string; end: string } | null;
};

/**
 * "Today" compares with yesterday. "This week" is Monday → today (lining up
 * with the Monday–Sunday weeks of the weekly chart) and compares with the same
 * days of last week. "This month" is the 1st → today and compares with the
 * same days of last month, cut off at last month's final day.
 */
export function resolveRange(key: RangeKey, today: string = todayInManila()): DateRange {
  if (key === "all") return { key, start: null, end: today, previous: null };
  if (key === "today") {
    const yesterday = addDays(today, -1);
    return { key, start: today, end: today, previous: { start: yesterday, end: yesterday } };
  }
  if (key === "month") {
    const start = monthStart(today);
    const lastMonthEnd = addDays(start, -1);
    const lastMonthStart = monthStart(lastMonthEnd);
    const sameDay = addDays(lastMonthStart, parts(today).d - 1);
    const prevEnd = sameDay > lastMonthEnd ? lastMonthEnd : sameDay;
    return { key, start, end: today, previous: { start: lastMonthStart, end: prevEnd } };
  }
  const start = weekStart(today);
  return {
    key,
    start,
    end: today,
    previous: { start: addDays(start, -7), end: addDays(today, -7) },
  };
}

export function isRangeKey(value: unknown): value is RangeKey {
  return typeof value === "string" && (RANGE_KEYS as string[]).includes(value);
}
