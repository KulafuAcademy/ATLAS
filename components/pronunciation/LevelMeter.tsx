"use client";

import { useEffect, useRef } from "react";

import { createAudioContext } from "@/components/training/feedbackSounds";

const meterWeights = [0.45, 0.75, 1, 0.75, 0.45];

/**
 * 5-bar mic level meter for a live recording stream. Reads volume (RMS)
 * through an AnalyserNode and sets bar heights via refs to avoid re-renders.
 * Purely visual; the stream itself is owned and stopped by the recorder, so
 * unlike the card's MicLevelMeter it opens no second mic stream and also
 * works on touch devices.
 */
export function LevelMeter({
  stream,
  className = "",
}: {
  stream: MediaStream;
  className?: string;
}) {
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const audioContext = createAudioContext();
    if (!audioContext) return;

    let frameId = 0;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    // iOS Safari may create the context suspended outside a tap.
    void audioContext.resume().catch(() => {});

    const samples = new Uint8Array(analyser.fftSize);
    let smoothed = 0;

    const tick = (time: number) => {
      analyser.getByteTimeDomainData(samples);

      let sumSquares = 0;
      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        sumSquares += normalized * normalized;
      }

      const level = Math.min(1, Math.sqrt(sumSquares / samples.length) * 6);
      // fast attack, slow release so the bars feel natural
      smoothed =
        level > smoothed
          ? smoothed * 0.4 + level * 0.6
          : smoothed * 0.9 + level * 0.1;

      barRefs.current.forEach((bar, index) => {
        if (!bar) return;
        const wobble = 0.85 + 0.15 * Math.sin(time / 90 + index * 1.7);
        const scale = Math.min(1, 0.12 + smoothed * meterWeights[index] * wobble);
        bar.style.transform = `scaleY(${scale})`;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      source.disconnect();
      void audioContext.close();
    };
  }, [stream]);

  return (
    <div
      aria-hidden="true"
      className={`flex h-10 items-center justify-center gap-1.5 border border-white/10 bg-white/[0.02] ${className}`}
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
