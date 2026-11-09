import { useMemo } from 'react';
import { Box, Cyl, Cone, Interact, Quad, Solid, Sph, type V3 } from '../world/parts';
import { M, glow, std } from '../world/materials';
import { pattern, signTexture } from '../world/textures';
import { Room, Lights, Poster, Steam, Stool, Table, Plate, Plant } from './Room';

const W = 10;
const D = 8;
const H = 3.2;
const CT = 0.96;
const IT = 0.92;

const RED = '#b3261e';
const DARK = '#4a2f20';
const STEEL = () => std('#b9c0c7', { metal: 0.8, rough: 0.3 });
const WHITE = '#fbf7ee';

function RamenBowl({ p, steam }: { p: V3; steam?: boolean }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.06, 0]} rad={0.1} h={0.12} top={1.5} c={WHITE} />
      <Cyl p={[0, 0.085, 0]} rad={0.126} h={0.02} c={RED} cast={false} />
      <Cyl p={[0, 0.115, 0]} rad={0.145} h={0.008} c="#c98a45" cast={false} />
      <Sph p={[0, 0.118, 0]} s={[0.12, 0.03, 0.12]} c="#f5e1a4" lo />
      <Cyl p={[-0.05, 0.14, 0.03]} rad={0.05} h={0.01} r={[0.2, 0, 0.1]} c="#d9a083" cast={false} />
      <Cyl p={[0.0, 0.145, 0.07]} rad={0.05} h={0.01} r={[0.1, 0, -0.1]} c="#cf957a" cast={false} />
      <Sph p={[0.06, 0.135, -0.02]} s={[0.04, 0.03, 0.04]} c="#fff8ea" lo />
      <Sph p={[0.06, 0.145, -0.02]} s={[0.02, 0.015, 0.02]} c="#f2a93b" lo />
      <Cyl p={[-0.06, 0.135, -0.05]} rad={0.03} h={0.008} c="#ffffff" cast={false} />
      <Box p={[0.02, 0.2, -0.1]} s={[0.07, 0.1, 0.004]} c="#1d2a24" r={[-0.25, 0.2, 0]} cast={false} />
      {[0.0, 0.03, -0.03].map((o, i) => (
        <Sph key={i} p={[0.0 + o, 0.15, 0.0 - o]} s={[0.012, 0.006, 0.012]} c="#6cc070" lo />
      ))}
      {steam && <Steam p={[0, 0.17, 0]} n={3} rise={0.35} />}
    </group>
  );
}

function BowlStack({ p, n = 3 }: { p: V3; n?: number }) {
  return (
    <group position={p}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[0, i * 0.05, 0]}>
          <Cyl p={[0, 0.06, 0]} rad={0.1} h={0.12} top={1.5} c={WHITE} />
          <Cyl p={[0, 0.07, 0]} rad={0.14} h={0.016} c={RED} cast={false} />
        </group>
      ))}
    </group>
  );
}

function Chopsticks({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.07, 0]} rad={0.06} h={0.14} c={RED} />
      {[-0.025, -0.008, 0.01, 0.028].map((x, i) => (
        <Box key={i} p={[x, 0.2, 0]} s={[0.008, 0.26, 0.008]} c={i % 2 ? '#3a2418' : '#d9b27a'} r={[0.05 * (i - 1.5), 0, 0.12 * (i - 1.5)]} cast={false} />
      ))}
      <Box p={[0.2, 0.01, 0.05]} s={[0.22, 0.02, 0.1]} c="#e8d4b0" cast={false} />
      <Box p={[0.2, 0.027, 0.05]} s={[0.2, 0.01, 0.01]} c="#3a2418" cast={false} />
      <Box p={[0.2, 0.027, 0.07]} s={[0.2, 0.01, 0.01]} c="#3a2418" cast={false} />
    </group>
  );
}

function Spoons({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.05, 0]} rad={0.05} h={0.1} c={RED} />
      {[-0.025, 0.025].map((x, i) => (
        <group key={i} position={[x, 0.1, 0]} rotation={[0, 0, (i ? -1 : 1) * -0.12]}>
          <Box p={[0, 0.07, 0]} s={[0.012, 0.16, 0.012]} c={WHITE} cast={false} />
          <Sph p={[0, 0.17, 0.0]} s={[0.036, 0.02, 0.05]} c={WHITE} lo />
        </group>
      ))}
    </group>
  );
}

function MenuStand({ p }: { p: V3 }) {
  const tex = useMemo(() => signTexture('メニュー', { sub: 'MENU', bg: '#fff3dc', fg: RED, border: RED, w: 256, h: 320 }), []);
  return (
    <group position={p}>
      <Box p={[0, 0.17, -0.04]} s={[0.26, 0.34, 0.015]} c="#6b3e24" r={[0.25, 0, 0]} />
      <Quad p={[0, 0.17, -0.032]} s={[0.22, 0.3]} map={tex} r={[0.25, 0, 0]} />
      <Box p={[0, 0.17, 0.04]} s={[0.26, 0.34, 0.012]} c="#6b3e24" r={[-0.25, 0, 0]} cast={false} />
    </group>
  );
}

function Gyoza({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Plate p={[0, 0, 0]} c={WHITE} rad={0.15} />
      {[-0.08, -0.04, 0, 0.04, 0.08].map((x, i) => (
        <group key={i} position={[x, 0.04, 0.0]} rotation={[0, 0.3, 0]}>
          <Sph p={[0, 0, 0]} s={[0.022, 0.026, 0.05]} c="#f5dca5" lo />
          <Sph p={[0, 0.012, -0.01]} s={[0.016, 0.014, 0.04]} c="#c98d4a" lo />
        </group>
      ))}
      <Cyl p={[0.2, 0.015, 0.0]} rad={0.04} h={0.03} c="#fbf7ee" cast={false} />
      <Cyl p={[0.2, 0.031, 0.0]} rad={0.034} h={0.004} c="#3a2418" cast={false} />
    </group>
  );
}

function Bottle({ p, body, cap, label = '#fff' }: { p: V3; body: string; cap: string; label?: string }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.09, 0]} rad={0.04} h={0.18} top={0.85} m={std(body, { rough: 0.25 })} />
      <Cyl p={[0, 0.21, 0]} rad={0.014} h={0.06} c={cap} cast={false} />
      <Cyl p={[0, 0.095, 0]} rad={0.0415} h={0.07} c={label} cast={false} />
    </group>
  );
}

function SaltShaker({ p, c, top }: { p: V3; c: string; top: string }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.06, 0]} rad={0.04} h={0.12} m={std(c, { rough: 0.2, transparent: true, opacity: 0.85 })} />
      <Cyl p={[0, 0.13, 0]} rad={0.035} h={0.03} m={std(top, { metal: 0.6, rough: 0.3 })} cast={false} />
    </group>
  );
}

function OrderPad({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Box p={[0, 0.01, 0]} s={[0.2, 0.02, 0.28]} c="#fff7e8" r={[0, 0.2, 0]} />
      <Box p={[0.0, 0.025, 0]} s={[0.17, 0.004, 0.24]} c="#f0e2c8" r={[0, 0.2, 0]} cast={false} />
      <Cyl p={[0.2, 0.05, 0.05]} rad={0.045} h={0.1} c={RED} />
      <Sph p={[0.2, 0.11, 0.05]} s={[0.04, 0.025, 0.04]} m={std('#d9b24a', { metal: 0.8, rough: 0.3 })} />
    </group>
  );
}

function Noren({ p }: { p: V3 }) {
  const tex = useMemo(() => signTexture('ラーメン', { vertical: true, bg: RED, fg: '#fff3dc', w: 128, h: 360 }), []);
  return (
    <group position={p}>
      <Box p={[0, 1.1, -0.04]} s={[0.12, 2.2, 1.1]} c="#2a1810" cast={false} />
      <Box p={[0.01, 1.1, 0]} s={[0.1, 2.0, 0.95]} c="#8a5a38" cast={false} />
      <Cyl p={[0.06, 2.1, 0]} rad={0.02} h={1.2} r={[Math.PI / 2, 0, 0]} c="#2a1810" cast={false} />
      {[-0.31, 0, 0.31].map((z, i) => (
        <Box key={i} p={[0.1, 1.5, z]} s={[0.012, 0.7, 0.29]} c="#ffffff" cast={false} m={std('#ffffff', { map: tex, rough: 0.9 })} r={[0, 0, 0]} />
      ))}
    </group>
  );
}

function Pot({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.22, 0]} rad={0.3} h={0.44} m={STEEL()} />
      <Cyl p={[0, 0.43, 0]} rad={0.27} h={0.02} c="#d9c27a" cast={false} />
      <Box p={[0.33, 0.35, 0]} s={[0.1, 0.03, 0.06]} c="#2e2a2a" cast={false} />
      <Box p={[-0.33, 0.35, 0]} s={[0.1, 0.03, 0.06]} c="#2e2a2a" cast={false} />
      <Steam p={[0, 0.45, 0]} n={4} rise={0.6} />
    </group>
  );
}

function Wok({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Box p={[0, 0.03, 0]} s={[0.5, 0.06, 0.5]} c="#2b2f36" />
      <Cyl p={[0, 0.09, 0]} rad={0.24} h={0.06} top={1.1} c="#3d4148" />
      <Cyl p={[0, 0.15, 0]} rad={0.27} h={0.12} top={1.35} m={std('#454a52', { metal: 0.7, rough: 0.4 })} />
      <Box p={[0.4, 0.2, 0]} s={[0.3, 0.025, 0.035]} c="#2a1810" cast={false} />
      <Cone p={[0, 0.07, 0]} rad={0.06} h={0.08} m={glow('#7ab8ff', '#4f9bff', 1.2, 1.6)} cast={false} />
    </group>
  );
}

function NoodleBasket({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.1, 0]} rad={0.14} h={0.2} top={1.2} c="#c9a36b" />
      <Sph p={[0, 0.2, 0]} s={[0.14, 0.05, 0.14]} c="#f7e3a0" lo />
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} p={[Math.cos(i * 1.6) * 0.06, 0.24, Math.sin(i * 1.6) * 0.06]} s={[0.012, 0.012, 0.2]} c="#f2d98a" r={[0, i * 0.8, 0]} cast={false} />
      ))}
      <Box p={[0.3, 0.2, 0]} s={[0.25, 0.02, 0.025]} c="#8a5a38" cast={false} />
    </group>
  );
}

function RiceCooker({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.16, 0]} rad={0.22} h={0.32} top={0.9} c={WHITE} />
      <Cyl p={[0, 0.34, 0]} rad={0.2} h={0.06} c="#e6e1d6" />
      <Box p={[0, 0.14, 0.21]} s={[0.16, 0.08, 0.02]} c={RED} cast={false} />
      <Box p={[0, 0.2, 0.22]} s={[0.1, 0.03, 0.01]} m={glow('#9ff7b8', '#4be07a', 0.8, 1.2)} cast={false} />
      <Steam p={[0, 0.37, 0]} n={2} rise={0.3} />
      <Cyl p={[0.38, 0.045, 0.0]} rad={0.08} h={0.09} top={1.4} c={WHITE} />
      <Sph p={[0.38, 0.1, 0.0]} s={[0.1, 0.05, 0.1]} c="#ffffff" lo />
    </group>
  );
}

function CuttingBoard({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Box p={[0, 0.02, 0]} s={[0.45, 0.04, 0.3]} c="#c99a63" />
      {[-0.1, -0.05, 0, 0.05].map((x, i) => (
        <Cyl key={i} p={[x, 0.05, -0.04 + (i % 2) * 0.05]} rad={0.012} h={0.012} r={[0, 0, Math.PI / 2]} c="#7acb7f" cast={false} />
      ))}
      <Cyl p={[0.1, 0.05, 0.06]} rad={0.03} h={0.016} c="#d9a083" cast={false} />
    </group>
  );
}

function Knife({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Box p={[0, 0.018, 0]} s={[0.1, 0.036, 0.3]} c="#5a3a28" />
      <Box p={[0, 0.045, -0.02]} s={[0.012, 0.05, 0.22]} m={STEEL()} r={[0, 0, 0]} cast={false} />
      <Box p={[0, 0.06, 0.15]} s={[0.025, 0.025, 0.12]} c="#2a1810" cast={false} />
      <Box p={[0, 0.06, -0.08]} s={[0.006, 0.04, 0.2]} m={STEEL()} cast={false} />
    </group>
  );
}

function GreenOnion({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Box p={[0, 0.02, 0]} s={[0.3, 0.04, 0.22]} c={WHITE} />
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, (i - 2) * 0.12, 0]}>
          <Cyl p={[(i - 2) * 0.04, 0.06, 0]} rad={0.012} h={0.2} r={[Math.PI / 2, 0, 0]} c="#58b862" cast={false} />
          <Cyl p={[(i - 2) * 0.04, 0.06, 0.12]} rad={0.012} h={0.06} r={[Math.PI / 2, 0, 0]} c="#f4f0d8" cast={false} />
        </group>
      ))}
    </group>
  );
}

function Chashu({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Plate p={[0, 0, 0]} c={WHITE} rad={0.16} />
      <Cyl p={[-0.04, 0.06, 0]} rad={0.05} h={0.12} r={[0, 0, Math.PI / 2]} c="#b87355" cast={false} />
      {[0, 1, 2, 3].map((i) => (
        <Cyl key={i} p={[0.06 + i * 0.012, 0.035 + i * 0.012, 0.01]} rad={0.045} h={0.01} r={[0.3, 0, 0.2]} c="#e2a98d" cast={false} />
      ))}
    </group>
  );
}

function NoriTray({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Box p={[0, 0.02, 0]} s={[0.34, 0.04, 0.26]} c="#6b3e24" />
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} p={[0, 0.05 + i * 0.012, 0]} s={[0.26, 0.01, 0.18]} c="#1d2a24" r={[0, i * 0.08, 0]} cast={false} />
      ))}
    </group>
  );
}

function TicketMachine({ p }: { p: V3 }) {
  const head = useMemo(() => signTexture('券売機', { bg: RED, fg: '#fff3dc', w: 256, h: 80 }), []);
  const btn = ['#ffd166', '#fff3dc', '#ff8f8f', '#9be3d2'];
  return (
    <Interact words={['ticket_machine']} radius={1.7} h={1.9} p={p} r={[0, -Math.PI / 2, 0]}>
      <Box p={[0, 0.9, 0]} s={[0.7, 1.8, 0.45]} c="#2b2f36" />
      <Box p={[0, 1.2, 0.226]} s={[0.6, 0.6, 0.01]} c="#fff3dc" cast={false} />
      {[0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => <Box key={`${r}${c}`} p={[(c - 1) * 0.18, 1.4 - r * 0.14, 0.235]} s={[0.14, 0.1, 0.01]} m={glow(btn[(r + c) % 4], btn[(r + c) % 4], 0.3, 0.8)} cast={false} />))}
      <Quad p={[0, 1.65, 0.231]} s={[0.6, 0.18]} map={head} emissive />
      <Box p={[0, 0.7, 0.226]} s={[0.4, 0.05, 0.01]} c="#0d0f12" cast={false} />
      <Box p={[0, 0.45, 0.23]} s={[0.3, 0.12, 0.02]} c="#161a1f" cast={false} />
      <Box p={[0, 0.2, 0.23]} s={[0.2, 0.05, 0.02]} c="#161a1f" cast={false} />
      <Solid p={[0, 0.9, 0]} s={[0.7, 1.8, 0.45]} />
    </Interact>
  );
}

function WaterServer({ p }: { p: V3 }) {
  return (
    <Interact words={['glass']} radius={1.5} h={1.3} p={p} r={[0, -Math.PI / 2, 0]}>
      <Box p={[0, 0.4, 0]} s={[0.6, 0.8, 0.5]} c={DARK} />
      <Box p={[0, 0.82, 0]} s={[0.66, 0.04, 0.56]} c="#6b3e24" />
      <Cyl p={[0.1, 0.96, 0]} rad={0.08} h={0.24} m={std('#cfe8f2', { rough: 0.05, transparent: true, opacity: 0.55 })} cast={false} />
      <Cyl p={[0.1, 0.9, 0]} rad={0.07} h={0.1} m={std('#8fc8ee', { rough: 0.1, transparent: true, opacity: 0.6 })} cast={false} />
      {[-0.12, -0.2, -0.04].map((z, i) => (
        <Cyl key={i} p={[-0.1, 0.89, z + 0.0]} rad={0.032} h={0.07} top={1.2} m={std('#d6ecf6', { rough: 0.05, transparent: true, opacity: 0.6 })} cast={false} />
      ))}
      <Solid p={[0, 0.45, 0]} s={[0.6, 0.9, 0.5]} />
    </Interact>
  );
}

function SetMeal({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Box p={[0, 0.015, 0]} s={[0.5, 0.03, 0.34]} c="#3a2418" />
      <RamenBowl p={[-0.06, 0.03, 0.0]} steam />
      <Plate p={[0.17, 0.03, -0.05]} c={WHITE} rad={0.07} />
      <Cyl p={[0.18, 0.1, 0.1]} rad={0.045} h={0.05} top={1.3} c="#fbf7ee" cast={false} />
      <Box p={[0.0, 0.035, 0.145]} s={[0.22, 0.008, 0.008]} c="#3a2418" cast={false} />
    </group>
  );
}

function Lantern({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl p={[0, -0.1, 0]} rad={0.2} h={0.32} top={0.8} m={M.lantern()} cast={false} />
      <Cyl p={[0, 0.07, 0]} rad={0.14} h={0.03} c="#2a1810" cast={false} />
      <Cyl p={[0, -0.28, 0]} rad={0.14} h={0.03} c="#2a1810" cast={false} />
      <Cyl p={[0, 0.2, 0]} rad={0.008} h={0.4} c="#2a1810" cast={false} />
    </group>
  );
}

function KitchenBank({ p }: { p: V3 }) {
  return (
    <Interact words={['restaurant_kitchen']} radius={4.4} h={2.7} p={p}>
      <Box p={[0, 0.45, 0]} s={[3.0, 0.9, 0.8]} m={STEEL()} />
      <Box p={[0, 0.92, 0]} s={[3.0, 0.04, 0.82]} c="#8d979f" />
      {[-1.0, 0, 1.0].map((x, i) => (
        <group key={i} position={[x, 0.94, 0]}>
          <Cyl p={[0, 0.2, 0]} rad={0.26} h={0.4} m={STEEL()} />
          <Cyl p={[0, 0.41, 0]} rad={0.25} h={0.03} c="#c9a36b" cast={false} />
          <Steam p={[0, 0.45, 0]} n={3} rise={0.7} />
        </group>
      ))}
      <Cyl p={[0, 2.0, 0]} rad={1.6} h={0.8} top={0.55} m={STEEL()} r={[0, 0, 0]} />
      <Box p={[0, 2.7, 0]} s={[0.5, 0.8, 0.5]} m={STEEL()} cast={false} />
      <Box p={[0, 0.8, 0.42]} s={[2.8, 0.1, 0.03]} c="#2e2a2a" cast={false} />
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (
        <Cyl key={x} p={[x, 0.8, 0.45]} rad={0.04} h={0.03} r={[Math.PI / 2, 0, 0]} c="#d9483b" cast={false} />
      ))}
      <Solid p={[0, 1.0, 0]} s={[3.0, 2.0, 0.8]} />
    </Interact>
  );
}

function Island({ x0, x1, z }: { x0: number; x1: number; z: number }) {
  const len = x1 - x0;
  return (
    <group>
      <Box solid p={[(x0 + x1) / 2, 0.45, z]} s={[len, 0.9, 0.8]} m={STEEL()} />
      <Box p={[(x0 + x1) / 2, IT - 0.01, z]} s={[len + 0.04, 0.04, 0.84]} c="#d9dee2" />
    </group>
  );
}

export function RamenInterior() {
  const backTile = useMemo(() => pattern('tile', [5, 1.5], '#f1ece0'), []);
  const strips = ['しょうゆ', 'みそ', 'しお', 'とんこつ', 'ぎょうざ', 'チャーシュー', 'ごはん', 'ビール', 'たまご'];
  return (
    <>
      <Lights
        sky="#ffe8cc"
        ground="#6b4a35"
        hemi={0.85}
        points={[
          [-3, 2.6, 0.4, '#ffb066', 20],
          [3, 2.6, 0.4, '#ffb066', 20],
          [0, 2.6, 2.6, '#ffd9a0', 16],
          [0, 2.6, -2.6, '#fff0d0', 16],
        ]}
      />
      <Room
        id="ramen"
        size={[W, D, H]}
        floor={{ kind: 'planks', color: '#ffffff', tint: '#7a5a40', scale: 1.5 }}
        wall={{ kind: 'wallpaper', color: '#ffffff', tint: '#efdfc3', scale: 2 }}
        ceiling={{ kind: 'planks', color: '#ffffff', tint: '#4a3328', scale: 1.5 }}
        trim="#3a2218"
        wainscot={{ color: '#ffffff', h: 1.0, kind: 'planks', tint: '#5a3a28' }}
        door="lattice"
        windows={[
          { wall: 's', at: -3.3, y: 1.8, w: 1.4, h: 1.0 },
          { wall: 's', at: 3.3, y: 1.8, w: 1.4, h: 1.0 },
          { wall: 'w', at: 3.0, y: 1.8, w: 1.2, h: 1.0 },
        ]}
      >
        {[-3, 0, 3].map((x) => (
          <Box key={x} p={[x, H - 0.12, 0]} s={[0.22, 0.22, D - 0.1]} c="#2e1d14" cast={false} />
        ))}
        {[-4, -2, 0, 2, 4].map((x) => (
          <Lantern key={x} p={[x, 2.75, -0.5]} />
        ))}

        {/* counter */}
        <Box solid p={[0, 0.45, -0.5]} s={[W, 0.9, 0.8]} c={RED} />
        <Box p={[0, 0.45, -0.095]} s={[W, 0.9, 0.01]} c="#8a1c16" cast={false} />
        <Box p={[0, 0.07, -0.08]} s={[W, 0.14, 0.02]} c="#2a1810" cast={false} />
        <Box p={[0, 0.93, -0.5]} s={[W, 0.06, 0.92]} c={DARK} />
        <Box p={[0, 0.2, 0.0]} s={[W - 0.2, 0.04, 0.12]} c="#2a1810" cast={false} />

        {/* customer side */}
        {[-3.1, -1.9, -0.7, 0.7, 1.9, 3.1].map((x) =>
          x === 1.9 ? (
            <Interact key={x} words={['seat']} radius={1.4} h={0.95} p={[x, 0, 0.35]}>
              <Stool p={[0, 0, 0]} c={RED} />
            </Interact>
          ) : (
            <Stool key={x} p={[x, 0, 0.35]} c={x < 0 ? RED : '#2e2a2a'} />
          ),
        )}

        <Interact words={['counter']} radius={1.2} h={1.3} p={[-4.4, CT, -0.5]}>
          <OrderPad p={[0, 0, 0]} />
        </Interact>
        <Interact words={['ramen']} radius={1.6} h={0.55} p={[-3.6, CT, -0.5]}>
          <RamenBowl p={[0, 0, 0]} steam />
        </Interact>
        <Interact words={['bowl']} radius={1.6} h={0.55} p={[-2.8, CT, -0.5]}>
          <BowlStack p={[0, 0, 0]} />
        </Interact>
        <Interact words={['chopsticks']} radius={1.6} h={0.55} p={[-2.0, CT, -0.5]}>
          <Chopsticks p={[0, 0, 0]} />
        </Interact>
        <Interact words={['renge']} radius={1.6} h={0.55} p={[-1.2, CT, -0.5]}>
          <Spoons p={[0, 0, 0]} />
        </Interact>
        <Interact words={['menu']} radius={1.6} h={0.6} p={[1.2, CT, -0.5]}>
          <MenuStand p={[0, 0, 0]} />
        </Interact>
        <Interact words={['gyoza']} radius={1.6} h={0.4} p={[2.0, CT, -0.5]}>
          <Gyoza p={[0, 0, 0]} />
        </Interact>
        <Interact words={['soy_sauce']} radius={1.6} h={0.45} p={[2.8, CT, -0.5]}>
          <Bottle p={[0, 0, 0]} body="#2a1c16" cap={RED} label="#e8d4b0" />
        </Interact>
        <Interact words={['salt']} radius={1.6} h={0.35} p={[3.6, CT, -0.5]}>
          <SaltShaker p={[0, 0, 0]} c="#ffffff" top="#c9ced6" />
        </Interact>
        <Interact words={['pepper']} radius={1.6} h={0.35} p={[4.4, CT, -0.5]}>
          <SaltShaker p={[0, 0, 0]} c="#3a2a20" top="#c9ced6" />
        </Interact>

        {/* kitchen */}
        <Island x0={-4.5} x1={-0.9} z={-1.9} />
        <Island x0={1.0} x1={4.9} z={-1.9} />
        <Interact words={['pot']} radius={3.0} h={1.0} p={[-4.0, IT, -1.9]}>
          <Pot p={[0, 0, 0]} />
        </Interact>
        <Interact words={['cooking']} radius={3.0} h={0.7} p={[-3.0, IT, -1.9]}>
          <Wok p={[0, 0, 0]} />
        </Interact>
        <Interact words={['noodles']} radius={3.0} h={0.6} p={[-2.0, IT, -1.9]}>
          <NoodleBasket p={[0, 0, 0]} />
        </Interact>
        <Interact words={['rice']} radius={3.0} h={0.8} p={[-1.3, IT, -1.9]}>
          <RiceCooker p={[0, 0, 0]} />
        </Interact>
        <Interact words={['cutting_board']} radius={3.0} h={0.4} p={[1.4, IT, -1.9]}>
          <CuttingBoard p={[0, 0, 0]} />
        </Interact>
        <Interact words={['kitchen_knife']} radius={3.0} h={0.4} p={[2.2, IT, -1.9]}>
          <Knife p={[0, 0, 0]} />
        </Interact>
        <Interact words={['green_onion']} radius={3.0} h={0.4} p={[3.0, IT, -1.9]}>
          <GreenOnion p={[0, 0, 0]} />
        </Interact>
        <Interact words={['nori']} radius={3.0} h={0.4} p={[3.8, IT, -1.9]}>
          <NoriTray p={[0, 0, 0]} />
        </Interact>
        <Interact words={['chashu']} radius={3.0} h={0.4} p={[4.5, IT, -1.9]}>
          <Chashu p={[0, 0, 0]} />
        </Interact>
        <KitchenBank p={[-2.9, 0, -3.5]} />

        {/* kitchen back wall */}
        <mesh position={[0, 1.2, -D / 2 + 0.03]} scale={[W - 0.2, 2.2, 1]} material={std('#ffffff', { map: backTile })}>
          <planeGeometry args={[1, 1]} />
        </mesh>
        {[1.3, 1.75].map((y) => (
          <Box key={y} p={[3.0, y, -D / 2 + 0.2]} s={[3.2, 0.04, 0.35]} c="#8a5a38" cast={false} />
        ))}
        {[2.0, 3.0, 4.0].map((x, i) => (
          <group key={x}>
            <BowlStack p={[x, 1.32, -D / 2 + 0.2]} n={3 + (i % 2)} />
          </group>
        ))}
        <Box solid p={[3.0, 0.5, -3.6]} s={[1.6, 1.0, 0.7]} m={STEEL()} />
        {strips.map((t, i) => (
          <Poster key={t} p={[-4 + i, 2.55, -D / 2 + 0.03]} s={[0.22, 0.75]} text={t} vertical bg="#fff3dc" fg={RED} border={RED} frame="#6b3e24" />
        ))}

        {/* foyer */}
        <TicketMachine p={[W / 2 - 0.25, 0, 1.2]} />
        <WaterServer p={[W / 2 - 0.25, 0, 2.6]} />
        <Interact words={['noren']} radius={1.4} h={2.3} p={[-W / 2, 0, 1.0]}>
          <Noren p={[0.02, 0, 0]} />
        </Interact>
        <Table p={[-4.1, 0, 2.6]} s={[0.8, 0.8]} h={0.72} top="#c9a070" leg="#5a3a28" />
        <Interact words={['eat']} radius={1.5} h={1.1} p={[-4.1, 0.72, 2.6]}>
          <SetMeal p={[0, 0, 0]} />
        </Interact>
        <Stool p={[-3.3, 0, 2.6]} c="#2e2a2a" />
        <Poster p={[-W / 2 + 0.03, 2.1, -1.6]} r={[0, Math.PI / 2, 0]} s={[1.0, 0.6]} text="ラーメン" sub="RAMEN" bg={RED} fg="#fff3dc" border="#fff3dc" glowing />
        <Poster p={[W / 2 - 0.03, 2.2, -0.5]} r={[0, -Math.PI / 2, 0]} s={[0.9, 0.5]} text="営業中" bg="#fff3dc" fg={RED} border={RED} />
        <Plant p={[4.5, 0, 3.4]} s={1.1} pot="#6b3e24" />
      </Room>
    </>
  );
}
