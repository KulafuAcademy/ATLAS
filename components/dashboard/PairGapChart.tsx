"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { HoverTip } from "@/components/dashboard/ui";
import type { PairGap, WordStats } from "@/lib/dashboard/aggregate";
import { formatInt, formatRate, formatScore } from "@/lib/dashboard/format";

const A_COLOR = "var(--chart-1)";
const B_COLOR = "var(--chart-2)";

function wordLine(w: WordStats) {
  return `${w.text}: ${formatRate(w.rate)} perfect (${formatInt(w.perfect)}/${formatInt(w.attempts)}), avg ${formatScore(w.avgScore)}`;
}

/**
 * Mirrored bars per pair: word A always grows left from the centre line and
 * word B always grows right, each from 0% at the centre to 100% at the edge.
 * Pairs are sorted by the gap in perfect rate, biggest first.
 */
export function PairGapChart({ pairs, showFocus }: { pairs: PairGap[]; showFocus: boolean }) {
  const { text } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs text-white/65">
        <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label={text({ en: "Legend", ja: "凡例" })}>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: A_COLOR }} />
            {text({ en: "Word A (left)", ja: "単語A（左）" })}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: B_COLOR }} />
            {text({ en: "Word B (right)", ja: "単語B（右）" })}
          </li>
        </ul>
        <p className="text-white/40">
          {text({ en: "Bars run from 0% at the centre to 100% at the edge.", ja: "棒は中央が0%、端が100%です。" })}
        </p>
      </div>
      <ul
        className="grid gap-x-10 gap-y-4 lg:grid-cols-2"
        aria-label={`Word A versus word B perfect rate, biggest gap first: ${pairs
          .map((p) => `${p.a.text} ${formatRate(p.a.rate)}, ${p.b.text} ${formatRate(p.b.rate)}`)
          .join("; ")}.`}
      >
        {pairs.map((p) => (
          <li
            key={p.pairId}
            tabIndex={0}
            className="group relative focus:outline-none focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/60"
          >
            <div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-x-3 text-sm tabular-nums">
              <span className="min-w-0 truncate text-white">
                <span className="font-semibold">{p.a.text}</span> <span className="text-white/65">{formatRate(p.a.rate)}</span>
              </span>
              <span className="whitespace-nowrap text-center text-xs text-white/40">
                {showFocus ? `${p.focus} · ` : ""}
                {text({ en: "gap", ja: "差" })} {Math.round(p.gap)}
              </span>
              <span className="min-w-0 truncate text-right text-white">
                <span className="text-white/65">{formatRate(p.b.rate)}</span> <span className="font-semibold">{p.b.text}</span>
              </span>
            </div>
            <div aria-hidden="true" className="relative mt-2 grid grid-cols-2 gap-x-1">
              <div className="flex h-3 justify-end bg-white/[0.04]">
                <span className="block h-full rounded-l" style={{ width: `${p.a.rate}%`, background: A_COLOR }} />
              </div>
              <div className="flex h-3 justify-start bg-white/[0.04]">
                <span className="block h-full rounded-r" style={{ width: `${p.b.rate}%`, background: B_COLOR }} />
              </div>
              <span className="absolute -inset-y-1 left-1/2 w-px -translate-x-1/2 bg-white/40" />
            </div>
            <HoverTip>
              <strong className="text-white">
                {p.focus} · pair {p.pairNo}
              </strong>
              <br />
              A — {wordLine(p.a)}
              <br />B — {wordLine(p.b)}
            </HoverTip>
          </li>
        ))}
      </ul>
    </div>
  );
}
