import type { WordDetail } from "./types";

// Final consonant pair words.
// rice, lock (r-vs-l.ts), bat, bet, robe (b-v.ts), save, seat (s-sh.ts),
// pick, hit, leave (short-i-long-e.ts) already have a page.
export const finalConsonantWords: WordDetail[] = [
  {
    word: "cap",
    forms: ["caps"],
    senses: [
      {
        type: "noun",
        image: "/images/words/cap.svg",
        meaning: { en: "a soft hat with a part in front for shade", ja: "ぼうし(キャップ)" },
        examples: [
          { en: "Put the cap in the bag.", ja: "ぼうしをかばんに入れてね。" },
          { en: "I wear a cap in summer.", ja: "夏はキャップをかぶります。" },
        ],
      },
    ],
  },
  {
    word: "cab",
    forms: ["cabs"],
    senses: [
      {
        type: "noun",
        image: "/images/words/cab.svg",
        meaning: { en: "a car that you pay to ride in; a taxi", ja: "タクシー" },
        examples: [
          { en: "Let's take a cab.", ja: "タクシーに乗ろう。" },
          { en: "The cab is yellow.", ja: "そのタクシーは黄色です。" },
        ],
      },
    ],
  },
  {
    word: "back",
    senses: [
      {
        type: "noun",
        meaning: { en: "the part of your body behind you, from your neck to your waist", ja: "背中" },
        examples: [
          { en: "My back hurts.", ja: "背中が痛いです。" },
          { en: "Carry the bag on your back.", ja: "かばんを背負ってね。" },
        ],
      },
      {
        type: "adjective",
        meaning: { en: "at the back; not at the front", ja: "後ろの、うらの" },
        examples: [
          { en: "Lock the back door.", ja: "うらのドアにかぎをかけてね。" },
          { en: "I sit in the back seat.", ja: "後ろの席にすわります。" },
        ],
      },
    ],
  },
  {
    word: "bag",
    forms: ["bags"],
    senses: [
      {
        type: "noun",
        image: "/images/words/bag.svg",
        meaning: { en: "a thing for carrying your things", ja: "かばん、ふくろ" },
        examples: [
          { en: "Put the cap in the bag.", ja: "ぼうしをかばんに入れてね。" },
          { en: "My school bag is heavy.", ja: "学校のかばんは重いです。" },
        ],
      },
    ],
  },
  {
    word: "rise",
    forms: ["rises"],
    senses: [
      {
        type: "verb",
        meaning: { en: "go up", ja: "のぼる、上がる" },
        examples: [
          { en: "The sun rises in the east.", ja: "太陽は東からのぼります。" },
          { en: "Watch the balloon rise.", ja: "風船が上がっていくのを見て。" },
        ],
      },
    ],
  },
  {
    word: "pig",
    forms: ["pigs"],
    senses: [
      {
        type: "noun",
        image: "/images/words/pig.svg",
        meaning: { en: "a pink farm animal with a round nose", ja: "ブタ" },
        examples: [
          { en: "The pig is pink.", ja: "ブタはピンク色です。" },
          { en: "Pigs like to play in mud.", ja: "ブタはどろの中で遊ぶのが好きです。" },
        ],
      },
    ],
  },
  {
    word: "bed",
    forms: ["beds"],
    senses: [
      {
        type: "noun",
        image: "/images/words/bed.svg",
        meaning: { en: "a piece of furniture you sleep on", ja: "ベッド" },
        examples: [
          { en: "The cat sat on the bed.", ja: "ねこがベッドの上にすわりました。" },
          { en: "Time for bed!", ja: "ねる時間だよ！" },
        ],
      },
    ],
  },
  {
    word: "leaf",
    forms: ["leaves"],
    senses: [
      {
        type: "noun",
        image: "/images/words/leaf.svg",
        meaning: { en: "a flat, green part of a plant or tree", ja: "葉っぱ" },
        examples: [
          { en: "A leaf falls from the tree.", ja: "木から葉っぱが落ちます。" },
          { en: "The leaves turn red in fall.", ja: "秋には葉っぱが赤くなります。" },
        ],
      },
    ],
  },
  {
    word: "safe",
    senses: [
      {
        type: "adjective",
        meaning: { en: "not in danger", ja: "安全な" },
        examples: [
          { en: "You are safe now.", ja: "もう安全だよ。" },
          { en: "Keep your money in a safe place.", ja: "お金は安全な場所にしまってね。" },
        ],
      },
    ],
  },
  {
    word: "rope",
    forms: ["ropes"],
    senses: [
      {
        type: "noun",
        image: "/images/words/rope.svg",
        meaning: { en: "a long, thick string", ja: "ロープ、つな" },
        examples: [
          { en: "Hold the rope tight.", ja: "ロープをしっかりにぎってね。" },
          { en: "We play jump rope.", ja: "なわとびをして遊びます。" },
        ],
      },
    ],
  },
  {
    word: "seed",
    forms: ["seeds"],
    senses: [
      {
        type: "noun",
        image: "/images/words/seed.svg",
        meaning: { en: "the small part of a plant that a new plant grows from", ja: "種" },
        examples: [
          { en: "Plant the seed in the ground.", ja: "種を土にうえてね。" },
          { en: "Watermelons have black seeds.", ja: "スイカには黒い種があります。" },
        ],
      },
    ],
  },
  {
    word: "cart",
    forms: ["carts"],
    senses: [
      {
        type: "noun",
        image: "/images/words/cart.svg",
        meaning: { en: "a basket on wheels that you push in a shop", ja: "カート" },
        examples: [
          { en: "Put the milk in the cart.", ja: "牛乳をカートに入れてね。" },
          { en: "Can I push the cart?", ja: "カートをおしてもいい？" },
        ],
      },
    ],
  },
  {
    word: "card",
    forms: ["cards"],
    senses: [
      {
        type: "noun",
        image: "/images/words/card.svg",
        meaning: { en: "a small, flat piece of thick paper or plastic", ja: "カード" },
        examples: [
          { en: "I write a birthday card.", ja: "お誕生日カードを書きます。" },
          { en: "Let's play cards.", ja: "トランプをしよう。" },
        ],
      },
    ],
  },
  {
    word: "dock",
    forms: ["docks"],
    senses: [
      {
        type: "noun",
        image: "/images/words/dock.svg",
        meaning: { en: "a place where boats stop next to the land", ja: "船着き場、波止場" },
        examples: [
          { en: "The boat is at the dock.", ja: "ボートは船着き場にあります。" },
          { en: "We fish from the dock.", ja: "波止場から魚をつります。" },
        ],
      },
    ],
  },
  {
    word: "dog",
    forms: ["dogs"],
    senses: [
      {
        type: "noun",
        image: "/images/words/dog.svg",
        meaning: { en: "an animal that people keep as a pet; it barks", ja: "犬" },
        examples: [
          { en: "My dog likes to run.", ja: "私の犬は走るのが好きです。" },
          { en: "The dog barks at the cat.", ja: "犬がねこにほえます。" },
        ],
      },
    ],
  },
  {
    word: "log",
    forms: ["logs"],
    senses: [
      {
        type: "noun",
        image: "/images/words/log.svg",
        meaning: { en: "a thick piece of a tree that was cut down", ja: "丸太" },
        examples: [
          { en: "We sit on a log.", ja: "丸太の上にすわります。" },
          { en: "Put a log on the fire.", ja: "火に丸太をくべてね。" },
        ],
      },
    ],
  },
  {
    word: "buck",
    senses: [
      {
        type: "noun",
        meaning: { en: "a male deer or rabbit", ja: "オスのシカ(ウサギ)" },
        examples: [
          { en: "The buck has big antlers.", ja: "オスのシカには大きな角があります。" },
          { en: "A buck runs into the woods.", ja: "オスのシカが森へ走っていきます。" },
        ],
      },
    ],
  },
  {
    word: "bug",
    forms: ["bugs"],
    senses: [
      {
        type: "noun",
        image: "/images/words/bug.svg",
        meaning: { en: "a small insect", ja: "虫" },
        examples: [
          { en: "There is a bug on my arm!", ja: "うでに虫がいる！" },
          { en: "I like to look at bugs.", ja: "虫を見るのが好きです。" },
        ],
      },
    ],
  },
  {
    word: "bad",
    senses: [
      {
        type: "adjective",
        meaning: { en: "not good", ja: "悪い、よくない" },
        examples: [
          { en: "The weather is bad today.", ja: "今日は天気が悪いです。" },
          { en: "Too much candy is bad for your teeth.", ja: "あめの食べすぎは歯によくないです。" },
        ],
      },
    ],
  },
  {
    word: "hid",
    senses: [
      {
        type: "verb",
        meaning: { en: "past of \"hide\": went or put somewhere no one can see", ja: "かくれた、かくした(hideの過去形)" },
        examples: [
          { en: "The cat hid under the bed.", ja: "ねこはベッドの下にかくれました。" },
          { en: "I hid the present in my room.", ja: "プレゼントを部屋にかくしました。" },
        ],
      },
    ],
  },
  {
    word: "coat",
    forms: ["coats"],
    senses: [
      {
        type: "noun",
        image: "/images/words/coat.svg",
        meaning: { en: "warm clothing you wear over your other clothes outside", ja: "コート、上着" },
        examples: [
          { en: "Put on your coat. It's cold.", ja: "コートを着てね。寒いよ。" },
          { en: "My coat is red.", ja: "私のコートは赤いです。" },
        ],
      },
    ],
  },
  {
    word: "cod",
    senses: [
      {
        type: "noun",
        image: "/images/words/fish.svg",
        meaning: { en: "a big fish from the sea that people eat", ja: "タラ(魚)" },
        examples: [
          { en: "We eat cod for dinner.", ja: "夕ごはんにタラを食べます。" },
          { en: "Cod lives in cold seas.", ja: "タラは冷たい海にすんでいます。" },
        ],
      },
    ],
  },
  {
    word: "mat",
    forms: ["mats"],
    senses: [
      {
        type: "noun",
        image: "/images/words/mat.svg",
        meaning: { en: "a small piece of thick cloth on the floor", ja: "マット、しきもの" },
        examples: [
          { en: "Wipe your feet on the mat.", ja: "マットで足をふいてね。" },
          { en: "The cat sleeps on the mat.", ja: "ねこはマットの上でねます。" },
        ],
      },
    ],
  },
  {
    word: "mad",
    senses: [
      {
        type: "adjective",
        meaning: { en: "angry", ja: "怒った" },
        examples: [
          { en: "Mom is mad at me.", ja: "お母さんは私に怒っています。" },
          { en: "Don't be mad!", ja: "怒らないで！" },
        ],
      },
    ],
  },
  {
    word: "cup",
    forms: ["cups"],
    senses: [
      {
        type: "noun",
        image: "/images/words/cup.svg",
        meaning: { en: "a small container you drink from", ja: "カップ、コップ" },
        examples: [
          { en: "I want a cup of tea.", ja: "お茶を1ぱいほしいです。" },
          { en: "My cup is blue.", ja: "私のカップは青いです。" },
        ],
      },
    ],
  },
  {
    word: "cub",
    forms: ["cubs"],
    senses: [
      {
        type: "noun",
        meaning: { en: "a baby bear, lion, or fox", ja: "(クマやライオンなどの)赤ちゃん" },
        examples: [
          { en: "The bear cub is cute.", ja: "クマの赤ちゃんはかわいいです。" },
          { en: "The lion cubs play together.", ja: "ライオンの赤ちゃんたちがいっしょに遊びます。" },
        ],
      },
    ],
  },
  {
    word: "lap",
    forms: ["laps"],
    senses: [
      {
        type: "noun",
        meaning: { en: "the top of your legs when you sit", ja: "ひざ(すわったときの太ももの上)" },
        examples: [
          { en: "The cat sits on my lap.", ja: "ねこが私のひざの上にすわります。" },
          { en: "Put your hands in your lap.", ja: "手をひざの上においてね。" },
        ],
      },
    ],
  },
  {
    word: "lab",
    forms: ["labs"],
    senses: [
      {
        type: "noun",
        meaning: { en: "a room for science experiments", ja: "実験室、理科室" },
        examples: [
          { en: "We do science in the lab.", ja: "理科室で理科の勉強をします。" },
          { en: "Wear glasses in the lab.", ja: "実験室ではめがねをかけてね。" },
        ],
      },
    ],
  },
  {
    word: "proof",
    senses: [
      {
        type: "noun",
        meaning: { en: "something that shows that a thing is true", ja: "証拠、しょうめい" },
        examples: [
          { en: "Do you have proof?", ja: "証拠はある？" },
          { en: "This photo is proof.", ja: "この写真が証拠です。" },
        ],
      },
    ],
  },
  {
    word: "prove",
    forms: ["proves"],
    senses: [
      {
        type: "verb",
        meaning: { en: "show that something is true", ja: "証明する、本当だと示す" },
        examples: [
          { en: "Can you prove it?", ja: "それを証明できる？" },
          { en: "I will prove I can swim.", ja: "泳げるってことを見せてあげる。" },
        ],
      },
    ],
  },
];
