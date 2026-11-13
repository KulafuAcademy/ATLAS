import type { WordDetail } from "./types";

// R vs L pair words.
export const rVsLWords: WordDetail[] = [
  {
    word: "right",
    senses: [
      {
        type: "adjective",
        meaning: { en: "correct; not wrong", ja: "正しい" },
        examples: [
          { en: "You are right!", ja: "あなたの言うとおり！" },
          { en: "That is the right answer.", ja: "それは正しい答えです。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "the side opposite the left", ja: "右" },
        examples: [
          { en: "Raise your right hand.", ja: "右手をあげて。" },
          { en: "Turn right here.", ja: "ここを右に曲がって。" },
        ],
      },
    ],
  },
  {
    word: "light",
    forms: ["lights"],
    senses: [
      {
        type: "noun",
        image: "/images/words/light.svg",
        meaning: { en: "something that makes a place bright", ja: "明かり、電気" },
        examples: [
          { en: "Turn on the light.", ja: "電気をつけて。" },
          { en: "The light is red.", ja: "信号は赤です。" },
        ],
      },
      {
        type: "adjective",
        meaning: { en: "not heavy", ja: "軽い" },
        examples: [
          { en: "My bag is light.", ja: "私のかばんは軽いです。" },
          { en: "A feather is light.", ja: "羽は軽いです。" },
        ],
      },
    ],
  },
  {
    word: "rice",
    senses: [
      {
        type: "noun",
        image: "/images/words/rice.svg",
        meaning: { en: "small white grains you cook and eat", ja: "ごはん、お米" },
        examples: [
          { en: "I eat rice every day.", ja: "私は毎日ごはんを食べます。" },
          { en: "This rice is hot.", ja: "このごはんは熱いです。" },
        ],
      },
    ],
  },
  {
    word: "lice",
    senses: [
      {
        type: "noun",
        meaning: { en: "very small bugs that live in hair", ja: "シラミ(髪にいる小さな虫)" },
        examples: [
          { en: "Lice are very small.", ja: "シラミはとても小さいです。" },
          { en: "Lice live in hair.", ja: "シラミは髪の毛にすみます。" },
        ],
      },
    ],
  },
  {
    word: "road",
    forms: ["roads"],
    senses: [
      {
        type: "noun",
        image: "/images/words/road.svg",
        meaning: { en: "a way for cars to go on", ja: "道、道路" },
        examples: [
          { en: "The road is long.", ja: "その道は長いです。" },
          { en: "Look before you cross the road.", ja: "道をわたる前によく見てね。" },
        ],
      },
    ],
  },
  {
    word: "load",
    forms: ["loads"],
    senses: [
      {
        type: "noun",
        image: "/images/words/box.svg",
        meaning: { en: "things that a person or truck carries", ja: "荷物" },
        examples: [
          { en: "The truck has a big load.", ja: "トラックは大きな荷物をつんでいます。" },
          { en: "This load is heavy.", ja: "この荷物は重いです。" },
        ],
      },
    ],
  },
  {
    word: "glass",
    senses: [
      {
        type: "noun",
        image: "/images/words/glass.svg",
        meaning: { en: "a cup for drinking", ja: "コップ" },
        examples: [
          { en: "I want a glass of milk.", ja: "牛乳を一杯ほしいです。" },
          { en: "My glass is empty.", ja: "私のコップはからっぽです。" },
        ],
      },
    ],
  },
  {
    word: "grass",
    senses: [
      {
        type: "noun",
        image: "/images/words/grass.svg",
        meaning: { en: "short green plants on the ground", ja: "草、しばふ" },
        examples: [
          { en: "The grass is green.", ja: "草は緑色です。" },
          { en: "We sit on the grass.", ja: "私たちはしばふにすわります。" },
        ],
      },
    ],
  },
  {
    word: "free",
    senses: [
      {
        type: "adjective",
        meaning: { en: "costs no money", ja: "無料の、ただの" },
        examples: [
          { en: "The water is free.", ja: "お水は無料です。" },
          { en: "This toy is free!", ja: "このおもちゃはただです！" },
        ],
      },
      {
        type: "adjective",
        meaning: { en: "not busy", ja: "ひまな" },
        examples: [
          { en: "Are you free today?", ja: "今日はひまですか？" },
          { en: "I am free after school.", ja: "放課後はひまです。" },
        ],
      },
    ],
  },
  {
    word: "flee",
    senses: [
      {
        type: "verb",
        meaning: { en: "run away from danger", ja: "にげる" },
        examples: [
          { en: "The birds flee from the cat.", ja: "鳥たちはネコからにげます。" },
          { en: "Flee from the fire!", ja: "火からにげて！" },
        ],
      },
    ],
  },
  {
    word: "red",
    senses: [
      {
        type: "adjective",
        image: "/images/words/red.svg",
        meaning: { en: "the color of an apple or a strawberry", ja: "赤い" },
        examples: [
          { en: "I like red apples.", ja: "私は赤いりんごが好きです。" },
          { en: "My cap is red.", ja: "私のぼうしは赤いです。" },
        ],
      },
    ],
  },
  {
    word: "led",
    senses: [
      {
        type: "verb",
        meaning: { en: "showed the way (past of \"lead\")", ja: "案内した、先頭を歩いた" },
        examples: [
          { en: "The teacher led us to the park.", ja: "先生が私たちを公園に連れていきました。" },
          { en: "Mom led the way.", ja: "お母さんが先を歩きました。" },
        ],
      },
    ],
  },
  {
    word: "rock",
    forms: ["rocks"],
    senses: [
      {
        type: "noun",
        image: "/images/words/rock.svg",
        meaning: { en: "a big, hard stone", ja: "岩、大きな石" },
        examples: [
          { en: "The rock is big.", ja: "その岩は大きいです。" },
          { en: "I sit on a rock.", ja: "私は岩にすわります。" },
        ],
      },
    ],
  },
  {
    word: "lock",
    forms: ["locks"],
    senses: [
      {
        type: "noun",
        image: "/images/words/lock.svg",
        meaning: { en: "a thing you open with a key", ja: "かぎ(錠)" },
        examples: [
          { en: "The door has a lock.", ja: "ドアにはかぎがついています。" },
          { en: "My bike lock is blue.", ja: "私の自転車のかぎは青いです。" },
        ],
      },
      {
        type: "verb",
        image: "/images/words/lock.svg",
        meaning: { en: "close something with a key", ja: "かぎをかける" },
        examples: [
          { en: "Lock the door, please.", ja: "ドアのかぎをかけてね。" },
          { en: "I lock my bike.", ja: "私は自転車にかぎをかけます。" },
        ],
      },
    ],
  },
  {
    word: "rent",
    forms: ["rented"],
    senses: [
      {
        type: "verb",
        meaning: { en: "pay money to use something for a short time", ja: "お金をはらって借りる" },
        examples: [
          { en: "We rent a boat.", ja: "私たちはボートを借ります。" },
          { en: "Dad rented a car.", ja: "お父さんは車を借りました。" },
        ],
      },
    ],
  },
  {
    word: "lent",
    senses: [
      {
        type: "verb",
        meaning: { en: "let someone use your thing (past of \"lend\")", ja: "貸した" },
        examples: [
          { en: "I lent Ken my pencil.", ja: "私はケンにえんぴつを貸しました。" },
          { en: "She lent me a book.", ja: "彼女は私に本を貸してくれました。" },
        ],
      },
    ],
  },
  {
    word: "royal",
    senses: [
      {
        type: "adjective",
        meaning: { en: "of a king or queen", ja: "王様の、王室の" },
        examples: [
          { en: "This is a royal castle.", ja: "これは王様のお城です。" },
          { en: "The king has a royal cat.", ja: "王様は王室のネコを飼っています。" },
        ],
      },
    ],
  },
  {
    word: "loyal",
    senses: [
      {
        type: "adjective",
        meaning: { en: "always on your side; a true friend", ja: "いつも味方でいる、忠実な" },
        examples: [
          { en: "My dog is loyal.", ja: "私の犬は忠実です。" },
          { en: "Ken is a loyal friend.", ja: "ケンはいつも味方でいてくれる友だちです。" },
        ],
      },
    ],
  },
  {
    word: "arrive",
    senses: [
      {
        type: "verb",
        meaning: { en: "get to a place", ja: "着く、到着する" },
        examples: [
          { en: "We arrive at school at eight.", ja: "私たちは8時に学校に着きます。" },
          { en: "The bus will arrive soon.", ja: "バスはもうすぐ着きます。" },
        ],
      },
    ],
  },
  {
    word: "alive",
    senses: [
      {
        type: "adjective",
        meaning: { en: "living; not dead", ja: "生きている" },
        examples: [
          { en: "The fish is alive.", ja: "その魚は生きています。" },
          { en: "Plants are alive.", ja: "植物は生きています。" },
        ],
      },
    ],
  },
  {
    word: "correct",
    senses: [
      {
        type: "adjective",
        meaning: { en: "right; with no mistakes", ja: "正しい" },
        examples: [
          { en: "Your answer is correct.", ja: "あなたの答えは正しいです。" },
          { en: "Is this correct?", ja: "これで合っていますか？" },
        ],
      },
    ],
  },
  {
    word: "collect",
    forms: ["collects"],
    senses: [
      {
        type: "verb",
        meaning: { en: "bring many things together", ja: "集める" },
        examples: [
          { en: "I collect stickers.", ja: "私はシールを集めています。" },
          { en: "We collect shells at the beach.", ja: "私たちは海で貝がらを集めます。" },
        ],
      },
    ],
  },
  {
    word: "pray",
    senses: [
      {
        type: "verb",
        meaning: { en: "ask God for help; hope very much", ja: "いのる、お祈りする" },
        examples: [
          { en: "We pray before we eat.", ja: "私たちは食べる前にお祈りします。" },
          { en: "I pray for sunny weather.", ja: "晴れるようにいのります。" },
        ],
      },
    ],
  },
  {
    word: "play",
    forms: ["plays"],
    senses: [
      {
        type: "verb",
        meaning: { en: "have fun with a game or a sport", ja: "遊ぶ、(スポーツを)する" },
        examples: [
          { en: "Let's play tag!", ja: "おにごっこをしよう！" },
          { en: "I play soccer.", ja: "私はサッカーをします。" },
        ],
      },
      {
        type: "verb",
        meaning: { en: "make music", ja: "(楽器を)ひく" },
        examples: [
          { en: "I play the piano.", ja: "私はピアノをひきます。" },
          { en: "She plays the drums.", ja: "彼女はドラムをたたきます。" },
        ],
      },
    ],
  },
  {
    word: "price",
    senses: [
      {
        type: "noun",
        meaning: { en: "how much money something costs", ja: "値段" },
        examples: [
          { en: "What is the price?", ja: "値段はいくらですか？" },
          { en: "The price is 100 yen.", ja: "値段は100円です。" },
        ],
      },
    ],
  },
  {
    word: "place",
    senses: [
      {
        type: "noun",
        meaning: { en: "where something is; a spot", ja: "場所" },
        examples: [
          { en: "This is my favorite place.", ja: "ここは私のお気に入りの場所です。" },
          { en: "The park is a fun place.", ja: "公園は楽しい場所です。" },
        ],
      },
    ],
  },
  {
    word: "crown",
    senses: [
      {
        type: "noun",
        image: "/images/words/crown.svg",
        meaning: { en: "a gold hat a king or queen wears", ja: "王冠" },
        examples: [
          { en: "The king has a crown.", ja: "王様は王冠を持っています。" },
          { en: "Her crown is gold.", ja: "彼女の王冠は金色です。" },
        ],
      },
    ],
  },
  {
    word: "clown",
    senses: [
      {
        type: "noun",
        image: "/images/words/clown.svg",
        meaning: { en: "a funny person with a red nose", ja: "ピエロ" },
        examples: [
          { en: "The clown is funny.", ja: "そのピエロはおもしろいです。" },
          { en: "The clown has a red nose.", ja: "ピエロは赤い鼻をしています。" },
        ],
      },
    ],
  },
  {
    word: "fry",
    forms: ["fries"],
    senses: [
      {
        type: "verb",
        meaning: { en: "cook food in hot oil", ja: "油であげる、いためる" },
        examples: [
          { en: "Mom fries the fish.", ja: "お母さんは魚をあげます。" },
          { en: "Let's fry an egg.", ja: "たまごを焼こう。" },
        ],
      },
      {
        type: "noun",
        image: "/images/words/fries.svg",
        meaning: { en: "\"fries\": long pieces of fried potato", ja: "(fries で)フライドポテト" },
        examples: [
          { en: "I like fries.", ja: "私はフライドポテトが好きです。" },
          { en: "The fries are hot.", ja: "ポテトは熱いです。" },
        ],
      },
    ],
  },
  {
    word: "fly",
    forms: ["flies"],
    senses: [
      {
        type: "verb",
        meaning: { en: "move in the air", ja: "飛ぶ" },
        examples: [
          { en: "Birds fly.", ja: "鳥は飛びます。" },
          { en: "I can fly a kite.", ja: "私はたこをあげられます。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "a small bug with wings", ja: "ハエ" },
        examples: [
          { en: "A fly is on my cake!", ja: "ケーキにハエがいる！" },
          { en: "The fly is small.", ja: "そのハエは小さいです。" },
        ],
      },
    ],
  },
  {
    word: "grow",
    forms: ["grows"],
    senses: [
      {
        type: "verb",
        image: "/images/words/plant.svg",
        meaning: { en: "get bigger", ja: "大きくなる、育つ" },
        examples: [
          { en: "Plants grow in the sun.", ja: "植物は日なたで育ちます。" },
          { en: "Kids grow fast.", ja: "子どもはすぐに大きくなります。" },
        ],
      },
    ],
  },
  {
    word: "glow",
    forms: ["glows"],
    senses: [
      {
        type: "verb",
        meaning: { en: "shine with a soft light", ja: "やさしく光る" },
        examples: [
          { en: "The moon glows at night.", ja: "月は夜に光ります。" },
          { en: "My sticker glows in the dark.", ja: "私のシールは暗い所で光ります。" },
        ],
      },
    ],
  },
  {
    word: "frame",
    senses: [
      {
        type: "noun",
        image: "/images/words/frame.svg",
        meaning: { en: "the border around a picture", ja: "がくぶち、わく" },
        examples: [
          { en: "The frame is blue.", ja: "そのがくぶちは青いです。" },
          { en: "Put the picture in the frame.", ja: "絵をがくぶちに入れて。" },
        ],
      },
    ],
  },
  {
    word: "flame",
    senses: [
      {
        type: "noun",
        image: "/images/words/flame.svg",
        meaning: { en: "the hot, bright part of a fire", ja: "ほのお" },
        examples: [
          { en: "The flame is hot.", ja: "ほのおは熱いです。" },
          { en: "Don't touch the flame!", ja: "ほのおにさわらないで！" },
        ],
      },
    ],
  },
  {
    word: "brown",
    senses: [
      {
        type: "adjective",
        meaning: { en: "the color of chocolate", ja: "茶色の" },
        examples: [
          { en: "My dog is brown.", ja: "私の犬は茶色です。" },
          { en: "I have brown eyes.", ja: "私の目は茶色です。" },
        ],
      },
    ],
  },
  {
    word: "blown",
    senses: [
      {
        type: "verb",
        image: "/images/words/breeze.svg",
        meaning: { en: "moved by the wind (from \"blow\")", ja: "風でとばされた" },
        examples: [
          { en: "My hat was blown away!", ja: "ぼうしが風でとばされた！" },
          { en: "The leaves were blown away.", ja: "葉っぱが風でとばされました。" },
        ],
      },
    ],
  },
  {
    word: "crash",
    senses: [
      {
        type: "noun",
        meaning: { en: "when two things hit hard, with a loud noise", ja: "ガシャン(ぶつかること)" },
        examples: [
          { en: "I hear a crash!", ja: "ガシャンという音が聞こえる！" },
          { en: "The car crash was loud.", ja: "車がぶつかる音は大きかったです。" },
        ],
      },
    ],
  },
  {
    word: "clash",
    senses: [
      {
        type: "noun",
        meaning: { en: "a loud sound of metal things hitting", ja: "ガチャン(金属がぶつかる音)" },
        examples: [
          { en: "I hear a clash of pots.", ja: "なべがガチャンとぶつかる音が聞こえます。" },
          { en: "The clash is very loud.", ja: "その音はとても大きいです。" },
        ],
      },
    ],
  },
  {
    word: "wrong",
    senses: [
      {
        type: "adjective",
        meaning: { en: "not right; not correct", ja: "まちがった" },
        examples: [
          { en: "That answer is wrong.", ja: "その答えはまちがいです。" },
          { en: "Oops, wrong way!", ja: "おっと、道をまちがえた！" },
        ],
      },
    ],
  },
  {
    word: "long",
    forms: ["longer"],
    senses: [
      {
        type: "adjective",
        meaning: { en: "not short", ja: "長い" },
        examples: [
          { en: "My hair is long.", ja: "私のかみは長いです。" },
          { en: "A snake is long.", ja: "ヘビは長いです。" },
        ],
      },
    ],
  },
];
