"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { HoverTip } from "@/components/dashboard/ui";
import type { FocusPoint, RetryPoint, SoundFocus } from "@/lib/dashboard/aggregate";
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

/** Perfect rate for attempt 1, 2 and 3+, as three columns. */
export function RetryBars({ points }: { points: RetryPoint[] }) {
  const { text } = useLanguage();
  const label = (p: RetryPoint) =>
    p.label === "3+" ? text({ en: "Attempt 3+", ja: "3回目以降" }) : text({ en: `Attempt ${p.label}`, ja: `${p.label}回目` });
  return (
    <div
      role="group"
      aria-label={`Perfect rate by attempt number: ${points.map((p) => `attempt ${p.label} ${formatRate(p.rate)} of ${p.attempts} usable tries`).join(", ")}.`}
      className="mb-12 grid h-52 grid-cols-3 items-end gap-6 border-b border-white/10 px-2 sm:gap-10 sm:px-8"
    >
      {points.map((p) => (
        <div key={p.label} tabIndex={0} className="group relative flex h-full flex-col items-center justify-end focus:outline-none">
          <span className="mb-1.5 text-lg font-semibold text-white">{formatRate(p.rate)}</span>
          <span
            aria-hidden="true"
            className="block w-full max-w-16 rounded-t bg-chart-accent group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-white"
            style={{ height: `${(p.rate ?? 0) * 0.75}%`, minHeight: p.rate ? 2 : 0 }}
          />
          <span className="absolute top-full mt-2 whitespace-nowrap text-center text-xs text-white/55">
            {label(p)}
            <br />
            <span className="text-white/35">n = {formatInt(p.attempts)}</span>
          </span>
          <HoverTip align="center">
            <strong className="text-white">{label(p)}</strong>
            <br />
            {formatInt(p.perfect)} perfect of {formatInt(p.attempts)} usable ({formatRate(p.rate)})
          </HoverTip>
        </div>
      ))}
    </div>
  );
}
