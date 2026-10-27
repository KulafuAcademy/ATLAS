import type { MinimalPair, TrainingProgress } from "@/types/training";

export type ProgressByCategory = Record<string, TrainingProgress>;

// Kept in memory only (no backend yet): it survives moving between pages,
// but closing or refreshing the site clears it.
let sessionProgress: ProgressByCategory = {};

export function getSessionProgress() {
  return sessionProgress;
}

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

// Adds one test result to this visit's progress.
export function saveTestResult(sectionId: string, score: number, total: number) {
  sessionProgress = withTestResult(sessionProgress, sectionId, score, total);
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
