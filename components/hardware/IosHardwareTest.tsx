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
  createSilentUrl,
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
 * iPhone / iPad version.
 *
 * What is different from desktop:
 * - No output device picker (iOS never lists speakers / has no setSinkId).
 * - No volume slider: audio.volume is read-only on iOS, so the hardware
 *   buttons are the only control.
 * - The test melody is a WAV played through <audio>, so the silent switch
 *   doesn't mute it.
 * - Audio playback and the AudioContext are unlocked inside the tap, because
 *   iOS blocks play() once the tap has "expired" (e.g. after a 3 second
 *   recording).
 * - The recording is the raw microphone stream (audio/mp4), no Web Audio gain
 *   node in the recording path.
 */
export default function IosHardwareTest() {
  const { language } = useLanguage();
  const copy: MobileHardwareCopy = mobileHardwareCopy[language];

  const [micLevel, setMicLevel] = useState(0);

  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");

  const [micTesting, setMicTesting] = useState(false);
  const [micMessage, setMicMessage] = useState("");

  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [playingBack, setPlayingBack] = useState(false);

  const [inAppBrowser, setInAppBrowser] = useState(false);

  // One <audio> element for everything, so the unlock from the first tap
  // carries over to later playback.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toneUrlRef = useRef<string | null>(null);
  const silentUrlRef = useRef<string | null>(null);
  const recordingUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setInAppBrowser(isInAppBrowser());
  }, []);

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

  function getAudioElement() {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    return audioRef.current;
  }

  // Must run synchronously inside a tap handler (before any await).
  function unlockAudio() {
    const audio = getAudioElement();

    if (!silentUrlRef.current) {
      silentUrlRef.current = createSilentUrl();
    }

    audio.onended = null;
    audio.onerror = null;
    audio.src = silentUrlRef.current;

    void audio.play().catch(() => {
      // Nothing to do; the real playback will report its own error.
    });
  }

  function playTestSound() {
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

    setAudioPlaying(true);
    setAudioMessage(copy.playingSound);

    // play() is called synchronously inside the tap.
    audio.play().catch(() => {
      setAudioPlaying(false);
      setAudioMessage(copy.audioTestError);
    });
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

    // Everything that needs the tap happens before the first await.
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
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Level meter only. The analyser goes to a muted gain node so nothing is
      // played back live (that would cause feedback).
      const source = context.createMediaStreamSource(stream);

      const analyser = context.createAnalyser();
      analyser.fftSize = 256;

      const silencer = context.createGain();
      silencer.gain.value = 0;

      source.connect(analyser);
      analyser.connect(silencer);
      silencer.connect(context.destination);

      const mimeType = pickRecorderMimeType([
        "audio/mp4",
        "audio/webm;codecs=opus",
        "audio/webm",
      ]);

      // Record the raw stream, which is the most reliable path on iOS.
      const recorder = new MediaRecorder(
        stream,
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
        type: recorder.mimeType || mimeType || "audio/mp4",
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
        denied ? copy.microphoneDeniedIos : copy.microphoneStartError,
      );
    } finally {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }

      stream?.getTracks().forEach((track) => track.stop());
      void context.close();

      setMicLevel(0);
      setMicTesting(false);
    }

    if (recordedUrl) {
      // Give iOS a moment to switch from "recording" back to "playback" mode,
      // otherwise the first second can come out of the earpiece or very quiet.
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 250);
      });

      await playRecording(recordedUrl);
    }
  }

  return (
    <HardwareShell
      eyebrow={copy.hardwareTest}
      title={copy.title}
      description={copy.description}
      notice={inAppBrowser ? copy.inAppBrowserWarning("Safari") : undefined}
    >
      <HardwareSection
        label={copy.speakerSection}
        title={copy.speakerTitle}
        description={copy.speakerDescription}
      >
        <Feedback text={copy.iosSoundTip} />

        <PrimaryButton onClick={playTestSound} disabled={audioPlaying}>
          {audioPlaying ? copy.playing : copy.testAudio}
        </PrimaryButton>

        {audioMessage ? <Feedback text={audioMessage} /> : null}
      </HardwareSection>

      <HardwareSection
        label={copy.microphoneSection}
        title={copy.microphoneTitle}
        description={copy.microphoneDescription}
      >
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
