"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";

type PageHeaderProps = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  const { text } = useLanguage();

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
