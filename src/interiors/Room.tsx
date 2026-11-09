import * as THREE from 'three';
import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import type { InteriorId } from '../types';
import { BUILDINGS, doorFront } from '../world/layout';
import { Box, Cone, Cyl, Interact, Quad, Solid, Sph, type V3 } from '../world/parts';
import { basic, glow, std } from '../world/materials';
import { pattern, signTexture } from '../world/textures';

type PatKind = Parameters<typeof pattern>[0];

export interface Look {
  kind?: PatKind;
  color: string;
  tint?: string;
  /** Meters covered by one texture tile. */
  scale?: number;
}

export interface WindowDef {
  wall: 'n' | 's' | 'e' | 'w';
  /** Position along the wall: x for n/s, z for e/w. */
  at: number;
  y?: number;
  w?: number;
  h?: number;
}

interface RoomProps {
  id: InteriorId;
  size: V3;
  floor: Look;
  wall: Look;
  ceiling: Look;
  trim?: string;
  wainscot?: { color: string; h: number; kind?: PatKind; tint?: string };
  door?: 'glass' | 'lattice' | 'wood';
  windows?: WindowDef[];
  children?: ReactNode;
}

const T = 0.4;

function lookMat(look: Look, rx: number, ry: number) {
  const map = look.kind ? pattern(look.kind, [Math.max(1, Math.round((rx / (look.scale ?? 2)) * 2) / 2), Math.max(1, Math.round((ry / (look.scale ?? 2)) * 2) / 2)], look.tint) : undefined;
  return std(look.color, { map, rough: 0.85 });
}

function WindowFrame({ w, h, p, r }: { w: number; h: number; p: V3; r: V3 }) {
  return (
    <group position={p} rotation={r}>
      <mesh position={[0, h * 0.25, 0.006]} scale={[w, h * 0.5, 1]} material={basic('#d4e9ff', { fog: false })}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh position={[0, -h * 0.25, 0.006]} scale={[w, h * 0.5, 1]} material={basic('#f6f0e0', { fog: false })}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <Box p={[0, h / 2 - 0.035, 0.05]} s={[w + 0.1, 0.07, 0.1]} c="#f3e9d8" cast={false} />
      <Box p={[0, -h / 2 + 0.035, 0.05]} s={[w + 0.1, 0.07, 0.1]} c="#f3e9d8" cast={false} />
      <Box p={[-w / 2 - 0.035, 0, 0.05]} s={[0.07, h + 0.14, 0.1]} c="#f3e9d8" cast={false} />
      <Box p={[w / 2 + 0.035, 0, 0.05]} s={[0.07, h + 0.14, 0.1]} c="#f3e9d8" cast={false} />
      <Box p={[0, 0, 0.05]} s={[0.04, h, 0.06]} c="#f3e9d8" cast={false} />
      <Box p={[0, 0, 0.05]} s={[w, 0.04, 0.06]} c="#f3e9d8" cast={false} />
      <Box p={[0, -h / 2 - 0.04, 0.14]} s={[w + 0.3, 0.05, 0.22]} c="#c9a678" cast={false} />
    </group>
  );
}

function EntranceDoor({ kind, w }: { kind: 'glass' | 'lattice' | 'wood'; w: number }) {
  const hw = w / 2;
  const sign = useMemo(() => signTexture('出口', { bg: '#1f7a4d', fg: '#ffffff', w: 256, h: 96, glow: true }), []);
  const latticeMap = useMemo(() => pattern('shoji', [1, 1.4]), []);
  return (
    <group>
      <mesh position={[0, 1.1, 0.01]} scale={[w, 2.2, 1]} material={basic('#eef7ff', { fog: false })}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {kind === 'glass' && (
        <>
          {[-1, 1].map((s) => (
            <group key={s}>
              <Box p={[s * 0.37, 1.05, 0.045]} s={[0.72, 2.0, 0.02]} m={std('#c9e8f2', { rough: 0.05, metal: 0.3, transparent: true, opacity: 0.35 })} cast={false} />
              <Box p={[s * 0.37, 1.45, 0.05]} s={[0.72, 0.1, 0.025]} c="#3aa16b" cast={false} />
              <Cyl p={[s * 0.08, 1.0, 0.07]} rad={0.018} h={0.55} m={std('#cfd6da', { metal: 0.8, rough: 0.3 })} cast={false} />
            </group>
          ))}
          <Box p={[0, 0.06, 0.05]} s={[w, 0.12, 0.08]} c="#d9dde0" cast={false} />
        </>
      )}
      {kind === 'lattice' && (
        <>
          {[-1, 1].map((s) => (
            <group key={s}>
              <Quad p={[s * 0.38, 1.1, 0.05 + (s > 0 ? 0.03 : 0)]} s={[0.76, 2.0]} map={latticeMap} c="#fff4de" emissive />
              <Box p={[s * 0.38, 0.12, 0.07 + (s > 0 ? 0.03 : 0)]} s={[0.76, 0.24, 0.03]} c="#6b3e24" cast={false} />
              <Box p={[s * 0.1, 1.0, 0.1]} s={[0.04, 0.18, 0.03]} c="#2e1d14" cast={false} />
            </group>
          ))}
        </>
      )}
      {kind === 'wood' && (
        <>
          <Box p={[0, 1.05, 0.04]} s={[w - 0.1, 2.1, 0.06]} c="#9a6b43" cast={false} />
          <Box p={[0, 1.6, 0.075]} s={[w - 0.5, 0.7, 0.02]} m={glow('#fff2d0', '#ffe2a8', 0.5, 1.4)} cast={false} />
          <Box p={[0, 0.5, 0.08]} s={[w - 0.4, 0.7, 0.02]} c="#82552f" cast={false} />
          <Sph p={[hw - 0.2, 1.0, 0.1]} s={0.04} m={std('#d9b24a', { metal: 0.8, rough: 0.3 })} />
          <Cone p={[0, 2.3, 0.2]} rad={0.07} h={0.1} m={std('#d9b24a', { metal: 0.8, rough: 0.3 })} cast={false} />
        </>
      )}
      <Box p={[-hw - 0.05, 1.1, 0.06]} s={[0.1, 2.2, 0.12]} c={kind === 'glass' ? '#d9dde0' : '#6b3e24'} cast={false} />
      <Box p={[hw + 0.05, 1.1, 0.06]} s={[0.1, 2.2, 0.12]} c={kind === 'glass' ? '#d9dde0' : '#6b3e24'} cast={false} />
      <Box p={[0, 2.25, 0.06]} s={[w + 0.2, 0.1, 0.12]} c={kind === 'glass' ? '#d9dde0' : '#6b3e24'} cast={false} />
      <Quad p={[0, 2.5, 0.03]} s={[0.7, 0.26]} map={sign} emissive />
      <Box p={[0, 0.011, 0.6]} s={[1.2, 0.022, 0.8]} c={kind === 'glass' ? '#3b3f46' : '#a1423a'} cast={false} />
    </group>
  );
}

export function Room({ id, size, floor, wall, ceiling, trim = '#f3e9d8', wainscot, door = 'wood', windows = [], children }: RoomProps) {
  const [w, d, h] = size;
  const b = BUILDINGS.find((x) => x.enter === id)!;
  const f = doorFront(b);
  const floorMat = useMemo(() => lookMat(floor, w, d), [floor, w, d]);
  const ceilMat = useMemo(() => lookMat(ceiling, w, d), [ceiling, w, d]);
  const wallX = useMemo(() => lookMat(wall, w + 2 * T, h), [wall, w, h]);
  const wallZ = useMemo(() => lookMat(wall, d, h), [wall, d, h]);
  const wains = wainscot;
  const wainX = useMemo(() => (wains ? lookMat({ kind: wains.kind, color: wains.color, tint: wains.tint, scale: 1.5 }, w, wains.h) : null), [wains, w]);
  const wainZ = useMemo(() => (wains ? lookMat({ kind: wains.kind, color: wains.color, tint: wains.tint, scale: 1.5 }, d, wains.h) : null), [wains, d]);
  const trimMat = std(trim, { rough: 0.6 });
  const wh = wains?.h ?? 0;

  const winPos = (wd: WindowDef): { p: V3; r: V3 } => {
    const y = wd.y ?? 1.8;
    switch (wd.wall) {
      case 'n':
        return { p: [wd.at, y, -d / 2], r: [0, 0, 0] };
      case 's':
        return { p: [wd.at, y, d / 2], r: [0, Math.PI, 0] };
      case 'w':
        return { p: [-w / 2, y, wd.at], r: [0, Math.PI / 2, 0] };
      case 'e':
        return { p: [w / 2, y, wd.at], r: [0, -Math.PI / 2, 0] };
    }
  };

  return (
    <group>
      <Box p={[0, -0.05, 0]} s={[w + 0.8, 0.1, d + 0.8]} m={floorMat} cast={false} />
      <Box solid p={[0, h + 0.2, 0]} s={[w + 2 * T, T, d + 2 * T]} m={ceilMat} cast={false} />
      <Box solid p={[0, h / 2, -d / 2 - T / 2]} s={[w + 2 * T, h, T]} m={wallX} cast={false} />
      <Box solid p={[0, h / 2, d / 2 + T / 2]} s={[w + 2 * T, h, T]} m={wallX} cast={false} />
      <Box solid p={[-w / 2 - T / 2, h / 2, 0]} s={[T, h, d]} m={wallZ} cast={false} />
      <Box solid p={[w / 2 + T / 2, h / 2, 0]} s={[T, h, d]} m={wallZ} cast={false} />

      {/* baseboard and crown molding */}
      {[0.06, h - 0.06].map((y) => (
        <group key={y}>
          <Box p={[0, y, -d / 2 + 0.03]} s={[w, 0.12, 0.06]} m={trimMat} cast={false} />
          <Box p={[0, y, d / 2 - 0.03]} s={[w, 0.12, 0.06]} m={trimMat} cast={false} />
          <Box p={[-w / 2 + 0.03, y, 0]} s={[0.06, 0.12, d]} m={trimMat} cast={false} />
          <Box p={[w / 2 - 0.03, y, 0]} s={[0.06, 0.12, d]} m={trimMat} cast={false} />
        </group>
      ))}
      {wains && wainX && wainZ && (
        <group>
          <Box p={[0, wh / 2, -d / 2 + 0.02]} s={[w, wh, 0.04]} m={wainX} cast={false} />
          <Box p={[0, wh / 2, d / 2 - 0.02]} s={[w, wh, 0.04]} m={wainX} cast={false} />
          <Box p={[-w / 2 + 0.02, wh / 2, 0]} s={[0.04, wh, d]} m={wainZ} cast={false} />
          <Box p={[w / 2 - 0.02, wh / 2, 0]} s={[0.04, wh, d]} m={wainZ} cast={false} />
          <Box p={[0, wh, -d / 2 + 0.04]} s={[w, 0.04, 0.08]} m={trimMat} cast={false} />
          <Box p={[0, wh, d / 2 - 0.04]} s={[w, 0.04, 0.08]} m={trimMat} cast={false} />
          <Box p={[-w / 2 + 0.04, wh, 0]} s={[0.08, 0.04, d]} m={trimMat} cast={false} />
          <Box p={[w / 2 - 0.04, wh, 0]} s={[0.08, 0.04, d]} m={trimMat} cast={false} />
        </group>
      )}

      {windows.map((wd, i) => {
        const { p, r } = winPos(wd);
        return <WindowFrame key={i} w={wd.w ?? 1.6} h={wd.h ?? 1.2} p={p} r={r} />;
      })}

      <Interact kind="door" label="Exit to street" door={{ to: 'outside', spawn: [f.x, 0, f.z], yaw: f.yaw }} radius={1.8} h={2.2} sfx="door" p={[0, 0, d / 2]} r={[0, Math.PI, 0]}>
        <EntranceDoor kind={door} w={1.5} />
      </Interact>

      {children}
    </group>
  );
}

type Pt = [number, number, number, string, number];

/** One fill light plus a few warm point lights; point lights never cast shadows. */
export function Lights({ sky, ground, hemi = 1.1, points }: { sky: string; ground: string; hemi?: number; points: Pt[] }) {
  return (
    <>
      <hemisphereLight args={[sky, ground, hemi]} />
      {points.map(([x, y, z, c, i], k) => (
        <pointLight key={k} position={[x, y, z]} color={c} intensity={i} distance={14} decay={1.6} />
      ))}
    </>
  );
}

export function CeilingPanel({ p, s = [1.2, 0.6], c = '#fffaf0' }: { p: V3; s?: [number, number]; c?: string }) {
  return (
    <group position={p}>
      <Box p={[0, 0.02, 0]} s={[s[0] + 0.1, 0.04, s[1] + 0.1]} c="#e9e6df" cast={false} />
      <Box p={[0, -0.01, 0]} s={[s[0], 0.02, s[1]]} m={glow(c, '#fff4dc', 1.0, 1.6)} cast={false} />
    </group>
  );
}

export function Pendant({ p, len = 0.8, c = '#f2b5c6', rad = 0.22 }: { p: V3; len?: number; c?: string; rad?: number }) {
  return (
    <group position={p}>
      <Cyl p={[0, -len / 2, 0]} rad={0.008} h={len} c="#2e2a2a" cast={false} />
      <Cyl p={[0, -len - 0.06, 0]} rad={rad} h={0.2} top={0.3} m={glow(c, '#ffd9a0', 0.5, 1.2)} cast={false} />
      <Sph p={[0, -len - 0.14, 0]} s={0.06} m={glow('#fff6e0', '#ffe3a8', 1.5, 3)} cast={false} />
    </group>
  );
}

export function Poster({ p, r, s = [0.7, 1], text, sub, bg = '#fff7e8', fg = '#3a2a2a', border, vertical, frame = '#ffffff', glowing }: { p: V3; r?: V3; s?: [number, number]; text: string; sub?: string; bg?: string; fg?: string; border?: string; vertical?: boolean; frame?: string; glowing?: boolean }) {
  const tex = useMemo(
    () => signTexture(text, { bg, fg, border, sub, vertical, w: vertical ? 192 : 384, h: vertical ? 512 : 256 }),
    [text, bg, fg, border, sub, vertical],
  );
  return (
    <group position={p} rotation={r}>
      <Box s={[s[0] + 0.06, s[1] + 0.06, 0.03]} c={frame} cast={false} />
      <Quad p={[0, 0, 0.017]} s={s} map={tex} emissive={glowing} />
    </group>
  );
}

export function Plant({ p, s = 1, pot = '#d98c6c' }: { p: V3; s?: number; pot?: string }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.17, 0]} rad={0.17} h={0.34} top={1.25} c={pot} />
      <Cyl p={[0, 0.33, 0]} rad={0.19} h={0.03} c="#4a3426" cast={false} />
      <Sph p={[0, 0.62, 0]} s={[0.22, 0.28, 0.22]} c="#5fa261" lo />
      <Sph p={[0.14, 0.5, 0.05]} s={[0.15, 0.2, 0.15]} c="#74b872" lo />
      <Sph p={[-0.13, 0.52, -0.05]} s={[0.15, 0.22, 0.15]} c="#4f9558" lo />
      <Sph p={[0.02, 0.85, 0.03]} s={[0.12, 0.16, 0.12]} c="#86c585" lo />
    </group>
  );
}

export function Rug({ p, s, c = '#f2b5c6', c2 = '#fff1e0' }: { p: V3; s: [number, number]; c?: string; c2?: string }) {
  return (
    <group position={p}>
      <Box p={[0, 0.011, 0]} s={[s[0], 0.022, s[1]]} c={c} cast={false} />
      <Box p={[0, 0.024, 0]} s={[s[0] - 0.25, 0.01, s[1] - 0.25]} c={c2} cast={false} />
      <Box p={[0, 0.03, 0]} s={[s[0] - 0.5, 0.01, s[1] - 0.5]} c={c} cast={false} />
    </group>
  );
}

export type GoodsKind = 'bottle' | 'can' | 'box' | 'bag' | 'cup' | 'ball' | 'bar' | 'carton';

/** A row of small goods along local x, standing on y=0. */
export function Goods({ p = [0, 0, 0], kind, colors, n, step = 0.14, r }: { p?: V3; kind: GoodsKind; colors: string[]; n: number; step?: number; r?: V3 }) {
  const items = [];
  for (let i = 0; i < n; i++) {
    const c = colors[i % colors.length];
    const x = (i - (n - 1) / 2) * step;
    switch (kind) {
      case 'bottle':
        items.push(
          <group key={i} position={[x, 0, 0]}>
            <Cyl p={[0, 0.11, 0]} rad={0.04} h={0.22} c={c} cast={false} m={std(c, { rough: 0.25, metal: 0.1 })} />
            <Cyl p={[0, 0.25, 0]} rad={0.017} h={0.06} c="#f5f5f5" cast={false} />
          </group>,
        );
        break;
      case 'can':
        items.push(<Cyl key={i} p={[x, 0.065, 0]} rad={0.033} h={0.13} cast={false} m={std(c, { rough: 0.3, metal: 0.5 })} />);
        break;
      case 'box':
        items.push(<Box key={i} p={[x, 0.09, 0]} s={[0.1, 0.18, 0.06]} c={c} cast={false} />);
        break;
      case 'bag':
        items.push(<Box key={i} p={[x, 0.1, 0]} s={[0.12, 0.2, 0.05]} c={c} r={[0, 0, (i % 3 - 1) * 0.06]} cast={false} />);
        break;
      case 'cup':
        items.push(
          <group key={i} position={[x, 0, 0]}>
            <Cyl p={[0, 0.055, 0]} rad={0.048} h={0.11} top={1.35} c={c} cast={false} />
            <Cyl p={[0, 0.115, 0]} rad={0.066} h={0.012} c="#f7f2e8" cast={false} />
          </group>,
        );
        break;
      case 'ball':
        items.push(<Sph key={i} p={[x, 0.055, 0]} s={[0.055, 0.05, 0.055]} c={c} lo />);
        break;
      case 'bar':
        items.push(<Box key={i} p={[x, 0.06, 0]} s={[0.12, 0.12, 0.012]} c={c} r={[-0.12, 0, 0]} cast={false} />);
        break;
      case 'carton':
        items.push(
          <group key={i} position={[x, 0, 0]}>
            <Box p={[0, 0.09, 0]} s={[0.075, 0.18, 0.075]} c={c} cast={false} />
            <Box p={[0, 0.2, 0]} s={[0.075, 0.03, 0.04]} c="#e5e9ef" cast={false} />
          </group>,
        );
        break;
    }
  }
  return (
    <group position={p} rotation={r}>
      {items}
    </group>
  );
}

export function Steam({ p, n = 3, c = '#ffffff', rise = 0.45 }: { p: V3; n?: number; c?: string; rise?: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const mat = std(c, { transparent: true, opacity: 0.32, rough: 1 });
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.35;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const f = (t + i / n) % 1;
      m.position.set(Math.sin((f + i) * 6) * 0.03, f * rise, Math.cos((f + i) * 5) * 0.03);
      m.scale.setScalar(0.025 + Math.sin(f * Math.PI) * 0.045);
    });
  });
  return (
    <group position={p}>
      {Array.from({ length: n }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          material={mat}
        >
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

export function Table({ p, s, h = 0.75, top = '#c9a070', leg = '#8a5a38', solid = true, r }: { p: V3; s: [number, number]; h?: number; top?: string; leg?: string; solid?: boolean; r?: V3 }) {
  const lx = s[0] / 2 - 0.07;
  const lz = s[1] / 2 - 0.07;
  return (
    <group position={p} rotation={r}>
      <Box p={[0, h - 0.025, 0]} s={[s[0], 0.05, s[1]]} c={top} />
      {([-1, 1] as const).flatMap((a) => ([-1, 1] as const).map((c) => <Box key={`${a}${c}`} p={[a * lx, (h - 0.05) / 2, c * lz]} s={[0.06, h - 0.05, 0.06]} c={leg} cast={false} />))}
      {solid && <Solid p={[0, h / 2, 0]} s={[s[0], h, s[1]]} />}
    </group>
  );
}

export function Chair({ p, r, c = '#c9a070', seat = '#f2b5c6', solid = true }: { p: V3; r?: V3; c?: string; seat?: string; solid?: boolean }) {
  return (
    <group position={p} rotation={r}>
      <Box p={[0, 0.45, 0]} s={[0.42, 0.05, 0.42]} c={seat} />
      <Box p={[0, 0.75, -0.19]} s={[0.4, 0.4, 0.04]} c={c} />
      {([-1, 1] as const).flatMap((a) => ([-1, 1] as const).map((b) => <Box key={`${a}${b}`} p={[a * 0.18, 0.21, b * 0.18]} s={[0.04, 0.42, 0.04]} c={c} cast={false} />))}
      {solid && <Solid p={[0, 0.45, 0]} s={[0.44, 0.9, 0.44]} />}
    </group>
  );
}

export function Stool({ p, c = '#b3261e', solid = true }: { p: V3; c?: string; solid?: boolean }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.62, 0]} rad={0.2} h={0.08} c={c} />
      <Cyl p={[0, 0.3, 0]} rad={0.035} h={0.6} m={std('#9aa3ad', { metal: 0.7, rough: 0.35 })} cast={false} />
      <Cyl p={[0, 0.02, 0]} rad={0.19} h={0.04} m={std('#9aa3ad', { metal: 0.7, rough: 0.35 })} cast={false} />
      {solid && <Solid p={[0, 0.4, 0]} s={[0.4, 0.8, 0.4]} />}
    </group>
  );
}

export function Mug({ p, c = '#fff1e0', fill = '#6b4226' }: { p: V3; c?: string; fill?: string }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.045, 0]} rad={0.04} h={0.09} c={c} cast={false} />
      <Cyl p={[0, 0.088, 0]} rad={0.034} h={0.004} c={fill} cast={false} />
      <mesh position={[0.045, 0.05, 0]} scale={[0.026, 0.026, 0.01]} material={std(c)}>
        <torusGeometry args={[1, 0.3, 6, 12]} />
      </mesh>
    </group>
  );
}

export function Plate({ p, c = '#ffffff', rad = 0.12 }: { p: V3; c?: string; rad?: number }) {
  return <Cyl p={[p[0], p[1] + 0.008, p[2]]} rad={rad} h={0.016} c={c} cast={false} />;
}

export function BookRow({ p, n, h = 0.28, depth = 0.2, seed = 1, colors }: { p: V3; n: number; h?: number; depth?: number; seed?: number; colors?: string[] }) {
  const pal = colors ?? ['#e8837a', '#7aa6d6', '#f2c86b', '#8cc7a1', '#b99ad6', '#f4a6c0', '#5f7fa8', '#d9a066'];
  const items = [];
  let x = 0;
  for (let i = 0; i < n; i++) {
    const t = ((i * 7 + seed * 13) % 10) / 10;
    const bw = 0.035 + t * 0.03;
    const bh = h * (0.78 + ((i * 5 + seed) % 7) / 32);
    items.push(<Box key={i} p={[x + bw / 2, bh / 2, 0]} s={[bw, bh, depth]} c={pal[(i + seed) % pal.length]} cast={false} />);
    x += bw + 0.004;
  }
  return <group position={[p[0] - x / 2, p[1], p[2]]}>{items}</group>;
}

export function Frame({ p, s, c = '#8a5a38', children }: { p: V3; s: [number, number]; c?: string; children?: ReactNode }) {
  return (
    <group position={p}>
      <Box s={[s[0] + 0.08, s[1] + 0.08, 0.04]} c={c} cast={false} />
      {children}
    </group>
  );
}
