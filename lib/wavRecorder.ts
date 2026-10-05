// Records the microphone as 16 kHz mono PCM WAV, the format Azure's
// short-audio speech endpoint accepts (MediaRecorder only produces WebM/Opus).

const targetSampleRate = 16000;

// Runs on the audio thread: batches 128-sample render quanta into ~85 ms
// chunks (at 48 kHz) and posts them to the page.
const captureWorkletSource = `
class AtlasCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(4096);
    this.length = 0;
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) {
      for (let index = 0; index < channel.length; index += 1) {
        this.buffer[this.length++] = channel[index];
        if (this.length === this.buffer.length) {
          this.port.postMessage(this.buffer);
          this.buffer = new Float32Array(4096);
          this.length = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor("atlas-capture", AtlasCapture);
`;

export type WavRecorder = {
  stop: () => Blob;
  cancel: () => void;
  sampleRate: number;
  deviceLabel: string;
};

// One audio context is reused across recordings: creating a context and
// loading the worklet on every press can delay capture by seconds, cutting
// off the start of what the learner says.
let sharedContext: AudioContext | null = null;
let workletReady: Promise<void> | null = null;

function getAudioContext() {
  if (!sharedContext || sharedContext.state === "closed") {
    const AudioContextConstructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextConstructor) throw new Error("audio_context_unsupported");

    sharedContext = new AudioContextConstructor();
    workletReady = null;
  }
  return sharedContext;
}

function loadCaptureWorklet(audioContext: AudioContext) {
  workletReady ??= (async () => {
    const moduleUrl = URL.createObjectURL(
      new Blob([captureWorkletSource], { type: "application/javascript" }),
    );
    try {
      await audioContext.audioWorklet.addModule(moduleUrl);
    } finally {
      URL.revokeObjectURL(moduleUrl);
    }
  })().catch((error: unknown) => {
    workletReady = null;
    throw error;
  });
  return workletReady;
}

export async function startWavRecorder(
  onChunk: (rms: number, seconds: number) => void,
): Promise<WavRecorder> {
  // Called from a click, so resuming here satisfies the autoplay policy.
  const audioContext = getAudioContext();
  const resumed = audioContext.resume();
  const [stream] = await Promise.all([
    navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    }),
    loadCaptureWorklet(audioContext),
    resumed,
  ]);

  const chunks: Float32Array[] = [];
  let stopped = false;
  let source: MediaStreamAudioSourceNode | null = null;
  let capture: AudioWorkletNode | null = null;

  function teardown() {
    stopped = true;
    if (capture) capture.port.onmessage = null;
    source?.disconnect();
    capture?.disconnect();
    stream.getTracks().forEach((track) => track.stop());
  }

  try {
    source = audioContext.createMediaStreamSource(stream);
    capture = new AudioWorkletNode(audioContext, "atlas-capture");
    capture.port.onmessage = (event: MessageEvent<Float32Array>) => {
      if (stopped) return;
      const samples = event.data;
      chunks.push(samples);

      let sumSquares = 0;
      for (const sample of samples) sumSquares += sample * sample;
      onChunk(Math.sqrt(sumSquares / samples.length), samples.length / audioContext.sampleRate);
    };

    source.connect(capture);
    // Keep the node in the rendering graph; it outputs silence.
    capture.connect(audioContext.destination);
  } catch (error) {
    teardown();
    throw error;
  }

  return {
    sampleRate: audioContext.sampleRate,
    deviceLabel: stream.getAudioTracks()[0]?.label ?? "",
    stop() {
      teardown();
      const recorded = concatenate(chunks);
      return encodeWav(
        downsample(recorded, audioContext.sampleRate, targetSampleRate),
        targetSampleRate,
      );
    },
    cancel: teardown,
  };
}

function concatenate(chunks: Float32Array[]) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const result = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

// Averages each output sample's source window, which also acts as a simple
// low-pass filter against aliasing.
function downsample(samples: Float32Array, fromRate: number, toRate: number) {
  if (fromRate === toRate) return samples;

  const ratio = fromRate / toRate;
  const result = new Float32Array(Math.floor(samples.length / ratio));
  for (let index = 0; index < result.length; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(samples.length, Math.floor((index + 1) * ratio));
    let sum = 0;
    for (let source = start; source < end; source += 1) sum += samples[source];
    result[index] = sum / Math.max(1, end - start);
  }
  return result;
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);

  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}
