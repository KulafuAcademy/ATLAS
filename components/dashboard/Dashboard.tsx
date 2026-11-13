"use client";

import { useCallback, useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { FocusBars, RetryBars } from "@/components/dashboard/Bars";
import { PairGapChart } from "@/components/dashboard/PairGapChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { WeeklyFocusChart } from "@/components/dashboard/WeeklyFocusChart";
import { WordTable } from "@/components/dashboard/WordTable";
import { useAsync } from "@/components/dashboard/hooks";
import { Delta, ErrorState, Section, Skeleton, type LoadState } from "@/components/dashboard/ui";
import {
  SOUND_FOCUSES,
  byDay,
  byFocus,
  byWeekAndFocus,
  filterRows,
  hardest,
  isSoundFocus,
  pairGaps,
  retryStats,
  schoolDaysPractised,
  totals,
  type SoundFocus,
  type Stats,
} from "@/lib/dashboard/aggregate";
import { fetchDailyStats, fetchRetryAttempts } from "@/lib/dashboard/data";
import { RANGE_KEYS, formatDayLong, resolveRange, type RangeKey } from "@/lib/dashboard/dates";
import { formatInt, formatRate, formatScore } from "@/lib/dashboard/format";
import { PREVIOUS_PHRASE, RANGE_LABELS, buildSummary } from "@/lib/dashboard/summary";

const MIN_ATTEMPTS = 10;
const ALL_FOCUS_PAIRS = 10;

type DashboardProps = {
  initialRange: RangeKey;
  initialFocus: SoundFocus | null;
  /** Today in Manila, computed on the server so SSR and client agree. */
  today: string;
};

export function Dashboard({ initialRange, initialFocus, today }: DashboardProps) {
  const { text } = useLanguage();
  const [rangeKey, setRangeKey] = useState<RangeKey>(initialRange);
  const [focus, setFocus] = useState<SoundFocus | null>(initialFocus);
  const range = useMemo(() => resolveRange(rangeKey, today), [rangeKey, today]);

  // Keep the view shareable: ?range=4w&focus=TH+sounds
  const updateUrl = (nextRange: RangeKey, nextFocus: SoundFocus | null) => {
    const params = new URLSearchParams();
    params.set("range", nextRange);
    if (nextFocus) params.set("focus", nextFocus);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };
  const changeRange = (next: RangeKey) => {
    setRangeKey(next);
    updateUrl(next, focus);
  };
  const changeFocus = (next: SoundFocus | null) => {
    setFocus(next);
    updateUrl(rangeKey, next);
  };

  // One daily_stats query covers this period and the previous one (for deltas).
  // The focus filter is applied client-side, so switching it is instant.
  const fetchStart = range.previous?.start ?? range.start;
  const loadDaily = useCallback(() => fetchDailyStats(fetchStart, range.end), [fetchStart, range.end]);
  const daily = useAsync(loadDaily);
  const loadRetry = useCallback(() => fetchRetryAttempts(range.start, range.end, focus), [range.start, range.end, focus]);
  const retry = useAsync(loadRetry);

  const view = useMemo(() => {
    if (!daily.data) return null;
    const allFocusRows = filterRows(daily.data, { start: range.start, end: range.end, focus: null });
    const rows = focus ? allFocusRows.filter((r) => r.sound_focus === focus) : allFocusRows;
    const prevRows = range.previous ? filterRows(daily.data, { ...range.previous, focus }) : null;
    const current = totals(rows);
    const previous = prevRows ? totals(prevRows) : null;
    const focuses = byFocus(allFocusRows);
    const words = hardest(rows, "words", MIN_ATTEMPTS);
    const gaps = pairGaps(rows);
    return {
      current,
      previous,
      days: schoolDaysPractised(rows),
      prevDays: prevRows ? schoolDaysPractised(prevRows) : null,
      trend: byDay(rows),
      focuses,
      weeks: byWeekAndFocus(rows),
      gaps: focus ? gaps : gaps.slice(0, ALL_FOCUS_PAIRS),
      words,
      twisters: hardest(rows, "tongue_twisters", MIN_ATTEMPTS),
      summary: buildSummary({
        range: rangeKey,
        focus,
        current,
        previous,
        hardestFocus: focuses.find((f) => f.rate !== null)?.focus ?? null,
        hardestWord: words[0]?.text ?? null,
      }),
    };
  }, [daily.data, range, focus, rangeKey]);

  const dailyState: LoadState = { loading: daily.loading, error: daily.error, retry: daily.retry };
  const retryState: LoadState = { loading: retry.loading, error: retry.error, retry: retry.retry };
  const empty = !view || view.current.tries === 0;
  const retryPoints = retry.data ? retryStats(retry.data) : null;
  const vsLabel = range.key === "all" ? null : text({ en: `vs ${PREVIOUS_PHRASE[range.key].en}`, ja: `${PREVIOUS_PHRASE[range.key].ja}比` });
  const minNote = { en: `Only items with at least ${MIN_ATTEMPTS} attempts in this range.`, ja: `この期間に${MIN_ATTEMPTS}回以上の有効な録音がある項目のみ。` };

  return (
    <div className="space-y-6">
      <Filters rangeKey={rangeKey} focus={focus} onRange={changeRange} onFocus={changeFocus} />

      <p className="text-sm text-white/45">
        {range.start ? spanLabel(range.start, range.end) : text({ en: `All practice up to ${formatDayLong(range.end)}`, ja: `${formatDayLong(range.end)}までのすべての練習` })}
        {range.previous
          ? text({
              en: ` · compared with ${spanLabel(range.previous.start, range.previous.end)}`,
              ja: `（比較: ${spanLabel(range.previous.start, range.previous.end)}）`,
            })
          : null}
      </p>

      {/* Summary sentence */}
      <div aria-live="polite" className="min-h-14">
        {daily.loading ? (
          <Skeleton height={56} className="max-w-3xl" />
        ) : daily.error ? (
          <ErrorState message={daily.error} onRetry={daily.retry} />
        ) : view?.summary ? (
          <p className="max-w-3xl text-lg leading-8 text-white/80">{text(view.summary)}</p>
        ) : (
          <p className="text-lg text-white/55">{text({ en: "No practice in this range.", ja: "この期間の練習はありません。" })}</p>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          state={dailyState}
          label={text({ en: "Tries", ja: "練習回数" })}
          value={view ? formatInt(view.current.tries) : ""}
          detail={view ? text({ en: `${formatInt(view.current.attempts)} usable`, ja: `有効 ${formatInt(view.current.attempts)}` }) : ""}
          delta={view && vsLabel ? <Delta value={relativeChange(view.current.tries, view.previous?.tries)} unit="%" label={vsLabel} /> : null}
        />
        <Kpi
          state={dailyState}
          label={text({ en: "Perfect rate", ja: "満点率" })}
          value={view ? formatRate(view.current.rate) : ""}
          detail={view ? text({ en: `${formatInt(view.current.perfect)} perfect`, ja: `満点 ${formatInt(view.current.perfect)}` }) : ""}
          delta={view && vsLabel ? <Delta value={pointChange(view.current, view.previous, "rate")} unit=" pts" label={vsLabel} /> : null}
        />
        <Kpi
          state={dailyState}
          label={text({ en: "Average score", ja: "平均点" })}
          value={view ? formatScore(view.current.avgScore) : ""}
          detail={text({ en: "out of 100", ja: "100点満点" })}
          delta={view && vsLabel ? <Delta value={pointChange(view.current, view.previous, "avgScore")} unit=" pts" label={vsLabel} /> : null}
        />
        <Kpi
          state={dailyState}
          label={text({ en: "School days practised", ja: "練習した登校日" })}
          value={view ? formatInt(view.days) : ""}
          detail={text({ en: "Mon–Fri with practice", ja: "練習があった平日" })}
          delta={view && vsLabel ? <Delta value={view.prevDays && view.prevDays > 0 ? view.days - view.prevDays : null} label={view.prevDays ? vsLabel : text({ en: "nothing to compare", ja: "比較なし" })} /> : null}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          id="trend"
          wide
          eyebrow={{ en: "1 · Trend", ja: "1 · 推移" }}
          title={{ en: "Perfect rate per school day", ja: "登校日ごとの満点率" }}
          note={{ en: "Only days with practice are shown, so weekends leave no gaps.", ja: "練習があった日だけを表示します（週末の空白なし）。" }}
          skeletonHeight={400}
          state={dailyState}
          empty={empty}
        >
          {view ? <TrendChart days={view.trend} /> : null}
        </Section>

        <Section
          id="by-focus"
          eyebrow={{ en: "2 · Sounds", ja: "2 · 音" }}
          title={{ en: "Perfect rate by sound focus", ja: "音ごとの満点率" }}
          note={{ en: "Hardest at the top. Select a sound to filter the whole page.", ja: "難しい順。音を選ぶとページ全体が絞り込まれます。" }}
          skeletonHeight={340}
          state={dailyState}
          empty={!view || view.focuses.length === 0}
        >
          {view ? <FocusBars points={view.focuses} selected={focus} onSelect={changeFocus} /> : null}
        </Section>

        <Section
          id="weekly"
          eyebrow={{ en: "3 · Over time", ja: "3 · 週ごと" }}
          title={{ en: "Sound focus over time", ja: "音ごとの週別満点率" }}
          note={{ en: "Perfect rate per school week (Mon–Fri).", ja: "登校週（月〜金）ごとの満点率。" }}
          skeletonHeight={340}
          state={dailyState}
          empty={empty}
        >
          {view ? <WeeklyFocusChart weeks={view.weeks} /> : null}
        </Section>

        <Section
          id="pairs"
          wide
          eyebrow={{ en: "4 · Word pairs", ja: "4 · 単語ペア" }}
          title={{ en: "Word A vs word B", ja: "単語A と 単語B" }}
          note={
            focus
              ? { en: `Every ${focus} pair with data, sorted by the gap in perfect rate.`, ja: `${focus}の全ペアを満点率の差が大きい順に表示。` }
              : { en: `The ${ALL_FOCUS_PAIRS} pairs with the biggest gap in perfect rate.`, ja: `満点率の差が大きい上位${ALL_FOCUS_PAIRS}ペア。` }
          }
          skeletonHeight={360}
          state={dailyState}
          empty={!view || view.gaps.length === 0}
        >
          {view ? <PairGapChart pairs={view.gaps} showFocus={!focus} /> : null}
        </Section>

        <Section
          id="hardest-words"
          wide
          eyebrow={{ en: "5 · Words", ja: "5 · 単語" }}
          title={{ en: "Hardest words", ja: "難しい単語" }}
          note={minNote}
          skeletonHeight={560}
          state={dailyState}
          empty={!view || view.words.length === 0}
        >
          {view ? <WordTable rows={view.words} kind="words" caption="Hardest words, lowest perfect rate first" /> : null}
        </Section>

        <Section
          id="tongue-twisters"
          wide
          eyebrow={{ en: "6 · Tongue twisters", ja: "6 · 早口文" }}
          title={{ en: "Hardest tongue twisters", ja: "難しい早口文" }}
          note={minNote}
          skeletonHeight={560}
          state={dailyState}
          empty={!view || view.twisters.length === 0}
        >
          {view ? <WordTable rows={view.twisters} kind="tongue_twisters" caption="Hardest tongue twisters, lowest perfect rate first" /> : null}
        </Section>

        <Section
          id="retries"
          wide
          eyebrow={{ en: "7 · Retries", ja: "7 · やり直し" }}
          title={{ en: "Does trying again help?", ja: "やり直すと上達する？" }}
          note={{ en: "Perfect rate of usable tries by attempt number.", ja: "何回目の挑戦かごとの、有効な録音の満点率。" }}
          skeletonHeight={256}
          state={retryState}
          empty={!retryPoints || retryPoints.every((p) => p.attempts === 0)}
        >
          {retryPoints ? <RetryBars points={retryPoints} /> : null}
        </Section>
      </div>
    </div>
  );
}

function spanLabel(start: string, end: string) {
  return start === end ? formatDayLong(start) : `${formatDayLong(start)} – ${formatDayLong(end)}`;
}

function relativeChange(current: number, previous: number | undefined) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function pointChange(current: Stats, previous: Stats | null, key: "rate" | "avgScore") {
  const a = current[key];
  const b = previous?.[key];
  return a == null || b == null ? null : a - b;
}

function Kpi({ state, label, value, detail, delta }: { state: LoadState; label: string; value: string; detail: string; delta: React.ReactNode }) {
  return (
    <div className="flex min-h-36 flex-col justify-between gap-3 border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{label}</p>
      {state.loading ? (
        <Skeleton height={64} />
      ) : state.error ? (
        <p className="text-sm text-white/45">—</p>
      ) : (
        <div className="space-y-1">
          <p className="text-3xl font-semibold text-white">{value}</p>
          <p className="text-xs text-white/45">{detail}</p>
          {delta}
        </div>
      )}
    </div>
  );
}

function Filters({
  rangeKey,
  focus,
  onRange,
  onFocus,
}: {
  rangeKey: RangeKey;
  focus: SoundFocus | null;
  onRange: (key: RangeKey) => void;
  onFocus: (focus: SoundFocus | null) => void;
}) {
  const { text } = useLanguage();
  return (
    <div className="flex flex-col gap-4 border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-end sm:justify-between">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-xs uppercase tracking-[0.22em] text-white/35">{text({ en: "Date range", ja: "期間" })}</legend>
        <div className="flex flex-wrap gap-2">
          {RANGE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={rangeKey === key}
              onClick={() => onRange(key)}
              className={`h-10 shrink-0 border px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                rangeKey === key ? "border-white bg-white text-black" : "border-white/10 text-white/60 hover:border-white/35 hover:text-white"
              }`}
            >
              {text(RANGE_LABELS[key])}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="space-y-2 sm:w-64">
        <span className="block text-xs uppercase tracking-[0.22em] text-white/35">{text({ en: "Sound focus", ja: "音" })}</span>
        <select
          value={focus ?? "all"}
          onChange={(event) => onFocus(isSoundFocus(event.target.value) ? event.target.value : null)}
          className="h-10 w-full border border-white/10 bg-black px-3 text-sm text-white outline-none transition focus:border-white/50"
        >
          <option value="all">{text({ en: "All sounds", ja: "すべての音" })}</option>
          {SOUND_FOCUSES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
