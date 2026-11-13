const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function formatInt(n: number) {
  return integer.format(n);
}

export function formatCompact(n: number) {
  return Math.abs(n) >= 10_000 ? compact.format(n) : integer.format(n);
}

/** "58%"; "—" when there is no rate. */
export function formatRate(rate: number | null) {
  return rate === null ? "—" : `${Math.round(rate)}%`;
}

export function formatScore(score: number | null) {
  return score === null ? "—" : String(Math.round(score));
}

export function formatSigned(n: number, unit = "") {
  const rounded = Math.round(n);
  if (rounded === 0) return `0${unit}`;
  return `${rounded > 0 ? "+" : "−"}${integer.format(Math.abs(rounded))}${unit}`;
}
