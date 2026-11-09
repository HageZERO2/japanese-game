import type { Category, InteriorId, LocationId, ZoneId } from '../types';

export const LEVELS = [
  { level: 1, title: 'Beginner', jp: '初心者', xp: 0 },
  { level: 2, title: 'Explorer', jp: '探検家', xp: 120 },
  { level: 3, title: 'Student', jp: '学生', xp: 350 },
  { level: 4, title: 'Traveler', jp: '旅人', xp: 700 },
  { level: 5, title: 'Japanese Learner', jp: '日本語学習者', xp: 1200 },
  { level: 6, title: 'Advanced Explorer', jp: '上級探検家', xp: 1900 },
];

export function levelFor(xp: number) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) cur = l;
  const next = LEVELS.find((l) => l.level === cur.level + 1) ?? null;
  const progress = next ? (xp - cur.xp) / (next.xp - cur.xp) : 1;
  return { ...cur, next, progress: Math.min(1, Math.max(0, progress)) };
}

export const XP = {
  discover: 10,
  addToDictionary: 5,
  reviewCorrect: 6,
  reviewWrong: 1,
  practiceSession: 20,
  newZone: 25,
  newInterior: 15,
  talkFirst: 20,
  talkAgain: 2,
  phraseCorrect: 8,
  dailyGoal: 30,
};

export const ZONES: Record<ZoneId, { name: string; jp: string; color: string }> = {
  main: { name: 'Main Street', jp: 'メインストリート', color: '#f6c28b' },
  shopping: { name: 'Shopping District', jp: '商店街', color: '#f49ac1' },
  traditional: { name: 'Traditional Japan', jp: '伝統的な日本', color: '#9bd3a8' },
  cafe: { name: 'Café Street', jp: 'カフェ通り', color: '#c7a6f0' },
  residential: { name: 'Residential Area', jp: '住宅街', color: '#8ec5f2' },
};

export const INTERIOR_NAMES: Record<InteriorId, { name: string; jp: string }> = {
  konbini: { name: 'Konbini', jp: 'コンビニ' },
  ramen: { name: 'Ramen Shop', jp: 'ラーメン屋' },
  house: { name: 'Tanaka House', jp: '田中さんの家' },
  cafe: { name: 'Café Sakura', jp: 'カフェ・さくら' },
  bookstore: { name: 'Bookstore', jp: '本屋' },
};

export type QuestCondition =
  | { type: 'discover'; count: number; zone?: ZoneId; locations?: LocationId[]; categories?: Category[] }
  | { type: 'talk'; count: number }
  | { type: 'dictionary'; count: number }
  | { type: 'practice'; count: number }
  | { type: 'zones'; count: number };

export interface QuestDef {
  id: string;
  title: string;
  jp: string;
  description: string;
  /** NPC that offers the quest; undefined means it starts automatically. */
  giver?: string;
  /** Auto-start only after these quests are done. */
  requires?: string[];
  condition: QuestCondition;
  xp: number;
  hint: string;
}

export const QUESTS: QuestDef[] = [
  {
    id: 'explore_street',
    title: 'Explore the Street',
    jp: '通りを探検しよう',
    description: 'Find and study 5 new things on Main Street.',
    condition: { type: 'discover', count: 5, zone: 'main', locations: ['outside'] },
    xp: 60,
    hint: 'Walk up to glowing objects on Main Street and press E.',
  },
  {
    id: 'meet_locals',
    title: 'Meet the Locals',
    jp: '町の人と話そう',
    description: 'Talk with three people who live in town.',
    condition: { type: 'talk', count: 3 },
    xp: 60,
    hint: 'NPCs have a name tag. Approach and press E to talk.',
  },
  {
    id: 'visit_cafe',
    title: 'Visit the Café',
    jp: 'カフェに行こう',
    description: 'Go inside Café Sakura and learn 5 food or drink words.',
    giver: 'emma',
    condition: { type: 'discover', count: 5, locations: ['cafe'], categories: ['food', 'drinks'] },
    xp: 80,
    hint: 'Café Sakura is on Café Street, west of Main Street.',
  },
  {
    id: 'shopping_time',
    title: 'Shopping Time',
    jp: '買い物の時間',
    description: 'Find 5 food or drink products in the konbini.',
    giver: 'yamada',
    condition: { type: 'discover', count: 5, locations: ['konbini'], categories: ['food', 'drinks'] },
    xp: 80,
    hint: 'Look at the shelves, fridges and the hot snack counter.',
  },
  {
    id: 'temple_explorer',
    title: 'Temple Explorer',
    jp: '神社を探検しよう',
    description: 'Explore the shrine grounds and learn 6 words of traditional Japan.',
    giver: 'aoi',
    condition: { type: 'discover', count: 6, zone: 'traditional', locations: ['outside'] },
    xp: 100,
    hint: 'Torii, lanterns, the purification fountain, the koi pond...',
  },
  {
    id: 'ramen_master',
    title: 'Ramen Master',
    jp: 'ラーメン名人',
    description: 'Learn 6 words inside the ramen shop.',
    giver: 'kenji',
    condition: { type: 'discover', count: 6, locations: ['ramen'] },
    xp: 90,
    hint: 'Bowls, chopsticks, toppings and the kitchen all have names.',
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    jp: '本の虫',
    description: 'Learn 5 words in the bookstore.',
    giver: 'yuki',
    condition: { type: 'discover', count: 5, locations: ['bookstore'] },
    xp: 80,
    hint: 'The bookstore is in the Shopping District.',
  },
  {
    id: 'home_sweet_home',
    title: 'Home Sweet Home',
    jp: 'おうちを見学',
    description: 'Visit the Tanaka house and learn 8 household words.',
    giver: 'grandma',
    condition: { type: 'discover', count: 8, locations: ['house'] },
    xp: 110,
    hint: 'The Tanaka house is in the Residential Area. Look around every room.',
  },
  {
    id: 'park_walk',
    title: 'A Walk in the Park',
    jp: '公園を散歩',
    description: 'Learn 5 words in the Residential Area.',
    giver: 'sato',
    condition: { type: 'discover', count: 5, zone: 'residential', locations: ['outside'] },
    xp: 70,
    hint: 'Swings, slides and the fountain are waiting.',
  },
  {
    id: 'first_practice',
    title: 'Practice Makes Perfect',
    jp: '練習あるのみ',
    description: 'Complete one Practice session.',
    requires: ['explore_street'],
    condition: { type: 'practice', count: 1 },
    xp: 50,
    hint: 'Add words to your dictionary, then open Practice (P).',
  },
  {
    id: 'collector',
    title: 'Word Collector',
    jp: '言葉コレクター',
    description: 'Save 25 words to your dictionary.',
    requires: ['explore_street'],
    condition: { type: 'dictionary', count: 25 },
    xp: 120,
    hint: 'Press "Add to Dictionary" on word cards.',
  },
  {
    id: 'grand_tour',
    title: 'Grand Tour',
    jp: '町を一周',
    description: 'Visit all five districts of Yume no Machi.',
    requires: ['meet_locals'],
    condition: { type: 'zones', count: 5 },
    xp: 100,
    hint: 'Check the minimap (M) for district names.',
  },
];

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_word', title: 'First Word', description: 'Study your first Japanese word.', icon: '一' },
  { id: 'words_25', title: 'Curious Mind', description: 'Discover 25 words.', icon: '知' },
  { id: 'words_75', title: 'Word Hunter', description: 'Discover 75 words.', icon: '狩' },
  { id: 'words_150', title: 'Walking Dictionary', description: 'Discover 150 words.', icon: '辞' },
  { id: 'dict_10', title: 'Note Taker', description: 'Save 10 words to your dictionary.', icon: '帳' },
  { id: 'dict_50', title: 'Archivist', description: 'Save 50 words to your dictionary.', icon: '蔵' },
  { id: 'talk_3', title: 'Friendly Face', description: 'Talk to 3 townspeople.', icon: '話' },
  { id: 'talk_all', title: 'Town Favorite', description: 'Talk to every townsperson.', icon: '友' },
  { id: 'all_zones', title: 'Cartographer', description: 'Visit all five districts.', icon: '地' },
  { id: 'all_interiors', title: 'Welcome Inside', description: 'Enter all five buildings.', icon: '門' },
  { id: 'first_quest', title: 'Helping Hand', description: 'Complete a quest.', icon: '助' },
  { id: 'quests_6', title: 'Hero of the Town', description: 'Complete 6 quests.', icon: '英' },
  { id: 'practice_1', title: 'Study Session', description: 'Finish a practice session.', icon: '練' },
  { id: 'perfect', title: 'Perfect Score', description: 'Finish a practice session without mistakes.', icon: '満' },
  { id: 'mastered_10', title: 'It Sticks!', description: 'Master 10 words with spaced repetition.', icon: '極' },
  { id: 'level_3', title: 'Student', description: 'Reach level 3.', icon: '三' },
  { id: 'level_6', title: 'Advanced Explorer', description: 'Reach level 6.', icon: '六' },
  { id: 'night_owl', title: 'Night Owl', description: 'Study a word at night.', icon: '夜' },
  { id: 'rain_walker', title: 'Rain Walker', description: 'Study a word in the rain.', icon: '雨' },
  { id: 'hanami', title: 'Hanami', description: 'Study 桜 during sakura season.', icon: '桜' },
];

export interface DailyGoalDef {
  id: 'newWords' | 'reviews' | 'talks';
  label: string;
  target: number;
}

export const DAILY_GOALS: DailyGoalDef[] = [
  { id: 'newWords', label: 'Discover new words', target: 8 },
  { id: 'reviews', label: 'Review words in Practice', target: 10 },
  { id: 'talks', label: 'Talk with townspeople', target: 3 },
];
