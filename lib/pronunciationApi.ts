/**
 * Client for the wav2vec2 pronunciation assessment server.
 * See docs/pronunciation-assessment.md for the full API contract.
 *
 * Requests go to this app's own /api/pronounce/* routes, which add the API
 * key and forward them to the real server (lib/pronunciationProxy.ts). The
 * server address and key stay on the server and never reach the browser.
 * A wrong or missing key on the server side still comes back as HTTP 401.
 */

const pronunciationApiUrl = "/api/pronounce";

/**
 * The server accepts 10 MB, but Vercel functions reject request bodies over
 * 4.5 MB, so cap below that. Recordings are at most 15 s, far smaller.
 */
export const maxAudioBytes = 4 * 1024 * 1024;

const healthTimeoutMs = 8000;

export type PronunciationGrade = {
  letter: "A" | "B" | "C" | "D";
  verdict: string;
  /** Hex colour for the overall score; use as-is. */
  color: string;
};

export type PhonemeTranscription = {
  /** IPA symbols, e.g. ["ɹ", "ɑ", "k"]. Join them to show IPA. */
  phonemes: string[];
  /** Kid-friendly spelling, e.g. "r-ah-k". */
  soundsLike: string;
  /** Not sent by the current server; derive IPA from `phonemes`. */
  ipa?: string;
};

export type PronunciationWord = {
  word: string;
  /** 0–100. */
  score: number;
  /** Expected IPA symbols for this word. */
  phonemes: string[];
  soundsLike: string;
  /** Not sent by the current server; derive IPA from `phonemes`. */
  ipa?: string;
  /**
   * What was heard for this word. Not sent by the current server (undefined);
   * null would mean the word wasn't heard at all.
   */
  heardIpa?: string | null;
  /**
   * Child-facing judgement from the word's sound-by-sound alignment. The
   * only thing that colours the word (see `wordStatusColor()`).
   */
  status?: WordStatus;
};

/**
 * - "great": every sound right, nothing extra.
 * - "practice": at least one sound wrong, missing or extra.
 * - "skipped": the word wasn't said at all.
 * - "ok": only sent by older servers.
 */
export type WordStatus = "great" | "ok" | "practice" | "skipped";

/** Something the learner did well, shown before anything to practise. */
export type PronunciationPraise = {
  word: string | null;
  message: string;
  messageJa: string;
};

/** One sound to practise, grouped across every word it happened in. */
export type PronunciationFocus = {
  /** The target sound, e.g. "r", "v", "ee". */
  sound: string | null;
  /** Distinct words it happened in. */
  words: string[];
  /** Indexes into `words[]` of every occurrence. */
  wordIndexes: number[];
  count: number;
  message: string;
  messageJa: string;
  tip: string;
  tipJa: string;
};

export type PronunciationIssue = {
  /** Matches one of the `words[].word` values. */
  word: string;
  message: string;
  tip: string | null;
};

export type AnalyzeSuccess = {
  ok: true;
  /** 0–100. */
  score: number;
  grade: PronunciationGrade;
  allWordsCorrect: boolean;
  expected: PhonemeTranscription;
  heard: PhonemeTranscription;
  words: PronunciationWord[];
  /** One entry per wrong sound. Not shown to children when `focus` is sent. */
  issues: PronunciationIssue[];
  /** Missing on older servers. */
  praise?: PronunciationPraise;
  /**
   * 0–2 sounds to practise (max 1 for grade A/B); empty means nothing to
   * fix. Missing on older servers, which fall back to `issues`.
   */
  focus?: PronunciationFocus[];
  /** Further practice items left out of `focus`. */
  moreCount?: number;
  /** AI coach feedback; null when the coach is offline. */
  feedback: string | null;
};

/** Returned with HTTP 200 when the audio couldn't be scored. */
export type AnalyzeRejected = {
  ok: false;
  error: "too_short_or_quiet" | (string & {});
  message: string;
};

export type AnalyzeResponse = AnalyzeSuccess | AnalyzeRejected;

/**
 * An HTTP error from the server (400, 401, 413, 415, ...), or `status: 0`
 * when the server couldn't be reached at all.
 */
export class PronunciationApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "PronunciationApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown> | null;
  } catch {
    // An HTML error page or an empty body.
    return null;
  }
}

/** GET /health. Resolves to false on any failure instead of throwing. */
export async function checkHealth(signal?: AbortSignal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), healthTimeoutMs);
  const abort = () => controller.abort();

  signal?.addEventListener("abort", abort);

  try {
    // This only checks the server is up, not that the key works.
    const response = await fetch(`${pronunciationApiUrl}/health`, {
      cache: "no-store",
      signal: controller.signal,
    });
    const body = await readJson(response);

    return response.ok && body?.ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abort);
  }
}

/**
 * POST /analyze. Sends the MediaRecorder blob as-is; the server decodes it
 * with ffmpeg. Throws PronunciationApiError for HTTP and network errors.
 */
export async function analyzePronunciation({
  audio,
  fileName,
  text,
  soundFocus,
  signal,
}: {
  audio: Blob;
  /** Extension must match the blob type: recording.webm / .mp4 / .ogg. */
  fileName: string;
  /** The word or sentence the learner was asked to say. */
  text: string;
  /** The sound being practiced, e.g. "R vs L". */
  soundFocus: string;
  signal?: AbortSignal;
}): Promise<AnalyzeResponse> {
  if (audio.size > maxAudioBytes) {
    throw new PronunciationApiError(413, "The recording is larger than 4 MB.");
  }

  const form = new FormData();
  form.append("audio", audio, fileName);
  form.append("text", text);
  form.append("soundFocus", soundFocus);

  let response: Response;
  try {
    // No Content-Type: the browser adds it with the multipart boundary.
    response = await fetch(`${pronunciationApiUrl}/analyze`, {
      method: "POST",
      body: form,
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new PronunciationApiError(0, "Could not reach the pronunciation server.");
  }

  // The proxy answers 503 when it can't reach the real server.
  if (response.status === 503) {
    throw new PronunciationApiError(0, "Could not reach the pronunciation server.");
  }

  const body = await readJson(response);

  if (!response.ok) {
    throw new PronunciationApiError(
      response.status,
      typeof body?.detail === "string" ? body.detail : response.statusText,
    );
  }

  if (!body || typeof body.ok !== "boolean") {
    throw new PronunciationApiError(502, "The server sent an unexpected response.");
  }

  return body as AnalyzeResponse;
}
