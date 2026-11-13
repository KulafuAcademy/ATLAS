"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { RangeToggle, spanLabel } from "@/components/dashboard/Dashboard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useAsync } from "@/components/dashboard/hooks";
import { ErrorState, Kpi, LoadingNotice, Section, Skeleton, tableClass, tdClass, thClass, type LoadState } from "@/components/dashboard/ui";
import { byDay, byWord, compareItems, filterRows, itemHref, totals, type Target, type WordStats } from "@/lib/dashboard/aggregate";
import { fetchDailyStats } from "@/lib/dashboard/data";
import { formatDayLong, resolveRange, type RangeKey } from "@/lib/dashboard/dates";
import { formatInt, formatRate, formatScore } from "@/lib/dashboard/format";

type ItemDetailProps = {
  pairId: number;
  target: Target;
  initialRange: RangeKey;
  today: string;
};

const TARGET_LABEL: Record<Target, { en: string; ja: string }> = {
  word_a: { en: "Word A", ja: "単語A" },
  word_b: { en: "Word B", ja: "単語B" },
  tongue_twister: { en: "Tongue twister", ja: "早口文" },
};

/** Stats for one word or tongue twister, plus the other items in its pair. */
export function ItemDetail({ pairId, target, initialRange, today }: ItemDetailProps) {
  const { text } = useLanguage();
  const [rangeKey, setRangeKey] = useState<RangeKey>(initialRange);
  const range = useMemo(() => resolveRange(rangeKey, today), [rangeKey, today]);

  // All-time rows, so the item's text and pair are known even with no practice in the range.
  const loadDaily = useCallback(() => fetchDailyStats(null, today), [today]);
  const daily = useAsync(loadDaily);

  const view = useMemo(() => {
    if (!daily.data) return null;
    const pairRowsAll = daily.data.filter((row) => row.pair_id === pairId);
    const identity = pairRowsAll.find((row) => row.target === target);
    if (!identity) return { found: false as const };
    const pairRows = filterRows(pairRowsAll, { start: range.start, end: range.end, focus: null });
    const rows = pairRows.filter((row) => row.target === target);
    // Every other item in the pair, with this range's stats (zero if not practiced in it).
    const inRange = new Map(byWord(pairRows).map((item) => [item.target, item]));
    const siblings = byWord(pairRowsAll)
      .filter((item) => item.target !== target)
      .sort(compareItems)
      .map((item) => inRange.get(item.target) ?? { ...item, ...totals([]) });
    return {
      found: true as const,
      text: identity.text,
      focus: identity.sound_focus,
      pairNo: identity.pair_no,
      stats: totals(rows),
      days: byDay(rows),
      siblings,
    };
  }, [daily.data, pairId, target, range]);

  const state: LoadState = { loading: daily.loading, error: daily.error, retry: daily.retry };
  const changeRange = (next: RangeKey) => {
    setRangeKey(next);
    window.history.replaceState(null, "", `?range=${next}`);
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/items" className="inline-block text-sm text-white/55 transition hover:text-white focus:outline-none focus-visible:text-white">
        ← {text({ en: "All words & tongue twisters", ja: "すべての単語と早口文" })}
      </Link>

      <LoadingNotice loading={daily.loading} />

      {/* Title */}
      <div className="min-h-24 space-y-3">
        {daily.loading ? (
          <Skeleton height={96} className="max-w-xl" />
        ) : daily.error ? (
          <ErrorState message={daily.error} onRetry={daily.retry} />
        ) : view && view.found ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              {text(TARGET_LABEL[target])} · {view.focus} · {text({ en: `pair ${view.pairNo}`, ja: `ペア${view.pairNo}` })}
            </p>
            <h1 className={`font-semibold leading-tight text-white ${target === "tongue_twister" ? "max-w-3xl text-2xl md:text-3xl" : "text-4xl md:text-5xl"}`}>
              {view.text}
            </h1>
          </>
        ) : (
          <p className="text-lg text-white/55">{text({ en: "No practice has been recorded for this item yet.", ja: "この項目の練習記録はまだありません。" })}</p>
        )}
      </div>

      {view && !view.found ? null : (
        <>
          <div className="flex flex-col gap-3 border border-white/10 bg-white/[0.02] p-4">
            <RangeToggle value={rangeKey} onChange={changeRange} />
            <p className="text-sm text-white/45">
              {range.start
                ? spanLabel(range.start, range.end)
                : text({ en: `All practice up to ${formatDayLong(range.end)}`, ja: `${formatDayLong(range.end)}までのすべての練習` })}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Kpi
              state={state}
              label={text({ en: "Attempts", ja: "練習回数" })}
              value={view?.found ? formatInt(view.stats.attempts) : ""}
              detail={view?.found ? text({ en: `Across ${formatInt(view.days.length)} ${view.days.length === 1 ? "day" : "days"}`, ja: `${formatInt(view.days.length)}日間` }) : ""}
            />
            <Kpi
              state={state}
              label={text({ en: "Perfect rate", ja: "満点率" })}
              value={view?.found ? formatRate(view.stats.rate) : ""}
              detail={view?.found ? text({ en: `${formatInt(view.stats.perfect)} perfect`, ja: `満点 ${formatInt(view.stats.perfect)}` }) : ""}
            />
            <Kpi
              state={state}
              label={text({ en: "Average score", ja: "平均点" })}
              value={view?.found ? formatScore(view.stats.avgScore) : ""}
              detail={text({ en: "out of 100", ja: "100点満点" })}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Section
              id="item-trend"
              wide
              eyebrow={{ en: "Trend", ja: "推移" }}
              title={{ en: "Perfect rate per day", ja: "日ごとの満点率" }}
              note={{ en: "Only days with practice are shown.", ja: "練習があった日だけを表示します。" }}
              skeletonHeight={400}
              state={state}
              empty={!view?.found || view.days.length === 0}
            >
              {view?.found && view.days.length > 0 ? <TrendChart days={view.days} /> : null}
            </Section>

            <Section
              id="item-pair"
              eyebrow={{ en: "Same pair", ja: "同じペア" }}
              title={{ en: "Compare with the rest of the pair", ja: "ペアの他の項目と比較" }}
              note={{ en: "Same date range.", ja: "同じ期間で比較します。" }}
              skeletonHeight={200}
              state={state}
              empty={!view?.found || view.siblings.length === 0}
            >
              {view?.found ? <Siblings current={view.stats} target={target} siblings={view.siblings} /> : null}
            </Section>

            <Section
              id="item-days"
              eyebrow={{ en: "By day", ja: "日別" }}
              title={{ en: "Daily numbers", ja: "日ごとの数値" }}
              note={{ en: "Newest first.", ja: "新しい順。" }}
              skeletonHeight={200}
              state={state}
              empty={!view?.found || view.days.length === 0}
            >
              {view?.found ? (
                <div className="max-h-96 overflow-auto">
                  <table className={tableClass}>
                    <caption className="sr-only">Daily numbers, newest first</caption>
                    <thead>
                      <tr>
                        <th scope="col" className={thClass}>{text({ en: "Day", ja: "日付" })}</th>
                        <th scope="col" className={`${thClass} text-right`}>{text({ en: "Attempts", ja: "練習回数" })}</th>
                        <th scope="col" className={`${thClass} text-right`}>{text({ en: "Perfect", ja: "満点" })}</th>
                        <th scope="col" className={`${thClass} text-right`}>{text({ en: "Rate", ja: "満点率" })}</th>
                        <th scope="col" className={`${thClass} text-right`}>{text({ en: "Avg", ja: "平均" })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...view.days].reverse().map((d) => (
                        <tr key={d.day}>
                          <td className={tdClass}>{formatDayLong(d.day)}</td>
                          <td className={`${tdClass} text-right`}>{formatInt(d.attempts)}</td>
                          <td className={`${tdClass} text-right`}>
                            {formatInt(d.perfect)}
                          </td>
                          <td className={`${tdClass} text-right`}>{formatRate(d.rate)}</td>
                          <td className={`${tdClass} text-right`}>{formatScore(d.avgScore)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </Section>
          </div>
        </>
      )}
    </div>
  );
}

function Siblings({ current, target, siblings }: { current: ReturnType<typeof totals>; target: Target; siblings: WordStats[] }) {
  const { text } = useLanguage();
  const rows = [{ label: text({ en: "This item", ja: "この項目" }), rate: current.rate, attempts: current.attempts, href: null as string | null, sub: text(TARGET_LABEL[target]) }].concat(
    siblings.map((s) => ({ label: s.text, rate: s.rate, attempts: s.attempts, href: itemHref(s.pairId, s.target), sub: text(TARGET_LABEL[s.target]) })),
  );
  return (
    <ul className="space-y-4">
      {rows.map((row) => (
        <li key={row.href ?? "self"} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0">
              <span className="block text-xs text-white/40">{row.sub}</span>
              {row.href ? (
                <Link href={row.href} className="font-semibold text-white underline decoration-white/25 underline-offset-4 transition hover:decoration-white focus:outline-none focus-visible:decoration-white">
                  {row.label}
                </Link>
              ) : (
                <span className="font-semibold text-white">{row.label}</span>
              )}
            </span>
            <span className="shrink-0 tabular-nums text-white/65">
              {formatRate(row.rate)} <span className="text-xs text-white/35">· n = {formatInt(row.attempts)}</span>
            </span>
          </div>
          <span aria-hidden="true" className="block h-2 rounded-full bg-white/[0.08]">
            <span className={`block h-2 rounded-full ${row.href ? "bg-white/45" : "bg-chart-accent"}`} style={{ width: `${row.rate ?? 0}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
