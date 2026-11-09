import * as THREE from 'three';

const cache = new Map<string, THREE.Material>();

export interface MatOpts {
  rough?: number;
  metal?: number;
  map?: THREE.Texture;
  emissive?: string;
  ei?: number;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
  env?: number;
}

/** Cached MeshStandardMaterial so identical looks share one material. */
export function std(color: string, o: MatOpts = {}): THREE.MeshStandardMaterial {
  const key = `std:${color}:${o.rough ?? ''}:${o.metal ?? ''}:${o.map?.uuid ?? ''}:${o.emissive ?? ''}:${o.ei ?? ''}:${o.transparent ?? ''}:${o.opacity ?? ''}:${o.side ?? ''}:${o.env ?? ''}`;
  let m = cache.get(key) as THREE.MeshStandardMaterial | undefined;
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: o.rough ?? 0.8,
      metalness: o.metal ?? 0,
      map: o.map ?? null,
      emissive: o.emissive ?? '#000000',
      emissiveIntensity: o.ei ?? 1,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
      side: o.side ?? THREE.FrontSide,
      envMapIntensity: o.env ?? 0.6,
    });
    cache.set(key, m);
  }
  return m;
}

let gradient: THREE.DataTexture | null = null;
function toonGradient() {
  if (!gradient) {
    const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
    gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
    gradient.minFilter = THREE.NearestFilter;
    gradient.magFilter = THREE.NearestFilter;
    gradient.needsUpdate = true;
  }
  return gradient;
}

/** Cel-shaded material used for characters and stylized foliage. */
export function toon(color: string, map?: THREE.Texture): THREE.MeshToonMaterial {
  const key = `toon:${color}:${map?.uuid ?? ''}`;
  let m = cache.get(key) as THREE.MeshToonMaterial | undefined;
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(), map: map ?? null });
    cache.set(key, m);
  }
  return m;
}

export function basic(color: string, o: { map?: THREE.Texture; transparent?: boolean; opacity?: number; side?: THREE.Side; fog?: boolean } = {}) {
  const key = `basic:${color}:${o.map?.uuid ?? ''}:${o.transparent ?? ''}:${o.opacity ?? ''}:${o.side ?? ''}:${o.fog ?? ''}`;
  let m = cache.get(key) as THREE.MeshBasicMaterial | undefined;
  if (!m) {
    m = new THREE.MeshBasicMaterial({
      color,
      map: o.map ?? null,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
      side: o.side ?? THREE.FrontSide,
      fog: o.fog ?? true,
    });
    cache.set(key, m);
  }
  return m;
}

/**
 * Emissive materials whose glow follows the time of day.
 * day/night are emissiveIntensity values blended by env.night.
 */
interface Glow {
  mat: THREE.MeshStandardMaterial;
  day: number;
  night: number;
}
const glows: Glow[] = [];

export function glow(color: string, emissive: string, day: number, night: number, o: MatOpts = {}) {
  const key = `glow:${color}:${emissive}:${day}:${night}:${o.map?.uuid ?? ''}:${o.side ?? ''}`;
  let m = cache.get(key) as THREE.MeshStandardMaterial | undefined;
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: day,
      roughness: o.rough ?? 0.6,
      metalness: o.metal ?? 0,
      map: o.map ?? null,
      emissiveMap: o.map ?? null,
      side: o.side ?? THREE.FrontSide,
      toneMapped: true,
    });
    cache.set(key, m);
    glows.push({ mat: m, day, night });
  }
  return m;
}

export function updateGlows(night: number) {
  for (const g of glows) g.mat.emissiveIntensity = g.day + (g.night - g.day) * night;
}

export const M = {
  glass: () => std('#a9c6d6', { rough: 0.05, metal: 0.85, env: 1.6 }),
  glassLit: () => glow('#ffe7bd', '#ffc97a', 0.08, 1.4, { rough: 0.15 }),
  lamp: () => glow('#fff6e0', '#ffd79a', 0.15, 3.2),
  lantern: () => glow('#e4483d', '#ff6b3d', 0.25, 2.4),
  lanternWhite: () => glow('#fff1d8', '#ffc77a', 0.2, 2.6),
  water: () => std('#5fa9c2', { rough: 0.04, metal: 0.4, transparent: true, opacity: 0.86, env: 1.4 }),
  metal: () => std('#9aa3ad', { rough: 0.35, metal: 0.7 }),
  dark: () => std('#2f2f36', { rough: 0.6 }),
  white: () => std('#f7f5f0', { rough: 0.7 }),
};
