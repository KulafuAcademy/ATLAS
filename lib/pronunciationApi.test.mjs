// Run with: npm test
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  analyzeWordAttempts,
  maxAudioBytes,
  PronunciationApiError,
} from "./pronunciationApi.ts";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

function mockFetch(status, body) {
  const calls = [];

  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status });
  };

  return calls;
}

const clip = (name) => ({
  blob: new Blob(["audio"], { type: "audio/webm" }),
  fileName: name,
});

test("sends the word and one audio field per try, in order", async () => {
  const calls = mockFetch(200, { ok: true, bestAttempt: 1, attempts: [] });

  await analyzeWordAttempts({
    clips: [clip("try1.webm"), clip("try2.webm"), clip("try3.webm")],
    text: "right",
  });

  const { url, init } = calls[0];

  assert.match(url, /\/analyze-word$/);
  assert.equal(init.method, "POST");
  assert.equal(init.headers["ngrok-skip-browser-warning"], "true");
  assert.equal(init.body.get("text"), "right");
  assert.deepEqual(
    init.body.getAll("audio").map((file) => file.name),
    ["try1.webm", "try2.webm", "try3.webm"],
  );
});

test("no usable try is a normal response, not an error", async () => {
  mockFetch(200, {
    ok: false,
    error: "too_short_or_quiet",
    message: "...",
    bestAttempt: null,
    attempts: [{ attempt: 1, ok: false, error: "too_short_or_quiet" }],
  });

  const response = await analyzeWordAttempts({
    clips: [clip("try1.webm")],
    text: "right",
  });

  assert.equal(response.ok, false);
  assert.equal(response.bestAttempt, null);
});

test("HTTP errors throw with the status and detail", async () => {
  mockFetch(415, { detail: "every clip undecodable" });

  await assert.rejects(
    analyzeWordAttempts({ clips: [clip("try1.webm")], text: "right" }),
    (error) =>
      error instanceof PronunciationApiError &&
      error.status === 415 &&
      error.detail === "every clip undecodable",
  );
});

test("a network failure throws status 0", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("failed to fetch");
  };

  await assert.rejects(
    analyzeWordAttempts({ clips: [clip("try1.webm")], text: "right" }),
    (error) => error instanceof PronunciationApiError && error.status === 0,
  );
});

test("a clip over 10 MB is refused before uploading", async () => {
  const calls = mockFetch(200, { ok: true });

  await assert.rejects(
    analyzeWordAttempts({
      clips: [
        clip("try1.webm"),
        { blob: new Blob([new Uint8Array(maxAudioBytes + 1)]), fileName: "try2.webm" },
      ],
      text: "right",
    }),
    (error) => error instanceof PronunciationApiError && error.status === 413,
  );
  assert.equal(calls.length, 0);
});
