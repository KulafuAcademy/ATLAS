"use client";

import { useEffect, useRef } from "react";

import { createAudioContext } from "./trainingAudio";

const meterWeights = [0.45, 0.75, 1, 0.75, 0.45];

/**
 * Animated 5-bar mic level indicator shown while recording.
 * Opens its own getUserMedia stream and reads volume (RMS) through an
 * AnalyserNode, updating bar heights directly via refs to avoid re-renders.
 * Purely visual: if mic access fails, recognition still works.
 * Pass `stream` to reuse an existing mic stream instead of opening a second one;
 * on touch devices a second stream can mute the first, so callers recording on
 * touch devices must pass it.
 */
export function MicLevelMeter({ stream: sharedStream }: { stream?: MediaStream } = {}) {
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;

    function setBars(level: number, time: number) {
      barRefs.current.forEach((bar, index) => {
        if (!bar) return;
        const wobble = 0.85 + 0.15 * Math.sin(time / 90 + index * 1.7);
        const scale = Math.min(1, 0.12 + level * meterWeights[index] * wobble);
        bar.style.transform = `scaleY(${scale})`;
      });
    }

    async function start() {
      try {
        const source =
          sharedStream ??
          (stream = await navigator.mediaDevices.getUserMedia({ audio: true }));

        if (cancelled) {
          stream?.getTracks().forEach((track) => track.stop());
          return;
        }

        audioContext = createAudioContext();
        if (!audioContext) return;
        // Mobile browsers start contexts suspended outside a tap.
        if (audioContext.state === "suspended") void audioContext.resume();

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        audioContext.createMediaStreamSource(source).connect(analyser);

        const samples = new Uint8Array(analyser.fftSize);
        let smoothed = 0;

        const tick = (time: number) => {
          analyser.getByteTimeDomainData(samples);

          let sumSquares = 0;
          for (const sample of samples) {
            const normalized = (sample - 128) / 128;
            sumSquares += normalized * normalized;
          }

          const rms = Math.sqrt(sumSquares / samples.length);
          const level = Math.min(1, rms * 6);

          // fast attack, slow release so the bars feel natural
          smoothed =
            level > smoothed
              ? smoothed * 0.4 + level * 0.6
              : smoothed * 0.9 + level * 0.1;

          setBars(smoothed, time);
          frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
      } catch {
        // Mic level unavailable; recognition still works without the animation.
      }
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      stream?.getTracks().forEach((track) => track.stop());
      void audioContext?.close();
    };
  }, [sharedStream]);

  return (
    <div
      aria-hidden="true"
      className="col-span-full flex h-10 items-center justify-center gap-1.5 border border-white/10 bg-white/[0.02]"
    >
      {meterWeights.map((_, index) => (
        <span
          key={index}
          ref={(element) => {
            barRefs.current[index] = element;
          }}
          className="h-6 w-1.5 origin-center bg-white"
          style={{ transform: "scaleY(0.12)" }}
        />
      ))}
    </div>
  );
}
