// Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  countPassedTries,
  GuidedWordSession,
  READY_MS,
  REST_MS,
  SPEAK_LONG_MS,
  SPEAK_MS,
  speakMsFor,
} from "./guidedWordSession.ts";

const success = {
  ok: true,
  score: 100,
  bestAttempt: 2,
  attempts: [],
  words: [],
};

function deferred() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

// Lets every already-resolved step of the session's run settle.
async function settle() {
  for (let index = 0; index < 50; index += 1) await Promise.resolve();
}

/** A session whose effects log what happened, in order, and never wait. */
function setup({ word = "right", overrides = {} } = {}) {
  const log = [];
  const uploads = [];
  const effects = {
    requestMic: async () => {
      log.push("mic");
      return null;
    },
    releaseMic: () => log.push("release"),
    stopAudio: () => log.push("stopAudio"),
    playChime: async () => log.push("chime"),
    startRecording: async (tryNumber) => log.push(`record:${tryNumber}`),
    stopRecording: async () => {
      const tryNumber = log.filter((entry) => entry === "stopRec").length + 1;
      log.push("stopRec");
      return { blob: {}, fileName: `try${tryNumber}.webm`, tryNumber };
    },
    discardRecording: () => log.push("discard"),
    upload: async (clips, signal) => {
      log.push("upload");
      uploads.push({ clips: [...clips], signal });
      return success;
    },
    wait: async (ms) => log.push(`wait:${ms}`),
    ...overrides,
  };
  const session = new GuidedWordSession(word, effects);
  const phases = [];

  session.subscribe(() => {
    const { phase, tryNumber } = session.getState();
    const label = tryNumber ? `${phase}:${tryNumber}` : phase;
    if (phases.at(-1) !== label) phases.push(label);
  });

  return { session, log, phases, uploads };
}

test("words of 9 or more letters get the longer speaking time", () => {
  assert.equal(speakMsFor("light"), SPEAK_MS);
  assert.equal(speakMsFor("umbrellas"), SPEAK_LONG_MS);
  assert.equal(speakMsFor("don't-go"), SPEAK_MS);
});

test("only tries graded A or B count as passed", () => {
  const graded = (attempt, letter) => ({
    attempt,
    ok: true,
    score: 0,
    grade: { letter },
    heard: {},
  });

  assert.equal(
    countPassedTries([
      graded(1, "A"),
      graded(2, "B"),
      { attempt: 3, ok: false, error: "too_short_or_quiet" },
    ]),
    2,
  );
  assert.equal(countPassedTries([graded(1, "A"), graded(2, "A"), graded(3, "A")]), 3);
  assert.equal(countPassedTries([graded(1, "C"), graded(2, "D")]), 0);
  assert.equal(countPassedTries([]), 0);
});

test("runs ready, speak and rest three times, then uploads", async () => {
  const { session, phases } = setup();

  await session.start();

  assert.deepEqual(phases, [
    "idle",
    "ready:1",
    "speak:1",
    "rest:1",
    "ready:2",
    "speak:2",
    "rest:2",
    "ready:3",
    "speak:3",
    "rest:3",
    "uploading",
    "result",
  ]);
  assert.equal(session.getState().outcome.kind, "success");
  assert.equal(session.getState().doneTries, 3);
  assert.equal(session.isRunning, false);
});

test("each try keeps the chime out of the clip and uses the full times", async () => {
  const { session, log } = setup();

  await session.start();

  assert.deepEqual(log.slice(0, 9), [
    "stopAudio",
    "mic",
    `wait:${READY_MS}`,
    "chime",
    "record:1",
    `wait:${SPEAK_MS}`,
    "stopRec",
    `wait:${REST_MS}`,
    `wait:${READY_MS}`,
  ]);
  assert.ok(log.indexOf("release") < log.indexOf("upload"));
  assert.equal(log.filter((entry) => entry === "mic").length, 1);
});

test("a long word uses the longer speak phase", async () => {
  const { session, log } = setup({ word: "umbrellas" });

  await session.start();

  assert.equal(log.filter((entry) => entry === `wait:${SPEAK_LONG_MS}`).length, 3);
  assert.ok(!log.includes(`wait:${SPEAK_MS}`));
});

test("the speak phase only shows once recording has begun", async () => {
  const recording = deferred();
  const { session, phases } = setup({
    overrides: { startRecording: () => recording.promise },
  });

  void session.start();
  await settle();
  assert.equal(phases.at(-1), "ready:1");

  recording.resolve();
  await settle();
  assert.ok(phases.includes("speak:1"));
  session.cancel();
});

test("rest waits for the recorder's stop event", async () => {
  const stopped = deferred();
  const { session, phases } = setup({
    overrides: { stopRecording: () => stopped.promise },
  });

  void session.start();
  await settle();
  assert.equal(phases.at(-1), "speak:1");
  assert.equal(session.getState().doneTries, 0);

  stopped.resolve({ blob: {}, fileName: "try1.webm", tryNumber: 1 });
  await settle();
  assert.ok(phases.includes("rest:1"));
  session.cancel();
});

for (const phase of ["ready", "speak", "rest"]) {
  test(`cancel during ${phase} stops everything and discards the clips`, async () => {
    const { session, log, phases, uploads } = setup({
      overrides: {
        // Stays in the wanted phase until cancel() aborts the wait.
        wait: (_ms, signal) =>
          session.getState().phase === phase
            ? new Promise((resolve) =>
                signal.addEventListener("abort", () => resolve()),
              )
            : Promise.resolve(),
      },
    });

    void session.start();
    await settle();
    assert.equal(phases.at(-1), `${phase}:1`);

    session.cancel();
    await settle();

    assert.equal(session.getState().phase, "idle");
    assert.equal(session.getState().doneTries, 0);
    assert.equal(session.isRunning, false);
    assert.equal(phases.at(-1), "idle");
    assert.ok(!phases.includes("ready:2"));
    assert.ok(log.includes("discard"));
    assert.ok(log.includes("release"));
    assert.equal(uploads.length, 0);
  });
}

test("cancel while waiting for the mic never starts the tries", async () => {
  const mic = deferred();
  const { session, phases } = setup({
    overrides: { requestMic: () => mic.promise },
  });

  void session.start();
  session.cancel();
  mic.resolve(null);
  await settle();

  assert.deepEqual(phases, ["idle"]);
  assert.equal(session.getState().requestingMic, false);
});

test("cancel during the upload aborts it and ignores a late answer", async () => {
  const answer = deferred();
  let signal;
  const { session, phases } = setup({
    overrides: {
      upload: (_clips, uploadSignal) => {
        signal = uploadSignal;
        return answer.promise;
      },
    },
  });

  void session.start();
  await settle();
  assert.equal(phases.at(-1), "uploading");

  session.cancel();
  answer.resolve(success);
  await settle();

  assert.equal(signal.aborted, true);
  assert.equal(session.getState().phase, "idle");
  assert.equal(session.getState().outcome, null);
});

test("a cancelled run can't disturb a restarted one", async () => {
  const firstMic = deferred();
  let micCalls = 0;
  const { session, log } = setup({
    overrides: {
      requestMic: () => {
        micCalls += 1;
        return micCalls === 1 ? firstMic.promise : Promise.resolve(null);
      },
    },
  });

  void session.start();
  session.cancel();
  log.length = 0;

  await session.start();
  firstMic.resolve(null);
  await settle();

  assert.equal(session.getState().outcome.kind, "success");
  assert.equal(log.filter((entry) => entry === "upload").length, 1);
  assert.ok(!log.includes("discard"));
});

test("a denied mic stays on the first screen with the reason", async () => {
  const { session, phases, uploads } = setup({
    overrides: { requestMic: async () => "denied" },
  });

  await session.start();

  assert.deepEqual(phases, ["idle"]);
  assert.equal(session.getState().micError, "denied");
  assert.equal(session.getState().requestingMic, false);
  assert.equal(session.isRunning, false);
  assert.equal(uploads.length, 0);
});

test("a try with no clip keeps the rhythm and maps the best try back", async () => {
  // Try 1 fails to start, so the server's attempt 2 is the child's try 3.
  let nextTry = 2;
  const { session, phases, uploads } = setup({
    overrides: {
      startRecording: async (tryNumber) => {
        if (tryNumber === 1) throw new Error("no recorder");
      },
      stopRecording: async () => {
        const tryNumber = nextTry;
        nextTry += 1;
        return { blob: {}, fileName: `try${tryNumber}.webm`, tryNumber };
      },
    },
  });

  await session.start();

  assert.ok(phases.includes("speak:1"));
  assert.ok(phases.includes("rest:3"));
  assert.deepEqual(
    uploads[0].clips.map((clip) => clip.fileName),
    ["try2.webm", "try3.webm"],
  );
  assert.equal(session.getState().outcome.bestTry, 3);
  assert.equal(session.getState().outcome.bestClip.tryNumber, 3);
});

test("no usable clip at all shows the kind message without uploading", async () => {
  const { session, uploads } = setup({
    overrides: { stopRecording: async () => null },
  });

  await session.start();

  assert.equal(uploads.length, 0);
  assert.equal(session.getState().outcome.kind, "rejected");
});

test("ok: false from the server is the kind message", async () => {
  const { session } = setup({
    overrides: {
      upload: async () => ({
        ok: false,
        error: "too_short_or_quiet",
        message: "",
        bestAttempt: null,
        attempts: [],
      }),
    },
  });

  await session.start();

  assert.equal(session.getState().phase, "result");
  assert.equal(session.getState().outcome.kind, "rejected");
});

test("resend re-uploads the same clips without recording again", async () => {
  let failures = 2;
  const sent = [];
  const { session, log } = setup({
    overrides: {
      upload: async (clips) => {
        sent.push(clips.map((clip) => clip.fileName));
        if (failures > 0) {
          failures -= 1;
          throw Object.assign(new Error("offline"), { status: 0 });
        }
        return success;
      },
    },
  });

  await session.start();
  assert.deepEqual(session.getState().outcome, {
    kind: "uploadFailed",
    status: 0,
    canResend: true,
  });

  const recordingsBefore = log.filter((entry) => entry.startsWith("record")).length;

  await session.resend();
  assert.equal(session.getState().outcome.kind, "uploadFailed");
  await session.resend();

  assert.equal(session.getState().outcome.kind, "success");
  assert.equal(
    log.filter((entry) => entry.startsWith("record")).length,
    recordingsBefore,
  );
  assert.deepEqual(sent[2], ["try1.webm", "try2.webm", "try3.webm"]);
});

test("server errors can be resent, but a 4xx can't", async () => {
  for (const [status, canResend] of [
    [500, true],
    [502, true],
    [400, false],
    [401, false],
    [413, false],
    [415, false],
  ]) {
    let uploads = 0;
    const { session } = setup({
      overrides: {
        upload: async () => {
          uploads += 1;
          throw Object.assign(new Error("http"), { status });
        },
      },
    });

    await session.start();
    assert.equal(session.getState().outcome.canResend, canResend, `${status}`);
    await session.resend();
    assert.equal(uploads, canResend ? 2 : 1, `${status}`);
  }
});

test("starting again after a result runs the whole flow again", async () => {
  const { session, phases } = setup();

  await session.start();
  phases.length = 0;
  await session.start();

  assert.equal(phases.filter((phase) => phase.startsWith("speak")).length, 3);
  assert.equal(session.getState().outcome.kind, "success");
});

test("a second tap while running is ignored", async () => {
  const mic = deferred();
  let micCalls = 0;
  const { session } = setup({
    overrides: {
      requestMic: () => {
        micCalls += 1;
        return mic.promise;
      },
    },
  });

  void session.start();
  void session.start();
  assert.equal(micCalls, 1);
  session.cancel();
});
