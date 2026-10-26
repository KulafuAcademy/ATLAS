"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";
import { usePairCompleted } from "@/lib/pairCompletion";

type StepLink = {
  href: string;
  label: LocalizedText;
} | null;

type LessonStepNavProps = {
  back: { href: string; label: LocalizedText };
  previous: StepLink;
  next: StepLink;
  /** Keep "Next" locked until this pair's tongue twister is passed. */
  lockNextUntilPairDone?: string;
};

const stepNavCopy = {
  en: {
    previous: "Previous",
    next: "Next",
    nextLocked: "Score 60 or more on the tongue twister to unlock the next pair.",
  },
  ja: {
    previous: "前へ",
    next: "次へ",
    nextLocked: "早口言葉（はやくちことば）で60点いじょうとると、次のペアにすすめるよ！",
  },
};

const linkClassName =
  "inline-flex h-11 items-center border border-white bg-white px-4 text-sm font-semibold whitespace-nowrap text-black transition hover:bg-black hover:text-white focus:outline-none";

const lockedClassName =
  "inline-flex h-11 cursor-not-allowed items-center border border-white/10 bg-white/10 px-4 text-sm font-semibold whitespace-nowrap text-white/25";

export function LessonStepNav({
  back,
  previous,
  next,
  lockNextUntilPairDone,
}: LessonStepNavProps) {
  const { language, text } = useLanguage();
  const copy = stepNavCopy[language];
  const pairDone = usePairCompleted(lockNextUntilPairDone);
  const nextLocked = Boolean(next && lockNextUntilPairDone && !pairDone);

  return (
    <nav className="space-y-6 border-t border-white/10 pt-8">
      <div className="flex items-center justify-between gap-3">
        {previous ? (
          <Link href={previous.href} className={linkClassName}>
            ← <span className="ml-1 hidden sm:inline">{copy.previous}: </span>
            <span className="ml-1">{text(previous.label)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && nextLocked ? (
          <span aria-disabled="true" className={`${lockedClassName} ml-auto`}>
            <span aria-hidden="true" className="mr-2">
              🔒
            </span>
            <span className="mr-1 hidden sm:inline">{copy.next}: </span>
            <span className="mr-1">{text(next.label)}</span> →
          </span>
        ) : next ? (
          <Link href={next.href} className={`${linkClassName} ml-auto`}>
            <span className="mr-1 hidden sm:inline">{copy.next}: </span>
            <span className="mr-1">{text(next.label)}</span> →
          </Link>
        ) : null}
      </div>
      {nextLocked ? (
        <p className="text-right text-sm leading-6 text-white/50">
          {copy.nextLocked}
        </p>
      ) : null}
      <Link
        href={back.href}
        className="inline-flex text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
      >
        ← {text(back.label)}
      </Link>
    </nav>
  );
}
