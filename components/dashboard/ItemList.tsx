"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { FocusSelect, RangeToggle } from "@/components/dashboard/Dashboard";
import { useAsync } from "@/components/dashboard/hooks";
import { LoadingNotice, Section, ToggleGroup, tableClass, tdClass, thClass } from "@/components/dashboard/ui";
import { byWord, compareItems, filterRows, itemHref, type SoundFocus, type WordStats } from "@/lib/dashboard/aggregate";
import { fetchDailyStats } from "@/lib/dashboard/data";
import { resolveRange, type RangeKey } from "@/lib/dashboard/dates";
import { formatInt, formatRate, formatScore } from "@/lib/dashboard/format";

export type ItemKind = "words" | "tongue_twisters";
export type ItemSort = "order" | "hardest" | "most";

const SORTS: { key: ItemSort; label: { en: string; ja: string } }[] = [
  { key: "order", label: { en: "Lesson order", ja: "レッスン順" } },
  { key: "hardest", label: { en: "Hardest first", ja: "難しい順" } },
  { key: "most", label: { en: "Most practiced", ja: "練習回数順" } },
];

type ItemListProps = {
  initialKind: ItemKind;
  initialRange: RangeKey;
  initialFocus: SoundFocus | null;
  today: string;
};

/** Every word or tongue twister with practice in the range; each row opens its detail page. */
export function ItemList({ initialKind, initialRange, initialFocus, today }: ItemListProps) {
  const { text } = useLanguage();
  const [kind, setKind] = useState<ItemKind>(initialKind);
  const [rangeKey, setRangeKey] = useState<RangeKey>(initialRange);
  const [focus, setFocus] = useState<SoundFocus | null>(initialFocus);
  const [sort, setSort] = useState<ItemSort>("order");
  const [search, setSearch] = useState("");
  const range = useMemo(() => resolveRange(rangeKey, today), [rangeKey, today]);

  const updateUrl = (next: { kind?: ItemKind; range?: RangeKey; focus?: SoundFocus | null }) => {
    const params = new URLSearchParams();
    params.set("kind", next.kind ?? kind);
    params.set("range", next.range ?? rangeKey);
    const f = next.focus === undefined ? focus : next.focus;
    if (f) params.set("focus", f);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const loadDaily = useCallback(() => fetchDailyStats(range.start, range.end), [range.start, range.end]);
  const daily = useAsync(loadDaily);

  const items = useMemo(() => {
    if (!daily.data) return null;
    const rows = filterRows(daily.data, { start: range.start, end: range.end, focus }).filter((row) =>
      kind === "tongue_twisters" ? row.target === "tongue_twister" : row.target !== "tongue_twister",
    );
    const query = search.trim().toLowerCase();
    const list = byWord(rows).filter(
      (item) => !query || item.text.toLowerCase().includes(query),
    );
    return list.sort(sorter(sort));
  }, [daily.data, range, focus, kind, search, sort]);

  const isWords = kind === "words";

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-block text-sm text-white/55 transition hover:text-white focus:outline-none focus-visible:text-white">
        ← {text({ en: "Back to dashboard", ja: "ダッシュボードへ戻る" })}
      </Link>

      <div className="flex flex-col gap-4 border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <ToggleGroup
            legend={{ en: "Show", ja: "表示" }}
            options={[
              { key: "words" as const, label: { en: "Words", ja: "単語" } },
              { key: "tongue_twisters" as const, label: { en: "Tongue twisters", ja: "早口文" } },
            ]}
            value={kind}
            onChange={(next) => {
              setKind(next);
              updateUrl({ kind: next });
            }}
          />
          <RangeToggle
            value={rangeKey}
            onChange={(next) => {
              setRangeKey(next);
              updateUrl({ range: next });
            }}
          />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <FocusSelect
            value={focus}
            onChange={(next) => {
              setFocus(next);
              updateUrl({ focus: next });
            }}
          />
          <label className="space-y-2 sm:w-48">
            <span className="block text-xs uppercase tracking-[0.22em] text-white/35">{text({ en: "Sort", ja: "並び順" })}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as ItemSort)}
              className="h-10 w-full border border-white/10 bg-black px-3 text-sm text-white outline-none transition focus:border-white/50"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {text(s.label)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 sm:flex-1">
            <span className="block text-xs uppercase tracking-[0.22em] text-white/35">{text({ en: "Search", ja: "検索" })}</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={isWords ? text({ en: "e.g. light", ja: "例: light" }) : text({ en: "e.g. red lorry", ja: "例: red lorry" })}
              className="h-10 w-full border border-white/10 bg-black px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/50"
            />
          </label>
        </div>
      </div>

      <LoadingNotice loading={daily.loading} />

      <Section
        id="items"
        eyebrow={isWords ? { en: "Words", ja: "単語" } : { en: "Tongue twisters", ja: "早口文" }}
        title={
          items
            ? { en: `${formatInt(items.length)} ${isWords ? "words" : "tongue twisters"}`, ja: `${formatInt(items.length)}件` }
            : { en: isWords ? "Words" : "Tongue twisters", ja: isWords ? "単語" : "早口文" }
        }
        note={{ en: "Only items practiced in this range are listed. Select one to see its details.", ja: "この期間に練習された項目のみ表示します。項目を選ぶと詳細が開きます。" }}
        skeletonHeight={480}
        state={{ loading: daily.loading, error: daily.error, retry: daily.retry }}
        empty={!items || items.length === 0}
      >
        {items ? <ItemTable items={items} isWords={isWords} /> : null}
      </Section>
    </div>
  );
}

function sorter(sort: ItemSort) {
  if (sort === "hardest") return (a: WordStats, b: WordStats) => (a.rate ?? 101) - (b.rate ?? 101) || b.attempts - a.attempts;
  if (sort === "most") return (a: WordStats, b: WordStats) => b.attempts - a.attempts || compareItems(a, b);
  return compareItems;
}

function ItemTable({ items, isWords }: { items: WordStats[]; isWords: boolean }) {
  const { text } = useLanguage();
  return (
    <div className="overflow-x-auto">
      <table className={tableClass}>
        <caption className="sr-only">{isWords ? "Words" : "Tongue twisters"}</caption>
        <thead>
          <tr>
            <th scope="col" className={thClass}>
              {isWords ? text({ en: "Word", ja: "単語" }) : text({ en: "Tongue twister", ja: "早口文" })}
            </th>
            <th scope="col" className={thClass}>
              {text({ en: "Sound focus", ja: "音" })}
            </th>
            <th scope="col" className={`${thClass} text-right`}>
              {text({ en: "Attempts", ja: "練習回数" })}
            </th>
            <th scope="col" className={thClass}>
              {text({ en: "Perfect rate", ja: "満点率" })}
            </th>
            <th scope="col" className={`${thClass} text-right`}>
              {text({ en: "Avg score", ja: "平均点" })}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.pairId}-${item.target}`} className="transition hover:bg-white/[0.03]">
              <th scope="row" className={`${tdClass} font-semibold text-white ${isWords ? "" : "min-w-64 max-w-md whitespace-normal"}`}>
                <Link
                  href={itemHref(item.pairId, item.target)}
                  className="underline decoration-white/25 underline-offset-4 transition hover:decoration-white focus:outline-none focus-visible:decoration-white"
                >
                  {item.text}
                </Link>
              </th>
              <td className={`${tdClass} whitespace-nowrap`}>
                {item.focus} · {text({ en: `pair ${item.pairNo}`, ja: `ペア${item.pairNo}` })}
              </td>
              <td className={`${tdClass} text-right`}>{formatInt(item.attempts)}</td>
              <td className={tdClass}>
                <span className="flex items-center gap-2">
                  <span className="w-9 text-right">{formatRate(item.rate)}</span>
                  <span aria-hidden="true" className="block h-1.5 w-20 rounded-full bg-white/[0.08]">
                    <span className="block h-1.5 rounded-full bg-chart-accent" style={{ width: `${item.rate ?? 0}%` }} />
                  </span>
                </span>
              </td>
              <td className={`${tdClass} text-right`}>{formatScore(item.avgScore)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
