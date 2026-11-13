"use client";

import { useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { tableClass, tdClass, thClass } from "@/components/dashboard/ui";
import type { WordStats } from "@/lib/dashboard/aggregate";
import { formatInt, formatRate, formatScore } from "@/lib/dashboard/format";

const TOP = 15;

/** Hardest words / tongue twisters, lowest perfect rate first. */
export function WordTable({ rows, kind, caption }: { rows: WordStats[]; kind: "words" | "tongue_twisters"; caption: string }) {
  const { text } = useLanguage();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rows : rows.slice(0, TOP);
  const isWords = kind === "words";

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className={tableClass}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className={thClass}>
                {isWords ? text({ en: "Word", ja: "単語" }) : text({ en: "Tongue twister", ja: "早口文" })}
              </th>
              {isWords ? (
                <th scope="col" className={thClass}>
                  {text({ en: "Pair word", ja: "ペアの単語" })}
                </th>
              ) : null}
              <th scope="col" className={thClass}>
                {text({ en: "Sound focus", ja: "音" })}
              </th>
              <th scope="col" className={`${thClass} text-right`}>
                {text({ en: "Attempts", ja: "有効回数" })}
              </th>
              <th scope="col" className={`${thClass} text-right`}>
                {text({ en: "Perfect", ja: "満点" })}
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
            {visible.map((w) => (
              <tr key={`${w.pairId}-${w.target}`}>
                <th scope="row" className={`${tdClass} font-semibold text-white ${isWords ? "" : "min-w-64 max-w-md whitespace-normal"}`}>
                  {w.text}
                </th>
                {isWords ? <td className={tdClass}>{w.pairWord ?? "—"}</td> : null}
                <td className={`${tdClass} whitespace-nowrap`}>{w.focus}</td>
                <td className={`${tdClass} text-right`}>{formatInt(w.attempts)}</td>
                <td className={`${tdClass} text-right`}>{formatInt(w.perfect)}</td>
                <td className={tdClass}>
                  <span className="flex items-center gap-2">
                    <span className="w-9 text-right">{formatRate(w.rate)}</span>
                    <span aria-hidden="true" className="block h-1.5 w-20 rounded-full bg-white/[0.08]">
                      <span className="block h-1.5 rounded-full bg-chart-accent" style={{ width: `${w.rate ?? 0}%` }} />
                    </span>
                  </span>
                </td>
                <td className={`${tdClass} text-right`}>{formatScore(w.avgScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > TOP ? (
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((v) => !v)}
          className="h-10 border border-white/20 px-4 text-sm font-semibold text-white transition hover:border-white focus:outline-none focus-visible:border-white"
        >
          {showAll
            ? text({ en: `Show top ${TOP}`, ja: `上位${TOP}件を表示` })
            : text({ en: `Show all ${rows.length}`, ja: `すべて表示（${rows.length}件）` })}
        </button>
      ) : null}
    </div>
  );
}
