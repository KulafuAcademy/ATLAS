import type { WordDetail } from "./types";

// Short I vs long E pair words.
// seat, ship, sheep and sin are in s-sh.ts.
export const shortIVsLongEWords: WordDetail[] = [
  {
    word: "sit",
    forms: ["sits", "sat"],
    senses: [
      {
        type: "verb",
        image: "/images/words/sit.svg",
        meaning: { en: "rest your body on a chair or the floor", ja: "すわる" },
        examples: [
          { en: "Please sit in this seat.", ja: "この席にすわってください。" },
          { en: "The cat sat on the bed.", ja: "ねこがベッドの上にすわりました。" },
        ],
      },
    ],
  },
  {
    word: "bit",
    senses: [
      {
        type: "noun",
        meaning: { en: "a small piece or a small amount", ja: "少し、小さなかけら" },
        examples: [
          { en: "Can I have a bit of cake?", ja: "ケーキを少しもらえる？" },
          { en: "I am a bit tired.", ja: "少しつかれています。" },
        ],
      },
      {
        type: "verb",
        meaning: { en: "past of \"bite\": cut with the teeth", ja: "かんだ(biteの過去形)" },
        examples: [
          { en: "The dog bit my shoe.", ja: "犬が私のくつをかみました。" },
          { en: "I bit into the apple.", ja: "りんごをかじりました。" },
        ],
      },
    ],
  },
  {
    word: "beat",
    forms: ["beats"],
    senses: [
      {
        type: "verb",
        meaning: { en: "win against someone", ja: "(試合で)勝つ、負かす" },
        examples: [
          { en: "Our team beat them!", ja: "ぼくたちのチームが勝った！" },
          { en: "Can you beat me in a race?", ja: "かけっこで私に勝てる？" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "the steady sound of music or your heart", ja: "リズム、(心ぞうの)どきどき" },
        examples: [
          { en: "Clap to the beat.", ja: "リズムに合わせて手をたたいてね。" },
          { en: "I can feel my heart beat.", ja: "心ぞうがどきどきするのがわかります。" },
        ],
      },
    ],
  },
  {
    word: "live",
    forms: ["lives", "lived"],
    senses: [
      {
        type: "verb",
        meaning: { en: "have your home in a place", ja: "住む" },
        examples: [
          { en: "I live in Tokyo.", ja: "私は東京に住んでいます。" },
          { en: "Fish live in water.", ja: "魚は水の中に住んでいます。" },
        ],
      },
    ],
  },
  {
    word: "leave",
    senses: [
      {
        type: "verb",
        meaning: { en: "go away from a place", ja: "出発する、はなれる" },
        examples: [
          { en: "We leave home at eight.", ja: "私たちは8時に家を出ます。" },
          { en: "Do not leave the place you live.", ja: "住んでいる場所をはなれないで。" },
        ],
      },
    ],
  },
  {
    word: "fit",
    forms: ["fits"],
    senses: [
      {
        type: "verb",
        meaning: { en: "be the right size", ja: "(サイズが)ぴったり合う" },
        examples: [
          { en: "I feel it will fit.", ja: "ぴったり合うと思います。" },
          { en: "These shoes fit me.", ja: "このくつは私にぴったりです。" },
        ],
      },
    ],
  },
  {
    word: "feet",
    senses: [
      {
        type: "noun",
        image: "/images/words/feet.svg",
        meaning: { en: "more than one foot (the parts at the end of your legs)", ja: "足(footの複数形)" },
        examples: [
          { en: "My feet are cold.", ja: "足がつめたいです。" },
          { en: "Wipe your feet on the mat.", ja: "マットで足をふいてね。" },
        ],
      },
    ],
  },
  {
    word: "mitt",
    forms: ["mitts"],
    senses: [
      {
        type: "noun",
        image: "/images/words/mitt.svg",
        meaning: { en: "a big glove for catching a ball", ja: "ミット、グローブ" },
        examples: [
          { en: "Catch the ball with your mitt.", ja: "ミットでボールをとってね。" },
          { en: "My mitt is brown.", ja: "私のグローブは茶色です。" },
        ],
      },
    ],
  },
  {
    word: "meet",
    forms: ["meets", "met"],
    senses: [
      {
        type: "verb",
        meaning: { en: "see and talk to someone, or see them for the first time", ja: "会う、出会う" },
        examples: [
          { en: "Nice to meet you!", ja: "はじめまして！" },
          { en: "Let's meet at the park.", ja: "公園で会おう。" },
        ],
      },
    ],
  },
  {
    word: "rid",
    senses: [
      {
        type: "verb",
        meaning: { en: "make something go away (get rid of)", ja: "(get rid of で)なくす、すてる" },
        examples: [
          { en: "Get rid of the old toys.", ja: "古いおもちゃをすててね。" },
          { en: "Do not get rid of it till you read it.", ja: "読むまではすてないで。" },
        ],
      },
    ],
  },
  {
    word: "read",
    forms: ["reads"],
    senses: [
      {
        type: "verb",
        meaning: { en: "look at words and understand them", ja: "読む" },
        examples: [
          { en: "I read a book every night.", ja: "私は毎晩本を読みます。" },
          { en: "Can you read this word?", ja: "この単語を読めますか？" },
        ],
      },
    ],
  },
  {
    word: "fill",
    forms: ["fills"],
    senses: [
      {
        type: "verb",
        meaning: { en: "make something full", ja: "いっぱいにする、満たす" },
        examples: [
          { en: "Fill the cup with water.", ja: "コップを水でいっぱいにしてね。" },
          { en: "Please fill in your name.", ja: "名前を書きこんでください。" },
        ],
      },
    ],
  },
  {
    word: "feel",
    forms: ["feels", "felt"],
    senses: [
      {
        type: "verb",
        meaning: { en: "have a feeling in your body or heart", ja: "感じる、〜な気分だ" },
        examples: [
          { en: "I feel happy today.", ja: "今日はうれしい気分です。" },
          { en: "The cat feels soft.", ja: "ねこはふわふわしています。" },
        ],
      },
      {
        type: "verb",
        meaning: { en: "think or believe", ja: "〜と思う" },
        examples: [
          { en: "I feel it will fit.", ja: "ぴったり合うと思います。" },
          { en: "I feel this is right.", ja: "これが正しいと思います。" },
        ],
      },
    ],
  },
  {
    word: "hill",
    forms: ["hills"],
    senses: [
      {
        type: "noun",
        image: "/images/words/hill.svg",
        meaning: { en: "high land, smaller than a mountain", ja: "丘、小さな山" },
        examples: [
          { en: "We run up the hill.", ja: "私たちは丘をかけ上がります。" },
          { en: "There is a tree on the hill.", ja: "丘の上に木があります。" },
        ],
      },
    ],
  },
  {
    word: "heal",
    forms: ["heals"],
    senses: [
      {
        type: "verb",
        meaning: { en: "become healthy again after you get hurt", ja: "(けがが)治る" },
        examples: [
          { en: "My cut will heal soon.", ja: "切りきずはすぐ治るでしょう。" },
          { en: "Rest helps you heal.", ja: "休むと早く治ります。" },
        ],
      },
    ],
  },
  {
    word: "still",
    senses: [
      {
        type: "adverb",
        meaning: { en: "even now; not stopped yet", ja: "まだ" },
        examples: [
          { en: "I am still hungry.", ja: "まだおなかがすいています。" },
          { en: "Is it still raining?", ja: "まだ雨がふっていますか？" },
        ],
      },
      {
        type: "adjective",
        meaning: { en: "not moving", ja: "じっとした、動かない" },
        examples: [
          { en: "Please sit still.", ja: "じっとすわっていてね。" },
          { en: "The lake is very still.", ja: "湖はとても静かです。" },
        ],
      },
    ],
  },
  {
    word: "steel",
    senses: [
      {
        type: "noun",
        meaning: { en: "a very strong metal", ja: "鉄、はがね" },
        examples: [
          { en: "This bridge is made of steel.", ja: "この橋は鉄でできています。" },
          { en: "Steel is hard and strong.", ja: "はがねはかたくて強いです。" },
        ],
      },
    ],
  },
  {
    word: "slip",
    forms: ["slips"],
    senses: [
      {
        type: "verb",
        meaning: { en: "slide by accident and almost fall", ja: "すべる" },
        examples: [
          { en: "Don't slip on the ice!", ja: "氷ですべらないでね！" },
          { en: "I slip on the wet floor.", ja: "ぬれたゆかですべります。" },
        ],
      },
    ],
  },
  {
    word: "sleep",
    forms: ["sleeps", "slept"],
    senses: [
      {
        type: "verb",
        meaning: { en: "rest with your eyes closed, like at night", ja: "ねむる、ねる" },
        examples: [
          { en: "I sleep at nine o'clock.", ja: "私は9時にねます。" },
          { en: "The baby is sleeping.", ja: "赤ちゃんがねむっています。" },
        ],
      },
    ],
  },
  {
    word: "chip",
    forms: ["chips"],
    senses: [
      {
        type: "noun",
        meaning: { en: "a thin, crispy snack made from potatoes", ja: "ポテトチップス" },
        examples: [
          { en: "Can I have a chip?", ja: "ポテトチップスを1まいもらえる？" },
          { en: "These chips are salty.", ja: "このポテトチップスはしょっぱいです。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "a small piece that broke off", ja: "(欠けた)小さなかけら" },
        examples: [
          { en: "This cup has a chip.", ja: "このコップは欠けています。" },
          { en: "Look, a chip of wood.", ja: "見て、木のかけらだよ。" },
        ],
      },
    ],
  },
  {
    word: "cheap",
    senses: [
      {
        type: "adjective",
        meaning: { en: "costs only a little money", ja: "安い" },
        examples: [
          { en: "This pen is cheap.", ja: "このペンは安いです。" },
          { en: "Apples are cheap today.", ja: "今日はりんごが安いです。" },
        ],
      },
    ],
  },
  {
    word: "grin",
    forms: ["grins"],
    senses: [
      {
        type: "noun",
        image: "/images/words/grin.svg",
        meaning: { en: "a big smile that shows your teeth", ja: "(歯を見せた)にっこり笑顔" },
        examples: [
          { en: "He has a big grin.", ja: "彼はにっこり笑っています。" },
          { en: "She grins at me.", ja: "彼女は私ににっこりします。" },
        ],
      },
    ],
  },
  {
    word: "green",
    senses: [
      {
        type: "adjective",
        meaning: { en: "the color of grass and leaves", ja: "緑色の" },
        examples: [
          { en: "The grass is green.", ja: "草は緑色です。" },
          { en: "I have a green pen.", ja: "緑色のペンを持っています。" },
        ],
      },
    ],
  },
  {
    word: "lick",
    forms: ["licks"],
    senses: [
      {
        type: "verb",
        meaning: { en: "move your tongue on something", ja: "なめる" },
        examples: [
          { en: "I lick my ice cream.", ja: "アイスクリームをなめます。" },
          { en: "The dog licks my hand.", ja: "犬が私の手をなめます。" },
        ],
      },
    ],
  },
  {
    word: "leak",
    forms: ["leaks"],
    senses: [
      {
        type: "verb",
        meaning: { en: "let water come out through a hole by accident", ja: "もれる" },
        examples: [
          { en: "My bottle leaks.", ja: "私の水とうはもれます。" },
          { en: "Water leaks from the roof.", ja: "屋根から水がもれています。" },
        ],
      },
    ],
  },
  {
    word: "pick",
    forms: ["picks", "picked"],
    senses: [
      {
        type: "verb",
        meaning: { en: "choose one", ja: "えらぶ" },
        examples: [
          { en: "Pick a card.", ja: "カードを1まいえらんで。" },
          { en: "I pick the red one.", ja: "赤いのをえらびます。" },
        ],
      },
      {
        type: "verb",
        meaning: { en: "take a flower or fruit from a plant", ja: "(花や果物を)つむ、とる" },
        examples: [
          { en: "We pick apples in the fall.", ja: "秋にりんごをとります。" },
          { en: "Don't pick the flowers.", ja: "花をつまないでね。" },
        ],
      },
    ],
  },
  {
    word: "peak",
    forms: ["peaks"],
    senses: [
      {
        type: "noun",
        image: "/images/words/peak.svg",
        meaning: { en: "the top of a mountain", ja: "山のてっぺん、山頂" },
        examples: [
          { en: "There is snow on the peak.", ja: "山頂に雪があります。" },
          { en: "We climb to the peak.", ja: "てっぺんまで登ります。" },
        ],
      },
    ],
  },
  {
    word: "dip",
    forms: ["dips"],
    senses: [
      {
        type: "verb",
        meaning: { en: "put something into a liquid for a short time", ja: "(さっと)ひたす、つける" },
        examples: [
          { en: "Dip the bread in the soup.", ja: "パンをスープにつけてね。" },
          { en: "I dip my toes in the water.", ja: "足の指を水につけます。" },
        ],
      },
    ],
  },
  {
    word: "deep",
    senses: [
      {
        type: "adjective",
        meaning: { en: "going a long way down", ja: "深い" },
        examples: [
          { en: "The sea is deep.", ja: "海は深いです。" },
          { en: "Don't swim in the deep water.", ja: "深いところで泳がないでね。" },
        ],
      },
    ],
  },
  {
    word: "mill",
    forms: ["mills"],
    senses: [
      {
        type: "noun",
        image: "/images/words/mill.svg",
        meaning: { en: "a building where grain is made into flour", ja: "粉ひき小屋、風車小屋" },
        examples: [
          { en: "The mill makes flour.", ja: "粉ひき小屋で小麦粉を作ります。" },
          { en: "There is an old mill by the river.", ja: "川のそばに古い風車小屋があります。" },
        ],
      },
    ],
  },
  {
    word: "meal",
    forms: ["meals"],
    senses: [
      {
        type: "noun",
        image: "/images/words/meal.svg",
        meaning: { en: "food you eat at one time, like lunch or dinner", ja: "食事、ごはん" },
        examples: [
          { en: "Breakfast is my favorite meal.", ja: "朝ごはんがいちばん好きな食事です。" },
          { en: "We eat three meals a day.", ja: "1日に3回ごはんを食べます。" },
        ],
      },
    ],
  },
  {
    word: "seen",
    senses: [
      {
        type: "verb",
        meaning: { en: "a past form of \"see\" (have seen)", ja: "見た(seeの過去分詞)" },
        examples: [
          { en: "Have you seen my bag?", ja: "私のかばんを見なかった？" },
          { en: "I have seen this movie.", ja: "この映画は見たことがあります。" },
        ],
      },
    ],
  },
  {
    word: "it",
    senses: [
      {
        type: "pronoun",
        meaning: { en: "a word for a thing or animal (already talked about)", ja: "それ" },
        examples: [
          { en: "I feel it will fit.", ja: "ぴったり合うと思います。" },
          { en: "Where is my ball? I can't find it.", ja: "ボールはどこ？見つからないよ。" },
        ],
      },
    ],
  },
  {
    word: "eat",
    forms: ["eats", "ate"],
    senses: [
      {
        type: "verb",
        meaning: { en: "put food in your mouth and swallow it", ja: "食べる" },
        examples: [
          { en: "I eat rice for lunch.", ja: "お昼にごはんを食べます。" },
          { en: "Sheep eat grass.", ja: "羊は草を食べます。" },
        ],
      },
    ],
  },
  {
    word: "hit",
    forms: ["hits"],
    senses: [
      {
        type: "verb",
        meaning: { en: "touch something hard and fast", ja: "打つ、ぶつける" },
        examples: [
          { en: "Hit the ball with the bat.", ja: "バットでボールを打ってね。" },
          { en: "I hit my head on the door.", ja: "ドアに頭をぶつけました。" },
        ],
      },
    ],
  },
  {
    word: "heat",
    forms: ["heats"],
    senses: [
      {
        type: "noun",
        meaning: { en: "the feeling of being hot", ja: "暑さ、熱" },
        examples: [
          { en: "I don't like the summer heat.", ja: "夏の暑さは好きじゃないです。" },
          { en: "Feel the heat from the fire.", ja: "火の熱を感じてみて。" },
        ],
      },
      {
        type: "verb",
        meaning: { en: "make something hot", ja: "あたためる" },
        examples: [
          { en: "Heat the soup, please.", ja: "スープをあたためてください。" },
          { en: "Mom heats the milk.", ja: "お母さんが牛乳をあたためます。" },
        ],
      },
    ],
  },
];
