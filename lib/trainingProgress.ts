import type { MinimalPair, TrainingProgress } from "@/types/training";

export type ProgressByCategory = Record<string, TrainingProgress>;

export const progressStorageKey = "atlas.trainingProgress.v1";

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
      window.localStorage.getItem(progressStorageKey) ?? "{}",
    ) as ProgressByCategory;
  } catch {
    storedProgress = {};
  }

  window.localStorage.setItem(
    progressStorageKey,
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
