"use client";

import { useMemo, useSyncExternalStore } from "react";

export const completedPairsStorageKey = "atlas.completedPairs.v1";

const completedPairsChangeEvent = "atlas:completed-pairs-change";

// Pairs completed in this tab, so unlocking still works when localStorage
// is blocked (private mode, storage disabled).
const sessionCompleted = new Set<string>();

function readCompletedPairs(): string[] {
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(completedPairsStorageKey) ?? "[]",
    ) as unknown;

    return Array.isArray(stored)
      ? stored.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function markPairCompleted(pairId: string) {
  const storedPairs = readCompletedPairs();

  if (storedPairs.includes(pairId)) return;

  try {
    window.localStorage.setItem(
      completedPairsStorageKey,
      JSON.stringify([...storedPairs, pairId]),
    );
  } catch {
    // Storage unavailable; sessionCompleted still unlocks for this visit.
  }

  sessionCompleted.add(pairId);
  window.dispatchEvent(new Event(completedPairsChangeEvent));
}

function subscribe(onChange: () => void) {
  window.addEventListener(completedPairsChangeEvent, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(completedPairsChangeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// True once the learner has passed this pair's tongue twister.
export function usePairCompleted(pairId: string | null | undefined) {
  return useSyncExternalStore(
    subscribe,
    () =>
      pairId
        ? sessionCompleted.has(pairId) ||
          readCompletedPairs().includes(pairId)
        : false,
    () => false,
  );
}

// Every completed pair ID. The snapshot is a joined string so it stays
// equal between reads (useSyncExternalStore needs a stable value).
function getCompletedPairsSnapshot() {
  return [...new Set([...readCompletedPairs(), ...sessionCompleted])]
    .sort()
    .join("\n");
}

export function useCompletedPairs() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getCompletedPairsSnapshot,
    () => "",
  );

  return useMemo(
    () => new Set(snapshot ? snapshot.split("\n") : []),
    [snapshot],
  );
}
