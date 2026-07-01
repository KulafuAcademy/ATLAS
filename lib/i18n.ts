import type { IpaSymbol } from "@/types/ipa";

export type Language = "en" | "ja";

export type LocalizedText = string | {
  en: string;
  ja: string;
};

type SymbolCopy = {
  label: string;
  description: string;
  notes: string;
};

export function resolveText(text: LocalizedText, language: Language) {
  return typeof text === "string" ? text : text[language];
}

export function formatCategory(category: IpaSymbol["category"], language: Language) {
  if (language === "ja") {
    return category === "vowel" ? "母音" : "子音";
  }

  return category;
}

export function formatBooleanRounded(rounded: boolean, language: Language) {
  if (language === "ja") {
    return rounded ? "円唇" : "非円唇";
  }

  return rounded ? "rounded" : "unrounded";
}

export function formatTerm(term: string, language: Language) {
  if (language === "en") {
    return term;
  }

  return termTranslations[term] ?? term;
}

export function getSymbolCopy(symbol: IpaSymbol, language: Language) {
  if (language === "en") {
    return {
      label: symbol.label,
      description: symbol.description,
      notes: symbol.notes,
    };
  }

  return symbolCopyJa[symbol.slug] ?? {
    label: symbol.label,
    description: symbol.description,
    notes: symbol.notes,
  };
}

export const uiText = {
  navLearn: { en: "Learn", ja: "学習" },
  navVowels: { en: "Vowels", ja: "母音" },
  navConsonants: { en: "Consonants", ja: "子音" },
  level: { en: "Level", ja: "レベル" },
  search: { en: "Search", ja: "検索" },
  searchPlaceholder: { en: "symbol, word, label", ja: "記号・単語・説明" },
  backness: { en: "Backness", ja: "前後位置" },
  height: { en: "Height", ja: "高さ" },
  place: { en: "Place", ja: "調音位置" },
  manner: { en: "Manner", ja: "調音方法" },
  all: { en: "All", ja: "すべて" },
  showing: { en: "Showing", ja: "表示中" },
  of: { en: "of", ja: "/" },
  reset: { en: "Reset", ja: "リセット" },
  noEntries: {
    en: "No entries match the current filters.",
    ja: "現在の条件に一致する項目はありません。",
  },
  class: { en: "Class", ja: "分類" },
  symbol: { en: "Symbol", ja: "記号" },
  study: { en: "Study", ja: "学習" },
  learningPath: { en: "Learning Path", ja: "学習順序" },
  viewPath: { en: "View path", ja: "学習順序を見る" },
  whatToNotice: { en: "What To Notice", ja: "注目ポイント" },
  exampleWords: { en: "Example Words", ja: "例語" },
  articulation: { en: "Articulation", ja: "調音" },
  notes: { en: "Notes", ja: "メモ" },
  compare: { en: "Compare", ja: "比較" },
  nearbySounds: { en: "Nearby sounds", ja: "近い音" },
  backToVowels: { en: "Back to vowels", ja: "母音一覧へ戻る" },
  backToConsonants: { en: "Back to consonants", ja: "子音一覧へ戻る" },
  next: { en: "Next", ja: "次" },
};

const termTranslations: Record<string, string> = {
  All: "すべて",
  all: "すべて",
  foundation: "基礎",
  contrast: "対比",
  advanced: "発展",
  vowel: "母音",
  consonant: "子音",
  front: "前舌",
  central: "中舌",
  back: "後舌",
  close: "狭",
  "near-close": "準狭",
  "close-mid": "半狭",
  mid: "中",
  "open-mid": "半広",
  "near-open": "準広",
  open: "広",
  bilabial: "両唇",
  labiodental: "唇歯",
  dental: "歯",
  alveolar: "歯茎",
  postalveolar: "後部歯茎",
  palatal: "硬口蓋",
  velar: "軟口蓋",
  glottal: "声門",
  stop: "破裂音",
  fricative: "摩擦音",
  affricate: "破擦音",
  nasal: "鼻音",
  approximant: "接近音",
  "lateral approximant": "側面接近音",
  voiceless: "無声",
  voiced: "有声",
};

const symbolCopyJa: Record<string, SymbolCopy> = {
  i: {
    label: "FLEECE の母音",
    description: "see のような語に現れる、前舌・狭・非円唇の母音です。",
    notes: "学習用辞書では、長めで緊張した母音として /i:/ と書かれることがよくあります。",
  },
  ih: {
    label: "KIT の母音",
    description: "sit のような語に現れる、前舌・準狭・非円唇の母音です。",
    notes: "/i:/ との違いを聞き分けると、英語の母音理解がかなり楽になります。",
  },
  e: {
    label: "DRESS の母音",
    description: "bed のような語に現れる、前舌・半狭・非円唇の母音です。",
    notes: "アクセントや表記体系によっては /ɛ/ と書かれることもあります。",
  },
  ae: {
    label: "TRAP の母音",
    description: "cat のような語に現れる、前舌・準広・非円唇の母音です。",
    notes: "URLでは IPA 記号 æ の代わりに ae を使っています。",
  },
  schwa: {
    label: "シュワー",
    description: "about などの弱い音節によく出る、中舌・中の母音です。",
    notes: "英語で非常に頻度が高く、自然なリズムを理解するうえで重要です。",
  },
  uh: {
    label: "STRUT の母音",
    description: "cup のような語に現れる、中舌・半広・非円唇の母音です。",
    notes: "綴りから予測しづらいため、IPAで確認する価値が高い音です。",
  },
  aa: {
    label: "PALM の母音",
    description: "father などに現れる、後舌・広・非円唇の母音です。",
    notes: "アクセント差が出やすいので、将来的には変種ごとに分けられます。",
  },
  aw: {
    label: "THOUGHT の母音",
    description: "law のような語に現れる、後舌・半広・円唇の母音です。",
    notes: "アクセントによっては他の後舌母音と統合されることがあります。",
  },
  uu: {
    label: "FOOT の母音",
    description: "good のような語に現れる、後舌・準狭・円唇の母音です。",
    notes: "/u:/ より短く、力の抜けた母音として扱うと理解しやすいです。",
  },
  u: {
    label: "GOOSE の母音",
    description: "food のような語に現れる、後舌・狭・円唇の母音です。",
    notes: "多くのアクセントでは、IPA表の位置より前寄りに発音されます。",
  },
  p: {
    label: "無声両唇破裂音",
    description: "上下の唇を閉じて作る、無声の破裂音です。",
    notes: "英語の /p/ は、強勢のある音節の先頭で息が強く出ることがあります。",
  },
  b: {
    label: "有声両唇破裂音",
    description: "上下の唇を閉じて作る、有声の破裂音です。",
    notes: "/p/ と同じ位置・方法ですが、声帯の振動が違います。",
  },
  t: {
    label: "無声歯茎破裂音",
    description: "舌先を歯茎付近に当てて作る、無声の破裂音です。",
    notes: "アクセントや語中位置によって実際の音が大きく変わります。",
  },
  d: {
    label: "有声歯茎破裂音",
    description: "舌先を歯茎付近に当てて作る、有声の破裂音です。",
    notes: "/t/ と対にして、有声・無声の違いを見るのに向いています。",
  },
  k: {
    label: "無声軟口蓋破裂音",
    description: "舌の奥を軟口蓋に近づけて作る、無声の破裂音です。",
    notes: "英語の綴りでは c, k, ck, ch などで表されます。",
  },
  g: {
    label: "有声軟口蓋破裂音",
    description: "舌の奥を軟口蓋に近づけて作る、有声の破裂音です。",
    notes: "/k/ と同じ位置・方法ですが、声帯の振動が違います。",
  },
  f: {
    label: "無声唇歯摩擦音",
    description: "下唇と上の歯で作る、無声の摩擦音です。",
    notes: "綴りでは f, ff, ph, gh などで表されます。",
  },
  v: {
    label: "有声唇歯摩擦音",
    description: "下唇と上の歯で作る、有声の摩擦音です。",
    notes: "/f/ と対比すると、有声・無声の違いが分かりやすくなります。",
  },
  th: {
    label: "無声歯摩擦音",
    description: "英語の th によく現れる、無声の歯摩擦音です。",
    notes: "多くの言語では珍しい音なので、重点的に練習する価値があります。",
  },
  dh: {
    label: "有声歯摩擦音",
    description: "英語の th によく現れる、有声の歯摩擦音です。",
    notes: "/θ/ と同じ位置・方法ですが、声帯の振動が違います。",
  },
  s: {
    label: "無声歯茎摩擦音",
    description: "歯茎付近で作る、無声の摩擦音です。",
    notes: "/z/ と対にして、有声・無声を確認しやすい音です。",
  },
  z: {
    label: "有声歯茎摩擦音",
    description: "歯茎付近で作る、有声の摩擦音です。",
    notes: "複数形や三単現の語尾でよく現れます。",
  },
  sh: {
    label: "無声後部歯茎摩擦音",
    description: "she のような語に現れる、無声の摩擦音です。",
    notes: "綴りが多様なので、IPA記号で見ると安定して理解できます。",
  },
  zh: {
    label: "有声後部歯茎摩擦音",
    description: "vision のような語に現れる、有声の摩擦音です。",
    notes: "/ʃ/ より頻度は低いですが、辞書読みには重要です。",
  },
  ch: {
    label: "無声後部歯茎破擦音",
    description: "破裂音として始まり、摩擦音として解放される音です。",
    notes: "英語では ch や tch の綴りでよく表されます。",
  },
  j: {
    label: "有声後部歯茎破擦音",
    description: "judge のような語に現れる、有声の破擦音です。",
    notes: "j, g, ge, dge などの綴りで現れます。",
  },
  h: {
    label: "無声声門摩擦音",
    description: "声門で作られる、無声の摩擦音です。",
    notes: "弱く発音され、アクセントによっては消えることがあります。",
  },
  m: {
    label: "有声両唇鼻音",
    description: "上下の唇を閉じ、鼻から空気を通して作る音です。",
    notes: "鼻音では、空気が口ではなく鼻へ流れます。",
  },
  n: {
    label: "有声歯茎鼻音",
    description: "舌先を歯茎付近に当てて作る、有声の鼻音です。",
    notes: "より奥で作る /ŋ/ と比較すると整理しやすいです。",
  },
  ng: {
    label: "有声軟口蓋鼻音",
    description: "舌の奥を軟口蓋に近づけて作る、有声の鼻音です。",
    notes: "ng の綴りでよく現れる音です。",
  },
  l: {
    label: "有声歯茎側面接近音",
    description: "舌の横から空気を通して作る、有声の子音です。",
    notes: "英語では位置やアクセントによって light l / dark l の違いがあります。",
  },
  r: {
    label: "有声後部歯茎接近音",
    description: "多くの英語アクセントで r として使われる接近音です。",
    notes: "英語の r はアクセント差が非常に大きい音です。",
  },
  w: {
    label: "有声軟口蓋接近音",
    description: "we のような語に現れる、円唇性を伴う接近音です。",
    notes: "学習用の簡易分類として軟口蓋接近音に置いています。",
  },
  y: {
    label: "有声硬口蓋接近音",
    description: "yes の y の音を表す、有声の接近音です。",
    notes: "IPAでは /j/ が英語 yes の y 音を表します。",
  },
};
