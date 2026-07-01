"use client";

import { useState } from "react";

import type { MinimalPair } from "@/types/training";

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

  function showPracticeMessage() {
    setMessage("Voice analysis will be added later.");
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

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <ActionButton onClick={() => speak(pair.wordA)}>
                Listen A
              </ActionButton>
              <ActionButton onClick={() => speak(pair.wordB)}>
                Listen B
              </ActionButton>
              <ActionButton onClick={showPracticeMessage}>
                Practice
              </ActionButton>
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
