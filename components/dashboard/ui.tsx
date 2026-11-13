"use client";

import type { ReactNode } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";

export type LoadState = { loading: boolean; error: string | null; retry: () => void };

type SectionProps = {
  id: string;
  eyebrow: LocalizedText;
  title: LocalizedText;
  note?: LocalizedText;
  wide?: boolean;
  /** Skeleton height in px while loading; matches the loaded content. */
  skeletonHeight: number;
  state: LoadState;
  empty: boolean;
  children: ReactNode;
};

/** A dashboard card with built-in loading, error and empty states. */
export function Section({ id, eyebrow, title, note, wide, skeletonHeight, state, empty, children }: SectionProps) {
  const { text } = useLanguage();
  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-busy={state.loading}
      className={`min-w-0 space-y-5 border border-white/10 bg-white/[0.02] p-5 sm:p-7 ${wide ? "lg:col-span-2" : ""}`}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{text(eyebrow)}</p>
        <h2 id={`${id}-title`} className="text-xl font-semibold text-white">
          {text(title)}
        </h2>
        {note ? <p className="text-sm leading-6 text-white/55">{text(note)}</p> : null}
      </div>
      {state.loading ? (
        <Skeleton height={skeletonHeight} />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={state.retry} height={skeletonHeight} />
      ) : empty ? (
        <EmptyState height={skeletonHeight} />
      ) : (
        children
      )}
    </section>
  );
}

export function Skeleton({ height, className = "" }: { height: number; className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-white/[0.06] ${className}`} style={{ height }} />;
}

export function ErrorState({ message, onRetry, height }: { message: string; onRetry: () => void; height?: number }) {
  const { text } = useLanguage();
  return (
    <div role="alert" className="flex flex-col items-start justify-center gap-3" style={{ minHeight: height }}>
      <p className="text-sm text-white/70">
        {text({ en: "Couldn’t load this data.", ja: "データを読み込めませんでした。" })}{" "}
        <span className="text-white/40">{message}</span>
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="h-10 border border-white/20 px-4 text-sm font-semibold text-white transition hover:border-white focus:outline-none focus-visible:border-white"
      >
        {text({ en: "Retry", ja: "再試行" })}
      </button>
    </div>
  );
}

export function EmptyState({ height }: { height?: number }) {
  const { text } = useLanguage();
  return (
    <div className="flex items-center justify-center border border-dashed border-white/10 text-sm text-white/45" style={{ minHeight: height }}>
      {text({ en: "No practice in this range", ja: "この期間の練習はありません" })}
    </div>
  );
}

/** Signed change with an arrow; good/bad color comes from the theme. */
export function Delta({ value, label, unit = "" }: { value: number | null; label: string; unit?: string }) {
  if (value === null) return <p className="text-xs text-white/40">{label}</p>;
  const rounded = Math.round(value);
  const tone = rounded > 0 ? "text-good" : rounded < 0 ? "text-bad" : "text-white/45";
  const arrow = rounded > 0 ? "▲" : rounded < 0 ? "▼" : "■";
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "±";
  return (
    <p className="text-xs">
      <span className={`font-semibold ${tone}`}>
        <span aria-hidden="true">{arrow} </span>
        {sign}
        {Math.abs(rounded).toLocaleString("en-US")}
        {unit}
      </span>{" "}
      <span className="text-white/40">{label}</span>
    </p>
  );
}

/** Tooltip for HTML marks: shows on hover and on keyboard focus of `group`. */
export function HoverTip({ children, align = "left" }: { children: ReactNode; align?: "left" | "center" }) {
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max max-w-64 border border-white/15 bg-black px-3 py-2 text-xs leading-5 text-white/80 shadow-lg group-hover:block group-focus-visible:block ${
        align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
      }`}
    >
      {children}
    </span>
  );
}

export function ChartTooltipBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-white/15 bg-black px-3 py-2 text-xs leading-5 text-white/80 shadow-lg">
      <p className="mb-1 font-semibold text-white">{title}</p>
      {children}
    </div>
  );
}

/** Collapsible table so chart values are readable without hovering. */
export function DataTableToggle({ label, children }: { label: LocalizedText; children: ReactNode }) {
  const { text } = useLanguage();
  return (
    <details className="group/details">
      <summary className="cursor-pointer text-xs font-semibold text-white/55 transition hover:text-white focus:outline-none focus-visible:text-white">
        {text(label)}
      </summary>
      <div className="mt-3 max-h-72 overflow-auto">{children}</div>
    </details>
  );
}

export const tableClass = "w-full min-w-max border-collapse text-left text-sm tabular-nums";
export const thClass = "border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/40";
export const tdClass = "border-b border-white/[0.06] px-3 py-2 text-white/75";
