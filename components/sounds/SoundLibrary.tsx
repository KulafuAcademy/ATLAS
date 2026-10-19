"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import { SpeakerIcon } from "@/components/sounds/SpeakerIcon";
import { speakWord } from "@/components/sounds/speak";
import { formatCategory, getSymbolCopy, uiText } from "@/lib/i18n";
import type { IpaCategory, IpaSymbol } from "@/types/ipa";

const categoryOptions = ["all", "vowel", "consonant"] as const;

type SoundLibraryProps = {
  symbols: IpaSymbol[];
};

export function SoundLibrary({ symbols }: SoundLibraryProps) {
  const { language, text } = useLanguage();
  const [category, setCategory] = useState<IpaCategory | "all">("all");
  const [query, setQuery] = useState("");

  const visibleSymbols = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return symbols.filter((symbol) => {
      const matchesCategory = category === "all" || symbol.category === category;
      const enCopy = getSymbolCopy(symbol, "en");
      const jaCopy = getSymbolCopy(symbol, "ja");
      const searchableText = [
        symbol.symbol,
        symbol.slug,
        enCopy.label,
        enCopy.description,
        jaCopy.label,
        jaCopy.description,
        ...symbol.exampleWords,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        (normalizedQuery.length === 0 || searchableText.includes(normalizedQuery))
      );
    });
  }, [symbols, category, query]);

  return (
    <div className="space-y-10">
      <section className="grid gap-4 border border-white/10 p-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.22em] text-white/35">
            {text(uiText.search)}
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text(uiText.searchPlaceholder)}
            className="h-12 w-full border border-white/10 bg-black px-4 text-white outline-none transition placeholder:text-white/25 focus:border-white/50"
          />
        </label>

        <div className="space-y-2">
          <span className="block text-xs uppercase tracking-[0.22em] text-white/35">
            {text(uiText.class)}
          </span>
          <div className="flex gap-2">
            {categoryOptions.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`h-12 border px-4 text-sm font-medium capitalize transition ${
                  category === value
                    ? "border-white bg-white text-black"
                    : "border-white/10 text-white/60 hover:border-white/35 hover:text-white"
                }`}
              >
                {value === "all" ? text(uiText.all) : formatCategory(value, language)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="border-b border-white/10 pb-4">
        <p className="text-sm text-white/50">
          {text(uiText.showing)}{" "}
          <span className="font-medium text-white">{visibleSymbols.length}</span>{" "}
          {text(uiText.of)}{" "}
          <span className="font-medium text-white">{symbols.length}</span>
        </p>
      </div>

      {visibleSymbols.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSymbols.map((symbol) => {
            const copy = getSymbolCopy(symbol, language);

            return (
              <article
                key={symbol.slug}
                className="flex flex-col justify-between border border-white/10 p-6 transition hover:border-white/35"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/sounds/${symbol.slug}`}
                      className="text-6xl font-semibold text-white transition hover:text-white/70"
                    >
                      {symbol.symbol}
                    </Link>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                      {formatCategory(symbol.category, language)}
                    </p>
                  </div>
                  <h2 className="mt-4 text-lg font-medium text-white/85">
                    {copy.label}
                  </h2>
                  <p className="mt-2 line-clamp-2 leading-7 text-white/55">
                    {copy.description}
                  </p>
                </div>

                <div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {symbol.exampleWords.map((word) => (
                      <button
                        key={word}
                        type="button"
                        onClick={() => speakWord(word)}
                        className="inline-flex items-center gap-1.5 border border-white/10 px-2.5 py-1 text-xs text-white/65 transition hover:border-white/35 hover:text-white"
                      >
                        <SpeakerIcon className="h-3 w-3" />
                        {word}
                      </button>
                    ))}
                  </div>
                  <Link
                    href={`/sounds/${symbol.slug}`}
                    className="mt-5 inline-flex text-sm font-medium text-white underline underline-offset-4 transition hover:text-white/70"
                  >
                    {text(uiText.studySound)}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border border-white/10 p-8 text-white/55">
          {text(uiText.noEntries)}
        </div>
      )}
    </div>
  );
}
