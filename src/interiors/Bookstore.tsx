import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Box, Cyl, Interact, Quad, Solid, Sph, type V3 } from '../world/parts';
import { glow, std } from '../world/materials';
import { pattern, signTexture } from '../world/textures';
import { Room, Lights, Pendant, Poster, Plant, Rug, Chair, Table, BookRow } from './Room';

const W = 12;
const D = 10;
const H = 3.6;
const WOOD = '#8a5a38';
const DARK = '#5a3a28';
const GREEN = '#3d5a4a';
const COVERS = ['#e8837a', '#7aa6d6', '#f2c86b', '#8cc7a1', '#b99ad6', '#f4a6c0', '#5f7fa8', '#d9a066'];
const STEEL = () => std('#c9ced6', { metal: 0.8, rough: 0.3 });

/** Tall wall bookcase with painted spines; local +z faces the room, origin at the wall base. */
function PaintedCase({ p, r, len }: { p: V3; r?: V3; len: number }) {
  const tex = useMemo(() => pattern('bookspines', [Math.max(1, Math.round(len / 1.2)), 1.5]), [len]);
  const posts = Math.max(1, Math.round(len / 2));
  return (
    <group position={p} rotation={r}>
      <Box p={[0, 1.5, 0.02]} s={[len, 3.0, 0.04]} c={DARK} cast={false} />
      <mesh position={[0, 1.5, 0.045]} scale={[len, 3.0, 1]} material={std('#ffffff', { map: tex, rough: 0.8 })}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {Array.from({ length: posts + 1 }, (_, i) => (
        <Box key={i} p={[-len / 2 + (i * len) / posts, 1.5, 0.19]} s={[0.07, 3.0, 0.38]} c={WOOD} />
      ))}
      {[0.03, 0.53, 1.03, 1.53, 2.03, 2.53].map((y) => (
        <Box key={y} p={[0, y, 0.19]} s={[len, 0.04, 0.38]} c={WOOD} cast={false} />
      ))}
      <Box p={[0, 3.05, 0.2]} s={[len + 0.1, 0.1, 0.42]} c={DARK} />
      <Solid p={[0, 1.5, 0.19]} s={[len, 3.0, 0.38]} />
    </group>
  );
}

/** Interactive overlay for one bay of a PaintedCase: face-out books and stacks on the boards. */
function Bay({ p, r, words, rows }: { p: V3; r?: V3; words: string[]; rows: { y: number; kind: 'spine' | 'fat' | 'thin' | 'face'; seed: number; n: number }[] }) {
  return (
    <Interact words={words} radius={1.8} h={2.6} p={p} r={r}>
      {rows.map((row) => {
        const y = row.y + 0.05;
        if (row.kind === 'face') {
          return Array.from({ length: row.n }, (_, i) => (
            <Box key={`${row.y}${i}`} p={[(i - (row.n - 1) / 2) * 0.24, y + 0.15, 0.26]} s={[0.2, 0.28, 0.025]} c={COVERS[(i + row.seed) % 8]} r={[-0.12, 0, 0]} cast={false} />
          ));
        }
        const h = row.kind === 'fat' ? 0.34 : 0.3;
        const d = row.kind === 'fat' ? 0.28 : 0.22;
        const cols = row.kind === 'fat' ? ['#2e4a7a', '#8a2a2a', '#2f5a3a', '#4a3a6a'] : undefined;
        return <BookRow key={row.y} p={[0, y, 0.2]} n={row.n} h={h} depth={d} seed={row.seed} colors={cols} />;
      })}
    </Interact>
  );
}

function LabelSign({ p, r, text }: { p: V3; r?: V3; text: string }) {
  const tex = useMemo(() => signTexture(text, { bg: '#f3e9d2', fg: GREEN, border: GREEN, w: 256, h: 72 }), [text]);
  return (
    <group position={p} rotation={r}>
      <Box s={[0.8, 0.24, 0.03]} c={WOOD} cast={false} />
      <Quad p={[0, 0, 0.018]} s={[0.74, 0.2]} map={tex} />
    </group>
  );
}

function Globe() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.25;
  });
  return (
    <Interact words={['globe']} radius={1.6} h={1.7} p={[0, 0, 0]}>
      <Cyl p={[0, 0.02, 0]} rad={0.22} h={0.04} c={DARK} />
      <Cyl p={[0, 0.5, 0]} rad={0.025} h={0.96} c={DARK} cast={false} />
      <Cyl p={[0, 0.98, 0]} rad={0.2} h={0.04} c={DARK} cast={false} />
      <group position={[0, 1.2, 0]} rotation={[0, 0, 0.4]}>
        <group ref={ref}>
          <Sph s={0.28} m={std('#7ab6e0', { rough: 0.35, metal: 0.1 })} recv />
          <Sph p={[0.12, 0.12, 0.2]} s={[0.1, 0.07, 0.04]} c="#8cc07a" r={[0.4, 0.5, 0]} cast={false} />
          <Sph p={[-0.18, 0.05, 0.19]} s={[0.07, 0.11, 0.04]} c="#a8cf86" r={[0, -0.7, 0]} cast={false} />
          <Sph p={[0.2, -0.1, -0.15]} s={[0.1, 0.07, 0.04]} c="#8cc07a" r={[0, 2.2, 0.3]} cast={false} />
          <Sph p={[-0.05, 0.22, -0.15]} s={[0.12, 0.05, 0.05]} c="#e8e4da" r={[0.5, 0, 0]} cast={false} />
        </group>
        <mesh scale={[0.32, 0.32, 0.32]} material={std('#d9b24a', { metal: 0.8, rough: 0.3 })} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1, 0.02, 8, 36]} />
        </mesh>
      </group>
      <Solid p={[0, 0.8, 0]} s={[0.46, 1.6, 0.46]} />
    </Interact>
  );
}

function OpenBook({ p, r, c = '#fffaf0' }: { p: V3; r?: V3; c?: string }) {
  return (
    <group position={p} rotation={r}>
      <Box p={[0, 0.008, 0]} s={[0.4, 0.016, 0.28]} c="#8a2a2a" cast={false} />
      <Box p={[-0.095, 0.02, 0]} s={[0.19, 0.014, 0.26]} c={c} r={[0, 0, 0.05]} cast={false} />
      <Box p={[0.095, 0.02, 0]} s={[0.19, 0.014, 0.26]} c={c} r={[0, 0, -0.05]} cast={false} />
      {[-0.08, -0.02].map((z) => (
        <group key={z}>
          <Box p={[-0.1, 0.029, z * 2]} s={[0.14, 0.001, 0.008]} c="#8a8a90" cast={false} />
          <Box p={[0.1, 0.029, z * 2]} s={[0.14, 0.001, 0.008]} c="#8a8a90" cast={false} />
        </group>
      ))}
    </group>
  );
}

function MangaStacks() {
  const stack = (x: number, z: number, n: number, rot: number, seed: number) => (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[0, 0.012 + i * 0.026, 0]}>
          <Box s={[0.13, 0.024, 0.19]} c={COVERS[(i + seed) % 8]} cast={false} />
          <Box p={[0, 0.013, 0.0]} s={[0.1, 0.002, 0.05]} c="#ffffff" cast={false} />
        </group>
      ))}
    </group>
  );
  return (
    <group>
      {stack(-0.55, 0.0, 6, 0.1, 0)}
      {stack(-0.3, 0.05, 5, -0.2, 2)}
      {stack(0.0, -0.05, 7, 0.0, 4)}
      {stack(0.3, 0.05, 4, 0.25, 1)}
      {stack(0.55, 0.0, 6, -0.1, 5)}
      <Box p={[0.0, 0.1, 0.28]} s={[0.15, 0.2, 0.02]} c="#f2c86b" r={[-0.4, 0, 0]} cast={false} />
      <Box p={[0.2, 0.1, 0.28]} s={[0.15, 0.2, 0.02]} c="#7aa6d6" r={[-0.4, 0, 0]} cast={false} />
      <Box p={[-0.2, 0.1, 0.28]} s={[0.15, 0.2, 0.02]} c="#f4a6c0" r={[-0.4, 0, 0]} cast={false} />
    </group>
  );
}

function NewspaperRack() {
  const tex = useMemo(() => signTexture('新聞', { sub: 'NEWS', bg: '#efe7d3', fg: '#2a2a30', w: 192, h: 256, weight: 900 }), []);
  return (
    <Interact words={['newspaper']} radius={1.7} h={1.9} p={[0, 0, 0]}>
      <Box p={[0, 0.9, -0.05]} s={[1.3, 1.8, 0.06]} c={WOOD} />
      {[-0.6, 0.6].map((x) => (
        <Box key={x} p={[x, 0.9, 0.05]} s={[0.06, 1.8, 0.2]} c={DARK} />
      ))}
      <Box p={[0, 0.4, 0.1]} s={[1.3, 0.04, 0.3]} c={DARK} cast={false} />
      {[0, 1, 2].map((i) => (
        <Quad key={i} p={[-0.4 + i * 0.4, 1.1, 0.0]} s={[0.36, 0.8]} map={tex} c={i === 1 ? '#f3d9d0' : '#ffffff'} />
      ))}
      <Box p={[0, 0.55, 0.15]} s={[0.9, 0.12, 0.2]} c="#efe7d3" cast={false} />
      <Box p={[0, 0.58, 0.15]} s={[0.88, 0.04, 0.18]} c="#d9d2c0" cast={false} />
      <Solid p={[0, 0.9, 0]} s={[1.3, 1.8, 0.3]} />
    </Interact>
  );
}

function NotebookStack() {
  return (
    <group>
      {['#7aa6d6', '#f4a6c0', '#8cc7a1', '#f2c86b'].map((c, i) => (
        <group key={c} position={[(i - 1.5) * 0.02, 0.012 + i * 0.024, 0]} rotation={[0, (i - 1.5) * 0.15, 0]}>
          <Box s={[0.18, 0.022, 0.25]} c={c} cast={false} />
          <Box p={[0, 0.012, 0.0]} s={[0.12, 0.002, 0.06]} c="#ffffff" cast={false} />
        </group>
      ))}
      <Box p={[0.26, 0.012, 0.02]} s={[0.17, 0.014, 0.24]} c="#fffaf0" r={[0, 0.3, 0]} cast={false} />
      <Box p={[0.26, 0.02, 0.02]} s={[0.14, 0.001, 0.008]} c="#8a8a90" r={[0, 0.3, 0]} cast={false} />
    </group>
  );
}

function PenStand() {
  const cols = ['#2d7fb8', '#e5584f', '#2b2f36', '#3aa16b', '#f2b233'];
  return (
    <group>
      <Cyl p={[0, 0.07, 0]} rad={0.06} h={0.14} c="#3d5a4a" />
      {cols.map((c, i) => (
        <group key={c} position={[Math.cos(i * 1.26) * 0.025, 0.14, Math.sin(i * 1.26) * 0.025]} rotation={[Math.sin(i * 1.26) * 0.25, 0, -Math.cos(i * 1.26) * 0.25]}>
          <Cyl p={[0, 0.07, 0]} rad={0.007} h={0.14} c={c} cast={false} />
          <Cyl p={[0, 0.145, 0]} rad={0.004} h={0.02} c="#d9d9de" cast={false} />
        </group>
      ))}
    </group>
  );
}

function PencilCup() {
  const cols = ['#f2b233', '#e5584f', '#7aa6d6', '#f4a6c0', '#8cc7a1'];
  return (
    <group>
      <Cyl p={[0, 0.06, 0]} rad={0.055} h={0.12} top={1.1} m={std('#dfeef5', { rough: 0.05, transparent: true, opacity: 0.6 })} />
      {cols.map((c, i) => (
        <group key={c} position={[Math.cos(i * 1.26) * 0.022, 0.1, Math.sin(i * 1.26) * 0.022]} rotation={[Math.sin(i * 1.26) * 0.3, 0, -Math.cos(i * 1.26) * 0.3]}>
          <Cyl p={[0, 0.07, 0]} rad={0.007} h={0.15} seg={6} c={c} cast={false} />
          <Cyl p={[0, 0.16, 0]} rad={0.007} h={0.025} top={0.2} seg={6} c="#e8c48b" cast={false} />
          <Cyl p={[0, 0.17, 0]} rad={0.002} h={0.01} c="#2b2f36" cast={false} />
        </group>
      ))}
    </group>
  );
}

function EraserTray() {
  return (
    <group>
      <Box p={[0, 0.012, 0]} s={[0.3, 0.024, 0.18]} c="#c9a070" />
      {[-0.09, 0, 0.09].map((x, i) => (
        <group key={x}>
          <Box p={[x, 0.04, 0]} s={[0.07, 0.03, 0.04]} c="#ffffff" r={[0, i * 0.3, 0]} cast={false} />
          <Box p={[x, 0.04, 0]} s={[0.073, 0.02, 0.025]} c={['#2d7fb8', '#e5584f', '#f2b233'][i]} r={[0, i * 0.3, 0]} cast={false} />
        </group>
      ))}
    </group>
  );
}

function ScissorsPair() {
  const steel = STEEL();
  return (
    <group>
      <Box p={[0, 0.008, 0]} s={[0.34, 0.016, 0.16]} c="#fffaf0" cast={false} />
      {[-1, 1].map((s) => (
        <group key={s} rotation={[0, s * 0.2, 0]} position={[0, 0.02, 0]}>
          <Box p={[0.08, 0, s * 0.012]} s={[0.17, 0.006, 0.02]} m={steel} cast={false} />
          <mesh position={[-0.09, 0.0, s * 0.03]} rotation={[Math.PI / 2, 0, 0]} scale={[0.03, 0.03, 0.03]} material={std(s > 0 ? '#e5584f' : '#2d7fb8')}>
            <torusGeometry args={[1, 0.25, 6, 14]} />
          </mesh>
          <Box p={[-0.04, 0, s * 0.02]} s={[0.07, 0.008, 0.015]} m={steel} cast={false} />
        </group>
      ))}
    </group>
  );
}

function Calculator() {
  return (
    <group>
      <Box p={[0, 0.012, 0]} s={[0.12, 0.024, 0.19]} c="#3a3f47" r={[0, 0.3, 0]} />
      <Box p={[0, 0.026, -0.05]} s={[0.1, 0.004, 0.04]} m={glow('#d9f5d0', '#9de08a', 0.7, 1.1)} r={[0, 0.3, 0]} cast={false} />
      {[0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => <Box key={`${r}${c}`} p={[(c - 1) * 0.032, 0.028, 0.0 + r * 0.032 - 0.0]} s={[0.024, 0.004, 0.024]} c={c === 2 ? '#e8a06b' : '#e8ecef'} cast={false} />))}
    </group>
  );
}

function BookmarkRack() {
  return (
    <group>
      <Cyl p={[0, 0.02, 0]} rad={0.1} h={0.04} c={WOOD} />
      <Cyl p={[0, 0.3, 0]} rad={0.015} h={0.6} c={DARK} cast={false} />
      <Cyl p={[0, 0.62, 0]} rad={0.04} h={0.04} c={WOOD} cast={false} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} position={[0, 0.5 - (i % 2) * 0.12, 0]} rotation={[0, i * 1.05, 0]}>
          <Box p={[0.07, 0, 0]} s={[0.1, 0.01, 0.035]} c={COVERS[i]} r={[0, 0, -0.3]} cast={false} />
          <Box p={[0.07, -0.02, 0]} s={[0.12, 0.003, 0.012]} c="#ffffff" cast={false} />
        </group>
      ))}
    </group>
  );
}

function WallMap() {
  const label = useMemo(() => signTexture('日本地図', { sub: 'MAP OF JAPAN', bg: '#f3e9d2', fg: '#3d5a4a', w: 320, h: 110 }), []);
  return (
    <Interact words={['map']} radius={1.9} h={2.7} p={[0, 0, 0]}>
      <Box p={[0, 1.75, 0.03]} s={[1.7, 1.2, 0.05]} c={WOOD} />
      <Box p={[0, 1.75, 0.06]} s={[1.6, 1.1, 0.01]} c="#9fd0f5" cast={false} />
      <Sph p={[0.25, 1.85, 0.07]} s={[0.12, 0.3, 0.012]} c="#a8cf86" r={[0, 0, -0.5]} cast={false} />
      <Sph p={[0.05, 1.6, 0.07]} s={[0.1, 0.22, 0.012]} c="#8cc07a" r={[0, 0, -0.4]} cast={false} />
      <Sph p={[-0.2, 1.45, 0.07]} s={[0.16, 0.06, 0.012]} c="#a8cf86" r={[0, 0, 0.2]} cast={false} />
      <Sph p={[-0.55, 1.35, 0.07]} s={[0.08, 0.05, 0.012]} c="#8cc07a" cast={false} />
      <Sph p={[-0.55, 2.05, 0.07]} s={[0.35, 0.18, 0.012]} c="#e8e4da" cast={false} />
      <Quad p={[0.45, 1.3, 0.07]} s={[0.55, 0.19]} map={label} />
      <Cyl p={[0, 2.37, 0.04]} rad={0.012} h={1.8} r={[0, 0, Math.PI / 2]} c={DARK} cast={false} />
    </Interact>
  );
}

function StudyDesk({ x, z }: { x: number; z: number }) {
  return (
    <group>
      <Table p={[x, 0, z]} s={[1.8, 0.8]} h={0.75} top="#c9a070" leg={DARK} />
      <Box p={[x + 0.6, 0.45, z]} s={[0.5, 0.6, 0.7]} c={WOOD} cast={false} />
      <Chair p={[x, 0, z + 0.75]} r={[0, Math.PI, 0]} c={WOOD} seat={GREEN} />
      <Interact words={['desk']} radius={1.5} h={1.3} p={[x + 0.65, 0.75, z]}>
        <Cyl p={[0, 0.01, 0]} rad={0.09} h={0.02} c={GREEN} />
        <Cyl p={[0, 0.2, -0.02]} rad={0.008} h={0.4} r={[0.2, 0, 0]} c="#2a2a30" cast={false} />
        <Cyl p={[0, 0.42, 0.04]} rad={0.1} h={0.1} top={0.5} r={[0.3, 0, 0]} m={glow('#fff0d0', '#ffcf8a', 0.7, 1.3)} cast={false} />
        <Box p={[0.22, 0.05, 0.0]} s={[0.1, 0.1, 0.1]} c="#e8c48b" cast={false} />
      </Interact>
      <Interact words={['study']} radius={1.5} h={1.0} p={[x - 0.45, 0.75, z]}>
        <OpenBook p={[0, 0, 0]} />
        <Box p={[0.3, 0.02, 0.03]} s={[0.2, 0.03, 0.24]} c="#7aa6d6" cast={false} />
        <Box p={[0.3, 0.05, 0.03]} s={[0.18, 0.03, 0.22]} c="#e8837a" r={[0, 0.2, 0]} cast={false} />
        <Box p={[-0.28, 0.01, 0.0]} s={[0.17, 0.012, 0.22]} c="#fffaf0" r={[0, -0.2, 0]} cast={false} />
      </Interact>
    </group>
  );
}

function Armchair() {
  return (
    <Interact words={['read']} radius={1.8} h={1.5} p={[0, 0, 0]}>
      <Box p={[0, 0.2, 0]} s={[0.9, 0.4, 0.85]} c={GREEN} />
      <Box p={[0, 0.7, -0.35]} s={[0.9, 0.7, 0.18]} c={GREEN} r={[-0.1, 0, 0]} />
      {[-0.4, 0.4].map((x) => (
        <Box key={x} p={[x, 0.42, 0.0]} s={[0.14, 0.45, 0.85]} c="#35503f" />
      ))}
      <Box p={[0, 0.46, 0.05]} s={[0.66, 0.12, 0.62]} c="#f3e9d2" cast={false} />
      <Box p={[0.0, 0.8, -0.2]} s={[0.4, 0.3, 0.1]} c="#f2c86b" r={[-0.2, 0.2, 0.1]} cast={false} />
      <OpenBook p={[0.0, 0.58, 0.22]} r={[-0.5, 0, 0]} />
      {[-0.35, 0.35].map((x) =>
        [-0.32, 0.32].map((z) => <Box key={`${x}${z}`} p={[x, 0.03, z]} s={[0.07, 0.06, 0.07]} c={DARK} cast={false} />),
      )}
      <Solid p={[0, 0.5, 0]} s={[0.95, 1.0, 0.9]} />
    </Interact>
  );
}

function Ladder() {
  return (
    <group>
      {[-0.22, 0.22].map((x) => (
        <Box key={x} p={[x, 1.5, 0]} s={[0.05, 3.0, 0.05]} c="#b98a5e" r={[-0.08, 0, 0]} />
      ))}
      {[0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8].map((y) => (
        <Box key={y} p={[0, y, -y * 0.08 + 0.0]} s={[0.4, 0.04, 0.06]} c="#b98a5e" cast={false} />
      ))}
      <Solid p={[0, 1.5, -0.1]} s={[0.5, 3.0, 0.3]} />
    </group>
  );
}

function KidsShelf() {
  return (
    <Interact words={['picture_book']} radius={1.7} h={1.5} p={[0, 0, 0]}>
      <Box p={[0, 0.5, 0.02]} s={[1.6, 1.0, 0.04]} c={WOOD} />
      <Box p={[0, 0.02, 0.2]} s={[1.6, 0.04, 0.4]} c={DARK} />
      {[0.35, 0.7, 1.0].map((y) => (
        <Box key={y} p={[0, y, 0.2]} s={[1.6, 0.04, 0.4]} c={WOOD} cast={false} />
      ))}
      {[-0.8, 0.8].map((x) => (
        <Box key={x} p={[x, 0.5, 0.2]} s={[0.04, 1.0, 0.4]} c={WOOD} />
      ))}
      {[0.04, 0.37].map((y, r) =>
        [0, 1, 2, 3, 4, 5].map((i) => <Box key={`${y}${i}`} p={[(i - 2.5) * 0.24, y + 0.15, 0.3]} s={[0.2, 0.3, 0.03]} c={['#f7a8c0', '#bfe3ff', '#fff1a6', '#c8f0c0', '#e0c8f5', '#ffd1b0'][(i + r * 2) % 6]} r={[-0.15, 0, 0]} cast={false} />),
      )}
      <Sph p={[-0.4, 1.1, 0.2]} s={[0.1, 0.1, 0.1]} c="#f2b5c6" cast={false} />
      <Sph p={[-0.4, 1.23, 0.2]} s={[0.07, 0.07, 0.07]} c="#f2b5c6" cast={false} />
      <Sph p={[0.2, 1.1, 0.2]} s={[0.1, 0.1, 0.1]} c="#bfe3ff" cast={false} />
      <Sph p={[0.2, 1.23, 0.2]} s={[0.07, 0.07, 0.07]} c="#bfe3ff" cast={false} />
      <Solid p={[0, 0.55, 0.2]} s={[1.6, 1.1, 0.45]} />
    </Interact>
  );
}

function FeatureBook() {
  return (
    <group>
      <Box p={[0, 0.02, 0]} s={[0.3, 0.04, 0.4]} c="#8a2a2a" r={[0, 0.2, 0]} />
      <Box p={[0, 0.06, 0]} s={[0.28, 0.04, 0.38]} c="#2e4a7a" r={[0, -0.1, 0]} cast={false} />
      <Box p={[0, 0.1, 0]} s={[0.26, 0.04, 0.36]} c="#f2c86b" r={[0, 0.3, 0]} cast={false} />
      <Box p={[0, 0.16, 0.0]} s={[0.24, 0.025, 0.34]} c="#3d5a4a" r={[0, 0.0, 0]} cast={false} />
      <Box p={[0.3, 0.14, 0.0]} s={[0.24, 0.34, 0.04]} c="#f4a6c0" r={[-0.2, 0, 0.2]} />
      <Box p={[0.3, 0.14, 0.022]} s={[0.16, 0.1, 0.004]} c="#ffffff" r={[-0.2, 0, 0.2]} cast={false} />
      <Box p={[0.03, 0.2, 0.0]} s={[0.012, 0.1, 0.03]} c="#e5584f" r={[0, 0.3, 0]} cast={false} />
    </group>
  );
}

export function BookstoreInterior() {
  return (
    <>
      <Lights
        sky="#fff1de"
        ground="#b08460"
        hemi={0.95}
        points={[
          [-3, 3.0, -2, '#ffcf9a', 20],
          [2, 3.0, 0.5, '#ffd9a8', 20],
          [-3.5, 2.8, 3.0, '#ffe0b0', 16],
          [3, 2.8, 3.0, '#ffe9cc', 14],
        ]}
      />
      <Room
        id="bookstore"
        size={[W, D, H]}
        floor={{ kind: 'planks', color: '#ffffff', tint: '#8a5a38', scale: 1.5 }}
        wall={{ kind: 'wallpaper', color: '#ffffff', tint: '#efe4cd', scale: 2 }}
        ceiling={{ kind: 'planks', color: '#ffffff', tint: '#6b4a33', scale: 1.5 }}
        trim="#4a3121"
        wainscot={{ color: '#ffffff', h: 0.9, kind: 'planks', tint: '#5a3a28' }}
        door="wood"
        windows={[
          { wall: 's', at: -4.0, y: 2.0, w: 1.6, h: 1.3 },
          { wall: 's', at: 4.0, y: 2.0, w: 1.6, h: 1.3 },
          { wall: 'w', at: 3.0, y: 2.0, w: 1.4, h: 1.3 },
        ]}
      >
        {[-3.5, 0, 3.5].map((x) => (
          <Box key={x} p={[x, H - 0.12, 0]} s={[0.22, 0.24, D - 0.1]} c="#3a2418" cast={false} />
        ))}
        {[
          [-3, -1.2],
          [-1.5, 1.8],
          [2.8, 2.0],
          [1, -1],
        ].map(([x, z]) => (
          <Pendant key={`${x}${z}`} p={[x, H - 0.15, z]} len={0.9} c="#3d7a5a" rad={0.24} />
        ))}

        {/* north wall: painted bookcase with interactive bays */}
        <PaintedCase p={[-1.975, 0, -D / 2]} len={8.05} />
        <Bay p={[-5.0, 0, -D / 2]} words={['bookshelf']} rows={[{ y: 0.5, kind: 'spine', seed: 1, n: 16 }, { y: 1.5, kind: 'face', seed: 0, n: 5 }, { y: 2.0, kind: 'spine', seed: 4, n: 14 }]} />
        <Bay p={[-3.0, 0, -D / 2]} words={['novel']} rows={[{ y: 1.0, kind: 'thin', seed: 3, n: 20 }, { y: 1.5, kind: 'thin', seed: 7, n: 18 }, { y: 2.5, kind: 'face', seed: 2, n: 5 }]} />
        <Bay p={[-1.0, 0, -D / 2]} words={['textbook']} rows={[{ y: 1.0, kind: 'fat', seed: 2, n: 12 }, { y: 1.5, kind: 'face', seed: 5, n: 5 }, { y: 2.0, kind: 'thin', seed: 6, n: 16 }]} />
        <Bay p={[1.0, 0, -D / 2]} words={['dictionary']} rows={[{ y: 0.5, kind: 'fat', seed: 0, n: 10 }, { y: 1.0, kind: 'fat', seed: 1, n: 10 }, { y: 1.5, kind: 'fat', seed: 3, n: 9 }]} />
        {[-5.0, -3.0, -1.0, 1.0].map((x, i) => (
          <LabelSign key={x} p={[x, 3.25, -D / 2 + 0.45]} text={['本棚', '小説', '教科書', '辞書'][i]} />
        ))}
        <group position={[3.2, 0, -D / 2]}>
          <WallMap />
        </group>

        {/* west wall: poster, kids shelf, case, ladder */}
        <PaintedCase p={[-W / 2, 0, -0.9]} r={[0, Math.PI / 2, 0]} len={4.2} />
        <Poster p={[-W / 2 + 0.03, 1.8, -3.8]} r={[0, Math.PI / 2, 0]} s={[1.0, 1.4]} text="読書" sub="BOOKS" bg="#fff1a6" fg="#b3261e" border="#d9483b" />
        <Interact words={['poster']} radius={1.8} h={2.7} p={[-W / 2 + 0.2, 0, -3.8]} />
        <group position={[-5.5, 0, 0.6]} rotation={[0, Math.PI / 2, 0]}>
          <Ladder />
        </group>
        <group position={[-W / 2, 0, 2.2]} rotation={[0, Math.PI / 2, 0]}>
          <KidsShelf />
        </group>
        <Rug p={[-4.9, 0, 2.4]} s={[1.8, 1.2]} c="#f7a8c0" c2="#fff1e6" />

        {/* reading corner */}
        <Rug p={[-4.2, 0, 4.05]} s={[3.2, 1.9]} c={GREEN} c2="#f3e9d2" />
        <group position={[-5.0, 0, 3.85]} rotation={[0, Math.PI / 2, 0]}>
          <Armchair />
        </group>
        <Table p={[-5.0, 0, 4.65]} s={[0.5, 0.5]} h={0.55} top="#c9a070" leg={DARK} />
        <Cyl p={[-5.0, 0.6, 4.65]} rad={0.04} h={0.1} c={GREEN} />
        <Cyl p={[-5.0, 0.72, 4.65]} rad={0.09} h={0.12} top={0.6} m={glow('#fff0d0', '#ffcf8a', 0.7, 1.4)} cast={false} />
        <group position={[-3.3, 0, 3.7]}>
          <Globe />
        </group>
        <Plant p={[-2.4, 0, 4.5]} s={1.3} pot="#b86b4a" />

        {/* centre: display tables */}
        <Table p={[-3.0, 0, -1.7]} s={[2.2, 1.1]} h={0.85} top="#c9a070" leg={DARK} />
        <Box p={[-3.0, 0.78, -1.7]} s={[2.1, 0.03, 1.0]} c={GREEN} cast={false} />
        <Interact words={['manga']} radius={1.8} h={1.3} p={[-3.0, 0.85, -1.7]}>
          <MangaStacks />
        </Interact>
        <Cyl solid p={[-1.2, 0.4, 1.0]} rad={0.6} h={0.8} top={1.0} c="#c9a070" />
        <Cyl p={[-1.2, 0.82, 1.0]} rad={0.68} h={0.04} c={GREEN} />
        <Interact words={['book']} radius={1.6} h={1.2} p={[-1.2, 0.84, 1.0]}>
          <FeatureBook />
        </Interact>

        <Table p={[0.9, 0, -1.0]} s={[3.0, 1.2]} h={0.9} top="#d9b88a" leg={DARK} />
        <Interact words={['notebook']} radius={1.5} h={1.2} p={[-0.1, 0.9, -0.65]}>
          <NotebookStack />
        </Interact>
        <Interact words={['pen']} radius={1.5} h={1.2} p={[0.9, 0.9, -0.65]}>
          <PenStand />
        </Interact>
        <Interact words={['pencil']} radius={1.5} h={1.2} p={[1.9, 0.9, -0.65]}>
          <PencilCup />
        </Interact>
        <Interact words={['eraser']} radius={1.5} h={1.1} p={[0.4, 0.9, -1.35]}>
          <EraserTray />
        </Interact>
        <Interact words={['scissors']} radius={1.5} h={1.1} p={[1.4, 0.9, -1.35]}>
          <ScissorsPair />
        </Interact>

        {/* study and entrance side */}
        <StudyDesk x={2.4} z={2.6} />
        <group position={[W / 2 - 0.1, 0, 1.6]} rotation={[0, -Math.PI / 2, 0]}>
          <NewspaperRack />
        </group>
        <Plant p={[5.5, 0, 4.4]} s={1.4} pot="#6b8f71" />
        <Poster p={[W / 2 - 0.03, 2.0, 3.4]} r={[0, -Math.PI / 2, 0]} s={[0.8, 1.1]} text="新刊" sub="NEW" bg="#bfe3ff" fg="#2d5a8a" border="#2d5a8a" />

        {/* checkout counter */}
        <Box solid p={[4.4, 0.5, -2.75]} s={[0.7, 1.0, 4.5]} c={WOOD} />
        <Box p={[4.4, 1.02, -2.75]} s={[0.78, 0.05, 4.6]} c={DARK} />
        <Box p={[4.04, 0.5, -2.75]} s={[0.01, 0.8, 4.3]} c="#6b4a33" cast={false} />
        <Box solid p={[5.0, 1.0, -0.55]} s={[2.0, 2.0, 0.1]} c={WOOD} />
        <Box p={[5.7, 1.8, -2.75]} s={[0.4, 0.04, 4.0]} c={DARK} cast={false} />
        <BookRow p={[5.6, 1.82, -1.5]} n={14} h={0.3} depth={0.2} seed={2} />
        <BookRow p={[5.6, 1.82, -3.5]} n={14} h={0.3} depth={0.2} seed={5} />
        <Interact words={['calculator']} radius={1.5} h={0.7} p={[4.4, 1.05, -1.0]}>
          <Calculator />
        </Interact>
        <Interact words={['bookmark']} radius={1.5} h={1.2} p={[4.4, 1.05, -1.9]}>
          <BookmarkRack />
        </Interact>
        <Box p={[4.45, 1.1, -3.4]} s={[0.4, 0.1, 0.32]} c="#2b2f36" r={[0, 0.3, 0]} />
        <Box p={[4.45, 1.2, -3.5]} s={[0.36, 0.2, 0.02]} m={glow('#d9efff', '#8ac8ff', 0.8, 1.2)} r={[-0.3, 0.3, 0]} cast={false} />
      </Room>
    </>
  );
}
