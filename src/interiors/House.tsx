import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Box, Cyl, Cone, Interact, Quad, Solid, Sph, type V3 } from '../world/parts';
import { glow, std } from '../world/materials';
import { pattern, signTexture } from '../world/textures';
import { Room, Lights, Plant, Poster, Table, Steam, Plate, Mug } from './Room';

const W = 14;
const D = 12;
const H = 3.0;
const WOOD = '#9a6b43';
const DARKWOOD = '#5a3a28';
const PAPER = '#fbf6ea';
const STEEL = () => std('#b9c0c7', { metal: 0.8, rough: 0.3 });

/** Sliding-door partition running along z (axis 'z') or x (axis 'x'); solid up to 2 m with a lattice transom above. */
function Partition({ p, len, axis, kind }: { p: V3; len: number; axis: 'x' | 'z'; kind: 'fusuma' | 'shoji' }) {
  const map = useMemo(() => (kind === 'shoji' ? pattern('shoji', [Math.max(1, Math.round(len / 0.9)), 1.4]) : pattern('wallpaper', [len / 1.2, 1.5], '#f2e8d2')), [kind, len]);
  const mat = kind === 'shoji' ? glow('#fff8e8', '#ffe9c4', 0.12, 0.5, { map }) : std('#f2e8d2', { map, rough: 0.9 });
  const transom = useMemo(() => pattern('shoji', [Math.max(1, Math.round(len / 0.45)), 1]), [len]);
  const posts = Math.max(1, Math.round(len / 0.9));
  const rot: V3 = [0, axis === 'x' ? Math.PI / 2 : 0, 0];
  return (
    <group position={p} rotation={rot}>
      <Box solid p={[0, 1.0, 0]} s={[len, 2.0, 0.06]} m={mat} cast={false} />
      {Array.from({ length: posts + 1 }, (_, i) => (
        <Box key={i} p={[-len / 2 + (i * len) / posts, 1.0, 0]} s={[0.05, 2.0, 0.09]} c={WOOD} cast={false} />
      ))}
      <Box p={[0, 0.06, 0]} s={[len, 0.12, 0.09]} c={DARKWOOD} cast={false} />
      <Box p={[0, 2.0, 0]} s={[len, 0.06, 0.1]} c={DARKWOOD} cast={false} />
      <Box p={[0, 2.35, 0]} s={[len, 0.64, 0.04]} m={glow('#fff8e8', '#ffe9c4', 0.12, 0.5, { map: transom })} cast={false} />
      <Box p={[0, 2.8, 0]} s={[len, 0.4, 0.12]} c={DARKWOOD} cast={false} />
    </group>
  );
}

function TvSet() {
  const tex = useMemo(() => signTexture('おはよう', { sub: 'NEWS', bg: '#bfe3ff', fg: '#2d5a8a', w: 384, h: 220 }), []);
  return (
    <group>
      <Box solid p={[0, 0.25, 0]} s={[0.5, 0.5, 2.6]} c={WOOD} />
      <Box p={[0.0, 0.52, 0]} s={[0.52, 0.03, 2.64]} c={DARKWOOD} cast={false} />
      <Interact words={['tv']} radius={1.7} h={1.5} p={[0, 0.54, 0.0]}>
        <Box p={[0, 0.04, 0]} s={[0.2, 0.06, 0.4]} c="#23272d" />
        <Box p={[0, 0.4, 0]} s={[0.06, 0.62, 1.1]} c="#14171b" />
        <Quad p={[0.034, 0.4, 0]} s={[1.0, 0.54]} map={tex} r={[0, Math.PI / 2, 0]} emissive />
      </Interact>
      <Interact words={['game_console']} radius={1.5} h={0.5} p={[0, 0.54, -0.9]}>
        <Box p={[0, 0.03, 0]} s={[0.22, 0.06, 0.34]} c="#f4f4f4" />
        <Box p={[0.0, 0.065, 0.0]} s={[0.1, 0.01, 0.34]} c="#2d7fb8" cast={false} />
        <Box p={[0.14, 0.015, 0.1]} s={[0.07, 0.03, 0.12]} c="#e5584f" cast={false} />
        <Box p={[0.0, 0.07, 0.19]} s={[0.04, 0.012, 0.02]} m={glow('#9ff7b8', '#4be07a', 0.8, 1.2)} cast={false} />
      </Interact>
      <Interact words={['remote']} radius={1.5} h={0.5} p={[0, 0.54, 0.9]}>
        <Box p={[0, 0.012, 0]} s={[0.05, 0.022, 0.2]} c="#2b2f36" r={[0, 0.3, 0]} />
        {[-0.05, 0, 0.05].map((z) => (
          <Box key={z} p={[0, 0.025, z]} s={[0.03, 0.006, 0.02]} c="#e5584f" r={[0, 0.3, 0]} cast={false} />
        ))}
      </Interact>
    </group>
  );
}

function Closet() {
  const doorMat = std('#f2e8d2', { map: pattern('wallpaper', [0.8, 1.5], '#f2e8d2'), rough: 0.9 });
  return (
    <Interact words={['closet']} radius={1.7} h={2.3} p={[0, 0, 0]}>
      <Box solid p={[0, 1.0, 0]} s={[0.9, 2.0, 2.0]} c={DARKWOOD} />
      {[-0.75, -0.25, 0.25, 0.75].map((z) => (
        <group key={z}>
          <Box p={[0.455, 1.0, z]} s={[0.012, 1.9, 0.48]} m={doorMat} cast={false} />
          <Box p={[0.46, 1.0, z + (z < 0 ? 0.2 : -0.2)]} s={[0.012, 0.12, 0.04]} c="#2a1810" cast={false} />
        </group>
      ))}
      <Box p={[0.46, 1.98, 0]} s={[0.03, 0.04, 2.0]} c={WOOD} cast={false} />
      <Box p={[0.46, 0.02, 0]} s={[0.03, 0.04, 2.0]} c={WOOD} cast={false} />
    </Interact>
  );
}

function Kettle() {
  const iron = std('#2a2a30', { metal: 0.6, rough: 0.4 });
  return (
    <group>
      <Sph p={[0, 0.1, 0]} s={[0.1, 0.085, 0.1]} m={iron} />
      <Cyl p={[0, 0.19, 0]} rad={0.06} h={0.02} m={iron} cast={false} />
      <Sph p={[0, 0.21, 0]} s={[0.018, 0.018, 0.018]} c="#b3261e" />
      <Cyl p={[0.11, 0.12, 0]} rad={0.015} h={0.1} r={[0, 0, -0.9]} m={iron} cast={false} />
      <mesh position={[0, 0.2, 0]} scale={[0.1, 0.1, 0.1]} material={iron}>
        <torusGeometry args={[1, 0.06, 6, 16, Math.PI]} />
      </mesh>
      <Steam p={[0.17, 0.18, 0]} n={2} rise={0.3} />
    </group>
  );
}

function Teacups() {
  return (
    <group>
      <Box p={[0, 0.01, 0]} s={[0.4, 0.02, 0.24]} c="#6b3e24" />
      <Cyl p={[-0.1, 0.06, 0.0]} rad={0.035} h={0.075} top={1.2} c="#d9e8f0" cast={false} />
      <Cyl p={[0.1, 0.06, 0.0]} rad={0.035} h={0.075} top={1.2} c="#f2c8d4" cast={false} />
      <Cyl p={[-0.1, 0.098, 0.0]} rad={0.03} h={0.004} c="#7bb56e" cast={false} />
      <Cyl p={[0.1, 0.098, 0.0]} rad={0.03} h={0.004} c="#7bb56e" cast={false} />
    </group>
  );
}

function Cushion({ p, c, r }: { p: V3; c: string; r?: V3 }) {
  return (
    <group position={p} rotation={r}>
      <Box p={[0, 0.04, 0]} s={[0.52, 0.08, 0.52]} c={c} />
      <Box p={[0, 0.085, 0]} s={[0.44, 0.015, 0.44]} c="#ffffff" cast={false} />
    </group>
  );
}

function Andon({ p }: { p: V3 }) {
  return (
    <Interact words={['light']} radius={1.6} h={1.5} p={p}>
      <Box p={[0, 0.05, 0]} s={[0.4, 0.1, 0.4]} c={DARKWOOD} />
      <Box p={[0, 0.65, 0]} s={[0.32, 1.0, 0.32]} m={glow('#fff0d0', '#ffcf8a', 0.7, 1.4)} />
      {([-1, 1] as const).flatMap((a) => ([-1, 1] as const).map((b) => <Box key={`${a}${b}`} p={[a * 0.16, 0.65, b * 0.16]} s={[0.03, 1.04, 0.03]} c={DARKWOOD} cast={false} />))}
      <Box p={[0, 1.17, 0]} s={[0.42, 0.04, 0.42]} c={DARKWOOD} />
      <Solid p={[0, 0.6, 0]} s={[0.42, 1.2, 0.42]} />
    </Interact>
  );
}

function WallClock() {
  return (
    <Interact words={['clock']} radius={1.7} h={2.8} p={[0, 0, 0]}>
      <Cyl p={[0, 2.2, 0.04]} rad={0.24} h={0.06} r={[Math.PI / 2, 0, 0]} c={DARKWOOD} />
      <Cyl p={[0, 2.2, 0.075]} rad={0.21} h={0.02} r={[Math.PI / 2, 0, 0]} c="#fffaf0" cast={false} />
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} p={[Math.sin((i * Math.PI) / 2) * 0.17, 2.2 + Math.cos((i * Math.PI) / 2) * 0.17, 0.09]} s={[0.02, 0.02, 0.01]} c="#3a2a2a" cast={false} />
      ))}
      <Box p={[0, 2.25, 0.09]} s={[0.014, 0.12, 0.008]} c="#2a1c1c" cast={false} />
      <Box p={[0.04, 2.2, 0.092]} s={[0.1, 0.014, 0.008]} c="#2a1c1c" r={[0, 0, 0.5]} cast={false} />
    </Interact>
  );
}

function Calendar() {
  const tex = useMemo(() => signTexture('11月', { sub: 'NOVEMBER', bg: '#fffaf0', fg: '#b3261e', w: 256, h: 320, border: '#d9b27a' }), []);
  return (
    <Interact words={['calendar']} radius={1.7} h={2.3} p={[0, 0, 0]}>
      <Box p={[0, 1.6, 0.02]} s={[0.46, 0.6, 0.02]} c="#6b3e24" />
      <Quad p={[0, 1.6, 0.032]} s={[0.4, 0.54]} map={tex} />
    </Interact>
  );
}

function Mirror({ p }: { p: V3 }) {
  return (
    <Interact words={['mirror']} radius={1.6} h={1.9} p={p} r={[0, -Math.PI / 2, 0]}>
      <Box p={[0, 0.9, -0.05]} s={[0.55, 1.6, 0.04]} c={WOOD} r={[-0.08, 0, 0]} />
      <Box p={[0, 0.9, -0.025]} s={[0.46, 1.5, 0.01]} m={std('#e4f1f8', { metal: 0.95, rough: 0.04, env: 1.6 })} r={[-0.08, 0, 0]} cast={false} />
      <Box p={[0, 0.05, -0.12]} s={[0.5, 0.06, 0.3]} c={WOOD} cast={false} />
      <Solid p={[0, 0.9, -0.05]} s={[0.6, 1.8, 0.3]} />
    </Interact>
  );
}

function PhoneTable({ p }: { p: V3 }) {
  return (
    <Interact words={['phone']} radius={1.5} h={1.2} p={p}>
      <Table p={[0, 0, 0]} s={[0.5, 0.4]} h={0.7} top={WOOD} leg={DARKWOOD} />
      <Box p={[0, 0.74, 0]} s={[0.26, 0.08, 0.22]} c="#d9483b" />
      <Box p={[0, 0.8, 0]} s={[0.24, 0.03, 0.07]} c="#d9483b" cast={false} />
      <Cyl p={[0, 0.79, 0.06]} rad={0.05} h={0.01} c="#fffaf0" cast={false} />
    </Interact>
  );
}

function KeyBoard({ p }: { p: V3 }) {
  return (
    <Interact words={['key']} radius={1.6} h={1.9} p={p} r={[0, Math.PI, 0]}>
      <Box p={[0, 1.4, 0.02]} s={[0.5, 0.2, 0.03]} c={WOOD} />
      {[-0.15, 0, 0.15].map((x) => (
        <group key={x} position={[x, 1.38, 0.05]}>
          <Cyl p={[0, 0, 0]} rad={0.012} h={0.03} r={[Math.PI / 2, 0, 0]} m={std('#d9b24a', { metal: 0.8, rough: 0.3 })} cast={false} />
          <Box p={[0, -0.05, 0.0]} s={[0.012, 0.08, 0.006]} m={std('#d9b24a', { metal: 0.8, rough: 0.3 })} cast={false} />
        </group>
      ))}
    </Interact>
  );
}

function AirCon() {
  return (
    <Interact words={['air_conditioner']} radius={1.8} h={2.75} p={[0, 0, 0]}>
      <Box p={[0, 2.35, 0.14]} s={[1.0, 0.3, 0.26]} c="#f4f6f8" />
      <Box p={[0, 2.25, 0.2]} s={[0.9, 0.04, 0.16]} c="#dfe4e8" cast={false} />
      <Box p={[0.35, 2.4, 0.275]} s={[0.06, 0.02, 0.01]} m={glow('#9ff7b8', '#4be07a', 0.8, 1.2)} cast={false} />
    </Interact>
  );
}

function Fan({ p }: { p: V3 }) {
  const blades = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += dt * 6;
  });
  return (
    <Interact words={['electric_fan']} radius={1.5} h={1.5} p={p}>
      <Cyl p={[0, 0.03, 0]} rad={0.2} h={0.06} c="#e8ecef" />
      <Cyl p={[0, 0.45, 0]} rad={0.02} h={0.9} c="#c9ced6" cast={false} />
      <Cyl p={[0, 0.98, 0.05]} rad={0.2} h={0.05} r={[Math.PI / 2, 0, 0]} m={std('#bfe3ff', { transparent: true, opacity: 0.35 })} cast={false} />
      <group ref={blades} position={[0, 0.98, 0.04]}>
        {[0, 1, 2].map((i) => (
          <Box key={i} p={[Math.sin((i * Math.PI * 2) / 3) * 0.08, Math.cos((i * Math.PI * 2) / 3) * 0.08, 0]} s={[0.07, 0.15, 0.01]} c="#7cc4e8" r={[0, 0, (-i * Math.PI * 2) / 3]} cast={false} />
        ))}
      </group>
      <Cyl p={[0, 0.98, -0.02]} rad={0.07} h={0.1} r={[Math.PI / 2, 0, 0]} c="#e8ecef" cast={false} />
      <Solid p={[0, 0.5, 0]} s={[0.4, 1.0, 0.4]} />
    </Interact>
  );
}

function Ikebana() {
  return (
    <group>
      <Cyl p={[0, 0.2, 0]} rad={0.1} h={0.4} top={0.7} c="#3d6a8a" />
      <Cyl p={[0, 0.41, 0]} rad={0.05} h={0.04} c="#2a4a60" cast={false} />
      {[0, 1, 2].map((i) => (
        <group key={i}>
          <Cyl p={[(i - 1) * 0.06, 0.62, 0]} rad={0.006} h={0.4} r={[0, 0, (i - 1) * -0.3]} c="#4f7a3e" cast={false} />
          <Sph p={[(i - 1) * 0.12, 0.8 - (i % 2) * 0.06, 0]} s={0.05} c={i === 1 ? '#fff1f4' : '#f7a8c0'} />
        </group>
      ))}
    </group>
  );
}

function Scroll() {
  const tex = useMemo(() => signTexture('夢', { vertical: true, bg: '#f3e8cc', fg: '#2a1c1c', w: 160, h: 460 }), []);
  return (
    <Interact words={['painting']} radius={1.8} h={2.5} p={[0, 0, 0]}>
      <Box p={[0, 1.55, 0.015]} s={[0.46, 1.2, 0.012]} c="#4a6f4f" cast={false} />
      <Quad p={[0, 1.55, 0.024]} s={[0.34, 1.0]} map={tex} />
      <Cyl p={[0, 2.16, 0.03]} rad={0.015} h={0.54} r={[0, 0, Math.PI / 2]} c={DARKWOOD} cast={false} />
      <Cyl p={[0, 0.95, 0.03]} rad={0.02} h={0.52} r={[0, 0, Math.PI / 2]} c={DARKWOOD} cast={false} />
    </Interact>
  );
}

function Bonsai() {
  return (
    <group>
      <Box p={[0, 0.3, 0]} s={[0.5, 0.04, 0.5]} c={DARKWOOD} />
      {([-1, 1] as const).flatMap((a) => ([-1, 1] as const).map((b) => <Box key={`${a}${b}`} p={[a * 0.2, 0.14, b * 0.2]} s={[0.04, 0.28, 0.04]} c={DARKWOOD} cast={false} />))}
      <Box p={[0, 0.37, 0]} s={[0.34, 0.1, 0.24]} c="#b86b4a" />
      <Box p={[0, 0.425, 0]} s={[0.3, 0.015, 0.2]} c="#3f3026" cast={false} />
      <Cyl p={[0, 0.58, 0]} rad={0.022} h={0.3} top={0.6} r={[0, 0, 0.25]} c="#5a3d28" />
      <Cyl p={[-0.05, 0.75, 0]} rad={0.014} h={0.2} r={[0, 0, -0.6]} c="#5a3d28" cast={false} />
      <Sph p={[0.06, 0.74, 0]} s={[0.13, 0.07, 0.11]} c="#4f9558" lo />
      <Sph p={[-0.13, 0.82, 0.02]} s={[0.1, 0.06, 0.09]} c="#5fa261" lo />
      <Sph p={[0.0, 0.68, 0.06]} s={[0.08, 0.05, 0.07]} c="#74b872" lo />
    </group>
  );
}

function Futon() {
  const fab = useMemo(() => pattern('fabric', [2, 3], '#f4a7bc'), []);
  return (
    <group>
      <Box p={[0, 0.04, 0]} s={[1.05, 0.08, 2.1]} c="#fffaf0" cast={false} />
      <Box p={[0, 0.1, 0.3]} s={[1.0, 0.07, 1.5]} m={std('#ffffff', { map: fab, rough: 0.95 })} cast={false} />
      <Box p={[0, 0.115, -0.46]} s={[1.0, 0.05, 0.12]} c="#fffaf0" cast={false} />
    </group>
  );
}

function Pillow() {
  return (
    <group>
      <Sph p={[0, 0.09, 0]} s={[0.26, 0.07, 0.17]} c="#fff4e6" r={[0, 1.57, 0]} />
      <Box p={[0, 0.07, 0]} s={[0.04, 0.02, 0.2]} c="#7cc4e8" cast={false} />
    </group>
  );
}

function Smartphone() {
  return (
    <group>
      <Box p={[0, 0.012, 0]} s={[0.075, 0.014, 0.15]} c="#1a1d22" r={[0, 0.4, 0]} />
      <Box p={[0, 0.02, 0]} s={[0.065, 0.002, 0.13]} m={glow('#bfe9ff', '#6fc7ff', 0.8, 1.2)} r={[0, 0.4, 0]} cast={false} />
    </group>
  );
}

function AlarmClock() {
  return (
    <group>
      <Cyl p={[0, 0.07, 0]} rad={0.07} h={0.04} r={[Math.PI / 2, 0, 0]} c="#e5584f" />
      <Cyl p={[0, 0.07, 0.025]} rad={0.055} h={0.01} r={[Math.PI / 2, 0, 0]} c="#fffaf0" cast={false} />
      <Sph p={[-0.04, 0.14, 0]} s={0.025} c="#d9b24a" cast={false} />
      <Sph p={[0.04, 0.14, 0]} s={0.025} c="#d9b24a" cast={false} />
      <Box p={[0, 0.03, 0]} s={[0.12, 0.02, 0.05]} c="#e5584f" cast={false} />
    </group>
  );
}

function Laptop() {
  return (
    <group>
      <Box p={[0, 0.01, 0]} s={[0.34, 0.02, 0.24]} c="#c9ced6" />
      <Box p={[0, 0.13, -0.12]} s={[0.34, 0.22, 0.015]} c="#c9ced6" r={[-0.2, 0, 0]} />
      <Box p={[0, 0.13, -0.11]} s={[0.3, 0.19, 0.005]} m={glow('#d9efff', '#8ac8ff', 0.8, 1.2)} r={[-0.2, 0, 0]} cast={false} />
    </group>
  );
}

function Slippers({ p }: { p: V3 }) {
  return (
    <Interact words={['slippers']} radius={1.5} h={0.6} p={p}>
      <Box p={[0, 0.005, 0]} s={[0.7, 0.01, 0.45]} c="#c9d4b8" />
      {[-0.15, 0.15].map((x, i) => (
        <group key={i} position={[x, 0.03, 0]}>
          <Box p={[0, 0, 0.02]} s={[0.12, 0.04, 0.26]} c="#7cc4e8" />
          <Box p={[0, 0.03, -0.05]} s={[0.12, 0.04, 0.14]} c="#5aa6cf" cast={false} />
        </group>
      ))}
    </Interact>
  );
}

function GenkanSpot({ p }: { p: V3 }) {
  return (
    <Interact words={['genkan']} radius={1.7} h={1.2} p={p}>
      {[-0.2, 0.2].map((x, i) => (
        <group key={i} position={[x, 0.02, 0]} rotation={[0, i ? -0.2 : 0.15, 0]}>
          <Box p={[0, 0.04, 0.02]} s={[0.1, 0.08, 0.28]} c={i ? '#3d5a80' : '#e8837a'} cast={false} />
          <Box p={[0, 0.012, 0.02]} s={[0.105, 0.025, 0.29]} c="#fffaf0" cast={false} />
        </group>
      ))}
      <Box p={[0.7, 0.03, 0]} s={[0.1, 0.06, 0.26]} c="#2a2a30" cast={false} />
      <Box p={[1.0, 0.03, 0.05]} s={[0.1, 0.06, 0.26]} c="#2a2a30" cast={false} />
    </Interact>
  );
}

function Door({ p }: { p: V3 }) {
  return (
    <Interact words={['door']} radius={1.7} h={2.4} p={p} r={[0, Math.PI / 2, 0]} sfx="door">
      <Box p={[0, 1.05, 0.04]} s={[0.9, 2.1, 0.06]} c="#b98a5e" />
      <Box p={[0, 1.05, 0.075]} s={[0.7, 0.8, 0.02]} c="#a67a50" cast={false} />
      <Box p={[0, 1.7, 0.075]} s={[0.5, 0.3, 0.02]} m={glow('#fff2d0', '#ffe2a8', 0.5, 1.2)} cast={false} />
      <Sph p={[0.32, 1.0, 0.1]} s={0.035} m={std('#d9b24a', { metal: 0.8, rough: 0.3 })} />
      <Box p={[-0.5, 1.05, 0.06]} s={[0.08, 2.15, 0.1]} c={DARKWOOD} cast={false} />
      <Box p={[0.5, 1.05, 0.06]} s={[0.08, 2.15, 0.1]} c={DARKWOOD} cast={false} />
      <Box p={[0, 2.14, 0.06]} s={[1.08, 0.08, 0.1]} c={DARKWOOD} cast={false} />
    </Interact>
  );
}

function WindowSpot({ p }: { p: V3 }) {
  return (
    <Interact words={['window']} radius={1.8} h={2.4} p={p}>
      <Box p={[-1.0, 1.45, 0.1]} s={[0.25, 1.5, 0.05]} c="#f2b5c6" cast={false} />
      <Box p={[1.0, 1.45, 0.1]} s={[0.25, 1.5, 0.05]} c="#f2b5c6" cast={false} />
      <Cyl p={[0, 2.22, 0.1]} rad={0.012} h={2.4} r={[0, 0, Math.PI / 2]} c={DARKWOOD} cast={false} />
      <Plant p={[0.5, 0.78, 0.2]} s={0.55} pot="#e8a0b4" />
    </Interact>
  );
}

function TrashCan({ p }: { p: V3 }) {
  return (
    <Interact words={['trash_can']} radius={1.5} h={0.95} p={p}>
      <Cyl p={[0, 0.3, 0]} rad={0.2} h={0.6} top={1.1} c="#cfd6da" />
      <Cyl p={[0, 0.62, 0]} rad={0.23} h={0.04} c="#7cc4e8" />
      <Sph p={[0, 0.65, 0]} s={[0.04, 0.03, 0.04]} c="#7cc4e8" />
      <Solid p={[0, 0.35, 0]} s={[0.46, 0.7, 0.46]} />
    </Interact>
  );
}

function Broom({ p }: { p: V3 }) {
  return (
    <Interact words={['broom']} radius={1.5} h={1.9} p={p} r={[0, Math.PI, 0]}>
      <Cyl p={[0, 0.8, 0.12]} rad={0.015} h={1.6} r={[-0.1, 0, 0]} c="#c9a070" />
      <Cone p={[0, 0.17, 0.02]} rad={0.1} h={0.3} r={[Math.PI, 0, 0]} c="#d9c27a" />
      <Box p={[0, 0.3, 0.025]} s={[0.12, 0.03, 0.12]} c="#8a5a38" cast={false} />
    </Interact>
  );
}

function Cleaning({ p }: { p: V3 }) {
  return (
    <Interact words={['cleaning']} radius={1.5} h={1.2} p={p}>
      <Cyl p={[0, 0.14, 0]} rad={0.17} h={0.28} top={1.2} c="#7cc4e8" />
      <Cyl p={[0, 0.25, 0]} rad={0.2} h={0.01} c="#5aa6cf" cast={false} />
      <Cyl p={[0, 0.26, 0]} rad={0.17} h={0.01} m={std('#8fd0ee', { transparent: true, opacity: 0.8 })} cast={false} />
      <Cyl p={[0.08, 0.55, 0]} rad={0.012} h={0.8} r={[0, 0, 0.12]} c="#c9a070" cast={false} />
      <Box p={[0.14, 0.2, 0]} s={[0.12, 0.06, 0.12]} c="#f4f0e4" r={[0, 0, 0.12]} cast={false} />
      <Box p={[-0.26, 0.03, 0.04]} s={[0.15, 0.025, 0.1]} c="#fff1a6" cast={false} />
    </Interact>
  );
}

function Kitchen() {
  return (
    <group position={[0, 0, -D / 2]}>
      {/* base cabinets along north wall, local z = into room */}
      <Box solid p={[3.9, 0.45, 0.35]} s={[5.8, 0.9, 0.7]} c="#f0e4cf" />
      <Box p={[3.9, 0.92, 0.36]} s={[5.86, 0.05, 0.74]} m={std('#d9dee2', { metal: 0.5, rough: 0.35 })} />
      {[1.5, 2.5, 3.5, 4.5, 5.5, 6.4].map((x) => (
        <Box key={x} p={[x - 0.45, 0.45, 0.705]} s={[0.9, 0.8, 0.01]} c="#e0cfae" cast={false} />
      ))}
      <Box solid p={[1.0, 1.9, 0.3]} s={[0.7, 1.85, 0.6]} c="#e9edf0" />
      <Box p={[1.0, 1.3, 0.605]} s={[0.66, 0.02, 0.01]} c="#9aa3ad" cast={false} />
      <Box p={[1.28, 1.5, 0.62]} s={[0.025, 0.4, 0.03]} c="#9aa3ad" cast={false} />
      {/* upper cabinets */}
      {[2.0, 6.0].map((x) => (
        <Box key={x} p={[x, 2.15, 0.2]} s={[2.0, 0.7, 0.4]} c="#f0e4cf" />
      ))}
      <Interact words={['rice_cooker']} radius={1.5} h={1.5} p={[2.0, 0.945, 0.35]}>
        <Cyl p={[0, 0.14, 0]} rad={0.19} h={0.28} top={0.9} c="#fbf7ee" />
        <Cyl p={[0, 0.29, 0]} rad={0.17} h={0.05} c="#e6e1d6" />
        <Box p={[0, 0.12, 0.18]} s={[0.14, 0.07, 0.02]} c="#3d5a80" cast={false} />
        <Steam p={[0, 0.33, 0]} n={2} rise={0.3} />
      </Interact>
      <Interact words={['sink']} radius={1.6} h={1.6} p={[3.5, 0.945, 0.35]}>
        <Box p={[0, 0.0, 0.0]} s={[0.8, 0.03, 0.5]} m={STEEL()} />
        <Box p={[0, 0.015, 0]} s={[0.6, 0.02, 0.36]} c="#7e8790" cast={false} />
        <Cyl p={[0, 0.2, -0.22]} rad={0.015} h={0.3} m={STEEL()} cast={false} />
        <Cyl p={[0, 0.34, -0.14]} rad={0.012} h={0.2} r={[Math.PI / 2, 0, 0]} m={STEEL()} cast={false} />
        <Box p={[0.3, 0.1, -0.2]} s={[0.04, 0.04, 0.04]} c="#7cc4e8" cast={false} />
      </Interact>
      <Interact words={['dishes']} radius={1.5} h={1.3} p={[4.6, 0.945, 0.35]}>
        <Box p={[0, 0.02, 0]} s={[0.5, 0.03, 0.3]} c="#c9ced6" />
        {[-0.18, -0.09, 0, 0.09, 0.18].map((x, i) => (
          <Cyl key={i} p={[x, 0.15, 0]} rad={0.11} h={0.012} r={[0, 0, Math.PI / 2]} c={i % 2 ? '#f4f0e4' : '#cfe3f2'} cast={false} />
        ))}
        <Cyl p={[0.0, 0.04, 0.0]} rad={0.02} h={0.01} c="#c9ced6" cast={false} />
      </Interact>
      <Interact words={['kitchen']} radius={1.8} h={1.5} p={[5.5, 0.945, 0.35]}>
        <Box p={[0, 0.03, 0]} s={[0.8, 0.06, 0.5]} m={STEEL()} />
        {[-0.2, 0.2].map((x) => (
          <group key={x}>
            <Cyl p={[x, 0.075, 0]} rad={0.09} h={0.02} c="#2b2f36" cast={false} />
            <Cone p={[x, 0.09, 0]} rad={0.04} h={0.04} m={glow('#7ab8ff', '#4f9bff', 1.0, 1.4)} cast={false} />
          </group>
        ))}
        <Cyl p={[-0.2, 0.14, 0]} rad={0.12} h={0.1} c="#d9483b" />
        <Box p={[-0.0, 0.07, 0.3]} s={[0.5, 0.04, 0.04]} c="#2b2f36" cast={false} />
        <Steam p={[-0.2, 0.2, 0]} n={2} rise={0.35} />
      </Interact>
      <Interact words={['towel']} radius={1.5} h={1.5} p={[6.4, 0.945, 0.4]}>
        <Box p={[0, 0.4, 0]} s={[0.05, 0.5, 0.05]} c={DARKWOOD} />
        <Cyl p={[0, 0.62, 0]} rad={0.012} h={0.5} r={[0, 0, Math.PI / 2]} c={DARKWOOD} cast={false} />
        <Box p={[-0.08, 0.45, 0]} s={[0.14, 0.34, 0.03]} c="#7cc4e8" cast={false} />
        <Box p={[0.1, 0.48, 0]} s={[0.14, 0.28, 0.03]} c="#f4a7bc" cast={false} />
      </Interact>
    </group>
  );
}

export function HouseInterior() {
  const stone = useMemo(() => pattern('stone', [4, 1]), []);
  const kitchenTile = useMemo(() => pattern('tile', [5, 4], '#efe2cc'), []);
  const tatamiL = useMemo(() => pattern('tatami', [4, 10]), []);
  const tatamiB = useMemo(() => pattern('tatami', [4, 4]), []);
  return (
    <>
      <Lights
        sky="#fff0d8"
        ground="#b8956c"
        hemi={1.0}
        points={[
          [-3.5, 2.5, -0.6, '#ffc98a', 20],
          [3.5, 2.5, -3.0, '#fff0d0', 18],
          [3.5, 2.5, 1.8, '#ffd9a0', 16],
          [0, 2.5, 4.8, '#fff4e0', 14],
        ]}
      />
      <Room
        id="house"
        size={[W, D, H]}
        floor={{ kind: 'planks', color: '#ffffff', tint: '#b08158', scale: 1.5 }}
        wall={{ kind: 'wallpaper', color: '#ffffff', tint: '#f3e9d2', scale: 2 }}
        ceiling={{ kind: 'planks', color: '#ffffff', tint: '#d9b88a', scale: 1.5 }}
        trim="#6b4a33"
        door="lattice"
        windows={[
          { wall: 'n', at: -3.0, y: 1.7, w: 1.8, h: 1.3 },
          { wall: 'n', at: 3.5, y: 1.9, w: 1.0, h: 0.7 },
          { wall: 'e', at: 3.6, y: 1.7, w: 1.4, h: 1.2 },
          { wall: 's', at: 4.6, y: 1.7, w: 1.4, h: 1.2 },
        ]}
      >
        {/* floors */}
        <Box p={[-3.5, 0.015, -1.2]} s={[7, 0.03, 9.6]} m={std('#ffffff', { map: tatamiL, rough: 0.95 })} cast={false} />
        <Box p={[3.5, 0.015, 1.5]} s={[7, 0.03, 4.2]} m={std('#ffffff', { map: tatamiB, rough: 0.95 })} cast={false} />
        <Box p={[3.5, 0.01, -3.3]} s={[7, 0.02, 5.4]} m={std('#ffffff', { map: kitchenTile, rough: 0.6 })} cast={false} />
        <Box p={[0, 0.011, 5.15]} s={[8, 0.022, 1.7]} m={std('#a8a39a', { map: stone, rough: 0.9 })} cast={false} />
        <Box p={[0, 0.045, 4.15]} s={[8, 0.09, 0.3]} c={DARKWOOD} />
        <Box p={[0, 0.095, 4.15]} s={[8, 0.01, 0.3]} c="#7a5236" cast={false} />

        {/* ceiling beams and lamps */}
        {[-4.5, 0, 4.5].map((x) => (
          <Box key={x} p={[x, H - 0.07, 0]} s={[0.18, 0.14, D - 0.1]} c="#5a3a28" cast={false} />
        ))}
        <group position={[-3.4, 2.1, -0.6]}>
          <Cyl p={[0, 0.45, 0]} rad={0.008} h={0.9} c="#2a1c1c" cast={false} />
          <Sph p={[0, 0, 0]} s={[0.28, 0.2, 0.28]} m={glow('#fff6e0', '#ffd79a', 0.5, 1.8)} cast={false} />
        </group>
        <group position={[3.5, 2.2, -3.0]}>
          <Cyl p={[0, 0.4, 0]} rad={0.008} h={0.8} c="#2a1c1c" cast={false} />
          <Sph p={[0, 0, 0]} s={[0.25, 0.18, 0.25]} m={glow('#fff6e0', '#ffd79a', 0.5, 1.8)} cast={false} />
        </group>

        {/* partitions: fusuma wall (with a wide doorway) and shoji between kitchen and bedroom */}
        <Partition p={[0, 0, -3.75]} len={4.5} axis="x" kind="fusuma" />
        <Partition p={[0, 0, 2.55]} len={2.1} axis="x" kind="fusuma" />
        <Partition p={[4.6, 0, -0.6]} len={4.8} axis="z" kind="shoji" />
        <Interact words={['fusuma']} radius={1.8} h={2.3} p={[0.05, 0, -3.75]}>
          <Box p={[0.0, 1.0, 0.0]} s={[0.02, 0.01, 0.01]} c="#2a1810" cast={false} />
          <Box p={[0.07, 1.0, -0.4]} s={[0.03, 0.16, 0.05]} c="#2a1810" cast={false} />
          <Box p={[0.07, 1.0, 0.4]} s={[0.03, 0.16, 0.05]} c="#2a1810" cast={false} />
        </Interact>
        <Interact words={['shoji']} radius={1.8} h={2.3} p={[4.6, 0, -0.5]}>
          <Box p={[0, 1.0, 0.07]} s={[0.04, 0.16, 0.03]} c="#2a1810" cast={false} />
        </Interact>
        <Interact words={['room']} radius={1.4} h={2.7} p={[0, 0, 0]}>
          <Box p={[0, 2.25, 0]} s={[0.55, 0.22, 0.03]} c="#f7e6c4" r={[0, Math.PI / 2, 0]} />
          <Quad p={[0.02, 2.25, 0]} s={[0.5, 0.18]} map={signTexture('和室', { bg: '#f7e6c4', fg: '#4a2f20', w: 256, h: 96 })} r={[0, Math.PI / 2, 0]} />
        </Interact>

        {/* living room (tatami) */}
        <Interact words={['tatami']} radius={1.6} h={0.8} p={[-3.4, 0.03, 2.5]}>
          <Box p={[0, 0.002, 0]} s={[0.9, 0.004, 1.8]} c="#00000000" m={std('#d1c986', { rough: 1 })} cast={false} />
          <Box p={[0, 0.006, -0.88]} s={[0.9, 0.006, 0.04]} c="#3e5a3a" cast={false} />
          <Box p={[0, 0.006, 0.88]} s={[0.9, 0.006, 0.04]} c="#3e5a3a" cast={false} />
        </Interact>
        <Table p={[-3.4, 0, -0.6]} s={[1.4, 0.9]} h={0.4} top="#8a5a38" leg="#5a3a28" />
        <Interact words={['low_table']} radius={1.5} h={0.9} p={[-3.4, 0.4, -0.15]} />
        <Interact words={['kettle']} radius={1.5} h={0.8} p={[-4.2, 0.4, -0.7]}>
          <Kettle />
        </Interact>
        <Interact words={['teacup']} radius={1.5} h={0.7} p={[-2.6, 0.4, -0.7]}>
          <Teacups />
        </Interact>
        <Interact words={['cushion']} radius={1.5} h={0.7} p={[-3.4, 0.03, 0.75]}>
          <Cushion p={[0, 0, 0]} c="#f2a3b8" />
        </Interact>
        <Cushion p={[-3.4, 0.03, -1.55]} c="#8fc9e8" />
        <Cushion p={[-4.9, 0.03, -0.6]} c="#c9b3f0" r={[0, Math.PI / 2, 0]} />
        <Cushion p={[-1.9, 0.03, -0.6]} c="#f2d98a" r={[0, Math.PI / 2, 0]} />
        <Cushion p={[-4.5, 0.03, 2.5]} c="#9fd9b8" />

        <group position={[-6.7, 0, -2.4]}>
          <TvSet />
        </group>
        <group position={[-6.5, 0, 1.7]}>
          <Closet />
        </group>
        <Andon p={[-1.0, 0, -5.0]} />
        <group position={[-1.9, 0, -D / 2]}>
          <WallClock />
        </group>
        <group position={[-0.9, 0, -D / 2]}>
          <Calendar />
        </group>
        <WindowSpot p={[-3.0, 0, -D / 2]} />
        <Rugless />

        {/* tokonoma alcove */}
        <Box p={[-5.85, 0.08, -5.4]} s={[2.3, 0.16, 1.2]} c="#a67a50" />
        <Box p={[-4.68, 0.1, -5.4]} s={[0.06, 2.9, 1.2]} c="#5a3a28" cast={false} />
        <Box p={[-4.68, 2.0, -5.4]} s={[0.1, 0.1, 1.2]} c="#5a3a28" cast={false} />
        <group position={[-6.5, 0, -D / 2]}>
          <Scroll />
        </group>
        <Interact words={['vase']} radius={1.5} h={1.2} p={[-5.5, 0.16, -5.5]}>
          <Ikebana />
        </Interact>
        <Interact words={['bonsai']} radius={1.5} h={1.3} p={[-4.1, 0, -5.4]}>
          <Bonsai />
        </Interact>

        {/* bedroom corner */}
        <group position={[5.8, 0.03, 1.5]}>
          <Interact words={['futon']} radius={1.6} h={0.8} p={[0, 0, 0.35]}>
            <Futon />
          </Interact>
        </group>
        <Interact words={['pillow']} radius={1.5} h={0.7} p={[5.8, 0.12, 0.55]}>
          <Pillow />
        </Interact>
        <Interact words={['smartphone']} radius={1.5} h={0.5} p={[6.55, 0.03, 1.3]}>
          <Smartphone />
        </Interact>
        <Table p={[6.6, 0, 0.1]} s={[0.5, 0.4]} h={0.4} top="#c9a070" leg="#8a5a38" />
        <Interact words={['sleep']} radius={1.5} h={0.8} p={[6.6, 0.4, 0.1]}>
          <AlarmClock />
        </Interact>
        <Fan p={[3.6, 0, 0.3]} />
        <Mirror p={[6.85, 0, 3.2]} />
        <Table p={[2.4, 0, 3.0]} s={[1.0, 0.6]} h={0.7} top="#c9a070" leg="#8a5a38" />
        <Interact words={['computer']} radius={1.5} h={1.2} p={[2.4, 0.7, 3.0]}>
          <Laptop />
        </Interact>
        <Cushion p={[2.4, 0.03, 3.7]} c="#bfe3ff" />
        <group position={[W / 2, 0, 2.2]} rotation={[0, -Math.PI / 2, 0]}>
          <AirCon />
        </group>

        {/* kitchen */}
        <Kitchen />
        <TrashCan p={[6.5, 0, -1.4]} />
        <Table p={[3.4, 0, -3.0]} s={[1.0, 1.0]} h={0.72} top="#d9b88a" leg="#8a5a38" />
        <Plate p={[3.2, 0.72, -3.0]} c="#ffffff" rad={0.12} />
        <Mug p={[3.7, 0.72, -2.9]} c="#f2b5c6" />
        {[-1, 1].map((s) => (
          <Cushion key={s} p={[3.4 + s * 0.9, 0.03, -3.0]} c={s < 0 ? '#f2a3b8' : '#8fc9e8'} r={[0, Math.PI / 2, 0]} />
        ))}

        {/* hallway and genkan */}
        <GenkanSpot p={[-3.0, 0, 5.0]} />
        <Slippers p={[-2.0, 0.0, 3.8]} />
        <Box solid p={[-6.5, 0.45, 5.4]} s={[0.8, 0.9, 1.6]} c="#a67a50" />
        <Box p={[-6.1, 0.45, 5.4]} s={[0.01, 0.8, 1.5]} c="#8a5a38" cast={false} />
        <Door p={[-W / 2, 0, 4.0]} />
        <PhoneTable p={[4.5, 0, 3.9]} />
        <KeyBoard p={[2.0, 0, D / 2]} />
        <Broom p={[5.5, 0, 5.5]} />
        <Cleaning p={[6.4, 0, 4.6]} />
        <Plant p={[-6.3, 0, 3.4]} s={1.2} pot="#d98c6c" />
        <Poster p={[0.0, 2.3, D / 2 - 0.03]} r={[0, Math.PI, 0]} s={[0.6, 0.35]} text="ようこそ" bg="#fff3dc" fg="#b3261e" border="#d9b27a" />
      </Room>
    </>
  );
}

function Rugless() {
  return null;
}
