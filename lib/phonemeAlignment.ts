/**
 * Lines up the phonemes the learner said with the ones expected, so the UI
 * can show what was heard word by word and mark each sound. The server sends
 * the heard phonemes as one flat list with no word boundaries; this recovers
 * them with a standard edit-distance (Levenshtein) alignment.
 */

export type PhonemeStep =
  | { kind: "match"; expected: string; heard: string }
  | { kind: "substitute"; expected: string; heard: string }
  | { kind: "missing"; expected: string }
  | { kind: "extra"; heard: string };

export type AlignedStep = {
  step: PhonemeStep;
  /**
   * The expected phoneme this step belongs to. An extra sound belongs to the
   * expected phoneme just before it (or the first one, at the very start).
   */
  expectedIndex: number;
};

export function alignPhonemes(
  expected: string[],
  heard: string[],
): AlignedStep[] {
  const rows = expected.length + 1;
  const cols = heard.length + 1;
  const cost: number[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const swap = expected[i - 1] === heard[j - 1] ? 0 : 1;
      cost[i][j] = Math.min(
        cost[i - 1][j - 1] + swap,
        cost[i - 1][j] + 1,
        cost[i][j - 1] + 1,
      );
    }
  }

  // Walk back from the end, preferring match/substitute, then missing, then extra.
  const steps: AlignedStep[] = [];
  let i = expected.length;
  let j = heard.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const same = expected[i - 1] === heard[j - 1];

      if (cost[i][j] === cost[i - 1][j - 1] + (same ? 0 : 1)) {
        steps.push({
          step: same
            ? { kind: "match", expected: expected[i - 1], heard: heard[j - 1] }
            : { kind: "substitute", expected: expected[i - 1], heard: heard[j - 1] },
          expectedIndex: i - 1,
        });
        i -= 1;
        j -= 1;
        continue;
      }
    }

    if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      steps.push({
        step: { kind: "missing", expected: expected[i - 1] },
        expectedIndex: i - 1,
      });
      i -= 1;
      continue;
    }

    steps.push({
      step: { kind: "extra", heard: heard[j - 1] },
      expectedIndex: Math.max(0, i - 1),
    });
    j -= 1;
  }

  return steps.reverse();
}

/**
 * Splits the alignment into one group per word, given how many expected
 * phonemes each word has (in order).
 */
export function groupStepsByWord(
  steps: AlignedStep[],
  phonemeCounts: number[],
): PhonemeStep[][] {
  const groups: PhonemeStep[][] = phonemeCounts.map(() => []);
  const wordOfIndex: number[] = [];

  phonemeCounts.forEach((count, wordIndex) => {
    for (let k = 0; k < count; k += 1) wordOfIndex.push(wordIndex);
  });

  for (const { step, expectedIndex } of steps) {
    const wordIndex = wordOfIndex[expectedIndex] ?? groups.length - 1;
    groups[wordIndex]?.push(step);
  }

  return groups;
}
