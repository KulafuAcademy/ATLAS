"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import { speakWord } from "@/components/sounds/speak";
import {
  formatBooleanRounded,
  formatCategory,
  formatTerm,
  getSymbolCopy,
  resolveText,
  uiText,
} from "@/lib/i18n";
import type { IpaSymbol, LearningStage } from "@/types/ipa";

type SoundDetailProps = {
  symbol: IpaSymbol;
  related: IpaSymbol[];
  learningStep: { stage: LearningStage; position: number } | null;
  next: IpaSymbol | null;
};

export function SoundDetail({ symbol, related, learningStep, next }: SoundDetailProps) {
  const { language, text } = useLanguage();
  const copy = getSymbolCopy(symbol, language);
  const facts: Array<[string, string]> =
    symbol.category === "vowel"
      ? [
          [text(uiText.height), formatTerm(symbol.height, language)],
          [text(uiText.backness), formatTerm(symbol.backness, language)],
          [text(uiText.lipShape), formatBooleanRounded(symbol.rounded, language)],
        ]
      : [
          [text(uiText.place), formatTerm(symbol.place, language)],
          [text(uiText.manner), formatTerm(symbol.manner, language)],
          [text(uiText.voicing), formatTerm(symbol.voicing, language)],
        ];

  return (
    <>
      {learningStep ? (
        <section className="grid gap-4 border border-white/10 p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/35">
              {text(uiText.learningPath)}
            </p>
            <p className="mt-2 text-white">
              {language === "ja" ? "ステップ" : "Step"} {learningStep.position}:{" "}
              {resolveText(learningStep.stage.title, language)}
            </p>
          </div>
          <Link
            href="/path"
            className="text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
          >
            {text(uiText.viewPath)}
          </Link>
        </section>
      ) : null}

      <section className="grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="border border-white/10 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-white/35">IPA</p>
          <p className="mt-6 text-8xl font-semibold text-white md:text-9xl">
            {symbol.symbol}
          </p>
          <p className="mt-6 text-xl text-white/75">{copy.label}</p>
          <div className="mt-8">
            {facts.map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-t border-white/10 py-3 text-sm"
              >
                <span className="uppercase tracking-[0.18em] text-white/35">
                  {label}
                </span>
                <span className="capitalize text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Panel title={text(uiText.whatToNotice)}>
            <p>{copy.description}</p>
          </Panel>

          <Panel title={text(uiText.exampleWords)}>
            <div className="grid gap-3 sm:grid-cols-3">
              {symbol.exampleWords.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => speakWord(word, 0.72)}
                  className="flex items-center justify-center gap-2 border border-white/10 p-4 text-lg text-white transition hover:border-white/35"
                >
                  <SpeakerIcon className="h-4 w-4 text-white/50" />
                  {word}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title={text(uiText.notes)}>
            <p>{copy.notes}</p>
          </Panel>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="space-y-6 border-t border-white/10 pt-10">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-white/35">
              {text(uiText.compare)}
            </p>
            <h2 className="mt-3 text-2xl font-medium text-white">
              {text(uiText.nearbySounds)}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/sounds/${item.slug}`}
                className="border border-white/10 p-5 transition hover:border-white/35"
              >
                <p className="text-4xl font-semibold text-white">{item.symbol}</p>
                <p className="mt-3 text-sm font-medium text-white/75">
                  {getSymbolCopy(item, language).label}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/35">
                  {formatCategory(item.category, language)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-white/10 pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/sounds"
            className="inline-flex text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
          >
            ← {text(uiText.backToLibrary)}
          </Link>
          {next ? (
            <Link
              href={`/sounds/${next.slug}`}
              className="inline-flex text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
            >
              {text(uiText.next)}: {next.symbol} {getSymbolCopy(next, language).label} →
            </Link>
          ) : null}
        </div>
      </section>
    </>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-white/35">{title}</p>
      <div className="mt-4 leading-7 text-white/65">{children}</div>
    </section>
  );
}
