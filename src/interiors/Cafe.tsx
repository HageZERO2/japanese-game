import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Box, Cyl, Cone, Interact, Quad, Solid, Sph, type V3 } from '../world/parts';
import { glow, std } from '../world/materials';
import { signTexture } from '../world/textures';
import { Room, Lights, Pendant, Poster, Plant, Rug, Chair, Table, Steam, Plate, Mug } from './Room';

const W = 12;
const D = 10;
const H = 3.4;
const PINK = '#f2b5c6';
const WOOD = '#c99a63';
const CT = 1.0;

function Cup({ p, c = '#ffffff', fill = '#5a3a28', steam }: { p: V3; c?: string; fill?: string; steam?: boolean }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.008, 0]} rad={0.1} h={0.016} c={c} cast={false} />
      <Cyl p={[0, 0.05, 0]} rad={0.055} h={0.07} top={1.25} c={c} cast={false} />
      <Cyl p={[0, 0.082, 0]} rad={0.066} h={0.004} c={fill} cast={false} />
      <mesh position={[0.07, 0.055, 0]} scale={[0.025, 0.025, 0.01]} material={std(c)}>
        <torusGeometry args={[1, 0.3, 6, 12]} />
      </mesh>
      {steam && <Steam p={[0, 0.1, 0]} n={2} rise={0.25} />}
    </group>
  );
}

function Espresso() {
  const chrome = std('#c9ced6', { metal: 0.9, rough: 0.2 });
  return (
    <group>
      <Box p={[0, 0.03, 0]} s={[0.7, 0.06, 0.5]} c="#3a2a24" />
      <Box p={[0, 0.3, -0.05]} s={[0.66, 0.5, 0.4]} m={chrome} />
      <Box p={[0, 0.58, -0.05]} s={[0.7, 0.07, 0.44]} c="#b3261e" />
      <Box p={[0, 0.4, 0.17]} s={[0.5, 0.1, 0.04]} c="#2b2f36" cast={false} />
      {[-0.16, 0.16].map((x) => (
        <group key={x}>
          <Cyl p={[x, 0.33, 0.2]} rad={0.04} h={0.04} c="#2b2f36" cast={false} />
          <Cyl p={[x, 0.17, 0.2]} rad={0.01} h={0.06} m={chrome} cast={false} />
          <Box p={[x, 0.28, 0.27]} s={[0.025, 0.025, 0.14]} c="#2a1810" cast={false} />
        </group>
      ))}
      <Box p={[0, 0.06, 0.15]} s={[0.5, 0.01, 0.2]} m={chrome} cast={false} />
      <Cup p={[-0.12, 0.07, 0.2]} c="#fff4e6" />
      <Cyl p={[0.28, 0.28, -0.05]} rad={0.045} h={0.22} c="#d9483b" cast={false} />
      <Box p={[0.24, 0.5, 0.2]} s={[0.04, 0.04, 0.01]} m={glow('#9ff7b8', '#4be07a', 0.8, 1.2)} cast={false} />
      <Steam p={[0.0, 0.62, 0]} n={2} rise={0.25} />
    </group>
  );
}

function Latte() {
  return (
    <group>
      <Cup p={[0, 0, 0]} c="#fff4e6" fill="#c89b6d" steam />
      <Cyl p={[0, 0.087, 0]} rad={0.04} h={0.003} c="#fff8ee" cast={false} />
      <Cyl p={[0, 0.089, 0]} rad={0.022} h={0.003} c="#a8754a" cast={false} />
      <Cyl p={[0.2, 0.08, 0.05]} rad={0.04} h={0.16} top={1.1} m={std('#dfeef5', { rough: 0.05, transparent: true, opacity: 0.55 })} cast={false} />
      <Cyl p={[0.2, 0.06, 0.05]} rad={0.036} h={0.08} c="#c89b6d" cast={false} />
      <Cyl p={[0.2, 0.12, 0.05]} rad={0.036} h={0.04} c="#fff8ee" cast={false} />
    </group>
  );
}

function Matcha() {
  return (
    <group>
      <Cyl p={[0, 0.045, 0]} rad={0.075} h={0.09} top={1.3} c="#3d5a4a" />
      <Cyl p={[0, 0.086, 0]} rad={0.093} h={0.004} c="#7fb35e" cast={false} />
      <Cyl p={[0.2, 0.05, 0.05]} rad={0.012} h={0.1} c="#d9c27a" cast={false} />
      <Cone p={[0.2, 0.035, 0.05]} rad={0.035} h={0.07} c="#e8d9a0" cast={false} />
      <Box p={[-0.22, 0.01, 0]} s={[0.16, 0.02, 0.07]} c="#c9a070" cast={false} />
      <Cyl p={[-0.22, 0.03, 0]} rad={0.025} h={0.02} c="#e8f2d0" cast={false} />
    </group>
  );
}

function TeaSet() {
  return (
    <group>
      <Sph p={[0, 0.09, 0]} s={[0.1, 0.085, 0.1]} c="#fff4e6" />
      <Cyl p={[0, 0.17, 0]} rad={0.04} h={0.03} c="#fff4e6" cast={false} />
      <Sph p={[0, 0.2, 0]} s={0.014} c={PINK} cast={false} />
      <Cyl p={[0.12, 0.12, 0]} rad={0.012} h={0.1} r={[0, 0, -0.9]} c="#fff4e6" cast={false} />
      <Box p={[-0.12, 0.1, 0]} s={[0.03, 0.09, 0.015]} c="#fff4e6" cast={false} />
      <Cup p={[0.28, 0, 0.1]} c="#fff4e6" fill="#b8501f" steam />
    </group>
  );
}

function MugStack() {
  return (
    <group>
      <Mug p={[-0.1, 0, 0]} c="#f2b5c6" fill="#5a3a28" />
      <Mug p={[0.1, 0, 0.0]} c="#bfe3ff" fill="#5a3a28" />
      <Mug p={[0, 0.09, 0]} c="#fff4e6" fill="#5a3a28" />
    </group>
  );
}

function Cake({ p, top = '#fff4e6', sponge = '#f7d6a8', berry = true }: { p: V3; top?: string; sponge?: string; berry?: boolean }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.03, 0]} rad={0.15} h={0.06} c={sponge} cast={false} />
      <Cyl p={[0, 0.065, 0]} rad={0.15} h={0.02} c="#fffaf0" cast={false} />
      <Cyl p={[0, 0.095, 0]} rad={0.15} h={0.04} c={sponge} cast={false} />
      <Cyl p={[0, 0.12, 0]} rad={0.152} h={0.012} c={top} cast={false} />
      {berry && [0, 1, 2, 3, 4].map((i) => <Sph key={i} p={[Math.cos(i * 1.256) * 0.09, 0.14, Math.sin(i * 1.256) * 0.09]} s={[0.026, 0.03, 0.026]} c="#e5333f" lo />)}
    </group>
  );
}

function DessertCase() {
  const glass = std('#cfe8f2', { rough: 0.05, metal: 0.3, transparent: true, opacity: 0.22 });
  return (
    <group position={[2.8, 0, -3.0]}>
      <Box solid p={[0, 0.42, 0]} s={[3.2, 0.84, 0.8]} c={PINK} />
      <Box p={[0, 0.5, 0.405]} s={[3.1, 0.6, 0.01]} c="#fff4e6" cast={false} />
      <Box p={[0, 0.88, 0]} s={[3.24, 0.06, 0.84]} c="#fff8ee" />
      <Box p={[0, 1.18, -0.38]} s={[3.1, 0.2, 0.03]} m={glow('#fff6e0', '#ffe3a8', 0.8, 1.4)} cast={false} />
      <Box p={[0, 1.26, 0.0]} s={[3.1, 0.02, 0.72]} m={glass} cast={false} />
      <Box p={[0, 1.28, 0.36]} s={[3.1, 0.02, 0.02]} c="#fff8ee" cast={false} />
      {[-1.45, 1.45].map((x) => (
        <Box key={x} p={[x, 1.08, 0.0]} s={[0.04, 0.4, 0.74]} m={glass} cast={false} />
      ))}
      <Interact words={['cake']} radius={1.7} h={1.55} p={[-0.9, 0.9, 0.0]}>
        <Box p={[0, 0.0, 0]} s={[0.9, 0.02, 0.5]} c="#fff8ee" cast={false} />
        <Cake p={[-0.25, 0.01, 0]} berry />
        <Cake p={[0.25, 0.01, 0]} top="#f7a8c0" sponge="#e8c48b" berry={false} />
        <Cake p={[0, 0.01, 0.2]} top="#8a5a38" sponge="#6b4226" berry={false} />
      </Interact>
      <Solid p={[0, 0.5, 0]} s={[3.2, 1.0, 0.8]} />
    </group>
  );
}

function Parfait() {
  return (
    <group>
      <Cyl p={[0, 0.12, 0]} rad={0.05} h={0.24} top={1.25} m={std('#dfeef5', { rough: 0.05, transparent: true, opacity: 0.5 })} />
      <Cyl p={[0, 0.05, 0]} rad={0.045} h={0.08} c="#f2a3b8" cast={false} />
      <Cyl p={[0, 0.115, 0]} rad={0.05} h={0.05} c="#fff8ee" cast={false} />
      <Cyl p={[0, 0.16, 0]} rad={0.056} h={0.04} c="#e8c48b" cast={false} />
      <Sph p={[0, 0.25, 0]} s={[0.06, 0.05, 0.06]} c="#ffffff" lo />
      <Sph p={[0.02, 0.3, 0]} s={0.025} c="#e5333f" lo />
      <Box p={[-0.04, 0.3, 0]} s={[0.012, 0.1, 0.05]} c="#e8c48b" r={[0, 0, 0.4]} cast={false} />
    </group>
  );
}

function Pudding() {
  return (
    <group>
      <Plate p={[0, 0, 0]} c="#ffffff" rad={0.13} />
      <Cyl p={[0, 0.06, 0]} rad={0.08} h={0.09} top={0.75} c="#f7d46b" />
      <Cyl p={[0, 0.108, 0]} rad={0.062} h={0.014} c="#8a4a1f" cast={false} />
      <Sph p={[0, 0.13, 0]} s={0.022} c="#e5333f" lo />
      <Sph p={[0.05, 0.02, 0.07]} s={[0.03, 0.01, 0.03]} c="#fff8ee" lo />
    </group>
  );
}

function Cookies() {
  return (
    <group>
      <Plate p={[0, 0, 0]} c="#fff4e6" rad={0.16} />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[Math.cos(i * 1.57 + 0.5) * 0.07, 0.025 + (i === 3 ? 0.02 : 0), Math.sin(i * 1.57 + 0.5) * 0.07]}>
          <Cyl p={[0, 0, 0]} rad={0.05} h={0.02} c="#d09a5a" cast={false} />
          <Sph p={[0.015, 0.012, 0.01]} s={0.008} c="#4a2a1a" cast={false} />
          <Sph p={[-0.015, 0.012, -0.01]} s={0.008} c="#4a2a1a" cast={false} />
        </group>
      ))}
    </group>
  );
}

function Sandwich() {
  return (
    <group>
      <Box p={[0, 0.01, 0]} s={[0.36, 0.02, 0.26]} c="#ffffff" />
      {[0, 1].map((i) => (
        <group key={i} position={[-0.08 + i * 0.16, 0.07, 0]} rotation={[0, i * 0.4, 0]}>
          <Box p={[0, -0.03, 0]} s={[0.14, 0.03, 0.14]} c="#f3deb0" cast={false} />
          <Box p={[0, -0.005, 0]} s={[0.145, 0.015, 0.145]} c="#7fc272" cast={false} />
          <Box p={[0, 0.01, 0]} s={[0.14, 0.015, 0.14]} c="#e5584f" cast={false} />
          <Box p={[0, 0.03, 0]} s={[0.14, 0.03, 0.14]} c="#f3deb0" cast={false} />
        </group>
      ))}
    </group>
  );
}

function StrawberryBasket() {
  return (
    <group>
      <Box p={[0, 0.05, 0]} s={[0.3, 0.1, 0.22]} c="#c9a070" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Sph key={i} p={[(i % 4 - 1.5) * 0.07, 0.12, (Math.floor(i / 4) - 0.5) * 0.09]} s={[0.034, 0.04, 0.034]} c="#e5333f" lo />
      ))}
      {[0, 1, 2].map((i) => (
        <Sph key={i} p={[(i - 1) * 0.08, 0.15, 0.0]} s={[0.014, 0.008, 0.014]} c="#4f9d5a" lo />
      ))}
    </group>
  );
}

function Pancakes() {
  return (
    <group>
      <Plate p={[0, 0, 0]} c="#ffffff" rad={0.17} />
      {[0, 1, 2].map((i) => (
        <Cyl key={i} p={[0, 0.03 + i * 0.03, 0]} rad={0.12} h={0.028} c={i === 2 ? '#d9a35a' : '#e8b872'} cast={false} />
      ))}
      <Box p={[0, 0.115, 0]} s={[0.05, 0.025, 0.05]} c="#fff1a6" cast={false} />
      <Cyl p={[0, 0.105, 0]} rad={0.07} h={0.006} c="#b8601f" cast={false} />
      <Sph p={[0.08, 0.1, 0.05]} s={0.022} c="#e5333f" lo />
    </group>
  );
}

function Cutlery() {
  const steel = std('#d9dee2', { metal: 0.8, rough: 0.25 });
  return (
    <group>
      <Box p={[0, 0.005, 0]} s={[0.36, 0.01, 0.22]} c="#fff4e6" />
      <Box p={[0, 0.013, 0]} s={[0.1, 0.008, 0.2]} c="#fff4e6" cast={false} />
      <Box p={[-0.05, 0.018, 0]} s={[0.018, 0.006, 0.18]} m={steel} cast={false} />
      {[-0.012, -0.004, 0.004, 0.012].map((x) => (
        <Box key={x} p={[-0.05 + x, 0.018, -0.1]} s={[0.003, 0.004, 0.06]} m={steel} cast={false} />
      ))}
      <Box p={[0.11, 0.018, 0]} s={[0.02, 0.006, 0.18]} m={steel} cast={false} />
    </group>
  );
}

function SpoonSpot() {
  const steel = std('#d9dee2', { metal: 0.8, rough: 0.25 });
  return (
    <group>
      <Cyl p={[0, 0.008, 0]} rad={0.09} h={0.016} c="#ffffff" cast={false} />
      <Box p={[0, 0.022, 0.0]} s={[0.014, 0.006, 0.16]} m={steel} r={[0, 0.5, 0]} cast={false} />
      <Sph p={[-0.04, 0.024, -0.07]} s={[0.026, 0.008, 0.034]} m={steel} r={[0, 0.5, 0]} cast={false} />
    </group>
  );
}

function SugarPot() {
  return (
    <group>
      <Cyl p={[0, 0.05, 0]} rad={0.06} h={0.1} m={std('#ffffff', { rough: 0.15 })} />
      <Cyl p={[0, 0.105, 0]} rad={0.065} h={0.02} c={PINK} cast={false} />
      <Sph p={[0, 0.125, 0]} s={0.015} c={PINK} cast={false} />
      {[0, 1, 2].map((i) => (
        <Box key={i} p={[0.14 + i * 0.002, 0.012 + i * 0.024, 0.0]} s={[0.04, 0.022, 0.04]} c="#ffffff" r={[0, i * 0.4, 0]} cast={false} />
      ))}
    </group>
  );
}

function NapkinHolder() {
  return (
    <group>
      <Box p={[0, 0.07, 0]} s={[0.14, 0.14, 0.05]} c={PINK} />
      <Box p={[0, 0.17, 0]} s={[0.12, 0.08, 0.004]} c="#ffffff" r={[0.2, 0, 0.2]} cast={false} />
      <Box p={[0.01, 0.16, 0.01]} s={[0.12, 0.08, 0.004]} c="#fff1e6" r={[0.1, 0.2, -0.1]} cast={false} />
    </group>
  );
}

function IcedDrink() {
  return (
    <group>
      <Cyl p={[0, 0.001, 0]} rad={0.07} h={0.004} c="#e0b88a" cast={false} />
      <Cyl p={[0, 0.095, 0]} rad={0.05} h={0.19} top={1.15} m={std('#dfeef5', { rough: 0.05, transparent: true, opacity: 0.5 })} />
      <Cyl p={[0, 0.07, 0]} rad={0.046} h={0.13} c="#7a4a2a" cast={false} />
      {[0, 1].map((i) => (
        <Box key={i} p={[-0.02 + i * 0.04, 0.14, 0.01]} s={[0.03, 0.03, 0.03]} m={std('#f4fbff', { transparent: true, opacity: 0.7 })} r={[0.3, i, 0.2]} cast={false} />
      ))}
      <Cyl p={[0.015, 0.16, 0]} rad={0.005} h={0.26} r={[0, 0, -0.12]} c="#f2b5c6" cast={false} />
    </group>
  );
}

function ChalkBoard() {
  const rows: [string, string][] = [
    ['メニュー', '#fff4e6'],
    ['コーヒー  400円', '#cfe8ff'],
    ['ケーキ  500円', '#ffd1dc'],
    ['パンケーキ  700円', '#fff1a6'],
    ['まっちゃ  450円', '#c8f0c0'],
  ];
  return (
    <Interact words={['blackboard']} radius={2.0} h={2.7} p={[0, 0, 0]}>
      <Box p={[0, 1.7, 0.03]} s={[1.5, 1.4, 0.05]} c="#8a5a38" />
      <Box p={[0, 1.7, 0.058]} s={[1.4, 1.3, 0.01]} c="#2f4a3f" cast={false} />
      {rows.map(([t, fg], i) => (
        <Quad key={t} p={[0, 2.18 - i * 0.24, 0.07]} s={[i === 0 ? 0.8 : 1.25, i === 0 ? 0.24 : 0.2]} map={signTexture(t, { bg: '#2f4a3f', fg, w: 512, h: 96, weight: 600 })} />
      ))}
      <Box p={[0, 1.02, 0.08]} s={[1.4, 0.03, 0.06]} c="#8a5a38" cast={false} />
      <Box p={[-0.3, 1.045, 0.1]} s={[0.1, 0.012, 0.02]} c="#ffffff" cast={false} />
    </Interact>
  );
}

function Sofa() {
  return (
    <Interact words={['sofa']} radius={1.8} h={1.4} p={[0, 0, 0]}>
      <Box p={[0, 0.2, 0]} s={[2.2, 0.4, 0.9]} c={PINK} />
      <Box p={[0, 0.65, -0.35]} s={[2.2, 0.6, 0.2]} c={PINK} />
      {[-1.05, 1.05].map((x) => (
        <Box key={x} p={[x, 0.4, 0]} s={[0.2, 0.7, 0.9]} c="#e89db3" />
      ))}
      {[-0.5, 0.5].map((x) => (
        <Box key={x} p={[x, 0.46, 0.05]} s={[0.9, 0.12, 0.7]} c="#f8c6d3" cast={false} />
      ))}
      <Box p={[-0.75, 0.7, -0.15]} s={[0.4, 0.4, 0.12]} c="#bfe3ff" r={[-0.2, 0.3, 0.1]} cast={false} />
      <Box p={[0.75, 0.7, -0.15]} s={[0.4, 0.4, 0.12]} c="#fff1a6" r={[-0.2, -0.3, -0.1]} cast={false} />
      {[-1, 1].flatMap((a) => [-1, 1].map((b) => <Cyl key={`${a}${b}`} p={[a * 1.0, 0.03, b * 0.4]} rad={0.04} h={0.06} c="#6b4a33" cast={false} />))}
      <Solid p={[0, 0.5, 0]} s={[2.2, 1.0, 0.9]} />
    </Interact>
  );
}

function Piano() {
  const keys = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);
  return (
    <Interact words={['piano']} radius={1.8} h={1.8} p={[0, 0, 0]}>
      <Box p={[0, 0.65, -0.2]} s={[1.5, 1.3, 0.4]} m={std('#1c1a1f', { rough: 0.25, metal: 0.1, env: 1.2 })} />
      <Box p={[0, 0.7, 0.05]} s={[1.5, 0.08, 0.16]} m={std('#1c1a1f', { rough: 0.25 })} />
      <Box p={[0, 0.76, 0.1]} s={[1.3, 0.025, 0.14]} c="#fffdf5" cast={false} />
      {keys.map((i) => (
        <Box key={i} p={[-0.6 + i * 0.0925, 0.775, 0.06]} s={[0.012, 0.012, 0.08]} c="#1c1a1f" cast={false} />
      ))}
      <Box p={[0, 1.0, 0.0]} s={[1.3, 0.2, 0.02]} c="#2a272e" cast={false} />
      <Box p={[0, 1.05, -0.0]} s={[0.5, 0.15, 0.005]} c="#fff4e6" cast={false} />
      {[-0.7, 0.7].map((x) => (
        <Box key={x} p={[x, 0.3, 0.05]} s={[0.06, 0.6, 0.06]} c="#1c1a1f" cast={false} />
      ))}
      <Box p={[0, 0.25, 0.5]} s={[0.8, 0.06, 0.3]} c="#6b3e26" />
      {[-0.35, 0.35].map((x) => (
        <Box key={x} p={[x, 0.11, 0.5]} s={[0.05, 0.22, 0.05]} c="#4a2a1a" cast={false} />
      ))}
      <Solid p={[0, 0.65, -0.1]} s={[1.5, 1.3, 0.6]} />
    </Interact>
  );
}

function RecordPlayer() {
  const disc = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (disc.current) disc.current.rotation.y += dt * 3.5;
  });
  return (
    <Interact words={['music']} radius={1.6} h={1.5} p={[0, 0, 0]}>
      <Box solid p={[0, 0.35, 0]} s={[0.6, 0.7, 1.6]} c={WOOD} />
      <Box p={[0.18, 0.35, 0]} s={[0.01, 0.5, 1.4]} c="#a67a50" cast={false} />
      <Box p={[0, 0.76, 0]} s={[0.5, 0.1, 0.7]} c="#3a2a24" />
      <group ref={disc} position={[0, 0.83, -0.0]}>
        <Cyl p={[0, 0, 0]} rad={0.22} h={0.012} c="#15151a" />
        <Cyl p={[0, 0.008, 0]} rad={0.07} h={0.004} c="#e5584f" cast={false} />
        <Box p={[0.1, 0.008, 0.0]} s={[0.1, 0.002, 0.003]} c="#2a2a30" cast={false} />
      </group>
      <Box p={[-0.2, 0.85, -0.22]} s={[0.012, 0.012, 0.3]} c="#c9ced6" r={[0, 0.4, 0]} cast={false} />
      <Cyl p={[-0.2, 0.82, -0.3]} rad={0.025} h={0.06} c="#c9ced6" cast={false} />
      {[-0.55, 0.55].map((z) => (
        <Box key={z} p={[0, 1.1, z]} s={[0.3, 0.45, 0.26]} c="#4a2f20" />
      ))}
      <Box p={[0.01, 0.82, 0.55]} s={[0.3, 0.02, 0.26]} c="#4a2f20" cast={false} />
    </Interact>
  );
}

function FloorLamp() {
  return (
    <Interact words={['lighting']} radius={1.5} h={2.0} p={[0, 0, 0]}>
      <Cyl p={[0, 0.02, 0]} rad={0.16} h={0.04} c="#6b4a33" />
      <Cyl p={[0, 0.75, 0]} rad={0.015} h={1.5} c="#6b4a33" cast={false} />
      <Cyl p={[0, 1.6, 0]} rad={0.22} h={0.3} top={0.65} m={glow('#fff0d0', '#ffcf8a', 0.7, 1.5)} cast={false} />
      <Solid p={[0, 0.8, 0]} s={[0.35, 1.6, 0.35]} />
    </Interact>
  );
}

function CafeTable({ p, round = false }: { p: V3; round?: boolean }) {
  return round ? (
    <group position={p}>
      <Cyl p={[0, 0.72, 0]} rad={0.5} h={0.04} c="#fff4e6" />
      <Cyl p={[0, 0.36, 0]} rad={0.04} h={0.72} c="#6b4a33" cast={false} />
      <Cyl p={[0, 0.02, 0]} rad={0.25} h={0.04} c="#6b4a33" cast={false} />
      <Solid p={[0, 0.4, 0]} s={[0.9, 0.8, 0.9]} />
    </group>
  ) : (
    <Table p={p} s={[1.4, 0.8]} h={0.74} top="#fff4e6" leg="#8a5a38" />
  );
}

function TableSet({ x, z, flip }: { x: number; z: number; flip?: boolean }) {
  return (
    <group>
      {[-0.45, 0.45].map((dx) => (
        <group key={dx}>
          <Chair p={[x + dx, 0, z - 0.75]} c="#a67a50" seat={flip ? '#bfe3ff' : PINK} />
          <Chair p={[x + dx, 0, z + 0.75]} r={[0, Math.PI, 0]} c="#a67a50" seat={flip ? '#bfe3ff' : PINK} />
        </group>
      ))}
    </group>
  );
}

export function CafeInterior() {
  const lampXZ: [number, number][] = [
    [-2.0, 0.6],
    [2.0, 0.6],
    [2.0, 3.0],
    [-2.0, 3.0],
  ];
  return (
    <>
      <Lights
        sky="#fff3ea"
        ground="#e8c9b0"
        hemi={1.1}
        points={[
          [-3, 2.8, -2, '#ffd9b0', 18],
          [3, 2.8, -1, '#ffd9b0', 18],
          [-1, 2.6, 2.5, '#ffe9cc', 18],
          [2.5, 2.6, 3.0, '#ffe9cc', 14],
        ]}
      />
      <Room
        id="cafe"
        size={[W, D, H]}
        floor={{ kind: 'planks', color: '#ffffff', tint: '#d9b58a', scale: 1.5 }}
        wall={{ kind: 'wallpaper', color: '#ffffff', tint: '#fbe3e8', scale: 2 }}
        ceiling={{ color: '#fff7ee' }}
        trim="#fff4e6"
        wainscot={{ color: '#fff4e6', h: 0.9 }}
        door="wood"
        windows={[
          { wall: 's', at: -3.5, y: 1.9, w: 2.2, h: 1.5 },
          { wall: 's', at: 3.5, y: 1.9, w: 2.2, h: 1.5 },
          { wall: 'e', at: 2.2, y: 1.9, w: 1.6, h: 1.3 },
          { wall: 'w', at: 4.0, y: 1.9, w: 1.4, h: 1.3 },
        ]}
      >
        {[-3, 0, 3].map((x) => (
          <Box key={x} p={[x, H - 0.1, 0]} s={[0.2, 0.2, D - 0.1]} c="#e8cfae" cast={false} />
        ))}
        {lampXZ.map(([x, z]) => (
          <Pendant key={`${x}${z}`} p={[x, H - 0.1, z]} len={0.8} c={PINK} />
        ))}
        {[-3.5, -1.0, 1.4].map((x) => (
          <Pendant key={x} p={[x, H - 0.1, -3.0]} len={0.9} c="#ffe0a8" rad={0.18} />
        ))}

        {/* counter run: barista side behind */}
        <Box solid p={[-2.4, 0.5, -3.0]} s={[7.2, 1.0, 0.8]} c={PINK} />
        <Box p={[-2.4, 0.5, -2.595]} s={[7.2, 0.9, 0.01]} c="#fff4e6" cast={false} />
        {[-5.4, -3.9, -2.4, -0.9, 0.6].map((x) => (
          <Box key={x} p={[x, 0.5, -2.59]} s={[1.3, 0.7, 0.01]} c="#f7c9d6" cast={false} />
        ))}
        <Box p={[-2.4, 1.01, -3.0]} s={[7.3, 0.05, 0.9]} c="#8a5a38" />
        <Box solid p={[5.2, 0.7, -3.8]} s={[1.6, 1.4, 2.4]} c="#fff4e6" />
        <Box p={[5.2, 0.4, -2.595]} s={[1.5, 0.6, 0.01]} c={PINK} cast={false} />
        <Box p={[5.2, 1.42, -3.8]} s={[1.65, 0.05, 2.45]} c="#8a5a38" />

        <Interact words={['coffee_machine']} radius={1.7} h={1.9} p={[-5.0, CT, -3.0]}>
          <Espresso />
        </Interact>
        <Interact words={['coffee']} radius={1.6} h={0.6} p={[-4.0, CT, -2.9]}>
          <Cup p={[0, 0, 0]} steam />
        </Interact>
        <Interact words={['latte']} radius={1.6} h={0.6} p={[-3.0, CT, -2.9]}>
          <Latte />
        </Interact>
        <Interact words={['matcha']} radius={1.6} h={0.6} p={[-2.0, CT, -2.9]}>
          <Matcha />
        </Interact>
        <Interact words={['mug']} radius={1.6} h={0.6} p={[-1.0, CT, -2.9]}>
          <MugStack />
        </Interact>
        <Interact words={['black_tea']} radius={1.6} h={0.6} p={[0.7, CT, -2.9]}>
          <TeaSet />
        </Interact>

        <DessertCase />
        <Interact words={['parfait']} radius={1.5} h={0.8} p={[2.6, 0.91, -3.0]}>
          <Parfait />
        </Interact>
        <Interact words={['pudding']} radius={1.5} h={0.7} p={[3.4, 0.91, -2.9]}>
          <Pudding />
        </Interact>
        <Interact words={['cookie']} radius={1.5} h={0.6} p={[4.1, 0.91, -2.9]}>
          <Cookies />
        </Interact>
        <Interact words={['sandwich']} radius={1.5} h={0.7} p={[4.95, 1.45, -3.0]}>
          <Sandwich />
        </Interact>
        <Interact words={['strawberry']} radius={1.5} h={0.7} p={[5.75, 1.45, -3.0]}>
          <StrawberryBasket />
        </Interact>

        {/* back wall shelves */}
        {[1.5, 2.1].map((y) => (
          <Box key={y} p={[-2.5, y, -D / 2 + 0.15]} s={[5.4, 0.04, 0.3]} c="#8a5a38" cast={false} />
        ))}
        {[-4.8, -4.0, -3.2, -2.4, -1.6, -0.8, 0].map((x, i) => (
          <Mug key={x} p={[x, 1.52, -D / 2 + 0.15]} c={['#f2b5c6', '#bfe3ff', '#fff4e6', '#f2d98a'][i % 4]} />
        ))}
        {[-4.6, -3.4, -2.2, -1.0].map((x, i) => (
          <Cyl key={x} p={[x, 2.28, -D / 2 + 0.15]} rad={0.1} h={0.24} c={['#c8f0c0', '#fff1a6', '#ffd1dc', '#e8d9c0'][i]} m={std(['#c8f0c0', '#fff1a6', '#ffd1dc', '#e8d9c0'][i], { rough: 0.15, transparent: true, opacity: 0.85 })} cast={false} />
        ))}
        <Poster p={[3.5, 2.5, -D / 2 + 0.03]} s={[1.0, 0.5]} text="カフェ・さくら" bg="#fff4e6" fg="#c45079" border={PINK} glowing />
        <Poster p={[-5.0, 2.65, -D / 2 + 0.03]} s={[0.5, 0.4]} text="本日の" sub="SPECIAL" bg="#fff1a6" fg="#8a5a38" border="#d9b27a" />

        {/* sofa corner */}
        <group position={[-5.5, 0, 2.5]} rotation={[0, Math.PI / 2, 0]}>
          <Sofa />
        </group>
        <Table p={[-3.6, 0, 2.5]} s={[0.9, 0.6]} h={0.4} top="#c99a63" leg="#8a5a38" />
        <Mug p={[-3.6, 0.4, 2.5]} c="#bfe3ff" />
        <Rug p={[-4.4, 0, 2.5]} s={[3.6, 2.8]} c="#f7a8c0" c2="#fff1e6" />
        <group position={[-5.5, 0, 0.5]}>
          <FloorLamp />
        </group>
        <group position={[-W / 2, 0, -1.0]} rotation={[0, Math.PI / 2, 0]}>
          <ChalkBoard />
        </group>
        <Plant p={[-5.4, 0, 4.3]} s={1.4} pot="#f2b5c6" />

        {/* tables */}
        <CafeTable p={[-2.0, 0, 0.6]} />
        <TableSet x={-2.0} z={0.6} />
        <Interact words={['pancake']} radius={1.5} h={0.8} p={[-2.45, 0.74, 0.6]}>
          <Pancakes />
        </Interact>
        <Interact words={['fork']} radius={1.5} h={0.5} p={[-1.55, 0.74, 0.6]}>
          <Cutlery />
        </Interact>

        <CafeTable p={[2.0, 0, 0.6]} />
        <TableSet x={2.0} z={0.6} flip />
        <Interact words={['sugar']} radius={1.5} h={0.6} p={[1.55, 0.74, 0.6]}>
          <SugarPot />
        </Interact>
        <Interact words={['napkin']} radius={1.5} h={0.6} p={[2.45, 0.74, 0.6]}>
          <NapkinHolder />
        </Interact>

        <CafeTable p={[2.2, 0, 3.0]} />
        <TableSet x={2.2} z={3.0} />
        <Interact words={['spoon']} radius={1.3} h={0.5} p={[1.75, 0.74, 3.0]}>
          <SpoonSpot />
        </Interact>
        <Interact words={['drink_verb']} radius={1.3} h={0.8} p={[2.65, 0.74, 3.0]}>
          <IcedDrink />
        </Interact>

        <CafeTable p={[-2.2, 0, 3.4]} round />
        <Chair p={[-2.2, 0, 2.6]} c="#a67a50" seat="#bfe3ff" />
        <Chair p={[-2.2, 0, 4.2]} r={[0, Math.PI, 0]} c="#a67a50" seat="#bfe3ff" />
        <Plate p={[-2.2, 0.74, 3.4]} c="#ffffff" rad={0.12} />
        <Cup p={[-2.4, 0.74, 3.4]} c="#fff4e6" />

        {/* east wall: piano and record player */}
        <group position={[W / 2 - 0.4, 0, 0.0]} rotation={[0, -Math.PI / 2, 0]}>
          <Piano />
        </group>
        <group position={[W / 2 - 0.3, 0, 3.4]} rotation={[0, Math.PI, 0]}>
          <RecordPlayer />
        </group>
        <Rug p={[4.6, 0, 0.9]} s={[2.4, 2.0]} c="#bfe3ff" c2="#fff1e6" />
      </Room>
    </>
  );
}
