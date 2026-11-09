import { player, input, type DoorTarget } from '../game/runtime';
import { useUI, isModalOpen, type Panel } from '../state/ui';
import { useGame } from '../state/store';
import { audio, speak } from './audio';
import { WORDS } from '../data/vocab';
import { INTERIOR_NAMES } from '../data/progression';
import type { InteriorId } from '../types';

export function lockPointer() {
  const c = document.querySelector('canvas');
  if (!c || document.pointerLockElement) return;
  try {
    const r = (c as HTMLCanvasElement & { requestPointerLock: () => Promise<void> | void }).requestPointerLock();
    if (r && typeof (r as Promise<void>).catch === 'function') (r as Promise<void>).catch(() => {});
  } catch {
    /* pointer lock unavailable (e.g. cooldown); drag-to-look still works */
  }
}

let intentionalUnlock = false;
export function unlockPointer() {
  if (document.pointerLockElement) {
    intentionalUnlock = true;
    document.exitPointerLock();
  }
}
export function consumeIntentionalUnlock() {
  const v = intentionalUnlock;
  intentionalUnlock = false;
  return v;
}

export function openCard(words: string[], source: string) {
  const ui = useUI.getState();
  unlockPointer();
  ui.openCard({ words, index: 0, source });
  revealWord(words[0]);
}

/** Marks a word as studied (first view) and optionally speaks it. */
export function revealWord(id: string) {
  const w = WORDS[id];
  if (!w) return;
  useGame.getState().discover(id, { zone: player.location === 'outside' ? player.zone : null, location: player.location });
  if (useGame.getState().settings.autoSpeak) speak(w.jp);
}

export function closeModal() {
  const ui = useUI.getState();
  if (ui.card) {
    ui.openCard(null);
    audio.play('close');
  } else if (ui.dialog) {
    ui.openDialog(null);
    audio.play('close');
  } else if (ui.panel) {
    ui.openPanel(null);
    audio.play('close');
  }
}

export function togglePanel(p: Panel) {
  const ui = useUI.getState();
  if (!ui.started) return;
  if (ui.card || ui.dialog) return;
  if (ui.panel === p) {
    ui.openPanel(null);
    audio.play('close');
    return;
  }
  unlockPointer();
  ui.openPanel(p);
  audio.play('open');
}

export function travel(door: DoorTarget) {
  const ui = useUI.getState();
  if (door.locked) {
    audio.play('error');
    ui.flash(door.lockedText ?? 'It is locked.');
    return;
  }
  if (ui.fading) return;
  audio.play('door');
  ui.setFading(true);
  ui.setFocus(null);
  setTimeout(() => {
    player.location = door.to;
    player.pos.set(door.spawn[0], door.spawn[1], door.spawn[2]);
    player.vy = 0;
    player.grounded = true;
    player.speed = 0;
    player.camYaw = door.yaw;
    player.camPitch = -0.2;
    player.facing = door.yaw + Math.PI;
    ui.setLocation(door.to);
    if (door.to !== 'outside') {
      const id = door.to as InteriorId;
      useGame.getState().visitInterior(id);
      ui.showZoneBanner(INTERIOR_NAMES[id].name, INTERIOR_NAMES[id].jp);
    } else {
      player.zone = null; // force zone re-detection so the banner shows again
    }
    setTimeout(() => ui.setFading(false), 180);
  }, 380);
}

export function interact() {
  const ui = useUI.getState();
  const f = ui.focus;
  if (!f || isModalOpen(ui) || ui.fading) return;
  if (f.kind === 'door' && f.door) {
    player.actionKind = 'interact';
    player.actionTimer = 0.5;
    travel(f.door);
    return;
  }
  if (f.kind === 'npc' && f.npcId) {
    player.actionKind = 'interact';
    player.actionTimer = 0.6;
    audio.play('pop');
    unlockPointer();
    useGame.getState().talkTo(f.npcId);
    ui.openDialog({ npcId: f.npcId, node: 'start' });
    return;
  }
  if (f.words?.length) {
    player.actionKind = 'inspect';
    player.actionTimer = 1.2;
    audio.play(f.sfx ?? 'open');
    openCard(f.words, f.label);
  }
}

export function queueJump() {
  input.jumpQueued = true;
}
