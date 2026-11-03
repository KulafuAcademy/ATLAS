import type { RecorderError } from "@/components/pronunciation/useVoiceRecorder";
import type { AnalyzeResponse, AnalyzeSuccess } from "@/lib/pronunciationApi";

// The fixed pace and visible gaps keep children from rushing. Tune them here,
// but don't skip a phase.
export const READY_MS = 3000;
/** A countdown tick plays at the start of each of these during READY_MS. */
export const READY_TICK_MS = 1000;
/** The longest a recording lasts. stopSpeaking() can end it sooner. */
export const SPEAK_MS = 10000;
/** The "all done" screen, after the recording has stopped. */
export const REST_MS = 1000;

export type SessionPhase =
  | "idle"
  | "ready"
  | "speak"
  | "rest"
  | "uploading"
  | "result";

export type SessionClip = {
  blob: Blob;
  /** recording.webm / recording.mp4, matching the blob type. */
  fileName: string;
};

export type SessionOutcome =
  | {
      kind: "success";
      response: AnalyzeSuccess;
      clip: SessionClip;
    }
  /** Nothing could be scored: the child should say it again. */
  | { kind: "rejected" }
  /** `canResend`: the clip is kept and uploading it again might work. */
  | { kind: "uploadFailed"; status: number; canResend: boolean };

export type SessionState = {
  phase: SessionPhase;
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
  startRecording: () => Promise<void>;
  /** Resolves on the recorder's stop event; null if nothing was captured. */
  stopRecording: () => Promise<SessionClip | null>;
  /** Stops a running recorder and throws its audio away. */
  discardRecording: () => void;
  upload: (clip: SessionClip, signal: AbortSignal) => Promise<AnalyzeResponse>;
  /** Resolves after `ms`, or as soon as `signal` aborts. */
  wait: (ms: number, signal: AbortSignal) => Promise<void>;
};

export const initialSessionState: SessionState = {
  phase: "idle",
  requestingMic: false,
  micError: null,
  outcome: null,
};

function errorStatus(error: unknown) {
  const status = (error as { status?: unknown } | null)?.status;

  return typeof status === "number" ? status : -1;
}

/**
 * The guided flow for one word:
 *   idle -> ready -> speak -> rest -> uploading -> result
 *
 * The child only sees "speak" once the go sound is over and the recorder is
 * running, and "rest" only after the recorder's stop event, so the clip never
 * contains the sound and is always complete.
 *
 * A run ends with cancel(), which leaves any awaiting step to notice that it
 * is stale and return without touching the next run.
 */
export class GuidedWordSession {
  private readonly effects: SessionEffects;
  private state = initialSessionState;
  private listeners = new Set<() => void>();
  private run: AbortController | null = null;
  private clip: SessionClip | null = null;
  private speakWait: AbortController | null = null;

  constructor(effects: SessionEffects) {
    this.effects = effects;
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
    this.clip = null;
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

    if (!(await this.runRecording(run))) return;

    this.effects.releaseMic();
    await this.upload(run);
  };

  /** Uploads the kept clip again, after an upload that can be resent. */
  resend = async () => {
    const { outcome } = this.state;

    if (this.run || outcome?.kind !== "uploadFailed" || !outcome.canResend) {
      return;
    }

    const run = new AbortController();
    this.run = run;
    await this.upload(run);
  };

  /** Ends the recording early and keeps the clip. */
  stopSpeaking = () => {
    if (this.state.phase === "speak") this.speakWait?.abort();
  };

  /** Stops everything, releases the mic and discards the clip. */
  cancel = () => {
    this.run?.abort();
    this.run = null;
    this.speakWait?.abort();
    this.clip = null;
    this.effects.discardRecording();
    this.effects.stopAudio();
    this.effects.releaseMic();
    this.setState(initialSessionState);
  };

  /** Resolves to false if the run was cancelled along the way. */
  private async runRecording(run: AbortController) {
    const { effects } = this;
    const isStale = () => this.run !== run;

    this.setState({ phase: "ready" });

    for (let left = READY_MS; left > 0; left -= READY_TICK_MS) {
      effects.playTick();
      await effects.wait(Math.min(left, READY_TICK_MS), run.signal);
      if (isStale()) return false;
    }

    await effects.playGoSound();
    if (isStale()) return false;

    const started = await effects.startRecording().then(
      () => true,
      () => false,
    );
    if (isStale()) return false;
    // Without a recording, the child would be asked to speak for nothing.
    if (!started) return true;

    this.speakWait = new AbortController();
    this.setState({ phase: "speak" });
    await effects.wait(SPEAK_MS, this.speakWait.signal);
    if (isStale()) return false;

    const clip = await effects.stopRecording();
    if (isStale()) return false;

    this.clip = clip;

    this.setState({ phase: "rest" });
    await effects.wait(REST_MS, run.signal);

    return !isStale();
  }

  private async upload(run: AbortController) {
    const { clip } = this;

    if (!clip) {
      this.finish({ kind: "rejected" });
      return;
    }

    this.setState({ phase: "uploading", outcome: null });

    try {
      const response = await this.effects.upload(clip, run.signal);
      if (this.run !== run) return;

      this.finish(
        response.ok
          ? { kind: "success", response, clip }
          : { kind: "rejected" },
      );
    } catch (error) {
      if (this.run !== run) return;

      const status = errorStatus(error);

      this.run = null;
      this.setState({
        phase: "result",
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
    this.clip = null;
    this.setState({ phase: "result", outcome });
  }

  private setState(next: Partial<SessionState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((listener) => listener());
  }
}
