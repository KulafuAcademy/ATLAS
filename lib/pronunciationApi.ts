/**
 * Client for the wav2vec2 pronunciation assessment server.
 * See docs/pronunciation-assessment.md for the full API contract.
 *
 * Every request sends `ngrok-skip-browser-warning`: the server runs behind a
 * free ngrok tunnel, which otherwise answers with an HTML warning page
 * instead of JSON.
 */

export const pronunciationApiUrl = (
  process.env.NEXT_PUBLIC_PRONUNCIATION_API_URL ||
  "https://oil-sterility-cyclic.ngrok-free.dev"
).replace(/\/+$/, "");

// Optional. Only needed if the server is configured to require a key.
// NEXT_PUBLIC_ values are visible in the browser bundle.
const pronunciationApiKey = process.env.NEXT_PUBLIC_PRONUNCIATION_API_KEY;

/** The server rejects uploads larger than this with HTTP 413. */
export const maxAudioBytes = 10 * 1024 * 1024;

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
   * Child-facing judgement; "practice" only for words named in `focus`.
   * Missing on older servers (see `wordStatus()`).
   */
  status?: WordStatus;
};

export type WordStatus = "great" | "ok" | "practice";

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

function requestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
  };

  if (pronunciationApiKey) {
    headers["X-API-Key"] = pronunciationApiKey;
  }

  return headers;
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown> | null;
  } catch {
    // ngrok's HTML warning page, or an empty body.
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
    const response = await fetch(`${pronunciationApiUrl}/health`, {
      headers: requestHeaders(),
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
  signal,
}: {
  audio: Blob;
  /** Extension must match the blob type: recording.webm / .mp4 / .ogg. */
  fileName: string;
  /** The word or sentence the learner was asked to say. */
  text: string;
  signal?: AbortSignal;
}): Promise<AnalyzeResponse> {
  if (audio.size > maxAudioBytes) {
    throw new PronunciationApiError(413, "The recording is larger than 10 MB.");
  }

  const form = new FormData();
  form.append("audio", audio, fileName);
  form.append("text", text);

  let response: Response;

  try {
    // No Content-Type: the browser adds it with the multipart boundary.
    response = await fetch(`${pronunciationApiUrl}/analyze`, {
      method: "POST",
      headers: requestHeaders(),
      body: form,
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
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
