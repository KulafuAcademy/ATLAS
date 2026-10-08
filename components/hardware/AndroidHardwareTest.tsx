"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  Feedback,
  HardwareSection,
  HardwareShell,
  LevelMeter,
  MICROPHONE_TEST_DURATION,
  PrimaryButton,
  REQUIRED_VOLUME,
  SecondaryButton,
  Slider,
  createTestToneUrl,
  getAudioContextConstructor,
  isInAppBrowser,
  pickRecorderMimeType,
} from "./hardware-shared";
import {
  mobileHardwareCopy,
  type MobileHardwareCopy,
} from "./mobileHardwareCopy";

/**
 * Android version.
 *
 * What is different from desktop:
 * - No output device picker (Android Chrome doesn't list speakers).
 * - Volume slider works (audio.volume is supported on Android).
 * - Input level slider is kept, and it now updates live while recording.
 * - Permission-denied message explains the Android / Chrome steps.
 * - Touch-friendly controls (tall buttons, :active instead of :hover).
 */
export default function AndroidHardwareTest() {
  const { language } = useLanguage();
  const copy: MobileHardwareCopy = mobileHardwareCopy[language];

  const [outputVolume, setOutputVolume] = useState(0.6);
  const [micGain, setMicGain] = useState(1);
  const [micLevel, setMicLevel] = useState(0);

  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");

  const [micTesting, setMicTesting] = useState(false);
  const [micMessage, setMicMessage] = useState("");

  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [playingBack, setPlayingBack] = useState(false);

  const [inAppBrowser, setInAppBrowser] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toneUrlRef = useRef<string | null>(null);
  const recordingUrlRef = useRef<string | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    setInAppBrowser(isInAppBrowser());
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

      [toneUrlRef, recordingUrlRef].forEach((ref) => {
        if (ref.current) {
          URL.revokeObjectURL(ref.current);
        }
      });
    };
  }, []);

  function getAudioElement() {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    return audioRef.current;
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

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setMicMessage(copy.microphoneUnavailable);
      return;
    }

    audioRef.current?.pause();

    setMicTesting(true);
    setMicMessage(copy.recordingMessage);

    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;
    let animationFrame: number | null = null;
    let recordedUrl: string | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      const AudioContextConstructor = getAudioContextConstructor();

      if (!AudioContextConstructor) {
        throw new Error("AudioContext is not supported");
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

      const mimeType = pickRecorderMimeType([
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ]);

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
        denied ? copy.microphoneDeniedAndroid : copy.microphoneStartError,
      );
    } finally {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }

      stream?.getTracks().forEach((track) => track.stop());

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
    <HardwareShell
      eyebrow={copy.hardwareTest}
      title={copy.title}
      description={copy.description}
      notice={inAppBrowser ? copy.inAppBrowserWarning("Chrome") : undefined}
    >
      <HardwareSection
        label={copy.speakerSection}
        title={copy.speakerTitle}
        description={copy.speakerDescription}
      >
        <Slider
          label={copy.volume}
          value={outputVolume}
          min={0}
          max={1}
          step={0.01}
          onChange={setOutputVolume}
        />

        <Feedback text={copy.androidVolumeTip} />

        <PrimaryButton
          onClick={() => void playTestSound()}
          disabled={audioPlaying}
        >
          {audioPlaying ? copy.playing : copy.testAudio}
        </PrimaryButton>

        {audioMessage ? <Feedback text={audioMessage} /> : null}
      </HardwareSection>

      <HardwareSection
        label={copy.microphoneSection}
        title={copy.microphoneTitle}
        description={copy.microphoneDescriptionAdjustable}
      >
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

        <PrimaryButton
          onClick={() => void checkMicrophone()}
          disabled={micTesting || playingBack}
        >
          {micTesting
            ? copy.recording
            : playingBack
              ? copy.playingBack
              : copy.checkMicrophone}
        </PrimaryButton>

        {recordingUrl && !micTesting && !playingBack ? (
          <SecondaryButton onClick={() => void playRecording(recordingUrl)}>
            {copy.playRecordingAgain}
          </SecondaryButton>
        ) : null}

        {micMessage ? <Feedback text={micMessage} /> : null}
      </HardwareSection>
    </HardwareShell>
  );
}
