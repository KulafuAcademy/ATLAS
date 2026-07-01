"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import {
  formatBooleanRounded,
  formatCategory,
  formatTerm,
  getSymbolCopy,
  resolveText,
  uiText,
} from "@/lib/i18n";
import type { IpaSymbol, LearningStage } from "@/types/ipa";

type LearningStepSummary = {
  stage: LearningStage;
  position: number;
} | null;

type IpaStudyContentProps = {
  symbol: IpaSymbol;
  relatedSymbols: IpaSymbol[];
  learningStep: LearningStepSummary;
  nextLearningSymbol: IpaSymbol | null;
};

export function IpaStudyContent({
  symbol,
  relatedSymbols,
  learningStep,
  nextLearningSymbol,
}: IpaStudyContentProps) {
  const { language, text } = useLanguage();
  const copy = getSymbolCopy(symbol, language);
  const backHref = symbol.category === "vowel" ? "/vowels" : "/consonants";
  const backLabel =
    symbol.category === "vowel" ? uiText.backToVowels : uiText.backToConsonants;
  const learningFocus =
    symbol.category === "vowel"
      ? [
          `${text(uiText.height)}: ${formatTerm(symbol.height, language)}`,
          `${text(uiText.backness)}: ${formatTerm(symbol.backness, language)}`,
          `${language === "ja" ? "唇の形" : "Lip shape"}: ${formatBooleanRounded(
            symbol.rounded,
            language,
          )}`,
        ]
      : [
          `${text(uiText.place)}: ${formatTerm(symbol.place, language)}`,
          `${text(uiText.manner)}: ${formatTerm(symbol.manner, language)}`,
          `${language === "ja" ? "有声性" : "Voicing"}: ${formatTerm(
            symbol.voicing,
            language,
          )}`,
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
            href="/learn"
            className="text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
          >
            {text(uiText.viewPath)}
          </Link>
        </section>
      ) : null}

      <section className="grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="border border-white/10 p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-white/35">
              {text(uiText.symbol)}
            </p>
            <p className="mt-6 text-8xl font-semibold text-white md:text-9xl">
              {symbol.symbol}
            </p>
            <p className="mt-6 text-xl text-white/75">{copy.label}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {learningFocus.map((item) => (
              <div key={item} className="border border-white/10 p-4">
                <p className="text-sm text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <StudyPanel title={text(uiText.whatToNotice)}>
            <p>{copy.description}</p>
          </StudyPanel>

          <StudyPanel title={text(uiText.exampleWords)}>
            <div className="grid gap-3 sm:grid-cols-3">
              {symbol.exampleWords.map((word) => (
                <div key={word} className="border border-white/10 p-4">
                  <p className="text-lg text-white">{word}</p>
                </div>
              ))}
            </div>
          </StudyPanel>

          <StudyPanel title={text(uiText.articulation)}>
            <div className="grid gap-4 sm:grid-cols-3">
              {symbol.category === "vowel" ? (
                <>
                  <Attribute
                    label={text(uiText.height)}
                    value={formatTerm(symbol.height, language)}
                  />
                  <Attribute
                    label={text(uiText.backness)}
                    value={formatTerm(symbol.backness, language)}
                  />
                  <Attribute
                    label={language === "ja" ? "円唇性" : "Rounding"}
                    value={formatBooleanRounded(symbol.rounded, language)}
                  />
                </>
              ) : (
                <>
                  <Attribute
                    label={text(uiText.place)}
                    value={formatTerm(symbol.place, language)}
                  />
                  <Attribute
                    label={text(uiText.manner)}
                    value={formatTerm(symbol.manner, language)}
                  />
                  <Attribute
                    label={language === "ja" ? "有声性" : "Voicing"}
                    value={formatTerm(symbol.voicing, language)}
                  />
                </>
              )}
            </div>
          </StudyPanel>

          <StudyPanel title={text(uiText.notes)}>
            <p>{copy.notes}</p>
          </StudyPanel>
        </div>
      </section>

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
          {relatedSymbols.map((related) => {
            const relatedCopy = getSymbolCopy(related, language);

            return (
              <Link
                key={related.slug}
                href={`/ipa/${related.slug}`}
                className="border border-white/10 p-5 transition hover:border-white/35"
              >
                <p className="text-4xl font-semibold text-white">
                  {related.symbol}
                </p>
                <p className="mt-3 text-sm font-medium text-white/75">
                  {relatedCopy.label}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/35">
                  {formatCategory(related.category, language)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-white/10 pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={backHref}
            className="inline-flex text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
          >
            {text(backLabel)}
          </Link>
          {nextLearningSymbol ? (
            <Link
              href={`/ipa/${nextLearningSymbol.slug}`}
              className="inline-flex text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
            >
              {text(uiText.next)}: {nextLearningSymbol.symbol}{" "}
              {getSymbolCopy(nextLearningSymbol, language).label}
            </Link>
          ) : null}
        </div>
      </section>
    </>
  );
}

function StudyPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-white/35">
        {title}
      </p>
      <div className="mt-4 leading-7 text-white/65">{children}</div>
    </section>
  );
}

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="mt-2 capitalize text-white">{value}</p>
    </div>
  );
}
