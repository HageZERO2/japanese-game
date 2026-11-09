import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cyl, Sph, Cone, Quad, Interact, Solid, Sway, G, type V3 } from './parts';
import { std, toon, glow, M, basic } from './materials';
import { signTexture, pattern, rng } from './textures';
import type { Sfx } from '../systems/audio';

interface PropProps {
  p: V3;
  ry?: number;
  words?: string[];
  noWord?: boolean;
}

/** Wraps a prop in an Interact unless noWord is set. */
function W({ words, noWord, radius = 1.6, h = 1.2, sfx, children }: { words: string[]; noWord?: boolean; radius?: number; h?: number; sfx?: Sfx; children: React.ReactNode }) {
  if (noWord) return <>{children}</>;
  return (
    <Interact words={words} radius={radius} h={h} sfx={sfx}>
      {children}
    </Interact>
  );
}

export function VendingMachine({ p, ry = 0, words = ['vending_machine', 'drink'], color = '#e94b5a', noWord }: PropProps & { color?: string }) {
  const front = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 512;
    const g = c.getContext('2d')!;
    g.fillStyle = '#f5f8fb';
    g.fillRect(0, 0, 256, 300);
    const cols = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#f783ac', '#ffa94d', '#a5d8ff', '#ffffff'];
    for (let row = 0; row < 4; row++)
      for (let i = 0; i < 6; i++) {
        g.fillStyle = cols[(row * 6 + i * 3) % cols.length];
        g.beginPath();
        g.roundRect(14 + i * 39, 18 + row * 70, 28, 48, 6);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.6)';
        g.fillRect(19 + i * 39, 26 + row * 70, 6, 30);
        g.fillStyle = '#2b2b2b';
        g.fillRect(16 + i * 39, 70 + row * 70, 24, 8);
      }
    g.fillStyle = '#3b3b45';
    g.fillRect(0, 300, 256, 212);
    g.fillStyle = '#1d1d22';
    g.fillRect(30, 420, 196, 60);
    g.fillStyle = '#9ef0a8';
    g.fillRect(190, 320, 40, 16);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={words} noWord={noWord} h={2} sfx="vending">
        <Box p={[0, 0.95, 0]} s={[0.95, 1.9, 0.75]} c={color} solid />
        <Box p={[0, 1.95, 0]} s={[1, 0.1, 0.8]} c="#ffffff" />
        <mesh geometry={G.plane} position={[0, 1.0, 0.376]} scale={[0.82, 1.62, 1]} material={glow('#ffffff', '#ffffff', 0.25, 0.9, { map: front })} />
      </W>
    </group>
  );
}

export function PhoneBooth({ p, ry = 0 }: PropProps) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={['phone_booth', 'phone']} h={2.5}>
        <Box p={[0, 0.05, 0]} s={[1.1, 0.1, 1.1]} c="#d6d6d6" solid />
        {[-0.5, 0.5].map((x) => [-0.5, 0.5].map((z) => <Box key={`${x}${z}`} p={[x, 1.15, z]} s={[0.07, 2.2, 0.07]} c="#3f9a62" />))}
        <Box p={[0, 2.3, 0]} s={[1.15, 0.18, 1.15]} c="#3f9a62" />
        <Quad p={[0, 2.3, 0.58]} s={[0.9, 0.16]} map={signTexture('公衆電話', { bg: '#3f9a62', fg: '#ffffff', w: 512, h: 96 })} />
        <Box p={[0, 1.2, -0.5]} s={[1, 2.1, 0.03]} m={M.glass()} />
        <Box p={[0.5, 1.2, 0]} s={[0.03, 2.1, 1]} m={M.glass()} />
        <Box p={[-0.5, 1.2, 0]} s={[0.03, 2.1, 1]} m={M.glass()} />
        <Box p={[0, 1.3, -0.4]} s={[0.35, 0.5, 0.15]} c="#7bc96f" />
        <Box p={[0, 2.18, 0]} s={[0.6, 0.04, 0.6]} m={M.lamp()} />
        <Solid p={[0, 1.2, 0]} s={[1.1, 2.4, 1.1]} />
      </W>
    </group>
  );
}

export function Bicycle({ p, ry = 0, color = '#58a6d6', noWord, words = ['bicycle'] }: PropProps & { color?: string }) {
  const frame = std(color, { rough: 0.4, metal: 0.4 });
  const tire = std('#2a2a2e');
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={words} noWord={noWord} h={1.1} radius={1.4}>
        {[-0.5, 0.5].map((z) => (
          <mesh key={z} geometry={G.torus(0.09)} material={tire} position={[0, 0.34, z]} rotation={[0, Math.PI / 2, 0]} scale={0.32} castShadow />
        ))}
        <Box p={[0, 0.55, 0]} s={[0.05, 0.05, 0.9]} m={frame} r={[0.25, 0, 0]} />
        <Box p={[0, 0.5, -0.18]} s={[0.05, 0.5, 0.05]} m={frame} r={[-0.3, 0, 0]} />
        <Box p={[0, 0.78, -0.3]} s={[0.14, 0.05, 0.24]} c="#3a3030" />
        <Box p={[0, 0.85, 0.45]} s={[0.5, 0.04, 0.04]} m={M.metal()} />
        <Box p={[0, 0.7, 0.62]} s={[0.32, 0.22, 0.24]} c="#d8d8d8" />
        <Solid p={[0, 0.5, 0]} s={[0.4, 1, 1.5]} />
      </W>
    </group>
  );
}

export function Postbox({ p, ry = 0 }: PropProps) {
  const red = std('#e0352b', { rough: 0.45 });
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={['postbox']} h={1.6}>
        <Cyl p={[0, 0.7, 0]} rad={0.28} h={1.2} m={red} solid />
        <Sph p={[0, 1.3, 0]} s={[0.28, 0.12, 0.28]} m={red} />
        <Box p={[0, 1.05, 0.27]} s={[0.3, 0.04, 0.04]} c="#2a2a2a" />
        <Quad p={[0, 0.75, 0.285]} s={[0.26, 0.26]} map={signTexture('〒', { bg: '#e0352b', fg: '#ffffff', w: 128, h: 128 })} />
        <Cyl p={[0, 0.05, 0]} rad={0.3} h={0.1} c="#3a3a3a" />
      </W>
    </group>
  );
}

export function StreetLamp({ p, ry = 0, noWord = true, words = ['street_lamp'] }: PropProps) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={words} noWord={noWord} h={3.6}>
        <Cyl p={[0, 1.7, 0]} rad={0.07} h={3.4} c="#4a4f5a" solid />
        <Box p={[0, 3.4, 0.35]} s={[0.08, 0.08, 0.7]} c="#4a4f5a" />
        <Box p={[0, 3.3, 0.68]} s={[0.36, 0.14, 0.24]} c="#4a4f5a" />
        <Box p={[0, 3.21, 0.68]} s={[0.3, 0.04, 0.2]} m={M.lamp()} />
        <Cyl p={[0, 0.1, 0]} rad={0.14} h={0.2} c="#3c414b" />
      </W>
    </group>
  );
}

export function UtilityPole({ p, words = ['utility_pole', 'light'], noWord = true }: PropProps) {
  return (
    <group position={p}>
      <W words={words} noWord={noWord} h={2}>
        <Cyl p={[0, 4, 0]} rad={0.14} h={8} top={0.75} c="#a9a59c" solid />
        <Box p={[0, 7.3, 0]} s={[1.6, 0.1, 0.1]} c="#6f6a62" />
        <Box p={[0, 6.6, 0]} s={[1.2, 0.08, 0.08]} c="#6f6a62" />
        <Cyl p={[0.35, 6.2, 0]} rad={0.18} h={0.5} c="#8b8f96" />
        <Box p={[0, 2.4, 0.15]} s={[0.25, 0.7, 0.03]} c="#f5f1e6" />
        <Quad p={[0, 2.4, 0.17]} s={[0.22, 0.62]} map={signTexture('夢の街一丁目', { vertical: true, bg: '#f5f1e6', fg: '#2f4a7a', w: 96, h: 384 })} />
      </W>
    </group>
  );
}

/** Thin sagging cables between pole tops. */
export function Wires({ points, y = 7.25 }: { points: [number, number][]; y?: number }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, z0] = points[i];
      const [x1, z1] = points[i + 1];
      for (const off of [-0.7, 0, 0.7]) {
        const n = 12;
        for (let k = 0; k < n; k++) {
          const t0 = k / n;
          const t1 = (k + 1) / n;
          const sag = (t: number) => -Math.sin(t * Math.PI) * 0.6;
          pts.push(new THREE.Vector3(x0 + (x1 - x0) * t0, y + sag(t0) + (off === 0 ? -0.65 : 0), z0 + (z1 - z0) * t0 + (off === 0 ? 0 : 0) + off * 0));
          pts.push(new THREE.Vector3(x0 + (x1 - x0) * t1, y + sag(t1) + (off === 0 ? -0.65 : 0), z0 + (z1 - z0) * t1));
          pts[pts.length - 2].x += x0 === x1 ? off : 0;
          pts[pts.length - 1].x += x0 === x1 ? off : 0;
          pts[pts.length - 2].z += z0 === z1 ? off : 0;
          pts[pts.length - 1].z += z0 === z1 ? off : 0;
        }
      }
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [points, y]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#2c2c33" />
    </lineSegments>
  );
}

export function TrafficLight({ p, ry = 0 }: PropProps) {
  const ref = useRef<THREE.Group>(null);
  const mats = useMemo(
    () => ({
      g: new THREE.MeshStandardMaterial({ color: '#2fbf71', emissive: '#2fbf71', emissiveIntensity: 2 }),
      y: new THREE.MeshStandardMaterial({ color: '#f5c542', emissive: '#f5c542', emissiveIntensity: 0 }),
      r: new THREE.MeshStandardMaterial({ color: '#e5484d', emissive: '#e5484d', emissiveIntensity: 0 }),
    }),
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime % 14;
    mats.g.emissiveIntensity = t < 6 ? 2.2 : 0.05;
    mats.y.emissiveIntensity = t >= 6 && t < 8 ? 2.2 : 0.05;
    mats.r.emissiveIntensity = t >= 8 ? 2.2 : 0.05;
  });
  return (
    <group ref={ref} position={p} rotation={[0, ry, 0]}>
      <W words={['traffic_light']} h={3.4}>
        <Cyl p={[0, 2, 0]} rad={0.08} h={4} c="#8a8f99" solid />
        <Box p={[0, 3.9, 0.9]} s={[0.08, 0.08, 1.8]} c="#8a8f99" />
        <Box p={[0, 3.75, 1.7]} s={[1.0, 0.36, 0.22]} c="#e6e8ec" />
        {(['g', 'y', 'r'] as const).map((k, i) => (
          <mesh key={k} geometry={G.cyl(16)} material={mats[k]} position={[-0.3 + i * 0.3, 3.75, 1.82]} rotation={[Math.PI / 2, 0, 0]} scale={[0.11, 0.04, 0.11]} />
        ))}
      </W>
    </group>
  );
}

export function RoadSign({ p, ry = 0, text = '止まれ', words = ['road_sign'] }: PropProps & { text?: string }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(128, 236);
    g.lineTo(16, 30);
    g.lineTo(240, 30);
    g.closePath();
    g.fill();
    g.fillStyle = '#d9342b';
    g.beginPath();
    g.moveTo(128, 214);
    g.lineTo(36, 42);
    g.lineTo(220, 42);
    g.closePath();
    g.fill();
    g.fillStyle = '#ffffff';
    g.font = '800 46px "M PLUS Rounded 1c", sans-serif';
    g.textAlign = 'center';
    g.fillText(text, 128, 110);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text]);
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={words} h={2.6}>
        <Cyl p={[0, 1.2, 0]} rad={0.04} h={2.4} c="#9aa0a8" solid />
        <mesh geometry={G.plane} position={[0, 2.3, 0.05]} scale={[0.7, 0.7, 1]} material={std('#ffffff', { map: tex, transparent: true })} />
      </W>
    </group>
  );
}

export function Bench({ p, ry = 0, words = ['bench'], noWord, color = '#b5835a' }: PropProps & { color?: string }) {
  const wood = std(color, { map: pattern('wood', [1, 1], color) });
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={words} noWord={noWord} h={1}>
        <Box p={[0, 0.45, 0]} s={[1.8, 0.07, 0.5]} m={wood} solid />
        <Box p={[0, 0.75, -0.24]} s={[1.8, 0.35, 0.05]} m={wood} />
        {[-0.75, 0.75].map((x) => (
          <Box key={x} p={[x, 0.22, 0]} s={[0.07, 0.45, 0.45]} c="#3d3f46" />
        ))}
      </W>
    </group>
  );
}

export function Car({ p, ry = 0, color = '#f4f1ea', words = ['car'], taxi }: PropProps & { color?: string; taxi?: boolean }) {
  const body = std(color, { rough: 0.25, metal: 0.4, env: 1.2 });
  const tire = std('#26262b');
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={words} h={1.8} radius={2.6}>
        <Box p={[0, 0.55, 0]} s={[1.7, 0.6, 3.8]} m={body} solid />
        <Box p={[0, 1.05, -0.2]} s={[1.5, 0.5, 2.1]} m={body} />
        <Box p={[0, 1.07, -0.2]} s={[1.52, 0.38, 1.9]} m={M.glass()} />
        <Box p={[0, 0.6, 1.91]} s={[1.5, 0.15, 0.02]} c="#e9e9e9" />
        {[-0.6, 0.6].map((x) => (
          <Box key={x} p={[x, 0.68, 1.91]} s={[0.3, 0.12, 0.02]} m={M.lamp()} />
        ))}
        {[-0.6, 0.6].map((x) => (
          <Box key={`r${x}`} p={[x, 0.68, -1.91]} s={[0.3, 0.12, 0.02]} m={glow('#e5484d', '#e5484d', 0.4, 1.5)} />
        ))}
        {[-0.85, 0.85].map((x) =>
          [-1.2, 1.2].map((z) => <mesh key={`${x}${z}`} geometry={G.cyl(16)} material={tire} position={[x, 0.32, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.32, 0.22, 0.32]} castShadow />),
        )}
        {taxi && (
          <>
            <Box p={[0, 1.42, -0.2]} s={[0.5, 0.2, 0.25]} m={glow('#ffe58a', '#ffcf3d', 0.3, 1.6)} />
            <Box p={[0, 0.7, 0]} s={[1.72, 0.08, 3.82]} c="#2d2d33" />
          </>
        )}
      </W>
    </group>
  );
}

export function Bus({ p, ry = 0 }: PropProps) {
  const body = std('#7fc4a3', { rough: 0.35, metal: 0.2 });
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={['bus']} h={3.4} radius={3.4}>
        <Box p={[0, 1.6, 0]} s={[2.5, 2.6, 10]} m={body} solid />
        <Box p={[0, 0.6, 0]} s={[2.52, 0.5, 10.02]} c="#f4f1ea" />
        <Box p={[1.26, 2.05, 0.4]} s={[0.02, 1.0, 8]} m={M.glass()} />
        <Box p={[-1.26, 2.05, 0.4]} s={[0.02, 1.0, 8]} m={M.glass()} />
        <Box p={[0, 2.0, 5.01]} s={[2.2, 1.3, 0.02]} m={M.glass()} />
        <Quad p={[0, 2.85, 5.02]} s={[1.8, 0.35]} map={signTexture('夢の街駅', { bg: '#1d1d22', fg: '#ffb84d', w: 512, h: 100, glow: true })} emissive />
        {[-1.1, 1.1].map((x) =>
          [-3.3, 3.3].map((z) => <mesh key={`${x}${z}`} geometry={G.cyl(16)} material={std('#26262b')} position={[x, 0.45, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.45, 0.3, 0.45]} castShadow />),
        )}
      </W>
    </group>
  );
}

export function BusStop({ p, ry = 0 }: PropProps) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={['bus_stop', 'wait']} h={2.6}>
        <Cyl p={[0, 1.2, 0]} rad={0.05} h={2.4} c="#8a8f99" solid />
        <Cyl p={[0, 2.5, 0]} rad={0.3} h={0.06} r={[Math.PI / 2, 0, 0]} c="#2f6fb5" />
        <Quad p={[0, 2.5, 0.04]} s={[0.5, 0.5]} map={signTexture('バス', { bg: '#2f6fb5', fg: '#ffffff', w: 256, h: 256 })} />
        <Box p={[0, 1.4, 0.03]} s={[0.4, 0.55, 0.03]} c="#ffffff" />
        <Box p={[1.2, 1.25, -0.4]} s={[2.4, 0.05, 1]} c="#d0d4da" />
        <Box p={[1.2, 1.2, -0.9]} s={[2.4, 2.4, 0.05]} m={M.glass()} solid />
        <Bench p={[1.2, 0, -0.6]} noWord />
      </W>
    </group>
  );
}

export function FireHydrant({ p }: PropProps) {
  const red = std('#d93a2f', { rough: 0.4 });
  return (
    <group position={p}>
      <W words={['fire_hydrant']} h={1}>
        <Cyl p={[0, 0.35, 0]} rad={0.13} h={0.7} m={red} solid />
        <Sph p={[0, 0.72, 0]} s={0.14} m={red} />
        <Cyl p={[0, 0.45, 0]} rad={0.06} h={0.4} r={[0, 0, Math.PI / 2]} m={red} />
      </W>
    </group>
  );
}

export function Flowerpot({ p, color = '#ff8fab', words = ['flowerpot'], noWord }: PropProps & { color?: string }) {
  return (
    <group position={p}>
      <W words={words} noWord={noWord} h={0.9} radius={1.2}>
        <Cyl p={[0, 0.2, 0]} rad={0.24} top={1.25} h={0.4} c="#c97a4f" solid />
        <Sway amount={0.05}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Sph key={i} p={[Math.cos(i * 1.3) * 0.12, 0.5 + (i % 2) * 0.08, Math.sin(i * 1.3) * 0.12]} s={0.09} m={toon(i % 2 ? color : '#fff3a8')} lo />
          ))}
          <Sph p={[0, 0.42, 0]} s={[0.22, 0.12, 0.22]} m={toon('#6fae5a')} lo />
        </Sway>
      </W>
    </group>
  );
}

const leafCache = new Map<string, THREE.Material>();
function leaf(color: string) {
  let m = leafCache.get(color);
  if (!m) {
    m = toon(color);
    leafCache.set(color, m);
  }
  return m;
}

export function Tree({ p, scale = 1, color = '#7dbb63', words = ['tree', 'leaf'], noWord, seed = 1 }: PropProps & { scale?: number; color?: string; seed?: number }) {
  const blobs = useMemo(() => {
    const r = rng(seed * 131 + 7);
    return Array.from({ length: 6 }, (_, i) => ({ p: [(r() - 0.5) * 1.6, 3.2 + r() * 1.3 + (i === 0 ? 0.6 : 0), (r() - 0.5) * 1.6] as V3, s: 1.0 + r() * 0.6, c: i % 3 === 0 ? shade(color, 1.12) : i % 3 === 1 ? color : shade(color, 0.88) }));
  }, [seed, color]);
  return (
    <group position={p} scale={scale}>
      <W words={words} noWord={noWord} h={2.2} radius={1.9}>
        <Cyl p={[0, 1.5, 0]} rad={0.2} top={0.6} h={3} c="#8b6a4e" solid />
        <Sway amount={0.025}>
          {blobs.map((b, i) => (
            <Sph key={i} p={b.p} s={b.s} m={leaf(b.c)} lo />
          ))}
        </Sway>
      </W>
    </group>
  );
}

export function SakuraTree({ p, scale = 1, words = ['sakura', 'flower'], noWord, seed = 1 }: PropProps & { scale?: number; seed?: number }) {
  const blobs = useMemo(() => {
    const r = rng(seed * 977 + 3);
    return Array.from({ length: 9 }, () => ({ p: [(r() - 0.5) * 3.2, 3.0 + r() * 1.6, (r() - 0.5) * 3.2] as V3, s: 0.9 + r() * 0.7, c: r() > 0.5 ? '#ffc4d8' : r() > 0.5 ? '#ffd9e6' : '#ffb0c9' }));
  }, [seed]);
  return (
    <group position={p} scale={scale}>
      <W words={words} noWord={noWord} h={2.2} radius={2}>
        <Cyl p={[0, 1.3, 0]} rad={0.22} top={0.55} h={2.6} c="#6b4a3e" solid />
        <Cyl p={[0.5, 2.6, 0.2]} rad={0.08} h={1.4} r={[0.2, 0, -0.7]} c="#6b4a3e" />
        <Cyl p={[-0.5, 2.7, -0.2]} rad={0.08} h={1.4} r={[-0.2, 0, 0.7]} c="#6b4a3e" />
        <Sway amount={0.02}>
          {blobs.map((b, i) => (
            <Sph key={i} p={b.p} s={b.s} m={leaf(b.c)} lo />
          ))}
        </Sway>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={2.6} material={basic('#ffc4d8', { transparent: true, opacity: 0.55 })}>
          <circleGeometry args={[1, 24]} />
        </mesh>
      </W>
    </group>
  );
}

export function PineTree({ p, scale = 1, words = ['pine'], noWord }: PropProps & { scale?: number }) {
  return (
    <group position={p} scale={scale}>
      <W words={words} noWord={noWord} h={2} radius={1.8}>
        <Cyl p={[0, 1.4, 0]} rad={0.18} top={0.6} h={2.8} c="#6b4b3a" solid />
        <Sway amount={0.015}>
          <Sph p={[0.6, 2.8, 0]} s={[1.2, 0.45, 1]} m={leaf('#3f7a4f')} lo />
          <Sph p={[-0.5, 3.4, 0.3]} s={[1.0, 0.4, 0.9]} m={leaf('#4a8a5a')} lo />
          <Sph p={[0.1, 4.0, -0.2]} s={[0.9, 0.38, 0.8]} m={leaf('#3f7a4f')} lo />
        </Sway>
      </W>
    </group>
  );
}

export function Bush({ p, s = 1, color = '#78b35e', words = ['plant'], noWord = true }: PropProps & { s?: number; color?: string }) {
  return (
    <group position={p} scale={s}>
      <W words={words} noWord={noWord} h={1}>
        <Sph p={[0, 0.4, 0]} s={[0.7, 0.5, 0.6]} m={leaf(color)} lo />
        <Sph p={[0.4, 0.35, 0.1]} s={[0.45, 0.38, 0.45]} m={leaf(shade(color, 1.1))} lo />
        <Sph p={[-0.35, 0.33, -0.1]} s={[0.45, 0.35, 0.45]} m={leaf(shade(color, 0.9))} lo />
      </W>
    </group>
  );
}

export function PaperLantern({ p, color = 'red', words, noWord = true }: PropProps & { color?: 'red' | 'white' }) {
  const m = color === 'red' ? M.lantern() : M.lanternWhite();
  return (
    <group position={p}>
      <W words={words ?? ['paper_lantern']} noWord={noWord} h={0.4}>
        <Sph p={[0, 0, 0]} s={[0.22, 0.3, 0.22]} m={m} cast={false} />
        <Cyl p={[0, 0.3, 0]} rad={0.13} h={0.05} c="#2a2a2a" cast={false} />
        <Cyl p={[0, -0.3, 0]} rad={0.13} h={0.05} c="#2a2a2a" cast={false} />
      </W>
    </group>
  );
}

/** A string of paper lanterns between two points (above walkways). */
export function LanternString({ from, to, y = 4, count = 8, alt }: { from: [number, number]; to: [number, number]; y?: number; count?: number; alt?: boolean }) {
  const items = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    return { x: from[0] + (to[0] - from[0]) * t, z: from[1] + (to[1] - from[1]) * t, y: y - Math.sin(t * Math.PI) * 0.5 };
  });
  return (
    <>
      <Wires points={[from, to]} y={y + 0.3} />
      {items.map((it, i) => (
        <PaperLantern key={i} p={[it.x, it.y, it.z]} color={alt && i % 2 ? 'white' : 'red'} />
      ))}
    </>
  );
}

export function StoneLantern({ p, words = ['stone_lantern'], noWord }: PropProps) {
  const stone = std('#a9a49a', { map: pattern('stone', [1, 1]) });
  return (
    <group position={p}>
      <W words={words} noWord={noWord} h={2.1}>
        <Box p={[0, 0.15, 0]} s={[0.7, 0.3, 0.7]} m={stone} solid />
        <Cyl p={[0, 0.7, 0]} rad={0.14} h={0.8} m={stone} seg={8} />
        <Box p={[0, 1.15, 0]} s={[0.6, 0.12, 0.6]} m={stone} />
        <Box p={[0, 1.4, 0]} s={[0.42, 0.38, 0.42]} m={stone} />
        <Box p={[0, 1.4, 0.0]} s={[0.24, 0.22, 0.44]} m={M.lanternWhite()} />
        <mesh geometry={G.pyramid} material={stone} position={[0, 1.58, 0]} scale={[0.85, 0.4, 0.85]} castShadow />
        <Sph p={[0, 2.0, 0]} s={0.07} m={stone} />
      </W>
    </group>
  );
}

export function Torii({ p, ry = 0, scale = 1, words = ['torii'], noWord }: PropProps & { scale?: number }) {
  const red = std('#d8422f', { rough: 0.55 });
  const black = std('#2a2526');
  return (
    <group position={p} rotation={[0, ry, 0]} scale={scale}>
      <W words={words} noWord={noWord} h={2.4} radius={3}>
        {[-2.2, 2.2].map((x) => (
          <group key={x}>
            <Cyl p={[x, 2.6, 0]} rad={0.24} top={0.85} h={5.2} m={red} solid />
            <Cyl p={[x, 0.2, 0]} rad={0.3} h={0.4} m={black} />
          </group>
        ))}
        <Box p={[0, 4.3, 0]} s={[5.4, 0.3, 0.35]} m={red} />
        <Box p={[0, 5.25, 0]} s={[6.6, 0.32, 0.5]} m={red} />
        <Box p={[0, 5.5, 0]} s={[7.0, 0.18, 0.6]} m={black} />
        <Box p={[0, 4.78, 0]} s={[0.35, 0.7, 0.3]} m={red} />
        <Quad p={[0, 4.78, 0.16]} s={[0.28, 0.6]} map={signTexture('夢神社', { vertical: true, bg: '#2a2526', fg: '#f2d48a', w: 96, h: 256 })} />
      </W>
    </group>
  );
}

export function OutdoorTable({ p, ry = 0, color = '#f6a6c1', withWords = false }: PropProps & { color?: string; withWords?: boolean }) {
  const wood = std('#e8d6bd');
  const content = (
    <>
      <Cyl p={[0, 0.72, 0]} rad={0.5} h={0.05} m={wood} solid />
      <Cyl p={[0, 0.36, 0]} rad={0.04} h={0.72} c="#4a4a50" />
      <Cyl p={[0, 1.4, 0]} rad={0.03} h={2.8} c="#ffffff" />
      <mesh geometry={G.cone(8)} position={[0, 2.6, 0]} scale={[1.4, 0.55, 1.4]} material={std(color, { side: THREE.DoubleSide })} castShadow />
    </>
  );
  return (
    <group position={p} rotation={[0, ry, 0]}>
      {withWords ? (
        <>
          <Interact words={['table']} radius={1.4} h={1.1}>
            {content}
          </Interact>
          <Interact words={['parasol']} p={[0, 0, 0]} radius={0.01} h={2.8} noMarker>
            <group />
          </Interact>
          <Interact words={['cup']} p={[0.2, 0.75, 0.15]} radius={1.2} h={0.25}>
            <Cyl p={[0, 0.05, 0]} rad={0.05} h={0.1} c="#ffffff" />
          </Interact>
        </>
      ) : (
        content
      )}
      {[0, Math.PI].map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          {withWords && a === 0 ? (
            <Interact words={['chair']} p={[0, 0, -0.85]} radius={1.2} h={1}>
              <Chair />
            </Interact>
          ) : (
            <group position={[0, 0, -0.85]}>
              <Chair />
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

function Chair() {
  return (
    <>
      <Box p={[0, 0.45, 0]} s={[0.42, 0.05, 0.42]} c="#ffffff" solid />
      <Box p={[0, 0.72, -0.2]} s={[0.42, 0.5, 0.04]} c="#ffffff" />
      {[-0.18, 0.18].map((x) => [-0.18, 0.18].map((z) => <Box key={`${x}${z}`} p={[x, 0.22, z]} s={[0.03, 0.45, 0.03]} c="#5a5a60" />))}
    </>
  );
}

export function Parasol({ p, color = '#9ed2f0' }: PropProps & { color?: string }) {
  return (
    <group position={p}>
      <Interact words={['parasol']} radius={1.6} h={2.2}>
        <Cyl p={[0, 1.3, 0]} rad={0.035} h={2.6} c="#ffffff" solid />
        <mesh geometry={G.cone(8)} position={[0, 2.5, 0]} scale={[1.5, 0.55, 1.5]} material={std(color, { side: THREE.DoubleSide })} castShadow />
        <Cyl p={[0, 0.06, 0]} rad={0.3} h={0.12} c="#8a8f99" />
      </Interact>
    </group>
  );
}

export function Crosswalk({ p, ry = 0, width = 7, len = 4 }: PropProps & { width?: number; len?: number }) {
  const stripes = Math.floor(width / 0.9);
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Interact words={['crosswalk', 'walk']} radius={2.4} h={0.6}>
        {Array.from({ length: stripes }, (_, i) => (
          <mesh key={i} geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[-width / 2 + 0.45 + i * 0.9, 0.025, 0]} scale={[0.45, len, 1]} material={std('#f4f4f0', { rough: 0.6 })} receiveShadow />
        ))}
      </Interact>
    </group>
  );
}

export function Motorbike({ p, ry = 0 }: PropProps) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={['motorbike']} h={1.3}>
        {[-0.55, 0.55].map((z) => (
          <mesh key={z} geometry={G.torus(0.15)} material={std('#26262b')} position={[0, 0.3, z]} rotation={[0, Math.PI / 2, 0]} scale={0.28} castShadow />
        ))}
        <Box p={[0, 0.6, 0]} s={[0.35, 0.35, 0.9]} c="#e85d75" solid />
        <Box p={[0, 0.82, -0.2]} s={[0.3, 0.08, 0.5]} c="#2b2b30" />
        <Box p={[0, 0.95, 0.5]} s={[0.6, 0.04, 0.04]} m={M.metal()} />
        <Box p={[0, 0.75, 0.6]} s={[0.2, 0.15, 0.1]} m={M.lamp()} />
      </W>
    </group>
  );
}

export function Planter({ p, w = 2, words = ['plant'], noWord = true }: PropProps & { w?: number }) {
  return (
    <group position={p}>
      <W words={words} noWord={noWord} h={0.9}>
        <Box p={[0, 0.25, 0]} s={[w, 0.5, 0.6]} c="#d9cdbd" solid />
        {Array.from({ length: Math.round(w * 2) }, (_, i) => (
          <Sph key={i} p={[-w / 2 + 0.25 + i * 0.5, 0.6, 0]} s={[0.3, 0.25, 0.28]} m={leaf(i % 2 ? '#7dbb63' : '#8fca71')} lo />
        ))}
      </W>
    </group>
  );
}

/** Low wall (block fence) segment with tile cap. */
export function BlockWall({ p, len, ry = 0, h = 1.3, color = '#e2dccf', words, noWord = true }: PropProps & { len: number; h?: number; color?: string }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={words ?? ['wall']} noWord={noWord} h={h + 0.2}>
        <Box p={[0, h / 2, 0]} s={[len, h, 0.25]} c={color} solid />
        <Box p={[0, h + 0.05, 0]} s={[len + 0.05, 0.1, 0.36]} c="#5b6270" />
      </W>
    </group>
  );
}

export function Hedge({ p, len, ry = 0, h = 1.4 }: PropProps & { len: number; h?: number }) {
  const n = Math.max(1, Math.round(len / 1.4));
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Box p={[0, h / 2, 0]} s={[len, h, 1]} m={leaf('#6aa857')} solid cast={false} />
      {Array.from({ length: n }, (_, i) => (
        <Sph key={i} p={[-len / 2 + (i + 0.5) * (len / n), h, 0]} s={[0.8, 0.4, 0.6]} m={leaf(i % 2 ? '#74b45f' : '#64a052')} lo cast={false} />
      ))}
    </group>
  );
}

export function Mannequin({ p, ry = 0, outfit = '#f6a6c1', words, skirt }: PropProps & { outfit?: string; skirt?: boolean }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={words ?? ['clothes']} h={2}>
        <Cyl p={[0, 0.05, 0]} rad={0.25} h={0.1} c="#5a5a60" solid />
        <Cyl p={[0, 0.5, 0]} rad={0.025} h={0.9} c="#8a8f99" />
        <Cyl p={[0, 1.25, 0]} rad={0.18} top={1.25} h={0.55} m={toon(outfit)} />
        {skirt ? <Cyl p={[0, 0.88, 0]} rad={0.3} top={0.6} h={0.3} m={toon(shade(outfit, 0.85))} /> : <Cyl p={[0, 0.9, 0]} rad={0.17} h={0.3} m={toon('#4a5a7a')} />}
        <Sph p={[0, 1.65, 0]} s={0.12} c="#f2ece4" />
      </W>
    </group>
  );
}

/** Tilted crate stand with colored produce. */
export function ProduceStand({ p, ry = 0, items }: PropProps & { items: { word: string; color: string; shape?: 'round' | 'long' | 'big' }[] }) {
  const w = items.length * 0.9;
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Box p={[0, 0.45, 0]} s={[w + 0.2, 0.9, 0.9]} c="#a7794f" solid />
      {items.map((it, i) => (
        <Interact key={it.word} words={[it.word]} p={[-w / 2 + 0.45 + i * 0.9, 0.95, 0]} radius={1.3} h={0.5}>
          <Box p={[0, 0, 0]} s={[0.8, 0.12, 0.8]} c="#c79a6b" r={[-0.25, 0, 0]} />
          {Array.from({ length: it.shape === 'big' ? 2 : 6 }, (_, k) => (
            <Sph
              key={k}
              p={[((k % 3) - 1) * 0.22, 0.12 + (it.shape === 'big' ? 0.08 : 0), (Math.floor(k / 3) - 0.5) * 0.25]}
              s={it.shape === 'big' ? [0.22, 0.2, 0.2] : it.shape === 'long' ? [0.05, 0.05, 0.16] : 0.09}
              m={toon(it.color)}
              lo
            />
          ))}
        </Interact>
      ))}
    </group>
  );
}

/** Small shop display table with items on top (each an interactable). */
export function DisplayTable({ p, ry = 0, items, cloth = '#fff6ea' }: PropProps & { items: { word: string; node: React.ReactNode }[]; cloth?: string }) {
  const w = items.length * 0.8;
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Box p={[0, 0.42, 0]} s={[w + 0.2, 0.84, 0.8]} c={cloth} solid />
      {items.map((it, i) => (
        <Interact key={it.word} words={[it.word]} p={[-w / 2 + 0.4 + i * 0.8, 0.86, 0]} radius={1.25} h={0.5}>
          {it.node}
        </Interact>
      ))}
    </group>
  );
}

export function Kiosk({ p, ry = 0, title = '屋台', words = ['food_stall'], color = '#d9443c', children }: PropProps & { title?: string; color?: string; children?: React.ReactNode }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Interact words={words} radius={2} h={2.6}>
        <Box p={[0, 0.5, 0]} s={[2.4, 1, 1.2]} m={std('#a7794f', { map: pattern('planks', [1, 1]) })} solid />
        {[-1.1, 1.1].map((x) => (
          <Box key={x} p={[x, 1.6, -0.5]} s={[0.08, 3.2, 0.08]} c="#7a5638" />
        ))}
        <Box p={[0, 3.2, -0.1]} s={[2.6, 0.08, 1.6]} c={color} r={[0.2, 0, 0]} />
        <Quad p={[0, 2.85, 0.68]} s={[2.2, 0.45]} map={signTexture(title, { bg: color, fg: '#fff6e0', w: 512, h: 104 })} r={[0.2, 0, 0]} />
        <PaperLantern p={[-1.05, 2.4, 0.6]} />
        <PaperLantern p={[1.05, 2.4, 0.6]} />
      </Interact>
      {children}
    </group>
  );
}

export function shade(hex: string, f: number) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(f);
  return `#${c.getHexString()}`;
}

export function Rock({ p, s = 1, words = ['rock'], noWord, ry = 0 }: PropProps & { s?: number }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <W words={words} noWord={noWord} h={0.9 * s} radius={1.6}>
        <Sph p={[0, 0.3 * s, 0]} s={[0.7 * s, 0.45 * s, 0.55 * s]} m={std('#9a958c', { map: pattern('stone', [1, 1]) })} lo />
        <Sph p={[0.35 * s, 0.2 * s, 0.1 * s]} s={[0.4 * s, 0.3 * s, 0.35 * s]} m={std('#8f8a82')} lo />
        <Solid p={[0, 0.4 * s, 0]} s={[1.2 * s, 0.8 * s, 1 * s]} />
      </W>
    </group>
  );
}

export { Cone };
