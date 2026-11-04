import assert from "node:assert/strict";
import { test } from "node:test";
import { lessonPractice } from "../data/lessonPractice";
import { getActiveWordIndex, sentenceTimings, splitSentence } from "../lib/sentenceTimings";

const sentences = Object.values(lessonPractice).flatMap((practice) => practice.sentences);

// Same rule as getSentenceFilename in components/training/audio.ts, which imports React.
function filename(sentence: string) {
  return sentence
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

test("every sentence has timings for exactly its words, in order", () => {
  for (const sentence of sentences) {
    const words = splitSentence(sentence).filter((_, index) => index % 2 === 1);
    const timings = sentenceTimings[filename(sentence)];
    assert.ok(timings, `no timings for: ${sentence}`);
    assert.deepEqual(timings.map((timing) => timing.word), words);
  }
});

test("timings never go backwards", () => {
  for (const [key, timings] of Object.entries(sentenceTimings)) {
    timings.forEach((timing, index) => {
      assert.ok(timing.start < timing.end, `${key}: ${timing.word}`);
      if (index > 0) assert.ok(timing.start >= timings[index - 1].end, `${key}: ${timing.word}`);
    });
  }
});

test("the active word follows the time and clears outside the speech", () => {
  const words = [
    { word: "one", start: 0.1, end: 0.3 },
    { word: "two", start: 0.5, end: 0.7 },
  ];
  assert.equal(getActiveWordIndex(words, 0), -1);
  assert.equal(getActiveWordIndex(words, 0.1), 0);
  assert.equal(getActiveWordIndex(words, 0.4), 0);
  assert.equal(getActiveWordIndex(words, 0.5), 1);
  assert.equal(getActiveWordIndex(words, 0.7), -1);
});
