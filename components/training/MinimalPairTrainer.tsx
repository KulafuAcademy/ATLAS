"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";
import type { MinimalPair } from "@/types/training";

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitAudioContext?: typeof AudioContext;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

type QuizTarget = "A" | "B";

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  abort: () => void;
  start: () => void;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onnomatch: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null;
};

type BrowserSpeechRecognitionErrorEvent = Event & {
  error?: string;
};

type BrowserSpeechRecognitionResultEvent = Event & {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type ActiveQuiz = {
  pairId: string;
  target: QuizTarget;
} | null;

type FeedbackType = "listen" | "listening" | "pronunciation" | "tongueTwister";
type FeedbackTone = "neutral" | "success" | "error";

type CardFeedback = {
  pairId: string;
  type: FeedbackType;
  tone: FeedbackTone;
  text: string;
  language: "en" | "ja";
} | null;

type TrainerCopy = typeof trainerCopy.en;

const stopPronunciationCheckEvent = "atlas:stop-pronunciation-check";

type MinimalPairTrainerProps = {
  id?: string;
  title: LocalizedText;
  description: LocalizedText;
  pairs: MinimalPair[];
};

const trainerCopy = {
  en: {
    firstTraining: "First training",
    guide: "Listen first, then try the listening or pronunciation test.",
    listenTitle: "Check the sounds",
    listenDescription: (wordA: string, wordB: string) =>
      `Start by listening to the difference between ${wordA} and ${wordB}`,
    listen: (word: string) => `Listen to ${word}`,
    listeningTitle: "Listening test",
    listeningDescription: "Play the audio and pick the correct option below.",
    playQuiz: "Play quiz",
    answer: (word: string) => `I hear ${word}`,
    pronunciationTitle: "Pronunciation test",
    pronunciationDescription: "Say the target word and let Atlas check it.",
    speak: (word: string) => `Say ${word}`,
    tongueTwisterTitle: "Tongue twister",
    tongueTwisterDescription:
      "Practice both sounds together inside one short sentence.",
    listenTongueTwister: "Listen to the sentence",
    speechPlaybackUnsupported:
      "Speech playback is not supported in this browser.",
    playing: (word: string) => `Playing: ${word}`,
    whichWord: "Which word did you hear?",
    playQuizFirst: "Play quiz, listen, then choose.",
    correct: "Correct.",
    listeningIncorrect: (word: string) =>
      `Not quite. The answer was "${word}".`,
    pronunciationUnsupported:
      "Pronunciation check is not supported in this browser. Try Chrome or Edge.",
    sayWord: (word: string) => `Say "${word}". AI will check what it hears.`,
    pronunciationCorrect: (heardText: string) =>
      `Correct. Heard: "${heardText}"`,
    pronunciationRetry: (heardText: string, word: string) =>
      `Try again. Heard: "${heardText}" / Target: "${word}"`,
    couldNotHear: "I could not hear it. Try again.",
    couldNotRecognize: (word: string) =>
      `I could not recognize "${word}". Try again.`,
    checkCouldNotStart: "Pronunciation check could not start. Try again.",
  },
  ja: {
    firstTraining: "最初のトレーニング",
    guide: "まずは単語を聞いて、聞き取りか発音を試しましょう。",
    listenTitle: "音を確認",
    listenDescription: (wordA: string, wordB: string) =>
      `まずは${wordA}と${wordB}の違いを耳で確認します。`,
    listen: (word: string) => `${word}を聞く`,
    listeningTitle: "聞き取りテスト",
    listeningDescription: "音声を聞いて、下の正しい答えを選びましょう。",
    playQuiz: "クイズ再生",
    answer: (word: string) => `${word}だと思う`,
    pronunciationTitle: "発音テスト",
    pronunciationDescription:
      "ターゲットの単語を発音して、Atlasにチェックしてもらいましょう。",
    speak: (word: string) => `${word}を発音する`,

    tongueTwisterTitle: "Tongue Twister",
    tongueTwisterDescription:
      "学んだ2つの音を、ひとつの短い文の中で練習します。",
    listenTongueTwister: "文を聞く",
    speechPlaybackUnsupported: "このブラウザでは音声再生に対応していません。",
    playing: (word: string) => `再生中: ${word}`,
    whichWord: "どちらの単語に聞こえましたか？",
    playQuizFirst: "先に「クイズ再生」を押してから、答えを選んでください。",
    correct: "正解です。",
    listeningIncorrect: (word: string) =>
      `惜しいです。正解は「${word}」でした。`,
    pronunciationUnsupported:
      "このブラウザでは発音チェックに対応していません。Chrome / Edgeで試してください。",
    sayWord: (word: string) =>
      `「${word}」を発音してください。聞き取れたら判定します。`,
    pronunciationCorrect: (heardText: string) =>
      `正解です。聞こえた単語: "${heardText}"`,
    pronunciationRetry: (heardText: string, word: string) =>
      `もう一度。聞こえた単語: "${heardText}" / 目標: "${word}"`,
    couldNotHear: "聞き取れませんでした。もう一度試してください。",
    couldNotRecognize: (word: string) =>
      `「${word}」として認識できませんでした。もう一度試してください。`,
    checkCouldNotStart:
      "発音チェックを開始できませんでした。もう一度試してください。",
  },
};

export function MinimalPairTrainer({
  id,
  title,
  description,
  pairs,
}: MinimalPairTrainerProps) {
  const { language, text } = useLanguage();
  const copy = trainerCopy[language];

  return (
    <section id={id} className="scroll-mt-28 space-y-8">
      <div className="flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-white/40">
            {copy.firstTraining}
          </p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            {text(title)}
          </h2>
          <p className="max-w-2xl leading-7 text-white/60">
            {text(description)}
          </p>
        </div>
        <p
          role="status"
          aria-live="polite"
          className="border border-white/10 px-4 py-3 text-sm text-white/70"
        >
          {copy.guide}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pairs.map((pair) => (
          <PairPracticeCard
            key={pair.id}
            copy={copy}
            language={language}
            pair={pair}
            text={text}
          />
        ))}
      </div>
    </section>
  );
}

function PairPracticeCard({
  copy,
  language,
  pair,
  text,
}: {
  copy: TrainerCopy;
  language: "en" | "ja";
  pair: MinimalPair;
  text: (value: LocalizedText) => string;
}) {
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz>(null);
  const [aiCheckTarget, setAiCheckTarget] = useState<string | null>(null);
  const [cardFeedback, setCardFeedback] = useState<CardFeedback>(null);
  const speechRecognitionRunIdRef = useRef(0);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const tongueTwister = getTongueTwister(pair);

  useEffect(() => {
    function stopRecognition() {
      speechRecognitionRunIdRef.current += 1;
      speechRecognitionRef.current?.abort();
      speechRecognitionRef.current = null;
      setAiCheckTarget(null);
    }

    window.addEventListener(stopPronunciationCheckEvent, stopRecognition);

    return () => {
      window.removeEventListener(stopPronunciationCheckEvent, stopRecognition);
      stopRecognition();
      window.speechSynthesis?.cancel();
    };
  }, []);

  function showFeedback(
    type: FeedbackType,
    tone: FeedbackTone,
    textValue: string,
  ) {
    setCardFeedback({
      pairId: pair.id,
      type,
      tone,
      text: textValue,
      language,
    });
  }

  function getFeedback(type: FeedbackType) {
    if (
      cardFeedback?.pairId !== pair.id ||
      cardFeedback.type !== type ||
      cardFeedback.language !== language
    ) {
      return null;
    }

    return cardFeedback;
  }

  function speak(word: string, feedbackType: FeedbackType = "listen") {
    if (!("speechSynthesis" in window)) {
      playIncorrectSound();
      showFeedback(feedbackType, "error", copy.speechPlaybackUnsupported);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
    showFeedback(feedbackType, "neutral", copy.playing(word));
  }

  function startQuiz() {
    const target: QuizTarget = Math.random() > 0.5 ? "A" : "B";
    const word = target === "A" ? pair.wordA : pair.wordB;

    setActiveQuiz({ pairId: pair.id, target });
    speak(word);
    showFeedback("listening", "neutral", copy.whichWord);
  }

  function answerQuiz(answer: QuizTarget) {
    if (!activeQuiz || activeQuiz.pairId !== pair.id) {
      playIncorrectSound();
      showFeedback("listening", "error", copy.playQuizFirst);
      return;
    }

    if (answer === activeQuiz.target) {
      playCorrectSound();
      showFeedback("listening", "success", copy.correct);
    } else {
      playIncorrectSound();
      const correctWord = activeQuiz.target === "A" ? pair.wordA : pair.wordB;
      showFeedback("listening", "error", copy.listeningIncorrect(correctWord));
    }

    setActiveQuiz(null);
  }

  function startAiPronunciationCheck(target: QuizTarget) {
    const word = target === "A" ? pair.wordA : pair.wordB;
    const SpeechRecognitionConstructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      playIncorrectSound();
      showFeedback("pronunciation", "error", copy.pronunciationUnsupported);
      return;
    }

    window.dispatchEvent(new Event(stopPronunciationCheckEvent));

    const recognition = new SpeechRecognitionConstructor();
    const recognitionRunId = speechRecognitionRunIdRef.current + 1;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    speechRecognitionRunIdRef.current = recognitionRunId;
    speechRecognitionRef.current = recognition;
    setAiCheckTarget(word);
    showFeedback("pronunciation", "neutral", copy.sayWord(word));

    function getFirstRecognizedWord(transcript: string) {
      const normalized = normalizeRecognizedText(transcript);

      return normalized.split(" ")[0] ?? "";
    }

    recognition.onresult = (event) => {
      if (speechRecognitionRunIdRef.current !== recognitionRunId) {
        return;
      }

      // Stop recording immediately once we have a result.
      // recognition.abort();

      const transcripts = getSpeechRecognitionTranscripts(event);
      const heardText = transcripts[0] ?? "";

      // Speech recognition may return something like:
      // "Road Hello. Hello, hello."
      // Only use the first recognized word.
      const heardWord = getFirstRecognizedWord(heardText);

      if (!heardWord) {
        playIncorrectSound();
        showFeedback("pronunciation", "error", copy.couldNotHear);
        setAiCheckTarget(null);
        speechRecognitionRef.current = null;
        return;
      }

      const isCorrect = transcriptMatchesWord(heardWord, word);

      if (isCorrect) {
        playCorrectSound();
        showFeedback(
          "pronunciation",
          "success",
          copy.pronunciationCorrect(heardWord),
        );
      } else {
        playIncorrectSound();
        showFeedback(
          "pronunciation",
          "error",
          copy.pronunciationRetry(heardWord, word),
        );
      }

      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    };

    recognition.onerror = () => {
      if (speechRecognitionRunIdRef.current !== recognitionRunId) {
        return;
      }

      playIncorrectSound();
      showFeedback("pronunciation", "error", copy.couldNotHear);
      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    };

    recognition.onnomatch = () => {
      if (speechRecognitionRunIdRef.current !== recognitionRunId) {
        return;
      }

      playIncorrectSound();
      showFeedback("pronunciation", "error", copy.couldNotRecognize(word));
      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    };

    recognition.onend = () => {
      if (speechRecognitionRunIdRef.current === recognitionRunId) {
        setAiCheckTarget(null);
        speechRecognitionRef.current = null;
      }
    };

    try {
      recognition.start();
    } catch {
      if (speechRecognitionRunIdRef.current !== recognitionRunId) {
        return;
      }

      playIncorrectSound();
      showFeedback("pronunciation", "error", copy.checkCouldNotStart);
      setAiCheckTarget(null);
      speechRecognitionRef.current = null;
    }
  }

  return (
    <article className="flex min-h-56 flex-col justify-between border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/30">
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

      <div className="mt-8 space-y-1 border-t border-white/10 pt-5">
        <TestGroup
          step="1"
          title={copy.listenTitle}
          description={copy.listenDescription(pair.wordA, pair.wordB)}
          feedback={getFeedback("listen")}
        >
          <ActionButton onClick={() => speak(pair.wordA)}>
            {copy.listen(pair.wordA)}
          </ActionButton>
          <ActionButton onClick={() => speak(pair.wordB)}>
            {copy.listen(pair.wordB)}
          </ActionButton>
        </TestGroup>

        <TestGroup
          step="2"
          title={copy.listeningTitle}
          description={copy.listeningDescription}
          actionsClassName="grid gap-3"
          feedback={getFeedback("listening")}
        >
          <ActionButton intent="primary" onClick={startQuiz}>
            {copy.playQuiz}
          </ActionButton>
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionButton onClick={() => answerQuiz("A")}>
              {copy.answer(pair.wordA)}
            </ActionButton>
            <ActionButton onClick={() => answerQuiz("B")}>
              {copy.answer(pair.wordB)}
            </ActionButton>
          </div>
        </TestGroup>

        <TestGroup
          step="3"
          title={copy.pronunciationTitle}
          description={copy.pronunciationDescription}
          feedback={getFeedback("pronunciation")}
        >
          <ActionButton
            intent="primary"
            disabled={Boolean(aiCheckTarget)}
            onClick={() => startAiPronunciationCheck("A")}
          >
            {copy.speak(pair.wordA)}
          </ActionButton>
          <ActionButton
            intent="primary"
            disabled={Boolean(aiCheckTarget)}
            onClick={() => startAiPronunciationCheck("B")}
          >
            {copy.speak(pair.wordB)}
          </ActionButton>
          {aiCheckTarget ? <MicLevelMeter /> : null}
        </TestGroup>

        <TestGroup
          step="4"
          title={copy.tongueTwisterTitle}
          description={copy.tongueTwisterDescription}
          actionsClassName="grid gap-3"
          feedback={getFeedback("tongueTwister")}
        >
          <div className="border border-white/10 bg-black px-4 py-3">
            <p className="text-lg font-semibold leading-8 text-white">
              {tongueTwister.text}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/50">
              {text(tongueTwister.note)}
            </p>
          </div>
          <ActionButton
            onClick={() => speak(tongueTwister.text, "tongueTwister")}
          >
            {copy.listenTongueTwister}
          </ActionButton>
        </TestGroup>
      </div>
    </article>
  );
}

function getTongueTwister(pair: MinimalPair) {
  if (pair.tongueTwister) {
    return pair.tongueTwister;
  }

  const { wordA, wordB } = pair;

  if (pair.soundFocus === "B vs V") {
    return {
      text: `${wordA} and ${wordB} move from closed lips to clear voice.`,
      note: {
        en: "Close the lips for B, then use the lower lip and voice for V.",
        ja: "Bは唇を閉じ、Vは下唇と声を使う意識で練習します。",
      },
    };
  }

  if (pair.soundFocus === "S vs SH") {
    return {
      text: `${wordA}, ${wordB}; say ${wordA}, then ${wordB} softly.`,
      note: {
        en: "Keep S narrow and sharp, then make SH wider and softer.",
        ja: "Sは細く鋭く、SHは少し広くやわらかく出します。",
      },
    };
  }

  if (pair.soundFocus === "Short I vs Long E") {
    return {
      text: `${wordA} and ${wordB} sit in a clean little line.`,
      note: {
        en: "Keep the short vowel relaxed, then make the long vowel clearer.",
        ja: "短い母音は力を抜き、長い母音はよりはっきり伸ばします。",
      },
    };
  }

  if (pair.soundFocus === "TH sounds") {
    return {
      text: `${wordA} then ${wordB}; keep the tongue light and clear.`,
      note: {
        en: "Let the tongue come forward lightly for TH before moving on.",
        ja: "THでは舌を軽く前に出してから、次の音へ移ります。",
      },
    };
  }

  if (pair.soundFocus === "Final consonants") {
    return {
      text: `${wordA}, ${wordB}; finish each word clean and short.`,
      note: {
        en: "Do not add an extra vowel after the final consonant.",
        ja: "語尾の子音の後に、余計な母音を足さないようにします。",
      },
    };
  }

  return {
    text: `${wordA}, ${wordB}, ${wordA} again, then ${wordB}.`,
    note: {
      en: "Practice both target sounds inside one short sentence.",
      ja: "学んだ2つの音を、ひとつの短い文の中で練習します。",
    },
  };
}

const meterWeights = [0.45, 0.75, 1, 0.75, 0.45];

function MicLevelMeter() {
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
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        audioContext = createAudioContext();
        if (!audioContext) return;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        audioContext.createMediaStreamSource(stream).connect(analyser);

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
  }, []);

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

function WordLabel({ label, word }: { label: string; word: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="text-3xl font-semibold text-white md:text-4xl">{word}</p>
    </div>
  );
}

function TestGroup({
  step,
  title,
  description,
  actionsClassName = "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
  feedback,
  children,
}: {
  step: string;
  title: string;
  description: string;
  actionsClassName?: string;
  feedback: CardFeedback;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 border-b border-white/10 py-5 sm:grid-cols-[3rem_1fr]">
      <div className="flex h-9 w-9 items-center justify-center border border-white/15 text-sm font-semibold text-white">
        {step}
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-sm leading-6 text-white/50">{description}</p>
        </div>
        <div className={actionsClassName}>{children}</div>
        {feedback ? <FeedbackMessage feedback={feedback} /> : null}
      </div>
    </div>
  );
}

function FeedbackMessage({
  feedback,
}: {
  feedback: NonNullable<CardFeedback>;
}) {
  const icon =
    feedback.tone === "success"
      ? "⭕️"
      : feedback.tone === "error"
        ? "❌"
        : null;
  const feedbackClassName =
    feedback.tone === "success"
      ? "border-white bg-white text-black"
      : feedback.tone === "error"
        ? "border-white/20 bg-white/[0.04] text-white"
        : "border-white/10 bg-white/[0.02] text-white/70";

  return (
    <p
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 border px-3 py-2 text-sm font-medium ${feedbackClassName}`}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{feedback.text}</span>
    </p>
  );
}

function ActionButton({
  children,
  disabled = false,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  intent?: "primary" | "secondary";
  onClick: () => void;
}) {
  const buttonClassName =
    "h-11 border border-white bg-white px-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/25 disabled:hover:bg-white/10 disabled:hover:text-white/25";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName}
    >
      {children}
    </button>
  );
}

function getSpeechRecognitionTranscripts(
  event: BrowserSpeechRecognitionResultEvent,
) {
  const transcripts: string[] = [];

  for (
    let resultIndex = 0;
    resultIndex < event.results.length;
    resultIndex += 1
  ) {
    const result = event.results[resultIndex];

    for (
      let alternativeIndex = 0;
      alternativeIndex < result.length;
      alternativeIndex += 1
    ) {
      const transcript = result[alternativeIndex]?.transcript.trim();

      if (transcript) {
        transcripts.push(transcript);
      }
    }
  }

  return transcripts;
}

function transcriptMatchesWord(transcript: string, targetWord: string) {
  const normalizedTranscript = normalizeRecognizedText(transcript);
  const normalizedTarget = normalizeRecognizedText(targetWord);

  return normalizedTranscript === normalizedTarget;
}

function normalizeRecognizedText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
