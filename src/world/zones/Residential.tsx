import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Interact, Box, Cyl, Sph, Quad, Solid, G } from '../parts';
import { std } from '../materials';
import { signTexture, pattern } from '../textures';
import { BlockWall, Hedge, Bicycle, Tree, SakuraTree, Bench, UtilityPole, Wires, StreetLamp, VendingMachine, Car, Flowerpot, Bush, Planter } from '../Props';
import { Dog, Bird } from '../../game/Animals';
import { PARK } from '../layout';

function Mailbox({ p, ry = 0, color = '#c9a24a', words = ['mailbox'] }: { p: [number, number, number]; ry?: number; color?: string; words?: string[] }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Interact words={words} radius={1.4} h={1.4}>
        <Box p={[0, 0.55, 0]} s={[0.08, 1.1, 0.08]} c="#5a5a60" solid />
        <Box p={[0, 1.15, 0]} s={[0.4, 0.3, 0.25]} c={color} />
        <Box p={[0, 1.2, 0.13]} s={[0.25, 0.03, 0.01]} c="#2a2a2a" />
      </Interact>
    </group>
  );
}

function Gate({ p, ry = 0, words }: { p: [number, number, number]; ry?: number; words?: string[] }) {
  const body = (
    <>
      {[-1.6, 1.6].map((x) => (
        <Box key={x} p={[x, 1.1, 0]} s={[0.35, 2.2, 0.35]} c="#d9d0c0" solid />
      ))}
      <Box p={[0, 2.45, 0]} s={[3.8, 0.12, 0.8]} c="#4b5566" />
      <Box p={[0, 2.3, 0]} s={[3.4, 0.2, 0.25]} m={std('#7a5638', { map: pattern('wood', [1, 1], '#7a5638') })} />
      <Quad p={[1.6, 1.6, 0.18]} s={[0.26, 0.6]} map={signTexture('田中', { vertical: true, bg: '#f5efe1', fg: '#2a2a2a', w: 96, h: 192 })} />
    </>
  );
  return (
    <group position={p} rotation={[0, ry, 0]}>
      {words ? (
        <Interact words={words} radius={1.8} h={2.6}>
          {body}
        </Interact>
      ) : (
        body
      )}
    </group>
  );
}

function LaundryPole({ p, ry = 0 }: { p: [number, number, number]; ry?: number }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Interact words={['laundry']} radius={1.8} h={2.2}>
        {[-1.3, 1.3].map((x) => (
          <Box key={x} p={[x, 0.9, 0]} s={[0.06, 1.8, 0.06]} c="#8a8f99" solid />
        ))}
        <Cyl p={[0, 1.75, 0]} rad={0.02} h={2.6} r={[0, 0, Math.PI / 2]} c="#c9c9c9" />
        {[
          [-0.9, '#ffffff', 0.5],
          [-0.35, '#f6a6c1', 0.7],
          [0.2, '#8ec5f2', 0.6],
          [0.75, '#fff1c9', 0.45],
        ].map(([x, c, h]) => (
          <mesh key={x as number} geometry={G.plane} position={[x as number, 1.72 - (h as number) / 2, 0]} scale={[0.42, h as number, 1]} material={std(c as string, { side: THREE.DoubleSide })} castShadow />
        ))}
      </Interact>
    </group>
  );
}

function BicycleParking({ p, ry = 0 }: { p: [number, number, number]; ry?: number }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Interact words={['bicycle_parking']} radius={2.6} h={2.6}>
        {[-3, 3].map((x) => [-0.8, 0.8].map((z) => <Box key={`${x}${z}`} p={[x, 1.1, z]} s={[0.08, 2.2, 0.08]} c="#8a8f99" />))}
        <Box p={[0, 2.25, 0]} s={[6.6, 0.08, 2.0]} c="#7fb6d6" r={[0.08, 0, 0]} />
        <Solid p={[0, 1, 0]} s={[6.2, 2, 1.4]} />
        {[-2.2, -1.1, 0, 1.1, 2.2].map((x, i) => (
          <Bicycle key={x} p={[x, 0, 0]} ry={0} color={['#f6a6c1', '#ffffff', '#7cc4a4', '#ffd36b', '#8ec5f2'][i]} noWord />
        ))}
      </Interact>
    </group>
  );
}

function Swing({ p }: { p: [number, number, number] }) {
  const seats = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    seats.current.forEach((g, i) => {
      if (g) g.rotation.x = Math.sin(clock.elapsedTime * 1.6 + i * 1.3) * (i === 0 ? 0.35 : 0.12);
    });
  });
  return (
    <group position={p}>
      <Interact words={['swing']} radius={2.6} h={2.8}>
        {[-1.8, 1.8].map((x) => (
          <group key={x}>
            <Box p={[x, 1.25, -0.7]} s={[0.1, 2.6, 0.1]} r={[0.28, 0, 0]} c="#e86a5a" />
            <Box p={[x, 1.25, 0.7]} s={[0.1, 2.6, 0.1]} r={[-0.28, 0, 0]} c="#e86a5a" />
          </group>
        ))}
        <Cyl p={[0, 2.5, 0]} rad={0.06} h={3.8} r={[0, 0, Math.PI / 2]} c="#e86a5a" />
        {[-0.8, 0.8].map((x, i) => (
          <group
            key={x}
            position={[x, 2.5, 0]}
            ref={(g) => {
              seats.current[i] = g;
            }}
          >
            <Cyl p={[-0.2, -1, 0]} rad={0.01} h={2} c="#aaa" />
            <Cyl p={[0.2, -1, 0]} rad={0.01} h={2} c="#aaa" />
            <Box p={[0, -2.0, 0]} s={[0.5, 0.05, 0.25]} c="#ffd36b" />
          </group>
        ))}
        <Solid p={[0, 1.2, 0]} s={[4, 2.4, 2]} />
      </Interact>
    </group>
  );
}

function Slide({ p, ry = 0 }: { p: [number, number, number]; ry?: number }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Interact words={['slide']} radius={2.6} h={2.8}>
        <Box p={[0, 1.0, -1.4]} s={[1.2, 0.1, 1.2]} c="#8ec5f2" />
        {[-0.55, 0.55].map((x) => [-1.95, -0.85].map((z) => <Box key={`${x}${z}`} p={[x, 0.5, z]} s={[0.08, 1, 0.08]} c="#5a8ab5" />))}
        <Box p={[0, 0.95, -2.5]} s={[0.8, 0.08, 1.4]} r={[0.9, 0, 0]} c="#ffd36b" />
        <Box p={[0, 0.55, 0.5]} s={[0.8, 0.06, 3.2]} r={[-0.38, 0, 0]} c="#f68b8b" />
        <Box p={[0.42, 0.7, 0.5]} s={[0.05, 0.2, 3.2]} r={[-0.38, 0, 0]} c="#e86a5a" />
        <Box p={[-0.42, 0.7, 0.5]} s={[0.05, 0.2, 3.2]} r={[-0.38, 0, 0]} c="#e86a5a" />
        <Solid p={[0, 0.8, -0.6]} s={[1.3, 1.6, 4.4]} />
      </Interact>
    </group>
  );
}

function Sandbox({ p }: { p: [number, number, number] }) {
  return (
    <group position={p}>
      <Interact words={['sandbox']} radius={2.8} h={0.8}>
        {[-1.6, 1.6].map((x) => (
          <Box key={x} p={[x, 0.15, 0]} s={[0.2, 0.3, 3.4]} m={std('#c49a6c')} />
        ))}
        {[-1.6, 1.6].map((z) => (
          <Box key={`z${z}`} p={[0, 0.15, z]} s={[3.4, 0.3, 0.2]} m={std('#c49a6c')} />
        ))}
        <mesh geometry={G.box} material={std('#ffffff', { map: pattern('sand', [2, 2]) })} position={[0, 0.12, 0]} scale={[3.0, 0.1, 3.0]} />
        <Sph p={[0.5, 0.2, -0.4]} s={[0.4, 0.15, 0.35]} c="#e6d7b5" lo />
        <Cyl p={[-0.6, 0.25, 0.5]} rad={0.12} top={1.3} h={0.2} c="#f68b8b" />
        <Solid p={[0, 0.4, 0]} s={[3.4, 0.8, 3.4]} />
      </Interact>
    </group>
  );
}

function Seesaw({ p, ry = 0 }: { p: [number, number, number]; ry?: number }) {
  const beam = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (beam.current) beam.current.rotation.z = Math.sin(clock.elapsedTime * 1.2) * 0.18;
  });
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Interact words={['seesaw']} radius={2.4} h={1.2}>
        <Box p={[0, 0.3, 0]} s={[0.3, 0.6, 0.4]} c="#7cc4a4" />
        <group ref={beam} position={[0, 0.62, 0]}>
          <Box s={[3.6, 0.08, 0.3]} c="#ffd36b" />
          {[-1.6, 1.6].map((x) => (
            <Box key={x} p={[x, 0.22, 0]} s={[0.05, 0.35, 0.3]} c="#e86a5a" />
          ))}
        </group>
        <Solid p={[0, 0.5, 0]} s={[3.6, 1, 0.6]} />
      </Interact>
    </group>
  );
}

function Fountain({ p }: { p: [number, number, number] }) {
  const drops = useRef<THREE.InstancedMesh>(null);
  const N = 60;
  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => ({ a: (i / N) * Math.PI * 2, ph: Math.random() })), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const m = drops.current;
    if (!m) return;
    const t = clock.elapsedTime;
    seeds.forEach((s, i) => {
      const k = (t * 0.7 + s.ph) % 1;
      const r = k * 1.3;
      dummy.position.set(Math.cos(s.a) * r, 1.6 + k * 1.6 - k * k * 2.6, Math.sin(s.a) * r);
      dummy.scale.setScalar(0.05);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  const stone = std('#d6d0c4', { map: pattern('stone', [1, 1], '#d6d0c4') });
  return (
    <group position={p}>
      <Interact words={['fountain', 'water']} radius={3.4} h={2.6}>
        <Cyl p={[0, 0.3, 0]} rad={2.3} h={0.6} m={stone} seg={28} solid />
        <Cyl p={[0, 0.58, 0]} rad={2.05} h={0.06} m={std('#7fc2d8', { rough: 0.05, metal: 0.3, transparent: true, opacity: 0.85 })} seg={28} />
        <Cyl p={[0, 1.0, 0]} rad={0.25} h={1.2} m={stone} />
        <Cyl p={[0, 1.55, 0]} rad={0.8} top={0.6} h={0.2} m={stone} />
        <instancedMesh ref={drops} args={[G.sphereLo, std('#d8f2ff', { transparent: true, opacity: 0.8 }), N]} frustumCulled={false} />
      </Interact>
    </group>
  );
}

function Balloon({ p }: { p: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(clock.elapsedTime * 1.3) * 0.08;
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.08;
    }
  });
  return (
    <group position={p}>
      <Interact words={['balloon']} radius={2} h={2.9}>
        <group ref={ref}>
          <Cyl p={[0, 1.6, 0]} rad={0.005} h={1.4} c="#ffffff" cast={false} />
          <Sph p={[0, 2.5, 0]} s={[0.28, 0.33, 0.28]} m={std('#ff6b8a', { rough: 0.2, metal: 0.1 })} />
        </group>
      </Interact>
    </group>
  );
}

function Signpost({ p, text, sub, words, ry = 0 }: { p: [number, number, number]; text: string; sub: string; words: string[]; ry?: number }) {
  const tex = useMemo(() => signTexture(text, { sub, bg: '#2f6f4f', fg: '#ffffff', w: 384, h: 128 }), [text, sub]);
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Interact words={words} radius={1.8} h={2.3}>
        <Box p={[0, 1, 0]} s={[0.1, 2, 0.1]} c="#6b4a32" solid />
        <Box p={[0, 1.8, 0]} s={[1.3, 0.48, 0.06]} c="#2f6f4f" />
        <Quad p={[0, 1.8, 0.035]} s={[1.22, 0.42]} map={tex} />
        <Quad p={[0, 1.8, -0.035]} r={[0, Math.PI, 0]} s={[1.22, 0.42]} map={tex} />
      </Interact>
    </group>
  );
}

export function Residential() {
  const poles: [number, number][] = [
    [-4.4, 20],
    [-4.4, 40],
    [-4.4, 60],
    [-4.4, 80],
    [-4.4, 100],
  ];
  const parkGrass = useMemo(() => std('#ffffff', { map: pattern('grass', [12, 14], '#9fd07a') }), []);
  const path = useMemo(() => std('#ffffff', { map: pattern('gravel', [4, 1]) }), []);
  return (
    <group>
      {poles.map(([x, z], i) => (
        <UtilityPole key={z} p={[x, 0, z]} noWord={i !== 1} />
      ))}
      <Wires points={poles} />
      {[30, 50, 70, 90].map((z) => (
        <StreetLamp key={z} p={[4.4, 0, z]} ry={-Math.PI / 2} noWord />
      ))}
      <VendingMachine p={[4.35, 0, 74]} ry={-Math.PI / 2} color="#7cc4a4" words={['drink']} />
      <Car p={[1.6, 0, 46]} color="#f6a6c1" />

      {/* Tanaka lot */}
      <BlockWall p={[-6.2, 0, 24.2]} len={6.4} ry={Math.PI / 2} words={['wall']} noWord={false} />
      <BlockWall p={[-6.2, 0, 33.8]} len={6.4} ry={Math.PI / 2} />
      <BlockWall p={[-14.1, 0, 21]} len={15.8} />
      <BlockWall p={[-14.1, 0, 37]} len={15.8} />
      <Gate p={[-6.2, 0, 29]} ry={Math.PI / 2} words={['gate']} />
      <Mailbox p={[-5.6, 0, 31.6]} ry={Math.PI / 2} />
      <LaundryPole p={[-9.2, 0, 23.4]} />
      <Bicycle p={[-8.2, 0, 35.6]} ry={Math.PI / 2} color="#8ec5f2" noWord />
      <Flowerpot p={[-11.4, 0, 31.4]} noWord color="#ff8fab" />
      <Flowerpot p={[-11.4, 0, 26.6]} noWord color="#fff3a8" />

      {/* neighbor lots */}
      <Hedge p={[-6.4, 0, 41.6]} len={5.2} ry={Math.PI / 2} h={1.1} />
      <Hedge p={[-6.4, 0, 50.4]} len={5.2} ry={Math.PI / 2} h={1.1} />
      <Mailbox p={[-5.7, 0, 47.6]} ry={Math.PI / 2} color="#e05a5a" />
      {[
        [27, 20, 34],
        [43, 36, 50],
        [82, 75, 89],
        [96, 90, 102],
      ].map(([zc, z0, z1]) => (
        <group key={zc}>
          <BlockWall p={[6.2, 0, (z0 + zc - 1.6) / 2]} len={zc - 1.6 - z0} ry={Math.PI / 2} color="#ece4d4" />
          <BlockWall p={[6.2, 0, (zc + 1.6 + z1) / 2]} len={z1 - zc - 1.6} ry={Math.PI / 2} color="#ece4d4" />
          <Mailbox p={[5.6, 0, zc + 2.2]} ry={-Math.PI / 2} color={zc % 2 ? '#8ec5f2' : '#c9a24a'} />
        </group>
      ))}
      <BicycleParking p={[8.6, 0, 62]} ry={Math.PI / 2} />
      <Bush p={[9, 0, 53]} />
      <Planter p={[9, 0, 70.5]} w={2.4} />

      {/* park */}
      <mesh geometry={G.plane} material={parkGrass} rotation={[-Math.PI / 2, 0, 0]} position={[(PARK.x0 + PARK.x1) / 2, 0.01, (PARK.z0 + PARK.z1) / 2]} scale={[PARK.x1 - PARK.x0, PARK.z1 - PARK.z0, 1]} receiveShadow />
      <mesh geometry={G.plane} material={path} rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0.02, 63]} scale={[27, 2.4, 1]} receiveShadow />
      <mesh geometry={G.plane} material={path} rotation={[-Math.PI / 2, 0, 0]} position={[-26, 0.02, 80]} scale={[2.4, 32, 1]} receiveShadow />
      <Hedge p={[-6.6, 0, 58]} len={4} ry={Math.PI / 2} h={1} />
      <Hedge p={[-6.6, 0, 84]} len={36} ry={Math.PI / 2} h={1} />
      <Hedge p={[-26, 0, 55.4]} len={38} h={1} />
      <Signpost p={[-6.0, 0, 61.0]} text="夢の街公園" sub="YUME PARK" words={['park']} ry={Math.PI / 2} />
      <Signpost p={[-43.5, 0, 72]} text="ジョギング" sub="JOGGING PATH" words={['run']} ry={Math.PI / 2} />
      <Fountain p={[-34, 0, 66]} />
      <Bench p={[-27.6, 0, 66]} ry={Math.PI / 2} noWord />
      <Bench p={[-30, 0, 86]} ry={Math.PI / 2} noWord />
      <Swing p={[-37, 0, 92]} />
      <Slide p={[-22, 0, 95]} ry={Math.PI} />
      <Sandbox p={[-34, 0, 79]} />
      <Seesaw p={[-14, 0, 82]} ry={Math.PI / 2} />
      <Balloon p={[-19.4, 0, 84.4]} />
      <Tree p={[-42, 0, 60]} seed={31} />
      <Tree p={[-42, 0, 99]} seed={32} />
      <Tree p={[-11, 0, 99]} seed={33} />
      <Tree p={[-12, 0, 70]} seed={34} scale={0.9} />
      <SakuraTree p={[-19, 0, 61]} seed={35} />
      <SakuraTree p={[-41, 0, 80]} seed={36} />

      <Dog p={[-28, 0, 74]} points={[[-30, 74], [-18, 72], [-24, 88], [-38, 84]]} />
      <Bird p={[-27, 0.05, 77]} />
      <Bird p={[2, 0.05, 88]} color="#c7a27a" />
    </group>
  );
}
