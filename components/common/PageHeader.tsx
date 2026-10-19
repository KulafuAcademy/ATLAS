"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";

type PageHeaderProps = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  compact?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  compact = false,
}: PageHeaderProps) {
  const { text } = useLanguage();

  if (compact) {
    return (
      <section className="max-w-4xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          {text(eyebrow)}
        </p>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-white md:text-4xl">
          {text(title)}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/55">
          {text(description)}
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl space-y-6">
      <p className="text-sm uppercase tracking-[0.32em] text-white/40">
        {text(eyebrow)}
      </p>
      <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white md:text-7xl">
        {text(title)}
      </h1>
      <p className="max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
        {text(description)}
      </p>
    </section>
  );
}
