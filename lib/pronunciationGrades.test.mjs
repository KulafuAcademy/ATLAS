// Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { wordStatusColor, wordStatusColors } from "./pronunciationGrades.ts";

const green = wordStatusColors.great;
const white = "#ffffff";
const amber = wordStatusColors.practice;

test("chip colours follow the server status", () => {
  // "Green grass grows near a clear glass": "Green grass" skipped, and
  // "grows" said with s instead of z.
  const words = [
    { word: "Green", status: "skipped" },
    { word: "grass", status: "skipped" },
    { word: "grows", status: "practice" },
    { word: "near", status: "great" },
    { word: "a", status: "great" },
    { word: "clear", status: "great" },
    { word: "glass", status: "great" },
  ];

  assert.deepEqual(
    words.map((word) => wordStatusColor(word.status)),
    [white, white, amber, green, green, green, green],
  );
});

test("old, missing and unknown statuses are white", () => {
  assert.equal(wordStatusColor("ok"), white);
  assert.equal(wordStatusColor(undefined), white);
  assert.equal(wordStatusColor("something-new"), white);
  assert.equal(wordStatusColor("constructor"), white);
});
