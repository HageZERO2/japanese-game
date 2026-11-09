import * as THREE from 'three';
import type { LocationId, ZoneId } from '../types';
import type { Sfx } from '../systems/audio';

/** Mutable per-frame game state shared outside React to avoid re-renders. */

export interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  location: LocationId;
}

export interface DoorTarget {
  to: LocationId;
  spawn: [number, number, number];
  yaw: number;
  locked?: boolean;
  lockedText?: string;
}

export interface InteractableDef {
  id: string;
  kind: 'word' | 'npc' | 'door';
  label: string;
  words?: string[];
  npcId?: string;
  door?: DoorTarget;
  radius?: number;
  sfx?: Sfx;
}

export interface Interactable extends InteractableDef {
  location: LocationId;
  zone: ZoneId | null;
  pos: THREE.Vector3;
  height: number;
  radius: number;
}

export const colliders = new Set<Box>();
export const interactables = new Map<string, Interactable>();

export type AnimState = 'idle' | 'walk' | 'run' | 'jump' | 'interact' | 'inspect';

export const player = {
  pos: new THREE.Vector3(0, 0, 10),
  vy: 0,
  grounded: true,
  facing: Math.PI,
  camYaw: 0,
  camPitch: -0.25,
  camDist: 5,
  speed: 0,
  anim: 'idle' as AnimState,
  /** Seconds remaining of a one-shot interact/inspect animation. */
  actionTimer: 0,
  actionKind: 'interact' as 'interact' | 'inspect',
  location: 'outside' as LocationId,
  zone: null as ZoneId | null,
};

export const input = {
  keys: new Set<string>(),
  mouseDX: 0,
  mouseDY: 0,
  wheel: 0,
  jumpQueued: false,
};

/** Objects that sway in the wind; updated by one central frame loop. */
export interface Swayer {
  obj: THREE.Object3D;
  phase: number;
  amount: number;
}
export const swayers = new Set<Swayer>();

/** Shared environment factors (0..1) updated by the atmosphere controller. */
export const env = {
  night: 0,
  rain: 0,
  petals: 0,
  wind: 0.5,
};

export function boxesFor(location: LocationId): Box[] {
  const out: Box[] = [];
  for (const b of colliders) if (b.location === location) out.push(b);
  return out;
}
