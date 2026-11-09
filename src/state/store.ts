import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InteriorId, LocationId, ZoneId } from '../types';
import { WORDS } from '../data/vocab';
import { NPC_IDS } from '../data/npcs';
import { ACHIEVEMENTS, DAILY_GOALS, QUESTS, XP, levelFor, type QuestDef } from '../data/progression';
import { useUI } from './ui';
import { audio } from '../systems/audio';

export type TimeMode = 'morning' | 'afternoon' | 'sunset' | 'night' | 'rain' | 'sakura';

export interface SRS {
  reps: number;
  interval: number; // days
  ease: number;
  due: number; // epoch ms
  lapses: number;
  lastReviewed: number | null;
  correct: number;
  wrong: number;
}

export interface DictEntry {
  addedAt: number;
  favorite: boolean;
  srs: SRS;
}

export interface Discovery {
  at: number;
  zone: ZoneId | null;
  location: LocationId;
}

export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  sensitivity: number;
  invertY: boolean;
  quality: 'low' | 'high';
  cameraMode: 'third' | 'first';
  timeMode: TimeMode;
  showRomaji: boolean;
  showMarkers: boolean;
  autoSpeak: boolean;
}

export interface Appearance {
  hairStyle: 'long' | 'short' | 'twin';
  hair: string;
  outfit: string;
  accent: string;
  name: string;
}

export interface Daily {
  date: string;
  newWords: number;
  reviews: number;
  talks: number;
  claimed: string[];
}

export interface GameData {
  xp: number;
  discovered: Record<string, Discovery>;
  dictionary: Record<string, DictEntry>;
  visitedZones: ZoneId[];
  visitedInteriors: InteriorId[];
  talkedNpcs: string[];
  quests: Record<string, 'active' | 'done'>;
  achievements: Record<string, number>;
  practiceSessions: number;
  perfectSessions: number;
  reviewsTotal: number;
  daily: Daily;
  settings: Settings;
  appearance: Appearance;
}

interface GameActions {
  discover(wordId: string, ctx: { zone: ZoneId | null; location: LocationId }): boolean;
  addToDictionary(wordId: string): void;
  removeFromDictionary(wordId: string): void;
  toggleFavorite(wordId: string): void;
  recordReview(wordId: string, correct: boolean): void;
  finishPractice(total: number, correct: number): void;
  talkTo(npcId: string): void;
  rewardPhrase(): void;
  visitZone(zone: ZoneId): void;
  visitInterior(id: InteriorId): void;
  acceptQuest(id: string): void;
  setSettings(p: Partial<Settings>): void;
  setAppearance(p: Partial<Appearance>): void;
  resetProgress(): void;
  evaluate(): void;
}

export type GameState = GameData & GameActions;

const DAY = 86_400_000;

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export const DEFAULT_SETTINGS: Settings = {
  musicVolume: 0.45,
  sfxVolume: 0.7,
  sensitivity: 1,
  invertY: false,
  quality: 'high',
  cameraMode: 'third',
  timeMode: 'morning',
  showRomaji: true,
  showMarkers: true,
  autoSpeak: false,
};

export const DEFAULT_APPEARANCE: Appearance = {
  hairStyle: 'long',
  hair: '#4a3358',
  outfit: '#f3a5bf',
  accent: '#7ec8e3',
  name: 'Yume',
};

function freshData(): GameData {
  return {
    xp: 0,
    discovered: {},
    dictionary: {},
    visitedZones: [],
    visitedInteriors: [],
    talkedNpcs: [],
    quests: {},
    achievements: {},
    practiceSessions: 0,
    perfectSessions: 0,
    reviewsTotal: 0,
    daily: { date: today(), newWords: 0, reviews: 0, talks: 0, claimed: [] },
    settings: { ...DEFAULT_SETTINGS },
    appearance: { ...DEFAULT_APPEARANCE },
  };
}

export function newSRS(): SRS {
  return { reps: 0, interval: 0, ease: 2.3, due: Date.now(), lapses: 0, lastReviewed: null, correct: 0, wrong: 0 };
}

export type WordStatus = 'new' | 'learning' | 'mastered';

export function statusOf(e: DictEntry): WordStatus {
  if (e.srs.lastReviewed === null) return 'new';
  if (e.srs.reps >= 3 && e.srs.interval >= 6) return 'mastered';
  return 'learning';
}

export function isDue(e: DictEntry, now = Date.now()) {
  return e.srs.due <= now;
}

/** SM-2 style scheduling reduced to a pass/fail grade. */
function schedule(s: SRS, correct: boolean): SRS {
  const now = Date.now();
  if (!correct) {
    return {
      ...s,
      reps: 0,
      interval: 0,
      ease: Math.max(1.3, s.ease - 0.2),
      due: now + 5 * 60_000,
      lapses: s.lapses + 1,
      lastReviewed: now,
      wrong: s.wrong + 1,
    };
  }
  const reps = s.reps + 1;
  const interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(Math.max(s.interval, 1) * s.ease);
  return {
    ...s,
    reps,
    interval,
    ease: Math.min(3, s.ease + 0.05),
    due: now + interval * DAY,
    lastReviewed: now,
    correct: s.correct + 1,
  };
}

export function questProgress(q: QuestDef, s: GameData): { current: number; target: number } {
  const c = q.condition;
  let current = 0;
  switch (c.type) {
    case 'discover':
      for (const [id, d] of Object.entries(s.discovered)) {
        const w = WORDS[id];
        if (!w) continue;
        if (c.zone && d.zone !== c.zone) continue;
        if (c.locations && !c.locations.includes(d.location)) continue;
        if (c.categories && !c.categories.includes(w.category)) continue;
        current++;
      }
      break;
    case 'talk':
      current = s.talkedNpcs.length;
      break;
    case 'dictionary':
      current = Object.keys(s.dictionary).length;
      break;
    case 'practice':
      current = s.practiceSessions;
      break;
    case 'zones':
      current = s.visitedZones.length;
      break;
  }
  return { current: Math.min(current, c.count), target: c.count };
}

function rollDaily(d: Daily): Daily {
  return d.date === today() ? d : { date: today(), newWords: 0, reviews: 0, talks: 0, claimed: [] };
}

function bumpDaily(d: Daily, key: 'newWords' | 'reviews' | 'talks'): Daily {
  const r = rollDaily(d);
  return { ...r, [key]: r[key] + 1 };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      const addXp = (amount: number, reason?: string) => {
        const before = levelFor(get().xp);
        set((s) => ({ xp: s.xp + amount }));
        const after = levelFor(get().xp);
        if (reason) useUI.getState().toast({ kind: 'xp', title: `+${amount} XP`, body: reason });
        if (after.level > before.level) {
          audio.play('levelup');
          useUI.getState().toast({ kind: 'level', title: `Level ${after.level}: ${after.title}`, body: `${after.jp} - Level up!` });
        }
      };

      const unlock = (id: string) => {
        if (get().achievements[id]) return;
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (!def) return;
        set((s) => ({ achievements: { ...s.achievements, [id]: Date.now() } }));
        audio.play('chime');
        useUI.getState().toast({ kind: 'achievement', title: `Achievement: ${def.title}`, body: def.description });
      };

      return {
        ...freshData(),

        discover(wordId, ctx) {
          if (!WORDS[wordId]) return false;
          const isNew = !get().discovered[wordId];
          if (isNew) {
            set((s) => ({
              discovered: { ...s.discovered, [wordId]: { at: Date.now(), zone: ctx.zone, location: ctx.location } },
              daily: bumpDaily(s.daily, 'newWords'),
            }));
            addXp(XP.discover, `New word: ${WORDS[wordId].jp}`);
            const mode = get().settings.timeMode;
            if (mode === 'night') unlock('night_owl');
            if (mode === 'rain') unlock('rain_walker');
            if (mode === 'sakura' && wordId === 'sakura') unlock('hanami');
            get().evaluate();
          }
          return isNew;
        },

        addToDictionary(wordId) {
          if (get().dictionary[wordId] || !WORDS[wordId]) return;
          set((s) => ({ dictionary: { ...s.dictionary, [wordId]: { addedAt: Date.now(), favorite: false, srs: newSRS() } } }));
          addXp(XP.addToDictionary);
          get().evaluate();
        },

        removeFromDictionary(wordId) {
          set((s) => {
            const d = { ...s.dictionary };
            delete d[wordId];
            return { dictionary: d };
          });
        },

        toggleFavorite(wordId) {
          const e = get().dictionary[wordId];
          if (!e) return;
          set((s) => ({ dictionary: { ...s.dictionary, [wordId]: { ...e, favorite: !e.favorite } } }));
        },

        recordReview(wordId, correct) {
          const e = get().dictionary[wordId];
          if (e) set((s) => ({ dictionary: { ...s.dictionary, [wordId]: { ...e, srs: schedule(e.srs, correct) } } }));
          set((s) => ({ reviewsTotal: s.reviewsTotal + 1, daily: bumpDaily(s.daily, 'reviews') }));
          addXp(correct ? XP.reviewCorrect : XP.reviewWrong);
          get().evaluate();
        },

        finishPractice(total, correct) {
          set((s) => ({
            practiceSessions: s.practiceSessions + 1,
            perfectSessions: s.perfectSessions + (total > 0 && correct === total ? 1 : 0),
          }));
          addXp(XP.practiceSession, 'Practice complete');
          get().evaluate();
        },

        talkTo(npcId) {
          const first = !get().talkedNpcs.includes(npcId);
          set((s) => ({
            talkedNpcs: first ? [...s.talkedNpcs, npcId] : s.talkedNpcs,
            daily: bumpDaily(s.daily, 'talks'),
          }));
          addXp(first ? XP.talkFirst : XP.talkAgain, first ? 'Met someone new' : undefined);
          get().evaluate();
        },

        rewardPhrase() {
          addXp(XP.phraseCorrect, 'Nice reply!');
        },

        visitZone(zone) {
          if (get().visitedZones.includes(zone)) return;
          set((s) => ({ visitedZones: [...s.visitedZones, zone] }));
          addXp(XP.newZone, 'New area discovered');
          get().evaluate();
        },

        visitInterior(id) {
          if (get().visitedInteriors.includes(id)) return;
          set((s) => ({ visitedInteriors: [...s.visitedInteriors, id] }));
          addXp(XP.newInterior, 'New place visited');
          get().evaluate();
        },

        acceptQuest(id) {
          if (get().quests[id]) return;
          const q = QUESTS.find((x) => x.id === id);
          if (!q) return;
          set((s) => ({ quests: { ...s.quests, [id]: 'active' } }));
          audio.play('success');
          useUI.getState().toast({ kind: 'quest', title: `New quest: ${q.title}`, body: q.description });
          get().evaluate();
        },

        setSettings(p) {
          set((s) => ({ settings: { ...s.settings, ...p } }));
        },

        setAppearance(p) {
          set((s) => ({ appearance: { ...s.appearance, ...p } }));
        },

        resetProgress() {
          const keep = get().settings;
          set({ ...freshData(), settings: keep });
          get().evaluate();
        },

        evaluate() {
          for (let pass = 0; pass < 4; pass++) {
            let changed = false;
            for (const q of QUESTS) {
              const st = get().quests[q.id];
              if (!st && !q.giver && (q.requires ?? []).every((r) => get().quests[r] === 'done')) {
                set((x) => ({ quests: { ...x.quests, [q.id]: 'active' } }));
                useUI.getState().toast({ kind: 'quest', title: `New quest: ${q.title}`, body: q.description });
                changed = true;
              } else if (st === 'active') {
                const p = questProgress(q, get());
                if (p.current >= p.target) {
                  set((x) => ({ quests: { ...x.quests, [q.id]: 'done' } }));
                  audio.play('success');
                  useUI.getState().toast({ kind: 'quest', title: `Quest complete: ${q.title}`, body: `+${q.xp} XP` });
                  addXp(q.xp);
                  changed = true;
                }
              }
            }

            const d = rollDaily(get().daily);
            if (d !== get().daily) set({ daily: d });
            for (const g of DAILY_GOALS) {
              const cur = get().daily;
              if (!cur.claimed.includes(g.id) && cur[g.id] >= g.target) {
                set((x) => ({ daily: { ...x.daily, claimed: [...x.daily.claimed, g.id] } }));
                useUI.getState().toast({ kind: 'daily', title: 'Daily goal complete', body: `${g.label} (+${XP.dailyGoal} XP)` });
                addXp(XP.dailyGoal);
                changed = true;
              }
            }

            const g = get();
            const nDisc = Object.keys(g.discovered).length;
            const nDict = Object.keys(g.dictionary).length;
            const nDone = Object.values(g.quests).filter((v) => v === 'done').length;
            const mastered = Object.values(g.dictionary).filter((e) => statusOf(e) === 'mastered').length;
            const lvl = levelFor(g.xp).level;
            const checks: [string, boolean][] = [
              ['first_word', nDisc >= 1],
              ['words_25', nDisc >= 25],
              ['words_75', nDisc >= 75],
              ['words_150', nDisc >= 150],
              ['dict_10', nDict >= 10],
              ['dict_50', nDict >= 50],
              ['talk_3', g.talkedNpcs.length >= 3],
              ['talk_all', NPC_IDS.every((id) => g.talkedNpcs.includes(id))],
              ['all_zones', g.visitedZones.length >= 5],
              ['all_interiors', g.visitedInteriors.length >= 5],
              ['first_quest', nDone >= 1],
              ['quests_6', nDone >= 6],
              ['practice_1', g.practiceSessions >= 1],
              ['perfect', g.perfectSessions >= 1],
              ['mastered_10', mastered >= 10],
              ['level_3', lvl >= 3],
              ['level_6', lvl >= 6],
            ];
            for (const [id, ok] of checks) {
              if (ok && !get().achievements[id]) {
                unlock(id);
                changed = true;
              }
            }
            if (!changed) break;
          }
        },
      };
    },
    {
      name: 'yume-no-machi-save-v1',
      version: 1,
      partialize: (s): GameData => ({
        xp: s.xp,
        discovered: s.discovered,
        dictionary: s.dictionary,
        visitedZones: s.visitedZones,
        visitedInteriors: s.visitedInteriors,
        talkedNpcs: s.talkedNpcs,
        quests: s.quests,
        achievements: s.achievements,
        practiceSessions: s.practiceSessions,
        perfectSessions: s.perfectSessions,
        reviewsTotal: s.reviewsTotal,
        daily: s.daily,
        settings: s.settings,
        appearance: s.appearance,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameData>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
          appearance: { ...DEFAULT_APPEARANCE, ...(p.appearance ?? {}) },
          daily: rollDaily(p.daily ?? current.daily),
        };
      },
    },
  ),
);
