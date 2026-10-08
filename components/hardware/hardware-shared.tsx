import type { ButtonHTMLAttributes, ReactNode } from "react";

export const REQUIRED_VOLUME = 0.15;
export const MICROPHONE_TEST_DURATION = 3000;

/* -------------------------------------------------------------------------- */
/* Platform detection (call on the client only, e.g. inside useEffect)         */
/* -------------------------------------------------------------------------- */

export type Platform = "iphone" | "ipad" | "android" | "mac" | "desktop";

export function detectPlatform(): Platform {
  const ua = navigator.userAgent;

  // Every browser on iPhone/iPad (Safari, Chrome, Edge...) uses WebKit,
  // so they all behave like iOS Safari.
  if (/iPhone|iPod/.test(ua)) {
    return "iphone";
  }

  // iPadOS 13+ reports itself as a Mac ("Macintosh") but has a touch screen.
  // A real Mac has no touch points, which is how the two are told apart.
  const isIpadOs = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;

  if (/iPad/.test(ua) || isIpadOs) {
    return "ipad";
  }

  if (/Android/i.test(ua)) {
    return "android";
  }

  if (/Macintosh/.test(ua)) {
    return "mac";
  }

  return "desktop";
}

/** True for Safari only (not Chrome, Edge, Firefox or Opera). */
export function isSafari(): boolean {
  const ua = navigator.userAgent;

  return (
    /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Android/.test(ua)
  );
}

export function isInAppBrowser(): boolean {
  return /Line\/|FBAN|FBAV|Instagram|Twitter|MicroMessenger|KAKAOTALK|YJApp/i.test(
    navigator.userAgent,
  );
}

/* -------------------------------------------------------------------------- */
/* Audio helpers                                                               */
/* -------------------------------------------------------------------------- */

export function getAudioContextConstructor(): typeof AudioContext | null {
  return (
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext ??
    null
  );
}

export function pickRecorderMimeType(candidates: string[]): string | undefined {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

const SAMPLE_RATE = 22050;
const NOTE_LENGTH = 0.9;

const TEST_NOTES = [
  { frequency: 523.25, start: 0 },
  { frequency: 659.25, start: 0.5 },
  { frequency: 783.99, start: 1.0 },
  { frequency: 1046.5, start: 1.5 },
  { frequency: 783.99, start: 2.0 },
  { frequency: 659.25, start: 2.5 },
];

function encodeWav(samples: Float32Array): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(
      44 + i * 2,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
  }

  return new Blob([buffer], { type: "audio/wav" });
}

/**
 * The test melody as a WAV file, played through an <audio> element.
 * On iPhone, <audio> keeps playing when the silent switch is on,
 * while Web Audio (oscillators) is muted.
 */
export function createTestToneUrl(): string {
  const total = TEST_NOTES[TEST_NOTES.length - 1].start + NOTE_LENGTH;
  const samples = new Float32Array(Math.ceil(total * SAMPLE_RATE));
  const peak = 0.35;

  for (const { frequency, start } of TEST_NOTES) {
    const offset = Math.floor(start * SAMPLE_RATE);
    const length = Math.floor(NOTE_LENGTH * SAMPLE_RATE);

    for (let i = 0; i < length && offset + i < samples.length; i += 1) {
      const t = i / SAMPLE_RATE;
      const envelope =
        t < 0.05 ? t / 0.05 : (NOTE_LENGTH - t) / (NOTE_LENGTH - 0.05);

      samples[offset + i] +=
        Math.sin(2 * Math.PI * frequency * t) * envelope * peak;
    }
  }

  return URL.createObjectURL(encodeWav(samples));
}

/** A quarter second of silence, used to unlock <audio> playback on iOS. */
export function createSilentUrl(): string {
  return URL.createObjectURL(encodeWav(new Float32Array(SAMPLE_RATE / 4)));
}

/* -------------------------------------------------------------------------- */
/* Layout pieces                                                               */
/* -------------------------------------------------------------------------- */

export function HardwareShell({
  eyebrow,
  title,
  description,
  notice,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  notice?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-black px-5 pt-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-3 border-t border-white/10 pt-8">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            {eyebrow}
          </p>

          <h1 className="text-3xl font-semibold">{title}</h1>

          <p className="leading-7 text-white/60">{description}</p>

          {notice ? <Feedback text={notice} /> : null}
        </div>

        {children}
      </div>
    </main>
  );
}

export function HardwareSection({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 border border-white/10 bg-white/[0.02] p-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-white/35">
          {label}
        </p>

        <h2 className="text-xl font-semibold">{title}</h2>

        <p className="text-sm leading-6 text-white/50">{description}</p>
      </div>

      {children}
    </section>
  );
}

/* Touch-friendly buttons: tall, and they use :active instead of :hover so the
   inverted colours don't stay "stuck" after a tap. */
export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="h-14 w-full border border-white bg-white px-3 text-base font-semibold text-black transition active:bg-black active:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="h-14 w-full border border-white/15 px-3 text-base font-semibold text-white transition active:border-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function Slider({
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

      {/* No appearance-none: the native thumb stays visible and accent-white
          colours it. h-8 gives a finger-sized touch area. */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="h-8 w-full cursor-pointer accent-white"
      />
    </div>
  );
}

export function LevelMeter({
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
          style={{ width: `${Math.round(level * 100)}%` }}
        />

        <div
          className="absolute top-[-3px] h-[14px] w-px bg-white/60"
          style={{ left: `${threshold * 100}%` }}
        />
      </div>
    </div>
  );
}

export function Feedback({ text }: { text: string }) {
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
