export const AZURE_SPEECH_VOICES = [
  { id: "en-US-JennyNeural", name: "Jenny", gender: "Female" },
  { id: "en-US-GuyNeural", name: "Guy", gender: "Male" },
  { id: "en-US-DavisNeural", name: "Davis", gender: "Male" },
  { id: "en-US-TonyNeural", name: "Tony", gender: "Male" },
  { id: "en-US-AriaNeural", name: "Aria", gender: "Female" },
  { id: "en-US-SaraNeural", name: "Sara", gender: "Female" },
  { id: "en-US-JasonNeural", name: "Jason", gender: "Male" },
  { id: "en-US-AndrewNeural", name: "Andrew", gender: "Male" },
  { id: "en-US-EmmaNeural", name: "Emma", gender: "Female" },
  { id: "en-US-BrianNeural", name: "Brian", gender: "Male" },
] as const;

export type AzureSpeechVoiceId = (typeof AZURE_SPEECH_VOICES)[number]["id"];

export const DEFAULT_AZURE_SPEECH_VOICE: AzureSpeechVoiceId =
  "en-US-JennyNeural";

const VOICE_STORAGE_KEY = "atlas:rvsl-azure-speech-voice";

export function getSavedAzureSpeechVoice(): AzureSpeechVoiceId {
  if (typeof window === "undefined") return DEFAULT_AZURE_SPEECH_VOICE;

  const savedVoice = window.localStorage.getItem(VOICE_STORAGE_KEY);
  return AZURE_SPEECH_VOICES.some((voice) => voice.id === savedVoice)
    ? (savedVoice as AzureSpeechVoiceId)
    : DEFAULT_AZURE_SPEECH_VOICE;
}

export function saveAzureSpeechVoice(voice: AzureSpeechVoiceId) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(VOICE_STORAGE_KEY, voice);
  }
}
