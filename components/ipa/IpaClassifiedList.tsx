import { IpaSymbolCard } from "@/components/ipa/IpaSymbolCard";
import type {
  ConsonantManner,
  ConsonantPlace,
  ConsonantSymbol,
  VowelBackness,
  VowelHeight,
  VowelSymbol,
} from "@/types/ipa";

const vowelBacknessOrder: VowelBackness[] = ["front", "central", "back"];
const vowelHeightOrder: VowelHeight[] = ["close", "near-open", "open"];

const consonantPlaceOrder: ConsonantPlace[] = [
  "bilabial",
  "labiodental",
  "dental",
  "alveolar",
  "postalveolar",
  "velar",
  "glottal",
];

const consonantMannerOrder: ConsonantManner[] = [
  "stop",
  "fricative",
  "affricate",
  "nasal",
  "approximant",
];

type VowelClassifiedListProps = {
  symbols: VowelSymbol[];
};

type ConsonantClassifiedListProps = {
  symbols: ConsonantSymbol[];
};

export function VowelClassifiedList({ symbols }: VowelClassifiedListProps) {
  const groups = vowelBacknessOrder
    .map((backness) => ({
      title: `${backness} vowels`,
      description: `Grouped by tongue height within the ${backness} area.`,
      rows: vowelHeightOrder
        .map((height) => ({
          label: height,
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

export function ConsonantClassifiedList({
  symbols,
}: ConsonantClassifiedListProps) {
  const groups = consonantPlaceOrder
    .map((place) => ({
      title: `${place} consonants`,
      description: `Grouped by manner for sounds made at the ${place} place of articulation.`,
      rows: consonantMannerOrder
        .map((manner) => ({
          label: manner,
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
      symbols: (VowelSymbol | ConsonantSymbol)[];
    }[];
  }[];
};

function ClassifiedGroups({ groups }: ClassifiedGroupsProps) {
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
                    Class
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
