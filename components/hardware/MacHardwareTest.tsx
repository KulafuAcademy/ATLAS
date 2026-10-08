"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  Feedback,
  LevelMeter,
  MICROPHONE_TEST_DURATION,
  REQUIRED_VOLUME,
  Slider,
  createSilentUrl,
  createTestToneUrl,
  getAudioContextConstructor,
  isSafari,
  pickRecorderMimeType,
} from "./hardware-shared";
import { macHardwareCopy, type MacHardwareCopy } from "./macHardwareCopy";

type SinkAudio = HTMLAudioElement & {
  setSinkId?: (id: string) => Promise<void>;
};

/**
 * macOS version (Safari, Chrome, Edge, Firefox on a Mac).
 *
 * Same layout as the desktop version. What is different:
 * - Safari can't list or choose speakers (no setSinkId), so the speaker picker
 *   is only shown when the browser supports it. Chrome/Edge on Mac keep it.
 * - Safari blocks audio.play() once the tap has "expired" (e.g. after the
 *   3 second recording), so playback is unlocked inside the tap and one
 *   <audio> element is reused.
 * - Safari records the raw microphone stream (audio/mp4). Chrome/Edge keep the
 *   input level slider (Web Audio gain node in the recording path).
 * - Permission-denied messages explain the Safari / macOS System Settings steps.
 */
export default function MacHardwareTest() {
  const { language } = useLanguage();
  const copy: MacHardwareCopy = macHardwareCopy[language];

  const [safari, setSafari] = useState(false);
  const [canChooseOutput, setCanChooseOutput] = useState(false);

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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toneUrlRef = useRef<string | null>(null);
  const silentUrlRef = useRef<string | null>(null);
  const recordingUrlRef = useRef<string | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    setSafari(isSafari());
    setCanChooseOutput("setSinkId" in HTMLMediaElement.prototype);
  }, []);

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

  // Apply the input level slider while the test is running.
  useEffect(() => {
    if (micGainNodeRef.current) {
      micGainNodeRef.current.gain.value = micGain;
    }
  }, [micGain]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();

      [toneUrlRef, silentUrlRef, recordingUrlRef].forEach((ref) => {
        if (ref.current) {
          URL.revokeObjectURL(ref.current);
        }
      });
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
      setMicMessage(
        safari ? copy.microphoneDeniedSafari : copy.microphoneDeniedOther,
      );
      return;
    }

    await loadDevices();
  }

  function getAudioElement() {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    return audioRef.current;
  }

  // Must run synchronously inside a click handler (before any await).
  function unlockAudio() {
    const audio = getAudioElement();

    if (!silentUrlRef.current) {
      silentUrlRef.current = createSilentUrl();
    }

    audio.onended = null;
    audio.onerror = null;
    audio.src = silentUrlRef.current;

    void audio.play().catch(() => {
      // The real playback reports its own error.
    });
  }

  async function applyOutput(audio: HTMLAudioElement) {
    const sinkAudio = audio as SinkAudio;

    // Skipped on Safari so nothing is awaited before play().
    if (safari || !canChooseOutput || !outputId || !sinkAudio.setSinkId) {
      return;
    }

    try {
      await sinkAudio.setSinkId(outputId);
    } catch {
      // Fall back to the browser default output.
    }
  }

  async function playTestSound() {
    if (audioPlaying || micTesting || playingBack) {
      return;
    }

    const audio = getAudioElement();
    audio.pause();

    if (!toneUrlRef.current) {
      toneUrlRef.current = createTestToneUrl();
    }

    audio.onended = () => {
      setAudioPlaying(false);
      setAudioMessage(copy.audioSuccess);
    };

    audio.onerror = () => {
      setAudioPlaying(false);
      setAudioMessage(copy.audioTestError);
    };

    audio.src = toneUrlRef.current;
    audio.volume = outputVolume;

    setAudioPlaying(true);
    setAudioMessage(copy.playingSound);

    try {
      await applyOutput(audio);
      await audio.play();
    } catch {
      setAudioPlaying(false);
      setAudioMessage(copy.audioTestError);
    }
  }

  async function playRecording(url: string) {
    const audio = getAudioElement();
    audio.pause();

    audio.onended = () => {
      setPlayingBack(false);
      setMicMessage(copy.playbackMessage);
    };

    audio.onerror = () => {
      setPlayingBack(false);
      setMicMessage(copy.playbackError);
    };

    audio.src = url;
    audio.volume = outputVolume;
    audio.currentTime = 0;

    setPlayingBack(true);
    setMicMessage(copy.playingBack);

    try {
      await applyOutput(audio);
      await audio.play();
    } catch (error) {
      setPlayingBack(false);

      const blocked =
        error instanceof DOMException && error.name === "NotAllowedError";

      setMicMessage(blocked ? copy.tapToPlay : copy.playbackError);
    }
  }

  async function checkMicrophone() {
    if (micTesting || playingBack || audioPlaying) {
      return;
    }

    // Everything that needs the click happens before the first await.
    unlockAudio();

    const AudioContextConstructor = getAudioContextConstructor();
    const context = AudioContextConstructor
      ? new AudioContextConstructor()
      : null;

    void context?.resume();

    if (
      !context ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      void context?.close();
      setMicMessage(copy.microphoneUnavailable);
      return;
    }

    setMicTesting(true);
    setMicMessage(copy.recordingMessage);

    let stream: MediaStream | null = null;
    let animationFrame: number | null = null;
    let recordedUrl: string | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...(inputId ? { deviceId: { exact: inputId } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
          ...(safari ? {} : { autoGainControl: false }),
        },
      });

      const source = context.createMediaStreamSource(stream);

      const gainNode = context.createGain();
      gainNode.gain.value = micGain;
      micGainNodeRef.current = gainNode;

      const analyser = context.createAnalyser();
      analyser.fftSize = 256;

      // The analyser goes to a muted node so nothing is played live
      // (that would cause feedback).
      const silencer = context.createGain();
      silencer.gain.value = 0;

      source.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(silencer);
      silencer.connect(context.destination);

      // Chrome/Edge: record through the gain node so the input level slider
      // affects the recording. Safari: record the raw stream (more reliable).
      let recorderStream: MediaStream = stream;

      if (!safari) {
        const destination = context.createMediaStreamDestination();
        gainNode.connect(destination);
        recorderStream = destination.stream;
      }

      const mimeType = pickRecorderMimeType(
        safari
          ? ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"]
          : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"],
      );

      const recorder = new MediaRecorder(
        recorderStream,
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
        analyser.getByteTimeDomainData(data);

        let sum = 0;

        for (const sample of data) {
          const value = (sample - 128) / 128;
          sum += value * value;
        }

        const level = Math.min(1, Math.sqrt(sum / data.length) * 3);

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

      if (blob.size === 0) {
        throw new Error("Empty recording");
      }

      if (recordingUrlRef.current) {
        URL.revokeObjectURL(recordingUrlRef.current);
      }

      recordedUrl = URL.createObjectURL(blob);
      recordingUrlRef.current = recordedUrl;

      setRecordingUrl(recordedUrl);
      setMicMessage(
        maxLevel >= REQUIRED_VOLUME
          ? copy.microphoneWorking
          : copy.microphoneLow,
      );
    } catch (error) {
      const denied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");

      setMicMessage(
        denied
          ? safari
            ? copy.microphoneDeniedSafari
            : copy.microphoneDeniedOther
          : copy.microphoneStartError,
      );
    } finally {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }

      stream?.getTracks().forEach((track) => track.stop());
      void context.close();

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

        {/* SPEAKERS */}
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

          {canChooseOutput ? (
            <select
              value={outputId}
              onChange={(event) => setOutputId(event.target.value)}
              className="h-11 w-full border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-white"
            >
              {outputs.length === 0 ? (
                <option value="">{copy.defaultAudioOutput}</option>
              ) : (
                outputs.map((device, index) => (
                  <option
                    key={device.deviceId || index}
                    value={device.deviceId}
                  >
                    {device.label || copy.audioOutput(index)}
                  </option>
                ))
              )}
            </select>
          ) : (
            <Feedback text={copy.outputFixedNote} />
          )}

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
                <option key={device.deviceId || index} value={device.deviceId}>
                  {device.label || copy.microphone(index)}
                </option>
              ))
            )}
          </select>

          {!safari ? (
            <Slider
              label={copy.inputLevel}
              value={micGain}
              min={0}
              max={3}
              step={0.05}
              onChange={setMicGain}
            />
          ) : null}

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
