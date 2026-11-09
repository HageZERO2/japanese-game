import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Interact, G } from '../world/parts';
import { toon, std } from '../world/materials';
import { player } from './runtime';
import type { V3 } from '../world/parts';

type Pt = [number, number];

/** Moves a group between waypoints with pauses; stops and looks at the player when close. */
function useWander(points: Pt[], speed: number, ref: React.RefObject<THREE.Group | null>, onStep?: (moving: boolean, t: number) => void) {
  const st = useRef({ i: 0, wait: Math.random() * 2, t: 0 });
  useFrame((_, dtRaw) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 0.05);
    const s = st.current;
    s.t += dt;
    const near = player.location === 'outside' && Math.hypot(player.pos.x - g.position.x, player.pos.z - g.position.z) < 2.6;
    let moving = false;
    if (near) {
      const want = Math.atan2(player.pos.x - g.position.x, player.pos.z - g.position.z);
      g.rotation.y += angleDiff(want, g.rotation.y) * (1 - Math.exp(-4 * dt));
    } else if (s.wait > 0) {
      s.wait -= dt;
    } else {
      const [tx, tz] = points[s.i];
      const dx = tx - g.position.x;
      const dz = tz - g.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.15) {
        s.i = (s.i + 1) % points.length;
        s.wait = 1.5 + Math.random() * 4;
      } else {
        moving = true;
        const step = Math.min(d, speed * dt);
        g.position.x += (dx / d) * step;
        g.position.z += (dz / d) * step;
        g.rotation.y += angleDiff(Math.atan2(dx, dz), g.rotation.y) * (1 - Math.exp(-6 * dt));
      }
    }
    onStep?.(moving, s.t);
  });
}

function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function Legs({ color, refs, w, l, y }: { color: string; refs: React.RefObject<(THREE.Mesh | null)[]>; w: number; l: number; y: number }) {
  const pos: V3[] = [
    [w, y, l],
    [-w, y, l],
    [w, y, -l],
    [-w, y, -l],
  ];
  return (
    <>
      {pos.map((p, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          geometry={G.capsule}
          material={toon(color)}
          position={p}
          scale={[0.05, 0.1, 0.05]}
          castShadow
        />
      ))}
    </>
  );
}

export function Cat({ points, color = '#f2a65a', p }: { points: Pt[]; color?: string; p: V3 }) {
  const ref = useRef<THREE.Group>(null);
  const legs = useRef<(THREE.Mesh | null)[]>([]);
  const tail = useRef<THREE.Group>(null);
  useWander(points, 0.7, ref, (moving, t) => {
    legs.current.forEach((m, i) => {
      if (m) m.rotation.x = moving ? Math.sin(t * 9 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.6 : 0;
    });
    if (tail.current) tail.current.rotation.z = Math.sin(t * 2.2) * 0.4;
  });
  const c = toon(color);
  const white = toon('#fff7ee');
  return (
    <group ref={ref} position={p}>
      <Interact words={['cat']} radius={1.8} h={0.55} dynamic>
        <mesh geometry={G.capsule} material={c} position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.17, 0.2, 0.15]} castShadow />
        <mesh geometry={G.sphere} material={white} position={[0, 0.2, 0.08]} scale={[0.1, 0.08, 0.15]} />
        <group position={[0, 0.38, 0.22]}>
          <mesh geometry={G.sphere} material={c} scale={[0.12, 0.11, 0.11]} castShadow />
          <mesh geometry={G.cone(4)} material={c} position={[0.065, 0.1, 0]} scale={[0.04, 0.07, 0.03]} />
          <mesh geometry={G.cone(4)} material={c} position={[-0.065, 0.1, 0]} scale={[0.04, 0.07, 0.03]} />
          <mesh geometry={G.sphere} material={std('#2a2228')} position={[0.04, 0.02, 0.1]} scale={0.015} />
          <mesh geometry={G.sphere} material={std('#2a2228')} position={[-0.04, 0.02, 0.1]} scale={0.015} />
          <mesh geometry={G.sphere} material={std('#f28a9a')} position={[0, -0.01, 0.11]} scale={0.01} />
        </group>
        <group ref={tail} position={[0, 0.3, -0.2]}>
          <mesh geometry={G.capsule} material={c} position={[0, 0.12, -0.05]} rotation={[-0.5, 0, 0]} scale={[0.035, 0.2, 0.035]} castShadow />
        </group>
        <Legs color={color} refs={legs} w={0.07} l={0.12} y={0.1} />
      </Interact>
    </group>
  );
}

export function Dog({ points, color = '#d9b38c', p }: { points: Pt[]; color?: string; p: V3 }) {
  const ref = useRef<THREE.Group>(null);
  const legs = useRef<(THREE.Mesh | null)[]>([]);
  const tail = useRef<THREE.Mesh>(null);
  useWander(points, 1.1, ref, (moving, t) => {
    legs.current.forEach((m, i) => {
      if (m) m.rotation.x = moving ? Math.sin(t * 10 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 0.7 : 0;
    });
    if (tail.current) tail.current.rotation.z = Math.sin(t * 12) * 0.5;
  });
  const c = toon(color);
  const white = toon('#fffaf2');
  return (
    <group ref={ref} position={p}>
      <Interact words={['dog']} radius={2} h={0.75} dynamic>
        <mesh geometry={G.capsule} material={c} position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.22, 0.26, 0.2]} castShadow />
        <group position={[0, 0.55, 0.3]}>
          <mesh geometry={G.sphere} material={c} scale={[0.15, 0.14, 0.15]} castShadow />
          <mesh geometry={G.sphere} material={white} position={[0, -0.04, 0.12]} scale={[0.08, 0.06, 0.08]} />
          <mesh geometry={G.sphere} material={std('#2a2228')} position={[0, -0.02, 0.2]} scale={0.025} />
          <mesh geometry={G.cone(4)} material={c} position={[0.09, 0.13, -0.02]} scale={[0.05, 0.09, 0.03]} />
          <mesh geometry={G.cone(4)} material={c} position={[-0.09, 0.13, -0.02]} scale={[0.05, 0.09, 0.03]} />
          <mesh geometry={G.sphere} material={std('#2a2228')} position={[0.06, 0.03, 0.12]} scale={0.02} />
          <mesh geometry={G.sphere} material={std('#2a2228')} position={[-0.06, 0.03, 0.12]} scale={0.02} />
        </group>
        <mesh ref={tail} geometry={G.capsule} material={c} position={[0, 0.5, -0.28]} rotation={[-0.8, 0, 0]} scale={[0.04, 0.12, 0.04]} />
        <mesh geometry={G.torus(0.25)} material={std('#e05a5a')} position={[0, 0.48, 0.22]} rotation={[Math.PI / 2.4, 0, 0]} scale={0.09} />
        <Legs color={color} refs={legs} w={0.1} l={0.16} y={0.13} />
      </Interact>
    </group>
  );
}

/** A small bird that hops around and flutters. */
export function Bird({ p, color = '#7ab8e8' }: { p: V3; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  const base = useMemo(() => new THREE.Vector3(...p), [p]);
  const st = useRef({ t: Math.random() * 10, fly: 0 });
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = st.current;
    s.t += dt;
    const g = ref.current;
    if (!g) return;
    const near = player.location === 'outside' && Math.hypot(player.pos.x - g.position.x, player.pos.z - g.position.z) < 1.2;
    if (near && s.fly <= 0) s.fly = 3;
    if (s.fly > 0) {
      s.fly -= dt;
      g.position.y = base.y + Math.sin(((3 - s.fly) / 3) * Math.PI) * 2.5;
      g.position.x = base.x + Math.sin(s.t * 2) * 1.2;
      const flap = Math.sin(s.t * 40) * 0.9;
      if (wingL.current) wingL.current.rotation.z = flap;
      if (wingR.current) wingR.current.rotation.z = -flap;
    } else {
      g.position.y = base.y + Math.max(0, Math.sin(s.t * 6)) * 0.05;
      g.position.x = base.x + Math.sin(s.t * 0.4) * 0.3;
      g.rotation.y = Math.sin(s.t * 0.7) * 1.5;
      if (wingL.current) wingL.current.rotation.z = 0;
      if (wingR.current) wingR.current.rotation.z = 0;
    }
  });
  const c = toon(color);
  return (
    <group ref={ref} position={p}>
      <Interact words={['bird']} radius={1.6} h={0.3} dynamic>
        <mesh geometry={G.sphere} material={c} position={[0, 0.08, 0]} scale={[0.06, 0.06, 0.08]} castShadow />
        <mesh geometry={G.sphere} material={c} position={[0, 0.14, 0.05]} scale={0.045} />
        <mesh geometry={G.sphere} material={toon('#fff4e0')} position={[0, 0.07, 0.03]} scale={[0.045, 0.04, 0.05]} />
        <mesh geometry={G.cone(4)} material={std('#f2b33d')} position={[0, 0.14, 0.1]} rotation={[Math.PI / 2, 0, 0]} scale={[0.012, 0.03, 0.012]} />
        <mesh ref={wingL} geometry={G.sphere} material={c} position={[0.05, 0.1, 0]} scale={[0.015, 0.04, 0.06]} />
        <mesh ref={wingR} geometry={G.sphere} material={c} position={[-0.05, 0.1, 0]} scale={[0.015, 0.04, 0.06]} />
      </Interact>
    </group>
  );
}

/** A school of koi circling in the pond (one interactable at the pond edge handles the word). */
export function KoiSchool({ center, rx, rz, count = 7 }: { center: V3; rx: number; rz: number; count?: number }) {
  const fish = useRef<(THREE.Group | null)[]>([]);
  const params = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ r: 0.35 + Math.random() * 0.55, sp: 0.15 + Math.random() * 0.2, ph: (i / count) * Math.PI * 2, color: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#ff7b3a' : '#ffb347' })),
    [count],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    params.forEach((p, i) => {
      const g = fish.current[i];
      if (!g) return;
      const a = t * p.sp * (i % 2 ? 1 : -1) + p.ph;
      g.position.set(center[0] + Math.cos(a) * rx * p.r, center[1], center[2] + Math.sin(a) * rz * p.r);
      g.rotation.y = -a + (i % 2 ? Math.PI : 0);
      g.children[1].rotation.y = Math.sin(t * 6 + i) * 0.4;
    });
  });
  return (
    <>
      {params.map((p, i) => (
        <group
          key={i}
          ref={(g) => {
            fish.current[i] = g;
          }}
        >
          <mesh geometry={G.sphere} material={toon(p.color)} scale={[0.09, 0.06, 0.25]} />
          <mesh geometry={G.cone(4)} material={toon(p.color === '#ffffff' ? '#ff7b3a' : '#ffffff')} position={[0, 0, -0.27]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.08, 0.12, 0.02]} />
        </group>
      ))}
    </>
  );
}

export function Butterfly({ p, color = '#ffd36b' }: { p: V3; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  const wl = useRef<THREE.Mesh>(null);
  const wr = useRef<THREE.Mesh>(null);
  const ph = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + ph;
    if (ref.current) {
      ref.current.position.set(p[0] + Math.sin(t * 0.5) * 1.5, p[1] + Math.sin(t * 1.3) * 0.3, p[2] + Math.cos(t * 0.4) * 1.5);
      ref.current.rotation.y = t * 0.5;
    }
    const f = Math.sin(t * 18) * 0.9;
    if (wl.current) wl.current.rotation.z = f;
    if (wr.current) wr.current.rotation.z = -f;
  });
  const m = std(color, { side: THREE.DoubleSide, rough: 0.5 });
  return (
    <group ref={ref} position={p}>
      <Interact words={['butterfly']} radius={1.8} h={0.2} dynamic>
        <mesh ref={wl} geometry={G.plane} material={m} position={[0.06, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.12, 0.1, 1]} />
        <mesh ref={wr} geometry={G.plane} material={m} position={[-0.06, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.12, 0.1, 1]} />
        <mesh geometry={G.capsule} material={std('#3a2a2a')} rotation={[Math.PI / 2, 0, 0]} scale={[0.012, 0.06, 0.012]} />
      </Interact>
    </group>
  );
}

export function Frog({ p }: { p: V3 }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime % 4;
    ref.current.position.y = p[1] + (t < 0.3 ? Math.sin((t / 0.3) * Math.PI) * 0.15 : 0);
    ref.current.scale.y = 1 + Math.sin(clock.elapsedTime * 5) * 0.04;
  });
  const g = toon('#7cc46a');
  return (
    <group ref={ref} position={p}>
      <Interact words={['frog']} radius={1.6} h={0.3}>
        <mesh geometry={G.sphere} material={g} position={[0, 0.07, 0]} scale={[0.1, 0.07, 0.11]} castShadow />
        <mesh geometry={G.sphere} material={g} position={[0.045, 0.13, 0.05]} scale={0.035} />
        <mesh geometry={G.sphere} material={g} position={[-0.045, 0.13, 0.05]} scale={0.035} />
        <mesh geometry={G.sphere} material={std('#1d1d1d')} position={[0.05, 0.14, 0.075]} scale={0.015} />
        <mesh geometry={G.sphere} material={std('#1d1d1d')} position={[-0.05, 0.14, 0.075]} scale={0.015} />
      </Interact>
    </group>
  );
}
