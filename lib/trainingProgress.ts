import type { TrainingProgress } from "@/types/training";

export type ProgressByCategory = Record<string, TrainingProgress>;

export const trainingProgressStorageKey = "atlas.trainingProgress.v1";
export const trainingProgressUpdatedEvent = "atlas:training-progress-updated";

export function readTrainingProgress(): ProgressByCategory {
  const savedProgress = window.localStorage.getItem(trainingProgressStorageKey);

  if (!savedProgress) {
    return {};
  }

  try {
    return JSON.parse(savedProgress) as ProgressByCategory;
  } catch {
    window.localStorage.removeItem(trainingProgressStorageKey);
    return {};
  }
}

export function saveTrainingTestResult(
  categoryId: string,
  score: number,
  total: number,
): ProgressByCategory {
  const currentProgress = readTrainingProgress();
  const previousProgress = currentProgress[categoryId];
  const nextProgress = {
    ...currentProgress,
    [categoryId]: {
      attempts: (previousProgress?.attempts ?? 0) + 1,
      bestScore: Math.max(previousProgress?.bestScore ?? 0, score),
      lastScore: score,
      total,
      updatedAt: new Date().toISOString(),
    },
  };

  window.localStorage.setItem(
    trainingProgressStorageKey,
    JSON.stringify(nextProgress),
  );
  window.dispatchEvent(new Event(trainingProgressUpdatedEvent));

  return nextProgress;
}
