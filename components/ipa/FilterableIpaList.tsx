"use client";

import { useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { IpaSymbolCard } from "@/components/ipa/IpaSymbolCard";
import { formatTerm, getSymbolCopy, uiText } from "@/lib/i18n";
import type {
  ConsonantManner,
  ConsonantPlace,
  ConsonantSymbol,
  IpaSymbol,
  VowelBackness,
  VowelHeight,
  VowelSymbol,
} from "@/types/ipa";

const vowelBacknessOrder: VowelBackness[] = ["front", "central", "back"];
const vowelHeightOrder: VowelHeight[] = [
  "close",
  "near-close",
  "close-mid",
  "mid",
  "open-mid",
  "near-open",
  "open",
];

const consonantPlaceOrder: ConsonantPlace[] = [
  "bilabial",
  "labiodental",
  "dental",
  "alveolar",
  "postalveolar",
  "palatal",
  "velar",
  "glottal",
];

const consonantMannerOrder: ConsonantManner[] = [
  "stop",
  "fricative",
  "affricate",
  "nasal",
  "approximant",
  "lateral approximant",
];

type FilterableIpaListProps =
  | {
      category: "vowel";
      symbols: VowelSymbol[];
    }
  | {
      category: "consonant";
      symbols: ConsonantSymbol[];
    };

export function FilterableIpaList(props: FilterableIpaListProps) {
  const { language, text } = useLanguage();
  const [query, setQuery] = useState("");
  const [primaryFilter, setPrimaryFilter] = useState("all");
  const [secondaryFilter, setSecondaryFilter] = useState("all");

  const filteredSymbols = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (props.category === "vowel") {
      return props.symbols.filter((symbol) => {
        if (!matchesSearch(symbol, normalizedQuery)) {
          return false;
        }

        const matchesBackness =
          primaryFilter === "all" || symbol.backness === primaryFilter;
        const matchesHeight =
          secondaryFilter === "all" || symbol.height === secondaryFilter;

        return matchesBackness && matchesHeight;
      });
    }

    return props.symbols.filter((symbol) => {
      if (!matchesSearch(symbol, normalizedQuery)) {
        return false;
      }

      const matchesPlace =
        primaryFilter === "all" || symbol.place === primaryFilter;
      const matchesManner =
        secondaryFilter === "all" || symbol.manner === secondaryFilter;

      return matchesPlace && matchesManner;
    });
  }, [props, query, primaryFilter, secondaryFilter]);

  const primaryOptions =
    props.category === "vowel" ? vowelBacknessOrder : consonantPlaceOrder;
  const secondaryOptions =
    props.category === "vowel" ? vowelHeightOrder : consonantMannerOrder;

  return (
    <div className="space-y-10">
      <section className="grid gap-4 border border-white/10 p-4 md:grid-cols-[1fr_220px_220px]">
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

        <FilterSelect
          label={text(props.category === "vowel" ? uiText.backness : uiText.place)}
          value={primaryFilter}
          options={primaryOptions}
          onChange={setPrimaryFilter}
          language={language}
        />

        <FilterSelect
          label={text(props.category === "vowel" ? uiText.height : uiText.manner)}
          value={secondaryFilter}
          options={secondaryOptions}
          onChange={setSecondaryFilter}
          language={language}
        />
      </section>

      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <p className="text-sm text-white/50">
          {text(uiText.showing)}{" "}
          <span className="font-medium text-white">{filteredSymbols.length}</span>{" "}
          {text(uiText.of)}{" "}
          <span className="font-medium text-white">{props.symbols.length}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setPrimaryFilter("all");
            setSecondaryFilter("all");
          }}
          className="text-sm font-medium text-white/65 transition hover:text-white"
        >
          {text(uiText.reset)}
        </button>
      </div>

      {filteredSymbols.length > 0 ? (
        props.category === "vowel" ? (
          <VowelGroups
            symbols={filteredSymbols as VowelSymbol[]}
            language={language}
          />
        ) : (
          <ConsonantGroups
            symbols={filteredSymbols as ConsonantSymbol[]}
            language={language}
          />
        )
      ) : (
        <div className="border border-white/10 p-8 text-white/55">
          {text(uiText.noEntries)}
        </div>
      )}
    </div>
  );
}

function matchesSearch(symbol: IpaSymbol, normalizedQuery: string) {
  const jaCopy = getSymbolCopy(symbol, "ja");
  const searchableText = [
    symbol.symbol,
    symbol.slug,
    symbol.label,
    symbol.description,
    symbol.notes,
    jaCopy.label,
    jaCopy.description,
    jaCopy.notes,
    ...symbol.exampleWords,
  ]
    .join(" ")
    .toLowerCase();

  return (
    normalizedQuery.length === 0 || searchableText.includes(normalizedQuery)
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  language: "en" | "ja";
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
  language,
}: FilterSelectProps) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.22em] text-white/35">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full border border-white/10 bg-black px-4 capitalize text-white outline-none transition focus:border-white/50"
      >
        <option value="all">{formatTerm("All", language)}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatTerm(option, language)}
          </option>
        ))}
      </select>
    </label>
  );
}

function VowelGroups({
  symbols,
  language,
}: {
  symbols: VowelSymbol[];
  language: "en" | "ja";
}) {
  const groups = vowelBacknessOrder
    .map((backness) => ({
      title:
        language === "ja"
          ? `${formatTerm(backness, language)}母音`
          : `${backness} vowels`,
      description:
        language === "ja"
          ? `${formatTerm(backness, language)}の範囲で、舌の高さごとに整理しています。`
          : `Grouped by tongue height within the ${backness} area.`,
      rows: vowelHeightOrder
        .map((height) => ({
          label: formatTerm(height, language),
          symbols: symbols.filter(
            (symbol) =>
              symbol.backness === backness && symbol.height === height,
          ),
        }))
        .filter((row) => row.symbols.length > 0),
    }))
    .filter((group) => group.rows.length > 0);

  return <ClassifiedGroups groups={groups} />;
}

function ConsonantGroups({
  symbols,
  language,
}: {
  symbols: ConsonantSymbol[];
  language: "en" | "ja";
}) {
  const groups = consonantPlaceOrder
    .map((place) => ({
      title:
        language === "ja"
          ? `${formatTerm(place, language)}子音`
          : `${place} consonants`,
      description:
        language === "ja"
          ? `${formatTerm(place, language)}で作る音を、調音方法ごとに整理しています。`
          : `Grouped by manner for sounds made at the ${place} place of articulation.`,
      rows: consonantMannerOrder
        .map((manner) => ({
          label: formatTerm(manner, language),
          symbols: symbols.filter(
            (symbol) => symbol.place === place && symbol.manner === manner,
          ),
        }))
        .filter((row) => row.symbols.length > 0),
    }))
    .filter((group) => group.rows.length > 0);

  return <ClassifiedGroups groups={groups} />;
}

type ClassifiedGroupsProps = {
  groups: {
    title: string;
    description: string;
    rows: {
      label: string;
      symbols: IpaSymbol[];
    }[];
  }[];
};

function ClassifiedGroups({ groups }: ClassifiedGroupsProps) {
  const { text } = useLanguage();

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.title} className="space-y-6">
          <div className="border-t border-white/10 pt-8">
            <p className="text-sm uppercase tracking-[0.28em] text-white/35">
              {group.title}
            </p>
            <p className="mt-3 max-w-2xl leading-7 text-white/55">
              {group.description}
            </p>
          </div>

          <div className="space-y-6">
            {group.rows.map((row) => (
              <div
                key={`${group.title}-${row.label}`}
                className="grid gap-4 lg:grid-cols-[160px_1fr]"
              >
                <div className="border border-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                    {text(uiText.class)}
                  </p>
                  <p className="mt-2 text-lg capitalize text-white">
                    {row.label}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {row.symbols.map((symbol) => (
                    <IpaSymbolCard key={symbol.slug} symbol={symbol} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
