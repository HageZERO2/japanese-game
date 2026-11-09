import * as THREE from 'three';
import { createContext, useContext, useId, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { LocationId } from '../types';
import { colliders, interactables, swayers, type Box as ColliderBox, type DoorTarget } from '../game/runtime';
import type { Sfx } from '../systems/audio';
import { basic, glow, std } from './materials';
import { zoneAt } from './layout';
import { useUI } from '../state/ui';
import { useGame } from '../state/store';
import { WORDS } from '../data/vocab';

export type V3 = [number, number, number];

export const LocationContext = createContext<LocationId>('outside');
export const useLoc = () => useContext(LocationContext);

const geoCache = new Map<string, THREE.BufferGeometry>();
function cachedGeo(key: string, make: () => THREE.BufferGeometry) {
  let g = geoCache.get(key);
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g;
}

export const G = {
  box: cachedGeo('box', () => new THREE.BoxGeometry(1, 1, 1)),
  sphere: cachedGeo('sphere', () => new THREE.SphereGeometry(1, 20, 14)),
  sphereLo: cachedGeo('sphereLo', () => new THREE.IcosahedronGeometry(1, 1)),
  plane: cachedGeo('plane', () => new THREE.PlaneGeometry(1, 1)),
  cyl: (seg = 16) => cachedGeo(`cyl${seg}`, () => new THREE.CylinderGeometry(1, 1, 1, seg)),
  taper: (top: number, seg = 16) => cachedGeo(`taper${top}:${seg}`, () => new THREE.CylinderGeometry(top, 1, 1, seg)),
  cone: (seg = 16) => cachedGeo(`cone${seg}`, () => new THREE.ConeGeometry(1, 1, seg)),
  torus: (tube: number, arc = Math.PI * 2) => cachedGeo(`torus${tube}:${arc}`, () => new THREE.TorusGeometry(1, tube, 10, 28, arc)),
  capsule: cachedGeo('capsule', () => new THREE.CapsuleGeometry(0.5, 1, 6, 12)),
  /** Triangular prism for gable roofs: width 1 (x), height 1 (y), depth 1 (z). */
  prism: cachedGeo('prism', () => {
    const s = new THREE.Shape();
    s.moveTo(-0.5, 0);
    s.lineTo(0.5, 0);
    s.lineTo(0, 1);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
    g.translate(0, 0, -0.5);
    return g;
  }),
  /** Square pyramid for hip roofs, base 1x1 at y=0, apex y=1. */
  pyramid: cachedGeo('pyramid', () => {
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    g.rotateY(Math.PI / 4);
    g.translate(0, 0.5, 0);
    return g;
  }),
};

interface MeshProps {
  p?: V3;
  r?: V3;
  c?: string;
  m?: THREE.Material;
  cast?: boolean;
  recv?: boolean;
  solid?: boolean;
}

function useCollider(ref: React.RefObject<THREE.Object3D | null>, enabled: boolean, deps: unknown[]) {
  const loc = useLoc();
  useLayoutEffect(() => {
    if (!enabled || !ref.current) return;
    const o = ref.current;
    o.updateWorldMatrix(true, false);
    const box = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5)).applyMatrix4(o.matrixWorld);
    const b: ColliderBox = { minX: box.min.x, maxX: box.max.x, minY: box.min.y, maxY: box.max.y, minZ: box.min.z, maxZ: box.max.z, location: loc };
    colliders.add(b);
    return () => {
      colliders.delete(b);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, loc, ...deps]);
}

/** Box centered at p with size s. */
export function Box({ p = [0, 0, 0], s = [1, 1, 1], r, c = '#ffffff', m, cast = true, recv = true, solid }: MeshProps & { s?: V3 }) {
  const ref = useRef<THREE.Mesh>(null);
  useCollider(ref, !!solid, [p[0], p[1], p[2], s[0], s[1], s[2], r?.[1]]);
  return <mesh ref={ref} geometry={G.box} material={m ?? std(c)} position={p} scale={s} rotation={r} castShadow={cast} receiveShadow={recv} />;
}

/** Invisible collider box. */
export function Solid({ p = [0, 0, 0], s, r }: { p?: V3; s: V3; r?: V3 }) {
  const ref = useRef<THREE.Group>(null);
  useCollider(ref, true, [p[0], p[1], p[2], s[0], s[1], s[2], r?.[1]]);
  return <group ref={ref} position={p} scale={s} rotation={r} />;
}

export function Cyl({ p = [0, 0, 0], rad = 0.5, h = 1, top, seg = 16, r, c = '#ffffff', m, cast = true, recv = true, solid }: MeshProps & { rad?: number; h?: number; top?: number; seg?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useCollider(ref, !!solid, [p[0], p[1], p[2], rad, h]);
  return (
    <mesh
      ref={ref}
      geometry={top !== undefined ? G.taper(top, seg) : G.cyl(seg)}
      material={m ?? std(c)}
      position={p}
      rotation={r}
      scale={[rad, h, rad]}
      castShadow={cast}
      receiveShadow={recv}
    />
  );
}

export function Sph({ p = [0, 0, 0], s = [1, 1, 1], r, c = '#ffffff', m, cast = true, recv = false, lo }: MeshProps & { s?: V3 | number; lo?: boolean }) {
  const sc: V3 = typeof s === 'number' ? [s, s, s] : s;
  return <mesh geometry={lo ? G.sphereLo : G.sphere} material={m ?? std(c)} position={p} rotation={r} scale={sc} castShadow={cast} receiveShadow={recv} />;
}

export function Cone({ p = [0, 0, 0], rad = 0.5, h = 1, seg = 16, r, c = '#ffffff', m, cast = true }: MeshProps & { rad?: number; h?: number; seg?: number }) {
  return <mesh geometry={G.cone(seg)} material={m ?? std(c)} position={p} rotation={r} scale={[rad, h, rad]} castShadow={cast} />;
}

/** Flat textured quad, e.g. signs and posters. */
export function Quad({ p = [0, 0, 0], s = [1, 1], r, map, c = '#ffffff', emissive, double }: { p?: V3; s?: [number, number]; r?: V3; map?: THREE.Texture; c?: string; emissive?: boolean; double?: boolean }) {
  const mat = useMemo(
    () => (emissive ? glow(c, '#ffffff', 0.35, 1.3, { map, side: double ? THREE.DoubleSide : THREE.FrontSide }) : std(c, { map, rough: 0.7, side: double ? THREE.DoubleSide : THREE.FrontSide })),
    [map, c, emissive, double],
  );
  return <mesh geometry={G.plane} material={mat} position={p} rotation={r} scale={[s[0], s[1], 1]} receiveShadow />;
}

/** Registers an object so foliage sways in the wind. */
export function Sway({ children, amount = 0.04, p, r }: { children: ReactNode; amount?: number; p?: V3; r?: V3 }) {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const s = { obj: ref.current, phase: Math.random() * 10, amount };
    swayers.add(s);
    return () => {
      swayers.delete(s);
    };
  }, [amount]);
  return (
    <group ref={ref} position={p} rotation={r}>
      {children}
    </group>
  );
}

interface InteractProps {
  id?: string;
  words?: string[];
  label?: string;
  kind?: 'word' | 'npc' | 'door';
  npcId?: string;
  door?: DoorTarget;
  radius?: number;
  /** Height of the prompt above the group origin. */
  h?: number;
  sfx?: Sfx;
  p?: V3;
  r?: V3;
  children?: ReactNode;
  /** Hide the "undiscovered" sparkle. */
  noMarker?: boolean;
}

const markerMat = () => glow('#ffd6e7', '#ff9cc4', 1.2, 2.2);

function Sparkle({ y }: { y: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => Math.random() * 6, []);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime + phase;
    m.position.y = y + Math.sin(t * 2) * 0.06;
    m.rotation.y = t * 1.5;
  });
  return (
    <mesh ref={ref} position={[0, y, 0]} scale={[0.07, 0.11, 0.07]} material={markerMat()} castShadow={false}>
      <octahedronGeometry args={[1, 0]} />
    </mesh>
  );
}

function FocusRing({ radius }: { radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 4) * 0.04;
    ref.current.scale.set(radius * s, radius * s, 1);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} material={basic('#ffb6d0', { transparent: true, opacity: 0.55, fog: false })}>
      <ringGeometry args={[0.88, 1, 40]} />
    </mesh>
  );
}

/**
 * Wraps an object and makes it interactable. The world-space position is captured on mount;
 * the world is static so this never needs recomputation.
 */
export function Interact({ id, words, label, kind = 'word', npcId, door, radius = 1.5, h = 1, sfx, p = [0, 0, 0], r, children, noMarker }: InteractProps) {
  const ref = useRef<THREE.Group>(null);
  const loc = useLoc();
  const auto = useId();
  const key = `${loc}:${id ?? words?.[0] ?? npcId ?? auto}:${auto}`;
  const text = label ?? (words?.[0] ? WORDS[words[0]]?.en ?? words[0] : 'Interact');
  const prettyLabel = text.charAt(0).toUpperCase() + text.slice(1);

  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    g.updateWorldMatrix(true, false);
    const pos = new THREE.Vector3().setFromMatrixPosition(g.matrixWorld);
    interactables.set(key, {
      id: key,
      kind,
      label: prettyLabel,
      words,
      npcId,
      door,
      radius,
      sfx,
      location: loc,
      zone: loc === 'outside' ? zoneAt(pos.x, pos.z) : null,
      pos,
      height: h,
    });
    return () => {
      interactables.delete(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, loc, radius, h, kind, prettyLabel, (words ?? []).join(','), door?.to, door?.locked]);

  const focused = useUI((s) => s.focus?.id === key);
  const undiscovered = useGame((s) => kind === 'word' && !!words?.length && s.settings.showMarkers && !words.every((w) => s.discovered[w]));

  return (
    <group ref={ref} position={p} rotation={r}>
      {children}
      {undiscovered && !noMarker && !focused && <Sparkle y={h + 0.25} />}
      {focused && <FocusRing radius={Math.min(radius * 0.6, 1.2)} />}
      {focused && (
        <Html position={[0, h + 0.35, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="world-prompt">
            <span className="key">E</span>
            <span>{kind === 'npc' ? `Talk: ${prettyLabel}` : kind === 'door' ? prettyLabel : prettyLabel}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
