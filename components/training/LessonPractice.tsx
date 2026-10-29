"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import type { LessonPractice as LessonPracticeData } from "@/data/lessonPractice";

import {
  getPublicAudioPath,
  getSentenceFilename,
  useRecordedAudio,
} from "./audio";

const practiceCopy = {
  en: {
    compareTitle: "Listen and compare",
    pairs: (count: number) => `${count} pairs`,
    sentencesTitle: "Three finishing sentences",
    sentencesDescription: "Say each sentence slowly, then at a natural speed.",
    play: "Play",
  },
  ja: {
    compareTitle: "聞き比べよう",
    pairs: (count: number) => `${count}ペア`,
    sentencesTitle: "仕上げの3文",
    sentencesDescription: "最初はゆっくり、次は自然な速さで言いましょう。",
    play: "再生",
  },
};

export function LessonPractice({
  practice,
  soundFocus,
}: {
  practice: LessonPracticeData;
  // Folder under /public/words and /public/sentences holding this lesson's clips.
  soundFocus?: string;
}) {
  const { language, text } = useLanguage();
  const copy = practiceCopy[language];
  const play = useRecordedAudio();

  function playWord(word: string) {
    play(soundFocus ? getPublicAudioPath("words", soundFocus, word) : null, word);
  }

  function playSentence(sentence: string) {
    play(
      soundFocus
        ? getPublicAudioPath("sentences", soundFocus, getSentenceFilename(sentence))
        : null,
      sentence,
    );
  }

  return (
    <section className="space-y-6">
      <article className="space-y-5 border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-xl font-semibold text-white">{copy.compareTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-white/55">
              {text(practice.compare.description)}
            </p>
          </div>
          <span className="self-start border border-white/10 px-3 py-1 text-xs font-semibold text-white/60">
            {copy.pairs(practice.compare.pairs.length)}
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {practice.compare.pairs.map((pair) => (
            <div
              key={`${pair.left}-${pair.right}`}
              className="flex min-w-0 items-center gap-2 border border-white/10 bg-white/[0.03] p-2 sm:p-3"
            >
              <PlayWordButton word={pair.left} hint={text(pair.leftHint)} onPlay={playWord} />
              <span aria-hidden className="shrink-0 text-white/30">
                →
              </span>
              <PlayWordButton word={pair.right} hint={text(pair.rightHint)} onPlay={playWord} />
            </div>
          ))}
        </div>
      </article>

      <article className="space-y-5 border border-white/10 bg-white/[0.02] p-5">
        <div>
          <h3 className="text-xl font-semibold text-white">{copy.sentencesTitle}</h3>
          <p className="mt-1 text-sm leading-6 text-white/55">{copy.sentencesDescription}</p>
        </div>

        <ol className="space-y-3">
          {practice.sentences.map((sentence, index) => (
            <li
              key={sentence}
              className="flex items-center gap-3 border border-white/10 bg-white/[0.03] p-3"
            >
              <span className="text-sm font-semibold text-white/50">{index + 1}</span>
              <p className="flex-1 text-white">{sentence}</p>
              <button
                type="button"
                aria-label={`${copy.play}: ${sentence}`}
                onClick={() => playSentence(sentence)}
                className="grid h-10 w-10 shrink-0 place-items-center border border-white/10 transition hover:border-white/35 focus:outline-none"
              >
                <SpeakerIcon className="h-4 w-4 text-white/50" />
              </button>
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
}

function PlayWordButton({
  word,
  hint,
  onPlay,
}: {
  word: string;
  hint: string;
  onPlay: (word: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay(word)}
      className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 border border-white/10 bg-black px-2 text-white transition hover:border-white/35 focus:outline-none sm:px-3"
    >
      <SpeakerIcon className="h-4 w-4 shrink-0 text-white/50" />
      <span className="shrink-0 font-semibold">{word}</span>
      <span className="min-w-0 truncate text-xs text-white/50">{hint}</span>
    </button>
  );
}
