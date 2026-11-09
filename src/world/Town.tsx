import * as THREE from 'three';
import { useMemo } from 'react';
import { BUILDINGS, ROADS, ZONE_RECTS, type Rect } from './layout';
import { BuildingView } from './Buildings';
import { G, LocationContext, Box, Quad, Solid, Interact, Cull } from './parts';
import { std, wetStd, toon } from './materials';
import { pattern, rng, signTexture } from './textures';
import { BlockWall, Hedge } from './Props';
import { MainStreet } from './zones/MainStreet';
import { Shopping } from './zones/Shopping';
import { CafeStreet } from './zones/CafeStreet';
import { Traditional } from './zones/Traditional';
import { Residential } from './zones/Residential';
import { NPCs } from '../game/NPC';
import type { ZoneId } from '../types';

const ROAD_COLORS = { asphalt: '#ffffff', sidewalk: '#ffffff', cobble: '#ffffff', gravel: '#ffffff', stone: '#ffffff' } as const;

const zoneRect = (z: ZoneId) => ZONE_RECTS.find((r) => r.zone === z)!.r;

function RoadSurface({ r, kind, i }: { r: Rect; kind: keyof typeof ROAD_COLORS; i: number }) {
  const w = r.x1 - r.x0;
  const d = r.z1 - r.z0;
  const scale = kind === 'asphalt' ? 6 : kind === 'sidewalk' ? 2 : kind === 'cobble' ? 2.5 : 3;
  const tex = useMemo(() => {
    const base = pattern(kind === 'stone' ? 'cobble' : kind, [1, 1], kind === 'stone' ? '#cfc6b8' : undefined);
    const t = base.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(w / scale, d / scale);
    t.needsUpdate = true;
    return t;
  }, [kind, w, d, scale]);
  const mat = useMemo(() => wetStd(ROAD_COLORS[kind], tex, kind === 'asphalt' ? 0.92 : 0.85), [kind, tex]);
  const y = 0.012 + (kind === 'sidewalk' ? 0.06 : 0) + i * 0.0004;
  return (
    <>
      <mesh geometry={G.plane} material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[(r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2]} scale={[w, d, 1]} receiveShadow />
      {kind === 'sidewalk' && <mesh geometry={G.box} material={std('#bdb4a8')} position={[(r.x0 + r.x1) / 2, 0.035, (r.z0 + r.z1) / 2]} scale={[w, 0.07, d]} receiveShadow />}
    </>
  );
}

function RoadMarkings() {
  const white = std('#f4f4f0', { rough: 0.6 });
  const dashes: React.ReactNode[] = [];
  for (let x = -29; x < 30; x += 4) {
    if (Math.abs(x) < 3) continue;
    dashes.push(<mesh key={`m${x}`} geometry={G.plane} material={white} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 0]} scale={[2, 0.15, 1]} />);
  }
  for (let z = 10; z < 104; z += 4) dashes.push(<mesh key={`r${z}`} geometry={G.plane} material={white} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z]} scale={[0.15, 2, 1]} />);
  return (
    <>
      {dashes}
      <mesh geometry={G.plane} material={white} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -3.2]} scale={[62, 0.12, 1]} />
      <mesh geometry={G.plane} material={white} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 3.2]} scale={[62, 0.12, 1]} />
      <Interact words={['road']} p={[-24, 0, 0]} radius={2.6} h={0.6}>
        <group />
      </Interact>
    </>
  );
}

/** Instanced background forest for areas outside the walkable town. */
function Forest({ areas, count, seed }: { areas: Rect[]; count: number; seed: number }) {
  const { trunks, crowns } = useMemo(() => {
    const r = rng(seed);
    const trunksM: THREE.Matrix4[] = [];
    const crownsM: { m: THREE.Matrix4; c: THREE.Color }[] = [];
    const palette = ['#6fae5a', '#7dbb63', '#5d9c4f', '#8cc46e', '#ffc4d8', '#4f8a54'];
    for (let i = 0; i < count; i++) {
      const a = areas[Math.floor(r() * areas.length)];
      const x = a.x0 + r() * (a.x1 - a.x0);
      const z = a.z0 + r() * (a.z1 - a.z0);
      const s = 0.8 + r() * 0.9;
      trunksM.push(new THREE.Matrix4().compose(new THREE.Vector3(x, 1.5 * s, z), new THREE.Quaternion(), new THREE.Vector3(0.25 * s, 3 * s, 0.25 * s)));
      const col = new THREE.Color(palette[r() > 0.88 ? 4 : Math.floor(r() * 4)]);
      for (let k = 0; k < 3; k++) {
        crownsM.push({
          m: new THREE.Matrix4().compose(new THREE.Vector3(x + (r() - 0.5) * 1.6 * s, (3.4 + r() * 1.4) * s, z + (r() - 0.5) * 1.6 * s), new THREE.Quaternion(), new THREE.Vector3(1.4 * s, 1.2 * s, 1.4 * s)),
          c: col.clone().multiplyScalar(0.9 + r() * 0.2),
        });
      }
    }
    return { trunks: trunksM, crowns: crownsM };
  }, [areas, count, seed]);
  const trunkMat = useMemo(() => std('#7a5a44'), []);
  const crownMat = useMemo(() => new THREE.MeshToonMaterial({ color: '#ffffff' }), []);
  return (
    <>
      <instancedMesh
        args={[G.cyl(8), trunkMat, trunks.length]}
        castShadow
        ref={(m) => {
          if (!m) return;
          trunks.forEach((mt, i) => m.setMatrixAt(i, mt));
          m.instanceMatrix.needsUpdate = true;
        }}
      />
      <instancedMesh
        args={[G.sphereLo, crownMat, crowns.length]}
        castShadow
        ref={(m) => {
          if (!m) return;
          crowns.forEach((c, i) => {
            m.setMatrixAt(i, c.m);
            m.setColorAt(i, c.c);
          });
          m.instanceMatrix.needsUpdate = true;
          if (m.instanceColor) m.instanceColor.needsUpdate = true;
        }}
      />
    </>
  );
}

function Backdrop() {
  const hills = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2;
      const d = 190 + r() * 60;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, s: 40 + r() * 40, h: 14 + r() * 18, c: r() > 0.5 ? '#86b878' : '#7aad74' };
    });
  }, []);
  const mountains = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + 0.3;
      const d = 330 + r() * 40;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, s: 70 + r() * 50, h: 70 + r() * 70 };
    });
  }, []);
  return (
    <>
      {hills.map((h, i) => (
        <mesh key={i} geometry={G.sphere} material={toon(h.c)} position={[h.x, -2, h.z]} scale={[h.s, h.h, h.s]} />
      ))}
      {mountains.map((m, i) => (
        <group key={i} position={[m.x, 0, m.z]}>
          <mesh geometry={G.cone(7)} material={toon('#8fa6c4')} position={[0, m.h / 2 - 4, 0]} scale={[m.s, m.h, m.s]} />
          <mesh geometry={G.cone(7)} material={toon('#f4f6fb')} position={[0, m.h - 4 - m.h * 0.12, 0]} scale={[m.s * 0.25, m.h * 0.25, m.s * 0.25]} />
        </group>
      ))}
    </>
  );
}

function Boundaries() {
  const tradWall = '#efe6d2';
  return (
    <>
      {/* Traditional district: plaster walls with tiled caps */}
      <BlockWall p={[-47, 0, -60.5]} len={87} ry={Math.PI / 2} h={2.2} color={tradWall} />
      <BlockWall p={[47, 0, -60.5]} len={87} ry={Math.PI / 2} h={2.2} color={tradWall} />
      <BlockWall p={[0, 0, -104]} len={94} h={2.2} color={tradWall} />
      <BlockWall p={[-26, 0, -17.2]} len={42} h={2.2} color={tradWall} />
      <BlockWall p={[26, 0, -17.2]} len={42} h={2.2} color={tradWall} />
      {/* Residential: hedges */}
      <Hedge p={[-47, 0, 60.5]} len={87} ry={Math.PI / 2} />
      <Hedge p={[47, 0, 60.5]} len={87} ry={Math.PI / 2} />
      <Hedge p={[0, 0, 104]} len={94} />
      <Hedge p={[-26, 0, 17.2]} len={42} />
      <Hedge p={[26, 0, 17.2]} len={42} />
      {/* Street ends */}
      <Hedge p={[104, 0, 0]} len={16} ry={Math.PI / 2} h={1.8} />
      <Hedge p={[-104, 0, 0]} len={16} ry={Math.PI / 2} h={1.8} />
      <Solid p={[105, 3, 0]} s={[1, 6, 16]} />
      <Solid p={[-105, 3, 0]} s={[1, 6, 16]} />
    </>
  );
}

/** Welcome arches over the entrances to the pedestrian streets. */
function GateArch({ x, text, sub, color }: { x: number; text: string; sub: string; color: string }) {
  const tex = useMemo(() => signTexture(text, { sub, bg: color, fg: '#fffaf0', w: 768, h: 160 }), [text, sub, color]);
  return (
    <group position={[x, 0, 0]}>
      {[-6.6, 6.6].map((z) => (
        <Box key={z} p={[0, 2.9, z]} s={[0.4, 5.8, 0.4]} c="#7a6a62" solid />
      ))}
      <Box p={[0, 5.8, 0]} s={[0.5, 0.25, 14]} c="#7a6a62" />
      <Box p={[0, 5.35, 0]} s={[0.25, 1.1, 7.2]} c={color} />
      <Quad p={[0.14, 5.35, 0]} r={[0, Math.PI / 2, 0]} s={[7, 1.0]} map={tex} emissive />
      <Quad p={[-0.14, 5.35, 0]} r={[0, -Math.PI / 2, 0]} s={[7, 1.0]} map={tex} emissive />
    </group>
  );
}

export function Town({ visible }: { visible: boolean }) {
  const grass = useMemo(() => std('#ffffff', { map: pattern('grass', [140, 140]), rough: 1 }), []);
  const forestAreas = useMemo<Rect[]>(
    () => [
      { x0: 50, x1: 115, z0: -115, z1: -20 },
      { x0: -115, x1: -50, z0: -115, z1: -20 },
      { x0: 50, x1: 115, z0: 20, z1: 115 },
      { x0: -115, x1: -50, z0: 20, z1: 115 },
      { x0: -45, x1: 45, z0: 108, z1: 125 },
      { x0: -45, x1: 45, z0: -125, z1: -108 },
      { x0: 108, x1: 125, z0: -18, z1: 18 },
      { x0: -125, x1: -108, z0: -18, z1: 18 },
    ],
    [],
  );
  return (
    <LocationContext.Provider value="outside">
      <group visible={visible}>
        <mesh geometry={G.plane} material={grass} rotation={[-Math.PI / 2, 0, 0]} scale={[700, 700, 1]} receiveShadow />
        {ROADS.map((r, i) => (
          <RoadSurface key={i} r={r} kind={r.kind} i={i} />
        ))}
        <RoadMarkings />
        {BUILDINGS.map((b) => (
          <Cull key={b.id} rect={{ x0: b.x - b.w / 2, x1: b.x + b.w / 2, z0: b.z - b.d / 2, z1: b.z + b.d / 2 }} dist={150}>
            <BuildingView b={b} />
          </Cull>
        ))}
        <Boundaries />
        <GateArch x={32.4} text="夢の街商店街" sub="YUME SHOPPING STREET" color="#d9534f" />
        <GateArch x={-32.4} text="カフェ通り" sub="CAFÉ STREET" color="#8a5a9e" />
        <Forest areas={forestAreas} count={150} seed={9} />
        <Backdrop />
        <Cull rect={zoneRect('main')}>
          <MainStreet />
        </Cull>
        <Cull rect={zoneRect('shopping')}>
          <Shopping />
        </Cull>
        <Cull rect={zoneRect('cafe')}>
          <CafeStreet />
        </Cull>
        <Cull rect={zoneRect('traditional')} dist={95}>
          <Traditional />
        </Cull>
        <Cull rect={zoneRect('residential')}>
          <Residential />
        </Cull>
        <NPCs location="outside" />
      </group>
    </LocationContext.Provider>
  );
}
