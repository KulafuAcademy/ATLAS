"use client";

import { useSyncExternalStore } from "react";

// Word pairs whose tongue twister the learner has passed. Unlocks the
// "Next" pair link and opens every step when the pair is revisited.
const storageKey = "atlas.completedPairs.v1";
const changeEvent = "atlas:completed-pairs-change";

// Also kept in memory so the unlock works when localStorage is blocked.
const sessionCompleted = new Set<string>();

function readCompletedPairs(): string[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function markPairCompleted(pairId: string) {
  const completed = readCompletedPairs();
  if (completed.includes(pairId)) return;

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify([...completed, pairId]),
    );
  } catch {
    // Storage unavailable; the unlock still applies via the event below.
  }

  sessionCompleted.add(pairId);
  window.dispatchEvent(new Event(changeEvent));
}

function subscribe(onChange: () => void) {
  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function usePairCompleted(pairId: string | null | undefined) {
  return useSyncExternalStore(
    subscribe,
    () =>
      pairId
        ? sessionCompleted.has(pairId) || readCompletedPairs().includes(pairId)
        : false,
    () => false,
  );
}
