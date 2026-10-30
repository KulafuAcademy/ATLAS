import type { MinimalPair, TrainingProgress } from "@/types/training";

export type ProgressByCategory = Record<string, TrainingProgress>;

export const progressStorageKey = "atlas.trainingProgress.v1";
let staffStorageUserId: string | null = null;
export function userProgressStorageKey(userId: string) { return `atlas.${userId}.trainingProgress.v1`; }
export function setStaffStorageIdentity(userId: string) {
  if (!userId || staffStorageUserId === userId) return;
  const scopedKey = userProgressStorageKey(userId);
  try {
    if (!window.localStorage.getItem(scopedKey)) {
      const legacy = window.localStorage.getItem(progressStorageKey);
      if (legacy !== null) window.localStorage.setItem(scopedKey, legacy);
    }
    window.localStorage.removeItem(progressStorageKey);
  } catch {
    // Keep the staff session usable when browser storage is disabled.
  } finally {
    staffStorageUserId = userId;
  }
}
export function getProgressStorageKey() { return staffStorageUserId ? userProgressStorageKey(staffStorageUserId) : progressStorageKey; }

export function withTestResult(
  currentProgress: ProgressByCategory,
  sectionId: string,
  score: number,
  total: number,
): ProgressByCategory {
  const previousProgress = currentProgress[sectionId];

  return {
    ...currentProgress,
    [sectionId]: {
      attempts: (previousProgress?.attempts ?? 0) + 1,
      bestScore: Math.max(previousProgress?.bestScore ?? 0, score),
      lastScore: score,
      total,
      updatedAt: new Date().toISOString(),
    },
  };
}

// Reads the stored progress, adds one test result, and writes it back.
export function saveTestResult(sectionId: string, score: number, total: number) {
  let storedProgress: ProgressByCategory = {};

  try {
    storedProgress = JSON.parse(
      window.localStorage.getItem(getProgressStorageKey()) ?? "{}",
    ) as ProgressByCategory;
  } catch {
    storedProgress = {};
  }

  window.localStorage.setItem(
    getProgressStorageKey(),
    JSON.stringify(withTestResult(storedProgress, sectionId, score, total)),
  );
}

export function getDailyPairs(sectionId: string, pairs: MinimalPair[]) {
  return [...pairs]
    .sort((pairA, pairB) => {
      const dateKey = getLocalDateKey();
      const scoreA = hashString(`${dateKey}:${sectionId}:${pairA.id}`);
      const scoreB = hashString(`${dateKey}:${sectionId}:${pairB.id}`);

      return scoreA - scoreB;
    })
    .slice(0, 10);
}

function getLocalDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}
