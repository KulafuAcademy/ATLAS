"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { FocusBars } from "@/components/dashboard/Bars";
import { PairGapChart } from "@/components/dashboard/PairGapChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { WeeklyFocusChart } from "@/components/dashboard/WeeklyFocusChart";
import { WordTable } from "@/components/dashboard/WordTable";
import { useAsync } from "@/components/dashboard/hooks";
import { Delta, ErrorState, Kpi, Section, Skeleton, ToggleGroup, type LoadState } from "@/components/dashboard/ui";
import {
  SOUND_FOCUSES,
  byDay,
  byFocus,
  byWeekAndFocus,
  filterRows,
  hardest,
  isSoundFocus,
  pairGaps,
  daysPracticed,
  totals,
  type SoundFocus,
  type Stats,
} from "@/lib/dashboard/aggregate";
import { fetchDailyStats } from "@/lib/dashboard/data";
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

  // Keep the view shareable: ?range=month&focus=TH+sounds
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
      days: daysPracticed(rows),
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
  const empty = !view || view.current.attempts === 0;
  const vsLabel = range.key === "all" ? null : text({ en: `vs ${PREVIOUS_PHRASE[range.key].en}`, ja: `${PREVIOUS_PHRASE[range.key].ja}比` });
  const minNote = { en: `Only items with at least ${MIN_ATTEMPTS} attempts in this range.`, ja: `この期間に${MIN_ATTEMPTS}回以上の練習がある項目のみ。` };

  return (
    <div className="space-y-6">
      <Filters rangeKey={rangeKey} focus={focus} onRange={changeRange} onFocus={changeFocus} />

      <ItemsLink />

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
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi
          state={dailyState}
          label={text({ en: "Attempts", ja: "練習回数" })}
          value={view ? formatInt(view.current.attempts) : ""}
          detail={view ? text({ en: `Across ${formatInt(view.days)} ${view.days === 1 ? "day" : "days"}`, ja: `${formatInt(view.days)}日間` }) : ""}
          delta={view && vsLabel ? <Delta value={relativeChange(view.current.attempts, view.previous?.attempts)} unit="%" label={vsLabel} /> : null}
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          id="trend"
          wide
          eyebrow={{ en: "1 · Trend", ja: "1 · 推移" }}
          title={{ en: "Perfect rate per day", ja: "日ごとの満点率" }}
          note={{ en: "Only days with practice are shown.", ja: "練習があった日だけを表示します。" }}
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
          note={{ en: "Perfect rate per week (Monday–Sunday).", ja: "週（月〜日）ごとの満点率。" }}
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
      </div>
    </div>
  );
}

function ItemsLink() {
  const { text } = useLanguage();
  return (
    <Link
      href="/dashboard/items"
      className="flex items-center justify-between gap-4 border border-white/10 bg-white/[0.02] px-5 py-4 transition hover:border-white/35 focus:outline-none focus-visible:border-white"
    >
      <span>
        <span className="block text-sm font-semibold text-white">{text({ en: "All words & tongue twisters", ja: "すべての単語と早口文" })}</span>
        <span className="block text-xs text-white/45">
          {text({ en: "Browse every item and open its own stats.", ja: "項目ごとの記録を一覧で確認できます。" })}
        </span>
      </span>
      <span aria-hidden="true" className="text-white/55">
        →
      </span>
    </Link>
  );
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
  return (
    <div className="flex flex-col gap-4 border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-end sm:justify-between">
      <RangeToggle value={rangeKey} onChange={onRange} />
      <FocusSelect value={focus} onChange={onFocus} />
    </div>
  );
}

export function RangeToggle({ value, onChange }: { value: RangeKey; onChange: (key: RangeKey) => void }) {
  return (
    <ToggleGroup
      legend={{ en: "Date range", ja: "期間" }}
      options={RANGE_KEYS.map((key) => ({ key, label: RANGE_LABELS[key] }))}
      value={value}
      onChange={onChange}
    />
  );
}

export function FocusSelect({ value, onChange }: { value: SoundFocus | null; onChange: (focus: SoundFocus | null) => void }) {
  const { text } = useLanguage();
  return (
    <label className="space-y-2 sm:w-64">
      <span className="block text-xs uppercase tracking-[0.22em] text-white/35">{text({ en: "Sound focus", ja: "音" })}</span>
      <select
        value={value ?? "all"}
        onChange={(event) => onChange(isSoundFocus(event.target.value) ? event.target.value : null)}
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
  );
}

export function spanLabel(start: string, end: string) {
  return start === end ? formatDayLong(start) : `${formatDayLong(start)} – ${formatDayLong(end)}`;
}
