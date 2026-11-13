// Pure aggregation helpers for the dashboard. Rates are always recomputed from
// sums (perfect / attempts), never by averaging per-row `perfect_rate`.

import { weekStart } from "@/lib/dashboard/dates";

export const SOUND_FOCUSES = [
  "R vs L",
  "B vs V",
  "S vs SH",
  "Short I vs Long E",
  "TH sounds",
  "Final consonants",
] as const;

export type SoundFocus = (typeof SOUND_FOCUSES)[number];

export function isSoundFocus(value: unknown): value is SoundFocus {
  return typeof value === "string" && (SOUND_FOCUSES as readonly string[]).includes(value);
}

export type Target = "word_a" | "word_b" | "tongue_twister";

export type DailyRow = {
  day: string;
  sound_focus: string;
  pair_no: number;
  pair_id: number;
  target: Target;
  text: string;
  pair_word: string | null;
  tries: number;
  attempts: number;
  perfect: number;
  avg_score: number | null;
};

export type Stats = {
  tries: number;
  attempts: number;
  perfect: number;
  /** Percent of usable attempts that were perfect; null when there were none. */
  rate: number | null;
  /** Attempt-weighted average score; null when there were none. */
  avgScore: number | null;
};

type Acc = { tries: number; attempts: number; perfect: number; scoreSum: number; scoreWeight: number };

const newAcc = (): Acc => ({ tries: 0, attempts: 0, perfect: 0, scoreSum: 0, scoreWeight: 0 });

function add(acc: Acc, row: DailyRow) {
  acc.tries += row.tries;
  acc.attempts += row.attempts;
  acc.perfect += row.perfect;
  if (row.avg_score !== null && row.attempts > 0) {
    acc.scoreSum += row.avg_score * row.attempts;
    acc.scoreWeight += row.attempts;
  }
}

function finish(acc: Acc): Stats {
  return {
    tries: acc.tries,
    attempts: acc.attempts,
    perfect: acc.perfect,
    rate: acc.attempts > 0 ? (acc.perfect / acc.attempts) * 100 : null,
    avgScore: acc.scoreWeight > 0 ? acc.scoreSum / acc.scoreWeight : null,
  };
}

function groupBy<K>(rows: DailyRow[], key: (row: DailyRow) => K) {
  const map = new Map<K, { acc: Acc; first: DailyRow }>();
  for (const row of rows) {
    const k = key(row);
    let entry = map.get(k);
    if (!entry) {
      entry = { acc: newAcc(), first: row };
      map.set(k, entry);
    }
    add(entry.acc, row);
  }
  return map;
}

/** Converts a raw Supabase row (numerics may arrive as strings) into a DailyRow. */
export function toDailyRow(raw: Record<string, unknown>): DailyRow {
  return {
    day: String(raw.day),
    sound_focus: String(raw.sound_focus),
    pair_no: Number(raw.pair_no),
    pair_id: Number(raw.pair_id),
    target: raw.target as Target,
    text: String(raw.text),
    pair_word: raw.pair_word == null ? null : String(raw.pair_word),
    tries: Number(raw.tries) || 0,
    attempts: Number(raw.attempts) || 0,
    perfect: Number(raw.perfect) || 0,
    avg_score: raw.avg_score == null ? null : Number(raw.avg_score),
  };
}

export function filterRows(rows: DailyRow[], opts: { start: string | null; end: string; focus: SoundFocus | null }) {
  return rows.filter(
    (row) =>
      (opts.start === null || row.day >= opts.start) &&
      row.day <= opts.end &&
      (opts.focus === null || row.sound_focus === opts.focus),
  );
}

export function totals(rows: DailyRow[]): Stats {
  const acc = newAcc();
  rows.forEach((row) => add(acc, row));
  return finish(acc);
}

export function daysPractised(rows: DailyRow[]) {
  return new Set(rows.filter((row) => row.tries > 0).map((row) => row.day)).size;
}

export type DayPoint = Stats & { day: string };

/** One point per day that has data, in date order (days without practice are left out, not zero). */
export function byDay(rows: DailyRow[]): DayPoint[] {
  return [...groupBy(rows, (row) => row.day)]
    .map(([day, { acc }]) => ({ day, ...finish(acc) }))
    .filter((point) => point.tries > 0)
    .sort((a, b) => a.day.localeCompare(b.day));
}

export type FocusPoint = Stats & { focus: SoundFocus };

/** Hardest first (lowest perfect rate); focuses with no usable attempts go last. */
export function byFocus(rows: DailyRow[]): FocusPoint[] {
  const groups = groupBy(rows, (row) => row.sound_focus);
  return SOUND_FOCUSES.map((focus) => {
    const entry = groups.get(focus);
    return { focus, ...finish(entry ? entry.acc : newAcc()) };
  })
    .filter((point) => point.tries > 0)
    .sort((a, b) => (a.rate ?? Infinity) - (b.rate ?? Infinity));
}

export type WeekRow = { week: string } & Partial<Record<SoundFocus, Stats>>;

/** Perfect rate per Monday–Sunday week, per focus. */
export function byWeekAndFocus(rows: DailyRow[]): WeekRow[] {
  const groups = groupBy(rows, (row) => `${weekStart(row.day)}|${row.sound_focus}`);
  const weeks = new Map<string, WeekRow>();
  for (const [key, { acc }] of groups) {
    const [week, focus] = key.split("|");
    if (!isSoundFocus(focus)) continue;
    const stats = finish(acc);
    if (stats.attempts === 0) continue;
    const row = weeks.get(week) ?? { week };
    row[focus] = stats;
    weeks.set(week, row);
  }
  return [...weeks.values()].sort((a, b) => a.week.localeCompare(b.week));
}

export type WordStats = Stats & {
  pairId: number;
  pairNo: number;
  focus: string;
  target: Target;
  text: string;
  pairWord: string | null;
};

function byWord(rows: DailyRow[]): WordStats[] {
  return [...groupBy(rows, (row) => `${row.pair_id}|${row.target}`)].map(([, { acc, first }]) => ({
    pairId: first.pair_id,
    pairNo: first.pair_no,
    focus: first.sound_focus,
    target: first.target,
    text: first.text,
    pairWord: first.pair_word,
    ...finish(acc),
  }));
}

export type PairGap = { pairId: number; pairNo: number; focus: string; a: WordStats; b: WordStats; gap: number };

/** Word A vs word B per pair, biggest gap in perfect rate first. */
export function pairGaps(rows: DailyRow[]): PairGap[] {
  const words = byWord(rows.filter((row) => row.target !== "tongue_twister"));
  const pairs = new Map<number, { a?: WordStats; b?: WordStats }>();
  for (const word of words) {
    const entry = pairs.get(word.pairId) ?? {};
    if (word.target === "word_a") entry.a = word;
    else entry.b = word;
    pairs.set(word.pairId, entry);
  }
  const result: PairGap[] = [];
  for (const [pairId, { a, b }] of pairs) {
    if (!a || !b || a.rate === null || b.rate === null) continue;
    result.push({ pairId, pairNo: a.pairNo, focus: a.focus, a, b, gap: Math.abs(a.rate - b.rate) });
  }
  return result.sort((x, y) => y.gap - x.gap || x.pairId - y.pairId);
}

/** Words (or tongue twisters) with at least `minAttempts` usable attempts, hardest first. */
export function hardest(rows: DailyRow[], kind: "words" | "tongue_twisters", minAttempts: number): WordStats[] {
  const wanted = rows.filter((row) =>
    kind === "tongue_twisters" ? row.target === "tongue_twister" : row.target !== "tongue_twister",
  );
  return byWord(wanted)
    .filter((word) => word.attempts >= minAttempts && word.rate !== null)
    .sort((a, b) => a.rate! - b.rate! || b.attempts - a.attempts);
}
