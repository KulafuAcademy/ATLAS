import assert from "node:assert/strict";
import { test } from "node:test";
import { publicLearningAccessEnabled } from "../lib/public-learning-access";

test("public learning access is opt-in and recognizes only the exact true value", () => {
  const original = process.env.PUBLIC_LEARNING_ACCESS;
  try {
    delete process.env.PUBLIC_LEARNING_ACCESS;
    assert.equal(publicLearningAccessEnabled(), false);
    process.env.PUBLIC_LEARNING_ACCESS = "false";
    assert.equal(publicLearningAccessEnabled(), false);
    process.env.PUBLIC_LEARNING_ACCESS = "true";
    assert.equal(publicLearningAccessEnabled(), true);
  } finally {
    if (original === undefined) delete process.env.PUBLIC_LEARNING_ACCESS;
    else process.env.PUBLIC_LEARNING_ACCESS = original;
  }
});

test("only deployments of the preview branch are public without the flag", () => {
  const originalFlag = process.env.PUBLIC_LEARNING_ACCESS;
  const originalRef = process.env.VERCEL_GIT_COMMIT_REF;
  try {
    delete process.env.PUBLIC_LEARNING_ACCESS;
    process.env.VERCEL_GIT_COMMIT_REF = "main";
    assert.equal(publicLearningAccessEnabled(), false);
    process.env.VERCEL_GIT_COMMIT_REF = "main-feat/lesson-page-word-popover";
    assert.equal(publicLearningAccessEnabled(), true);
  } finally {
    if (originalFlag === undefined) delete process.env.PUBLIC_LEARNING_ACCESS;
    else process.env.PUBLIC_LEARNING_ACCESS = originalFlag;
    if (originalRef === undefined) delete process.env.VERCEL_GIT_COMMIT_REF;
    else process.env.VERCEL_GIT_COMMIT_REF = originalRef;
  }
});
