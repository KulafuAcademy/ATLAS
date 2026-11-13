"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { HoverTip } from "@/components/dashboard/ui";
import type { FocusPoint, SoundFocus } from "@/lib/dashboard/aggregate";
import { formatInt, formatRate, formatScore } from "@/lib/dashboard/format";

/** Horizontal bars, hardest at the top. Each bar is a button that sets the focus filter. */
export function FocusBars({
  points,
  selected,
  onSelect,
}: {
  points: FocusPoint[];
  selected: SoundFocus | null;
  onSelect: (focus: SoundFocus | null) => void;
}) {
  const { text } = useLanguage();
  return (
    <ul
      className="space-y-2"
      aria-label={`Perfect rate by sound focus, hardest first: ${points.map((p) => `${p.focus} ${formatRate(p.rate)}`).join(", ")}.`}
    >
      {points.map((p) => {
        const isSelected = selected === p.focus;
        const dimmed = selected !== null && !isSelected;
        return (
          <li key={p.focus}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(isSelected ? null : p.focus)}
              className={`group relative block w-full border px-3 py-2.5 text-left transition focus:outline-none focus-visible:border-white ${
                isSelected ? "border-white/60 bg-white/[0.04]" : "border-transparent hover:border-white/20"
              } ${dimmed ? "opacity-45 hover:opacity-100" : ""}`}
            >
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold text-white">{p.focus}</span>
                <span className="tabular-nums text-white/65">
                  {formatRate(p.rate)} · {formatInt(p.tries)} {text({ en: "tries", ja: "回" })}
                </span>
              </span>
              <span aria-hidden="true" className="mt-2 block h-2 w-full rounded-full bg-white/[0.06]">
                <span className="block h-2 rounded-full bg-chart-accent" style={{ width: `${Math.max(p.rate ?? 0, 0.5)}%` }} />
              </span>
              <HoverTip>
                <strong className="text-white">{p.focus}</strong>
                <br />
                Perfect: {formatInt(p.perfect)} of {formatInt(p.attempts)} usable ({formatRate(p.rate)})
                <br />
                Tries: {formatInt(p.tries)} · Avg score: {formatScore(p.avgScore)}
                <br />
                <span className="text-white/50">{isSelected ? "Click to show all sounds" : "Click to filter to this sound"}</span>
              </HoverTip>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
