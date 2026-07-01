"use client";

import Link from "next/link";

import { LanguageToggle } from "@/components/language/LanguageToggle";
import { useLanguage } from "@/components/language/LanguageProvider";
import { navItems } from "@/lib/navigation";
import { uiText } from "@/lib/i18n";

export function SiteHeader() {
  const { text } = useLanguage();
  const navLabels = {
    Learn: uiText.navLearn,
    Vowels: uiText.navVowels,
    Consonants: uiText.navConsonants,
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 md:px-10">
        <Link href="/" className="text-lg font-semibold tracking-[0.32em]">
          ATLAS
        </Link>
        <div className="flex items-center gap-5">
          <nav aria-label="Primary navigation" className="flex gap-5 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/60 transition hover:text-white"
              >
                {text(navLabels[item.label as keyof typeof navLabels])}
              </Link>
            ))}
          </nav>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
