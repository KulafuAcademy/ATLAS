"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";

const REQUIRED_VOLUME = 0.15;
const MICROPHONE_TEST_DURATION = 3000;

const hardwareCopy = {
  en: {
    hardwareTest: "Hardware test",
    title: "Check your audio",
    description:
      "Make sure your speakers, headphones, and microphone are working before starting training.",

    allowStep: "Step 1: Allow microphone access",
    allowDescription:
      'Click the button below, then choose "Allow" when your browser asks. This lets us find your speakers and microphone.',
    allowMicrophone: "Allow microphone access",

    audioSection: "1 · Speakers",
    audioTitle: "Test your audio",
    audioDescription:
      "Select where you want to hear the test sound, set the volume, and press the button.",
    defaultAudioOutput: "Default audio output",
    audioOutput: (index: number) => `Audio output ${index + 1}`,
    volume: "Volume",
    playing: "Playing...",
    testAudio: "Test audio",
    playingSound: "Playing sound...",
    audioSuccess:
      "Did you hear the sound? If not, raise the volume or choose a different output.",
    audioAccessError: "Unable to access your audio devices.",
    audioTestError: "Unable to play the test sound.",

    microphoneSection: "2 · Microphone",
    microphoneTitle: "Test your microphone",
    microphoneDescription:
      "Select your microphone and speak when prompted. The test will automatically check your microphone for 3 seconds. You can adjust the input level while it runs.",
    defaultMicrophone: "Default microphone",
    microphone: (index: number) => `Microphone ${index + 1}`,
    inputLevel: "Input level",
    liveLevel: "Live level",
    recording: "Recording...",
    playingBack: "Playing back...",
    checkMicrophone: "Check microphone",
    playRecordingAgain: "Play recording again",

    microphoneAccessDenied:
      "Microphone access was denied. Allow it in your browser settings.",
    recordingMessage: "Recording... speak into your microphone.",
    microphoneWorking: "Microphone is working. Playing back your recording...",
    microphoneLow:
      "Microphone could not detect enough sound. Raise the input level or check your microphone. Playing back what was recorded...",
    playbackMessage:
      "Did you hear your voice? If not, raise the volume or the input level and try again.",
    playbackError: "Unable to play back the recording.",
    microphoneStartError:
      "Microphone access was denied or could not be started.",
    audioContextError: "AudioContext is not supported.",
  },

  ja: {
    hardwareTest: "ハードウェアテスト",
    title: "オーディオを確認",
    description:
      "トレーニングを始める前に、スピーカー、ヘッドホン、マイクが正常に動作することを確認してください。",

    allowStep: "ステップ1：マイクへのアクセスを許可",
    allowDescription:
      "下のボタンをクリックして、ブラウザに表示される「許可」を選択してください。これにより、スピーカーとマイクを確認できます。",
    allowMicrophone: "マイクへのアクセスを許可",

    audioSection: "1 · スピーカー",
    audioTitle: "オーディオをテスト",
    audioDescription:
      "テスト音を再生する出力先を選択し、音量を設定してボタンを押してください。",
    defaultAudioOutput: "デフォルトのオーディオ出力",
    audioOutput: (index: number) => `オーディオ出力 ${index + 1}`,
    volume: "音量",
    playing: "再生中...",
    testAudio: "オーディオをテスト",
    playingSound: "テスト音を再生中...",
    audioSuccess:
      "音は聞こえましたか？聞こえない場合は、音量を上げるか別の出力先を選択してください。",
    audioAccessError: "オーディオデバイスにアクセスできませんでした。",
    audioTestError: "テスト音を再生できませんでした。",

    microphoneSection: "2 · マイク",
    microphoneTitle: "マイクをテスト",
    microphoneDescription:
      "使用するマイクを選択し、指示されたら話してください。3秒間自動的にマイクを確認します。テスト中に入力レベルを調整できます。",
    defaultMicrophone: "デフォルトのマイク",
    microphone: (index: number) => `マイク ${index + 1}`,
    inputLevel: "入力レベル",
    liveLevel: "現在のレベル",
    recording: "録音中...",
    playingBack: "再生中...",
    checkMicrophone: "マイクを確認",
    playRecordingAgain: "録音をもう一度再生",

    microphoneAccessDenied:
      "マイクへのアクセスが拒否されました。ブラウザの設定でマイクへのアクセスを許可してください。",
    recordingMessage: "録音中... マイクに向かって話してください。",
    microphoneWorking:
      "マイクは正常に動作しています。録音した音声を再生します...",
    microphoneLow:
      "マイクで十分な音量を検出できませんでした。入力レベルを上げるか、マイクを確認してください。録音した音声を再生します...",
    playbackMessage:
      "自分の声は聞こえましたか？聞こえない場合は、音量または入力レベルを上げてもう一度試してください。",
    playbackError: "録音を再生できませんでした。",
    microphoneStartError:
      "マイクへのアクセスが拒否されたか、マイクを開始できませんでした。",
    audioContextError: "このブラウザではAudioContextに対応していません。",
  },
};

type HardwareCopy = typeof hardwareCopy.en;

export default function DesktopHardwareTest() {
  const { language } = useLanguage();
  const copy: HardwareCopy = hardwareCopy[language];

  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);

  const [outputId, setOutputId] = useState("");
  const [inputId, setInputId] = useState("");

  const [outputVolume, setOutputVolume] = useState(0.6);
  const [micGain, setMicGain] = useState(1);
  const [micLevel, setMicLevel] = useState(0);

  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");

  const [micTesting, setMicTesting] = useState(false);
  const [micMessage, setMicMessage] = useState("");

  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [playingBack, setPlayingBack] = useState(false);

  const playbackRef = useRef<HTMLAudioElement | null>(null);
  const recordingUrlRef = useRef<string | null>(null);

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

  useEffect(() => {
    return () => {
      playbackRef.current?.pause();

      if (recordingUrlRef.current) {
        URL.revokeObjectURL(recordingUrlRef.current);
      }
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

      setOutputId((current) => current || audioOutputs[0]?.deviceId || "");
      setInputId((current) => current || audioInputs[0]?.deviceId || "");
    } catch {
      setAudioMessage(copy.audioAccessError);
    }
  }

  async function allowMicrophoneAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setMicMessage(copy.microphoneAccessDenied);
      return;
    }

    await loadDevices();
  }

  async function playRecording(url: string) {
    playbackRef.current?.pause();

    const audio = new Audio(url);
    audio.volume = outputVolume;
    playbackRef.current = audio;

    if (outputId && "setSinkId" in audio) {
      try {
        await (
          audio as HTMLAudioElement & {
            setSinkId: (id: string) => Promise<void>;
          }
        ).setSinkId(outputId);
      } catch {
        // Fall back to browser default output.
      }
    }

    audio.onended = () => {
      setPlayingBack(false);
      setMicMessage(copy.playbackMessage);
    };

    audio.onerror = () => {
      setPlayingBack(false);
      setMicMessage(copy.playbackError);
    };

    setPlayingBack(true);
    setMicMessage(copy.playingBack);

    try {
      await audio.play();
    } catch {
      setPlayingBack(false);
      setMicMessage(copy.playbackError);
    }
  }

  async function playTestSound() {
    if (audioPlaying) {
      return;
    }

    setAudioPlaying(true);
    setAudioMessage(copy.playingSound);

    try {
      const audioContext = new AudioContext();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (outputId && "setSinkId" in audioContext) {
        try {
          await (
            audioContext as AudioContext & {
              setSinkId: (id: string) => Promise<void>;
            }
          ).setSinkId(outputId);
        } catch {
          // Fall back to browser default output.
        }
      }

      const peak = Math.max(0.0001, outputVolume * 0.8);

      const notes = [
        { frequency: 523.25, start: 0 },
        { frequency: 659.25, start: 0.5 },
        { frequency: 783.99, start: 1.0 },
        { frequency: 1046.5, start: 1.5 },
        { frequency: 783.99, start: 2.0 },
        { frequency: 659.25, start: 2.5 },
      ];

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
          setAudioMessage(copy.audioSuccess);
        },
        totalDuration * 1000 + 100,
      );
    } catch {
      setAudioPlaying(false);
      setAudioMessage(copy.audioTestError);
    }
  }

  async function checkMicrophone() {
    if (micTesting || playingBack) {
      return;
    }

    playbackRef.current?.pause();

    setMicTesting(true);
    setMicMessage(copy.recordingMessage);

    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;
    let animationFrame: number | null = null;
    let recordedUrl: string | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...(inputId ? { deviceId: { exact: inputId } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      const AudioContextConstructor =
        window.AudioContext ??
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextConstructor) {
        throw new Error(copy.audioContextError);
      }

      context = new AudioContextConstructor();

      if (context.state === "suspended") {
        await context.resume();
      }

      const source = context.createMediaStreamSource(stream);

      const gainNode = context.createGain();
      gainNode.gain.value = micGain;
      micGainNodeRef.current = gainNode;

      const analyser = context.createAnalyser();
      analyser.fftSize = 256;

      const destination = context.createMediaStreamDestination();

      source.connect(gainNode);
      gainNode.connect(analyser);
      gainNode.connect(destination);

      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      const recorder = new MediaRecorder(
        destination.stream,
        mimeType ? { mimeType } : undefined,
      );

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      const recorderStopped = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      recorder.start();

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

      recorder.stop();
      await recorderStopped;

      const blob = new Blob(chunks, {
        type: recorder.mimeType || mimeType || "audio/webm",
      });

      if (recordingUrlRef.current) {
        URL.revokeObjectURL(recordingUrlRef.current);
      }

      recordedUrl = URL.createObjectURL(blob);
      recordingUrlRef.current = recordedUrl;

      setRecordingUrl(recordedUrl);

      if (maxLevel >= REQUIRED_VOLUME) {
        setMicMessage(copy.microphoneWorking);
      } else {
        setMicMessage(copy.microphoneLow);
      }
    } catch {
      setMicMessage(copy.microphoneStartError);
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

    if (recordedUrl) {
      await playRecording(recordedUrl);
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 py-12 text-white">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-3 border-t border-white/10 pt-10">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            {copy.hardwareTest}
          </p>

          <h1 className="text-3xl font-semibold">{copy.title}</h1>

          <p className="leading-7 text-white/60">{copy.description}</p>

          {inputs.every((device) => !device.label) ? (
            <div className="space-y-3 border-2 border-white bg-white/[0.08] p-4">
              <p className="text-sm font-semibold text-white">
                {copy.allowStep}
              </p>

              <p className="text-sm leading-6 text-white/70">
                {copy.allowDescription}
              </p>

              <button
                type="button"
                onClick={() => void allowMicrophoneAccess()}
                className="h-14 w-full border-2 border-white bg-white px-4 text-base font-bold uppercase tracking-wide text-black shadow-[0_0_24px_rgba(255,255,255,0.5)] transition hover:bg-black hover:text-white"
              >
                {copy.allowMicrophone}
              </button>
            </div>
          ) : null}
        </div>

        {/* AUDIO */}
        <section className="space-y-5 border border-white/10 bg-white/[0.02] p-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">
              {copy.audioSection}
            </p>

            <h2 className="text-xl font-semibold">{copy.audioTitle}</h2>

            <p className="text-sm leading-6 text-white/50">
              {copy.audioDescription}
            </p>
          </div>

          <select
            value={outputId}
            onChange={(event) => setOutputId(event.target.value)}
            className="h-11 w-full border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-white"
          >
            {outputs.length === 0 ? (
              <option value="">{copy.defaultAudioOutput}</option>
            ) : (
              outputs.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || copy.audioOutput(index)}
                </option>
              ))
            )}
          </select>

          <Slider
            label={copy.volume}
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
            {audioPlaying ? copy.playing : copy.testAudio}
          </button>

          {audioMessage ? <Feedback text={audioMessage} /> : null}
        </section>

        {/* MICROPHONE */}
        <section className="space-y-5 border border-white/10 bg-white/[0.02] p-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">
              {copy.microphoneSection}
            </p>

            <h2 className="text-xl font-semibold">{copy.microphoneTitle}</h2>

            <p className="text-sm leading-6 text-white/50">
              {copy.microphoneDescription}
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
              <option value="">{copy.defaultMicrophone}</option>
            ) : (
              inputs.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || copy.microphone(index)}
                </option>
              ))
            )}
          </select>

          <Slider
            label={copy.inputLevel}
            value={micGain}
            min={0}
            max={3}
            step={0.05}
            onChange={setMicGain}
          />

          <LevelMeter
            level={micLevel}
            threshold={REQUIRED_VOLUME}
            label={copy.liveLevel}
          />

          <button
            type="button"
            onClick={() => void checkMicrophone()}
            disabled={micTesting || playingBack}
            className="h-11 w-full border border-white bg-white px-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {micTesting
              ? copy.recording
              : playingBack
                ? copy.playingBack
                : copy.checkMicrophone}
          </button>

          {recordingUrl && !micTesting && !playingBack ? (
            <button
              type="button"
              onClick={() => void playRecording(recordingUrl)}
              className="h-11 w-full border border-white/15 px-3 text-sm font-semibold text-white transition hover:border-white"
            >
              {copy.playRecordingAgain}
            </button>
          ) : null}

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
  label,
}: {
  level: number;
  threshold: number;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-white/60">{label}</p>

      <div className="relative h-2 w-full bg-white/10">
        <div
          className={`h-full transition-[width] duration-75 ${
            level >= threshold ? "bg-white" : "bg-white/40"
          }`}
          style={{
            width: `${Math.round(level * 100)}%`,
          }}
        />

        <div
          className="absolute top-[-3px] h-[14px] w-px bg-white/60"
          style={{
            left: `${threshold * 100}%`,
          }}
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
