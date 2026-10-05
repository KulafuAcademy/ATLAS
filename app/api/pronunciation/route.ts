export const runtime = "nodejs";

// 16 kHz 16-bit mono WAV is 32 KB per second; Azure assesses up to 30 seconds.
const MAX_AUDIO_BYTES = 1_000_000;
const MAX_REFERENCE_LENGTH = 200;

type AzurePhoneme = {
  Phoneme?: string;
  AccuracyScore?: number;
  PronunciationAssessment?: { AccuracyScore?: number };
};

type AzureWord = {
  Word?: string;
  AccuracyScore?: number;
  ErrorType?: string;
  PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
  Phonemes?: AzurePhoneme[];
};

type AzureNBest = {
  Display?: string;
  AccuracyScore?: number;
  FluencyScore?: number;
  CompletenessScore?: number;
  PronScore?: number;
  PronunciationAssessment?: {
    AccuracyScore?: number;
    FluencyScore?: number;
    CompletenessScore?: number;
    PronScore?: number;
  };
  Words?: AzureWord[];
};

type AzureRecognitionResult = {
  RecognitionStatus?: string;
  DisplayText?: string;
  NBest?: AzureNBest[];
};

function describeError(error: unknown) {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause instanceof Error ? `: ${error.cause.message}` : "";
  return `${error.name}: ${error.message}${cause}`;
}

export async function POST(request: Request) {
  const key = process.env.AZURE_SPEECH_KEY?.trim();
  const region = process.env.AZURE_SPEECH_REGION?.trim().toLowerCase();
  if (!key || !region) {
    return Response.json(
      { error: "Azure Speech is not configured on the server." },
      { status: 503 },
    );
  }
  if (!/^[a-z0-9]+$/.test(region)) {
    return Response.json(
      { error: "Azure Speech region configuration is invalid." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid recording upload." }, { status: 400 });
  }

  const audio = formData.get("audio");
  const referenceText = String(formData.get("referenceText") ?? "").trim();
  if (!(audio instanceof File) || audio.size === 0) {
    return Response.json({ error: "No recording was received." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "The recording is too long." }, { status: 413 });
  }
  if (!referenceText || referenceText.length > MAX_REFERENCE_LENGTH) {
    return Response.json({ error: "Invalid target text." }, { status: 400 });
  }

  const assessmentConfig = Buffer.from(
    JSON.stringify({
      ReferenceText: referenceText,
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: "True",
      PhonemeAlphabet: "IPA",
    }),
  ).toString("base64");

  let azureResponse: Response;
  try {
    azureResponse = await fetch(
      `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
          Accept: "application/json",
          "Pronunciation-Assessment": assessmentConfig,
        },
        body: await audio.arrayBuffer(),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      },
    );
  } catch (error) {
    console.error("[api/pronunciation] Azure request failed", error);
    return Response.json(
      {
        error: "Could not connect to Azure Speech.",
        ...(process.env.NODE_ENV !== "production" && { detail: describeError(error) }),
      },
      { status: 502 },
    );
  }

  if (!azureResponse.ok) {
    const message =
      azureResponse.status === 401 || azureResponse.status === 403
        ? "Azure rejected the credentials. Check the Speech key and region."
        : azureResponse.status === 429
          ? "Azure Speech quota or rate limit was reached."
          : `Azure Speech returned an error (${azureResponse.status}).`;
    return Response.json({ error: message }, { status: 502 });
  }

  const result = (await azureResponse.json()) as AzureRecognitionResult;
  const best = result.NBest?.[0];
  const overall = best?.PronunciationAssessment ?? best;

  return Response.json({
    status: result.RecognitionStatus ?? "Error",
    recognizedText: best?.Display ?? result.DisplayText ?? "",
    accuracy: overall?.AccuracyScore ?? null,
    fluency: overall?.FluencyScore ?? null,
    completeness: overall?.CompletenessScore ?? null,
    pronunciation: overall?.PronScore ?? null,
    words: (best?.Words ?? []).map((word) => ({
      word: word.Word ?? "",
      accuracy:
        word.PronunciationAssessment?.AccuracyScore ?? word.AccuracyScore ?? null,
      errorType:
        word.PronunciationAssessment?.ErrorType ?? word.ErrorType ?? "None",
      phonemes: (word.Phonemes ?? []).map((phoneme) => ({
        phoneme: phoneme.Phoneme ?? "",
        accuracy:
          phoneme.PronunciationAssessment?.AccuracyScore ??
          phoneme.AccuracyScore ??
          null,
      })),
    })),
  });
}
