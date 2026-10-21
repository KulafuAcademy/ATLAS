"use client";

import { useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import { getPublicAudioPath, useRecordedAudio } from "@/components/training/audio";
import { stopPronunciationCheckEvent } from "@/components/training/useSentenceCheck";
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
    speakingDescription: "Listen, repeat, and check your pronunciation with the microphone.",
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
  const active = sections.find((section) => section.id === activeId) ?? sections[0];
  const category = categories.find((item) => item.id === activeId);

  return (
    <div className="space-y-8">
      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label={copy.categories}>
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => {
              setActiveId(section.id);
              setMode("listening");
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

      <div
        id={mode === "listening" ? "listening" : "pronunciation"}
        className="scroll-mt-28"
        key={`${activeId}-${mode}`}
      >
        {mode === "listening" ? (
          <QuickTest
            pairs={active.pairs}
            onComplete={(score, total) => saveTestResult(active.id, score, total)}
            onStudy={() => setMode("speaking")}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {active.pairs.map((pair) => (
              <PairCard key={pair.id} pair={pair} />
            ))}
          </div>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              {copy.included}
            </p>
            <h2 className="text-xl font-semibold text-white">{copy.wordPairs}</h2>
          </div>
          <span className="text-sm font-semibold text-white/55">
            {copy.pairCount(active.pairs.length)}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {active.pairs.map((pair, index) => (
            <article key={pair.id} className="border border-white/10 bg-white/[0.02] p-4">
              <span className="text-xs font-semibold text-white/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-lg font-semibold text-white">
                {pair.wordA} <span className="font-normal text-white/40">/</span>{" "}
                {pair.wordB}
              </p>
              {pair.tongueTwister ? (
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">
                  {pair.tongueTwister.text}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
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
      <p className={`mt-2 text-sm leading-6 ${active ? "text-black/65" : "text-white/55"}`}>
        {description}
      </p>
      <p className={`mt-3 text-xs font-semibold ${active ? "text-black" : "text-white/75"}`}>
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
function QuickTest({
  pairs,
  onComplete,
  onStudy,
}: {
  pairs: MinimalPair[];
  onComplete: (score: number, total: number) => void;
  onStudy: () => void;
}) {
  const { language } = useLanguage();
  const copy = quickTestCopy[language];
  const play = useRecordedAudio();
  const [quiz, setQuiz] = useState(() => buildQuiz(pairs));
  const [index, setIndex] = useState(0);
  const [played, setPlayed] = useState(false);
  const [answer, setAnswer] = useState<QuizTarget | null>(null);
  const [score, setScore] = useState(0);
  const current = quiz[index];

  if (!current) {
    return (
      <section className="space-y-4 border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-4xl font-semibold text-white">
          {score} / {quiz.length}
        </p>
        <p className="text-white/55">{score === quiz.length ? copy.perfect : copy.missed}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {score < quiz.length ? (
            <button type="button" onClick={onStudy} className={primaryButtonClassName}>
              {copy.study}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setQuiz(buildQuiz(pairs));
              setIndex(0);
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
    if (value === target) setScore((value) => value + 1);
  }

  function next() {
    if (isLast) onComplete(score, quiz.length);
    setIndex((value) => value + 1);
    setPlayed(false);
    setAnswer(null);
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
          <button type="button" onClick={next} className={primaryButtonClassName}>
            {isLast ? copy.finish : copy.next}
          </button>
        </div>
      ) : null}
    </section>
  );
}

const pairCardCopy = {
  en: { listen: "Listen" },
  ja: { listen: "聞く" },
};

function PairCard({ pair }: { pair: MinimalPair }) {
  const { language } = useLanguage();
  const copy = pairCardCopy[language];
  const play = useRecordedAudio();

  return (
    <article className="space-y-4 border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        {pair.soundFocus}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[pair.wordA, pair.wordB].map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => play(getPublicAudioPath("words", pair.soundFocus, word), word)}
            className="flex h-11 items-center justify-center gap-2 border border-white/10 bg-black px-3 font-semibold text-white transition hover:border-white/35 focus:outline-none"
          >
            <SpeakerIcon className="h-4 w-4 shrink-0 text-white/50" />
            {word}
          </button>
        ))}
      </div>
      {pair.tongueTwister ? (
        <div className="space-y-3 border border-white/10 bg-white/[0.03] p-4">
          <p className="font-semibold text-white">{pair.tongueTwister.text}</p>
          <p className="text-sm leading-6 text-white/55">
            {pair.tongueTwister.note[language]}
          </p>
          <button
            type="button"
            onClick={() =>
              play(
                getPublicAudioPath("twisters", pair.soundFocus, pair.id),
                pair.tongueTwister!.text,
              )
            }
            className="flex h-10 items-center gap-2 border border-white/10 bg-black px-3 text-sm font-semibold text-white transition hover:border-white/35 focus:outline-none"
          >
            <SpeakerIcon className="h-4 w-4 text-white/50" />
            {copy.listen}
          </button>
        </div>
      ) : null}
      <PronunciationCheck words={[pair.wordA, pair.wordB]} />
    </article>
  );
}

const checkCopy = {
  en: {
    say: (word: string) => `Say “${word}”…`,
    correct: (word: string) => `Heard “${word}” — great!`,
    retry: (heard: string) => `Heard “${heard}”. Try again!`,
    nothing: "I couldn’t hear that.",
    unsupported: "Pronunciation checking works in Chrome or Edge.",
  },
  ja: {
    say: (word: string) => `「${word}」と言ってください…`,
    correct: (word: string) => `「${word}」と聞こえました！`,
    retry: (heard: string) => `「${heard}」と聞こえました。もう一度！`,
    nothing: "聞き取れませんでした。",
    unsupported: "発音判定はChrome / Edgeで利用できます。",
  },
};

function PronunciationCheck({ words }: { words: string[] }) {
  const { language } = useLanguage();
  const copy = checkCopy[language];
  const [feedback, setFeedback] = useState("");

  function check(word: string) {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!Recognition) {
      setFeedback(copy.unsupported);
      return;
    }

    // Stops any other running microphone check on the page.
    window.dispatchEvent(new Event(stopPronunciationCheckEvent));

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const heard = event.results[0]?.[0]?.transcript.toLowerCase() ?? "";
      setFeedback(
        heard.includes(word.toLowerCase()) ? copy.correct(word) : copy.retry(heard),
      );
    };
    recognition.onerror = () => setFeedback(copy.nothing);
    recognition.start();
    setFeedback(copy.say(word));
  }

  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => check(word)}
            className="inline-flex h-9 items-center gap-2 border border-white bg-white px-3 text-xs font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none"
          >
            <MicIcon />
            {word}
          </button>
        ))}
      </div>
      {feedback ? <p className="text-sm text-white/55">{feedback}</p> : null}
    </div>
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
