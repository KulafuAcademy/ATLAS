import { useEffect, useRef } from "react";

import { speakWord } from "@/components/sounds/speak";

// Builds the public MP3 path for a word or tongue-twister audio file.
// Files are fetched under /public/(folder)/(soundFocus)/(filename).mp3
// Example: /public/words/R vs L/alive.mp3
export function getPublicAudioPath(
  folder: "words" | "twisters",
  soundFocus: string,
  filename: string,
) {
  return `/${folder}/${encodeURIComponent(soundFocus)}/${encodeURIComponent(filename)}.mp3`;
}

// Plays a recorded MP3, falling back to speech synthesis when the file is
// missing or fails to play. Only one clip plays at a time per component.
export function useRecordedAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  return function play(path: string | null, fallbackText: string, rate = 0.72) {
    audioRef.current?.pause();
    audioRef.current = null;

    if (!path) {
      speakWord(fallbackText, rate);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const audio = new Audio(path);
    let fellBack = false;

    // Skip the fallback when this clip was already replaced by a newer one.
    const fallbackToTts = () => {
      if (fellBack || audioRef.current !== audio) return;
      fellBack = true;
      audioRef.current = null;

      speakWord(fallbackText, rate);
    };

    audioRef.current = audio;
    audio.onended = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
    audio.onerror = fallbackToTts;
    audio.play().catch(fallbackToTts);
  };
}
