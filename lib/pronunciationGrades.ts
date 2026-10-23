/**
 * Grade bands for pronunciation scores. These match the bands the
 * pronunciation server uses, so a word scored here and the overall grade
 * returned by the server always agree.
 *
 * These colours are the only colours outside the black-and-white theme.
 * Use them only on score-related elements (score badge, word highlights,
 * issue score indicators).
 */
export const pronunciationGrades = [
  {
    letter: "A",
    minScore: 90,
    verdict: { en: "Excellent!", ja: "すばらしい！" },
    color: "#16a34a",
  },
  {
    letter: "B",
    minScore: 75,
    verdict: { en: "Good", ja: "いいね" },
    color: "#65a30d",
  },
  {
    letter: "C",
    minScore: 55,
    verdict: { en: "Needs some work", ja: "もう少し" },
    color: "#d97706",
  },
  {
    letter: "D",
    minScore: 0,
    verdict: { en: "Try again", ja: "もう一度" },
    color: "#dc2626",
  },
] as const;

export type PronunciationGradeBand = (typeof pronunciationGrades)[number];

/** The A colour, also used for the "every word correct" celebration. */
export const excellentColor = pronunciationGrades[0].color;

/** Maps a 0–100 score to its grade band. */
export function gradeFor(score: number): PronunciationGradeBand {
  return (
    pronunciationGrades.find((grade) => score >= grade.minScore) ??
    pronunciationGrades[pronunciationGrades.length - 1]
  );
}

/** Looks up a band by letter, e.g. to translate the server's verdict. */
export function gradeByLetter(letter: string) {
  return pronunciationGrades.find((grade) => grade.letter === letter);
}
