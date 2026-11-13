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

/** Dumbbell per pair: word A's perfect rate next to word B's, biggest gap first. */
export function PairGapChart({ pairs, showFocus }: { pairs: PairGap[]; showFocus: boolean }) {
  const { text } = useLanguage();
  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/65" aria-label={text({ en: "Legend", ja: "凡例" })}>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: A_COLOR }} />
          {text({ en: "Word A", ja: "単語A" })}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px]" style={{ background: B_COLOR }} />
          {text({ en: "Word B", ja: "単語B" })}
        </li>
      </ul>
      <ul
        className="grid gap-x-10 gap-y-3 lg:grid-cols-2"
        aria-label={`Word A versus word B perfect rate, biggest gap first: ${pairs
          .map((p) => `${p.a.text} ${formatRate(p.a.rate)}, ${p.b.text} ${formatRate(p.b.rate)}`)
          .join("; ")}.`}
      >
        {pairs.map((p) => {
          const lo = Math.min(p.a.rate!, p.b.rate!);
          const hi = Math.max(p.a.rate!, p.b.rate!);
          return (
            <li key={p.pairId} tabIndex={0} className="group relative focus:outline-none focus-visible:outline-1 focus-visible:outline-white/60">
              <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                <span className="tabular-nums text-white">
                  <span className="font-semibold">{p.a.text}</span> <span className="text-white/65">{formatRate(p.a.rate)}</span>
                  <span className="px-1.5 text-white/30">·</span>
                  <span className="font-semibold">{p.b.text}</span> <span className="text-white/65">{formatRate(p.b.rate)}</span>
                </span>
                <span className="text-xs tabular-nums text-white/40">
                  {showFocus ? `${p.focus} · ` : ""}
                  {text({ en: "gap", ja: "差" })} {Math.round(p.gap)}
                </span>
              </p>
              <div aria-hidden="true" className="relative mt-2 h-4">
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
                <span className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-white/35" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-black"
                  style={{ left: `${p.a.rate}%`, background: A_COLOR }}
                />
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] ring-2 ring-black"
                  style={{ left: `${p.b.rate}%`, background: B_COLOR }}
                />
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
          );
        })}
      </ul>
      <div aria-hidden="true" className="flex justify-between text-[11px] tabular-nums text-white/35">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
