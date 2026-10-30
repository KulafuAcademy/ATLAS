import { useEffect, useRef, useState } from "react";

import { speakWord } from "@/components/sounds/speak";

// Builds the public MP3 path for a word, tongue-twister or sentence audio file.
// Files are fetched under /public/(folder)/(soundFocus)/(filename).mp3
// Example: /public/words/R vs L/alive.mp3
export function getPublicAudioPath(
  folder: "words" | "twisters" | "sentences",
  soundFocus: string,
  filename: string,
) {
  return `/${folder}/${encodeURIComponent(soundFocus)}/${encodeURIComponent(filename)}.mp3`;
}

// Builds the public MP3 path for a sound page example word.
// Files are fetched under /public/sound-examples/(vowel|consonant)/(word).mp3
// Example: /public/sound-examples/vowel/see.mp3
export function getSoundAudioPath(category: "vowel" | "consonant", word: string) {
  return `/sound-examples/${category}/${encodeURIComponent(word)}.mp3`;
}

// Turns a sentence into its audio file name.
// Example: "Sit on the ship's seat." -> "sit-on-the-ships-seat"
export function getSentenceFilename(sentence: string) {
  return sentence
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Plays a recorded MP3, falling back to speech synthesis when the file is
// missing or fails to play. Only one clip plays at a time per component.
// onEnd runs once, when the clip or its spoken fallback finishes.
export function useRecordedAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  return function play(
    path: string | null,
    fallbackText: string,
    rate = 0.72,
    onEnd?: () => void,
  ) {
    audioRef.current?.pause();
    audioRef.current = null;

    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      onEnd?.();
    };

    if (!path) {
      speakWord(fallbackText, rate, finish);
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

      speakWord(fallbackText, rate, finish);
    };

    audioRef.current = audio;
    audio.onended = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
      finish();
    };
    audio.onerror = fallbackToTts;
    audio.play().catch(fallbackToTts);
  };
}

// Some browsers never report the end of speech, so unlock after this long.
const maxPlaybackMs = 10000;

// Plays one clip at a time and ignores other clicks until it finishes.
// activeId names the clip that's playing, so its button can show it.
export function useExclusiveAudio() {
  const play = useRecordedAudio();
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  function playExclusive(
    id: string,
    path: string | null,
    fallbackText: string,
    rate?: number,
  ) {
    if (activeRef.current) return;

    const release = () => {
      if (activeRef.current !== id) return;
      activeRef.current = null;
      setActiveId(null);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    activeRef.current = id;
    setActiveId(id);
    timeoutRef.current = window.setTimeout(release, maxPlaybackMs);
    play(path, fallbackText, rate, release);
  }

  return { activeId, play: playExclusive };
}
