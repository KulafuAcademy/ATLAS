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
