import { bVsVWords } from "./b-v";
import { finalConsonantWords } from "./final-consonants";
import { rVsLWords } from "./r-vs-l";
import { sVsShWords } from "./s-sh";
import { shortIVsLongEWords } from "./short-i-long-e";
import { thWords } from "./th";
import type { WordDetail } from "./types";

export type { WordDetail, WordSense } from "./types";

// Detail pages for the pair words, one file per sound focus. Words without an
// entry keep their popover and don't link anywhere.
//
// Written for young Japanese learners: short, everyday sentences (school, home,
// food, animals), mostly present tense, with only one or two basic meanings per word.
//
// A word gets one page even if it is in pairs from several sound focuses
// (seat: s-sh, short-i-long-e, final-consonants). Put it only in the first
// file it belongs to; the check below fails if it is added twice.
export const wordDetails: WordDetail[] = [
  ...rVsLWords,
  ...bVsVWords,
  ...sVsShWords,
  ...shortIVsLongEWords,
  ...thWords,
  ...finalConsonantWords,
];

const seen = new Map<string, string>();
for (const detail of wordDetails) {
  for (const form of [detail.word, ...(detail.forms ?? [])]) {
    const owner = seen.get(form);
    if (owner) {
      throw new Error(`wordDetails: "${form}" is listed under both "${owner}" and "${detail.word}"`);
    }
    seen.set(form, detail.word);
  }
}
