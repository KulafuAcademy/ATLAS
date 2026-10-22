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
