"use client";

import { useMemo, useSyncExternalStore } from "react";

const completedPairsChangeEvent = "atlas:completed-pairs-change";

// Kept in memory only (no backend yet): it survives moving between pages,
// but closing or refreshing the site clears it.
const completedPairs = new Set<string>();

export function markPairCompleted(pairId: string) {
  if (completedPairs.has(pairId)) return;

  completedPairs.add(pairId);
  window.dispatchEvent(new Event(completedPairsChangeEvent));
}

function subscribe(onChange: () => void) {
  window.addEventListener(completedPairsChangeEvent, onChange);

  return () => window.removeEventListener(completedPairsChangeEvent, onChange);
}

// True once the learner has passed this pair's tongue twister.
export function usePairCompleted(pairId: string | null | undefined) {
  return useSyncExternalStore(
    subscribe,
    () => (pairId ? completedPairs.has(pairId) : false),
    () => false,
  );
}

// Every completed pair ID. The snapshot is a joined string so it stays
// equal between reads (useSyncExternalStore needs a stable value).
function getCompletedPairsSnapshot() {
  return [...completedPairs].sort().join("\n");
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
