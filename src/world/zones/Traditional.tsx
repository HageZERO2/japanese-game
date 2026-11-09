import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Interact, Box, Cyl, Sph, Quad, Solid, G } from '../parts';
import { std, toon, M, basic } from '../materials';
import { pattern, signTexture, rng } from '../textures';
import { POND, BRIDGE, ROCK_GARDEN, SHRINE_PLATFORM } from '../layout';
import { Torii, StoneLantern, SakuraTree, PineTree, Rock, Bush, PaperLantern } from '../Props';
import { KoiSchool, Butterfly, Frog, Bird } from '../../game/Animals';

const red = () => std('#d8422f', { rough: 0.55 });
const wood = () => std('#8a5a3c', { map: pattern('wood', [1, 1], '#8a5a3c') });
const darkRoof = () => std('#ffffff', { map: pattern('roof', [3, 2], '#3d3a42'), rough: 0.7 });

function Pond() {
  const { x, z, rx, rz } = POND;
  const rocks = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 34 }, (_, i) => {
      const a = (i / 34) * Math.PI * 2;
      return { x: x + Math.cos(a) * (rx + 0.3), z: z + Math.sin(a) * (rz + 0.3), s: 0.35 + r() * 0.35 };
    }).filter((p) => !(Math.abs(p.z - BRIDGE.z) < 1.8));
  }, [x, z, rx, rz]);
  const water = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (water.current) water.current.position.y = 0.06 + Math.sin(clock.elapsedTime * 0.8) * 0.01;
  });
  return (
    <group>
      <mesh ref={water} userData={{ noMerge: true }} geometry={G.cyl(40)} material={M.water()} position={[x, 0.06, z]} scale={[rx, 0.02, rz]} receiveShadow />
      <mesh geometry={G.cyl(40)} material={std('#3f6f63')} position={[x, 0.0, z]} scale={[rx + 0.2, 0.06, rz + 0.2]} />
      {rocks.map((p, i) => (
        <Sph key={i} p={[p.x, 0.08, p.z]} s={[p.s, p.s * 0.5, p.s]} c={i % 2 ? '#a19c92' : '#8e8a82'} lo />
      ))}
      {/* lily pads */}
      {[
        [x - 4, z + 3],
        [x + 3, z - 3.5],
        [x + 6, z + 2],
        [x - 6.5, z - 2.5],
      ].map(([lx, lz], i) => (
        <mesh key={i} geometry={G.cyl(12)} material={toon('#6fbf6a')} position={[lx, 0.09, lz]} scale={[0.45, 0.01, 0.45]} />
      ))}
      <Sph p={[x + 6, 0.14, z + 2]} s={0.12} m={toon('#ffc4d8')} />
      <KoiSchool center={[x, 0.02, z]} rx={rx} rz={rz} count={8} />
      {/* colliders: water on either side of the bridge corridor */}
      <Solid p={[x, 0.6, z - (rz + BRIDGE.halfWidth) / 2]} s={[rx * 1.75, 1.2, rz - BRIDGE.halfWidth]} />
      <Solid p={[x, 0.6, z + (rz + BRIDGE.halfWidth) / 2]} s={[rx * 1.75, 1.2, rz - BRIDGE.halfWidth]} />
      <Interact words={['pond', 'water']} p={[x + 3, 0, z + rz + 1.2]} radius={2.4} h={0.6}>
        <group />
      </Interact>
      <Interact words={['koi', 'fish']} p={[x - 3, 0, z + rz + 1.2]} radius={2.4} h={0.6}>
        <group />
      </Interact>
    </group>
  );
}

function Bridge() {
  const { x0, x1, z, halfWidth, rise } = BRIDGE;
  const n = 14;
  const segs = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const t0 = i / n;
        const t1 = (i + 1) / n;
        const xa = x0 + (x1 - x0) * t0;
        const xb = x0 + (x1 - x0) * t1;
        const ya = Math.sin(t0 * Math.PI) * rise;
        const yb = Math.sin(t1 * Math.PI) * rise;
        return { x: (xa + xb) / 2, y: (ya + yb) / 2, len: Math.hypot(xb - xa, yb - ya), ang: Math.atan2(yb - ya, xb - xa) };
      }),
    [x0, x1, rise],
  );
  return (
    <group>
      <Interact words={['bridge']} p={[x0 + 2.6, 0, z]} radius={2.2} h={1.4}>
        <group />
      </Interact>
      {segs.map((s, i) => (
        <group key={i} position={[s.x, s.y, z]} rotation={[0, 0, s.ang]}>
          <Box p={[0, -0.05, 0]} s={[s.len + 0.03, 0.12, halfWidth * 2]} m={wood()} />
          {[-1, 1].map((side) => (
            <group key={side}>
              <Box p={[0, 0.85, side * halfWidth]} s={[s.len + 0.02, 0.08, 0.1]} m={red()} cast={false} />
              {i % 2 === 0 && <Box p={[-s.len / 2, 0.42, side * halfWidth]} s={[0.12, 0.85, 0.12]} m={red()} />}
            </group>
          ))}
        </group>
      ))}
      {[-1, 1].map((side) => (
        <Solid key={side} p={[(x0 + x1) / 2, 1.5, z + side * (halfWidth + 0.12)]} s={[x1 - x0 - 0.6, 3, 0.2]} />
      ))}
    </group>
  );
}

function Stream() {
  return (
    <group>
      <mesh geometry={G.box} material={M.water()} position={[POND.x, 0.05, -60]} scale={[2.2, 0.04, 18]} />
      <mesh geometry={G.box} material={std('#3f6f63')} position={[POND.x, 0.0, -60]} scale={[2.6, 0.05, 18]} />
      {Array.from({ length: 10 }, (_, i) => (
        <group key={i}>
          <Sph p={[POND.x - 1.4, 0.1, -68 + i * 1.8]} s={[0.35, 0.18, 0.3]} c="#9a958c" lo />
          <Sph p={[POND.x + 1.4, 0.1, -67 + i * 1.8]} s={[0.3, 0.16, 0.35]} c="#8e8a82" lo />
        </group>
      ))}
      <Solid p={[POND.x, 0.6, -60]} s={[2.4, 1.2, 18]} />
      <Interact words={['river']} p={[POND.x + 2.2, 0, -58]} radius={2.2} h={0.6}>
        <group />
      </Interact>
    </group>
  );
}

function RockGarden() {
  const g = ROCK_GARDEN;
  const cx = (g.x0 + g.x1) / 2;
  const cz = (g.z0 + g.z1) / 2;
  const w = g.x1 - g.x0;
  const d = g.z1 - g.z0;
  const sand = useMemo(() => std('#ffffff', { map: pattern('sand', [w / 2.5, d / 2.5]), rough: 1 }), [w, d]);
  return (
    <group>
      <mesh geometry={G.box} material={sand} position={[cx, 0.06, cz]} scale={[w, 0.12, d]} receiveShadow />
      <Box p={[cx, 0.12, g.z1 + 0.1]} s={[w + 0.4, 0.24, 0.2]} m={wood()} />
      <Box p={[cx, 0.12, g.z0 - 0.1]} s={[w + 0.4, 0.24, 0.2]} m={wood()} />
      <Box p={[g.x0 - 0.1, 0.12, cz]} s={[0.2, 0.24, d]} m={wood()} />
      <Box p={[g.x1 + 0.1, 0.12, cz]} s={[0.2, 0.24, d]} m={wood()} />
      <Solid p={[cx, 0.5, cz]} s={[w, 1, d]} />
      {/* raked rings around the rock islands */}
      {[
        [cx - 4, cz - 1, 1.4],
        [cx + 3, cz + 1.5, 1.1],
        [cx + 5.5, cz - 2.5, 0.8],
      ].map(([x, z, s], i) => (
        <group key={i}>
          {[1.6, 2.1, 2.6].map((r) => (
            <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.125, z]} scale={r * s} material={basic('#d9ccb0')}>
              <ringGeometry args={[0.95, 1, 40]} />
            </mesh>
          ))}
          <Sph p={[x, 0.3, z]} s={[0.9 * s, 0.6 * s, 0.75 * s]} m={std('#8f8a82', { map: pattern('stone', [1, 1]) })} lo />
          <Sph p={[x, 0.14, z]} s={[1.25 * s, 0.1, 1.1 * s]} m={toon('#6f9a4a')} lo />
        </group>
      ))}
      <Interact words={['sand']} p={[cx - 2, 0, g.z1 + 1.1]} radius={2.4} h={0.8}>
        <group />
      </Interact>
      <Interact words={['rock']} p={[cx + 3, 0, g.z1 + 1.1]} radius={2.4} h={0.8}>
        <group />
      </Interact>
      <Interact words={['moss']} p={[g.x0 - 1.1, 0, cz]} radius={2.4} h={0.8}>
        <group />
      </Interact>
      <Interact words={['garden']} p={[cx - 6, 0, g.z1 + 1.0]} radius={1.8} h={1.4}>
        <Box p={[0, 0.6, 0]} s={[0.08, 1.2, 0.08]} m={wood()} />
        <Box p={[0, 1.15, 0]} s={[0.9, 0.42, 0.06]} m={wood()} />
        <Quad p={[0, 1.15, 0.035]} s={[0.82, 0.36]} map={signTexture('庭園', { sub: 'ZEN GARDEN', bg: '#f3ead6', fg: '#3d3a42', w: 256, h: 112 })} />
      </Interact>
    </group>
  );
}

function BambooGrove() {
  const stalks = useMemo(() => {
    const r = rng(77);
    const out: { x: number; z: number; h: number; lean: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const x = -45.5 + r() * 14;
      const z = -100 + r() * 34;
      if (x > -40.5 && x < -37.5) continue; // walking path through the grove
      out.push({ x, z, h: 7 + r() * 4, lean: (r() - 0.5) * 0.12 });
    }
    return out;
  }, []);
  const green = std('#7fb26a', { rough: 0.5 });
  const ring = std('#6a9a58');
  const leaves = toon('#8cc46e');
  return (
    <group>
      {stalks.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]} rotation={[s.lean, 0, s.lean * 0.7]}>
          <mesh geometry={G.cyl(8)} material={green} position={[0, s.h / 2, 0]} scale={[0.07, s.h, 0.07]} castShadow />
          {[0.25, 0.5, 0.75].map((t) => (
            <mesh key={t} geometry={G.cyl(8)} material={ring} position={[0, s.h * t, 0]} scale={[0.08, 0.05, 0.08]} />
          ))}
          <mesh geometry={G.sphereLo} material={leaves} position={[0.3, s.h - 0.4, 0]} scale={[0.8, 0.3, 0.5]} />
          <mesh geometry={G.sphereLo} material={leaves} position={[-0.2, s.h - 1.2, 0.2]} scale={[0.6, 0.25, 0.5]} />
          <Solid p={[0, 1, 0]} s={[0.16, 2, 0.16]} />
        </group>
      ))}
      <mesh geometry={G.plane} material={std('#ffffff', { map: pattern('gravel', [2, 12]) })} rotation={[-Math.PI / 2, 0, 0]} position={[-39, 0.015, -83]} scale={[3, 34, 1]} receiveShadow />
      <Interact words={['bamboo']} p={[-36.6, 0, -66]} radius={2.4} h={1.6}>
        <group />
      </Interact>
    </group>
  );
}

function Chozuya({ p }: { p: [number, number, number] }) {
  const ripples = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ripples.current) {
      const s = 0.2 + ((clock.elapsedTime * 0.5) % 1) * 0.5;
      ripples.current.scale.set(s, s, 1);
    }
  });
  return (
    <group position={p}>
      <Interact words={['chozuya', 'water']} radius={2.2} h={2.6}>
        {[-1.2, 1.2].map((x) => [-0.9, 0.9].map((z) => <Cyl key={`${x}${z}`} p={[x, 1.25, z]} rad={0.1} h={2.5} m={wood()} />))}
        <mesh geometry={G.prism} material={darkRoof()} position={[0, 2.5, 0]} scale={[2.6, 0.9, 3.4]} castShadow />
        <Box p={[0, 0.4, 0]} s={[1.8, 0.8, 0.9]} c="#9a958c" solid />
        <Box p={[0, 0.81, 0]} s={[1.6, 0.03, 0.7]} m={M.water()} />
        <mesh ref={ripples} userData={{ noMerge: true }} rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.83, 0]} material={basic('#e8f6ff', { transparent: true, opacity: 0.5 })}>
          <ringGeometry args={[0.9, 1, 24]} />
        </mesh>
        <Cyl p={[0.6, 1.25, 0]} rad={0.05} h={0.8} r={[0, 0, Math.PI / 2.4]} c="#7fb26a" />
      </Interact>
      <Interact words={['ladle']} p={[-0.5, 0.82, 0.28]} radius={1.3} h={0.4}>
        {[-0.2, 0, 0.2].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Cyl p={[0, 0.05, 0]} rad={0.05} h={0.08} m={wood()} />
            <Cyl p={[0, 0.05, 0.2]} rad={0.012} h={0.4} r={[Math.PI / 2, 0, 0]} m={wood()} />
          </group>
        ))}
      </Interact>
    </group>
  );
}

function Komainu({ p, ry, words }: { p: [number, number, number]; ry: number; words?: string[] }) {
  const stone = std('#b5afa4', { map: pattern('stone', [1, 1]) });
  const body = (
    <>
      <Box p={[0, 0.5, 0]} s={[1, 1, 1]} m={stone} solid />
      <Sph p={[0, 1.35, -0.1]} s={[0.35, 0.4, 0.45]} m={stone} />
      <Sph p={[0, 1.8, 0.12]} s={[0.32, 0.3, 0.3]} m={stone} />
      <Sph p={[0, 1.95, 0.05]} s={[0.36, 0.22, 0.28]} m={std('#a59f94')} lo />
      <Box p={[0, 1.7, 0.36]} s={[0.25, 0.08, 0.1]} c="#8f897f" />
    </>
  );
  return (
    <group position={p} rotation={[0, ry, 0]}>
      {words ? (
        <Interact words={words} radius={2} h={2.4}>
          {body}
        </Interact>
      ) : (
        body
      )}
    </group>
  );
}

function ShrineHall() {
  const pl = SHRINE_PLATFORM;
  const cx = (pl.x0 + pl.x1) / 2;
  const cz = (pl.z0 + pl.z1) / 2;
  const w = pl.x1 - pl.x0;
  const d = pl.z1 - pl.z0;
  const y = pl.y;
  const planks = std('#ffffff', { map: pattern('planks', [4, 3], '#b48a62') });
  return (
    <group>
      {/* raised platform + front steps */}
      <mesh geometry={G.box} material={planks} position={[cx, y / 2, cz]} scale={[w, y, d]} receiveShadow castShadow />
      {[0, 1, 2].map((i) => (
        <Box key={i} p={[0, (y / 3) * (i + 0.5), pl.z1 + 2.5 - (i + 0.5) * (2.5 / 3)]} s={[4, (y / 3) * (i + 1), 2.5 / 3]} m={wood()} />
      ))}
      {/* side/back railings so players use the steps */}
      <Solid p={[pl.x0 - 0.1, 1, cz]} s={[0.2, 2, d]} />
      <Solid p={[pl.x1 + 0.1, 1, cz]} s={[0.2, 2, d]} />
      {[pl.x0 + 0.1, pl.x1 - 0.1].map((x) => (
        <Box key={x} p={[x, y + 0.45, cz]} s={[0.1, 0.12, d]} m={red()} cast={false} />
      ))}
      <Box p={[-6.5, y + 0.45, pl.z1 - 0.1]} s={[5, 0.12, 0.1]} m={red()} cast={false} />
      <Box p={[6.5, y + 0.45, pl.z1 - 0.1]} s={[5, 0.12, 0.1]} m={red()} cast={false} />
      <Solid p={[-6, 1, pl.z1 - 0.1]} s={[6, 2, 0.2]} />
      <Solid p={[6, 1, pl.z1 - 0.1]} s={[6, 2, 0.2]} />

      {/* main hall */}
      <group position={[0, y, -92]}>
        <Box p={[0, 2.2, 0]} s={[12, 4.4, 8]} c="#f5ecd8" />
        <Solid p={[0, 2.5, 0]} s={[12, 5, 8]} />
        {[-5.8, -2.9, 0, 2.9, 5.8].map((x) => (
          <Cyl key={x} p={[x, 2.2, 4.2]} rad={0.2} h={4.4} m={red()} />
        ))}
        <Box p={[0, 4.4, 4.2]} s={[12.4, 0.35, 0.4]} m={red()} />
        <Box p={[0, 1.4, 4.02]} s={[11.4, 2.8, 0.06]} m={std('#ffffff', { map: pattern('shoji', [6, 2]) })} cast={false} />
        <mesh geometry={G.prism} material={darkRoof()} position={[0, 4.55, 0.5]} rotation={[0, Math.PI / 2, 0]} scale={[11.5, 3.4, 14.5]} castShadow />
        <Box p={[0, 7.95, 0.5]} s={[14.8, 0.35, 0.5]} c="#2f2c32" />
        {[-7.2, 7.2].map((x) => (
          <Box key={x} p={[x, 7.75, 0.5]} s={[0.4, 0.6, 0.6]} r={[0, 0, x > 0 ? -0.4 : 0.4]} c="#2f2c32" />
        ))}
        {/* shimenawa rope with paper streamers */}
        <Cyl p={[0, 3.95, 4.5]} rad={0.13} h={7} r={[0, 0, Math.PI / 2]} c="#d8c48a" />
        {[-2.4, -0.8, 0.8, 2.4].map((x) => (
          <Box key={x} p={[x, 3.6, 4.55]} s={[0.18, 0.5, 0.02]} c="#ffffff" cast={false} />
        ))}
        <Quad p={[0, 4.9, 5.4]} s={[2.2, 0.7]} map={signTexture('夢神社', { bg: '#2a2526', fg: '#f2d48a', w: 384, h: 128 })} />
        <PaperLantern p={[-4.4, 3.4, 4.6]} color="white" />
        <PaperLantern p={[4.4, 3.4, 4.6]} color="white" />
      </group>

      <Interact words={['offering_box', 'money', 'pray']} p={[0, y, -86.2]} radius={2} h={1.2}>
        <Box p={[0, 0.45, 0]} s={[2, 0.9, 0.9]} m={wood()} solid />
        {[-0.7, -0.35, 0, 0.35, 0.7].map((x) => (
          <Box key={x} p={[x, 0.92, 0]} s={[0.08, 0.06, 0.85]} c="#4a3121" />
        ))}
        <Quad p={[0, 0.5, 0.46]} s={[0.9, 0.3]} map={signTexture('奉納', { bg: '#6b4a32', fg: '#f2d48a', w: 256, h: 96 })} />
      </Interact>
      <Interact words={['bell']} p={[1.6, y, -86.4]} radius={1.8} h={2.6} sfx="bell">
        <Cyl p={[0, 2.5, 0]} rad={0.05} h={2.2} c="#d8432f" />
        <Cyl p={[0.06, 2.5, 0]} rad={0.05} h={2.2} c="#ffffff" />
        <Sph p={[0, 3.75, 0]} s={0.2} m={std('#d9b04a', { metal: 0.8, rough: 0.3 })} />
      </Interact>
      <Interact words={['shrine', 'pray']} p={[-3.5, y, -86.6]} radius={2.2} h={2.4}>
        <group />
      </Interact>
    </group>
  );
}

function EmaRack({ p }: { p: [number, number, number] }) {
  const tex = useMemo(() => signTexture('合格', { bg: '#e8cfa0', fg: '#8a2a1a', w: 128, h: 96 }), []);
  return (
    <group position={p} rotation={[0, -Math.PI / 2, 0]}>
      <Interact words={['ema']} radius={2} h={2}>
        <Box p={[-1, 1, 0]} s={[0.1, 2, 0.1]} m={wood()} solid />
        <Box p={[1, 1, 0]} s={[0.1, 2, 0.1]} m={wood()} solid />
        <Box p={[0, 1.95, 0]} s={[2.4, 0.15, 0.4]} c="#3d3a42" />
        {[1.0, 1.45].map((y) => (
          <group key={y}>
            <Box p={[0, y, 0]} s={[2, 0.05, 0.05]} m={wood()} />
            {[-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].map((x, i) => (
              <group key={x} position={[x, y - 0.14, 0.04]} rotation={[0, 0, (i % 3 - 1) * 0.08]}>
                <Box s={[0.24, 0.18, 0.02]} c="#e8cfa0" />
                {i % 2 === 0 && <Quad p={[0, 0, 0.012]} s={[0.2, 0.14]} map={tex} />}
              </group>
            ))}
          </group>
        ))}
      </Interact>
    </group>
  );
}

function Omikuji({ p }: { p: [number, number, number] }) {
  return (
    <group position={p} rotation={[0, Math.PI / 2, 0]}>
      <Interact words={['omikuji']} radius={2} h={1.8}>
        <Box p={[0, 0.6, 0]} s={[1.2, 1.2, 0.5]} c="#d8432f" solid />
        <Quad p={[0, 0.85, 0.26]} s={[0.8, 0.4]} map={signTexture('おみくじ', { bg: '#d8432f', fg: '#ffffff', w: 256, h: 128 })} />
        <Box p={[0, 1.6, -0.6]} s={[2, 0.05, 0.05]} m={wood()} />
        {[-0.8, -0.5, -0.2, 0.1, 0.4, 0.7].map((x) => (
          <Box key={x} p={[x, 1.52, -0.6]} s={[0.05, 0.14, 0.03]} c="#ffffff" cast={false} />
        ))}
        {[-1, 1].map((x) => (
          <Box key={x} p={[x, 0.8, -0.6]} s={[0.07, 1.6, 0.07]} m={wood()} />
        ))}
      </Interact>
    </group>
  );
}

function Pagoda({ p }: { p: [number, number, number] }) {
  const tiers = 5;
  const roof = darkRoof();
  return (
    <group position={p}>
      <Interact words={['pagoda']} radius={4} h={2.5}>
        <Box p={[0, 0.3, 0]} s={[6.5, 0.6, 6.5]} c="#b5afa4" solid />
        {Array.from({ length: tiers }, (_, i) => {
          const s = 4.6 - i * 0.55;
          const y = 0.6 + i * 2.6;
          return (
            <group key={i} position={[0, y, 0]}>
              <Box p={[0, 1.0, 0]} s={[s * 0.7, 2.0, s * 0.7]} c={i % 2 ? '#d8422f' : '#e0503b'} />
              <Box p={[0, 1.0, 0]} s={[s * 0.72, 0.15, s * 0.72]} c="#f5ecd8" />
              <mesh geometry={G.pyramid} material={roof} position={[0, 2.0, 0]} scale={[s + 1.2, 0.9, s + 1.2]} castShadow />
            </group>
          );
        })}
        <Cyl p={[0, 0.6 + tiers * 2.6 + 1.5, 0]} rad={0.08} h={3.4} c="#c9a24a" />
        {[0, 1, 2, 3].map((i) => (
          <Cyl key={i} p={[0, 0.6 + tiers * 2.6 + 0.6 + i * 0.6, 0]} rad={0.25} h={0.06} c="#c9a24a" />
        ))}
      </Interact>
    </group>
  );
}

function KimonoStand({ p, ry = 0 }: { p: [number, number, number]; ry?: number }) {
  const fabric = std('#ffffff', { map: pattern('fabric', [2, 3], '#e86a8a'), side: THREE.DoubleSide });
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Interact words={['kimono']} radius={2} h={2.3}>
        <Box p={[-0.9, 1, 0]} s={[0.08, 2, 0.08]} m={wood()} solid />
        <Box p={[0.9, 1, 0]} s={[0.08, 2, 0.08]} m={wood()} solid />
        <Box p={[0, 1.95, 0]} s={[2.1, 0.08, 0.08]} m={wood()} />
        <Box p={[0, 0.15, 0]} s={[2.0, 0.06, 0.3]} m={wood()} />
        <mesh geometry={G.plane} material={fabric} position={[0, 1.25, 0.05]} scale={[1.7, 1.4, 1]} castShadow />
        <Box p={[0, 1.15, 0.07]} s={[1.0, 0.2, 0.02]} c="#f2c14e" />
      </Interact>
    </group>
  );
}

function GrassTufts({ p }: { p: [number, number, number] }) {
  const blades = useMemo(() => {
    const r = rng(17);
    return Array.from({ length: 14 }, () => ({ x: (r() - 0.5) * 1.2, z: (r() - 0.5) * 1.2, h: 0.3 + r() * 0.35, ry: r() * 3 }));
  }, []);
  return (
    <group position={p}>
      <Interact words={['grass']} radius={1.8} h={0.8}>
        {blades.map((b, i) => (
          <mesh key={i} geometry={G.cone(3)} material={toon(i % 2 ? '#7cc46a' : '#5fae52')} position={[b.x, b.h / 2, b.z]} rotation={[0, b.ry, 0]} scale={[0.05, b.h, 0.05]} />
        ))}
      </Interact>
    </group>
  );
}

function SteppingStones({ from, to, n }: { from: [number, number]; to: [number, number]; n: number }) {
  return (
    <Interact words={['stone']} p={[from[0], 0, from[1]]} radius={2} h={0.5}>
      {Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        return (
          <mesh
            key={i}
            geometry={G.cyl(10)}
            material={std('#b5afa4', { map: pattern('stone', [1, 1]) })}
            position={[(to[0] - from[0]) * t + (i % 2 ? 0.25 : -0.25), 0.04, (to[1] - from[1]) * t]}
            scale={[0.45, 0.08, 0.38]}
            receiveShadow
          />
        );
      })}
    </Interact>
  );
}

export function Traditional() {
  return (
    <group>
      <Torii p={[0, 0, -22]} />
      <Torii p={[0, 0, -56]} scale={0.8} noWord />
      {[-30, -42, -64].map((z, i) => (
        <group key={z}>
          <StoneLantern p={[-3.8, 0, z]} noWord={i !== 0} />
          <StoneLantern p={[3.8, 0, z]} noWord />
        </group>
      ))}
      <StoneLantern p={[-6, 0, -74]} noWord />
      <StoneLantern p={[6, 0, -74]} noWord />

      <SakuraTree p={[-8, 0, -28]} seed={1} />
      <SakuraTree p={[8.5, 0, -34]} seed={2} />
      <SakuraTree p={[-11, 0, -66]} seed={3} />
      <SakuraTree p={[12, 0, -60]} seed={4} />
      <SakuraTree p={[38, 0, -34]} seed={5} scale={1.15} />
      <SakuraTree p={[-40, 0, -24]} seed={6} />
      <SakuraTree p={[22, 0, -96]} seed={7} />
      <SakuraTree p={[-10, 0, -44]} seed={8} scale={0.9} />
      <PineTree p={[-15, 0, -90]} scale={1.2} />
      <PineTree p={[15, 0, -93]} scale={1.1} />
      <PineTree p={[20, 0, -68]} noWord />
      <PineTree p={[-20, 0, -30]} noWord scale={1.2} />
      <Bush p={[-6, 0, -36]} />
      <Bush p={[6, 0, -48]} />
      <Bush p={[14, 0, -30]} s={1.3} />
      <Bush p={[-18, 0, -76]} s={1.2} />

      <Pond />
      <Bridge />
      <Stream />
      <RockGarden />
      <BambooGrove />
      <Chozuya p={[-7.5, 0, -62]} />
      <Komainu p={[-3.6, 0, -79]} ry={Math.PI / 2} words={['komainu']} />
      <Komainu p={[3.6, 0, -79]} ry={-Math.PI / 2} />
      <ShrineHall />
      <EmaRack p={[10, 0, -77]} />
      <Omikuji p={[-10, 0, -77]} />
      <Pagoda p={[32, 0, -80]} />
      <KimonoStand p={[24.6, 0, -22.5]} ry={-Math.PI / 2} />
      <GrassTufts p={[12, 0, -46]} />
      <GrassTufts p={[-30, 0, -36]} />
      <SteppingStones from={[25, -31]} to={[25, -38]} n={6} />
      <Rock p={[-14, 0, -38]} s={0.8} noWord />
      <Rock p={[40, 0, -55]} s={1.3} noWord />

      <Butterfly p={[10, 1.3, -50]} />
      <Butterfly p={[-31, 1.4, -32]} color="#f7a6c9" />
      <Frog p={[-13.6, 0, -47.6]} />
      <Bird p={[1.5, 0.05, -36]} color="#d9b38c" />
      <Bird p={[-2, 0.05, -70]} color="#7ab8e8" />
    </group>
  );
}
