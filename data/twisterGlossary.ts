import { wordTypeLabels } from "@/data/wordGlossary";
import type { GlossaryEntry, WordType } from "@/data/wordGlossary";

// Twisters need a few more word types than the lesson sentences, because some target words
// in the pairs (very, she, then, though...) are not nouns, verbs or adjectives.
export type TwisterWordType = WordType | "adverb" | "pronoun" | "conjunction";

export type TwisterGlossaryEntry = Omit<GlossaryEntry, "type"> & {
  type: TwisterWordType;
};

export const twisterWordTypeLabels: Record<TwisterWordType, GlossaryEntry["meaning"]> = {
  ...wordTypeLabels,
  adverb: { en: "Adverb", ja: "副詞" },
  pronoun: { en: "Pronoun", ja: "代名詞" },
  conjunction: { en: "Conjunction", ja: "接続詞" },
};

// Meanings for the words in each tongue twister, as they are used in that twister.
// The outer key is the pair id from minimalPairs.ts, so the same word can mean different things in different twisters.
// Inner keys are lowercase. Basic words (the, on, a, is...) are left out on purpose, unless they are a target word of the pair.
// "word#2" overrides the entry for the second time a word appears, for twisters that use it in two senses.
export const twisterGlossary: Record<string, Record<string, TwisterGlossaryEntry>> = {
  // R vs L
  "right-light": {
    right: { type: "adverb", meaning: { en: "exactly; just", ja: "ちょうど、すぐ" } },
    light: { type: "noun", image: "/images/words/light.svg", meaning: { en: "something that makes a place bright", ja: "明かり" } },
    read: { type: "verb", image: "/images/words/book.svg", meaning: { en: "look at words and understand them", ja: "読む" } },
    "right#2": { type: "adverb", meaning: { en: "correctly", ja: "正しく" } },
  },
  "rice-lice": {
    rice: { type: "noun", image: "/images/words/rice.svg", meaning: { en: "small white grains you cook and eat", ja: "米、ごはん" } },
    left: { type: "noun", meaning: { en: "the side opposite the right", ja: "左" } },
    lice: { type: "noun", meaning: { en: "tiny insects that live in hair", ja: "シラミ" } },
    right: { type: "noun", meaning: { en: "the side opposite the left", ja: "右" } },
  },
  "road-load": {
    roll: { type: "verb", meaning: { en: "move along on wheels", ja: "(車で)進む" } },
    road: { type: "noun", image: "/images/words/road.svg", meaning: { en: "a way for cars to travel on", ja: "道路" } },
    light: { type: "adjective", meaning: { en: "not heavy", ja: "軽い" } },
    load: { type: "noun", image: "/images/words/box.svg", meaning: { en: "things being carried", ja: "積み荷" } },
  },
  "glass-grass": {
    green: { type: "adjective", meaning: { en: "the color of leaves", ja: "緑の" } },
    grass: { type: "noun", image: "/images/words/grass.svg", meaning: { en: "short green plants that cover the ground", ja: "草、芝生" } },
    grows: { type: "verb", image: "/images/words/plant.svg", meaning: { en: "gets bigger", ja: "育つ" } },
    clear: { type: "adjective", meaning: { en: "easy to see through", ja: "透明な" } },
    glass: { type: "noun", image: "/images/words/glass.svg", meaning: { en: "a cup for drinking, made of glass", ja: "コップ、グラス" } },
  },
  "free-flee": {
    feel: { type: "verb", meaning: { en: "\"feel free\": do it if you want to", ja: "(feel free で)遠慮なく~する" } },
    free: { type: "adjective", meaning: { en: "able to do what you want", ja: "自由な" } },
    flee: { type: "verb", meaning: { en: "run away from danger", ja: "逃げる" } },
    freely: { type: "adverb", meaning: { en: "without limits", ja: "自由に" } },
  },
  "red-led": {
    red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
    lights: { type: "noun", image: "/images/words/light.svg", meaning: { en: "things that make a place bright", ja: "明かり" } },
    led: { type: "verb", meaning: { en: "showed the way (past of lead)", ja: "導いた" } },
    ray: { type: "noun", meaning: { en: "a person's name", ja: "人の名前(レイ)" } },
    lane: { type: "noun", meaning: { en: "a narrow road", ja: "細い道" } },
  },
  "rock-lock": {
    rock: { type: "verb", meaning: { en: "move from side to side", ja: "揺らす" } },
    lock: { type: "noun", image: "/images/words/lock.svg", meaning: { en: "a thing you open with a key", ja: "錠、鍵" } },
    "lock#2": { type: "verb", image: "/images/words/lock.svg", meaning: { en: "close with a key", ja: "鍵をかける" } },
    "rock#2": { type: "noun", image: "/images/words/rock.svg", meaning: { en: "a large, hard piece of stone", ja: "岩" } },
  },
  "rent-lent": {
    rory: { type: "noun", meaning: { en: "a person's name", ja: "人の名前(ローリー)" } },
    rented: { type: "verb", meaning: { en: "paid money to use something", ja: "(お金を払って)借りた" } },
    larry: { type: "noun", meaning: { en: "a person's name", ja: "人の名前(ラリー)" } },
    lent: { type: "verb", meaning: { en: "let someone use something for a time (past of lend)", ja: "貸した" } },
  },
  "royal-loyal": {
    royal: { type: "adjective", image: "/images/words/crown.svg", meaning: { en: "of a king or queen", ja: "王室の" } },
    leader: { type: "noun", meaning: { en: "a person who guides a group", ja: "指導者" } },
    stayed: { type: "verb", meaning: { en: "continued to be", ja: "~のままでいた" } },
    loyal: { type: "adjective", meaning: { en: "always supporting someone", ja: "忠実な" } },
  },
  "arrive-alive": {
    arrive: { type: "verb", meaning: { en: "reach a place", ja: "到着する" } },
    alive: { type: "adjective", meaning: { en: "not dead", ja: "生きている" } },
    alert: { type: "adjective", meaning: { en: "awake and ready", ja: "油断のない" } },
  },
  "correct-collect": {
    correct: { type: "verb", meaning: { en: "fix the mistakes in something", ja: "訂正する" } },
    list: { type: "noun", meaning: { en: "names or things written one after another", ja: "リスト、一覧" } },
    collect: { type: "verb", meaning: { en: "gather things together", ja: "集める" } },
    right: { type: "adjective", meaning: { en: "correct", ja: "正しい" } },
    result: { type: "noun", meaning: { en: "what you get at the end", ja: "結果" } },
  },
  "pray-play": {
    play: { type: "verb", image: "/images/words/ball.svg", meaning: { en: "do a game or sport", ja: "(スポーツなどを)する" } },
    pray: { type: "verb", meaning: { en: "speak to a god", ja: "祈る" } },
    practice: { type: "noun", meaning: { en: "doing something again to get better", ja: "練習" } },
  },
  "price-place": {
    place: { type: "verb", meaning: { en: "put something somewhere", ja: "置く" } },
    price: { type: "noun", meaning: { en: "how much money something costs", ja: "値段" } },
    proper: { type: "adjective", meaning: { en: "right for the purpose", ja: "適切な" } },
    "place#2": { type: "noun", meaning: { en: "a certain position or area", ja: "場所" } },
  },
  "crown-clown": {
    clown: { type: "noun", image: "/images/words/clown.svg", meaning: { en: "a funny performer with a painted face", ja: "ピエロ" } },
    wore: { type: "verb", meaning: { en: "had on the body (past of wear)", ja: "身につけていた" } },
    crown: { type: "noun", image: "/images/words/crown.svg", meaning: { en: "what a king or queen wears on the head", ja: "王冠" } },
    crowd: { type: "noun", meaning: { en: "a large group of people", ja: "群衆、人混み" } },
  },
  "fry-fly": {
    fresh: { type: "adjective", meaning: { en: "just made", ja: "出来たての" } },
    fries: { type: "noun", image: "/images/words/fries.svg", meaning: { en: "long pieces of fried potato", ja: "フライドポテト" } },
    fly: { type: "verb", meaning: { en: "move through the air", ja: "飛ぶ" } },
    fryer: { type: "noun", meaning: { en: "a machine that cooks food in hot oil", ja: "フライヤー、揚げ物器" } },
  },
  "grow-glow": {
    green: { type: "adjective", meaning: { en: "the color of leaves", ja: "緑の" } },
    plants: { type: "noun", image: "/images/words/plant.svg", meaning: { en: "living things that grow in the ground", ja: "植物" } },
    grow: { type: "verb", image: "/images/words/plant.svg", meaning: { en: "get bigger", ja: "育つ" } },
    golden: { type: "adjective", meaning: { en: "the color of gold", ja: "金色の" } },
    glow: { type: "noun", image: "/images/words/sun.svg", meaning: { en: "a soft, warm light", ja: "柔らかな光" } },
  },
  "frame-flame": {
    frame: { type: "verb", image: "/images/words/frame.svg", meaning: { en: "put a border around something", ja: "枠に入れる" } },
    flame: { type: "noun", image: "/images/words/flame.svg", meaning: { en: "the bright, burning part of a fire", ja: "炎" } },
    flickers: { type: "verb", meaning: { en: "burns or shines unsteadily", ja: "揺らめく" } },
  },
  "brown-blown": {
    brown: { type: "adjective", meaning: { en: "the color of wood", ja: "茶色の" } },
    leaves: { type: "noun", image: "/images/words/leaf.svg", meaning: { en: "the flat green parts of a plant", ja: "葉" } },
    blown: { type: "verb", image: "/images/words/breeze.svg", meaning: { en: "moved by the wind", ja: "吹き飛ばされた" } },
    brisk: { type: "adjective", meaning: { en: "quick and fresh", ja: "さわやかな、きびきびした" } },
    breeze: { type: "noun", image: "/images/words/breeze.svg", meaning: { en: "a light wind", ja: "そよ風" } },
  },
  "crash-clash": {
    crash: { type: "noun", meaning: { en: "the loud noise of something hitting hard", ja: "衝突音" } },
    clash: { type: "noun", meaning: { en: "the loud noise of metal things hitting", ja: "ぶつかり合う音" } },
    crossed: { type: "verb", meaning: { en: "went from one side to the other", ja: "横切った" } },
    clear: { type: "adjective", meaning: { en: "with nothing in the way", ja: "何もない" } },
    room: { type: "noun", meaning: { en: "a space inside a building", ja: "部屋" } },
  },
  "wrong-long": {
    wrong: { type: "adjective", meaning: { en: "not correct", ja: "間違った" } },
    roads: { type: "noun", image: "/images/words/road.svg", meaning: { en: "ways for cars to travel on", ja: "道路" } },
    make: { type: "verb", meaning: { en: "cause something to be", ja: "~にする" } },
    long: { type: "adjective", meaning: { en: "not short", ja: "長い" } },
    rides: { type: "noun", meaning: { en: "trips in a car or on a bike", ja: "(乗り物での)移動" } },
    longer: { type: "adjective", meaning: { en: "more long", ja: "より長い" } },
  },

  // B vs V
  "ban-van": {
    ban: { type: "verb", meaning: { en: "say something is not allowed", ja: "禁止する" } },
    van: { type: "noun", image: "/images/words/van.svg", meaning: { en: "a large car for carrying things", ja: "バン(大きめの車)" } },
    next: { type: "adjective", meaning: { en: "coming after this one", ja: "次の" } },
  },
  "bat-vat": {
    bat: { type: "noun", image: "/images/words/bat.svg", meaning: { en: "a small flying animal", ja: "コウモリ" } },
    sat: { type: "verb", image: "/images/words/sit.svg", meaning: { en: "rested on something (past of sit)", ja: "座った、とまった" } },
    vat: { type: "noun", image: "/images/words/vat.svg", meaning: { en: "a very large container for liquid", ja: "大おけ" } },
    shook: { type: "verb", meaning: { en: "moved quickly up and down (past of shake)", ja: "揺さぶった" } },
  },
  "bet-vet": {
    bet: { type: "verb", meaning: { en: "feel very sure", ja: "きっと~だと思う" } },
    vet: { type: "noun", meaning: { en: "a doctor for animals", ja: "獣医" } },
    back: { type: "adverb", meaning: { en: "returned to a place", ja: "戻って" } },
    seven: { type: "noun", meaning: { en: "the number 7; here, 7 o'clock", ja: "7、7時" } },
  },
  "berry-very": {
    very: { type: "adverb", meaning: { en: "to a great degree", ja: "とても" } },
    ripe: { type: "adjective", meaning: { en: "ready to eat", ja: "熟した" } },
    berries: { type: "noun", image: "/images/words/berry.svg", meaning: { en: "small round fruits", ja: "ベリー" } },
    sweet: { type: "adjective", meaning: { en: "tasting like sugar", ja: "甘い" } },
  },
  "best-vest": {
    best: { type: "adjective", meaning: { en: "better than all others", ja: "最も良い" } },
    vest: { type: "noun", image: "/images/words/vest.svg", meaning: { en: "clothing with no sleeves", ja: "ベスト(袖のない服)" } },
    bought: { type: "verb", meaning: { en: "paid for (past of buy)", ja: "買われた" } },
    victor: { type: "noun", meaning: { en: "a person's name", ja: "人の名前(ビクター)" } },
  },
  "boat-vote": {
    vote: { type: "verb", meaning: { en: "show your choice in an election", ja: "投票する" } },
    boat: { type: "noun", image: "/images/words/boat.svg", meaning: { en: "a small ship", ja: "ボート" } },
    "boat#2": { type: "verb", image: "/images/words/boat.svg", meaning: { en: "travel by boat", ja: "ボートで行く" } },
    "vote#2": { type: "noun", meaning: { en: "an event where people choose", ja: "投票" } },
  },
  "bow-vow": {
    bow: { type: "verb", meaning: { en: "bend your body forward", ja: "お辞儀する" } },
    vow: { type: "verb", meaning: { en: "make a serious promise", ja: "誓う" } },
  },
  "bail-veil": {
    bail: { type: "verb", meaning: { en: "leave quickly", ja: "急いで立ち去る" } },
    veil: { type: "noun", image: "/images/words/veil.svg", meaning: { en: "thin cloth that covers the face", ja: "ベール" } },
    falls: { type: "verb", meaning: { en: "comes down", ja: "落ちる" } },
  },
  "beer-veer": {
    veer: { type: "verb", image: "/images/words/turn.svg", meaning: { en: "change direction suddenly", ja: "急に向きを変える" } },
    left: { type: "adverb", meaning: { en: "toward the left side", ja: "左へ" } },
    beer: { type: "noun", image: "/images/words/beer.svg", meaning: { en: "an alcoholic drink", ja: "ビール" } },
    van: { type: "noun", image: "/images/words/van.svg", meaning: { en: "a large car for carrying things", ja: "バン(大きめの車)" } },
  },
  "bent-vent": {
    bent: { type: "adjective", meaning: { en: "not straight", ja: "曲がった" } },
    vent: { type: "noun", meaning: { en: "a hole that lets air in or out", ja: "通気口" } },
    blew: { type: "verb", image: "/images/words/breeze.svg", meaning: { en: "pushed with moving air (past of blow)", ja: "吹き飛ばした" } },
    bolt: { type: "noun", image: "/images/words/bolt.svg", meaning: { en: "a metal pin that holds things together", ja: "ボルト(留め具)" } },
  },
  "bolt-volt": {
    bolt: { type: "verb", image: "/images/words/bolt.svg", meaning: { en: "fasten with a metal pin", ja: "ボルトで留める" } },
    volt: { type: "noun", meaning: { en: "a unit of electricity", ja: "ボルト(電圧の単位)" } },
    box: { type: "noun", image: "/images/words/box.svg", meaning: { en: "a container with flat sides", ja: "箱" } },
    check: { type: "verb", meaning: { en: "look to make sure", ja: "確認する" } },
    volts: { type: "noun", meaning: { en: "units of electricity", ja: "ボルト(電圧の単位)" } },
  },
  "base-vase": {
    put: { type: "verb", meaning: { en: "move something to a place", ja: "置く" } },
    vase: { type: "noun", image: "/images/words/vase.svg", meaning: { en: "a container for flowers", ja: "花瓶" } },
    base: { type: "noun", meaning: { en: "the bottom part of something", ja: "土台、底" } },
    table: { type: "noun", image: "/images/words/table.svg", meaning: { en: "furniture with a flat top", ja: "テーブル" } },
  },
  "robe-rove": {
    rove: { type: "verb", meaning: { en: "walk around with no plan", ja: "歩き回る" } },
    robe: { type: "noun", image: "/images/words/robe.svg", meaning: { en: "a long, loose piece of clothing", ja: "ローブ、ガウン" } },
    again: { type: "adverb", meaning: { en: "one more time", ja: "もう一度" } },
  },
  "curb-curve": {
    curb: { type: "verb", meaning: { en: "slow down or limit", ja: "抑える" } },
    curve: { type: "noun", image: "/images/words/curve.svg", meaning: { en: "a line or road that bends", ja: "カーブ" } },
    next: { type: "adjective", meaning: { en: "coming after this one", ja: "次の" } },
    "curb#2": { type: "noun", meaning: { en: "the raised edge of a road", ja: "縁石" } },
  },
  "blew-view": {
    bay: { type: "noun", image: "/images/words/sea.svg", meaning: { en: "a curved part of the sea next to land", ja: "湾" } },
    breeze: { type: "noun", image: "/images/words/breeze.svg", meaning: { en: "a light wind", ja: "そよ風" } },
    blew: { type: "verb", image: "/images/words/breeze.svg", meaning: { en: "moved as wind (past of blow)", ja: "吹いた" } },
    vivid: { type: "adjective", meaning: { en: "very bright and clear", ja: "鮮やかな" } },
    view: { type: "noun", meaning: { en: "what you can see from a place", ja: "眺め" } },
  },
  "jibe-jive": {
    jibe: { type: "verb", meaning: { en: "agree or fit well", ja: "調和する" } },
    jive: { type: "noun", meaning: { en: "a fast kind of dance", ja: "ジャイブ(ダンス)" } },
    "jive#2": { type: "verb", meaning: { en: "dance the jive", ja: "ジャイブを踊る" } },
    "jibe#2": { type: "noun", meaning: { en: "an unkind joke", ja: "からかい" } },
  },
  "rebel-revel": {
    rebels: { type: "noun", meaning: { en: "people who fight against those in power", ja: "反逆者" } },
    revel: { type: "verb", meaning: { en: "celebrate and have fun", ja: "お祝いして楽しむ" } },
    river: { type: "noun", image: "/images/words/river.svg", meaning: { en: "a long line of moving water", ja: "川" } },
  },
  "fiber-fiver": {
    fiver: { type: "noun", meaning: { en: "a bill worth five dollars or pounds", ja: "5ドル札、5ポンド札" } },
    fiber: { type: "noun", meaning: { en: "the part of plant food that helps digestion", ja: "食物繊維" } },
  },
  "bile-vile": {
    vile: { type: "adjective", meaning: { en: "very unpleasant", ja: "ひどく不快な" } },
    bile: { type: "noun", meaning: { en: "a bitter liquid made in the body", ja: "胆汁" } },
    very: { type: "adverb", meaning: { en: "to a great degree", ja: "とても" } },
    bad: { type: "adjective", meaning: { en: "not good", ja: "悪い" } },
    brew: { type: "noun", meaning: { en: "a drink made by boiling", ja: "煎じた飲み物" } },
  },
  "dribble-drivel": {
    dribble: { type: "verb", meaning: { en: "let liquid fall slowly from the mouth", ja: "(よだれなどを)垂らす" } },
    drivel: { type: "noun", meaning: { en: "liquid from the mouth; also, silly talk", ja: "よだれ、たわごと" } },
    table: { type: "noun", image: "/images/words/table.svg", meaning: { en: "furniture with a flat top", ja: "テーブル" } },
  },

  // S vs SH
  "see-she": {
    she: { type: "pronoun", meaning: { en: "a woman or girl already talked about", ja: "彼女は" } },
    see: { type: "verb", meaning: { en: "look at with your eyes", ja: "見る" } },
    sea: { type: "noun", image: "/images/words/sea.svg", meaning: { en: "a large area of salt water", ja: "海" } },
    wants: { type: "verb", meaning: { en: "would like to have or do", ja: "~したい" } },
  },
  "sip-ship": {
    sip: { type: "verb", meaning: { en: "drink a little at a time", ja: "少しずつ飲む" } },
    soup: { type: "noun", image: "/images/words/soup.svg", meaning: { en: "hot liquid food", ja: "スープ" } },
    ship: { type: "noun", image: "/images/words/ship.svg", meaning: { en: "a large boat", ja: "船" } },
  },
  "sell-shell": {
    sell: { type: "verb", meaning: { en: "give something for money", ja: "売る" } },
    shell: { type: "noun", image: "/images/words/shell.svg", meaning: { en: "the hard cover of a sea animal", ja: "貝殻" } },
  },
  "seat-sheet": {
    keep: { type: "verb", meaning: { en: "leave in the same place", ja: "そのままにしておく" } },
    sheet: { type: "noun", image: "/images/words/sheet.svg", meaning: { en: "a large, thin cloth", ja: "シーツ" } },
    seat: { type: "noun", image: "/images/words/seat.svg", meaning: { en: "a place to sit", ja: "座席" } },
    clean: { type: "adjective", meaning: { en: "not dirty", ja: "きれいな" } },
  },
  "sake-shake": {
    shake: { type: "verb", meaning: { en: "move quickly up and down", ja: "振る" } },
    milkshake: { type: "noun", image: "/images/words/milkshake.svg", meaning: { en: "a cold, sweet milk drink", ja: "ミルクシェイク" } },
    sake: { type: "noun", meaning: { en: "\"for my sake\": to help me", ja: "(for my sake で)私のため" } },
  },
  "save-shave": {
    shave: { type: "verb", meaning: { en: "cut hair off the skin", ja: "ひげをそる" } },
    well: { type: "adverb", meaning: { en: "in a good way", ja: "上手に" } },
    save: { type: "verb", meaning: { en: "use less of something", ja: "節約する" } },
    gel: { type: "noun", meaning: { en: "a thick, soft liquid", ja: "ジェル" } },
  },
  "same-shame": {
    shame: { type: "noun", meaning: { en: "\"it is a shame\": it is too bad", ja: "残念なこと" } },
    same: { type: "adjective", meaning: { en: "not different", ja: "同じ" } },
    name: { type: "noun", meaning: { en: "what someone is called", ja: "名前" } },
  },
  "sign-shine": {
    sign: { type: "verb", meaning: { en: "write your name on something", ja: "署名する" } },
    "sign#2": { type: "noun", image: "/images/words/sign.svg", meaning: { en: "a board with information on it", ja: "看板" } },
    make: { type: "verb", meaning: { en: "cause something to happen", ja: "~させる" } },
    shine: { type: "verb", image: "/images/words/sun.svg", meaning: { en: "give out bright light", ja: "輝く" } },
  },
  "sort-short": {
    sort: { type: "verb", meaning: { en: "put things into groups", ja: "分類する" } },
    short: { type: "adjective", meaning: { en: "not long", ja: "短い" } },
    pants: { type: "noun", image: "/images/words/pants.svg", meaning: { en: "clothing for your legs", ja: "ズボン" } },
    socks: { type: "noun", image: "/images/words/sock.svg", meaning: { en: "things you wear on your feet inside shoes", ja: "靴下" } },
  },
  "sock-shock": {
    red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
    sock: { type: "noun", image: "/images/words/sock.svg", meaning: { en: "something you wear on your foot inside a shoe", ja: "靴下" } },
    gave: { type: "verb", meaning: { en: "caused someone to have (past of give)", ja: "与えた" } },
    clown: { type: "noun", image: "/images/words/clown.svg", meaning: { en: "a funny performer with a painted face", ja: "ピエロ" } },
    big: { type: "adjective", meaning: { en: "large in size", ja: "大きい" } },
    shock: { type: "noun", meaning: { en: "a sudden, strong surprise", ja: "衝撃" } },
  },
  "sew-show": {
    sew: { type: "verb", meaning: { en: "make or fix clothes with a needle and thread", ja: "縫う" } },
    dress: { type: "noun", image: "/images/words/dress.svg", meaning: { en: "one-piece clothing for a woman", ja: "ドレス、ワンピース" } },
    show: { type: "verb", meaning: { en: "let people see something", ja: "見せる" } },
    "show#2": { type: "noun", meaning: { en: "an event for people to watch", ja: "ショー" } },
  },
  "sore-shore": {
    feet: { type: "noun", image: "/images/words/feet.svg", meaning: { en: "the parts of your body you stand on", ja: "足" } },
    sore: { type: "adjective", meaning: { en: "hurting", ja: "痛い" } },
    sandy: { type: "adjective", meaning: { en: "covered with sand", ja: "砂の" } },
    shore: { type: "noun", image: "/images/words/beach.svg", meaning: { en: "the land along the sea", ja: "海岸" } },
  },
  "sack-shack": {
    shack: { type: "noun", image: "/images/words/shack.svg", meaning: { en: "a small, poorly built house", ja: "小屋" } },
    sack: { type: "noun", image: "/images/words/sack.svg", meaning: { en: "a large, strong bag", ja: "大きな袋" } },
    short: { type: "adjective", meaning: { en: "not tall", ja: "背の低い" } },
    soft: { type: "adjective", meaning: { en: "not hard", ja: "柔らかい" } },
  },
  "seep-sheep": {
    see: { type: "verb", meaning: { en: "look at with your eyes", ja: "見る" } },
    water: { type: "noun", image: "/images/words/water.svg", meaning: { en: "the clear liquid we drink", ja: "水" } },
    seep: { type: "verb", meaning: { en: "flow slowly through small holes", ja: "しみ出る" } },
    sleeping: { type: "adjective", meaning: { en: "not awake", ja: "眠っている" } },
    sheep: { type: "noun", image: "/images/words/sheep.svg", meaning: { en: "a farm animal with wool", ja: "羊" } },
  },
  "said-shed": {
    said: { type: "verb", meaning: { en: "spoke these words (past of say)", ja: "言った" } },
    save: { type: "verb", meaning: { en: "keep for later", ja: "取っておく" } },
    red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
    van: { type: "noun", image: "/images/words/van.svg", meaning: { en: "a large car for carrying things", ja: "バン(大きめの車)" } },
    shed: { type: "noun", image: "/images/words/shed.svg", meaning: { en: "a small building for storing things", ja: "物置" } },
  },
  "sue-shoe": {
    sue: { type: "noun", meaning: { en: "a person's name", ja: "人の名前(スー)" } },
    lost: { type: "verb", meaning: { en: "could not find anymore (past of lose)", ja: "なくした" } },
    shoe: { type: "noun", image: "/images/words/shoes.svg", meaning: { en: "something you wear on your foot", ja: "靴" } },
    bought: { type: "verb", meaning: { en: "paid money for (past of buy)", ja: "買った" } },
    new: { type: "adjective", meaning: { en: "not old", ja: "新しい" } },
  },
  "so-show": {
    so: { type: "conjunction", meaning: { en: "in order that; for this reason", ja: "だから、~するように" } },
    show: { type: "verb", meaning: { en: "let people see something", ja: "見せる" } },
    "show#2": { type: "noun", meaning: { en: "an event for people to watch", ja: "ショー" } },
    know: { type: "verb", meaning: { en: "have information in your mind", ja: "知っている" } },
  },
  "seal-she'll": {
    "she'll": { type: "pronoun", meaning: { en: "short for \"she will\"", ja: "she will の短縮形" } },
    see: { type: "verb", meaning: { en: "look at with your eyes", ja: "見る" } },
    seal: { type: "noun", image: "/images/words/seal.svg", meaning: { en: "a sea animal with flippers", ja: "アザラシ" } },
    save: { type: "verb", meaning: { en: "keep safe from danger", ja: "助ける" } },
  },
  "sin-shin": {
    sin: { type: "noun", meaning: { en: "something very wrong to do", ja: "罪" } },
    kick: { type: "verb", meaning: { en: "hit with your foot", ja: "蹴る" } },
    shin: { type: "noun", meaning: { en: "the front of your leg below the knee", ja: "すね" } },
  },
  "sigh-shy": {
    shy: { type: "adjective", meaning: { en: "nervous around other people", ja: "恥ずかしがりの" } },
    girl: { type: "noun", meaning: { en: "a young female person", ja: "女の子" } },
    let: { type: "verb", meaning: { en: "\"let out\": make a sound", ja: "(let out で)声を出す" } },
    big: { type: "adjective", meaning: { en: "large in size", ja: "大きい" } },
    sad: { type: "adjective", meaning: { en: "not happy", ja: "悲しい" } },
    sigh: { type: "noun", meaning: { en: "a long breath out when sad or tired", ja: "ため息" } },
  },

  // Short I vs Long E
  "sit-seat": {
    sit: { type: "verb", image: "/images/words/sit.svg", meaning: { en: "rest on a chair", ja: "座る" } },
    red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
    seat: { type: "noun", image: "/images/words/seat.svg", meaning: { en: "a place to sit", ja: "座席" } },
  },
  "ship-sheep": {
    sheep: { type: "noun", image: "/images/words/sheep.svg", meaning: { en: "a farm animal with wool", ja: "羊" } },
    ship: { type: "noun", image: "/images/words/ship.svg", meaning: { en: "a large boat", ja: "船" } },
    sailed: { type: "verb", meaning: { en: "traveled on water", ja: "航海した" } },
    sea: { type: "noun", image: "/images/words/sea.svg", meaning: { en: "a large area of salt water", ja: "海" } },
  },
  "bit-beat": {
    bug: { type: "noun", image: "/images/words/bug.svg", meaning: { en: "a small insect", ja: "虫" } },
    bit: { type: "verb", meaning: { en: "cut with teeth (past of bite)", ja: "かんだ、刺した" } },
    boy: { type: "noun", meaning: { en: "a young male person", ja: "男の子" } },
    beat: { type: "verb", meaning: { en: "hit many times; also, won against (past of beat)", ja: "たたいた、打ち負かした" } },
  },
  "live-leave": {
    leave: { type: "verb", meaning: { en: "go away from", ja: "去る" } },
    place: { type: "noun", meaning: { en: "a certain position or area", ja: "場所" } },
    live: { type: "verb", image: "/images/words/shack.svg", meaning: { en: "have your home somewhere", ja: "住む" } },
  },
  "fit-feet": {
    red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
    shoes: { type: "noun", image: "/images/words/shoes.svg", meaning: { en: "things you wear on your feet", ja: "靴" } },
    fit: { type: "verb", meaning: { en: "be the right size", ja: "ぴったり合う" } },
    feet: { type: "noun", image: "/images/words/feet.svg", meaning: { en: "the parts of your body you stand on", ja: "足" } },
  },
  "mitt-meet": {
    meet: { type: "verb", meaning: { en: "come together with someone", ja: "会う" } },
    man: { type: "noun", meaning: { en: "an adult male person", ja: "男の人" } },
    mitt: { type: "noun", image: "/images/words/mitt.svg", meaning: { en: "a large glove for catching a ball", ja: "(野球の)ミット" } },
  },
  "rid-read": {
    get: { type: "verb", meaning: { en: "\"get rid of\": throw away", ja: "(get rid of で)処分する" } },
    rid: { type: "adjective", meaning: { en: "free of something you do not want", ja: "(get rid of で)~を取り除く" } },
    read: { type: "verb", image: "/images/words/book.svg", meaning: { en: "look at words and understand them", ja: "読む" } },
  },
  "fill-feel": {
    fill: { type: "verb", meaning: { en: "make something full", ja: "満たす" } },
    glass: { type: "noun", image: "/images/words/glass.svg", meaning: { en: "a cup for drinking, made of glass", ja: "コップ、グラス" } },
    feel: { type: "verb", meaning: { en: "have a certain state in the body", ja: "感じる" } },
    full: { type: "adjective", meaning: { en: "having eaten or drunk enough", ja: "満腹の" } },
  },
  "hill-heal": {
    heal: { type: "verb", meaning: { en: "make someone healthy again", ja: "治す、癒す" } },
    man: { type: "noun", meaning: { en: "an adult male person", ja: "男の人" } },
    hill: { type: "noun", image: "/images/words/hill.svg", meaning: { en: "high land, smaller than a mountain", ja: "丘" } },
  },
  "still-steel": {
    stand: { type: "verb", meaning: { en: "be on your feet", ja: "立つ" } },
    still: { type: "adjective", meaning: { en: "not moving", ja: "じっとした" } },
    strong: { type: "adjective", meaning: { en: "hard to break", ja: "頑丈な" } },
    steel: { type: "noun", meaning: { en: "a very hard metal", ja: "鋼鉄" } },
    gate: { type: "noun", image: "/images/words/gate.svg", meaning: { en: "a door in a fence or wall", ja: "門" } },
  },
  "slip-sleep": {
    sheep: { type: "noun", image: "/images/words/sheep.svg", meaning: { en: "a farm animal with wool", ja: "羊" } },
    slip: { type: "verb", meaning: { en: "slide and almost fall", ja: "滑る" } },
    sleep: { type: "verb", image: "/images/words/bed.svg", meaning: { en: "rest with your eyes closed", ja: "眠る" } },
  },
  "chip-cheap": {
    cheap: { type: "adjective", meaning: { en: "low in price", ja: "安い" } },
    cup: { type: "noun", image: "/images/words/cup.svg", meaning: { en: "a small container for drinks", ja: "カップ" } },
    small: { type: "adjective", meaning: { en: "not big", ja: "小さい" } },
    chip: { type: "noun", meaning: { en: "a small broken part on the edge", ja: "欠けた部分" } },
  },
  "grin-green": {
    green: { type: "adjective", meaning: { en: "the color of leaves", ja: "緑の" } },
    shin: { type: "noun", meaning: { en: "the front of your leg below the knee", ja: "すね" } },
    big: { type: "adjective", meaning: { en: "large in size", ja: "大きい" } },
    grin: { type: "noun", image: "/images/words/grin.svg", meaning: { en: "a wide smile", ja: "にっこりした笑顔" } },
  },
  "lick-leak": {
    lick: { type: "verb", meaning: { en: "touch with your tongue", ja: "なめる" } },
    water: { type: "noun", image: "/images/words/water.svg", meaning: { en: "the clear liquid we drink", ja: "水" } },
    leak: { type: "noun", image: "/images/words/water.svg", meaning: { en: "a hole where liquid comes out", ja: "水漏れ" } },
  },
  "pick-peak": {
    pick: { type: "verb", meaning: { en: "take from a plant", ja: "摘む" } },
    berry: { type: "noun", image: "/images/words/berry.svg", meaning: { en: "a small round fruit", ja: "ベリー" } },
    peak: { type: "noun", image: "/images/words/peak.svg", meaning: { en: "the very top of a hill or mountain", ja: "頂上" } },
    hill: { type: "noun", image: "/images/words/hill.svg", meaning: { en: "high land, smaller than a mountain", ja: "丘" } },
  },
  "dip-deep": {
    take: { type: "verb", meaning: { en: "\"take a breath\": breathe in", ja: "(take a breath で)息を吸う" } },
    deep: { type: "adjective", meaning: { en: "going far down or in", ja: "深い" } },
    breath: { type: "noun", meaning: { en: "air you take in", ja: "息" } },
    dip: { type: "verb", meaning: { en: "put quickly into liquid", ja: "少し浸す" } },
    toe: { type: "noun", image: "/images/words/feet.svg", meaning: { en: "one of the five parts at the end of your foot", ja: "足の指" } },
  },
  "mill-meal": {
    big: { type: "adjective", meaning: { en: "large in size", ja: "大きい" } },
    meal: { type: "noun", image: "/images/words/meal.svg", meaning: { en: "the food you eat at one time", ja: "食事" } },
    old: { type: "adjective", meaning: { en: "not new", ja: "古い" } },
    mill: { type: "noun", image: "/images/words/mill.svg", meaning: { en: "a building where grain is made into flour", ja: "製粉所" } },
  },
  "sin-seen": {
    sin: { type: "noun", meaning: { en: "something very wrong to do", ja: "罪" } },
    seen: { type: "verb", meaning: { en: "noticed by people (past participle of see)", ja: "見られる" } },
  },
  "it-eat": {
    see: { type: "verb", meaning: { en: "look at with your eyes", ja: "見る" } },
    it: { type: "pronoun", meaning: { en: "the thing already talked about", ja: "それ" } },
    eat: { type: "verb", image: "/images/words/meal.svg", meaning: { en: "put food in your mouth and swallow it", ja: "食べる" } },
    hot: { type: "adjective", meaning: { en: "very warm", ja: "熱い" } },
    cold: { type: "adjective", meaning: { en: "not warm", ja: "冷たい" } },
  },
  "hit-heat": {
    hit: { type: "verb", meaning: { en: "touch with force", ja: "たたく" } },
    glass: { type: "noun", image: "/images/words/glass.svg", meaning: { en: "a cup for drinking, made of glass", ja: "コップ、グラス" } },
    heat: { type: "noun", image: "/images/words/sun.svg", meaning: { en: "high temperature", ja: "暑さ、熱" } },
  },

  // TH
  "think-sink": {
    think: { type: "verb", meaning: { en: "have an idea or opinion", ja: "思う" } },
    ship: { type: "noun", image: "/images/words/ship.svg", meaning: { en: "a large boat", ja: "船" } },
    sink: { type: "verb", meaning: { en: "go down under water", ja: "沈む" } },
  },
  "thin-sin": {
    sin: { type: "noun", meaning: { en: "something very wrong to do", ja: "罪" } },
    thin: { type: "adjective", meaning: { en: "having little fat on the body", ja: "やせた" } },
  },
  "thank-sank": {
    thank: { type: "verb", meaning: { en: "say you are grateful", ja: "感謝する" } },
    diver: { type: "noun", meaning: { en: "a person who works under water", ja: "潜水士、ダイバー" } },
    treasure: { type: "noun", image: "/images/words/treasure.svg", meaning: { en: "gold and other valuable things", ja: "宝物" } },
    sank: { type: "verb", meaning: { en: "went down under water", ja: "沈んだ" } },
  },
  "thick-sick": {
    thick: { type: "adjective", meaning: { en: "made of heavy, warm material", ja: "厚い" } },
    coat: { type: "noun", image: "/images/words/coat.svg", meaning: { en: "warm clothing you wear outside", ja: "コート" } },
    kept: { type: "verb", meaning: { en: "made something stay a certain way (past of keep)", ja: "保った" } },
    sick: { type: "adjective", meaning: { en: "not healthy", ja: "病気の" } },
    sheep: { type: "noun", image: "/images/words/sheep.svg", meaning: { en: "a farm animal with wool", ja: "羊" } },
    warm: { type: "adjective", meaning: { en: "a little hot, in a nice way", ja: "暖かい" } },
  },
  "thigh-sight": {
    run: { type: "verb", meaning: { en: "move fast on your feet", ja: "走る" } },
    strong: { type: "adjective", meaning: { en: "having a lot of power", ja: "強い" } },
    thighs: { type: "noun", meaning: { en: "the top parts of your legs", ja: "太もも" } },
    wonderful: { type: "adjective", meaning: { en: "very good", ja: "すばらしい" } },
    sight: { type: "noun", meaning: { en: "something you see", ja: "光景" } },
  },
  "thought-sought": {
    thought: { type: "verb", meaning: { en: "had in mind (past of think)", ja: "考えた" } },
    spot: { type: "noun", meaning: { en: "a certain place", ja: "場所" } },
    sought: { type: "verb", meaning: { en: "looked for (past of seek)", ja: "探し求めた" } },
  },
  "thaw-saw": {
    saw: { type: "verb", meaning: { en: "looked at with your eyes (past of see)", ja: "見た" } },
    ice: { type: "noun", image: "/images/words/ice.svg", meaning: { en: "frozen water", ja: "氷" } },
    thaw: { type: "verb", image: "/images/words/water.svg", meaning: { en: "stop being frozen", ja: "解ける" } },
  },
  "thumb-sum": {
    use: { type: "verb", meaning: { en: "do something with a thing", ja: "使う" } },
    thumb: { type: "noun", image: "/images/words/thumb.svg", meaning: { en: "the short, thick finger on your hand", ja: "親指" } },
    add: { type: "verb", meaning: { en: "put numbers together", ja: "足す" } },
    sum: { type: "noun", meaning: { en: "the total of numbers added", ja: "合計" } },
  },
  "three-free": {
    three: { type: "noun", meaning: { en: "the number 3", ja: "3" } },
    green: { type: "adjective", meaning: { en: "the color of leaves", ja: "緑の" } },
    frogs: { type: "noun", image: "/images/words/frog.svg", meaning: { en: "small green animals that jump", ja: "カエル" } },
    free: { type: "adjective", meaning: { en: "able to do what you want", ja: "自由な" } },
    flee: { type: "verb", meaning: { en: "run away from danger", ja: "逃げる" } },
  },
  "thread-shred": {
    shred: { type: "verb", meaning: { en: "tore into small pieces", ja: "細かく引き裂いた" } },
    thin: { type: "adjective", meaning: { en: "narrow; not thick", ja: "細い" } },
    red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
    thread: { type: "noun", image: "/images/words/thread.svg", meaning: { en: "a long, thin string for sewing", ja: "糸" } },
  },
  "they-day": {
    they: { type: "pronoun", meaning: { en: "the people already talked about", ja: "彼らは" } },
    play: { type: "verb", image: "/images/words/ball.svg", meaning: { en: "have fun with a game", ja: "遊ぶ" } },
    day: { type: "noun", image: "/images/words/sun.svg", meaning: { en: "a period of 24 hours; the time when it is light", ja: "日、昼間" } },
  },
  "then-den": {
    hen: { type: "noun", image: "/images/words/hen.svg", meaning: { en: "a female chicken", ja: "めんどり" } },
    then: { type: "adverb", meaning: { en: "after that", ja: "それから" } },
    ran: { type: "verb", meaning: { en: "moved fast on feet (past of run)", ja: "走った" } },
    den: { type: "noun", meaning: { en: "the home of a wild animal", ja: "(動物の)巣穴" } },
  },
  "though-dough": {
    though: { type: "conjunction", meaning: { en: "even if; despite the fact that", ja: "~だけれども" } },
    dough: { type: "noun", meaning: { en: "a soft mix for making bread", ja: "パン生地" } },
    thaw: { type: "verb", meaning: { en: "stop being frozen", ja: "解ける" } },
    oven: { type: "noun", image: "/images/words/oven.svg", meaning: { en: "a machine that bakes food", ja: "オーブン" } },
    goes: { type: "verb", meaning: { en: "moves to a place", ja: "行く" } },
  },
  "those-doze": {
    those: { type: "pronoun", meaning: { en: "the people being talked about", ja: "それらの人々" } },
    doze: { type: "verb", meaning: { en: "sleep lightly for a short time", ja: "うとうとする" } },
    smelling: { type: "verb", meaning: { en: "noticing with your nose", ja: "においをかいでいる" } },
    rose: { type: "noun", image: "/images/words/rose.svg", meaning: { en: "a flower that often has a sweet smell", ja: "バラ" } },
  },
  "there-dare": {
    dare: { type: "verb", meaning: { en: "be brave enough to do something", ja: "思い切って~する" } },
    go: { type: "verb", meaning: { en: "move to a place", ja: "行く" } },
    there: { type: "adverb", meaning: { en: "in or to that place", ja: "そこに、そこへ" } },
  },
  "than-dan": {
    dan: { type: "noun", meaning: { en: "a person's name", ja: "人の名前(ダン)" } },
    ran: { type: "verb", meaning: { en: "moved fast on feet (past of run)", ja: "走った" } },
    faster: { type: "adverb", meaning: { en: "more quickly", ja: "より速く" } },
    than: { type: "conjunction", meaning: { en: "used to compare two things", ja: "~よりも" } },
    red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
    van: { type: "noun", image: "/images/words/van.svg", meaning: { en: "a large car for carrying things", ja: "バン(大きめの車)" } },
  },
  "breathe-breed": {
    breathe: { type: "verb", meaning: { en: "take air in and out", ja: "呼吸する" } },
    rare: { type: "adjective", meaning: { en: "not often found", ja: "珍しい" } },
    dragon: { type: "noun", meaning: { en: "a large imaginary animal that breathes fire", ja: "竜、ドラゴン" } },
    breed: { type: "noun", meaning: { en: "a certain kind of animal", ja: "品種" } },
  },
  "bathe-bade": {
    bade: { type: "verb", meaning: { en: "told someone to do something (past of bid)", ja: "命じた" } },
    bathe: { type: "verb", meaning: { en: "wash your body", ja: "入浴する" } },
    went: { type: "verb", meaning: { en: "moved to a place (past of go)", ja: "行った" } },
    bed: { type: "noun", image: "/images/words/bed.svg", meaning: { en: "furniture you sleep on", ja: "ベッド" } },
  },
  "other-udder": {
    cow: { type: "noun", image: "/images/words/cow.svg", meaning: { en: "a large farm animal that gives milk", ja: "牛" } },
    huge: { type: "adjective", meaning: { en: "very big", ja: "巨大な" } },
    udder: { type: "noun", meaning: { en: "the part of a cow that makes milk", ja: "(牛の)乳房" } },
    other: { type: "pronoun", meaning: { en: "a different one", ja: "ほかのもの" } },
  },
  "worthy-wordy": {
    worthy: { type: "adjective", meaning: { en: "good enough to deserve respect", ja: "価値のある" } },
    apology: { type: "noun", meaning: { en: "words saying you are sorry", ja: "謝罪" } },
    wordy: { type: "adjective", meaning: { en: "using too many words", ja: "言葉が多すぎる" } },
  },

  // Final consonants
  "cap-cab": {
    leave: { type: "verb", meaning: { en: "let something stay in a place", ja: "置いていく" } },
    red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
    cap: { type: "noun", image: "/images/words/cap.svg", meaning: { en: "a soft hat", ja: "帽子" } },
    yellow: { type: "adjective", meaning: { en: "the color of a lemon", ja: "黄色い" } },
    cab: { type: "noun", image: "/images/words/cab.svg", meaning: { en: "a car you pay to ride in", ja: "タクシー" } },
  },
  "back-bag": {
    carry: { type: "verb", meaning: { en: "hold something while moving", ja: "運ぶ" } },
    red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
    bag: { type: "noun", image: "/images/words/bag.svg", meaning: { en: "something for carrying things", ja: "かばん" } },
    back: { type: "noun", meaning: { en: "the part of your body behind you", ja: "背中" } },
  },
  "rice-rise": {
    watch: { type: "verb", meaning: { en: "look at for some time", ja: "眺める" } },
    sun: { type: "noun", image: "/images/words/sun.svg", meaning: { en: "the bright star in the sky by day", ja: "太陽" } },
    rise: { type: "verb", image: "/images/words/sun.svg", meaning: { en: "come up in the sky", ja: "昇る" } },
    eat: { type: "verb", image: "/images/words/meal.svg", meaning: { en: "put food in your mouth and swallow it", ja: "食べる" } },
    rice: { type: "noun", image: "/images/words/rice.svg", meaning: { en: "small white grains you cook and eat", ja: "米、ごはん" } },
  },
  "pick-pig": {
    pick: { type: "verb", meaning: { en: "choose and take", ja: "摘む、選ぶ" } },
    sweet: { type: "adjective", meaning: { en: "tasting like sugar", ja: "甘い" } },
    red: { type: "adjective", image: "/images/words/red.svg", meaning: { en: "the color of blood", ja: "赤い" } },
    apple: { type: "noun", image: "/images/words/apple.svg", meaning: { en: "a round red or green fruit", ja: "りんご" } },
    little: { type: "adjective", meaning: { en: "small", ja: "小さい" } },
    pig: { type: "noun", image: "/images/words/pig.svg", meaning: { en: "a pink farm animal", ja: "豚" } },
  },
  "bet-bed": {
    bet: { type: "verb", meaning: { en: "feel very sure", ja: "きっと~だと思う" } },
    love: { type: "verb", meaning: { en: "like very much", ja: "大好きである" } },
    warm: { type: "adjective", meaning: { en: "a little hot, in a nice way", ja: "暖かい" } },
    cozy: { type: "adjective", meaning: { en: "warm and comfortable", ja: "居心地の良い" } },
    bed: { type: "noun", image: "/images/words/bed.svg", meaning: { en: "furniture you sleep on", ja: "ベッド" } },
  },
  "leaf-leave": {
    look: { type: "verb", meaning: { en: "turn your eyes toward something", ja: "見る" } },
    green: { type: "adjective", meaning: { en: "the color of leaves", ja: "緑の" } },
    leaf: { type: "noun", image: "/images/words/leaf.svg", meaning: { en: "a flat green part of a plant", ja: "葉" } },
    leave: { type: "verb", meaning: { en: "go away from a place", ja: "出発する" } },
  },
  "safe-save": {
    save: { type: "verb", meaning: { en: "help someone in danger", ja: "助ける" } },
    little: { type: "adjective", meaning: { en: "small", ja: "小さい" } },
    bird: { type: "noun", image: "/images/words/bird.svg", meaning: { en: "an animal with wings and feathers", ja: "鳥" } },
    keep: { type: "verb", meaning: { en: "make something stay a certain way", ja: "保つ" } },
    safe: { type: "adjective", meaning: { en: "not in danger", ja: "安全な" } },
  },
  "rope-robe": {
    tie: { type: "verb", meaning: { en: "fasten with a knot", ja: "結ぶ" } },
    long: { type: "adjective", meaning: { en: "not short", ja: "長い" } },
    rope: { type: "noun", image: "/images/words/rope.svg", meaning: { en: "a strong, thick string", ja: "ロープ" } },
    warm: { type: "adjective", meaning: { en: "keeping you from being cold", ja: "暖かい" } },
    robe: { type: "noun", image: "/images/words/robe.svg", meaning: { en: "a long, loose piece of clothing", ja: "ローブ、ガウン" } },
  },
  "seat-seed": {
    take: { type: "verb", meaning: { en: "\"take a seat\": sit down", ja: "(take a seat で)座る" } },
    seat: { type: "noun", image: "/images/words/seat.svg", meaning: { en: "a place to sit", ja: "座席" } },
    plant: { type: "verb", image: "/images/words/plant.svg", meaning: { en: "put in the ground to grow", ja: "植える" } },
    lucky: { type: "adjective", meaning: { en: "bringing good luck", ja: "幸運な" } },
    seed: { type: "noun", image: "/images/words/seed.svg", meaning: { en: "the small part a plant grows from", ja: "種" } },
  },
  "cart-card": {
    cart: { type: "noun", image: "/images/words/cart.svg", meaning: { en: "a small vehicle you push to carry things", ja: "カート" } },
    card: { type: "noun", image: "/images/words/card.svg", meaning: { en: "a small piece of stiff paper", ja: "カード" } },
  },
  "dock-dog": {
    dog: { type: "noun", image: "/images/words/dog.svg", meaning: { en: "a common pet that barks", ja: "犬" } },
    dashed: { type: "verb", meaning: { en: "ran very quickly", ja: "突進した" } },
    dock: { type: "noun", image: "/images/words/dock.svg", meaning: { en: "a platform where boats stop", ja: "桟橋" } },
  },
  "lock-log": {
    lock: { type: "verb", image: "/images/words/lock.svg", meaning: { en: "close with a key", ja: "鍵をかける" } },
    big: { type: "adjective", meaning: { en: "large in size", ja: "大きい" } },
    gate: { type: "noun", image: "/images/words/gate.svg", meaning: { en: "a door in a fence or wall", ja: "門" } },
    wooden: { type: "adjective", meaning: { en: "made of wood", ja: "木の" } },
    log: { type: "noun", image: "/images/words/log.svg", meaning: { en: "a thick piece of a cut tree", ja: "丸太" } },
  },
  "buck-bug": {
    little: { type: "adjective", meaning: { en: "small", ja: "小さい" } },
    bug: { type: "noun", image: "/images/words/bug.svg", meaning: { en: "a small insect", ja: "虫" } },
    sat: { type: "verb", image: "/images/words/sit.svg", meaning: { en: "rested on something (past of sit)", ja: "とまった" } },
    brave: { type: "adjective", meaning: { en: "not afraid", ja: "勇敢な" } },
    buck: { type: "noun", meaning: { en: "a male deer", ja: "オスの鹿" } },
  },
  "bat-bad": {
    little: { type: "adjective", meaning: { en: "small", ja: "小さい" } },
    brown: { type: "adjective", meaning: { en: "the color of wood", ja: "茶色の" } },
    bat: { type: "noun", image: "/images/words/bat.svg", meaning: { en: "a small flying animal", ja: "コウモリ" } },
    bad: { type: "adjective", meaning: { en: "not good", ja: "悪い" } },
  },
  "hit-hid": {
    hit: { type: "verb", image: "/images/words/ball.svg", meaning: { en: "touch with force (past of hit)", ja: "打った" } },
    ball: { type: "noun", image: "/images/words/ball.svg", meaning: { en: "a round thing used in games", ja: "ボール" } },
    hid: { type: "verb", meaning: { en: "went where no one can see (past of hide)", ja: "隠れた" } },
    tree: { type: "noun", image: "/images/words/tree.svg", meaning: { en: "a tall plant with a wooden trunk", ja: "木" } },
  },
  "coat-cod": {
    fish: { type: "verb", image: "/images/words/fish.svg", meaning: { en: "try to catch fish", ja: "釣りをする" } },
    cod: { type: "noun", image: "/images/words/fish.svg", meaning: { en: "a large sea fish", ja: "タラ" } },
    get: { type: "verb", meaning: { en: "go and bring", ja: "取ってくる" } },
    coat: { type: "noun", image: "/images/words/coat.svg", meaning: { en: "warm clothing you wear outside", ja: "コート" } },
  },
  "mat-mad": {
    mad: { type: "adjective", meaning: { en: "angry", ja: "怒った" } },
    hat: { type: "noun", image: "/images/words/hat.svg", meaning: { en: "something you wear on your head", ja: "帽子" } },
    mat: { type: "noun", image: "/images/words/mat.svg", meaning: { en: "a small piece of thick material on the floor", ja: "マット" } },
  },
  "cup-cub": {
    cute: { type: "adjective", meaning: { en: "small and nice to look at", ja: "かわいい" } },
    bear: { type: "noun", image: "/images/words/bear.svg", meaning: { en: "a large, furry wild animal", ja: "クマ" } },
    cub: { type: "noun", image: "/images/words/bear.svg", meaning: { en: "a baby bear", ja: "(クマなどの)子" } },
    cup: { type: "noun", image: "/images/words/cup.svg", meaning: { en: "a small container for drinks", ja: "カップ" } },
  },
  "lap-lab": {
    put: { type: "verb", meaning: { en: "move something to a place", ja: "置く" } },
    computer: { type: "noun", image: "/images/words/computer.svg", meaning: { en: "a machine that works with information", ja: "コンピューター" } },
    lab: { type: "noun", image: "/images/words/computer.svg", meaning: { en: "a room with equipment for study", ja: "実習室" } },
    laptop: { type: "noun", image: "/images/words/laptop.svg", meaning: { en: "a small computer you can carry", ja: "ノートパソコン" } },
    lap: { type: "noun", meaning: { en: "the top of your legs when you sit", ja: "ひざの上" } },
  },
  "proof-prove": {
    show: { type: "verb", meaning: { en: "let people see something", ja: "見せる" } },
    proof: { type: "noun", meaning: { en: "facts that show something is true", ja: "証拠" } },
    prove: { type: "verb", meaning: { en: "show that something is true", ja: "証明する" } },
  },
};
