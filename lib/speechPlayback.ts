export function stopSpeechPlayback() {
  if (typeof window !== "undefined") {
    window.speechSynthesis?.cancel();
  }
}

export function playBrowserSpeech(
  text: string,
  voiceURI = "",
  rate: "normal" | "slow" = "normal",
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.reject(new Error("Speech playback is not supported in this browser."));
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate === "slow" ? 0.4 : 0.85;
  utterance.pitch = 1;

  if (voiceURI) {
    utterance.voice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.voiceURI === voiceURI) ?? null;
  }

  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") resolve();
      else reject(new Error("Browser speech playback failed."));
    };
    window.speechSynthesis.speak(utterance);
  });
}
