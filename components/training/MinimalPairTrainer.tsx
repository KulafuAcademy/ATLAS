"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import type { MinimalPair } from "@/types/training";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

type QuizTarget = "A" | "B";

type ActiveQuiz = {
  pairId: string;
  target: QuizTarget;
} | null;

type MinimalPairTrainerProps = {
  title: string;
  description: string;
  pairs: MinimalPair[];
};

export function MinimalPairTrainer({
  title,
  description,
  pairs,
}: MinimalPairTrainerProps) {
  const [message, setMessage] = useState(
    "Choose a word to listen, then practice it aloud.",
  );
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz>(null);

  function speak(word: string) {
    if (!("speechSynthesis" in window)) {
      setMessage("Speech playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
    setMessage(`Playing: ${word}`);
  }

  function startQuiz(pair: MinimalPair) {
    const target: QuizTarget = Math.random() > 0.5 ? "A" : "B";
    const word = target === "A" ? pair.wordA : pair.wordB;

    setActiveQuiz({ pairId: pair.id, target });
    speak(word);
    setMessage("Which word did you hear?");
  }

  function answerQuiz(pair: MinimalPair, answer: QuizTarget) {
    if (!activeQuiz || activeQuiz.pairId !== pair.id) {
      setMessage("Click Quiz first, then choose A or B.");
      return;
    }

    if (answer === activeQuiz.target) {
      playCorrectSound();
      setMessage("Correct! Ping-pong.");
    } else {
      playIncorrectSound();
      setMessage(
        `Try again. The answer was Word ${activeQuiz.target}.`,
      );
    }

    setActiveQuiz(null);
  }

  function startPronunciationTest(pair: MinimalPair, target: QuizTarget) {
    const word = target === "A" ? pair.wordA : pair.wordB;

    setMessage(`Pronunciation test for "${word}" will use voice analysis later.`);
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            First training section
          </p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            {title}
          </h2>
          <p className="max-w-2xl leading-7 text-white/60">{description}</p>
        </div>
        <p
          role="status"
          aria-live="polite"
          className="border border-white/10 px-4 py-3 text-sm text-white/70"
        >
          {message}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pairs.map((pair) => (
          <article
            key={pair.id}
            className="flex min-h-56 flex-col justify-between border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/30"
          >
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                {pair.soundFocus}
              </p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <WordLabel label="A" word={pair.wordA} />
                <span className="text-sm text-white/30">vs</span>
                <WordLabel label="B" word={pair.wordB} />
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <TestGroup title="Listen">
                <ActionButton onClick={() => speak(pair.wordA)}>
                  Listen A
                </ActionButton>
                <ActionButton onClick={() => speak(pair.wordB)}>
                  Listen B
                </ActionButton>
              </TestGroup>

              <TestGroup title="Listening Test">
                <ActionButton onClick={() => startQuiz(pair)}>
                  Play Quiz
                </ActionButton>
                <ActionButton onClick={() => answerQuiz(pair, "A")}>
                  Answer A
                </ActionButton>
                <ActionButton onClick={() => answerQuiz(pair, "B")}>
                  Answer B
                </ActionButton>
              </TestGroup>

              <TestGroup title="Pronunciation Test">
                <ActionButton onClick={() => startPronunciationTest(pair, "A")}>
                  Practice A
                </ActionButton>
                <ActionButton onClick={() => startPronunciationTest(pair, "B")}>
                  Practice B
                </ActionButton>
              </TestGroup>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WordLabel({ label, word }: { label: string; word: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
        Word {label}
      </p>
      <p className="text-3xl font-semibold text-white md:text-4xl">{word}</p>
    </div>
  );
}

function TestGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">{children}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 border border-white/15 px-3 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black focus:border-white focus:outline-none"
    >
      {children}
    </button>
  );
}

function playCorrectSound() {
  const audioContext = createAudioContext();

  if (!audioContext) {
    return;
  }

  playTone(audioContext, 660, 0, 0.12, "sine");
  playTone(audioContext, 880, 0.13, 0.16, "sine");
}

function playIncorrectSound() {
  const audioContext = createAudioContext();

  if (!audioContext) {
    return;
  }

  playTone(audioContext, 160, 0, 0.28, "sawtooth");
}

function createAudioContext() {
  const AudioContextConstructor =
    window.AudioContext ?? window.webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  return new AudioContextConstructor();
}

function playTone(
  audioContext: AudioContext,
  frequency: number,
  startDelay: number,
  duration: number,
  type: OscillatorType,
) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const startsAt = audioContext.currentTime + startDelay;
  const endsAt = startsAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startsAt);
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.16, startsAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, endsAt);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startsAt);
  oscillator.stop(endsAt);
}
