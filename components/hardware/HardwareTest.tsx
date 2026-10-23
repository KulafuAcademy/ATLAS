"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { LevelMeter } from "@/components/pronunciation/LevelMeter";
import { createAudioContext } from "@/components/training/feedbackSounds";

/** How long the microphone test records before playing it back. */
const testRecordingSeconds = 5;

/** Mic input gain goes up to this multiple, so quiet microphones can be boosted. */
const maxInputGain = 2;

const speakerTestSrc = `/twisters/${encodeURIComponent("R vs L")}/arrive-alive.mp3`;

const mimeTypeCandidates = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];

type MicError = "insecure" | "unsupported" | "denied" | "noMicrophone" | "failed";

type MicStatus = "idle" | "starting" | "recording" | "playing" | "done";

// Chrome/Edge can route an <audio> element to a chosen output; Firefox and Safari mostly can't.
type SinkAudioElement = HTMLAudioElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

const primaryButtonClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 border border-white bg-white px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none focus-visible:bg-black focus-visible:text-white disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-white/35";

const secondaryButtonClass =
  "inline-flex h-11 shrink-0 items-center justify-center border border-white/20 px-5 text-sm font-semibold text-white/70 transition hover:border-white hover:text-white focus:outline-none focus-visible:border-white disabled:cursor-not-allowed disabled:opacity-40";

const sliderClass = "h-1 w-full cursor-pointer accent-white";

const selectClass =
  "h-11 w-full border border-white/20 bg-black px-3 text-sm text-white transition hover:border-white/45 focus:border-white focus:outline-none";

function pickMimeType() {
  if (typeof MediaRecorder.isTypeSupported !== "function") return undefined;
  return mimeTypeCandidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function toMicError(error: unknown): MicError {
  const name = error instanceof DOMException ? error.name : "";

  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "noMicrophone";
  return "failed";
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function supportsOutputSelection() {
  return (
    typeof HTMLMediaElement !== "undefined" &&
    "setSinkId" in HTMLMediaElement.prototype
  );
}

const desktopQuery = "(hover: hover) and (pointer: fine)";

function subscribeToDesktopQuery(onChange: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Device pickers only make sense on a PC: a mouse pointer and a real device list. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToDesktopQuery,
    () => window.matchMedia(desktopQuery).matches,
    () => false,
  );
}

const subscribeToNothing = () => () => {};

function useAudioDevices() {
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);

  function refresh() {
    if (!navigator.mediaDevices?.enumerateDevices) return Promise.resolve();

    return navigator.mediaDevices.enumerateDevices().then(
      (devices) => {
        setInputs(devices.filter((device) => device.kind === "audioinput"));
        setOutputs(devices.filter((device) => device.kind === "audiooutput"));
      },
      () => {
        // Leave the lists empty; the default devices still work.
      },
    );
  }

  useEffect(() => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices) return;

    void refresh();
    mediaDevices.addEventListener("devicechange", refresh);
    return () => mediaDevices.removeEventListener("devicechange", refresh);
  }, []);

  return {
    inputs,
    outputs,
    /** Browsers hide device names until the mic has been allowed once. */
    hasLabels: inputs.some((device) => device.label),
    refresh,
  };
}

export function HardwareTest() {
  const { text } = useLanguage();
  const isDesktop = useIsDesktop();
  const devices = useAudioDevices();
  const canPickOutput = useSyncExternalStore(
    subscribeToNothing,
    supportsOutputSelection,
    () => false,
  );
  const [inputId, setInputId] = useState("");
  const [outputId, setOutputId] = useState("");
  const [outputVolume, setOutputVolume] = useState(1);
  const [inputGain, setInputGain] = useState(1);

  // Fall back to the default device if the chosen one is unplugged.
  const activeInputId = devices.inputs.some((device) => device.deviceId === inputId)
    ? inputId
    : "";
  const activeOutputId = devices.outputs.some((device) => device.deviceId === outputId)
    ? outputId
    : "";

  async function revealDeviceNames() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stopTracks(stream);
    } catch {
      // The mic section reports permission problems when it is used.
    }
    await devices.refresh();
  }

  // Device pickers only show on a PC; each test card gets its own.
  const outputPicker = isDesktop ? (
    <DevicePicker
      label={text({ en: "Speaker / headphones", ja: "スピーカー / ヘッドホン" })}
      value={activeOutputId}
      onChange={setOutputId}
      devices={devices.outputs}
      fallbackName={text({ en: "Speaker", ja: "スピーカー" })}
      disabled={!canPickOutput}
      note={
        canPickOutput
          ? undefined
          : text({
              en: "This browser always uses the system output. Change it in your computer's sound settings, or use Chrome or Edge.",
              ja: "このブラウザはシステムの出力先を使います。パソコンのサウンド設定で変更するか、Chrome または Edge をお使いください。",
            })
      }
    />
  ) : null;

  const inputPicker = isDesktop ? (
    <DevicePicker
      label={text({ en: "Microphone", ja: "マイク" })}
      value={activeInputId}
      onChange={setInputId}
      devices={devices.inputs}
      fallbackName={text({ en: "Microphone", ja: "マイク" })}
    />
  ) : null;

  return (
    <div className="space-y-6">
      {isDesktop && !devices.hasLabels ? (
        <div className="flex flex-col gap-3 border border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-white/55">
            {text({
              en: "Allow the microphone to see the names of your devices.",
              ja: "マイクを許可すると、機器の名前が表示されます。",
            })}
          </p>
          <button type="button" onClick={revealDeviceNames} className={secondaryButtonClass}>
            {text({ en: "Show device names", ja: "機器名を表示" })}
          </button>
        </div>
      ) : null}

      <SpeakerTest
        outputId={activeOutputId}
        volume={outputVolume}
        onVolumeChange={setOutputVolume}
        devicePicker={outputPicker}
      />
      <MicrophoneTest
        inputId={activeInputId}
        outputId={activeOutputId}
        outputVolume={outputVolume}
        inputGain={inputGain}
        onInputGainChange={setInputGain}
        onPermissionGranted={devices.refresh}
        devicePicker={inputPicker}
      />
    </div>
  );
}

function DevicePicker({
  label,
  value,
  onChange,
  devices,
  fallbackName,
  disabled = false,
  note,
}: {
  label: string;
  value: string;
  onChange: (deviceId: string) => void;
  devices: MediaDeviceInfo[];
  fallbackName: string;
  disabled?: boolean;
  note?: string;
}) {
  const { text } = useLanguage();
  // "default" is Chrome's alias for the system device; it is already the first option.
  const choices = devices.filter(
    (device) => device.deviceId && device.deviceId !== "default",
  );

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-white/75">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <option value="">{text({ en: "System default", ja: "システムの既定" })}</option>
        {choices.map((device, index) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `${fallbackName} ${index + 1}`}
          </option>
        ))}
      </select>
      {note ? <span className="block text-xs leading-5 text-white/40">{note}</span> : null}
    </label>
  );
}

function LevelSlider({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  /** 1 = 100%. */
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-3">
      <span className="flex items-center justify-between text-sm">
        <span className="font-medium text-white/75">{label}</span>
        <span className="font-mono text-white/55">{Math.round(value * 100)}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        step={0.05}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={sliderClass}
      />
    </label>
  );
}

async function routeToOutput(audio: SinkAudioElement, outputId: string) {
  if (!audio.setSinkId) return;

  try {
    await audio.setSinkId(outputId);
  } catch {
    // Keep playing on the default output.
  }
}

function SpeakerTest({
  outputId,
  volume,
  onVolumeChange,
  devicePicker,
}: {
  outputId: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  devicePicker: ReactNode;
}) {
  const { text } = useLanguage();
  const audioRef = useRef<SinkAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  // Moving the slider changes a sound that is already playing.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  async function play() {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    audioRef.current?.pause();
    const audio: SinkAudioElement = new Audio(speakerTestSrc);
    audio.volume = volume;
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.onerror = () => {
      setPlaying(false);
      setFailed(true);
    };

    setFailed(false);
    setPlaying(true);
    await routeToOutput(audio, outputId);

    try {
      await audio.play();
    } catch {
      setPlaying(false);
      setFailed(true);
    }
  }

  return (
    <section className="flex flex-col gap-5 border border-white/10 bg-white/[0.02] p-5 sm:p-7">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          {text({ en: "Step 1", ja: "ステップ 1" })}
        </p>
        <h2 className="text-xl font-semibold text-white">
          {text({ en: "Speaker test", ja: "スピーカーテスト" })}
        </h2>
        <p className="text-sm leading-6 text-white/55">
          {text({
            en: "Press play. You should hear a short English sentence clearly.",
            ja: "再生を押すと、短い英語の文が聞こえるはずです。",
          })}
        </p>
      </div>

      {devicePicker}

      <LevelSlider
        label={text({ en: "Output volume", ja: "出力音量" })}
        value={volume}
        max={1}
        onChange={onVolumeChange}
      />

      <div className="mt-auto flex flex-wrap items-center gap-4">
        <button type="button" onClick={play} className={primaryButtonClass}>
          <PlayStopIcon playing={playing} />
          {playing
            ? text({ en: "Stop", ja: "停止" })
            : text({ en: "Play test sound", ja: "テスト音を再生" })}
        </button>
        {playing ? (
          <span className="text-sm text-white/55">{text({ en: "Playing…", ja: "再生中…" })}</span>
        ) : null}
      </div>

      {failed ? (
        <p role="alert" className="border-l-2 border-white/40 pl-3 text-sm leading-6 text-white/70">
          {text({
            en: "The test sound couldn't play. Check that your volume is up and try again.",
            ja: "テスト音を再生できませんでした。音量を確認して、もう一度お試しください。",
          })}
        </p>
      ) : null}
    </section>
  );
}

function MicrophoneTest({
  inputId,
  outputId,
  outputVolume,
  inputGain,
  onInputGainChange,
  onPermissionGranted,
  devicePicker,
}: {
  inputId: string;
  outputId: string;
  outputVolume: number;
  inputGain: number;
  onInputGainChange: (gain: number) => void;
  onPermissionGranted: () => void;
  devicePicker: ReactNode;
}) {
  const { text } = useLanguage();
  const [status, setStatus] = useState<MicStatus>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(testRecordingSeconds);
  const [error, setError] = useState<MicError | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<SinkAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timersRef = useRef<{ tick?: number; stop?: number }>({});
  const urlRef = useRef<string | null>(null);

  function clearTimers() {
    window.clearInterval(timersRef.current.tick);
    window.clearTimeout(timersRef.current.stop);
    timersRef.current = {};
  }

  function closeGainChain() {
    gainNodeRef.current = null;
    void audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
  }

  function replaceRecordingUrl(next: string | null) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next;
    setRecordingUrl(next);
  }

  useEffect(() => {
    return () => {
      clearTimers();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.stop();
      }
      stopTracks(streamRef.current);
      closeGainChain();
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  // The gain can be changed while recording; playback follows the output volume.
  useEffect(() => {
    if (gainNodeRef.current) gainNodeRef.current.gain.value = inputGain;
  }, [inputGain]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = outputVolume;
  }, [outputVolume]);

  async function playBack(url: string) {
    audioRef.current?.pause();
    const audio: SinkAudioElement = new Audio(url);
    audio.volume = outputVolume;
    audioRef.current = audio;
    audio.onended = () => setStatus("done");
    audio.onerror = () => setStatus("done");

    setStatus("playing");
    await routeToOutput(audio, outputId);

    try {
      await audio.play();
    } catch {
      setStatus("done");
    }
  }

  async function startTest() {
    audioRef.current?.pause();
    setError(null);

    if (!window.isSecureContext) {
      setError("insecure");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("unsupported");
      return;
    }

    setStatus("starting");
    let micStream: MediaStream;

    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: inputId ? { deviceId: { exact: inputId } } : true,
      });
    } catch (caught) {
      setError(toMicError(caught));
      setStatus("idle");
      return;
    }

    // Device names become readable once the mic is allowed.
    onPermissionGranted();

    // Route the mic through a gain node so the slider changes what is recorded.
    let recordStream = micStream;
    const audioContext = createAudioContext();

    if (audioContext) {
      const source = audioContext.createMediaStreamSource(micStream);
      const gainNode = audioContext.createGain();
      const destination = audioContext.createMediaStreamDestination();
      gainNode.gain.value = inputGain;
      source.connect(gainNode).connect(destination);
      void audioContext.resume().catch(() => {});

      audioContextRef.current = audioContext;
      gainNodeRef.current = gainNode;
      recordStream = destination.stream;
    }

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;

    try {
      recorder = new MediaRecorder(recordStream, mimeType ? { mimeType } : undefined);
    } catch {
      stopTracks(micStream);
      closeGainChain();
      setError("failed");
      setStatus("idle");
      return;
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      clearTimers();
      stopTracks(micStream);
      closeGainChain();
      streamRef.current = null;
      setStream(null);

      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
      if (blob.size === 0) {
        setError("failed");
        setStatus("idle");
        return;
      }

      const url = URL.createObjectURL(blob);
      replaceRecordingUrl(url);
      void playBack(url);
    };

    recorderRef.current = recorder;
    streamRef.current = micStream;
    // The meter shows the boosted level, matching what gets recorded.
    setStream(recordStream);
    setSecondsLeft(testRecordingSeconds);
    recorder.start();
    setStatus("recording");

    const startedAt = Date.now();
    timersRef.current = {
      tick: window.setInterval(() => {
        const elapsed = (Date.now() - startedAt) / 1000;
        setSecondsLeft(Math.max(0, Math.ceil(testRecordingSeconds - elapsed)));
      }, 200),
      stop: window.setTimeout(stopRecording, testRecordingSeconds * 1000),
    };
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }

  function stopPlayback() {
    audioRef.current?.pause();
    setStatus("done");
  }

  const errorMessages: Record<MicError, string> = {
    insecure: text({
      en: "The microphone only works on a secure page (https or localhost).",
      ja: "マイクは安全なページ（https または localhost）でのみ使えます。",
    }),
    unsupported: text({
      en: "This browser can't record sound. Try Chrome, Edge, Firefox or Safari.",
      ja: "このブラウザでは録音できません。Chrome、Edge、Firefox、Safari をお試しください。",
    }),
    denied: text({
      en: "Microphone access was blocked. Allow the microphone in your browser settings, then try again.",
      ja: "マイクへのアクセスがブロックされました。ブラウザの設定でマイクを許可してから、もう一度お試しください。",
    }),
    noMicrophone: text({
      en: "We couldn't find that microphone. Plug one in or choose another, then try again.",
      ja: "マイクが見つかりませんでした。接続するか別のマイクを選んで、もう一度お試しください。",
    }),
    failed: text({
      en: "The microphone didn't start. Please try again.",
      ja: "マイクを開始できませんでした。もう一度お試しください。",
    }),
  };

  const busy = status === "starting" || status === "recording";

  return (
    <section className="flex flex-col gap-5 border border-white/10 bg-white/[0.02] p-5 sm:p-7">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          {text({ en: "Step 2", ja: "ステップ 2" })}
        </p>
        <h2 className="text-xl font-semibold text-white">
          {text({ en: "Microphone test", ja: "マイクテスト" })}
        </h2>
        <p className="text-sm leading-6 text-white/55">
          {text({
            en: `Press record and say a sentence. We'll record ${testRecordingSeconds} seconds, then play it back to you.`,
            ja: `録音を押して、文を言ってみましょう。${testRecordingSeconds}秒間録音したあと、自動で再生します。`,
          })}
        </p>
      </div>

      {devicePicker}

      <LevelSlider
        label={text({ en: "Input gain", ja: "入力音量" })}
        value={inputGain}
        max={maxInputGain}
        onChange={onInputGainChange}
      />

      <div aria-live="polite" className="space-y-3">
        {status === "recording" && stream ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-white">
                <span className="h-2 w-2 animate-pulse bg-white" aria-hidden="true" />
                {text({ en: "Recording… speak now", ja: "録音中… 話してください" })}
              </span>
              <span className="font-mono text-white/55">{secondsLeft}s</span>
            </div>
            <LevelMeter stream={stream} />
          </>
        ) : null}
        {status === "starting" ? (
          <p className="text-sm text-white/55">
            {text({ en: "Starting the microphone…", ja: "マイクを起動中…" })}
          </p>
        ) : null}
        {status === "playing" ? (
          <p className="text-sm font-semibold text-white">
            {text({ en: "Playing your recording…", ja: "録音を再生中…" })}
          </p>
        ) : null}
        {status === "done" ? (
          <p className="text-sm leading-6 text-white/55">
            {text({
              en: "Did you hear yourself clearly? If it was too quiet or noisy, try another microphone or move closer.",
              ja: "自分の声がはっきり聞こえましたか？小さすぎたり雑音が多い場合は、別のマイクを選ぶか近づいてみましょう。",
            })}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-3">
        {status === "recording" ? (
          <button type="button" onClick={stopRecording} className={primaryButtonClass}>
            <PlayStopIcon playing />
            {text({ en: "Stop and play back", ja: "停止して再生" })}
          </button>
        ) : status === "playing" ? (
          <button type="button" onClick={stopPlayback} className={primaryButtonClass}>
            <PlayStopIcon playing />
            {text({ en: "Stop", ja: "停止" })}
          </button>
        ) : (
          <button
            type="button"
            onClick={startTest}
            disabled={busy}
            className={primaryButtonClass}
          >
            <MicIcon />
            {status === "done"
              ? text({ en: "Record again", ja: "もう一度録音" })
              : text({ en: "Record my voice", ja: "声を録音" })}
          </button>
        )}
        {status === "done" && recordingUrl ? (
          <button
            type="button"
            onClick={() => void playBack(recordingUrl)}
            className={secondaryButtonClass}
          >
            {text({ en: "Play again", ja: "もう一度再生" })}
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="border-l-2 border-white/40 pl-3 text-sm leading-6 text-white/70">
          {errorMessages[error]}
        </p>
      ) : null}
    </section>
  );
}

function PlayStopIcon({ playing }: { playing: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      {playing ? <rect x="6" y="6" width="12" height="12" /> : <path d="M7 5v14l12-7z" />}
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
