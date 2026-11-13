import { trainingSections } from "@/data/trainingSections";
import { wordDetails } from "@/data/wordDetails";

export function getWordHref(word: string) {
  return `/words/${encodeURIComponent(word)}`;
}

// Every spelling that opens a page ("lights" -> "light"), lowercase.
const pageByForm = new Map<string, string>();
for (const detail of wordDetails) {
  for (const form of [detail.word, ...(detail.forms ?? [])]) {
    pageByForm.set(form, detail.word);
  }
}

/** The detail page for a word as written in a sentence, or null when it has none. */
export function getWordHrefForForm(form: string) {
  const word = pageByForm.get(form.toLowerCase());
  return word ? getWordHref(word) : null;
}

/** The word's entry plus the minimal pair it belongs to. */
export function getWordPage(word: string) {
  const detail = wordDetails.find((entry) => entry.word === word);

  if (!detail) {
    return null;
  }

  for (const section of trainingSections) {
    for (const pair of section.pairs) {
      const isA = pair.wordA === word;

      if (isA || pair.wordB === word) {
        return {
          detail,
          section,
          pair,
          ipa: (isA ? pair.ipaA : pair.ipaB) ?? null,
          partner: {
            word: isA ? pair.wordB : pair.wordA,
            ipa: (isA ? pair.ipaB : pair.ipaA) ?? null,
            hasPage: pageByForm.get(isA ? pair.wordB : pair.wordA) !== undefined,
          },
        };
      }
    }
  }

  return null;
}
