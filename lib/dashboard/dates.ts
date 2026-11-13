// Date-only helpers for the dashboard. Days are plain 'YYYY-MM-DD' strings in
// Asia/Manila time. Never pass one to `new Date('YYYY-MM-DD')`: that parses as
// UTC midnight and can render as the previous day. All arithmetic here goes
// through Date.UTC on the parsed parts, so it is independent of the viewer's
// time zone.

export const SCHOOL_TIME_ZONE = "Asia/Manila";
const MANILA_OFFSET = "+08:00"; // Manila has no daylight saving time.

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

/** The Manila calendar day of an instant (e.g. `attempts.created_at`). */
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

/** "Oct 12–16" or "Oct 26 – Nov 1" for the Mon–Fri school week starting `monday`. */
export function formatSchoolWeek(monday: string) {
  const friday = addDays(monday, 4);
  const a = parts(monday);
  const b = parts(friday);
  return a.m === b.m ? `${MONTHS[a.m - 1]} ${a.d}–${b.d}` : `${formatDay(monday)} – ${formatDay(friday)}`;
}

/** Start of a Manila day as a timestamptz literal, for filtering `created_at`. */
export function manilaDayStartTimestamp(day: string) {
  return `${day}T00:00:00${MANILA_OFFSET}`;
}

export type RangeKey = "today" | "week" | "4w" | "all";

export const RANGE_KEYS: RangeKey[] = ["today", "week", "4w", "all"];

/** The school day (Mon–Fri) before `day`. */
export function previousSchoolDay(day: string) {
  let prev = addDays(day, -1);
  while (weekdayIndex(prev) > 4) prev = addDays(prev, -1);
  return prev;
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
 * "Today" compares with the previous school day (so Monday compares with
 * Friday, not an empty Sunday). Week ranges are aligned to Monday so they line
 * up with the weekly chart: "This week" is Monday → today; "Last 4 weeks" is
 * this week plus the three before it. The previous period is the same span
 * shifted back.
 */
export function resolveRange(key: RangeKey, today: string = todayInManila()): DateRange {
  if (key === "all") return { key, start: null, end: today, previous: null };
  if (key === "today") {
    const prev = previousSchoolDay(today);
    return { key, start: today, end: today, previous: { start: prev, end: prev } };
  }
  const weeks = key === "week" ? 1 : 4;
  const start = addDays(weekStart(today), -7 * (weeks - 1));
  const shift = -7 * weeks;
  return {
    key,
    start,
    end: today,
    previous: { start: addDays(start, shift), end: addDays(today, shift) },
  };
}

export function isRangeKey(value: unknown): value is RangeKey {
  return typeof value === "string" && (RANGE_KEYS as string[]).includes(value);
}
