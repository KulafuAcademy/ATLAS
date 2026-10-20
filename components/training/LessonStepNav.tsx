"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";

type StepLink = {
  href: string;
  label: LocalizedText;
} | null;

type LessonStepNavProps = {
  back: { href: string; label: LocalizedText };
  previous: StepLink;
  next: StepLink;
};

const stepNavCopy = {
  en: { previous: "Previous", next: "Next" },
  ja: { previous: "前へ", next: "次へ" },
};

const linkClassName =
  "inline-flex h-11 items-center border border-white bg-white px-4 text-sm font-semibold whitespace-nowrap text-black transition hover:bg-black hover:text-white focus:outline-none";

export function LessonStepNav({ back, previous, next }: LessonStepNavProps) {
  const { language, text } = useLanguage();
  const copy = stepNavCopy[language];

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
        {next ? (
          <Link href={next.href} className={`${linkClassName} ml-auto`}>
            <span className="mr-1 hidden sm:inline">{copy.next}: </span>
            <span className="mr-1">{text(next.label)}</span> →
          </Link>
        ) : null}
      </div>
      <Link
        href={back.href}
        className="inline-flex text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
      >
        ← {text(back.label)}
      </Link>
    </nav>
  );
}
