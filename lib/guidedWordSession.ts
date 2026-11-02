import type { RecorderError } from "@/components/pronunciation/useVoiceRecorder";
import type {
  AnalyzeWordResponse,
  AnalyzeWordSuccess,
} from "@/lib/pronunciationApi";

// The fixed pace and visible gaps keep children from rushing. Tune them here,
// but don't skip a phase.
export const READY_MS = 3000;
/** A countdown tick plays at the start of each of these during READY_MS. */
export const READY_TICK_MS = 1000;
export const SPEAK_MS = 2500;
/** For words of LONG_WORD_LETTERS or more. */
export const SPEAK_LONG_MS = 3500;
export const REST_MS = 1000;

export const LONG_WORD_LETTERS = 9;
export const TRY_COUNT = 3;

export function speakMsFor(word: string) {
  const letters = word.match(/\p{L}/gu)?.length ?? 0;

  return letters >= LONG_WORD_LETTERS ? SPEAK_LONG_MS : SPEAK_MS;
}

export type SessionPhase =
  | "idle"
  | "ready"
  | "speak"
  | "rest"
  | "uploading"
  | "result";

export type SessionClip = {
  blob: Blob;
  /** try1.webm / try1.mp4, matching the blob type. */
  fileName: string;
  /** 1-3: which try this was, even if an earlier try produced no clip. */
  tryNumber: number;
};

export type SessionOutcome =
  | {
      kind: "success";
      response: AnalyzeWordSuccess;
      /** The clip of the server's `bestAttempt`. */
      bestClip: SessionClip | null;
    }
  /** Nothing could be scored: the child should say it again. */
  | { kind: "rejected" }
  /** `canResend`: the clips are kept and uploading them again might work. */
  | { kind: "uploadFailed"; status: number; canResend: boolean };

export type SessionState = {
  phase: SessionPhase;
  /** The try in progress, while in ready, speak or rest. */
  tryNumber: number | null;
  /** How many progress dots are marked done. */
  doneTries: number;
  /** Waiting for the microphone (the phase is still idle). */
  requestingMic: boolean;
  micError: RecorderError | null;
  outcome: SessionOutcome | null;
};

/** Everything that touches the browser or the network. */
export type SessionEffects = {
  /** Resolves to null once the mic is open, or to what went wrong. */
  requestMic: () => Promise<RecorderError | null>;
  releaseMic: () => void;
  /** Stops any model audio, so it can't end up in a recording. */
  stopAudio: () => void;
  /** One tick of the get-ready countdown. Doesn't wait for it to finish. */
  playTick: () => void;
  /** Resolves when the "speak now" sound has finished. */
  playGoSound: () => Promise<void>;
  /** Resolves once recording has really begun. Rejects if it can't. */
  startRecording: (tryNumber: number) => Promise<void>;
  /** Resolves on the recorder's stop event; null if nothing was captured. */
  stopRecording: () => Promise<SessionClip | null>;
  /** Stops a running recorder and throws its audio away. */
  discardRecording: () => void;
  upload: (
    clips: SessionClip[],
    signal: AbortSignal,
  ) => Promise<AnalyzeWordResponse>;
  /** Resolves after `ms`, or as soon as `signal` aborts. */
  wait: (ms: number, signal: AbortSignal) => Promise<void>;
};

export const initialSessionState: SessionState = {
  phase: "idle",
  tryNumber: null,
  doneTries: 0,
  requestingMic: false,
  micError: null,
  outcome: null,
};

function errorStatus(error: unknown) {
  const status = (error as { status?: unknown } | null)?.status;

  return typeof status === "number" ? status : -1;
}

/**
 * The "say it 3 times" flow:
 *   idle -> (ready -> speak -> rest) x3 -> uploading -> result
 *
 * The child only sees "speak" once the go sound is over and the recorder is
 * running, and "rest" only after the recorder's stop event, so a clip never
 * contains the sound and is always complete. A failed try doesn't break the
 * rhythm: it just produces no clip.
 *
 * A run ends with cancel(), which leaves any awaiting step to notice that it
 * is stale and return without touching the next run.
 */
export class GuidedWordSession {
  readonly speakMs: number;
  private readonly effects: SessionEffects;
  private state = initialSessionState;
  private listeners = new Set<() => void>();
  private run: AbortController | null = null;
  private clips: SessionClip[] = [];

  constructor(word: string, effects: SessionEffects) {
    this.effects = effects;
    this.speakMs = speakMsFor(word);
  }

  getState = () => this.state;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  /** True from start() until the result, while something can be cancelled. */
  get isRunning() {
    return this.run !== null;
  }

  /** Starts the whole flow. Call it from the child's tap. */
  start = async () => {
    if (this.run) return;

    const run = new AbortController();
    this.run = run;
    this.clips = [];
    this.effects.stopAudio();
    this.setState({ ...initialSessionState, requestingMic: true });

    const micError = await this.effects.requestMic();
    if (this.run !== run) return;

    if (micError) {
      this.run = null;
      this.effects.releaseMic();
      this.setState({ ...initialSessionState, micError });
      return;
    }

    this.setState({ requestingMic: false });

    for (let tryNumber = 1; tryNumber <= TRY_COUNT; tryNumber += 1) {
      if (!(await this.runTry(tryNumber, run))) return;
    }

    this.effects.releaseMic();
    await this.upload(run);
  };

  /** Uploads the kept clips again, after an upload that can be resent. */
  resend = async () => {
    const { outcome } = this.state;

    if (this.run || outcome?.kind !== "uploadFailed" || !outcome.canResend) {
      return;
    }

    const run = new AbortController();
    this.run = run;
    await this.upload(run);
  };

  /** Stops everything, releases the mic and discards the clips. */
  cancel = () => {
    this.run?.abort();
    this.run = null;
    this.clips = [];
    this.effects.discardRecording();
    this.effects.stopAudio();
    this.effects.releaseMic();
    this.setState(initialSessionState);
  };

  /** Resolves to false if the run was cancelled along the way. */
  private async runTry(tryNumber: number, run: AbortController) {
    const { effects } = this;
    const isStale = () => this.run !== run;

    this.setState({ phase: "ready", tryNumber });

    for (let left = READY_MS; left > 0; left -= READY_TICK_MS) {
      effects.playTick();
      await effects.wait(Math.min(left, READY_TICK_MS), run.signal);
      if (isStale()) return false;
    }

    await effects.playGoSound();
    if (isStale()) return false;

    const started = await effects.startRecording(tryNumber).then(
      () => true,
      () => false,
    );
    if (isStale()) return false;

    this.setState({ phase: "speak" });
    await effects.wait(this.speakMs, run.signal);
    if (isStale()) return false;

    const clip = started ? await effects.stopRecording() : null;
    if (isStale()) return false;

    if (clip) this.clips.push(clip);

    this.setState({ phase: "rest", doneTries: tryNumber });
    await effects.wait(REST_MS, run.signal);

    return !isStale();
  }

  private async upload(run: AbortController) {
    if (this.clips.length === 0) {
      this.finish({ kind: "rejected" });
      return;
    }

    this.setState({ phase: "uploading", tryNumber: null, outcome: null });

    try {
      const response = await this.effects.upload(this.clips, run.signal);
      if (this.run !== run) return;

      if (!response.ok) {
        this.finish({ kind: "rejected" });
        return;
      }

      this.finish({
        kind: "success",
        response,
        // The server numbers the clips it got, which can be fewer than 3.
        bestClip: this.clips[response.bestAttempt - 1] ?? null,
      });
    } catch (error) {
      if (this.run !== run) return;

      const status = errorStatus(error);

      this.run = null;
      this.setState({
        phase: "result",
        tryNumber: null,
        outcome: {
          kind: "uploadFailed",
          status,
          // Network and server errors can pass. A 4xx won't change on resend.
          canResend: status < 400 || status >= 500,
        },
      });
    }
  }

  private finish(outcome: SessionOutcome) {
    this.run = null;
    this.clips = [];
    this.setState({ phase: "result", tryNumber: null, outcome });
  }

  private setState(next: Partial<SessionState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((listener) => listener());
  }
}
