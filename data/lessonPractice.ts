type Localized = { en: string; ja: string };

export type ComparePair = {
  // left is sounds[0] of the lesson guide, right is sounds[1].
  left: string;
  leftHint: Localized;
  right: string;
  rightHint: Localized;
};

export type LessonPractice = {
  compare: {
    description: Localized;
    pairs: ComparePair[];
  };
  sentences: string[];
};

export const lessonPractice: Record<string, LessonPractice> = {
  "r-vs-l": {
    compare: {
      description: {
        en: "Play each word and notice whether the tongue touches or stays free.",
        ja: "再生ボタンを押し、舌が触れる音か触れない音かに注目しましょう。",
      },
      pairs: [
        {
          left: "right",
          leftHint: { en: "direction", ja: "右" },
          right: "light",
          rightHint: { en: "illumination", ja: "光" },
        },
        {
          left: "rock",
          leftHint: { en: "stone", ja: "岩" },
          right: "lock",
          rightHint: { en: "door lock", ja: "鍵" },
        },
        {
          left: "road",
          leftHint: { en: "street", ja: "道" },
          right: "load",
          rightHint: { en: "cargo", ja: "積む" },
        },
        {
          left: "rice",
          leftHint: { en: "grain", ja: "米" },
          right: "lice",
          rightHint: { en: "insects", ja: "シラミ" },
        },
      ],
    },
    sentences: ["The red light is on.", "Laura likes rice.", "Turn right on the long road."],
  },
  "b-v": {
    compare: {
      description: {
        en: "Play each word and notice whether the lips close or the teeth touch the lip.",
        ja: "再生ボタンを押し、唇を閉じる音か、歯が下唇に触れる音かに注目しましょう。",
      },
      pairs: [
        {
          left: "berry",
          leftHint: { en: "fruit", ja: "ベリー" },
          right: "very",
          rightHint: { en: "extremely", ja: "とても" },
        },
        {
          left: "boat",
          leftHint: { en: "ship", ja: "ボート" },
          right: "vote",
          rightHint: { en: "election", ja: "投票" },
        },
        {
          left: "best",
          leftHint: { en: "top", ja: "最高" },
          right: "vest",
          rightHint: { en: "clothing", ja: "ベスト" },
        },
        {
          left: "ban",
          leftHint: { en: "forbid", ja: "禁止" },
          right: "van",
          rightHint: { en: "vehicle", ja: "バン" },
        },
      ],
    },
    sentences: ["The van is very big.", "Vote for the best boat.", "Bring a vest to the beach."],
  },
  "s-sh": {
    compare: {
      description: {
        en: "Play each word and notice whether the air is thin and sharp or wide and soft.",
        ja: "再生ボタンを押し、息が細く鋭いか、広くやわらかいかに注目しましょう。",
      },
      pairs: [
        {
          left: "see",
          leftHint: { en: "look", ja: "見る" },
          right: "she",
          rightHint: { en: "her", ja: "彼女" },
        },
        {
          left: "sip",
          leftHint: { en: "small drink", ja: "すする" },
          right: "ship",
          rightHint: { en: "boat", ja: "船" },
        },
        {
          left: "seat",
          leftHint: { en: "chair", ja: "席" },
          right: "sheet",
          rightHint: { en: "paper", ja: "シート" },
        },
        {
          left: "sell",
          leftHint: { en: "trade", ja: "売る" },
          right: "shell",
          rightHint: { en: "seashell", ja: "貝殻" },
        },
      ],
    },
    sentences: ["She sells sea shells.", "Sit on the ship's seat.", "Save the shoes for Sunday."],
  },
  "short-i-long-e": {
    compare: {
      description: {
        en: "Play each word and notice whether the vowel is short and relaxed or long and tense.",
        ja: "再生ボタンを押し、母音が短くゆるいか、長く緊張しているかに注目しましょう。",
      },
      pairs: [
        {
          left: "sit",
          leftHint: { en: "be seated", ja: "座る" },
          right: "seat",
          rightHint: { en: "chair", ja: "席" },
        },
        {
          left: "ship",
          leftHint: { en: "boat", ja: "船" },
          right: "sheep",
          rightHint: { en: "animal", ja: "羊" },
        },
        {
          left: "live",
          leftHint: { en: "reside", ja: "住む" },
          right: "leave",
          rightHint: { en: "go away", ja: "去る" },
        },
        {
          left: "fill",
          leftHint: { en: "make full", ja: "満たす" },
          right: "feel",
          rightHint: { en: "sense", ja: "感じる" },
        },
      ],
    },
    sentences: ["Please sit in this seat.", "The sheep is on the ship.", "I feel it will fit."],
  },
  th: {
    compare: {
      description: {
        en: "Play each word and notice whether the tongue is between the teeth or behind them.",
        ja: "再生ボタンを押し、舌が歯の間にあるか、歯の裏にあるかに注目しましょう。",
      },
      pairs: [
        {
          left: "think",
          leftHint: { en: "consider", ja: "考える" },
          right: "sink",
          rightHint: { en: "basin", ja: "流し" },
        },
        {
          left: "thin",
          leftHint: { en: "not thick", ja: "薄い" },
          right: "sin",
          rightHint: { en: "wrongdoing", ja: "罪" },
        },
        {
          left: "thank",
          leftHint: { en: "be grateful", ja: "感謝する" },
          right: "sank",
          rightHint: { en: "went down", ja: "沈んだ" },
        },
        {
          left: "thick",
          leftHint: { en: "wide", ja: "厚い" },
          right: "sick",
          rightHint: { en: "ill", ja: "病気" },
        },
      ],
    },
    sentences: ["Thank you for the thin book.", "I think the ship sank.", "Three thick sandwiches, please."],
  },
  "final-consonants": {
    compare: {
      description: {
        en: "Play each word and notice how the last sound ends without an extra vowel.",
        ja: "再生ボタンを押し、最後の音が余分な母音なしで終わることに注目しましょう。",
      },
      pairs: [
        {
          left: "cap",
          leftHint: { en: "hat", ja: "帽子" },
          right: "cab",
          rightHint: { en: "taxi", ja: "タクシー" },
        },
        {
          left: "bet",
          leftHint: { en: "wager", ja: "賭ける" },
          right: "bed",
          rightHint: { en: "for sleeping", ja: "ベッド" },
        },
        {
          left: "back",
          leftHint: { en: "rear", ja: "後ろ" },
          right: "bag",
          rightHint: { en: "carrier", ja: "かばん" },
        },
        {
          left: "rice",
          leftHint: { en: "grain", ja: "米" },
          right: "rise",
          rightHint: { en: "go up", ja: "上がる" },
        },
      ],
    },
    sentences: ["Put the cap in the bag.", "The cat sat on the bed.", "Lock the back door."],
  },
};
