import timings from "../data/sentenceTimings.json";

export type WordTiming = { word: string; start: number; end: number };

// Word timings in seconds for each clip in /public/sentences, keyed by getSentenceFilename.
// They only match the current MP3s, so update them whenever a sentence clip changes.
export const sentenceTimings: Record<string, WordTiming[]> = timings;

// Odd indexes are words, even indexes are the spaces and punctuation between them.
export function splitSentence(sentence: string) {
  return sentence.split(/([A-Za-z']+)/);
}

// Each word stays active until the next one starts, so nothing flickers between words.
// Returns -1 in the silence before the first word and after the last one.
export function getActiveWordIndex(words: WordTiming[], time: number) {
  if (words.length === 0 || time >= words[words.length - 1].end) return -1;

  return words.findLastIndex((word) => time >= word.start);
}
