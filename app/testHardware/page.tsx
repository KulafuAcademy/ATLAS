"use client";

import { useEffect, useRef, useState } from "react";

const REQUIRED_VOLUME = 0.15;
const MICROPHONE_TEST_DURATION = 3000;

export default function HardwareTestPage() {
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);

  const [outputId, setOutputId] = useState("");
  const [inputId, setInputId] = useState("");

  const [outputVolume, setOutputVolume] = useState(0.6); // 0 - 1
  const [micGain, setMicGain] = useState(1); // 0 - 3
  const [micLevel, setMicLevel] = useState(0); // 0 - 1 (live meter)

  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");

  const [micTesting, setMicTesting] = useState(false);
  const [micMessage, setMicMessage] = useState("");

  const micGainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    void loadDevices();

    const handleDeviceChange = () => void loadDevices();
    navigator.mediaDevices?.addEventListener(
      "devicechange",
      handleDeviceChange,
    );

    return () => {
      navigator.mediaDevices?.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, []);

  async function loadDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioOutputs = devices.filter(
        (device) => device.kind === "audiooutput",
      );
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput",
      );

      setOutputs(audioOutputs);
      setInputs(audioInputs);

      // Functional updates avoid stale values inside the event listener.
      setOutputId((current) => current || audioOutputs[0]?.deviceId || "");
      setInputId((current) => current || audioInputs[0]?.deviceId || "");
    } catch {
      setAudioMessage("Unable to access your audio devices.");
    }
  }

  async function allowMicrophoneAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setMicMessage(
        "Microphone access was denied. Allow it in your browser settings.",
      );
      return;
    }

    // Permission is granted now, so labels and all devices are available.
    await loadDevices();
  }

  async function playTestSound() {
    if (audioPlaying) {
      return;
    }

    setAudioPlaying(true);
    setAudioMessage("Playing sound...");

    try {
      const audioContext = new AudioContext();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // Route to selected output when supported.
      if (outputId && "setSinkId" in audioContext) {
        try {
          await (
            audioContext as AudioContext & {
              setSinkId: (id: string) => Promise<void>;
            }
          ).setSinkId(outputId);
        } catch {
          // Fall back to the browser's default output.
        }
      }

      // Peak loudness follows the volume slider.
      const peak = Math.max(0.0001, outputVolume * 0.8);

      // A gentle rising and falling melody (C5 E5 G5 C6 G5 E5).
      const notes = [
        { frequency: 523.25, start: 0 },
        { frequency: 659.25, start: 0.5 },
        { frequency: 783.99, start: 1.0 },
        { frequency: 1046.5, start: 1.5 },
        { frequency: 783.99, start: 2.0 },
        { frequency: 659.25, start: 2.5 },
      ];

      // Each note rings longer than the gap between notes,
      // so they blend together smoothly.
      const noteLength = 0.9;
      const now = audioContext.currentTime;

      notes.forEach(({ frequency, start }) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(peak, now + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          now + start + noteLength,
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(now + start);
        oscillator.stop(now + start + noteLength);
      });

      const totalDuration = notes[notes.length - 1].start + noteLength;

      window.setTimeout(
        () => {
          void audioContext.close();
          setAudioPlaying(false);
          setAudioMessage(
            "Did you hear the sound? If not, raise the volume or choose a different output.",
          );
        },
        totalDuration * 1000 + 100,
      );
    } catch {
      setAudioPlaying(false);
      setAudioMessage("Unable to play the test sound.");
    }
  }

  async function checkMicrophone() {
    if (micTesting) {
      return;
    }

    setMicTesting(true);
    setMicMessage("Speak into your microphone...");

    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;
    let animationFrame: number | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: inputId
          ? {
              deviceId: {
                exact: inputId,
              },
            }
          : true,
      });

      const AudioContextConstructor =
        window.AudioContext ??
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextConstructor) {
        throw new Error("AudioContext is not supported.");
      }

      context = new AudioContextConstructor();

      if (context.state === "suspended") {
        await context.resume();
      }

      const source = context.createMediaStreamSource(stream);

      // Input level control: source -> gain -> analyser
      const gainNode = context.createGain();
      gainNode.gain.value = micGain;
      micGainNodeRef.current = gainNode;

      const analyser = context.createAnalyser();
      analyser.fftSize = 256;

      source.connect(gainNode);
      gainNode.connect(analyser);

      const data = new Uint8Array(analyser.fftSize);

      let maxLevel = 0;

      const startedAt = performance.now();

      const measure = () => {
        if (!context) {
          return;
        }

        analyser.getByteTimeDomainData(data);

        let sum = 0;

        for (const sample of data) {
          const value = (sample - 128) / 128;
          sum += value * value;
        }

        const rms = Math.sqrt(sum / data.length);

        // Amplify the value slightly so normal microphone
        // input is easier to detect.
        const level = Math.min(1, rms * 3);

        maxLevel = Math.max(maxLevel, level);
        setMicLevel(level);

        if (performance.now() - startedAt < MICROPHONE_TEST_DURATION) {
          animationFrame = requestAnimationFrame(measure);
        }
      };

      animationFrame = requestAnimationFrame(measure);

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, MICROPHONE_TEST_DURATION);
      });

      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }

      if (maxLevel >= REQUIRED_VOLUME) {
        setMicMessage("Microphone is working correctly.");
      } else {
        setMicMessage(
          "Microphone could not detect enough sound. Raise the input level or check your microphone and try again.",
        );
      }
    } catch {
      setMicMessage("Microphone access was denied or could not be started.");
    } finally {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }

      stream?.getTracks().forEach((track) => {
        track.stop();
      });

      if (context) {
        void context.close();
      }

      micGainNodeRef.current = null;
      setMicLevel(0);
      setMicTesting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 py-12 text-white">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-3 border-t border-white/10 pt-10">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            Hardware test
          </p>

          <h1 className="text-3xl font-semibold">Check your audio</h1>

          <p className="leading-7 text-white/60">
            Make sure your speakers, headphones, and microphone are working
            before starting training.
          </p>
          {inputs.every((device) => !device.label) ? (
            <div className="space-y-3 border border-white/30 bg-white/[0.06] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="motion-safe:animate-bounce">👇</span>
                Start here: allow your microphone
              </p>

              <p className="text-sm leading-6 text-white/60">
                Your browser will ask for permission. Click "Allow" so we can
                find your speakers and microphone.
              </p>

              <div className="relative">
                {/* Pulsing ring behind the button */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 border-2 border-white motion-safe:animate-ping"
                />

                <button
                  type="button"
                  onClick={() => void allowMicrophoneAccess()}
                  className="relative h-12 w-full border border-white bg-white px-3 text-sm font-bold text-black shadow-[0_0_24px_rgba(255,255,255,0.45)] transition hover:bg-black hover:text-white motion-safe:animate-pulse"
                >
                  Allow microphone access
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* AUDIO */}
        <section className="space-y-5 border border-white/10 bg-white/[0.02] p-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">
              1 · Speakers
            </p>

            <h2 className="text-xl font-semibold">Test your audio</h2>

            <p className="text-sm leading-6 text-white/50">
              Select where you want to hear the test sound, set the volume, and
              press the button.
            </p>
          </div>

          <select
            value={outputId}
            onChange={(event) => setOutputId(event.target.value)}
            className="h-11 w-full border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-white"
          >
            {outputs.length === 0 ? (
              <option value="">Default audio output</option>
            ) : (
              outputs.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Audio output ${index + 1}`}
                </option>
              ))
            )}
          </select>

          <Slider
            label="Volume"
            value={outputVolume}
            min={0}
            max={1}
            step={0.01}
            onChange={setOutputVolume}
          />

          <button
            type="button"
            onClick={() => void playTestSound()}
            disabled={audioPlaying}
            className="h-11 w-full border border-white bg-white px-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {audioPlaying ? "Playing..." : "Test audio"}
          </button>

          {audioMessage ? <Feedback text={audioMessage} /> : null}
        </section>

        {/* MICROPHONE */}
        <section className="space-y-5 border border-white/10 bg-white/[0.02] p-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">
              2 · Microphone
            </p>

            <h2 className="text-xl font-semibold">Test your microphone</h2>

            <p className="text-sm leading-6 text-white/50">
              Select your microphone and speak when prompted. The test will
              automatically check your microphone for 3 seconds. You can adjust
              the input level while it runs.
            </p>
          </div>

          <select
            value={inputId}
            onChange={(event) => {
              setInputId(event.target.value);
              setMicMessage("");
            }}
            disabled={micTesting}
            className="h-11 w-full border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inputs.length === 0 ? (
              <option value="">Default microphone</option>
            ) : (
              inputs.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${index + 1}`}
                </option>
              ))
            )}
          </select>

          <Slider
            label="Input level"
            value={micGain}
            min={0}
            max={3}
            step={0.05}
            onChange={setMicGain}
          />

          <LevelMeter level={micLevel} threshold={REQUIRED_VOLUME} />

          <button
            type="button"
            onClick={() => void checkMicrophone()}
            disabled={micTesting}
            className="h-11 w-full border border-white bg-white px-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {micTesting ? "Checking microphone..." : "Check microphone"}
          </button>

          {micMessage ? <Feedback text={micMessage} /> : null}
        </section>
      </div>
    </main>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <label className="text-white/60">{label}</label>
        <span className="tabular-nums text-white/80">
          {Math.round(value * 100)}%
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="h-2 w-full cursor-pointer appearance-none bg-white/15 accent-white"
      />
    </div>
  );
}

function LevelMeter({
  level,
  threshold,
}: {
  level: number;
  threshold: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-white/60">Live level</p>

      <div className="relative h-2 w-full bg-white/10">
        <div
          className={`h-full transition-[width] duration-75 ${
            level >= threshold ? "bg-white" : "bg-white/40"
          }`}
          style={{ width: `${Math.round(level * 100)}%` }}
        />
        {/* Marker for the minimum level needed to pass */}
        <div
          className="absolute top-[-3px] h-[14px] w-px bg-white/60"
          style={{ left: `${threshold * 100}%` }}
        />
      </div>
    </div>
  );
}

function Feedback({ text }: { text: string }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/70"
    >
      {text}
    </p>
  );
}
