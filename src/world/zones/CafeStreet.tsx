import { useMemo } from 'react';
import { Interact, Box, Sph, Quad, Cyl } from '../parts';
import { std, toon, glow } from '../materials';
import { signTexture } from '../textures';
import { OutdoorTable, Parasol, DisplayTable, LanternString, Planter, StreetLamp, Flowerpot, Bicycle, Tree } from '../Props';
import { Cat } from '../../game/Animals';

const Nigiri = ({ c }: { c: string }) => (
  <group>
    {[-0.1, 0.1].map((x) => (
      <group key={x} position={[x, 0.04, 0]}>
        <Box s={[0.12, 0.05, 0.07]} c="#fbfbf6" />
        <Box p={[0, 0.035, 0]} s={[0.13, 0.025, 0.08]} m={toon(c)} />
      </group>
    ))}
  </group>
);
const Tempura = () => (
  <group>
    <Cyl p={[0, 0.02, 0]} rad={0.18} h={0.03} c="#f4f1ea" />
    {[-0.06, 0.06].map((x) => (
      <Sph key={x} p={[x, 0.06, 0]} s={[0.04, 0.035, 0.12]} m={toon('#e9b85a')} />
    ))}
  </group>
);

function NeonSign({ p, text, color, ry = 0 }: { p: [number, number, number]; text: string; color: string; ry?: number }) {
  const tex = useMemo(() => signTexture(text, { bg: '#120f1c', fg: color, glow: true, w: 512, h: 128 }), [text, color]);
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Box p={[0, 0, -0.04]} s={[2.1, 0.58, 0.06]} c="#120f1c" />
      <mesh position={[0, 0, 0]} scale={[2, 0.5, 1]}>
        <planeGeometry />
        <primitive object={glow('#ffffff', '#ffffff', 0.8, 2.6, { map: tex })} attach="material" />
      </mesh>
    </group>
  );
}

function MenuBoard({ p, ry = 0 }: { p: [number, number, number]; ry?: number }) {
  const tex = useMemo(() => signTexture('本日のおすすめ', { sub: 'ラテ ¥450', bg: '#2f3a32', fg: '#fdf3d8', w: 256, h: 192 }), []);
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Box p={[0, 0.55, 0]} s={[0.62, 0.95, 0.05]} r={[-0.12, 0, 0]} c="#6b4a32" solid />
      <Quad p={[0, 0.58, 0.04]} r={[-0.12, 0, 0]} s={[0.52, 0.42]} map={tex} />
    </group>
  );
}

export function CafeStreet() {
  return (
    <group>
      <LanternString from={[-36, -6.8]} to={[-48, 6.8]} y={4.6} count={8} alt />
      <LanternString from={[-60, -6.8]} to={[-72, 6.8]} y={4.6} count={8} alt />
      <LanternString from={[-84, -6.8]} to={[-96, 6.8]} y={4.6} count={8} alt />

      <OutdoorTable p={[-38.5, 0, -3.6]} color="#f6a6c1" withWords />
      <OutdoorTable p={[-52, 0, 3.2]} color="#9ed2f0" />
      <OutdoorTable p={[-63, 0, -3.4]} color="#ffd59a" />
      <OutdoorTable p={[-76, 0, 3.4]} color="#c7a6f0" />
      <OutdoorTable p={[-88, 0, -3.4]} color="#f6a6c1" />
      <Parasol p={[-46.8, 0, 5.2]} color="#ffc48a" />
      <MenuBoard p={[-41.6, 0, -6.3]} ry={0.25} />

      <DisplayTable
        p={[-49, 0, -5.7]}
        cloth="#f5efe1"
        items={[
          { word: 'sushi', node: <Nigiri c="#ff8a6b" /> },
          { word: 'salmon', node: <Nigiri c="#ffa07a" /> },
          { word: 'tuna', node: <Nigiri c="#c8324a" /> },
        ]}
      />
      <DisplayTable p={[-85, 0, 5.7]} ry={Math.PI} cloth="#fff6dc" items={[{ word: 'tempura', node: <Tempura /> }]} />
      <Interact words={['plant']} p={[-57.8, 0, -6.2]} radius={1.4} h={1.2}>
        <Cyl p={[0, 0.3, 0]} rad={0.28} h={0.6} c="#e9e2d6" solid />
        <Sph p={[0, 0.9, 0]} s={[0.45, 0.55, 0.45]} m={toon('#6aa857')} lo />
        <Sph p={[0.15, 1.3, 0.05]} s={[0.25, 0.35, 0.25]} m={toon('#79b864')} lo />
      </Interact>
      <Flowerpot p={[-66, 0, -6.4]} noWord color="#ffb3c6" />
      <Flowerpot p={[-80, 0, -6.4]} noWord color="#fff3a8" />

      <NeonSign p={[-61, 3.0, 6.9]} ry={Math.PI} text="カラオケ" color="#ff6fb5" />
      <NeonSign p={[-97, 3.0, -6.9]} text="居酒屋" color="#ffb46b" />
      <NeonSign p={[-61, 3.1, -6.9]} text="COFFEE" color="#7fe0ff" />

      <Planter p={[-70, 0, 0]} w={3} />
      <Planter p={[-94, 0, 0]} w={3} />
      <Tree p={[-58, 0, 0]} scale={0.8} seed={21} />
      <Tree p={[-82, 0, 0]} scale={0.8} seed={22} />
      <StreetLamp p={[-44, 0, 0]} noWord />
      <StreetLamp p={[-100, 0, 0]} noWord />
      <Bicycle p={[-55.5, 0, 6.1]} ry={Math.PI / 2} color="#ffd36b" noWord />
      <Box p={[-93, 0.4, 6.4]} s={[0.4, 0.8, 0.4]} m={std('#c9c2b6')} />
      <Sph p={[-93, 0.95, 6.4]} s={0.2} m={glow('#fff1d8', '#ffc77a', 0.2, 2.4)} />

      <Cat p={[-70, 0, 5.5]} color="#4a4a52" points={[[-72, 5.6], [-64, 5.4], [-68, 4.8]]} />
    </group>
  );
}
