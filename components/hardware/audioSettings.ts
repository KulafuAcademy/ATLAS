"use client";

import { useSyncExternalStore } from "react";

import { createAudioContext } from "@/components/training/feedbackSounds";

/**
 * Speaker / microphone choices from the /testhardware page, saved in
 * localStorage so the rest of the app plays and records with them.
 * An empty device id means the system default.
 */
export type AudioSettings = {
  outputId: string;
  inputId: string;
  /** 0–1, applied to every played clip. */
  outputVolume: number;
  /** 0–2, applied to every recording. */
  inputGain: number;
};

const storageKey = "atlas-audio-settings";

export const defaultAudioSettings: AudioSettings = {
  outputId: "",
  inputId: "",
  outputVolume: 1,
  inputGain: 1,
};

let cached: AudioSettings | null = null;
const listeners = new Set<() => void>();

function clamp(value: unknown, min: number, max: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function readStored(): AudioSettings {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}");

    return {
      outputId: typeof parsed.outputId === "string" ? parsed.outputId : "",
      inputId: typeof parsed.inputId === "string" ? parsed.inputId : "",
      outputVolume: clamp(parsed.outputVolume, 0, 1, 1),
      inputGain: clamp(parsed.inputGain, 0, 2, 1),
    };
  } catch {
    return defaultAudioSettings;
  }
}

export function getAudioSettings(): AudioSettings {
  if (typeof window === "undefined") return defaultAudioSettings;
  cached ??= readStored();
  return cached;
}

export function saveAudioSettings(changes: Partial<AudioSettings>) {
  cached = { ...getAudioSettings(), ...changes };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(cached));
  } catch {
    // Private mode etc.: the settings still last for this visit.
  }

  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Another tab changed the settings.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey) return;
    cached = readStored();
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAudioSettings() {
  return useSyncExternalStore(
    subscribe,
    getAudioSettings,
    () => defaultAudioSettings,
  );
}

type SinkAudioElement = HTMLAudioElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

/**
 * Sends an <audio> element to the saved speaker at the saved volume.
 * Speaker choice only works where setSinkId exists (Chrome, Edge); elsewhere,
 * or if the device is gone, the clip plays on the default output.
 */
export async function applyOutputSettings(
  audio: HTMLAudioElement,
  settings: AudioSettings = getAudioSettings(),
) {
  audio.volume = settings.outputVolume;

  const sinkAudio = audio as SinkAudioElement;
  if (!sinkAudio.setSinkId) return;

  try {
    await sinkAudio.setSinkId(settings.outputId);
  } catch {
    // Keep playing on the default output.
  }
}

/** Mic constraints that prefer the saved microphone, falling back to any. */
export function microphoneConstraints(
  base: MediaTrackConstraints = {},
): MediaTrackConstraints {
  const { inputId } = getAudioSettings();
  return inputId ? { ...base, deviceId: { ideal: inputId } } : base;
}

/**
 * Applies the saved input gain to a mic stream through a GainNode. Returns the
 * stream to record and a cleanup that closes the audio graph (the caller still
 * stops the original mic tracks). At 100% the mic stream is used as is.
 */
export function withInputGain(micStream: MediaStream, gain = getAudioSettings().inputGain) {
  const audioContext = gain === 1 ? null : createAudioContext();

  if (!audioContext) {
    return { stream: micStream, gainNode: null, close: () => {} };
  }

  const source = audioContext.createMediaStreamSource(micStream);
  const gainNode = audioContext.createGain();
  const destination = audioContext.createMediaStreamDestination();
  gainNode.gain.value = gain;
  source.connect(gainNode).connect(destination);
  // iOS Safari may create the context suspended outside a tap.
  void audioContext.resume().catch(() => {});

  return {
    stream: destination.stream,
    gainNode,
    close: () => void audioContext.close().catch(() => {}),
  };
}
