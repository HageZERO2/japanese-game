import type { LocationId } from '../types';

export interface Line {
  jp: string;
  romaji: string;
  en: string;
}

export interface DialogChoice extends Line {
  next?: string | null;
  /** true = good reply (rewarded), false = mistake (NPC corrects you). */
  correct?: boolean;
  acceptQuest?: boolean;
}

export interface DialogNode {
  line: Line;
  /** Word ids the player learns when this line is shown. */
  learn?: string[];
  choices: DialogChoice[];
}

export interface NpcLook {
  hairStyle: 'long' | 'short' | 'twin' | 'bun' | 'bald';
  hair: string;
  outfit: string;
  accent: string;
  skin: string;
  scale: number;
  skirt?: boolean;
  apron?: string;
  hat?: string;
}

export interface NpcDef {
  id: string;
  name: string;
  jpName: string;
  role: string;
  roleWord: string;
  location: LocationId;
  pos: [number, number, number];
  yaw: number;
  look: NpcLook;
  quest?: string;
  nodes: Record<string, DialogNode>;
}

const bye: DialogChoice = { jp: 'さようなら。', romaji: 'Sayounara.', en: 'Goodbye.', next: null };
const thanksBye: DialogChoice = { jp: 'ありがとう！', romaji: 'Arigatou!', en: 'Thank you!', next: null };
const declineQuest: DialogChoice = { jp: 'また今度。', romaji: 'Mata kondo.', en: 'Maybe next time.', next: null };
const acceptQuest: DialogChoice = {
  jp: 'はい、わかりました！',
  romaji: 'Hai, wakarimashita!',
  en: 'Yes, got it!',
  next: 'quest_yes',
  acceptQuest: true,
};

export const NPCS: NpcDef[] = [
  {
    id: 'yamada',
    name: 'Yamada',
    jpName: '山田さん',
    role: 'Konbini clerk',
    roleWord: 'shop_clerk',
    location: 'konbini',
    pos: [3.6, 0, -3.2],
    yaw: Math.PI / 2,
    quest: 'shopping_time',
    look: { hairStyle: 'short', hair: '#2b2b33', outfit: '#5aa7d8', accent: '#ffffff', skin: '#f6d6be', scale: 1, apron: '#4b9fd6' },
    nodes: {
      start: {
        line: { jp: 'いらっしゃいませ！', romaji: 'Irasshaimase!', en: 'Welcome to the store!' },
        learn: ['welcome'],
        choices: [
          { jp: 'こんにちは！', romaji: 'Konnichiwa!', en: 'Hello!', next: 'hello', correct: true },
          { jp: 'おやすみなさい。', romaji: 'Oyasuminasai.', en: 'Good night.', next: 'wrong', correct: false },
        ],
      },
      hello: {
        line: { jp: 'こんにちは。何をお探しですか？', romaji: 'Konnichiwa. Nani o osagashi desu ka?', en: 'Hello. What are you looking for?' },
        learn: ['hello'],
        choices: [
          { jp: 'おにぎりはいくらですか？', romaji: 'Onigiri wa ikura desu ka?', en: 'How much is the rice ball?', next: 'price' },
          { jp: '水はどこですか？', romaji: 'Mizu wa doko desu ka?', en: 'Where is the water?', next: 'where' },
          { jp: '見ているだけです。', romaji: 'Mite iru dake desu.', en: "I'm just looking.", next: 'look' },
        ],
      },
      price: {
        line: { jp: '百五十円です。', romaji: 'Hyaku gojuu en desu.', en: "It's 150 yen." },
        learn: ['how_much', 'onigiri'],
        choices: [{ jp: 'ありがとう！', romaji: 'Arigatou!', en: 'Thanks!', next: 'thanks' }],
      },
      where: {
        line: { jp: '冷蔵庫の中です。あちらです。', romaji: 'Reizouko no naka desu. Achira desu.', en: "It's in the refrigerator. Over there." },
        learn: ['where_is', 'refrigerator'],
        choices: [{ jp: 'ありがとう！', romaji: 'Arigatou!', en: 'Thanks!', next: 'thanks' }],
      },
      look: {
        line: { jp: 'どうぞ、ごゆっくり。', romaji: 'Douzo, goyukkuri.', en: 'Please take your time.' },
        choices: [bye],
      },
      thanks: {
        line: { jp: 'ありがとうございます！またどうぞ。', romaji: 'Arigatou gozaimasu! Mata douzo.', en: 'Thank you very much! Please come again.' },
        learn: ['thank_you'],
        choices: [bye],
      },
      wrong: {
        line: {
          jp: 'ははは、まだ昼ですよ。「こんにちは」ですね。',
          romaji: 'Hahaha, mada hiru desu yo. "Konnichiwa" desu ne.',
          en: 'Haha, it\'s still daytime. You\'d say "konnichiwa".',
        },
        choices: [{ jp: 'もう一度。', romaji: 'Mou ichido.', en: 'One more time.', next: 'start' }],
      },
      quest_offer: {
        line: {
          jp: '新しい商品がたくさんあります。食べ物と飲み物を五つ見つけてください！',
          romaji: 'Atarashii shouhin ga takusan arimasu. Tabemono to nomimono o itsutsu mitsukete kudasai!',
          en: 'We have lots of new products. Please find five foods and drinks!',
        },
        choices: [acceptQuest, declineQuest],
      },
      quest_yes: {
        line: { jp: 'よろしくお願いします！', romaji: 'Yoroshiku onegai shimasu!', en: "I'm counting on you!" },
        learn: ['please'],
        choices: [thanksBye],
      },
    },
  },
  {
    id: 'kenji',
    name: 'Kenji',
    jpName: '健二さん',
    role: 'Ramen chef',
    roleWord: 'chef',
    location: 'ramen',
    pos: [0, 0, -3.3],
    yaw: 0,
    quest: 'ramen_master',
    look: { hairStyle: 'short', hair: '#1f1a17', outfit: '#f4f1ea', accent: '#d9443c', skin: '#e9c3a3', scale: 1.05, hat: '#f4f1ea', apron: '#2f2a2a' },
    nodes: {
      start: {
        line: { jp: 'へい、いらっしゃい！ラーメン、どうですか？', romaji: 'Hei, irasshai! Raamen, dou desu ka?', en: 'Hey, welcome! How about some ramen?' },
        choices: [
          { jp: 'お願いします！', romaji: 'Onegai shimasu!', en: 'Yes, please!', next: 'order', correct: true },
          { jp: '結構です。', romaji: 'Kekkou desu.', en: "No, thank you.", next: 'no' },
        ],
      },
      order: {
        line: {
          jp: '醤油ラーメン一丁！食べる前に何と言いますか？',
          romaji: 'Shouyu raamen icchou! Taberu mae ni nan to iimasu ka?',
          en: 'One soy sauce ramen! What do you say before eating?',
        },
        learn: ['please', 'ramen', 'soy_sauce'],
        choices: [
          { jp: 'いただきます！', romaji: 'Itadakimasu!', en: "Let's eat!", next: 'itadaki', correct: true },
          { jp: 'ごちそうさまでした！', romaji: 'Gochisousama deshita!', en: 'Thank you for the meal!', next: 'wrong', correct: false },
          { jp: 'おやすみなさい！', romaji: 'Oyasuminasai!', en: 'Good night!', next: 'wrong', correct: false },
        ],
      },
      itadaki: {
        line: { jp: 'そのとおり！どうぞ、召し上がれ。', romaji: 'Sono toori! Douzo, meshiagare.', en: 'Exactly! Please, enjoy.' },
        learn: ['itadakimasu', 'eat'],
        choices: [{ jp: '美味しい！', romaji: 'Oishii!', en: 'Delicious!', next: 'oishii' }],
      },
      oishii: {
        line: {
          jp: 'ありがとう！食べた後は「ごちそうさまでした」ですよ。',
          romaji: 'Arigatou! Tabeta ato wa "gochisousama deshita" desu yo.',
          en: 'Thanks! After eating, you say "gochisousama deshita".',
        },
        learn: ['delicious', 'gochisousama'],
        choices: [{ jp: 'ごちそうさまでした！', romaji: 'Gochisousama deshita!', en: 'Thank you for the meal!', next: null, correct: true }],
      },
      wrong: {
        line: {
          jp: '惜しい！それは違います。食べる前は「いただきます」です。',
          romaji: 'Oshii! Sore wa chigaimasu. Taberu mae wa "itadakimasu" desu.',
          en: 'Close! That\'s not it. Before eating, you say "itadakimasu".',
        },
        choices: [{ jp: 'もう一度。', romaji: 'Mou ichido.', en: 'One more time.', next: 'order' }],
      },
      no: {
        line: { jp: 'そうですか。また来てくださいね！', romaji: 'Sou desu ka. Mata kite kudasai ne!', en: 'I see. Please come again!' },
        choices: [bye],
      },
      quest_offer: {
        line: {
          jp: '店の言葉を六つ覚えたら、ラーメン名人だ！',
          romaji: 'Mise no kotoba o muttsu oboetara, raamen meijin da!',
          en: "Learn six words in my shop and you're a ramen master!",
        },
        choices: [acceptQuest, declineQuest],
      },
      quest_yes: {
        line: { jp: 'よし、頑張れ！', romaji: 'Yoshi, ganbare!', en: 'Alright, go for it!' },
        choices: [thanksBye],
      },
    },
  },
  {
    id: 'hana',
    name: 'Hana',
    jpName: '花さん',
    role: 'Barista',
    roleWord: 'barista',
    location: 'cafe',
    pos: [-3.2, 0, -3.6],
    yaw: 0,
    look: { hairStyle: 'bun', hair: '#8a5a3c', outfit: '#fff4e6', accent: '#6b4a3a', skin: '#f8dcc8', scale: 0.97, skirt: true, apron: '#7a5442' },
    nodes: {
      start: {
        line: { jp: 'いらっしゃいませ。ご注文はお決まりですか？', romaji: 'Irasshaimase. Gochuumon wa okimari desu ka?', en: 'Welcome. Have you decided on your order?' },
        learn: ['welcome'],
        choices: [
          { jp: 'コーヒーをお願いします。', romaji: 'Koohii o onegai shimasu.', en: 'A coffee, please.', next: 'coffee', correct: true },
          { jp: '抹茶ラテはありますか？', romaji: 'Maccha rate wa arimasu ka?', en: 'Do you have a matcha latte?', next: 'matcha' },
          { jp: 'メニューを見せてください。', romaji: 'Menyuu o misete kudasai.', en: 'Please show me the menu.', next: 'menu' },
        ],
      },
      coffee: {
        line: { jp: 'ホットですか、アイスですか？', romaji: 'Hotto desu ka, aisu desu ka?', en: 'Hot or iced?' },
        learn: ['coffee', 'please'],
        choices: [
          { jp: 'ホットで。', romaji: 'Hotto de.', en: 'Hot, please.', next: 'done' },
          { jp: 'アイスで。', romaji: 'Aisu de.', en: 'Iced, please.', next: 'done' },
        ],
      },
      matcha: {
        line: { jp: 'はい、ありますよ！とても人気です。', romaji: 'Hai, arimasu yo! Totemo ninki desu.', en: "Yes, we do! It's very popular." },
        learn: ['matcha'],
        choices: [{ jp: 'じゃあ、それをお願いします。', romaji: 'Jaa, sore o onegai shimasu.', en: "Then I'll have that, please.", next: 'done', correct: true }],
      },
      menu: {
        line: { jp: 'はい、どうぞ。ケーキもおすすめです。', romaji: 'Hai, douzo. Keeki mo osusume desu.', en: 'Here you go. I also recommend the cake.' },
        learn: ['menu', 'cake'],
        choices: [{ jp: 'ありがとう！', romaji: 'Arigatou!', en: 'Thank you!', next: 'thanks' }],
      },
      done: {
        line: { jp: 'かしこまりました。少々お待ちください。', romaji: 'Kashikomarimashita. Shoushou omachi kudasai.', en: 'Certainly. Please wait a moment.' },
        choices: [thanksBye],
      },
      thanks: {
        line: { jp: 'どういたしまして！', romaji: 'Dou itashimashite!', en: "You're welcome!" },
        learn: ['thank_you'],
        choices: [bye],
      },
    },
  },
  {
    id: 'mori',
    name: 'Mori',
    jpName: '森さん',
    role: 'Bookstore manager',
    roleWord: 'store_manager',
    location: 'bookstore',
    pos: [3.4, 0, -2.4],
    yaw: -Math.PI / 2,
    look: { hairStyle: 'short', hair: '#6d6d72', outfit: '#6b7f5a', accent: '#efe6d2', skin: '#efcfb6', scale: 1.02, apron: '#3f5b46' },
    nodes: {
      start: {
        line: { jp: 'いらっしゃいませ。本屋へようこそ。', romaji: 'Irasshaimase. Honya e youkoso.', en: 'Welcome to the bookstore.' },
        learn: ['bookstore'],
        choices: [
          { jp: '日本語の教科書はありますか？', romaji: 'Nihongo no kyoukasho wa arimasu ka?', en: 'Do you have Japanese textbooks?', next: 'textbook' },
          { jp: '漫画が好きです！', romaji: 'Manga ga suki desu!', en: 'I like manga!', next: 'manga' },
        ],
      },
      textbook: {
        line: {
          jp: 'はい、あの棚にありますよ。勉強、頑張ってください。',
          romaji: 'Hai, ano tana ni arimasu yo. Benkyou, ganbatte kudasai.',
          en: 'Yes, on that shelf. Good luck with your studies.',
        },
        learn: ['textbook', 'study'],
        choices: [thanksBye],
      },
      manga: {
        line: { jp: '私もです！新しい漫画は入口の近くです。', romaji: 'Watashi mo desu! Atarashii manga wa iriguchi no chikaku desu.', en: 'Me too! New manga is near the entrance.' },
        learn: ['manga'],
        choices: [thanksBye],
      },
    },
  },
  {
    id: 'sato',
    name: 'Mr. Sato',
    jpName: '佐藤さん',
    role: 'Retiree in the park',
    roleWord: 'grandfather',
    location: 'outside',
    pos: [-26, 0, 66],
    yaw: Math.PI / 2,
    quest: 'park_walk',
    look: { hairStyle: 'bald', hair: '#d9d9d9', outfit: '#7b8a6a', accent: '#c9b48a', skin: '#e8c4a6', scale: 0.95, hat: '#6f6252' },
    nodes: {
      start: {
        line: { jp: 'おはよう。いい天気ですね。', romaji: 'Ohayou. Ii tenki desu ne.', en: 'Morning. Nice weather, isn\'t it?' },
        choices: [
          { jp: 'おはようございます！', romaji: 'Ohayou gozaimasu!', en: 'Good morning! (polite)', next: 'polite', correct: true },
          { jp: 'おはよう！', romaji: 'Ohayou!', en: 'Morning! (casual)', next: 'casual' },
          { jp: 'いい天気ですね。', romaji: 'Ii tenki desu ne.', en: "It's nice weather, isn't it?", next: 'weather' },
        ],
      },
      polite: {
        line: { jp: 'おお、丁寧ですね。偉い！', romaji: 'Oo, teinei desu ne. Erai!', en: 'Oh, how polite. Well done!' },
        learn: ['good_morning'],
        choices: [bye],
      },
      casual: {
        line: {
          jp: 'ははは、友達みたいだね。目上の人には「おはようございます」だよ。',
          romaji: 'Hahaha, tomodachi mitai da ne. Meue no hito ni wa "ohayou gozaimasu" da yo.',
          en: 'Haha, like a friend. To elders, say "ohayou gozaimasu".',
        },
        learn: ['good_morning', 'friend'],
        choices: [{ jp: 'もう一度。', romaji: 'Mou ichido.', en: 'One more time.', next: 'start' }],
      },
      weather: {
        line: { jp: 'そうだね。散歩にぴったりだ。', romaji: 'Sou da ne. Sanpo ni pittari da.', en: 'Indeed. Perfect for a walk.' },
        learn: ['walk'],
        choices: [bye],
      },
      quest_offer: {
        line: {
          jp: 'この辺りには面白い物がたくさんあるよ。五つ見つけてごらん。',
          romaji: 'Kono atari ni wa omoshiroi mono ga takusan aru yo. Itsutsu mitsukete goran.',
          en: 'There are lots of interesting things around here. Try finding five.',
        },
        choices: [acceptQuest, declineQuest],
      },
      quest_yes: {
        line: { jp: 'いってらっしゃい。', romaji: 'Itterasshai.', en: 'Off you go. See you later.' },
        choices: [thanksBye],
      },
    },
  },
  {
    id: 'grandma',
    name: 'Mrs. Tanaka',
    jpName: '田中さん',
    role: 'Neighbor',
    roleWord: 'grandmother',
    location: 'outside',
    pos: [-6.2, 0, 34],
    yaw: Math.PI / 2,
    quest: 'home_sweet_home',
    look: { hairStyle: 'bun', hair: '#cfcfd6', outfit: '#9b7bb5', accent: '#f0e3f7', skin: '#f0cdb3', scale: 0.9, skirt: true, apron: '#e9d9ef' },
    nodes: {
      start: {
        line: { jp: 'あら、こんにちは。どこから来たの？', romaji: 'Ara, konnichiwa. Doko kara kita no?', en: 'Oh, hello. Where did you come from?' },
        learn: ['hello'],
        choices: [
          { jp: 'アメリカから来ました。', romaji: 'Amerika kara kimashita.', en: 'I came from America.', next: 'from' },
          { jp: '夢の街を旅しています。', romaji: 'Yume no Machi o tabi shite imasu.', en: "I'm traveling around Yume no Machi.", next: 'travel' },
        ],
      },
      from: {
        line: { jp: 'まあ、遠い所からようこそ！', romaji: 'Maa, tooi tokoro kara youkoso!', en: 'My, welcome from so far away!' },
        choices: [thanksBye],
      },
      travel: {
        line: { jp: 'いいわね。ゆっくりしていってね。', romaji: 'Ii wa ne. Yukkuri shite itte ne.', en: 'How nice. Take your time here.' },
        choices: [thanksBye],
      },
      quest_offer: {
        line: {
          jp: 'よかったら、うちに遊びに来ない？家の物の名前を教えてあげるわ。',
          romaji: 'Yokattara, uchi ni asobi ni konai? Ie no mono no namae o oshiete ageru wa.',
          en: "Would you like to visit my house? I'll teach you the names of things at home.",
        },
        choices: [acceptQuest, declineQuest],
      },
      quest_yes: {
        line: { jp: 'どうぞ、玄関は開いているわよ。', romaji: 'Douzo, genkan wa aite iru wa yo.', en: 'Go ahead, the front door is open.' },
        learn: ['genkan', 'house'],
        choices: [thanksBye],
      },
    },
  },
  {
    id: 'yuki',
    name: 'Yuki',
    jpName: 'ゆきちゃん',
    role: 'High school student',
    roleWord: 'student',
    location: 'outside',
    pos: [58, 0, 3.5],
    yaw: Math.PI,
    quest: 'bookworm',
    look: { hairStyle: 'twin', hair: '#2d2340', outfit: '#273a6b', accent: '#e05570', skin: '#f9dfcd', scale: 0.92, skirt: true },
    nodes: {
      start: {
        line: { jp: 'あ、こんにちは！はじめまして。ゆきです。', romaji: 'A, konnichiwa! Hajimemashite. Yuki desu.', en: "Oh, hello! Nice to meet you. I'm Yuki." },
        choices: [
          {
            jp: 'はじめまして。よろしくお願いします。',
            romaji: 'Hajimemashite. Yoroshiku onegai shimasu.',
            en: 'Nice to meet you. Pleased to make your acquaintance.',
            next: 'intro',
            correct: true,
          },
          { jp: 'さようなら。', romaji: 'Sayounara.', en: 'Goodbye.', next: 'wrong', correct: false },
        ],
      },
      intro: {
        line: { jp: 'よろしく！私は学生です。本が大好きです。', romaji: 'Yoroshiku! Watashi wa gakusei desu. Hon ga daisuki desu.', en: "Nice to meet you! I'm a student. I love books." },
        learn: ['nice_to_meet', 'student', 'book'],
        choices: [thanksBye],
      },
      wrong: {
        line: { jp: 'え？もう帰るの？「はじめまして」と言ってね。', romaji: 'E? Mou kaeru no? "Hajimemashite" to itte ne.', en: 'Huh? Leaving already? Say "hajimemashite"!' },
        learn: ['goodbye'],
        choices: [{ jp: 'もう一度。', romaji: 'Mou ichido.', en: 'One more time.', next: 'start' }],
      },
      quest_offer: {
        line: {
          jp: '本屋で言葉を勉強しない？五つ覚えてみて！',
          romaji: 'Honya de kotoba o benkyou shinai? Itsutsu oboete mite!',
          en: "Want to study words at the bookstore? Try learning five!",
        },
        choices: [acceptQuest, declineQuest],
      },
      quest_yes: {
        line: { jp: 'やった！本屋はすぐそこだよ。', romaji: 'Yatta! Honya wa sugu soko da yo.', en: 'Yay! The bookstore is right there.' },
        choices: [thanksBye],
      },
    },
  },
  {
    id: 'emma',
    name: 'Emma',
    jpName: 'エマさん',
    role: 'Tourist',
    roleWord: 'tourist',
    location: 'outside',
    pos: [-46, 0, -2.5],
    yaw: Math.PI / 2,
    quest: 'visit_cafe',
    look: { hairStyle: 'long', hair: '#e8c26b', outfit: '#7cc4a4', accent: '#f6efe0', skin: '#f7dccc', scale: 1, hat: '#f1e3c2' },
    nodes: {
      start: {
        line: { jp: 'すみません！カフェはどこですか？', romaji: 'Sumimasen! Kafe wa doko desu ka?', en: 'Excuse me! Where is the café?' },
        learn: ['excuse_me', 'where_is'],
        choices: [
          { jp: 'あそこです。', romaji: 'Asoko desu.', en: "It's over there.", next: 'there', correct: true },
          { jp: 'わかりません。', romaji: 'Wakarimasen.', en: "I don't know.", next: 'dunno' },
        ],
      },
      there: {
        line: { jp: 'ありがとう！私も日本語を勉強しています。', romaji: 'Arigatou! Watashi mo nihongo o benkyou shite imasu.', en: "Thanks! I'm studying Japanese too." },
        learn: ['cafe'],
        choices: [bye],
      },
      dunno: {
        line: { jp: '大丈夫です。一緒に探しましょう！', romaji: 'Daijoubu desu. Issho ni sagashimashou!', en: "That's okay. Let's look together!" },
        choices: [bye],
      },
      quest_offer: {
        line: {
          jp: 'カフェで食べ物と飲み物の言葉を五つ覚えてきて！',
          romaji: 'Kafe de tabemono to nomimono no kotoba o itsutsu oboete kite!',
          en: 'Go learn five food and drink words at the café!',
        },
        choices: [acceptQuest, declineQuest],
      },
      quest_yes: {
        line: { jp: '楽しみ！カフェは北側です。', romaji: 'Tanoshimi! Kafe wa kitagawa desu.', en: "Can't wait! The café is on the north side." },
        choices: [thanksBye],
      },
    },
  },
  {
    id: 'aoi',
    name: 'Aoi',
    jpName: '葵さん',
    role: 'Shrine maiden',
    roleWord: 'shrine_maiden',
    location: 'outside',
    pos: [5, 0, -74],
    yaw: -Math.PI / 2,
    quest: 'temple_explorer',
    look: { hairStyle: 'long', hair: '#1c1a24', outfit: '#fbfbfb', accent: '#d8312f', skin: '#f9e0cf', scale: 0.96, skirt: true },
    nodes: {
      start: {
        line: { jp: 'ようこそ、夢の街神社へ。', romaji: 'Youkoso, Yume no Machi jinja e.', en: 'Welcome to Yume no Machi Shrine.' },
        learn: ['shrine'],
        choices: [
          { jp: 'お参りの仕方を教えてください。', romaji: 'Omairi no shikata o oshiete kudasai.', en: 'Please teach me how to pray here.', next: 'howto' },
          { jp: 'きれいな神社ですね。', romaji: 'Kirei na jinja desu ne.', en: "It's a beautiful shrine.", next: 'pretty' },
        ],
      },
      howto: {
        line: {
          jp: 'まず手水舎で手を洗います。それから、鈴を鳴らして、二礼二拍手一礼です。',
          romaji: 'Mazu chouzuya de te o araimasu. Sorekara, suzu o narashite, nirei nihakushu ichirei desu.',
          en: 'First, wash your hands at the fountain. Then ring the bell: bow twice, clap twice, bow once.',
        },
        learn: ['chozuya', 'bell', 'pray'],
        choices: [thanksBye],
      },
      pretty: {
        line: {
          jp: 'ありがとうございます。桜の季節は特にきれいですよ。',
          romaji: 'Arigatou gozaimasu. Sakura no kisetsu wa toku ni kirei desu yo.',
          en: "Thank you. It's especially beautiful in cherry blossom season.",
        },
        learn: ['sakura'],
        choices: [thanksBye],
      },
      quest_offer: {
        line: {
          jp: '神社の周りには伝統的な物がたくさんあります。六つ探してみてください。',
          romaji: 'Jinja no mawari ni wa dentouteki na mono ga takusan arimasu. Muttsu sagashite mite kudasai.',
          en: 'There are many traditional things around the shrine. Please try to find six.',
        },
        choices: [acceptQuest, declineQuest],
      },
      quest_yes: {
        line: { jp: 'お気をつけて。', romaji: 'Oki o tsukete.', en: 'Take care.' },
        choices: [thanksBye],
      },
    },
  },
  {
    id: 'haruto',
    name: 'Haruto',
    jpName: 'はるとくん',
    role: 'Kid at the park',
    roleWord: 'child',
    location: 'outside',
    pos: [-20, 0, 84],
    yaw: Math.PI,
    look: { hairStyle: 'short', hair: '#3b2a20', outfit: '#f2b84b', accent: '#3c6fb5', skin: '#f6d2b8', scale: 0.68 },
    nodes: {
      start: {
        line: { jp: 'ねえねえ！一緒に遊ぼう！', romaji: 'Nee nee! Issho ni asobou!', en: "Hey hey! Let's play together!" },
        choices: [
          { jp: 'いいよ！何して遊ぶ？', romaji: 'Ii yo! Nani shite asobu?', en: 'Sure! What shall we play?', next: 'play', correct: true },
          { jp: 'ごめん、今忙しい。', romaji: 'Gomen, ima isogashii.', en: "Sorry, I'm busy now.", next: 'busy' },
        ],
      },
      play: {
        line: { jp: 'ブランコ！それから滑り台！', romaji: 'Buranko! Sorekara suberidai!', en: 'The swing! And then the slide!' },
        learn: ['swing', 'slide', 'play'],
        choices: [{ jp: 'じゃあね！', romaji: 'Jaa ne!', en: 'See you!', next: null }],
      },
      busy: {
        line: { jp: 'えー、じゃあまたね！', romaji: 'Ee, jaa mata ne!', en: 'Aww, see you later then!' },
        choices: [{ jp: 'またね！', romaji: 'Mata ne!', en: 'See you!', next: null }],
      },
    },
  },
];

export const NPC_IDS = NPCS.map((n) => n.id);
export const NPC_BY_ID: Record<string, NpcDef> = Object.fromEntries(NPCS.map((n) => [n.id, n]));
