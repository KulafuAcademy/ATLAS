import type { WordDetail } from "./types";

// S vs SH pair words.
// "Sue" (sue-shoe) is a name and has no page.
export const sVsShWords: WordDetail[] = [
  {
    word: "see",
    forms: ["sees"],
    senses: [
      {
        type: "verb",
        meaning: { en: "notice something with your eyes", ja: "見る、見える" },
        examples: [
          { en: "I see a bird in the tree.", ja: "木に鳥が見えます。" },
          { en: "Can you see the moon?", ja: "月が見えますか？" },
        ],
      },
    ],
  },
  {
    word: "she",
    senses: [
      {
        type: "pronoun",
        meaning: { en: "a word for a girl or woman (already talked about)", ja: "彼女は、その女の子は" },
        examples: [
          { en: "She sells sea shells.", ja: "彼女は貝がらを売っています。" },
          { en: "She is my sister.", ja: "彼女は私のお姉さんです。" },
        ],
      },
    ],
  },
  {
    word: "sip",
    forms: ["sips"],
    senses: [
      {
        type: "verb",
        meaning: { en: "drink a very small amount at a time", ja: "少しずつ飲む、ちびちび飲む" },
        examples: [
          { en: "Sip the hot tea slowly.", ja: "あついお茶はゆっくり少しずつ飲んでね。" },
          { en: "I sip my juice.", ja: "ジュースを少しずつ飲みます。" },
        ],
      },
    ],
  },
  {
    word: "ship",
    forms: ["ships", "ship's"],
    senses: [
      {
        type: "noun",
        image: "/images/words/ship.svg",
        meaning: { en: "a large boat that goes on the sea", ja: "船" },
        examples: [
          { en: "The sheep is on the ship.", ja: "羊が船に乗っています。" },
          { en: "Sit on the ship's seat.", ja: "船の座席にすわってね。" },
        ],
      },
    ],
  },
  {
    word: "sell",
    forms: ["sells", "sold"],
    senses: [
      {
        type: "verb",
        meaning: { en: "give something to someone for money", ja: "売る" },
        examples: [
          { en: "She sells sea shells.", ja: "彼女は貝がらを売っています。" },
          { en: "This shop sells bread.", ja: "このお店はパンを売っています。" },
        ],
      },
    ],
  },
  {
    word: "shell",
    forms: ["shells"],
    senses: [
      {
        type: "noun",
        image: "/images/words/shell.svg",
        meaning: { en: "the hard outside of a sea animal or an egg", ja: "貝がら、から" },
        examples: [
          { en: "I find a shell on the beach.", ja: "浜辺で貝がらを見つけます。" },
          { en: "An egg has a white shell.", ja: "たまごには白いからがあります。" },
        ],
      },
    ],
  },
  {
    word: "seat",
    forms: ["seats"],
    senses: [
      {
        type: "noun",
        image: "/images/words/seat.svg",
        meaning: { en: "a place to sit", ja: "座席、すわる場所" },
        examples: [
          { en: "Please sit in this seat.", ja: "この席にすわってください。" },
          { en: "Is this seat free?", ja: "この席はあいていますか？" },
        ],
      },
    ],
  },
  {
    word: "sheet",
    forms: ["sheets"],
    senses: [
      {
        type: "noun",
        image: "/images/words/sheet.svg",
        meaning: { en: "a big cloth you put on a bed", ja: "シーツ" },
        examples: [
          { en: "The sheet on my bed is white.", ja: "ベッドのシーツは白いです。" },
          { en: "Mom washes the sheets.", ja: "お母さんがシーツをあらいます。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "one flat piece of paper", ja: "(紙)1まい" },
        examples: [
          { en: "Take a sheet of paper.", ja: "紙を1まいとってね。" },
          { en: "Write your name on the sheet.", ja: "その紙に名前を書いてね。" },
        ],
      },
    ],
  },
  {
    word: "sake",
    senses: [
      {
        type: "noun",
        meaning: { en: "for someone's good; to help someone (for my sake)", ja: "〜のため" },
        examples: [
          { en: "Please be careful, for my sake.", ja: "私のためにも気をつけてね。" },
          { en: "Shake the milkshake for my sake.", ja: "私のためにミルクシェイクをふって。" },
        ],
      },
    ],
  },
  {
    word: "shake",
    forms: ["shakes"],
    senses: [
      {
        type: "verb",
        meaning: { en: "move something quickly up and down or side to side", ja: "ふる、ゆらす" },
        examples: [
          { en: "Shake the bottle before you drink.", ja: "飲む前にびんをふってね。" },
          { en: "Let's shake hands.", ja: "あく手しよう。" },
        ],
      },
      {
        type: "noun",
        image: "/images/words/milkshake.svg",
        meaning: { en: "a cold, sweet milk drink (milkshake)", ja: "ミルクシェイク" },
        examples: [
          { en: "I want a chocolate shake.", ja: "チョコのシェイクがほしいです。" },
          { en: "This shake is very cold.", ja: "このシェイクはとてもつめたいです。" },
        ],
      },
    ],
  },
  {
    word: "save",
    forms: ["saves", "saved"],
    senses: [
      {
        type: "verb",
        meaning: { en: "keep something to use later", ja: "取っておく、ためる" },
        examples: [
          { en: "Save the shoes for Sunday.", ja: "そのくつは日曜日のために取っておいてね。" },
          { en: "I save money for a new bike.", ja: "新しい自転車のためにお金をためています。" },
        ],
      },
      {
        type: "verb",
        meaning: { en: "help someone get out of danger", ja: "助ける、救う" },
        examples: [
          { en: "She'll save the seal.", ja: "彼女はアザラシを助けるでしょう。" },
          { en: "The doctor saves lives.", ja: "お医者さんは命を救います。" },
        ],
      },
    ],
  },
  {
    word: "shave",
    forms: ["shaves"],
    senses: [
      {
        type: "verb",
        meaning: { en: "cut hair off your face or body with a razor", ja: "(ひげなどを)そる" },
        examples: [
          { en: "Dad shaves every morning.", ja: "お父さんは毎朝ひげをそります。" },
          { en: "He shaves with a razor.", ja: "彼はかみそりでひげをそります。" },
        ],
      },
    ],
  },
  {
    word: "same",
    senses: [
      {
        type: "adjective",
        meaning: { en: "not different", ja: "同じ" },
        examples: [
          { en: "We have the same bag.", ja: "私たちは同じかばんを持っています。" },
          { en: "We are in the same class.", ja: "私たちは同じクラスです。" },
        ],
      },
    ],
  },
  {
    word: "shame",
    senses: [
      {
        type: "noun",
        meaning: { en: "a sad thing; too bad (What a shame!)", ja: "残念なこと" },
        examples: [
          { en: "It's raining. What a shame!", ja: "雨だ。残念だね！" },
          { en: "It's a shame you can't come.", ja: "きみが来られないのは残念です。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "the bad feeling when you did something wrong", ja: "はずかしさ、はじ" },
        examples: [
          { en: "His face turned red with shame.", ja: "彼ははずかしくて顔が赤くなりました。" },
          { en: "There is no shame in asking for help.", ja: "助けをたのむのははずかしいことではありません。" },
        ],
      },
    ],
  },
  {
    word: "sign",
    forms: ["signs"],
    senses: [
      {
        type: "noun",
        image: "/images/words/sign.svg",
        meaning: { en: "a board with words or pictures that tells you something", ja: "看板、標識" },
        examples: [
          { en: "The sign says \"Stop\".", ja: "標識には「止まれ」と書いてあります。" },
          { en: "Look at the sign.", ja: "看板を見てね。" },
        ],
      },
      {
        type: "verb",
        meaning: { en: "write your name on something", ja: "サインする、名前を書く" },
        examples: [
          { en: "Please sign here.", ja: "ここにサインしてください。" },
          { en: "Sign your name on the card.", ja: "カードに名前を書いてね。" },
        ],
      },
    ],
  },
  {
    word: "shine",
    forms: ["shines"],
    senses: [
      {
        type: "verb",
        image: "/images/words/sun.svg",
        meaning: { en: "give out bright light", ja: "光る、かがやく" },
        examples: [
          { en: "The sun shines in the sky.", ja: "空に太陽がかがやいています。" },
          { en: "The stars shine at night.", ja: "夜は星が光ります。" },
        ],
      },
    ],
  },
  {
    word: "sort",
    senses: [
      {
        type: "noun",
        meaning: { en: "a kind or type of something", ja: "種類" },
        examples: [
          { en: "What sort of music do you like?", ja: "どんな種類の音楽が好き？" },
          { en: "This sort of apple is sweet.", ja: "この種類のりんごはあまいです。" },
        ],
      },
      {
        type: "verb",
        meaning: { en: "put things into groups", ja: "分ける、仲間分けする" },
        examples: [
          { en: "Sort the cards by color.", ja: "カードを色ごとに分けてね。" },
          { en: "We sort the trash.", ja: "私たちはごみを分別します。" },
        ],
      },
    ],
  },
  {
    word: "short",
    senses: [
      {
        type: "adjective",
        meaning: { en: "not long", ja: "短い" },
        examples: [
          { en: "My hair is short.", ja: "私のかみは短いです。" },
          { en: "It is a short story.", ja: "それは短いお話です。" },
        ],
      },
      {
        type: "adjective",
        meaning: { en: "not tall", ja: "背が低い" },
        examples: [
          { en: "My brother is short.", ja: "弟は背が低いです。" },
          { en: "I am shorter than my mom.", ja: "私はお母さんより背が低いです。" },
        ],
      },
    ],
  },
  {
    word: "sock",
    forms: ["socks"],
    senses: [
      {
        type: "noun",
        image: "/images/words/sock.svg",
        meaning: { en: "soft clothing you wear on your foot", ja: "くつした" },
        examples: [
          { en: "I can't find my other sock.", ja: "もう片方のくつしたが見つかりません。" },
          { en: "My socks are white.", ja: "私のくつしたは白いです。" },
        ],
      },
    ],
  },
  {
    word: "shock",
    senses: [
      {
        type: "noun",
        meaning: { en: "a big, sudden surprise (usually bad)", ja: "ショック、大きなおどろき" },
        examples: [
          { en: "The news was a shock.", ja: "そのニュースはショックでした。" },
          { en: "I jumped in shock.", ja: "びっくりしてとび上がりました。" },
        ],
      },
    ],
  },
  {
    word: "sew",
    forms: ["sews"],
    senses: [
      {
        type: "verb",
        meaning: { en: "join cloth with a needle and thread", ja: "ぬう" },
        examples: [
          { en: "Grandma sews a dress.", ja: "おばあちゃんはドレスをぬいます。" },
          { en: "Can you sew this button?", ja: "このボタンをぬいつけてくれる？" },
        ],
      },
    ],
  },
  {
    word: "show",
    forms: ["shows", "showed"],
    senses: [
      {
        type: "verb",
        meaning: { en: "let someone see something", ja: "見せる" },
        examples: [
          { en: "Show me your picture.", ja: "きみの絵を見せて。" },
          { en: "I show my card to the teacher.", ja: "先生にカードを見せます。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "something people watch, like on TV or a stage", ja: "ショー、番組" },
        examples: [
          { en: "I like this TV show.", ja: "このテレビ番組が好きです。" },
          { en: "The show starts at six.", ja: "ショーは6時に始まります。" },
        ],
      },
    ],
  },
  {
    word: "sore",
    senses: [
      {
        type: "adjective",
        meaning: { en: "hurting a little", ja: "痛い、ヒリヒリする" },
        examples: [
          { en: "I have a sore throat.", ja: "のどが痛いです。" },
          { en: "My legs are sore after running.", ja: "走ったあと、足が痛いです。" },
        ],
      },
    ],
  },
  {
    word: "shore",
    senses: [
      {
        type: "noun",
        image: "/images/words/beach.svg",
        meaning: { en: "the land next to the sea or a lake", ja: "岸、海岸" },
        examples: [
          { en: "We walk on the shore.", ja: "私たちは海岸を歩きます。" },
          { en: "The boat comes to the shore.", ja: "ボートが岸に来ます。" },
        ],
      },
    ],
  },
  {
    word: "sack",
    forms: ["sacks"],
    senses: [
      {
        type: "noun",
        image: "/images/words/sack.svg",
        meaning: { en: "a big, strong bag", ja: "大きなふくろ" },
        examples: [
          { en: "The sack is full of rice.", ja: "ふくろはお米でいっぱいです。" },
          { en: "Santa has a big sack.", ja: "サンタさんは大きなふくろを持っています。" },
        ],
      },
    ],
  },
  {
    word: "shack",
    forms: ["shacks"],
    senses: [
      {
        type: "noun",
        image: "/images/words/shack.svg",
        meaning: { en: "a small, simple house made of wood", ja: "小屋、ぼろぼろの小さな家" },
        examples: [
          { en: "There is an old shack in the woods.", ja: "森に古い小屋があります。" },
          { en: "The shack has one room.", ja: "その小屋には部屋がひとつあります。" },
        ],
      },
    ],
  },
  {
    word: "seep",
    senses: [
      {
        type: "verb",
        meaning: { en: "come through slowly, little by little (for water)", ja: "しみ出る、しみこむ" },
        examples: [
          { en: "Water seeps into the tent.", ja: "水がテントにしみこみます。" },
          { en: "Rain seeps through the roof.", ja: "雨が屋根からしみ出てきます。" },
        ],
      },
    ],
  },
  {
    word: "sheep",
    senses: [
      {
        type: "noun",
        image: "/images/words/sheep.svg",
        meaning: { en: "a farm animal with soft, white wool", ja: "羊" },
        examples: [
          { en: "The sheep is on the ship.", ja: "羊が船に乗っています。" },
          { en: "Sheep eat grass.", ja: "羊は草を食べます。" },
        ],
      },
    ],
  },
  {
    word: "said",
    senses: [
      {
        type: "verb",
        meaning: { en: "past of \"say\": told with words", ja: "言った(sayの過去形)" },
        examples: [
          { en: "She said \"hello\" to me.", ja: "彼女は私に「こんにちは」と言いました。" },
          { en: "Mom said no.", ja: "お母さんはだめと言いました。" },
        ],
      },
    ],
  },
  {
    word: "shed",
    forms: ["sheds"],
    senses: [
      {
        type: "noun",
        image: "/images/words/shed.svg",
        meaning: { en: "a small building for keeping tools", ja: "物置" },
        examples: [
          { en: "The bikes are in the shed.", ja: "自転車は物置にあります。" },
          { en: "Dad keeps his tools in the shed.", ja: "お父さんは物置に道具をしまっています。" },
        ],
      },
    ],
  },
  {
    word: "shoe",
    forms: ["shoes"],
    senses: [
      {
        type: "noun",
        image: "/images/words/shoes.svg",
        meaning: { en: "a thing you wear on your foot to walk outside", ja: "くつ" },
        examples: [
          { en: "Save the shoes for Sunday.", ja: "そのくつは日曜日のために取っておいてね。" },
          { en: "I lost one shoe.", ja: "くつを片方なくしました。" },
        ],
      },
    ],
  },
  {
    word: "so",
    senses: [
      {
        type: "adverb",
        meaning: { en: "very", ja: "とても" },
        examples: [
          { en: "I am so happy!", ja: "とてもうれしい！" },
          { en: "It is so cold today.", ja: "今日はとても寒いです。" },
        ],
      },
      {
        type: "conjunction",
        meaning: { en: "and because of that", ja: "だから" },
        examples: [
          { en: "I was hungry, so I ate.", ja: "おなかがすいていたので、食べました。" },
          { en: "It's raining, so take an umbrella.", ja: "雨だから、かさを持っていってね。" },
        ],
      },
    ],
  },
  {
    word: "seal",
    forms: ["seals"],
    senses: [
      {
        type: "noun",
        image: "/images/words/seal.svg",
        meaning: { en: "a sea animal with smooth fur that swims well", ja: "アザラシ" },
        examples: [
          { en: "She'll see a seal.", ja: "彼女はアザラシを見るでしょう。" },
          { en: "The seal swims in the sea.", ja: "アザラシは海で泳ぎます。" },
        ],
      },
    ],
  },
  {
    word: "she'll",
    senses: [
      {
        type: "pronoun",
        meaning: { en: "short for \"she will\"", ja: "she will(彼女は〜するでしょう)の短い形" },
        examples: [
          { en: "She'll come tomorrow.", ja: "彼女は明日来るでしょう。" },
          { en: "She'll save the seal.", ja: "彼女はアザラシを助けるでしょう。" },
        ],
      },
    ],
  },
  {
    word: "sin",
    senses: [
      {
        type: "noun",
        meaning: { en: "a very wrong thing to do", ja: "罪、とても悪いこと" },
        examples: [
          { en: "In the story, lying is a sin.", ja: "そのお話では、うそは罪です。" },
          { en: "It's a sin to waste food!", ja: "食べ物をむだにするのはいけないことだよ！" },
        ],
      },
    ],
  },
  {
    word: "shin",
    forms: ["shins"],
    senses: [
      {
        type: "noun",
        meaning: { en: "the front of your leg below the knee", ja: "すね" },
        examples: [
          { en: "I hit my shin on the table.", ja: "テーブルにすねをぶつけました。" },
          { en: "Soccer players protect their shins.", ja: "サッカー選手はすねを守ります。" },
        ],
      },
    ],
  },
  {
    word: "sigh",
    forms: ["sighs"],
    senses: [
      {
        type: "verb",
        meaning: { en: "breathe out loudly because you are tired or sad", ja: "ため息をつく" },
        examples: [
          { en: "She sighs when she is tired.", ja: "彼女はつかれるとため息をつきます。" },
          { en: "Don't sigh. You can do it!", ja: "ため息つかないで。きみならできる！" },
        ],
      },
    ],
  },
  {
    word: "shy",
    senses: [
      {
        type: "adjective",
        meaning: { en: "nervous about talking to people", ja: "はずかしがりの、人見知りの" },
        examples: [
          { en: "My little sister is shy.", ja: "妹ははずかしがりやです。" },
          { en: "Don't be shy. Say hello!", ja: "はずかしがらないで。あいさつしよう！" },
        ],
      },
    ],
  },
];
