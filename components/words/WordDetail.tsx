"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/common/PageHeader";
import { useLanguage } from "@/components/language/LanguageProvider";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import { getPublicAudioPath, useExclusiveAudio } from "@/components/training/audio";
import type { TrainingSection } from "@/data/trainingSections";
import { twisterWordTypeLabels } from "@/data/twisterGlossary";
import type { WordDetail as WordDetailData } from "@/data/wordDetails";
import { getLessonHref } from "@/lib/training";
import { getWordOrigin, markReturningToOrigin } from "@/lib/wordReturn";
import type { MinimalPair } from "@/types/training";

type WordDetailProps = {
  detail: WordDetailData;
  section: TrainingSection;
  pair: MinimalPair;
  ipa: string | null;
  partner: { word: string; ipa: string | null; hasPage: boolean };
};

const copy = {
  eyebrow: { en: "Word", ja: "単語" },
  description: {
    en: "What it means, how to use it in a sentence, and the word it's easy to confuse it with.",
    ja: "意味、文の中での使い方、そして間違えやすい単語を確認します。",
  },
  listen: { en: "Listen", ja: "聞く" },
  listenTo: { en: "Listen to", ja: "聞く:" },
  meanings: { en: "Meanings and examples", ja: "意味と例文" },
  soundTip: { en: "How to say it", ja: "発音のコツ" },
  backToLesson: { en: "Go back", ja: "戻る" },
};

// Which side of the R / L contrast this word is on, and how to make that sound.
const rlTips = {
  r: {
    label: "R",
    tip: {
      en: "Pull the tongue tip back a little and don't let it touch the roof of your mouth. Round your lips slightly.",
      ja: "舌先を少し後ろに引き、口の天井には触れないようにします。唇を少し丸めます。",
    },
  },
  l: {
    label: "L",
    tip: {
      en: "Press the tongue tip onto the ridge just behind your top teeth and let the air flow around the sides of the tongue.",
      ja: "舌先を上の前歯のすぐ後ろの歯ぐきに付け、舌の両側から息を流します。",
    },
  },
};

// Wraps every use of the word (or one of its forms) so it stands out from the rest of the sentence.
function highlightWord(sentence: string, forms: Set<string>) {
  return sentence.split(/([A-Za-z']+)/).map((part, index) =>
    forms.has(part.toLowerCase()) ? (
      <mark
        key={index}
        className="bg-white/10 px-1 font-semibold text-white underline decoration-white/60 decoration-2 underline-offset-4"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function WordDetail({ detail, section, pair, ipa, partner }: WordDetailProps) {
  const wordForms = new Set([detail.word, ...(detail.forms ?? [])]);
  const { text } = useLanguage();
  const { activeId, play } = useExclusiveAudio();
  const router = useRouter();
  const wordAudio = (word: string) => getPublicAudioPath("words", pair.soundFocus, word);

  // The R side is the word that has an R its partner lacks (royal vs loyal, grass vs glass).
  const rlSide =
    pair.soundFocus === "R vs L"
      ? detail.word.includes("r") && !partner.word.includes("r")
        ? rlTips.r
        : rlTips.l
      : null;

  function listenButton({ id, path, say, label }: { id: string; path: string | null; say: string; label: string }) {
    const playing = activeId === id;
    return (
      <button
        type="button"
        onClick={() => play(id, path, say)}
        aria-label={`${text(copy.listenTo)} ${label}`}
        disabled={activeId !== null && !playing}
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center border transition focus:outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 disabled:opacity-40 ${
          playing ? "border-white bg-white text-black" : "border-white/20 text-white hover:border-white"
        }`}
      >
        <SpeakerIcon />
      </button>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        compact
        eyebrow={{
          en: `${section.title.en} · ${copy.eyebrow.en}`,
          ja: `${section.title.ja} · ${copy.eyebrow.ja}`,
        }}
        title={detail.word}
        description={copy.description}
      />

      <section className="grid gap-6 border-t border-white/10 pt-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="border border-white/10 p-8">
          <p className="text-6xl font-semibold text-white md:text-7xl">{detail.word}</p>
          {ipa ? <p className="mt-4 text-2xl text-white/60">{ipa}</p> : null}
          <button
            type="button"
            onClick={() => play("word", wordAudio(detail.word), detail.word)}
            disabled={activeId !== null && activeId !== "word"}
            className="mt-8 inline-flex h-11 items-center gap-2 border border-white bg-white px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none disabled:opacity-40"
          >
            <SpeakerIcon />
            {text(copy.listen)}
          </button>
        </div>

        <div className="space-y-6">
          {rlSide ? (
            <section className="border border-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-white/35">
                {text(copy.soundTip)} · {rlSide.label}
              </p>
              <p className="mt-4 leading-7 text-white/70">{text(rlSide.tip)}</p>
            </section>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-[0.24em] text-white/35">{text(copy.meanings)}</h2>
        <ol className="space-y-4">
          {detail.senses.map((sense, senseIndex) => (
            <li key={senseIndex} className="border border-white/10 p-6">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-white/20 text-sm font-semibold text-white">
                  {senseIndex + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-white/50">{text(twisterWordTypeLabels[sense.type])}</p>
                  <p className="mt-1 text-lg text-white">{text(sense.meaning)}</p>
                </div>
                {sense.image ? (
                  <Image
                    src={sense.image}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 shrink-0 border border-white/10 bg-white/[0.03] p-1.5"
                  />
                ) : null}
              </div>
              <ul className="mt-5 space-y-3 border-t border-white/10 pt-5 md:pl-13">
                {sense.examples.map((example, exampleIndex) => {
                  const id = `example-${senseIndex}-${exampleIndex}`;
                  return (
                    <li key={id} className="flex items-start gap-3">
                      {listenButton({ id, path: null, say: example.en, label: example.en })}
                      <div className="min-w-0">
                        <p className="leading-7 text-white/75">{highlightWord(example.en, wordForms)}</p>
                        <p className="text-sm leading-6 text-white/50">{example.ja}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <nav className="border-t border-white/10 pt-8">
        <Link
          href={getLessonHref(section.id)}
          onClick={(event) => {
            // Opened from a sentence: go back to that page, at the same scroll position.
            // Opened directly (or storage is blocked): fall through to the lesson link.
            const origin = getWordOrigin();
            if (!origin || event.metaKey || event.ctrlKey || event.shiftKey) {
              return;
            }
            event.preventDefault();
            markReturningToOrigin();
            router.push(origin, { scroll: false });
          }}
          className="inline-flex text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
        >
          ← {text(copy.backToLesson)}
        </Link>
      </nav>
    </div>
  );
}
