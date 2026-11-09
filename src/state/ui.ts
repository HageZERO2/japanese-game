import { create } from 'zustand';
import type { Interactable } from '../game/runtime';
import type { LocationId, ZoneId } from '../types';

export type Panel = 'pause' | 'dictionary' | 'quests' | 'achievements' | 'settings' | 'character' | 'practice' | 'map';

export interface Toast {
  id: number;
  kind: 'xp' | 'level' | 'quest' | 'achievement' | 'zone' | 'info' | 'daily';
  title: string;
  body?: string;
}

export interface CardState {
  words: string[];
  index: number;
  source: string;
}

interface UIState {
  started: boolean;
  panel: Panel | null;
  card: CardState | null;
  dialog: { npcId: string; node: string } | null;
  focus: Interactable | null;
  location: LocationId;
  zone: ZoneId | null;
  fading: boolean;
  pointerLocked: boolean;
  toasts: Toast[];
  zoneBanner: { title: string; jp: string; key: number } | null;
  message: { text: string; key: number } | null;
  setStarted(v: boolean): void;
  openPanel(p: Panel | null): void;
  openCard(c: CardState | null): void;
  setCardIndex(i: number): void;
  openDialog(d: { npcId: string; node: string } | null): void;
  setFocus(f: Interactable | null): void;
  setLocation(l: LocationId): void;
  setZone(z: ZoneId | null): void;
  setFading(v: boolean): void;
  setPointerLocked(v: boolean): void;
  toast(t: Omit<Toast, 'id'>): void;
  dismissToast(id: number): void;
  showZoneBanner(title: string, jp: string): void;
  flash(text: string): void;
}

let toastId = 1;

export const useUI = create<UIState>((set) => ({
  started: false,
  panel: null,
  card: null,
  dialog: null,
  focus: null,
  location: 'outside',
  zone: null,
  fading: false,
  pointerLocked: false,
  toasts: [],
  zoneBanner: null,
  message: null,
  setStarted: (v) => set({ started: v }),
  openPanel: (p) => set({ panel: p }),
  openCard: (c) => set({ card: c }),
  setCardIndex: (i) => set((s) => (s.card ? { card: { ...s.card, index: i } } : {})),
  openDialog: (d) => set({ dialog: d }),
  setFocus: (f) => set({ focus: f }),
  setLocation: (l) => set({ location: l }),
  setZone: (z) => set({ zone: z }),
  setFading: (v) => set({ fading: v }),
  setPointerLocked: (v) => set({ pointerLocked: v }),
  toast: (t) => {
    const id = toastId++;
    set((s) => ({ toasts: [...s.toasts.slice(-4), { ...t, id }] }));
    setTimeout(() => useUI.getState().dismissToast(id), t.kind === 'xp' ? 2200 : 4200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  showZoneBanner: (title, jp) => set({ zoneBanner: { title, jp, key: Date.now() } }),
  flash: (text) => set({ message: { text, key: Date.now() } }),
}));

export function isModalOpen(s: Pick<UIState, 'panel' | 'card' | 'dialog' | 'started'> = useUI.getState()) {
  return !s.started || !!s.panel || !!s.card || !!s.dialog;
}
