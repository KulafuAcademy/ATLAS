import type { WordDetail } from "./types";

// TH pair words.
// sin is in s-sh.ts, free is in r-vs-l.ts, and "Dan" (than-dan) is a name with no page.
export const thWords: WordDetail[] = [
  {
    word: "think",
    forms: ["thinks"],
    senses: [
      {
        type: "verb",
        meaning: { en: "have an idea or opinion; use your mind", ja: "思う、考える" },
        examples: [
          { en: "I think the ship sank.", ja: "船はしずんだと思います。" },
          { en: "Let me think.", ja: "ちょっと考えさせて。" },
        ],
      },
    ],
  },
  {
    word: "sink",
    forms: ["sinks"],
    senses: [
      {
        type: "noun",
        meaning: { en: "the place in a kitchen or bathroom where you wash things", ja: "流し、洗面台" },
        examples: [
          { en: "Put the dishes in the sink.", ja: "お皿を流しに入れてね。" },
          { en: "Wash your hands at the sink.", ja: "洗面台で手をあらってね。" },
        ],
      },
      {
        type: "verb",
        meaning: { en: "go down under water", ja: "しずむ" },
        examples: [
          { en: "A rock will sink in water.", ja: "石は水にしずみます。" },
          { en: "Wood does not sink.", ja: "木はしずみません。" },
        ],
      },
    ],
  },
  {
    word: "thin",
    senses: [
      {
        type: "adjective",
        meaning: { en: "not thick", ja: "うすい" },
        examples: [
          { en: "Thank you for the thin book.", ja: "うすい本をありがとう。" },
          { en: "This paper is very thin.", ja: "この紙はとてもうすいです。" },
        ],
      },
      {
        type: "adjective",
        meaning: { en: "not fat", ja: "やせた、ほっそりした" },
        examples: [
          { en: "The cat is thin.", ja: "そのねこはやせています。" },
          { en: "He has thin arms.", ja: "彼はうでがほそいです。" },
        ],
      },
    ],
  },
  {
    word: "thank",
    forms: ["thanks", "thanked"],
    senses: [
      {
        type: "verb",
        meaning: { en: "say you are happy about what someone did for you", ja: "感謝する、お礼を言う" },
        examples: [
          { en: "Thank you for the thin book.", ja: "うすい本をありがとう。" },
          { en: "I thank my teacher.", ja: "先生にお礼を言います。" },
        ],
      },
    ],
  },
  {
    word: "sank",
    senses: [
      {
        type: "verb",
        meaning: { en: "past of \"sink\": went down under water", ja: "しずんだ(sinkの過去形)" },
        examples: [
          { en: "I think the ship sank.", ja: "船はしずんだと思います。" },
          { en: "The stone sank to the bottom.", ja: "石は底までしずみました。" },
        ],
      },
    ],
  },
  {
    word: "thick",
    senses: [
      {
        type: "adjective",
        meaning: { en: "big from one side to the other side; not thin", ja: "厚い、太い" },
        examples: [
          { en: "Three thick sandwiches, please.", ja: "厚いサンドイッチを3つください。" },
          { en: "This book is thick.", ja: "この本は厚いです。" },
        ],
      },
    ],
  },
  {
    word: "sick",
    senses: [
      {
        type: "adjective",
        meaning: { en: "not well; ill", ja: "病気の、具合が悪い" },
        examples: [
          { en: "I am sick today.", ja: "今日は具合が悪いです。" },
          { en: "My dog is sick.", ja: "私の犬は病気です。" },
        ],
      },
    ],
  },
  {
    word: "thigh",
    forms: ["thighs"],
    senses: [
      {
        type: "noun",
        meaning: { en: "the top part of your leg, above the knee", ja: "太もも" },
        examples: [
          { en: "I hurt my thigh.", ja: "太ももをいためました。" },
          { en: "Put your hands on your thighs.", ja: "手を太ももの上においてね。" },
        ],
      },
    ],
  },
  {
    word: "sight",
    senses: [
      {
        type: "noun",
        meaning: { en: "the ability to see", ja: "視力、見る力" },
        examples: [
          { en: "My grandpa has bad sight.", ja: "おじいちゃんは目が悪いです。" },
          { en: "Owls have good sight at night.", ja: "フクロウは夜でもよく見えます。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "something you see", ja: "ながめ、光景" },
        examples: [
          { en: "The snow is a pretty sight.", ja: "雪はきれいなながめです。" },
          { en: "What a sight!", ja: "なんてながめだ！" },
        ],
      },
    ],
  },
  {
    word: "thought",
    forms: ["thoughts"],
    senses: [
      {
        type: "verb",
        meaning: { en: "past of \"think\"", ja: "思った、考えた(thinkの過去形)" },
        examples: [
          { en: "I thought it was your bag.", ja: "きみのかばんだと思いました。" },
          { en: "She thought about it.", ja: "彼女はそれについて考えました。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "an idea in your mind", ja: "考え" },
        examples: [
          { en: "That is a nice thought.", ja: "それはすてきな考えです。" },
          { en: "Tell me your thoughts.", ja: "きみの考えを教えて。" },
        ],
      },
    ],
  },
  {
    word: "sought",
    senses: [
      {
        type: "verb",
        meaning: { en: "past of \"seek\": looked for", ja: "さがした(seekの過去形、かたい言い方)" },
        examples: [
          { en: "They sought the lost cat.", ja: "彼らはまいごのねこをさがしました。" },
          { en: "The king sought a brave knight.", ja: "王様は勇かんな騎士をさがしました。" },
        ],
      },
    ],
  },
  {
    word: "thaw",
    forms: ["thaws"],
    senses: [
      {
        type: "verb",
        meaning: { en: "change from ice to water; stop being frozen", ja: "とける、解凍する" },
        examples: [
          { en: "The snow will thaw in spring.", ja: "春になると雪がとけます。" },
          { en: "Thaw the fish before you cook it.", ja: "料理する前に魚を解凍してね。" },
        ],
      },
    ],
  },
  {
    word: "saw",
    forms: ["saws"],
    senses: [
      {
        type: "verb",
        meaning: { en: "past of \"see\"", ja: "見た(seeの過去形)" },
        examples: [
          { en: "I saw a rainbow.", ja: "にじを見ました。" },
          { en: "We saw a movie yesterday.", ja: "きのう映画を見ました。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "a tool with sharp teeth for cutting wood", ja: "のこぎり" },
        examples: [
          { en: "Dad cuts the wood with a saw.", ja: "お父さんはのこぎりで木を切ります。" },
          { en: "Be careful with the saw.", ja: "のこぎりには気をつけてね。" },
        ],
      },
    ],
  },
  {
    word: "thumb",
    forms: ["thumbs"],
    senses: [
      {
        type: "noun",
        image: "/images/words/thumb.svg",
        meaning: { en: "the short, thick finger on the side of your hand", ja: "親指" },
        examples: [
          { en: "Give me a thumbs-up!", ja: "親指を立てて、いいねして！" },
          { en: "I hurt my thumb.", ja: "親指をけがしました。" },
        ],
      },
    ],
  },
  {
    word: "sum",
    senses: [
      {
        type: "noun",
        meaning: { en: "the number you get when you add numbers together", ja: "合計、たし算の答え" },
        examples: [
          { en: "The sum of 2 and 3 is 5.", ja: "2と3の合計は5です。" },
          { en: "I can do this sum.", ja: "このたし算はできます。" },
        ],
      },
    ],
  },
  {
    word: "three",
    senses: [
      {
        type: "noun",
        meaning: { en: "the number 3", ja: "3、三つ" },
        examples: [
          { en: "Three thick sandwiches, please.", ja: "厚いサンドイッチを3つください。" },
          { en: "I have three cats.", ja: "ねこを3びきかっています。" },
        ],
      },
    ],
  },
  {
    word: "thread",
    forms: ["threads"],
    senses: [
      {
        type: "noun",
        image: "/images/words/thread.svg",
        meaning: { en: "a long, thin string used for sewing", ja: "糸" },
        examples: [
          { en: "I need a needle and thread.", ja: "はりと糸が必要です。" },
          { en: "This thread is red.", ja: "この糸は赤いです。" },
        ],
      },
    ],
  },
  {
    word: "shred",
    forms: ["shreds"],
    senses: [
      {
        type: "verb",
        meaning: { en: "tear or cut into very small, thin pieces", ja: "細かくちぎる、細かく切る" },
        examples: [
          { en: "Shred the cabbage for the salad.", ja: "サラダ用にキャベツを細かく切ってね。" },
          { en: "The dog shreds the paper.", ja: "犬が紙をびりびりにします。" },
        ],
      },
    ],
  },
  {
    word: "they",
    senses: [
      {
        type: "pronoun",
        meaning: { en: "a word for more than one person or thing", ja: "彼らは、それらは" },
        examples: [
          { en: "They are my friends.", ja: "彼らは私の友だちです。" },
          { en: "They play soccer after school.", ja: "彼らは放課後サッカーをします。" },
        ],
      },
    ],
  },
  {
    word: "day",
    forms: ["days"],
    senses: [
      {
        type: "noun",
        meaning: { en: "24 hours; also the time when it is light outside", ja: "日、昼間" },
        examples: [
          { en: "Have a nice day!", ja: "よい1日を！" },
          { en: "There are seven days in a week.", ja: "1週間は7日です。" },
        ],
      },
    ],
  },
  {
    word: "then",
    senses: [
      {
        type: "adverb",
        meaning: { en: "after that; next", ja: "それから、次に" },
        examples: [
          { en: "Wash your hands, then eat.", ja: "手をあらって、それから食べてね。" },
          { en: "First we swim, then we have lunch.", ja: "まず泳いで、次にお昼ごはんです。" },
        ],
      },
      {
        type: "adverb",
        meaning: { en: "at that time", ja: "そのとき" },
        examples: [
          { en: "I was five then.", ja: "そのとき私は5才でした。" },
          { en: "See you then!", ja: "じゃあ、そのときにね！" },
        ],
      },
    ],
  },
  {
    word: "den",
    forms: ["dens"],
    senses: [
      {
        type: "noun",
        meaning: { en: "the home of a wild animal, like a fox or bear", ja: "(動物の)巣穴" },
        examples: [
          { en: "The fox sleeps in its den.", ja: "キツネは巣穴でねむります。" },
          { en: "The bear has a den in the hill.", ja: "クマは丘に巣穴を持っています。" },
        ],
      },
    ],
  },
  {
    word: "though",
    senses: [
      {
        type: "conjunction",
        meaning: { en: "but; even if", ja: "〜けれど、〜なのに" },
        examples: [
          { en: "I went out, though it was cold.", ja: "寒かったけれど、外に出ました。" },
          { en: "Though he is small, he is strong.", ja: "彼は小さいけれど、強いです。" },
        ],
      },
    ],
  },
  {
    word: "dough",
    senses: [
      {
        type: "noun",
        meaning: { en: "a soft mix of flour and water for making bread", ja: "(パンなどの)生地" },
        examples: [
          { en: "We make pizza dough.", ja: "ピザの生地を作ります。" },
          { en: "The dough is soft.", ja: "生地はやわらかいです。" },
        ],
      },
    ],
  },
  {
    word: "those",
    senses: [
      {
        type: "pronoun",
        meaning: { en: "the things over there (more than one)", ja: "あれら、あれらの" },
        examples: [
          { en: "Those are my shoes.", ja: "あれは私のくつです。" },
          { en: "I like those flowers.", ja: "あの花たちが好きです。" },
        ],
      },
    ],
  },
  {
    word: "doze",
    forms: ["dozes"],
    senses: [
      {
        type: "verb",
        meaning: { en: "sleep lightly for a short time", ja: "うとうとする、いねむりする" },
        examples: [
          { en: "Grandpa dozes on the sofa.", ja: "おじいちゃんはソファでうとうとします。" },
          { en: "Don't doze in class!", ja: "授業中にいねむりしないで！" },
        ],
      },
    ],
  },
  {
    word: "there",
    senses: [
      {
        type: "adverb",
        meaning: { en: "in or to that place", ja: "そこに、そこへ" },
        examples: [
          { en: "Put the bag over there.", ja: "かばんはあそこにおいてね。" },
          { en: "There is a cat on the bed.", ja: "ベッドの上にねこがいます。" },
        ],
      },
    ],
  },
  {
    word: "dare",
    senses: [
      {
        type: "verb",
        meaning: { en: "be brave enough to do something scary", ja: "思いきって〜する、〜する勇気がある" },
        examples: [
          { en: "I don't dare to jump.", ja: "こわくてとべません。" },
          { en: "I dare you to touch the frog!", ja: "カエルにさわれるもんならさわってみて！" },
        ],
      },
    ],
  },
  {
    word: "than",
    senses: [
      {
        type: "conjunction",
        meaning: { en: "used to compare two things (bigger than...)", ja: "〜より" },
        examples: [
          { en: "Dan ran faster than the red van!", ja: "ダンは赤いバンより速く走った！" },
          { en: "A dog is bigger than a cat.", ja: "犬はねこより大きいです。" },
        ],
      },
    ],
  },
  {
    word: "breathe",
    forms: ["breathes"],
    senses: [
      {
        type: "verb",
        meaning: { en: "take air in and let it out", ja: "息をする、呼吸する" },
        examples: [
          { en: "Breathe in slowly.", ja: "ゆっくり息をすって。" },
          { en: "Fish breathe under water.", ja: "魚は水の中で呼吸します。" },
        ],
      },
    ],
  },
  {
    word: "breed",
    forms: ["breeds"],
    senses: [
      {
        type: "noun",
        meaning: { en: "one kind of dog, cat, or other animal", ja: "(動物の)品種、種類" },
        examples: [
          { en: "What breed is your dog?", ja: "きみの犬は何という種類？" },
          { en: "This breed of cat has long hair.", ja: "この種類のねこは毛が長いです。" },
        ],
      },
    ],
  },
  {
    word: "bathe",
    forms: ["bathes"],
    senses: [
      {
        type: "verb",
        meaning: { en: "wash your body in a bath", ja: "お風呂に入る、体をあらう" },
        examples: [
          { en: "I bathe every night.", ja: "毎晩お風呂に入ります。" },
          { en: "We bathe the baby.", ja: "赤ちゃんをお風呂に入れます。" },
        ],
      },
    ],
  },
  {
    word: "bade",
    senses: [
      {
        type: "verb",
        meaning: { en: "past of \"bid\": told someone to do something (old word)", ja: "命じた、言いつけた(古い言い方)" },
        examples: [
          { en: "She bade him bathe before he went to bed.", ja: "彼女は彼にねる前にお風呂に入るよう言いつけました。" },
          { en: "The king bade them come in.", ja: "王様は彼らに入るよう命じました。" },
        ],
      },
    ],
  },
  {
    word: "other",
    senses: [
      {
        type: "adjective",
        meaning: { en: "not this one; different", ja: "ほかの、もう一方の" },
        examples: [
          { en: "Where is my other sock?", ja: "もう片方のくつしたはどこ？" },
          { en: "Play with the other kids.", ja: "ほかの子どもたちと遊んでね。" },
        ],
      },
    ],
  },
  {
    word: "udder",
    senses: [
      {
        type: "noun",
        image: "/images/words/cow.svg",
        meaning: { en: "the part of a cow where milk comes out", ja: "(牛の)おちち、乳房" },
        examples: [
          { en: "Milk comes from the cow's udder.", ja: "牛乳は牛のおちちから出ます。" },
          { en: "The farmer cleans the udder.", ja: "農家の人が牛のおちちをきれいにします。" },
        ],
      },
    ],
  },
  {
    word: "worthy",
    senses: [
      {
        type: "adjective",
        meaning: { en: "good enough to get something", ja: "〜にふさわしい、〜の価値がある" },
        examples: [
          { en: "She is worthy of the prize.", ja: "彼女はその賞にふさわしいです。" },
          { en: "The hero is worthy of thanks.", ja: "そのヒーローは感謝されるべきです。" },
        ],
      },
    ],
  },
  {
    word: "wordy",
    senses: [
      {
        type: "adjective",
        meaning: { en: "using too many words", ja: "言葉が多すぎる、くどい" },
        examples: [
          { en: "This letter is too wordy.", ja: "この手紙は言葉が多すぎます。" },
          { en: "Make your answer short, not wordy.", ja: "答えはくどくならないよう短くね。" },
        ],
      },
    ],
  },
];
