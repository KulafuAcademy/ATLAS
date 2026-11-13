"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useLanguage } from "@/components/language/LanguageProvider";
import { ChartTooltipBox, DataTableToggle, tableClass, tdClass, thClass } from "@/components/dashboard/ui";
import { useChartTheme } from "@/components/dashboard/hooks";
import type { DayPoint } from "@/lib/dashboard/aggregate";
import { formatDay, formatDayLong } from "@/lib/dashboard/dates";
import { formatCompact, formatInt, formatRate, formatScore } from "@/lib/dashboard/format";

const Y_WIDTH = 44;
const MARGIN = { top: 8, right: 16, bottom: 0, left: 0 };

type Datum = DayPoint & { label: string };

/**
 * Perfect rate per day, with attempts in a short panel underneath that shares
 * the x-axis (two aligned panels instead of a dual-axis chart). The x-axis is
 * categorical, so only days with data appear; days without practice leave no gap.
 */
export function TrendChart({ days }: { days: DayPoint[] }) {
  const theme = useChartTheme();
  const { text } = useLanguage();
  if (!theme) return null;
  const data: Datum[] = days.map((d) => ({ ...d, label: formatDay(d.day) }));
  const first = days[0];
  const last = days[days.length - 1];
  const ariaLabel = `Line chart of perfect rate per day with practice from ${formatDayLong(first.day)} to ${formatDayLong(last.day)}, ${days.length} days. Latest day ${formatRate(last.rate)} perfect from ${formatInt(last.attempts)} attempts. Bars underneath show attempts per day.`;

  const tooltip = ({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: Datum }> }) => {
    const d = active ? payload?.[0]?.payload : undefined;
    if (!d) return null;
    return (
      <ChartTooltipBox title={formatDayLong(d.day)}>
        <p>Perfect rate: {formatRate(d.rate)} ({formatInt(d.perfect)} of {formatInt(d.attempts)})</p>
        <p>Attempts: {formatInt(d.attempts)}</p>
        <p>Average score: {formatScore(d.avgScore)}</p>
      </ChartTooltipBox>
    );
  };

  const xAxis = (hide: boolean) => (
    <XAxis
      dataKey="label"
      hide={hide}
      tick={{ fill: theme.axis, fontSize: 11 }}
      tickLine={false}
      axisLine={{ stroke: theme.grid }}
      interval="preserveStartEnd"
      minTickGap={16}
    />
  );

  return (
    <div className="space-y-4">
      <div role="figure" aria-label={ariaLabel}>
        <p className="mb-1 text-xs text-white/45">{text({ en: "Perfect rate", ja: "満点率" })}</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} syncId="dashboard-trend" margin={MARGIN}>
              <CartesianGrid vertical={false} stroke={theme.grid} />
              {xAxis(true)}
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v: number) => `${v}%`}
                width={Y_WIDTH}
                tick={{ fill: theme.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={tooltip} cursor={{ stroke: theme.axis, strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={theme.accent}
                strokeWidth={2}
                dot={data.length <= 25 ? { r: 3, fill: theme.accent, stroke: theme.surface, strokeWidth: 2 } : false}
                activeDot={{ r: 5, fill: theme.accent, stroke: theme.surface, strokeWidth: 2 }}
                connectNulls
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mb-1 mt-3 text-xs text-white/45">{text({ en: "Attempts", ja: "練習回数" })}</p>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} syncId="dashboard-trend" margin={MARGIN} barCategoryGap={2}>
              <CartesianGrid vertical={false} stroke={theme.grid} />
              {xAxis(false)}
              <YAxis
                width={Y_WIDTH}
                tickCount={3}
                allowDecimals={false}
                tickFormatter={(v: number) => formatCompact(v)}
                tick={{ fill: theme.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={tooltip} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="attempts" fill={theme.muted} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <DataTableToggle label={{ en: "Show daily numbers", ja: "日ごとの数値を表示" }}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>{text({ en: "Day", ja: "日付" })}</th>
              <th className={`${thClass} text-right`}>{text({ en: "Attempts", ja: "練習回数" })}</th>
              <th className={`${thClass} text-right`}>{text({ en: "Perfect rate", ja: "満点率" })}</th>
              <th className={`${thClass} text-right`}>{text({ en: "Avg score", ja: "平均点" })}</th>
            </tr>
          </thead>
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.day}>
                <td className={tdClass}>{formatDayLong(d.day)}</td>
                <td className={`${tdClass} text-right`}>{formatInt(d.attempts)}</td>
                <td className={`${tdClass} text-right`}>{formatRate(d.rate)}</td>
                <td className={`${tdClass} text-right`}>{formatScore(d.avgScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableToggle>
    </div>
  );
}
