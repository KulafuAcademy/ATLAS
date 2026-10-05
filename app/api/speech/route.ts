import { AZURE_SPEECH_VOICES } from "@/lib/speechVoices";

export const runtime = "nodejs";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export async function POST(request: Request) {
  let body: { text?: unknown; voice?: unknown; rate?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const voice = body.voice;
  if (!text || text.length > 1500) {
    return Response.json(
      { error: "Text must contain between 1 and 1500 characters." },
      { status: 400 },
    );
  }

  if (
    typeof voice !== "string" ||
    !AZURE_SPEECH_VOICES.some((item) => item.id === voice)
  ) {
    return Response.json({ error: "Unsupported Azure Speech voice." }, { status: 400 });
  }

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

  // Slow mode lets learners hear each sound of a minimal pair clearly.
  const spokenText =
    body.rate === "slow"
      ? `<prosody rate="-40%">${escapeXml(text)}</prosody>`
      : escapeXml(text);
  const ssml =
    `<speak version="1.0" xml:lang="en-US"><voice name="${voice}">` +
    `${spokenText}</voice></speak>`;

  try {
    const azureResponse = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "ATLAS-RvSL",
        },
        body: ssml,
        cache: "no-store",
      },
    );

    if (!azureResponse.ok) {
      const message =
        azureResponse.status === 401 || azureResponse.status === 403
          ? "Azure rejected the credentials. Check the Speech key and region."
          : azureResponse.status === 429
            ? "Azure Speech quota or rate limit was reached."
            : `Azure Speech returned an error (${azureResponse.status}).`;
      return Response.json({ error: message }, { status: azureResponse.status });
    }

    return new Response(await azureResponse.arrayBuffer(), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Could not connect to Azure Speech." },
      { status: 502 },
    );
  }
}
