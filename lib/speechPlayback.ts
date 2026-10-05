import type { AzureSpeechVoiceId } from "@/lib/speechVoices";

let playbackId = 0;
let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;

export function stopSpeechPlayback() {
  playbackId += 1;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.removeAttribute("src");
    activeAudio.load();
    activeAudio = null;
  }

  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}

export async function playAzureSpeech(
  text: string,
  voice: AzureSpeechVoiceId,
  rate: "normal" | "slow" = "normal",
): Promise<void> {
  stopSpeechPlayback();
  const requestId = playbackId;

  const response = await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, rate }),
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(result?.error || "Azure Speech playback failed.");
  }

  const audioBlob = await response.blob();
  if (requestId !== playbackId) return;

  const objectUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(objectUrl);
  activeObjectUrl = objectUrl;
  activeAudio = audio;

  const cleanUp = () => {
    if (activeAudio !== audio) return;
    activeAudio = null;
    if (activeObjectUrl === objectUrl) {
      URL.revokeObjectURL(objectUrl);
      activeObjectUrl = null;
    }
  };

  audio.addEventListener("ended", cleanUp, { once: true });
  audio.addEventListener("error", cleanUp, { once: true });

  try {
    await audio.play();
  } catch (error) {
    cleanUp();
    throw error;
  }
}
