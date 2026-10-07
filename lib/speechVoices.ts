const VOICE_STORAGE_KEY = "atlas:rvsl-browser-speech-voice";

export function getBrowserSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices();
}

export function getSavedBrowserSpeechVoice(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(VOICE_STORAGE_KEY) ?? "";
}

export function saveBrowserSpeechVoice(voiceURI: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(VOICE_STORAGE_KEY, voiceURI);
  }
}
