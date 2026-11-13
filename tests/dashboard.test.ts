import test from "node:test";
import assert from "node:assert/strict";

import { byDay, byFocus, byWeekAndFocus, daysPractised, hardest, pairGaps, toDailyRow, totals, type DailyRow } from "../lib/dashboard/aggregate";
import { addDays, formatDay, formatWeek, manilaDay, resolveRange, weekStart } from "../lib/dashboard/dates";
import { buildSummary } from "../lib/dashboard/summary";

function row(partial: Partial<DailyRow>): DailyRow {
  return {
    day: "2026-11-10",
    sound_focus: "R vs L",
    pair_no: 1,
    pair_id: 1,
    target: "word_a",
    text: "right",
    pair_word: "light",
    tries: 10,
    attempts: 10,
    perfect: 5,
    avg_score: 80,
    ...partial,
  };
}

test("date helpers never shift a plain date", () => {
  assert.equal(formatDay("2026-11-01"), "Nov 1");
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(weekStart("2026-11-13"), "2026-11-09"); // Friday → Monday
  assert.equal(weekStart("2026-11-09"), "2026-11-09");
  assert.equal(weekStart("2026-11-15"), "2026-11-09"); // Sunday belongs to the week that started Monday
  assert.equal(formatWeek("2026-11-09"), "Nov 9–15");
  assert.equal(formatWeek("2026-10-26"), "Oct 26 – Nov 1");
  // 23:30 UTC is already the next day in Manila.
  assert.equal(manilaDay("2026-11-12T23:30:00Z"), "2026-11-13");
});

test("dashboard API only accepts plain dates", async () => {
  const { parseDashboardQuery } = await import("../lib/dashboard/query");
  const base = "http://x/api/dashboard/daily-stats";
  assert.deepEqual(parseDashboardQuery(`${base}?end=2026-11-13&start=2026-10-19`), { start: "2026-10-19", end: "2026-11-13" });
  assert.deepEqual(parseDashboardQuery(`${base}?end=2026-11-13`), { start: null, end: "2026-11-13" });
  assert.equal(parseDashboardQuery(`${base}?start=2026-10-19`), null);
  assert.equal(parseDashboardQuery(`${base}?end=2026-11-13&start=2026-10-19);drop`), null);
});

test("today compares with yesterday, weekends included", () => {
  assert.deepEqual(resolveRange("today", "2026-11-13"), {
    key: "today",
    start: "2026-11-13",
    end: "2026-11-13",
    previous: { start: "2026-11-12", end: "2026-11-12" },
  });
  // Monday compares with Sunday.
  assert.deepEqual(resolveRange("today", "2026-11-09").previous, { start: "2026-11-08", end: "2026-11-08" });
});

test("weekend practice counts as days and joins its Monday–Sunday week", () => {
  const rows = [row({ day: "2026-11-13" }), row({ day: "2026-11-14" }), row({ day: "2026-11-15" }), row({ day: "2026-11-16" })];
  assert.equal(daysPractised(rows), 4);
  assert.deepEqual(byDay(rows).map((d) => d.day), ["2026-11-13", "2026-11-14", "2026-11-15", "2026-11-16"]);
  const weeks = byWeekAndFocus(rows);
  assert.deepEqual(weeks.map((w) => [w.week, w["R vs L"]?.attempts]), [["2026-11-09", 30], ["2026-11-16", 10]]);
});

test("week is Monday-aligned and month starts on the 1st, each vs the same days before", () => {
  assert.deepEqual(resolveRange("week", "2026-11-13"), {
    key: "week",
    start: "2026-11-09",
    end: "2026-11-13",
    previous: { start: "2026-11-02", end: "2026-11-06" },
  });
  assert.deepEqual(resolveRange("month", "2026-11-13"), {
    key: "month",
    start: "2026-11-01",
    end: "2026-11-13",
    previous: { start: "2026-10-01", end: "2026-10-13" },
  });
  // March 31 compares with all of February, not a day past its end.
  assert.deepEqual(resolveRange("month", "2026-03-31").previous, { start: "2026-02-01", end: "2026-02-28" });
  // January compares with December of the year before.
  assert.deepEqual(resolveRange("month", "2026-01-05").previous, { start: "2025-12-01", end: "2025-12-05" });
  assert.equal(resolveRange("all", "2026-11-13").previous, null);
});

test("rates are recomputed from sums, not averaged", () => {
  // Row rates are 100% (1/1) and 0% (0/99): the mean would be 50%, the true rate is 1%.
  const stats = totals([row({ attempts: 1, perfect: 1, avg_score: 100 }), row({ attempts: 99, perfect: 0, avg_score: 0 })]);
  assert.equal(stats.rate, 1);
  assert.equal(stats.avgScore, 1);
  assert.equal(totals([row({ attempts: 0, perfect: 0, tries: 3, avg_score: null })]).rate, null);
});

test("numeric strings from Supabase are converted", () => {
  const r = toDailyRow({ day: "2026-11-10", sound_focus: "R vs L", pair_no: "1", pair_id: "1", target: "word_a", text: "right", pair_word: null, tries: "4", attempts: "3", perfect: "1", avg_score: "72.5", perfect_rate: "33.3" });
  assert.equal(r.attempts + r.perfect, 4);
  assert.equal(r.avg_score, 72.5);
});

test("byDay skips empty days and sorts; byFocus puts the hardest first", () => {
  const rows = [row({ day: "2026-11-11" }), row({ day: "2026-11-10", sound_focus: "TH sounds", perfect: 1 })];
  assert.deepEqual(byDay(rows).map((d) => d.day), ["2026-11-10", "2026-11-11"]);
  assert.deepEqual(byFocus(rows).map((f) => f.focus), ["TH sounds", "R vs L"]);
});

test("pair gaps and hardest words", () => {
  const rows = [
    row({ target: "word_a", text: "right", perfect: 4 }),
    row({ target: "word_b", text: "light", pair_word: "right", perfect: 9 }),
    row({ target: "tongue_twister", text: "Right by the light", pair_word: null, perfect: 2 }),
    row({ pair_id: 2, target: "word_a", text: "rock", attempts: 5, perfect: 0 }),
  ];
  const [gap] = pairGaps(rows);
  assert.equal(gap.a.text, "right");
  assert.equal(gap.gap, 50);
  assert.deepEqual(hardest(rows, "words", 10).map((w) => w.text), ["right", "light"]); // rock has < 10 attempts
  assert.deepEqual(hardest(rows, "tongue_twisters", 10).map((w) => w.text), ["Right by the light"]);
});

test("summary sentence reports change in points and the hardest sound", () => {
  const summary = buildSummary({
    range: "month",
    focus: null,
    current: { tries: 3480, attempts: 3000, perfect: 1740, rate: 58, avgScore: 70 },
    previous: { tries: 3000, attempts: 2500, perfect: 1225, rate: 49, avgScore: 65 },
    hardestFocus: "TH sounds",
    hardestWord: null,
  });
  assert.equal(
    typeof summary === "object" && summary?.en,
    "This month kids made 3,480 tries; 58% of usable tries were perfect, up 9 points from last month. TH sounds is the hardest sound.",
  );
});
