"use client";

import { useState } from "react";
import Image from "next/image";

import { useLanguage } from "@/components/language/LanguageProvider";
import {
  useWordCheck,
  WordAssessmentModal,
} from "@/components/pronunciation/WordAssessmentModal";
import type { WordCheckState } from "@/components/pronunciation/WordAssessmentModal";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import {
  getPublicAudioPath,
  useRecordedAudio,
} from "@/components/training/audio";
import {
  playCorrectSound,
  playIncorrectSound,
} from "@/components/training/feedbackSounds";
import type { TrainingSection } from "@/data/trainingSections";
import { saveTestResult } from "@/lib/trainingProgress";
import type { MinimalPair, TrainingCategory } from "@/types/training";

type PracticeMode = "listening" | "speaking";

const libraryCopy = {
  en: {
    categories: "Sound categories",
    overview: "Training overview",
    listening: "Listening",
    listeningDescription: "Play each word and choose which one you heard.",
    listeningMeta: (count: number) => `${count} word pairs`,
    speaking: "Speaking",
    speakingDescription:
      "Listen, repeat, and check your pronunciation with the microphone.",
    speakingMeta: (count: number) => `${count} word pairs and tongue twisters`,
    included: "Included practice",
    wordPairs: "Word pairs",
    pairCount: (count: number) => `${count} pairs`,
  },
  ja: {
    categories: "音のカテゴリー",
    overview: "トレーニング内容",
    listening: "リスニング",
    listeningDescription: "単語を再生して、聞こえた方を選びます。",
    listeningMeta: (count: number) => `${count}組の聞き分け`,
    speaking: "スピーキング",
    speakingDescription: "単語を聞いてまねし、マイクで発音を確認します。",
    speakingMeta: (count: number) => `${count}組の単語・早口文`,
    included: "収録内容",
    wordPairs: "練習する単語",
    pairCount: (count: number) => `${count}組`,
  },
};

const primaryButtonClassName =
  "inline-flex h-11 shrink-0 items-center justify-center border border-white bg-white px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none";

export function PracticeLibrary({
  categories,
  sections,
  initialCategory,
  initialMode,
}: {
  categories: TrainingCategory[];
  sections: TrainingSection[];
  initialCategory?: string;
  initialMode?: PracticeMode;
}) {
  const { language, text } = useLanguage();
  const copy = libraryCopy[language];
  const [activeId, setActiveId] = useState(
    sections.some((section) => section.id === initialCategory)
      ? initialCategory!
      : (sections[0]?.id ?? ""),
  );
  const [mode, setMode] = useState<PracticeMode>(initialMode ?? "listening");
  const [quizIndex, setQuizIndex] = useState(0);
  const active =
    sections.find((section) => section.id === activeId) ?? sections[0];
  const category = categories.find((item) => item.id === activeId);

  // Jump the listening quiz to the chosen pair and bring it into view.
  function practicePair(index: number) {
    setMode("listening");
    setQuizIndex(index);
    requestAnimationFrame(() =>
      document
        .getElementById("listening")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <div className="space-y-8">
      <nav
        className="flex gap-2 overflow-x-auto pb-1"
        aria-label={copy.categories}
      >
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => {
              setActiveId(section.id);
              setMode("listening");
              setQuizIndex(0);
            }}
            className={`h-10 shrink-0 border px-4 text-sm font-semibold transition focus:outline-none ${
              activeId === section.id
                ? "border-white bg-white text-black"
                : "border-white/10 text-white/60 hover:border-white/35 hover:text-white"
            }`}
          >
            {text(section.title)}
          </button>
        ))}
      </nav>

      <section className="space-y-6 border border-white/10 bg-white/[0.02] p-5 sm:p-7">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            {copy.overview}
          </p>
          <h2 className="text-2xl font-semibold text-white">
            {text(category?.title ?? active.title)}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-white/55">
            {text(category?.description ?? active.description)}
          </p>
          {category ? (
            <p className="text-sm font-medium text-white/75">
              {category.examples.join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <ModeCard
            active={mode === "listening"}
            title={copy.listening}
            description={copy.listeningDescription}
            meta={copy.listeningMeta(active.pairs.length)}
            onClick={() => setMode("listening")}
          />
          <ModeCard
            active={mode === "speaking"}
            title={copy.speaking}
            description={copy.speakingDescription}
            meta={copy.speakingMeta(active.pairs.length)}
            onClick={() => setMode("speaking")}
          />
        </div>
      </section>

      {mode === "speaking" ? (
        <ArticulationGuide categoryId={active.id} />
      ) : null}

      <div
        id={mode === "listening" ? "listening" : "pronunciation"}
        className="scroll-mt-28"
        key={`${activeId}-${mode}`}
      >
        {mode === "listening" ? (
          <QuickTest
            pairs={active.pairs}
            index={quizIndex}
            onIndexChange={setQuizIndex}
            onComplete={(score, total) =>
              saveTestResult(active.id, score, total)
            }
            onStudy={() => setMode("speaking")}
          />
        ) : (
          <SpeakingPairs pairs={active.pairs} />
        )}
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              {copy.included}
            </p>
            <h2 className="text-xl font-semibold text-white">
              {copy.wordPairs}
            </h2>
          </div>
          <span className="text-sm font-semibold text-white/55">
            {copy.pairCount(active.pairs.length)}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {active.pairs.map((pair, index) => {
            const isCurrent = mode === "listening" && index === quizIndex;
            // Jumping to a pair only makes sense for the listening quiz.
            const isSpeaking = mode === "speaking";

            return (
              <button
                key={pair.id}
                type="button"
                aria-current={isCurrent ? "step" : undefined}
                disabled={isSpeaking}
                onClick={() => practicePair(index)}
                className={`border p-4 text-left transition focus:outline-none disabled:cursor-default ${
                  isCurrent
                    ? "border-white/45 bg-white/[0.09]"
                    : isSpeaking
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/35"
                }`}
              >
                <span
                  className={`text-xs font-semibold ${isCurrent ? "text-white/70" : "text-white/40"}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-lg font-semibold text-white">
                  {pair.wordA}{" "}
                  <span className="font-normal text-white/40">/</span>{" "}
                  {pair.wordB}
                </p>
                {pair.tongueTwister ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">
                    {pair.tongueTwister.text}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Each image shows both sounds side by side: left half, then right half.
const articulationGuides = {
  "r-vs-l": {
    image: "/images/r-l-tongue-position-mouth-only.webp",
    left: {
      title: { en: "R: Keep the tongue tip free", ja: "R：舌先を浮かせる" },
      detail: {
        en: "Lift it toward the roof without touching.",
        ja: "上あごに近づけますが、どこにも触れさせません。",
      },
    },
    right: {
      title: { en: "L: Touch the tongue tip", ja: "L：舌先をつける" },
      detail: {
        en: "Touch just behind the upper front teeth.",
        ja: "上の前歯のすぐ後ろに舌先をつけます。",
      },
    },
  },
  "b-v": {
    image: "/images/b-v-articulation.webp",
    left: {
      title: { en: "B: Close both lips", ja: "B：唇を閉じる" },
      detail: {
        en: "Close both lips, then release the air.",
        ja: "上下の唇を閉じてから、一気に開きます。",
      },
    },
    right: {
      title: { en: "V: Teeth on the lower lip", ja: "V：下唇に歯を当てる" },
      detail: {
        en: "Rest the upper teeth lightly on the lower lip.",
        ja: "上の前歯を下唇に軽く当てて震わせます。",
      },
    },
  },
  "s-sh": {
    image: "/images/s-sh-articulation.webp",
    left: {
      title: { en: "S: Keep the tongue forward", ja: "S：舌を前に置く" },
      detail: {
        en: "Keep the tip behind the lower teeth and send a narrow stream of air.",
        ja: "舌先を下の前歯の後ろに置き、細く息を出します。",
      },
    },
    right: {
      title: { en: "SH: Move the tongue back", ja: "SH：舌を少し奥へ" },
      detail: {
        en: "Raise the tongue farther back and round the lips slightly.",
        ja: "舌を少し奥へ上げ、唇を軽く丸めます。",
      },
    },
  },
  "short-i-long-e": {
    image: "/images/i-e-articulation.webp",
    left: {
      title: {
        en: "Short I: Lower and relaxed",
        ja: "短いI：少し低く、力を抜く",
      },
      detail: {
        en: "Raise the front of the tongue with a slightly open jaw.",
        ja: "舌の前を上げつつ、口を少し開けます。",
      },
    },
    right: {
      title: { en: "Long E: Raise the tongue", ja: "長いE：舌を高く上げる" },
      detail: {
        en: "Raise the tongue higher and spread the lips gently.",
        ja: "舌の前をさらに高くし、唇を横に広げます。",
      },
    },
  },
  th: {
    image: "/images/th-s-articulation.webp",
    left: {
      title: { en: "TH: Tongue between the teeth", ja: "TH：舌先を歯の間へ" },
      detail: {
        en: "Place the tongue tip gently between the front teeth.",
        ja: "舌先を上下の前歯の間に軽く出します。",
      },
    },
    right: {
      title: {
        en: "Unlike S: Tongue behind the teeth",
        ja: "Sとの違い：舌は歯の後ろ",
      },
      detail: {
        en: "For S, the tongue stays inside behind the teeth.",
        ja: "Sでは舌を外へ出しません。位置の違いを確認しましょう。",
      },
    },
  },
  "final-consonants": {
    image: "/images/final-consonant-articulation.webp",
    left: {
      title: { en: "Stop on the consonant", ja: "子音で止める" },
      detail: {
        en: "Finish the final consonant and stop the sound.",
        ja: "最後の子音を作った位置で、音を短く止めます。",
      },
    },
    right: {
      title: { en: "Do not add a vowel", ja: "母音を足さない" },
      detail: {
        en: "Do not reopen the mouth for an extra vowel sound.",
        ja: "子音のあとに口を開き直して、余分な母音を続けないようにします。",
      },
    },
  },
} as const;

const articulationCopy = {
  en: { eyebrow: "Compare how your mouth moves" },
  ja: { eyebrow: "口の使い方を比べよう" },
};

function ArticulationGuide({ categoryId }: { categoryId: string }) {
  const { language, text } = useLanguage();
  const guide =
    articulationGuides[categoryId as keyof typeof articulationGuides];

  if (!guide) return null;

  return (
    <section className="space-y-4 border border-white/10 bg-white/[0.02] p-5 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        {articulationCopy[language].eyebrow}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {(["left", "right"] as const).map((side) => (
          <ArticulationPanel
            key={side}
            image={guide.image}
            side={side}
            title={text(guide[side].title)}
            detail={text(guide[side].detail)}
          />
        ))}
      </div>
    </section>
  );
}

function ArticulationPanel({
  image,
  side,
  title,
  detail,
}: {
  image: string;
  side: "left" | "right";
  title: string;
  detail: string;
}) {
  return (
    <article className="overflow-hidden border border-white/10 bg-black">
      <div className="relative aspect-square overflow-hidden">
        {/* The image holds both sounds side by side; show only this panel's half. */}
        <Image
          src={image}
          alt={`${title}. ${detail}`}
          width={1774}
          height={887}
          className={`absolute top-0 h-full w-[200%] max-w-none ${
            side === "left" ? "left-0" : "right-0"
          }`}
          sizes="(min-width: 768px) 416px, 100vw"
        />
      </div>
      <div className="space-y-1 border-t border-white/10 p-4">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm leading-6 text-white/55">{detail}</p>
      </div>
    </article>
  );
}

function ModeCard({
  active,
  title,
  description,
  meta,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group border p-5 text-left transition focus:outline-none ${
        active
          ? "border-white bg-white text-black"
          : "border-white/10 bg-black text-white hover:border-white/35"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span
          aria-hidden
          className={`transition-transform group-hover:translate-x-1 ${
            active ? "text-black/50" : "text-white/40"
          }`}
        >
          →
        </span>
      </div>
      <p
        className={`mt-2 text-sm leading-6 ${active ? "text-black/65" : "text-white/55"}`}
      >
        {description}
      </p>
      <p
        className={`mt-3 text-xs font-semibold ${active ? "text-black" : "text-white/75"}`}
      >
        {meta}
      </p>
    </button>
  );
}

const quickTestCopy = {
  en: {
    question: "Which word did you hear?",
    play: "Play the word",
    correct: "Correct!",
    answer: (word: string) => `Answer: ${word}`,
    next: "Next",
    finish: "Show score",
    perfect: "Perfect! Move to the next sound.",
    missed: "Now practice the sounds you missed.",
    study: "Open speaking practice",
    restart: "Try again",
  },
  ja: {
    question: "聞こえた単語はどっち？",
    play: "単語を再生",
    correct: "正解！",
    answer: (word: string) => `正解: ${word}`,
    next: "次へ",
    finish: "スコアを見る",
    perfect: "全問正解！次の音へ進もう。",
    missed: "間違えた音だけ、深く練習しましょう。",
    study: "スピーキング練習を開く",
    restart: "もう一度",
  },
};

type QuizTarget = "A" | "B";

function buildQuiz(pairs: MinimalPair[]) {
  return pairs.map((pair) => ({
    pair,
    target: (Math.random() < 0.5 ? "A" : "B") as QuizTarget,
  }));
}

// Goes through every pair: play the word, then pick which one was heard.
// `index` is owned by the parent so the word pair list can jump to a pair.
function QuickTest({
  pairs,
  index,
  onIndexChange,
  onComplete,
  onStudy,
}: {
  pairs: MinimalPair[];
  index: number;
  onIndexChange: (index: number) => void;
  onComplete: (score: number, total: number) => void;
  onStudy: () => void;
}) {
  const { language } = useLanguage();
  const copy = quickTestCopy[language];
  const play = useRecordedAudio();
  const [quiz, setQuiz] = useState(() => buildQuiz(pairs));
  const [played, setPlayed] = useState(false);
  const [answer, setAnswer] = useState<QuizTarget | null>(null);
  const [score, setScore] = useState(0);
  const [shownIndex, setShownIndex] = useState(index);
  const current = quiz[index];

  // Start the question fresh whenever the index changes (next or a jump).
  if (shownIndex !== index) {
    setShownIndex(index);
    setPlayed(false);
    setAnswer(null);
  }

  if (!current) {
    return (
      <section className="space-y-4 border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-4xl font-semibold text-white">
          {score} / {quiz.length}
        </p>
        <p className="text-white/55">
          {score === quiz.length ? copy.perfect : copy.missed}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {score < quiz.length ? (
            <button
              type="button"
              onClick={onStudy}
              className={primaryButtonClassName}
            >
              {copy.study}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setQuiz(buildQuiz(pairs));
              onIndexChange(0);
              setScore(0);
            }}
            className="inline-flex h-11 items-center justify-center border border-white/10 px-4 text-sm font-semibold text-white transition hover:border-white/35 focus:outline-none"
          >
            {copy.restart}
          </button>
        </div>
      </section>
    );
  }

  const { pair, target } = current;
  const targetWord = target === "A" ? pair.wordA : pair.wordB;
  const isLast = index === quiz.length - 1;

  function playTarget() {
    play(getPublicAudioPath("words", pair.soundFocus, targetWord), targetWord);
    setPlayed(true);
  }

  function choose(value: QuizTarget) {
    if (!played || answer) return;
    setAnswer(value);
    if (value === target) {
      playCorrectSound();
      setScore((value) => value + 1);
    } else {
      playIncorrectSound();
    }
  }

  function next() {
    if (isLast) onComplete(score, quiz.length);
    onIndexChange(index + 1);
  }

  return (
    <section className="space-y-6 border border-white/10 bg-white/[0.02] p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-white">{copy.question}</p>
        <span className="text-sm text-white/55">
          {index + 1} / {quiz.length}
        </span>
      </div>
      <button
        type="button"
        aria-label={copy.play}
        onClick={playTarget}
        className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white bg-white text-black transition hover:bg-black hover:text-white focus:outline-none"
      >
        <SpeakerIcon className="h-8 w-8" />
      </button>
      <div className="grid grid-cols-2 gap-3">
        {(["A", "B"] as const).map((value) => {
          const isTarget = answer !== null && value === target;
          const isWrongPick = answer === value && value !== target;

          return (
            <button
              key={value}
              type="button"
              disabled={!played || answer !== null}
              onClick={() => choose(value)}
              className={`min-h-16 border text-xl font-semibold transition focus:outline-none disabled:cursor-not-allowed ${
                isTarget
                  ? "border-white bg-white text-black"
                  : isWrongPick
                    ? "border-white/35 text-white/40 line-through"
                    : played && answer === null
                      ? "border-white/10 bg-black text-white hover:border-white/35"
                      : "border-white/10 bg-black text-white/30"
              }`}
            >
              {value === "A" ? pair.wordA : pair.wordB}
            </button>
          );
        })}
      </div>
      {answer ? (
        <div className="flex items-center justify-between gap-4 border border-white/10 bg-white/[0.03] p-4">
          <p className="font-semibold text-white">
            {answer === target ? copy.correct : copy.answer(targetWord)}
          </p>
          <button
            type="button"
            onClick={next}
            className={primaryButtonClassName}
          >
            {isLast ? copy.finish : copy.next}
          </button>
        </div>
      ) : null}
    </section>
  );
}

// One AI check (and one /health poll) shared by every card, for words and
// tongue twisters, shown in a modal. Mounted only in speaking mode.
function SpeakingPairs({ pairs }: { pairs: MinimalPair[] }) {
  const check = useWordCheck();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {pairs.map((pair) => (
          <PairCard key={pair.id} pair={pair} onCheck={check.start} />
        ))}
      </div>
      <WordAssessmentModal check={check} />
    </>
  );
}

const pairCardCopy = {
  en: {
    listen: "Listen",
    say: "Say",
    saySentence: "Say the sentence",
    listenTo: (word: string) => `Listen to ${word}`,
    sayWord: (word: string) => `Say ${word}`,
  },
  ja: {
    listen: "聞く",
    say: "発音",
    saySentence: "文を発音する",
    listenTo: (word: string) => `${word}を聞く`,
    sayWord: (word: string) => `${word}を発音する`,
  },
};

function PairCard({
  pair,
  onCheck,
}: {
  pair: MinimalPair;
  onCheck: WordCheckState["start"];
}) {
  const { language } = useLanguage();
  const copy = pairCardCopy[language];
  const play = useRecordedAudio();
  const twisterAudioPath = getPublicAudioPath(
    "twisters",
    pair.soundFocus,
    pair.id,
  );

  return (
    <article className="space-y-4 border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        {pair.soundFocus}
      </p>
      {/* Each word tile pairs listening and the AI check, like the sentence. */}
      <div className="grid grid-cols-2 gap-2">
        {[pair.wordA, pair.wordB].map((word) => {
          const audioPath = getPublicAudioPath("words", pair.soundFocus, word);

          return (
            <div
              key={word}
              className="space-y-3 border border-white/10 bg-black p-3"
            >
              <p className="text-xl font-semibold text-white">{word}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-label={copy.listenTo(word)}
                  onClick={() => play(audioPath, word)}
                  className="flex h-9 items-center justify-center gap-1.5 border border-white/10 bg-black px-2 text-xs font-semibold text-white transition hover:border-white/35 focus:outline-none"
                >
                  <SpeakerIcon className="h-3.5 w-3.5 shrink-0 text-white/50" />
                  <span className="hidden sm:inline">{copy.listen}</span>
                </button>
                <button
                  type="button"
                  aria-label={copy.sayWord(word)}
                  onClick={() => onCheck({ kind: "word", word, audioPath })}
                  className="flex h-9 items-center justify-center gap-1.5 border border-white bg-white px-2 text-xs font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none"
                >
                  <MicIcon />
                  <span className="hidden sm:inline">{copy.say}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {pair.tongueTwister ? (
        <div className="space-y-3 border border-white/10 bg-white/[0.03] p-4">
          <p className="font-semibold text-white">{pair.tongueTwister.text}</p>
          <p className="text-sm leading-6 text-white/55">
            {pair.tongueTwister.note[language]}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                play(twisterAudioPath, pair.tongueTwister!.text)
              }
              className="flex h-10 items-center gap-2 border border-white/10 bg-black px-3 text-sm font-semibold text-white transition hover:border-white/35 focus:outline-none"
            >
              <SpeakerIcon className="h-4 w-4 text-white/50" />
              {copy.listen}
            </button>
            <button
              type="button"
              onClick={() =>
                onCheck({
                  kind: "sentence",
                  word: pair.tongueTwister!.text,
                  audioPath: twisterAudioPath,
                })
              }
              className="flex h-10 items-center gap-2 border border-white bg-white px-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none"
            >
              <MicIcon />
              {copy.saySentence}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v4" />
    </svg>
  );
}
