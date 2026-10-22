import { trainingSections } from "@/data/trainingSections";

export function getLessonHref(sectionId: string) {
  return `/lessons/${sectionId}`;
}

export function getPairHref(sectionId: string, pairId: string) {
  return `/lessons/${sectionId}/pairs/${pairId}`;
}

// "Take test" opens the first pair of the lesson set.
export function getTestHref(sectionId: string) {
  const section = getTrainingSection(sectionId);
  const firstPair = section?.pairs[0];

  return firstPair ? getPairHref(sectionId, firstPair.id) : getLessonHref(sectionId);
}

export function getTrainingSection(sectionId: string) {
  return trainingSections.find((section) => section.id === sectionId) ?? null;
}

export function getAdjacentSections(sectionId: string) {
  const index = trainingSections.findIndex((section) => section.id === sectionId);

  return {
    previous: index > 0 ? trainingSections[index - 1] : null,
    next:
      index >= 0 && index < trainingSections.length - 1
        ? trainingSections[index + 1]
        : null,
  };
}

export function getPairWithNeighbors(sectionId: string, pairId: string) {
  const section = getTrainingSection(sectionId);

  if (!section) {
    return null;
  }

  const index = section.pairs.findIndex((pair) => pair.id === pairId);

  if (index < 0) {
    return null;
  }

  return {
    section,
    pair: section.pairs[index],
    position: index + 1,
    total: section.pairs.length,
    previous: index > 0 ? section.pairs[index - 1] : null,
    next: index < section.pairs.length - 1 ? section.pairs[index + 1] : null,
  };
}
