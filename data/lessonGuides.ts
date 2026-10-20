type Localized = { en: string; ja: string };

export type SoundGuide = {
  label: string;
  title: Localized;
  steps: Localized[];
  words: string[];
};

export type LessonGuide = {
  title: Localized;
  image: string;
  sounds: [SoundGuide, SoundGuide];
};

// Each image shows the two sounds side by side: sounds[0] on the left half,
// sounds[1] on the right half.
export const lessonGuides: Record<string, LessonGuide> = {
  "r-vs-l": {
    title: { en: "Learn to pronounce R and L", ja: "RとLの発音を学ぶ" },
    image: "/images/r-l-tongue-position-mouth-only.png",
    sounds: [
      {
        label: "R",
        title: { en: "/r/ — Keep the tongue free", ja: "/r/ — 舌をどこにもつけない" },
        steps: [
          { en: "Round your lips slightly.", ja: "唇を少し丸めます。" },
          {
            en: "Lift the tongue tip toward the roof, but do not touch it.",
            ja: "舌先を上あごに近づけますが、触れさせません。",
          },
          {
            en: "Use your voice and make a steady “rrrr” sound.",
            ja: "のどを震わせて「rrrr」と音を出します。",
          },
        ],
        words: ["red", "rain", "right"],
      },
      {
        label: "L",
        title: { en: "/l/ — Touch the tongue tip", ja: "/l/ — 舌先を上あごにつける" },
        steps: [
          { en: "Keep your lips relaxed and natural.", ja: "唇は力を抜いて自然にします。" },
          {
            en: "Touch the tongue tip just behind the top front teeth.",
            ja: "舌先を上の前歯のすぐ後ろにつけます。",
          },
          {
            en: "Let air pass around the tongue and make a steady “llll” sound.",
            ja: "舌の横から空気を流して「llll」と音を出します。",
          },
        ],
        words: ["led", "lane", "light"],
      },
    ],
  },
  "b-v": {
    title: { en: "Learn to pronounce B and V", ja: "BとVの発音を学ぶ" },
    image: "/images/b-v-articulation.png",
    sounds: [
      {
        label: "B",
        title: { en: "/b/ — Close both lips", ja: "/b/ — 両唇を閉じる" },
        steps: [
          { en: "Press both lips together.", ja: "上下の唇をしっかり閉じます。" },
          {
            en: "Hold the air behind your lips for a moment.",
            ja: "唇の後ろに一瞬空気をためます。",
          },
          {
            en: "Open your lips quickly and use your voice.",
            ja: "唇をパッと開いて、声を出します。",
          },
        ],
        words: ["ban", "berry", "boat"],
      },
      {
        label: "V",
        title: { en: "/v/ — Top teeth on lower lip", ja: "/v/ — 上の歯を下唇に当てる" },
        steps: [
          {
            en: "Rest your top front teeth lightly on your lower lip.",
            ja: "上の前歯を下唇に軽く当てます。",
          },
          {
            en: "Push air through the small gap.",
            ja: "そのすき間から息を流します。",
          },
          {
            en: "Use your voice so the lip buzzes: “vvvv”.",
            ja: "声を出して、下唇を震わせながら「vvvv」と出します。",
          },
        ],
        words: ["van", "very", "vote"],
      },
    ],
  },
  "s-sh": {
    title: { en: "Learn to pronounce S and SH", ja: "SとSHの発音を学ぶ" },
    image: "/images/s-sh-articulation.png",
    sounds: [
      {
        label: "S",
        title: { en: "/s/ — Narrow, sharp air", ja: "/s/ — 細く鋭い息" },
        steps: [
          { en: "Spread your lips slightly.", ja: "唇を少し横に引きます。" },
          {
            en: "Bring the tongue tip close behind the top teeth.",
            ja: "舌先を上の歯の裏に近づけます。",
          },
          {
            en: "Send a thin stream of air: “ssss”.",
            ja: "細い息を流して「ssss」と出します。",
          },
        ],
        words: ["see", "sip", "seat"],
      },
      {
        label: "SH",
        title: { en: "/ʃ/ — Wide, soft air", ja: "/ʃ/ — 広くやわらかい息" },
        steps: [
          { en: "Round and push your lips forward.", ja: "唇を丸めて前に突き出します。" },
          {
            en: "Pull the tongue a little further back and raise it.",
            ja: "舌を少し後ろに引いて、持ち上げます。",
          },
          {
            en: "Send a wider stream of air: “shhhh”.",
            ja: "広めの息を流して「shhhh」と出します。",
          },
        ],
        words: ["she", "ship", "sheet"],
      },
    ],
  },
  "short-i-long-e": {
    title: { en: "Learn to pronounce short I and long E", ja: "短いIと長いEの発音を学ぶ" },
    image: "/images/i-e-articulation.png",
    sounds: [
      {
        label: "I",
        title: { en: "/ɪ/ — Short and relaxed", ja: "/ɪ/ — 短くリラックス" },
        steps: [
          { en: "Relax your lips and jaw.", ja: "唇とあごの力を抜きます。" },
          {
            en: "Keep the tongue a little lower and looser than for E.",
            ja: "Eよりも舌を少し低く、ゆるめにします。",
          },
          {
            en: "Make a short, quick sound: “ih”.",
            ja: "短く素早く「ɪ」と出します。",
          },
        ],
        words: ["sit", "ship", "bit"],
      },
      {
        label: "E",
        title: { en: "/iː/ — Long and tense", ja: "/iː/ — 長く緊張させる" },
        steps: [
          { en: "Spread your lips into a small smile.", ja: "軽く笑うように唇を横に引きます。" },
          {
            en: "Raise the tongue high and keep it tense.",
            ja: "舌を高く上げて、力を入れたままにします。",
          },
          {
            en: "Hold the sound longer: “eeee”.",
            ja: "音を長めに伸ばして「iː」と出します。",
          },
        ],
        words: ["seat", "sheep", "beat"],
      },
    ],
  },
  th: {
    title: { en: "Learn to pronounce TH and S", ja: "THとSの発音を学ぶ" },
    image: "/images/th-s-articulation.png",
    sounds: [
      {
        label: "TH",
        title: { en: "/θ/ — Tongue between the teeth", ja: "/θ/ — 舌を歯の間に出す" },
        steps: [
          {
            en: "Place the tongue tip lightly between your top and bottom teeth.",
            ja: "舌先を上下の歯の間に軽くはさみます。",
          },
          {
            en: "Keep the tongue soft and flat.",
            ja: "舌はやわらかく平らにします。",
          },
          {
            en: "Blow air gently over the tongue: “thhh”.",
            ja: "舌の上から息をやさしく流して「θ」と出します。",
          },
        ],
        words: ["think", "thin", "thank"],
      },
      {
        label: "S",
        title: { en: "/s/ — Tongue behind the teeth", ja: "/s/ — 舌を歯の裏に置く" },
        steps: [
          {
            en: "Keep the tongue tip behind your top teeth.",
            ja: "舌先は上の歯の裏に置きます。",
          },
          {
            en: "Bring your teeth close together.",
            ja: "上下の歯を近づけます。",
          },
          {
            en: "Send a thin stream of air: “ssss”.",
            ja: "細い息を流して「ssss」と出します。",
          },
        ],
        words: ["sink", "sin", "sank"],
      },
    ],
  },
  "final-consonants": {
    title: { en: "Learn clean word endings", ja: "語尾の子音をはっきり出す" },
    image: "/images/final-consonant-articulation.png",
    sounds: [
      {
        label: "STOP",
        title: { en: "Stop cleanly", ja: "きれいに止める" },
        steps: [
          {
            en: "Say the word and finish on the last consonant.",
            ja: "単語を言い、最後の子音で終わらせます。",
          },
          {
            en: "Close or hold the mouth in that position.",
            ja: "口はその形のまま止めます。",
          },
          {
            en: "Stop the sound there, with no extra vowel.",
            ja: "そこで音を止め、母音を足しません。",
          },
        ],
        words: ["cap", "bet", "book"],
      },
      {
        label: "+ VOWEL",
        title: { en: "Avoid adding a vowel", ja: "母音を足さない" },
        steps: [
          {
            en: "Japanese words often end in a vowel, like “kappu”.",
            ja: "日本語は「カップ」のように母音で終わりがちです。",
          },
          {
            en: "Adding “u” or “o” can change the word.",
            ja: "「u」や「o」を足すと、別の単語に聞こえることがあります。",
          },
          {
            en: "Compare: “cap” vs “cappu”, and keep the short version.",
            ja: "「cap」と「cappu」を比べて、短い方を使いましょう。",
          },
        ],
        words: ["cab", "bed", "rise"],
      },
    ],
  },
};
