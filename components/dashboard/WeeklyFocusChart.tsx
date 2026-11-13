"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useLanguage } from "@/components/language/LanguageProvider";
import { ChartTooltipBox, DataTableToggle, tableClass, tdClass, thClass } from "@/components/dashboard/ui";
import { useChartTheme } from "@/components/dashboard/hooks";
import { SOUND_FOCUSES, type SoundFocus, type WeekRow } from "@/lib/dashboard/aggregate";
import { formatSchoolWeek } from "@/lib/dashboard/dates";
import { formatInt, formatRate } from "@/lib/dashboard/format";

/** Color follows the focus (fixed slot), never its rank or the filter. */
export function focusColorVar(focus: string) {
  const index = (SOUND_FOCUSES as readonly string[]).indexOf(focus);
  return `var(--chart-${index + 1})`;
}

type Datum = { week: string; label: string } & Partial<Record<SoundFocus, number>>;

export function WeeklyFocusChart({ weeks }: { weeks: WeekRow[] }) {
  const theme = useChartTheme();
  const { text } = useLanguage();
  if (!theme) return null;

  const present = SOUND_FOCUSES.filter((f) => weeks.some((w) => w[f]));
  const data: Datum[] = weeks.map((w) => {
    const row: Datum = { week: w.week, label: formatSchoolWeek(w.week) };
    for (const f of present) if (w[f]?.rate != null) row[f] = w[f]!.rate!;
    return row;
  });
  const byWeek = new Map(weeks.map((w) => [w.week, w]));
  const colorOf = (f: SoundFocus) => theme.series[SOUND_FOCUSES.indexOf(f)];
  const lastWeek = weeks[weeks.length - 1];
  const ariaLabel = `Line chart of weekly perfect rate for ${present.join(", ")} over ${weeks.length} school week${weeks.length === 1 ? "" : "s"}. Latest week: ${present
    .map((f) => `${f} ${formatRate(lastWeek[f]?.rate ?? null)}`)
    .join(", ")}.`;

  return (
    <div className="space-y-4">
      {present.length > 1 ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/65" aria-label={text({ en: "Legend", ja: "凡例" })}>
          {present.map((f) => (
            <li key={f} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded-full" style={{ background: focusColorVar(f) }} />
              {f}
            </li>
          ))}
        </ul>
      ) : null}
      <div role="figure" aria-label={ariaLabel} className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={theme.grid} />
            <XAxis dataKey="label" tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: theme.grid }} minTickGap={12} />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v: number) => `${v}%`}
              width={44}
              tick={{ fill: theme.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ stroke: theme.axis, strokeWidth: 1 }}
              content={({ active, payload }) => {
                const d = active ? (payload?.[0]?.payload as Datum | undefined) : undefined;
                const w = d ? byWeek.get(d.week) : undefined;
                if (!d || !w) return null;
                return (
                  <ChartTooltipBox title={`Week of ${d.label}`}>
                    {present
                      .filter((f) => w[f])
                      .sort((a, b) => (w[a]!.rate ?? 0) - (w[b]!.rate ?? 0))
                      .map((f) => (
                        <p key={f} className="flex items-center gap-1.5">
                          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full" style={{ background: colorOf(f) }} />
                          {f}: {formatRate(w[f]!.rate)} ({formatInt(w[f]!.perfect)}/{formatInt(w[f]!.attempts)})
                        </p>
                      ))}
                  </ChartTooltipBox>
                );
              }}
            />
            {present.map((f) => (
              <Line
                key={f}
                type="monotone"
                dataKey={f}
                name={f}
                stroke={colorOf(f)}
                strokeWidth={2}
                dot={{ r: 4, fill: colorOf(f), stroke: theme.surface, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: colorOf(f), stroke: theme.surface, strokeWidth: 2 }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DataTableToggle label={{ en: "Show weekly numbers", ja: "週ごとの数値を表示" }}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>{text({ en: "Week", ja: "週" })}</th>
              {present.map((f) => (
                <th key={f} className={`${thClass} text-right`}>
                  {f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...weeks].reverse().map((w) => (
              <tr key={w.week}>
                <td className={tdClass}>{formatSchoolWeek(w.week)}</td>
                {present.map((f) => (
                  <td key={f} className={`${tdClass} text-right`}>
                    {w[f] ? `${formatRate(w[f]!.rate)} · ${formatInt(w[f]!.attempts)}` : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableToggle>
    </div>
  );
}
