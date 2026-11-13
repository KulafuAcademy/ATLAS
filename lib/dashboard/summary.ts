import type { LocalizedText } from "@/lib/i18n";
import type { Stats } from "@/lib/dashboard/aggregate";
import type { RangeKey } from "@/lib/dashboard/dates";
import { formatInt, formatRate } from "@/lib/dashboard/format";

export const RANGE_LABELS: Record<RangeKey, { en: string; ja: string }> = {
  today: { en: "Today", ja: "今日" },
  week: { en: "This week", ja: "今週" },
  month: { en: "This month", ja: "今月" },
  all: { en: "All time", ja: "全期間" },
};

const PERIOD_PHRASE: Record<RangeKey, { en: string; ja: string }> = {
  today: { en: "Today", ja: "今日" },
  week: { en: "This week", ja: "今週" },
  month: { en: "This month", ja: "今月" },
  all: { en: "Since practice began", ja: "これまでに" },
};

export const PREVIOUS_PHRASE: Record<Exclude<RangeKey, "all">, { en: string; ja: string }> = {
  today: { en: "yesterday", ja: "昨日" },
  week: { en: "last week", ja: "先週" },
  month: { en: "last month", ja: "先月" },
};

type SummaryInput = {
  range: RangeKey;
  focus: string | null;
  current: Stats;
  previous: Stats | null;
  /** The lowest perfect-rate sound focus (when no focus is selected). */
  hardestFocus: string | null;
  /** The lowest perfect-rate word (when a focus is selected). */
  hardestWord: string | null;
};

/** One sentence describing the selected view, built only from the data. */
export function buildSummary(input: SummaryInput): LocalizedText | null {
  const { range, focus, current, previous } = input;
  if (current.attempts === 0) return null;

  const period = PERIOD_PHRASE[range];
  const scopeEn = focus ? ` on ${focus}` : "";
  const scopeJa = focus ? `${focus}を` : "";
  let en = `${period.en} kids made ${formatInt(current.attempts)} attempts${scopeEn}`;
  let ja = `${period.ja}、子どもたちは${scopeJa}${formatInt(current.attempts)}回練習しました`;

  if (current.rate !== null) {
    en += `; ${formatRate(current.rate)} were perfect`;
    ja += `。そのうち${formatRate(current.rate)}が満点でした`;

    if (range !== "all") {
      const prev = PREVIOUS_PHRASE[range];
      if (previous && previous.rate !== null) {
        const diff = Math.round(current.rate - previous.rate);
        if (diff === 0) {
          en += `, the same as ${prev.en}`;
          ja += `（${prev.ja}と同じ）`;
        } else {
          const points = Math.abs(diff) === 1 ? "point" : "points";
          en += `, ${diff > 0 ? "up" : "down"} ${Math.abs(diff)} ${points} from ${prev.en}`;
          ja += `（${prev.ja}より${Math.abs(diff)}ポイント${diff > 0 ? "上昇" : "低下"}）`;
        }
      } else {
        en += ` (no practice ${prev.en} to compare)`;
        ja += `（${prev.ja}は比較できる練習がありません）`;
      }
    }
  }
  en += ".";
  ja += "。";

  if (!focus && input.hardestFocus) {
    en += ` ${input.hardestFocus} is the hardest sound.`;
    ja += `いちばん難しい音は${input.hardestFocus}です。`;
  } else if (focus && input.hardestWord) {
    en += ` “${input.hardestWord}” is the hardest word.`;
    ja += `いちばん難しい単語は「${input.hardestWord}」です。`;
  }
  return { en, ja };
}
