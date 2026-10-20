"use client";

import Image from "next/image";

import { useLanguage } from "@/components/language/LanguageProvider";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import { speakWord } from "@/components/sounds/speak";
import type { LessonGuide as LessonGuideData, SoundGuide } from "@/data/lessonGuides";

const lessonSteps = [
  {
    title: { en: "Know the mouth shape", ja: "口の形を知る" },
    detail: {
      en: "Notice the tongue position and form each sound slowly.",
      ja: "舌の位置を見て、ゆっくり音を作ります。",
    },
  },
  {
    title: { en: "Listen for the difference", ja: "聞き分ける" },
    detail: {
      en: "Hear similar words side by side.",
      ja: "似ている単語を交互に聞きます。",
    },
  },
  {
    title: { en: "Say it aloud", ja: "声に出す" },
    detail: {
      en: "Speak the sound, then the word, then a short sentence.",
      ja: "音、単語、短い文の順で発音します。",
    },
  },
];

const guideCopy = {
  en: {
    eyebrow: "Learn when you need help",
    description:
      "If the challenge feels difficult, review the mouth shapes and sound differences.",
    steps: "Lesson steps",
  },
  ja: {
    eyebrow: "困ったときの学び方",
    description: "テストで迷ったときは、口の形と音の違いを確認しましょう。",
    steps: "レッスンの流れ",
  },
};

export function LessonGuide({ guide }: { guide: LessonGuideData }) {
  const { language, text } = useLanguage();
  const copy = guideCopy[language];

  return (
    <section className="space-y-6 border-t border-white/10 pt-10">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm uppercase tracking-[0.28em] text-white/40">
          {copy.eyebrow}
        </p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          {text(guide.title)}
        </h2>
        <p className="leading-7 text-white/60">{copy.description}</p>
      </div>

      <ol aria-label={copy.steps} className="grid gap-4 md:grid-cols-3">
        {lessonSteps.map((step, index) => (
          <li
            key={step.title.en}
            className="flex gap-3 border border-white/10 bg-white/[0.02] p-4"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center bg-white text-sm font-semibold text-black">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold text-white">{text(step.title)}</p>
              <p className="mt-1 text-sm leading-6 text-white/55">
                {text(step.detail)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 lg:grid-cols-2">
        {guide.sounds.map((sound, index) => (
          <SoundCard
            key={sound.label}
            image={guide.image}
            side={index === 0 ? "left" : "right"}
            sound={sound}
          />
        ))}
      </div>
    </section>
  );
}

function SoundCard({
  image,
  side,
  sound,
}: {
  image: string;
  side: "left" | "right";
  sound: SoundGuide;
}) {
  const { text } = useLanguage();

  return (
    <article className="border border-white/10 bg-white/[0.02]">
      <div className="space-y-4 border-b border-white/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-white">{text(sound.title)}</h3>
          <span className="text-4xl leading-none font-semibold whitespace-nowrap text-white">
            {sound.label}
          </span>
        </div>
        <div className="relative aspect-square overflow-hidden border border-white/10">
          {/* The image holds both sounds side by side; show only this card's half. */}
          <Image
            src={image}
            alt={text(sound.title)}
            width={1774}
            height={887}
            className={`absolute top-0 h-full w-[200%] max-w-none ${
              side === "left" ? "left-0" : "right-0"
            }`}
            sizes="(min-width: 1024px) 464px, 100vw"
          />
        </div>
      </div>

      <div className="space-y-5 p-5">
        <ol className="space-y-3 text-sm leading-6 text-white/60">
          {sound.steps.map((step, index) => (
            <li key={step.en}>
              <span className="font-semibold text-white">{index + 1}.</span>{" "}
              {text(step)}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          {sound.words.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => speakWord(word, 0.72)}
              className="flex h-10 items-center gap-2 border border-white/10 px-3 text-sm font-semibold text-white transition hover:border-white/35 focus:outline-none"
            >
              <SpeakerIcon className="h-4 w-4 text-white/50" />
              {word}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
