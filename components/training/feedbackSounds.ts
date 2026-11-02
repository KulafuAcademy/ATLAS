// Short synthesized tones for answer feedback, built with the Web Audio API
// so no audio files are needed.

export function playCorrectSound() {
  const audioContext = createAudioContext();

  if (!audioContext) {
    return;
  }

  playTone(audioContext, 660, 0, 0.12, "sine");
  playTone(audioContext, 880, 0.13, 0.16, "sine");
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

export function playTone(
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

// Call from a tap, so iOS Safari lets the context play sounds later on.
export function unlockCountdownAudio() {
  getCountdownAudioContext();
}

const goSeconds = 0.2;
// Audio is still leaving the speakers for a moment after the oscillator ends.
const goTailMs = 40;
const goResumeTimeoutMs = 100;

// playCountdownGo, for when recording starts right after it. Resolves when it's
// over, and straight away if the audio can't play, so the flow never waits on
// a silent sound.
export async function playCountdownGoAndWait() {
  const audioContext = getCountdownAudioContext();
  if (!audioContext) return;

  const isRunning = () => audioContext.state === "running";

  if (!isRunning()) {
    await Promise.race([
      audioContext.resume().catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, goResumeTimeoutMs)),
    ]);
    if (!isRunning()) return;
  }

  playCountdownGo();
  await new Promise((resolve) =>
    setTimeout(resolve, goSeconds * 1000 + goTailMs),
  );
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
    playTone(audioContext, 1320, 0, goSeconds, "sine");
  }
}
