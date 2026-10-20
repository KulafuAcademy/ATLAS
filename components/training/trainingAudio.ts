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

const slowPlaybackRate = 0.75;
let practiceAudio: HTMLAudioElement | null = null;

export function stopPracticeAudio() {
  practiceAudio?.pause();
  practiceAudio = null;
  window.speechSynthesis?.cancel();
}

/**
 * Plays the recorded MP3 at `audioPath`, falling back to speech synthesis
 * when the file is missing. Resolves false if neither could play.
 */
export async function playPracticeAudio(
  text: string,
  audioPath: string,
  slow = false,
) {
  stopPracticeAudio();

  const audio = new Audio(audioPath);
  audio.playbackRate = slow ? slowPlaybackRate : 1;
  practiceAudio = audio;

  try {
    await audio.play();
    return true;
  } catch {
    if (practiceAudio === audio) {
      practiceAudio = null;
    }

    return speakWithSynthesis(text, slow);
  }
}

function speakWithSynthesis(text: string, slow: boolean) {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = slow ? 0.85 * slowPlaybackRate : 0.85;
  window.speechSynthesis.speak(utterance);

  return true;
}

export function playCorrectSound() {
  const audioContext = createAudioContext();

  if (!audioContext) {
    return;
  }

  playTone(audioContext, 660, 0, 0.12, "sine");
  playTone(audioContext, 880, 0.13, 0.16, "sine");
}

let countdownAudioContext: AudioContext | null = null;

// Shared context so the per-second ticks don't open a new one each time.
function getCountdownAudioContext() {
  if (!countdownAudioContext || countdownAudioContext.state === "closed") {
    countdownAudioContext = createAudioContext();
  }

  if (countdownAudioContext?.state === "suspended") {
    void countdownAudioContext.resume();
  }

  return countdownAudioContext;
}

// Short, soft tick for each "get ready" second.
export function playCountdownTick() {
  const audioContext = getCountdownAudioContext();

  if (audioContext) {
    playTone(audioContext, 660, 0, 0.09, "sine");
  }
}

// Higher, slightly longer beep when it's time to speak.
export function playCountdownGo() {
  const audioContext = getCountdownAudioContext();

  if (audioContext) {
    playTone(audioContext, 1320, 0, 0.2, "sine");
  }
}

export function playIncorrectSound() {
  const audioContext = createAudioContext();

  if (!audioContext) {
    return;
  }

  playTone(audioContext, 160, 0, 0.28, "sawtooth");
}

export function createAudioContext() {
  const AudioContextConstructor =
    window.AudioContext ?? window.webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  return new AudioContextConstructor();
}

function playTone(
  audioContext: AudioContext,
  frequency: number,
  startDelay: number,
  duration: number,
  type: OscillatorType,
) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const startsAt = audioContext.currentTime + startDelay;
  const endsAt = startsAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startsAt);
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.16, startsAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, endsAt);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startsAt);
  oscillator.stop(endsAt);
}
