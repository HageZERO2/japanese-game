import { useMemo } from 'react';
import { Box, Cyl, Interact, Quad, Solid, type V3 } from '../world/parts';
import { glow, std } from '../world/materials';
import { pattern, signTexture } from '../world/textures';
import { Room, Lights, CeilingPanel, Poster, Goods, Plant, type GoodsKind } from './Room';

const W = 14;
const D = 10;
const H = 3.6;

interface SecDef {
  /** Position along the shelf relative to the gondola center (world z). */
  z: number;
  words: string[];
  kind: GoodsKind;
  colors: string[];
}

const PASTEL = ['#ff8f8f', '#ffd166', '#7bdcb5', '#7cc4e8', '#f7a8c8', '#c9b3f0'];
const GLASS = () => std('#cfe8f2', { rough: 0.05, metal: 0.3, transparent: true, opacity: 0.22 });
const ALU = '#cfd6da';

function Section({ words, kind, colors }: Omit<SecDef, 'z'>) {
  return (
    <Interact words={words} radius={1.5} h={1.9} p={[0, 0, -0.2]}>
      {[0.17, 0.62, 1.07].map((y, i) => (
        <Goods key={y} p={[0, y, 0]} kind={kind} colors={i % 2 ? [...colors].reverse() : colors} n={6} step={0.15} />
      ))}
    </Interact>
  );
}

function Header({ text, w }: { text: string; w: number }) {
  const tex = useMemo(() => signTexture(text, { bg: '#2f8f5b', fg: '#ffffff', w: 384, h: 96, border: '#ffffff' }), [text]);
  return (
    <group position={[0, 1.85, -0.02]}>
      <Quad s={[w, w * 0.25]} map={tex} emissive />
    </group>
  );
}

/** Double-sided gondola running along z; an empty face is left unbuilt (wall-mounted use). */
function Gondola({ p, len, west = [], east = [], westHead, eastHead }: { p: V3; len: number; west?: SecDef[]; east?: SecDef[]; westHead?: string; eastHead?: string }) {
  const goodsTex = useMemo(() => pattern('shelfgoods', [len / 1.2, 1.2]), [len]);
  const backMat = std('#ffffff', { map: goodsTex, rough: 0.7 });
  const face = (secs: SecDef[], sign: 1 | -1, head?: string) => {
    if (!secs.length) return null;
    return (
      <group position={[sign * -0.4, 0, 0]} rotation={[0, sign * -Math.PI / 2, 0]}>
        <mesh position={[0, 0.85, -0.375]} scale={[len, 1.5, 1]} material={backMat}>
          <planeGeometry args={[1, 1]} />
        </mesh>
        {[0.13, 0.58, 1.03, 1.5].map((y) => (
          <Box key={y} p={[0, y, -0.21]} s={[len - 0.04, 0.04, 0.38]} c="#ebe6da" cast={false} />
        ))}
        {secs.map((s) => (
          <group key={s.words[0]} position={[sign * s.z, 0, 0]}>
            <Section words={s.words} kind={s.kind} colors={s.colors} />
          </group>
        ))}
        {head && <Header text={head} w={Math.min(len, 1.6)} />}
      </group>
    );
  };
  return (
    <group position={p}>
      <Box p={[0, 0.8, 0]} s={[0.04, 1.6, len]} c="#ffffff" />
      <Box p={[0, 0.04, 0]} s={[0.8, 0.08, len]} c="#3aa16b" cast={false} />
      <Box p={[0, 1.62, 0]} s={[0.84, 0.04, len + 0.04]} c="#3aa16b" />
      <Box p={[0, 0.8, len / 2]} s={[0.8, 1.6, 0.04]} c="#f5f0e6" />
      <Box p={[0, 0.8, -len / 2]} s={[0.8, 1.6, 0.04]} c="#f5f0e6" />
      {face(west, 1, westHead)}
      {face(east, -1, eastHead)}
      <Solid p={[0, 0.85, 0]} s={[0.8, 1.7, len]} />
    </group>
  );
}

interface FridgeProps {
  x: number;
  words: string[];
  kind: GoodsKind;
  colors: string[];
  head: string;
}

/** Glass-door drink fridge standing against the back wall. */
function Fridge({ x, words, kind, colors, head }: FridgeProps) {
  const w = 1.2;
  const tex = useMemo(() => signTexture(head, { bg: '#ffffff', fg: '#2a7fb5', w: 256, h: 64 }), [head]);
  return (
    <group position={[x, 0, -D / 2 + 0.42]}>
      <Box p={[0, 1.05, -0.35]} s={[w, 2.1, 0.1]} c="#f3f5f7" />
      <Box p={[-w / 2 + 0.03, 1.05, 0]} s={[0.06, 2.1, 0.8]} c="#f3f5f7" />
      <Box p={[w / 2 - 0.03, 1.05, 0]} s={[0.06, 2.1, 0.8]} c="#f3f5f7" />
      <Box p={[0, 0.05, 0]} s={[w, 0.1, 0.8]} c="#f3f5f7" />
      <Box p={[0, 2.05, 0]} s={[w, 0.1, 0.8]} c="#f3f5f7" />
      <Box p={[0, 1.0, -0.29]} s={[w - 0.12, 1.85, 0.02]} m={glow('#eaf6ff', '#cfeaff', 0.9, 1.4)} cast={false} />
      {[0.25, 0.7, 1.15, 1.6].map((y, i) => (
        <group key={y}>
          <Box p={[0, y - 0.02, 0]} s={[w - 0.14, 0.02, 0.5]} c="#d7dee4" cast={false} />
          <Goods p={[0, y, 0]} kind={kind} colors={i % 2 ? [...colors].reverse() : colors} n={6} step={0.17} />
        </group>
      ))}
      <Box p={[0, 1.0, 0.34]} s={[w - 0.1, 1.9, 0.02]} m={GLASS()} cast={false} />
      <Box p={[-w / 2 + 0.04, 1.0, 0.36]} s={[0.05, 1.95, 0.05]} c={ALU} cast={false} />
      <Box p={[w / 2 - 0.04, 1.0, 0.36]} s={[0.05, 1.95, 0.05]} c={ALU} cast={false} />
      <Box p={[0, 0.05, 0.37]} s={[w, 0.1, 0.05]} c={ALU} cast={false} />
      <Cyl p={[w / 2 - 0.12, 1.0, 0.4]} rad={0.014} h={0.5} m={std('#8d979f', { metal: 0.8, rough: 0.3 })} cast={false} />
      <Quad p={[0, 2.05, 0.401]} s={[w - 0.1, 0.24]} map={tex} emissive />
      <Interact words={words} radius={1.6} h={2.4} p={[0, 0, 0.45]} />
      <Solid p={[0, 1.05, 0]} s={[w, 2.1, 0.8]} />
    </group>
  );
}

/** Open-front chilled deck for rice balls / bento. */
function Chiller({ x, z, w, words, kind, colors, head }: { x: number; z: number; w: number; words: string[]; kind: GoodsKind; colors: string[]; head: string }) {
  const tex = useMemo(() => signTexture(head, { bg: '#d9483b', fg: '#fff6e0', w: 256, h: 72 }), [head]);
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.2, 0]} s={[w, 0.4, 0.7]} c="#f3f5f7" />
      <Box p={[0, 1.2, -0.3]} s={[w, 1.6, 0.1]} c="#e2e7ea" />
      <Box p={[-w / 2 + 0.025, 1.2, 0]} s={[0.05, 1.6, 0.7]} c="#e2e7ea" />
      <Box p={[w / 2 - 0.025, 1.2, 0]} s={[0.05, 1.6, 0.7]} c="#e2e7ea" />
      <Box p={[0, 2.0, 0]} s={[w, 0.2, 0.7]} c="#d9483b" />
      <Box p={[0, 1.88, 0.05]} s={[w - 0.1, 0.04, 0.4]} m={glow('#eaf6ff', '#cfeaff', 1.0, 1.6)} cast={false} />
      {[0.5, 0.9, 1.3].map((y, i) => (
        <group key={y}>
          <Box p={[0, y, 0.02]} s={[w - 0.1, 0.03, 0.5]} c="#d7dee4" r={[-0.12, 0, 0]} cast={false} />
          <Goods p={[0, y + 0.03, 0.02]} r={[-0.12, 0, 0]} kind={kind} colors={i % 2 ? [...colors].reverse() : colors} n={Math.round(w / 0.15)} step={0.15} />
        </group>
      ))}
      <Quad p={[0, 2.0, 0.351]} s={[w - 0.2, 0.15]} map={tex} emissive />
      <Interact words={words} radius={1.6} h={2.4} p={[0, 0, 0.5]} />
      <Solid p={[0, 1.05, 0]} s={[w, 2.1, 0.7]} />
    </group>
  );
}

function IceCreamChest({ x, z }: { x: number; z: number }) {
  const tex = useMemo(() => signTexture('アイス', { bg: '#7cc4e8', fg: '#ffffff', w: 256, h: 80 }), []);
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.31, 0]} s={[1.8, 0.62, 0.8]} c="#f3f5f7" />
      <Box p={[0, 0.72, 0.38]} s={[1.84, 0.2, 0.04]} c="#7cc4e8" />
      <Box p={[0, 0.72, -0.38]} s={[1.84, 0.2, 0.04]} c="#7cc4e8" />
      <Box p={[-0.9, 0.72, 0]} s={[0.04, 0.2, 0.8]} c="#7cc4e8" />
      <Box p={[0.9, 0.72, 0]} s={[0.04, 0.2, 0.8]} c="#7cc4e8" />
      <Box p={[0, 0.63, 0]} s={[1.7, 0.02, 0.7]} m={glow('#eaf6ff', '#cfeaff', 0.8, 1.3)} cast={false} />
      <Goods p={[0, 0.64, -0.14]} kind="box" colors={['#ffb3c8', '#fff1a6', '#9be3d2', '#c9b3f0']} n={10} step={0.16} />
      <Goods p={[0, 0.64, 0.14]} kind="cup" colors={['#ffd8a8', '#bfe3ff', '#ffc2d9']} n={10} step={0.16} />
      <Box p={[0, 0.84, 0]} s={[1.7, 0.02, 0.7]} m={std('#cfe8f2', { rough: 0.05, metal: 0.3, transparent: true, opacity: 0.3 })} cast={false} />
      <Quad p={[0, 0.32, 0.401]} s={[1.0, 0.31]} map={tex} emissive />
      <Interact words={['ice_cream']} radius={1.6} h={1.25} p={[0, 0, 0.5]} />
      <Solid p={[0, 0.45, 0]} s={[1.8, 0.9, 0.8]} />
    </group>
  );
}

function Counter() {
  const tex = useMemo(() => signTexture('いらっしゃいませ', { bg: '#3aa16b', fg: '#ffffff', w: 512, h: 96 }), []);
  return (
    <group>
      <Box solid p={[4.95, 0.45, 0.2]} s={[4.1, 0.9, 0.6]} c="#f7f2e6" />
      <Box p={[4.95, 0.45, 0.505]} s={[4.1, 0.9, 0.01]} c="#3aa16b" cast={false} />
      <Quad p={[4.0, 0.5, 0.511]} s={[1.6, 0.3]} map={tex} emissive />
      <Box p={[4.95, 0.93, 0.2]} s={[4.14, 0.06, 0.7]} c="#5a4a3e" />
      <Box solid p={[2.95, 0.5, -0.65]} s={[0.1, 1.0, 2.3]} c="#f7f2e6" />
      <Box solid p={[4.95, 1.0, -1.6]} s={[4.1, 2.0, 0.4]} c="#d7cdb9" />
      <Box p={[4.95, 1.1, -1.38]} s={[3.9, 1.8, 0.04]} c="#f4f1ea" cast={false} />
      <Goods p={[4.95, 0.75, -1.32]} kind="box" colors={['#e8837a', '#7aa6d6', '#f2c86b', '#8cc7a1', '#b99ad6']} n={24} step={0.16} />
      <Goods p={[4.95, 1.25, -1.32]} kind="box" colors={['#7aa6d6', '#e8837a', '#8cc7a1', '#f2c86b']} n={24} step={0.16} />

      <Interact words={['microwave']} radius={1.5} h={0.75} p={[3.4, 0.96, 0.2]}>
        <Box p={[0, 0.18, 0]} s={[0.5, 0.34, 0.38]} c="#eceff1" />
        <Box p={[-0.06, 0.18, 0.195]} s={[0.32, 0.26, 0.01]} c="#23272d" />
        <Box p={[0.19, 0.18, 0.195]} s={[0.07, 0.26, 0.01]} c={ALU} />
        <Box p={[0.19, 0.27, 0.2]} s={[0.05, 0.03, 0.01]} m={glow('#9ff7b8', '#4be07a', 0.8, 1.2)} cast={false} />
      </Interact>
      <Interact words={['register']} radius={1.5} h={0.8} p={[4.4, 0.96, 0.2]}>
        <Box p={[0, 0.07, 0]} s={[0.46, 0.14, 0.4]} c="#3a3f47" />
        <Box p={[0, 0.22, -0.1]} s={[0.4, 0.26, 0.04]} c="#2b2f36" r={[-0.25, 0, 0]} />
        <Box p={[0, 0.22, -0.078]} s={[0.35, 0.21, 0.01]} m={glow('#bfe9ff', '#6fc7ff', 0.8, 1.2)} r={[-0.25, 0, 0]} cast={false} />
        {[-0.1, 0, 0.1].map((kx) => (
          <Box key={kx} p={[kx, 0.145, 0.1]} s={[0.07, 0.015, 0.07]} c="#d7dee4" cast={false} />
        ))}
      </Interact>
      <Interact words={['money']} radius={1.5} h={0.5} p={[5.2, 0.96, 0.2]}>
        <Box p={[0, 0.02, 0]} s={[0.4, 0.04, 0.26]} c="#2b2f36" />
        <Box p={[-0.08, 0.05, 0]} s={[0.14, 0.012, 0.07]} c="#e5c76b" r={[0, 0.15, 0]} cast={false} />
        <Box p={[-0.08, 0.062, 0]} s={[0.14, 0.012, 0.07]} c="#9bc99b" r={[0, -0.1, 0]} cast={false} />
        {[0.05, 0.11, 0.16].map((cx, i) => (
          <Cyl key={cx} p={[cx, 0.05, (i - 1) * 0.06]} rad={0.022} h={0.012} m={std('#e3c25a', { metal: 0.8, rough: 0.3 })} cast={false} />
        ))}
      </Interact>
      <Interact words={['receipt']} radius={1.5} h={0.5} p={[6.0, 0.96, 0.2]}>
        <Box p={[0, 0.07, 0]} s={[0.2, 0.14, 0.2]} c="#2b2f36" />
        <Box p={[0, 0.2, 0.04]} s={[0.07, 0.15, 0.003]} c="#ffffff" r={[0.15, 0, 0]} cast={false} />
        <Box p={[0.2, 0.01, 0.06]} s={[0.08, 0.004, 0.2]} c="#ffffff" cast={false} />
      </Interact>
      <Interact words={['plastic_bag']} radius={1.5} h={0.75} p={[6.7, 0.96, 0.2]}>
        <Cyl p={[0, 0.02, 0]} rad={0.1} h={0.04} c="#8d979f" />
        <Cyl p={[0, 0.2, 0]} rad={0.01} h={0.4} c="#8d979f" />
        <Box p={[0, 0.3, 0]} s={[0.2, 0.28, 0.02]} m={std('#ffffff', { transparent: true, opacity: 0.55, rough: 0.2 })} cast={false} />
        <Box p={[0, 0.3, 0.012]} s={[0.12, 0.08, 0.005]} c="#3aa16b" cast={false} />
      </Interact>
    </group>
  );
}

function Cart({ p }: { p: V3 }) {
  const metal = std('#aab3ba', { metal: 0.7, rough: 0.3 });
  const green = std('#3aa16b', { transparent: true, opacity: 0.8 });
  return (
    <Interact words={['shopping']} radius={1.7} h={1.3} p={p} r={[0, 0.4, 0]}>
      <Box p={[0, 0.82, 0]} s={[0.55, 0.02, 0.9]} m={metal} cast={false} />
      <Box p={[0, 0.64, 0.45]} s={[0.55, 0.38, 0.02]} m={green} cast={false} />
      <Box p={[0, 0.64, -0.45]} s={[0.55, 0.38, 0.02]} m={green} cast={false} />
      <Box p={[-0.275, 0.64, 0]} s={[0.02, 0.38, 0.9]} m={green} cast={false} />
      <Box p={[0.275, 0.64, 0]} s={[0.02, 0.38, 0.9]} m={green} cast={false} />
      <Box p={[0, 0.3, 0]} s={[0.5, 0.02, 0.8]} m={metal} cast={false} />
      <Box p={[0, 1.0, -0.47]} s={[0.55, 0.03, 0.03]} c="#3aa16b" cast={false} />
      {([-1, 1] as const).flatMap((a) => ([-1, 1] as const).map((b) => <Cyl key={`${a}${b}`} p={[a * 0.24, 0.07, b * 0.38]} rad={0.05} h={0.04} r={[0, 0, Math.PI / 2]} c="#2b2f36" cast={false} />))}
      <Goods p={[0, 0.84, 0]} kind="bag" colors={['#ffd166', '#ff8f8f', '#7bdcb5']} n={3} step={0.16} />
      <Solid p={[0, 0.6, 0]} s={[0.6, 1.2, 0.95]} />
    </Interact>
  );
}

function BasketStack({ p }: { p: V3 }) {
  return (
    <Interact words={['basket']} radius={1.5} h={1.3} p={p}>
      <Box p={[0, 0.375, 0]} s={[0.5, 0.75, 0.4]} c="#6b6f76" />
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} p={[0, 0.84 + i * 0.1, 0]} s={[0.44, 0.2, 0.32]} c={i % 2 ? '#ff8f8f' : '#e5584f'} cast={false} />
      ))}
      <Solid p={[0, 0.7, 0]} s={[0.5, 1.4, 0.4]} />
    </Interact>
  );
}

function MagazineRack({ z }: { z: number }) {
  const covers = ['#ff9fb8', '#9fd3ff', '#ffe08a', '#b8e6b0', '#d9b8ff', '#ffb98a'];
  return (
    <group position={[W / 2 - 0.25, 0, z]}>
      <Box p={[0.17, 0.9, 0]} s={[0.06, 1.8, 1.6]} c="#d8c7a8" />
      <Box p={[0, 0.9, 0.77]} s={[0.4, 1.8, 0.06]} c="#d8c7a8" />
      <Box p={[0, 0.9, -0.77]} s={[0.4, 1.8, 0.06]} c="#d8c7a8" />
      {[0.12, 0.57, 1.02, 1.47].map((y) => (
        <Box key={y} p={[0, y, 0]} s={[0.4, 0.03, 1.6]} c="#c9b48f" cast={false} />
      ))}
      <Interact words={['magazine']} radius={1.7} h={1.95} p={[-0.3, 0, 0]}>
        {[0.14, 0.59, 1.04, 1.49].flatMap((y, r) => covers.map((_c, i) => <Box key={`${r}${i}`} p={[0.4, y + 0.19, (i - 2.5) * 0.25]} s={[0.03, 0.34, 0.2]} c={covers[(i + r) % 6]} r={[0, 0, -0.2]} cast={false} />))}
      </Interact>
      <Solid p={[0, 0.9, 0]} s={[0.4, 1.8, 1.6]} />
    </group>
  );
}

function FoodTable({ p }: { p: V3 }) {
  return (
    <Interact words={['food']} radius={1.7} h={1.95} p={p}>
      <Cyl p={[0, 0.4, 0]} rad={0.6} h={0.8} top={0.95} c="#f7f2e6" />
      <Cyl p={[0, 0.82, 0]} rad={0.64} h={0.04} c="#3aa16b" />
      <Goods p={[0, 0.84, 0.3]} kind="box" colors={PASTEL} n={5} step={0.17} />
      <Goods p={[0, 0.84, -0.2]} kind="bag" colors={PASTEL} n={5} step={0.17} />
      <Goods p={[0, 1.02, 0]} kind="cup" colors={['#e5584f', '#ffd166', '#3aa16b']} n={3} step={0.18} />
      <Box p={[0, 1.35, 0]} s={[0.04, 0.5, 0.04]} c="#3aa16b" cast={false} />
      <Poster p={[0, 1.7, 0]} s={[0.7, 0.35]} text="おいしい!" bg="#fff3c4" fg="#d9483b" border="#d9483b" frame="#3aa16b" />
      <Solid p={[0, 0.45, 0]} s={[1.3, 0.9, 1.3]} />
    </Interact>
  );
}

export function KonbiniInterior() {
  return (
    <>
      <Lights
        sky="#fffaf0"
        ground="#d9e6d9"
        hemi={1.25}
        points={[
          [-4.5, 3.0, -1.5, '#fff4e0', 22],
          [0, 3.0, 2.0, '#fff4e0', 18],
          [4.5, 3.0, -2.5, '#fff4e0', 20],
          [-4, 3.0, 3.5, '#ffffff', 14],
        ]}
      />
      <Room
        id="konbini"
        size={[W, D, H]}
        floor={{ kind: 'tile', color: '#ffffff', tint: '#f3f6f1', scale: 1.4 }}
        wall={{ kind: 'wallpaper', color: '#ffffff', tint: '#f4f9f4', scale: 2 }}
        ceiling={{ color: '#fbfbf7' }}
        trim="#3aa16b"
        wainscot={{ color: '#3aa16b', h: 0.5 }}
        door="glass"
        windows={[
          { wall: 's', at: -4.2, y: 1.8, w: 2.6, h: 1.4 },
          { wall: 's', at: 4.2, y: 1.8, w: 2.6, h: 1.4 },
        ]}
      >
        {[-4.5, 0, 4.5].flatMap((x) => [-3, 0.5, 3.5].map((z) => <CeilingPanel key={`${x}${z}`} p={[x, H - 0.04, z]} s={[1.6, 0.5]} />))}

        <Fridge x={-5.9} words={['refrigerator']} kind="can" colors={['#e5584f', '#2d7fb8', '#f2b233', '#3aa16b', '#e0e0e0']} head="ドリンク" />
        <Fridge x={-4.6} words={['milk']} kind="carton" colors={['#ffffff', '#cfe8ff', '#ffe0ec']} head="牛乳" />
        <Fridge x={-3.3} words={['juice']} kind="bottle" colors={['#ff9f43', '#e5584f', '#a5d86e', '#c77dff']} head="ジュース" />
        <Fridge x={-2.0} words={['green_tea']} kind="bottle" colors={['#7bc67e', '#4f9d5a', '#d9ecb0']} head="お茶" />
        <Fridge x={-0.7} words={['water']} kind="bottle" colors={['#bfe3ff', '#d9f0ff', '#9fd0f5']} head="水" />
        <Chiller x={1.1} z={-D / 2 + 0.4} w={1.4} words={['onigiri']} kind="box" colors={['#ffffff', '#f4f1ea', '#e9efe3']} head="おにぎり" />
        <Chiller x={2.7} z={-D / 2 + 0.4} w={1.6} words={['bento']} kind="box" colors={['#e8a06b', '#f2c86b', '#d96f5e', '#8cc7a1']} head="お弁当" />
        <IceCreamChest x={4.8} z={-D / 2 + 0.5} />
        <MagazineRack z={-2.9} />
        <Poster p={[6.96, 2.4, -3.4]} r={[0, -Math.PI / 2, 0]} s={[0.8, 1.0]} text="新発売" sub="NEW" bg="#ffe0ec" fg="#d9483b" border="#d9483b" />
        <Poster p={[6.96, 2.4, -1.6]} r={[0, -Math.PI / 2, 0]} s={[0.8, 1.0]} text="セール" sub="SALE" bg="#fff3c4" fg="#e5584f" border="#f2b233" />

        <Gondola
          p={[-6.6, 0, -0.1]}
          len={5}
          east={[
            { z: -1.9, words: ['snacks'], kind: 'bag', colors: ['#ffd166', '#ff8f8f', '#7bdcb5', '#7cc4e8'] },
            { z: -0.8, words: ['candy'], kind: 'ball', colors: ['#ff8fb8', '#ffd166', '#9be3d2', '#c9b3f0'] },
            { z: 0.4, words: ['chocolate'], kind: 'bar', colors: ['#6b3e26', '#9a5b3a', '#e8b4c8', '#d9c07a'] },
            { z: 1.6, words: ['cup_noodles'], kind: 'cup', colors: ['#e5584f', '#f2b233', '#3aa16b', '#2d7fb8'] },
          ]}
          eastHead="お菓子"
        />
        <Gondola
          p={[-4.2, 0, -0.1]}
          len={4}
          west={[
            { z: -1.5, words: ['bread'], kind: 'bag', colors: ['#e8c48b', '#f5deb3', '#d9a066'] },
            { z: -0.2, words: ['egg'], kind: 'box', colors: ['#f4ead0', '#efe0b8'] },
            { z: 1.2, words: ['shelf'], kind: 'box', colors: ['#c9ced6', '#e8837a', '#f2c86b'] },
          ]}
          east={[
            { z: -1.5, words: ['battery'], kind: 'box', colors: ['#2b2f36', '#e5584f', '#f2b233'] },
            { z: -0.2, words: ['toothbrush'], kind: 'box', colors: ['#7cc4e8', '#ff8fb8', '#9be3d2'] },
            { z: 1.2, words: ['soap'], kind: 'bottle', colors: ['#ffc2d9', '#bfe3ff', '#e0f5c0'] },
          ]}
          westHead="パン・卵"
          eastHead="日用品"
        />
        <Gondola
          p={[-1.8, 0, -0.1]}
          len={4}
          west={[
            { z: -1.5, words: ['apple'], kind: 'ball', colors: ['#e5584f', '#ff7b6b', '#d9483b'] },
            { z: -0.2, words: ['banana'], kind: 'ball', colors: ['#f7d94a', '#f2c230'] },
          ]}
          westHead="果物"
        />

        <FoodTable p={[0.6, 0, -1.2]} />
        <Counter />
        <Cart p={[-2.0, 0, 3.9]} />
        <BasketStack p={[2.4, 0, 4.1]} />

        <Plant p={[6.3, 0, 4.3]} s={1.3} pot="#3aa16b" />
        <Poster p={[-6.96, 2.5, 2.9]} r={[0, Math.PI / 2, 0]} s={[1.2, 0.5]} text="24時間営業" bg="#2f8f5b" fg="#ffffff" border="#ffffff" glowing />
        <Poster p={[-6.96, 2.5, -2.6]} r={[0, Math.PI / 2, 0]} s={[1.0, 0.5]} text="いらっしゃいませ" bg="#fff3c4" fg="#2f8f5b" border="#3aa16b" />
      </Room>
    </>
  );
}
