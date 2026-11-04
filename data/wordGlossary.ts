type Localized = { en: string; ja: string };

export type WordType = "noun" | "verb" | "adjective";

export type GlossaryEntry = {
  type: WordType;
  // Only set where a picture helps; abstract words have none.
  image?: string;
  meaning: Localized;
};

export const wordTypeLabels: Record<WordType, Localized> = {
  noun: { en: "Noun", ja: "名詞" },
  verb: { en: "Verb", ja: "動詞" },
  adjective: { en: "Adjective", ja: "形容詞" },
};

// Meanings for the words in the lesson practice sentences, as they are used there.
// Keys are lowercase. Basic words (the, on, a, is...) are left out on purpose, so they get no popover.
export const wordGlossary: Record<string, GlossaryEntry> = {
  // r-vs-l
  red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
  light: { type: "noun", image: "/images/words/light.svg", meaning: { en: "something that makes a place bright", ja: "明かり" } },
  laura: { type: "noun", meaning: { en: "a person's name", ja: "人の名前(ローラ)" } },
  likes: { type: "verb", meaning: { en: "enjoys something", ja: "好きである" } },
  rice: { type: "noun", image: "/images/words/rice.svg", meaning: { en: "small white grains you cook and eat", ja: "米、ごはん" } },
  turn: { type: "verb", image: "/images/words/turn.svg", meaning: { en: "change direction", ja: "曲がる" } },
  long: { type: "adjective", meaning: { en: "not short", ja: "長い" } },
  road: { type: "noun", image: "/images/words/road.svg", meaning: { en: "a way for cars to travel on", ja: "道路" } },

  // b-v
  van: { type: "noun", image: "/images/words/van.svg", meaning: { en: "a large car for carrying things", ja: "バン(大きめの車)" } },
  big: { type: "adjective", meaning: { en: "large in size", ja: "大きい" } },
  vote: { type: "verb", meaning: { en: "choose in an election", ja: "投票する" } },
  best: { type: "adjective", meaning: { en: "better than all others", ja: "最も良い" } },
  boat: { type: "noun", image: "/images/words/boat.svg", meaning: { en: "a small ship", ja: "ボート" } },
  bring: { type: "verb", meaning: { en: "take something with you", ja: "持ってくる" } },
  vest: { type: "noun", image: "/images/words/vest.svg", meaning: { en: "clothing with no sleeves", ja: "ベスト(袖のない服)" } },
  beach: { type: "noun", image: "/images/words/beach.svg", meaning: { en: "sandy land next to the sea", ja: "浜辺" } },

  // s-sh
  sells: { type: "verb", meaning: { en: "gives something for money", ja: "売る" } },
  sea: { type: "noun", image: "/images/words/sea.svg", meaning: { en: "a large area of salt water", ja: "海" } },
  shells: { type: "noun", image: "/images/words/shell.svg", meaning: { en: "hard covers of sea animals", ja: "貝殻" } },
  sit: { type: "verb", image: "/images/words/sit.svg", meaning: { en: "rest on a chair", ja: "座る" } },
  "ship's": { type: "noun", image: "/images/words/ship.svg", meaning: { en: "belonging to a ship", ja: "船の" } },
  seat: { type: "noun", image: "/images/words/seat.svg", meaning: { en: "a place to sit", ja: "座席" } },
  save: { type: "verb", meaning: { en: "keep for later", ja: "取っておく" } },
  shoes: { type: "noun", image: "/images/words/shoes.svg", meaning: { en: "things you wear on your feet", ja: "靴" } },
  sunday: { type: "noun", meaning: { en: "the day after Saturday", ja: "日曜日" } },

  // short-i-long-e
  sheep: { type: "noun", image: "/images/words/sheep.svg", meaning: { en: "a farm animal with wool", ja: "羊" } },
  ship: { type: "noun", image: "/images/words/ship.svg", meaning: { en: "a large boat", ja: "船" } },
  feel: { type: "verb", meaning: { en: "think or believe", ja: "感じる" } },
  fit: { type: "verb", meaning: { en: "be the right size", ja: "ぴったり合う" } },

  // th
  thank: { type: "verb", meaning: { en: "say you are grateful", ja: "感謝する" } },
  thin: { type: "adjective", meaning: { en: "not thick", ja: "薄い" } },
  book: { type: "noun", image: "/images/words/book.svg", meaning: { en: "pages with words to read", ja: "本" } },
  think: { type: "verb", meaning: { en: "have an idea or opinion", ja: "思う" } },
  sank: { type: "verb", meaning: { en: "went down under water", ja: "沈んだ" } },
  thick: { type: "adjective", meaning: { en: "not thin", ja: "厚い" } },
  sandwiches: { type: "noun", image: "/images/words/sandwich.svg", meaning: { en: "food between two slices of bread", ja: "サンドイッチ" } },

  // final-consonants
  put: { type: "verb", meaning: { en: "move something to a place", ja: "置く" } },
  cap: { type: "noun", image: "/images/words/cap.svg", meaning: { en: "a soft hat", ja: "帽子" } },
  bag: { type: "noun", image: "/images/words/bag.svg", meaning: { en: "something for carrying things", ja: "かばん" } },
  cat: { type: "noun", image: "/images/words/cat.svg", meaning: { en: "a small furry pet", ja: "猫" } },
  sat: { type: "verb", image: "/images/words/sit.svg", meaning: { en: "rested on something (past of sit)", ja: "座った" } },
  bed: { type: "noun", image: "/images/words/bed.svg", meaning: { en: "furniture you sleep on", ja: "ベッド" } },
  lock: { type: "verb", image: "/images/words/lock.svg", meaning: { en: "close with a key", ja: "鍵をかける" } },
  back: { type: "adjective", meaning: { en: "at the rear", ja: "後ろの" } },
  door: { type: "noun", image: "/images/words/door.svg", meaning: { en: "what you open to enter a room", ja: "ドア" } },
};
