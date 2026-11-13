import type { WordDetail } from "./types";

// B vs V pair words.
export const bVsVWords: WordDetail[] = [
  {
    word: "ban",
    forms: ["bans"],
    senses: [
      {
        type: "verb",
        meaning: { en: "say that people must not do something", ja: "禁止する(してはいけないと決める)" },
        examples: [
          { en: "The school bans phones in class.", ja: "学校は授業中のスマホを禁止しています。" },
          { en: "They ban dogs in this park.", ja: "この公園では犬は禁止です。" },
        ],
      },
    ],
  },
  {
    word: "van",
    forms: ["vans"],
    senses: [
      {
        type: "noun",
        image: "/images/words/van.svg",
        meaning: { en: "a big car for carrying people or things", ja: "バン(大きめの車)" },
        examples: [
          { en: "The van is very big.", ja: "そのバンはとても大きいです。" },
          { en: "We go to camp in a van.", ja: "私たちはバンでキャンプに行きます。" },
        ],
      },
    ],
  },
  {
    word: "bat",
    forms: ["bats"],
    senses: [
      {
        type: "noun",
        image: "/images/words/bat.svg",
        meaning: { en: "a small animal that flies at night", ja: "コウモリ" },
        examples: [
          { en: "A bat sleeps in the day.", ja: "コウモリは昼間にねむります。" },
          { en: "The bat flies at night.", ja: "コウモリは夜に飛びます。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "a stick for hitting the ball in baseball", ja: "(野球の)バット" },
        examples: [
          { en: "I hit the ball with a bat.", ja: "バットでボールを打ちます。" },
          { en: "My bat is made of wood.", ja: "私のバットは木でできています。" },
        ],
      },
    ],
  },
  {
    word: "vat",
    forms: ["vats"],
    senses: [
      {
        type: "noun",
        image: "/images/words/vat.svg",
        meaning: { en: "a very big container for liquid", ja: "大きなおけ、タンク" },
        examples: [
          { en: "The vat is full of milk.", ja: "そのタンクは牛乳でいっぱいです。" },
          { en: "They make soup in a big vat.", ja: "大きなおけでスープを作ります。" },
        ],
      },
    ],
  },
  {
    word: "bet",
    senses: [
      {
        type: "verb",
        meaning: { en: "feel very sure about something (I bet...)", ja: "きっと〜だと思う" },
        examples: [
          { en: "I bet it will rain today.", ja: "今日はきっと雨がふるよ。" },
          { en: "I bet you can do it!", ja: "きみならきっとできるよ！" },
        ],
      },
    ],
  },
  {
    word: "vet",
    forms: ["vets"],
    senses: [
      {
        type: "noun",
        meaning: { en: "a doctor for animals", ja: "じゅうい(動物のお医者さん)" },
        examples: [
          { en: "My cat is sick, so we go to the vet.", ja: "ねこが病気なので、じゅういさんに行きます。" },
          { en: "The vet is kind to my dog.", ja: "じゅういさんは私の犬にやさしいです。" },
        ],
      },
    ],
  },
  {
    word: "berry",
    forms: ["berries"],
    senses: [
      {
        type: "noun",
        image: "/images/words/berry.svg",
        meaning: { en: "a small, round, sweet fruit", ja: "ベリー(小さくてあまい実)" },
        examples: [
          { en: "This berry is red and sweet.", ja: "このベリーは赤くてあまいです。" },
          { en: "I put berries on my cake.", ja: "ケーキにベリーをのせます。" },
        ],
      },
    ],
  },
  {
    word: "very",
    senses: [
      {
        type: "adverb",
        meaning: { en: "a lot; more than usual", ja: "とても" },
        examples: [
          { en: "The van is very big.", ja: "そのバンはとても大きいです。" },
          { en: "I am very happy today.", ja: "今日はとてもうれしいです。" },
        ],
      },
    ],
  },
  {
    word: "best",
    senses: [
      {
        type: "adjective",
        meaning: { en: "better than all the others", ja: "いちばん良い" },
        examples: [
          { en: "Vote for the best boat.", ja: "いちばん良いボートに投票してね。" },
          { en: "Ken is my best friend.", ja: "ケンは私のいちばんの友だちです。" },
        ],
      },
    ],
  },
  {
    word: "vest",
    forms: ["vests"],
    senses: [
      {
        type: "noun",
        image: "/images/words/vest.svg",
        meaning: { en: "clothing with no sleeves", ja: "ベスト(そでのない服)" },
        examples: [
          { en: "Bring a vest to the beach.", ja: "浜辺にベストを持ってきてね。" },
          { en: "My vest is blue.", ja: "私のベストは青色です。" },
        ],
      },
    ],
  },
  {
    word: "boat",
    forms: ["boats"],
    senses: [
      {
        type: "noun",
        image: "/images/words/boat.svg",
        meaning: { en: "a small ship", ja: "ボート、小さな船" },
        examples: [
          { en: "We ride a boat on the lake.", ja: "湖でボートに乗ります。" },
          { en: "The boat is white.", ja: "そのボートは白いです。" },
        ],
      },
    ],
  },
  {
    word: "vote",
    forms: ["votes"],
    senses: [
      {
        type: "verb",
        meaning: { en: "choose someone or something with your hand or a paper", ja: "投票する(えらんで手をあげたり紙に書いたりする)" },
        examples: [
          { en: "Vote for the best boat.", ja: "いちばん良いボートに投票してね。" },
          { en: "We vote for the class leader.", ja: "学級委員をえらぶために投票します。" },
        ],
      },
    ],
  },
  {
    word: "bow",
    forms: ["bows"],
    senses: [
      {
        type: "verb",
        meaning: { en: "bend your body forward to say hello or thank you", ja: "おじぎする" },
        examples: [
          { en: "We bow to the teacher.", ja: "先生におじぎをします。" },
          { en: "In Japan, people bow a lot.", ja: "日本ではよくおじぎをします。" },
        ],
      },
    ],
  },
  {
    word: "vow",
    forms: ["vows"],
    senses: [
      {
        type: "verb",
        meaning: { en: "make a very strong promise", ja: "ちかう(強く約束する)" },
        examples: [
          { en: "I vow to try my best.", ja: "ベストをつくすとちかいます。" },
          { en: "He vows to come back.", ja: "彼はもどってくるとちかいます。" },
        ],
      },
    ],
  },
  {
    word: "bail",
    senses: [
      {
        type: "verb",
        meaning: { en: "throw water out of a boat with a bucket", ja: "(ボートから水を)かき出す" },
        examples: [
          { en: "Bail the water out of the boat!", ja: "ボートから水をかき出して！" },
          { en: "We bail with a small bucket.", ja: "小さなバケツで水をかき出します。" },
        ],
      },
    ],
  },
  {
    word: "veil",
    forms: ["veils"],
    senses: [
      {
        type: "noun",
        image: "/images/words/veil.svg",
        meaning: { en: "thin cloth that covers the face or head", ja: "ベール(顔や頭をおおう、うすい布)" },
        examples: [
          { en: "The bride wears a white veil.", ja: "花よめさんは白いベールをつけています。" },
          { en: "I can see her face under the veil.", ja: "ベールの下に彼女の顔が見えます。" },
        ],
      },
    ],
  },
  {
    word: "beer",
    senses: [
      {
        type: "noun",
        image: "/images/words/beer.svg",
        meaning: { en: "a drink with alcohol, only for adults", ja: "ビール(大人だけが飲むお酒)" },
        examples: [
          { en: "My dad drinks beer.", ja: "お父さんはビールを飲みます。" },
          { en: "Beer is for adults.", ja: "ビールは大人の飲み物です。" },
        ],
      },
    ],
  },
  {
    word: "veer",
    senses: [
      {
        type: "verb",
        meaning: { en: "suddenly change direction", ja: "急に向きを変える" },
        examples: [
          { en: "The car veers to the left.", ja: "車が急に左へ曲がります。" },
          { en: "The bird veers away from the tree.", ja: "鳥は木をよけて急に向きを変えます。" },
        ],
      },
    ],
  },
  {
    word: "bent",
    senses: [
      {
        type: "adjective",
        meaning: { en: "not straight", ja: "曲がった" },
        examples: [
          { en: "This spoon is bent.", ja: "このスプーンは曲がっています。" },
          { en: "The old tree is bent.", ja: "その古い木は曲がっています。" },
        ],
      },
    ],
  },
  {
    word: "vent",
    forms: ["vents"],
    senses: [
      {
        type: "noun",
        meaning: { en: "a hole that lets air in or out", ja: "通気口(空気が出入りする穴)" },
        examples: [
          { en: "Cold air comes out of the vent.", ja: "通気口から冷たい空気が出てきます。" },
          { en: "Do not cover the vent.", ja: "通気口をふさがないでね。" },
        ],
      },
    ],
  },
  {
    word: "bolt",
    forms: ["bolts"],
    senses: [
      {
        type: "noun",
        image: "/images/words/bolt.svg",
        meaning: { en: "a strong metal pin that holds things together", ja: "ボルト(物をとめる太い金属のねじ)" },
        examples: [
          { en: "Dad turns the bolt.", ja: "お父さんがボルトを回します。" },
          { en: "This bolt holds the chair together.", ja: "このボルトがいすをとめています。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "a line of light in the sky in a storm (lightning bolt)", ja: "いなずま" },
        examples: [
          { en: "I see a bolt of lightning!", ja: "いなずまが見えた！" },
          { en: "The bolt lights up the sky.", ja: "いなずまが空を明るくします。" },
        ],
      },
    ],
  },
  {
    word: "volt",
    forms: ["volts"],
    senses: [
      {
        type: "noun",
        meaning: { en: "a unit that measures electricity", ja: "ボルト(電気の強さの単位)" },
        examples: [
          { en: "This battery has 9 volts.", ja: "この電池は9ボルトです。" },
          { en: "How many volts does it need?", ja: "何ボルト必要ですか？" },
        ],
      },
    ],
  },
  {
    word: "base",
    forms: ["bases"],
    senses: [
      {
        type: "noun",
        meaning: { en: "the bottom part that holds something up", ja: "土台、いちばん下の部分" },
        examples: [
          { en: "The lamp has a heavy base.", ja: "そのランプは土台が重いです。" },
          { en: "The base of the tower is wide.", ja: "とうの土台は広いです。" },
        ],
      },
      {
        type: "noun",
        meaning: { en: "one of the four places a runner touches in baseball", ja: "(野球の)ベース、塁" },
        examples: [
          { en: "Run to first base!", ja: "一塁まで走って！" },
          { en: "She is safe on base.", ja: "彼女は塁でセーフです。" },
        ],
      },
    ],
  },
  {
    word: "vase",
    forms: ["vases"],
    senses: [
      {
        type: "noun",
        image: "/images/words/vase.svg",
        meaning: { en: "a pot for putting flowers in", ja: "花びん" },
        examples: [
          { en: "Put the flowers in the vase.", ja: "花を花びんに入れてね。" },
          { en: "The vase is on the table.", ja: "花びんはテーブルの上にあります。" },
        ],
      },
    ],
  },
  {
    word: "robe",
    forms: ["robes"],
    senses: [
      {
        type: "noun",
        image: "/images/words/robe.svg",
        meaning: { en: "a long, soft coat you wear at home", ja: "ローブ、バスローブ" },
        examples: [
          { en: "I wear a robe after my bath.", ja: "お風呂のあとにローブを着ます。" },
          { en: "Grandpa's robe is warm.", ja: "おじいちゃんのローブはあたたかいです。" },
        ],
      },
    ],
  },
  {
    word: "rove",
    senses: [
      {
        type: "verb",
        meaning: { en: "walk or travel around with no plan", ja: "歩き回る、あちこち旅する" },
        examples: [
          { en: "The cows rove on the hill.", ja: "牛たちは丘を歩き回ります。" },
          { en: "We rove around the town.", ja: "私たちは町をあちこち歩き回ります。" },
        ],
      },
    ],
  },
  {
    word: "curb",
    senses: [
      {
        type: "noun",
        meaning: { en: "the edge between the sidewalk and the road", ja: "歩道のふち(縁石)" },
        examples: [
          { en: "Stop at the curb.", ja: "歩道のふちで止まってね。" },
          { en: "The car is next to the curb.", ja: "車は歩道のふちの横にあります。" },
        ],
      },
    ],
  },
  {
    word: "curve",
    forms: ["curves"],
    senses: [
      {
        type: "noun",
        image: "/images/words/curve.svg",
        meaning: { en: "a line or road that bends", ja: "カーブ、曲がっている線や道" },
        examples: [
          { en: "Slow down at the curve.", ja: "カーブではスピードを落としてね。" },
          { en: "Draw a curve on the paper.", ja: "紙にカーブをかいてね。" },
        ],
      },
    ],
  },
  {
    word: "blew",
    senses: [
      {
        type: "verb",
        meaning: { en: "past of \"blow\": pushed air out", ja: "ふいた(blowの過去形)" },
        examples: [
          { en: "I blew out the candles.", ja: "ろうそくをふき消しました。" },
          { en: "The wind blew my hat away.", ja: "風でぼうしが飛ばされました。" },
        ],
      },
    ],
  },
  {
    word: "view",
    forms: ["views"],
    senses: [
      {
        type: "noun",
        meaning: { en: "what you can see from a place", ja: "景色、ながめ" },
        examples: [
          { en: "The view from the hill is nice.", ja: "丘からの景色はすてきです。" },
          { en: "My room has a view of the sea.", ja: "私の部屋から海が見えます。" },
        ],
      },
    ],
  },
  {
    word: "jibe",
    senses: [
      {
        type: "noun",
        meaning: { en: "an unkind joke about someone", ja: "からかいの言葉、いじわるな冗談" },
        examples: [
          { en: "That jibe made her sad.", ja: "そのからかいの言葉で彼女は悲しくなりました。" },
          { en: "Please don't make jibes at your friends.", ja: "友だちをからかわないでね。" },
        ],
      },
    ],
  },
  {
    word: "jive",
    senses: [
      {
        type: "noun",
        meaning: { en: "a fast, happy dance", ja: "ジャイブ(速くて楽しいダンス)" },
        examples: [
          { en: "They dance the jive.", ja: "彼らはジャイブをおどります。" },
          { en: "The jive is a fun dance.", ja: "ジャイブは楽しいダンスです。" },
        ],
      },
    ],
  },
  {
    word: "rebel",
    forms: ["rebels"],
    senses: [
      {
        type: "noun",
        meaning: { en: "a person who fights against the rules or the leader", ja: "反抗する人、反乱を起こす人" },
        examples: [
          { en: "The rebel did not follow the king.", ja: "その反乱者は王様にしたがいませんでした。" },
          { en: "In the movie, the rebels win.", ja: "映画では反乱者たちが勝ちます。" },
        ],
      },
    ],
  },
  {
    word: "revel",
    senses: [
      {
        type: "verb",
        meaning: { en: "enjoy something very much", ja: "思いきり楽しむ" },
        examples: [
          { en: "We revel in the summer sun.", ja: "夏の太陽を思いきり楽しみます。" },
          { en: "The kids revel at the party.", ja: "子どもたちはパーティーで大はしゃぎします。" },
        ],
      },
    ],
  },
  {
    word: "fiber",
    senses: [
      {
        type: "noun",
        meaning: { en: "the part of food (like vegetables) that is good for your stomach", ja: "食物せんい" },
        examples: [
          { en: "Vegetables have a lot of fiber.", ja: "野菜には食物せんいがたくさんあります。" },
          { en: "Fiber is good for you.", ja: "食物せんいは体にいいです。" },
        ],
      },
    ],
  },
  {
    word: "fiver",
    senses: [
      {
        type: "noun",
        meaning: { en: "a five-dollar or five-pound bill (casual word)", ja: "5ドル札、5ポンド札(くだけた言い方)" },
        examples: [
          { en: "Grandma gave me a fiver.", ja: "おばあちゃんが5ドルくれました。" },
          { en: "This book costs a fiver.", ja: "この本は5ドルです。" },
        ],
      },
    ],
  },
  {
    word: "bile",
    senses: [
      {
        type: "noun",
        meaning: { en: "a green liquid in your body that helps you digest food", ja: "胆汁(食べ物の消化を助ける体の中の液)" },
        examples: [
          { en: "Bile helps your body break down food.", ja: "胆汁は食べ物を消化するのを助けます。" },
          { en: "Bile is made in the body.", ja: "胆汁は体の中で作られます。" },
        ],
      },
    ],
  },
  {
    word: "vile",
    senses: [
      {
        type: "adjective",
        meaning: { en: "very bad or very unpleasant", ja: "とてもひどい、とてもいやな" },
        examples: [
          { en: "This medicine tastes vile!", ja: "この薬はひどい味！" },
          { en: "What a vile smell!", ja: "なんてひどいにおい！" },
        ],
      },
    ],
  },
  {
    word: "dribble",
    forms: ["dribbles"],
    senses: [
      {
        type: "verb",
        meaning: { en: "bounce or kick a ball as you move with it", ja: "ドリブルする" },
        examples: [
          { en: "He can dribble the ball fast.", ja: "彼は速くドリブルできます。" },
          { en: "Dribble the ball to the goal.", ja: "ゴールまでドリブルして。" },
        ],
      },
      {
        type: "verb",
        meaning: { en: "let liquid fall slowly from your mouth", ja: "よだれ(水)をたらす" },
        examples: [
          { en: "The baby dribbles milk.", ja: "赤ちゃんがミルクをたらします。" },
          { en: "Don't dribble on your shirt.", ja: "シャツにたらさないでね。" },
        ],
      },
    ],
  },
  {
    word: "drivel",
    senses: [
      {
        type: "noun",
        meaning: { en: "silly talk that makes no sense", ja: "くだらない話、ばかげた話" },
        examples: [
          { en: "Stop talking drivel!", ja: "くだらない話はやめて！" },
          { en: "That story is drivel.", ja: "その話はばかげています。" },
        ],
      },
    ],
  },
];
