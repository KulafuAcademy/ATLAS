// Run with: npm test
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  analyzePronunciation,
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

const request = {
  audio: new Blob(["audio"], { type: "audio/webm" }),
  fileName: "recording.webm",
  text: "right",
};

test("sends the word and one audio file", async () => {
  const calls = mockFetch(200, { ok: true });

  await analyzePronunciation(request);

  const { url, init } = calls[0];

  assert.match(url, /\/analyze$/);
  assert.equal(init.method, "POST");
  assert.equal(init.headers["ngrok-skip-browser-warning"], "true");
  assert.equal(init.body.get("text"), "right");
  assert.deepEqual(
    init.body.getAll("audio").map((file) => file.name),
    ["recording.webm"],
  );
});

test("a recording that can't be scored is a normal response, not an error", async () => {
  mockFetch(200, { ok: false, error: "too_short_or_quiet", message: "..." });

  const response = await analyzePronunciation(request);

  assert.equal(response.ok, false);
  assert.equal(response.error, "too_short_or_quiet");
});

test("HTTP errors throw with the status and detail", async () => {
  mockFetch(415, { detail: "could not decode audio" });

  await assert.rejects(
    analyzePronunciation(request),
    (error) =>
      error instanceof PronunciationApiError &&
      error.status === 415 &&
      error.detail === "could not decode audio",
  );
});

test("a network failure throws status 0", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("failed to fetch");
  };

  await assert.rejects(
    analyzePronunciation(request),
    (error) => error instanceof PronunciationApiError && error.status === 0,
  );
});

test("a recording over 10 MB is refused before uploading", async () => {
  const calls = mockFetch(200, { ok: true });

  await assert.rejects(
    analyzePronunciation({
      ...request,
      audio: new Blob([new Uint8Array(maxAudioBytes + 1)]),
    }),
    (error) => error instanceof PronunciationApiError && error.status === 413,
  );
  assert.equal(calls.length, 0);
});
