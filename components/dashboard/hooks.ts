"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

type AsyncState<T> = { fn: () => Promise<T>; nonce: number; data?: T; error?: string };

/**
 * Runs `fn` whenever it changes (memoize it with useCallback) and exposes
 * loading / error / retry. Loading is derived, so a stale result never shows
 * for new filters.
 */
export function useAsync<T>(fn: () => Promise<T>) {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<AsyncState<T> | null>(null);

  useEffect(() => {
    let live = true;
    fn().then(
      (data) => live && setState({ fn, nonce, data }),
      (error: unknown) => live && setState({ fn, nonce, error: error instanceof Error ? error.message : String(error) }),
    );
    return () => {
      live = false;
    };
  }, [fn, nonce]);

  const current = state && state.fn === fn && state.nonce === nonce ? state : null;
  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { data: current?.data, error: current?.error ?? null, loading: current === null, retry };
}

export type ChartTheme = {
  accent: string;
  muted: string;
  grid: string;
  axis: string;
  series: string[];
  surface: string;
};

let cachedTheme: ChartTheme | null = null;

function readTheme(): ChartTheme {
  if (cachedTheme) return cachedTheme;
  const style = getComputedStyle(document.documentElement);
  const v = (name: string) => style.getPropertyValue(name).trim();
  cachedTheme = {
    accent: v("--chart-accent"),
    muted: v("--chart-muted"),
    grid: v("--chart-grid"),
    axis: v("--chart-axis"),
    series: [1, 2, 3, 4, 5, 6].map((i) => v(`--chart-${i}`)),
    surface: v("--background"),
  };
  return cachedTheme;
}

const noopSubscribe = () => () => {};

/** Chart colors from the theme's CSS variables (SVG attributes need real values). */
export function useChartTheme(): ChartTheme | null {
  return useSyncExternalStore(noopSubscribe, readTheme, () => null);
}
