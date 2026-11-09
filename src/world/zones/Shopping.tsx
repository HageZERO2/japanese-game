import * as THREE from 'three';
import { useMemo } from 'react';
import { Interact, Box, Cyl, Sph, Quad, G } from '../parts';
import { std, toon } from '../materials';
import { signTexture } from '../textures';
import { ProduceStand, Mannequin, DisplayTable, Kiosk, LanternString, Bench, Planter, Bicycle, VendingMachine, Tree, StreetLamp } from '../Props';
import { Bird } from '../../game/Animals';

/** Tall vertical "nobori" banner flag. */
export function Nobori({ p, text, color, words }: { p: [number, number, number]; text: string; color: string; words?: string[] }) {
  const tex = useMemo(() => signTexture(text, { vertical: true, bg: color, fg: '#ffffff', w: 128, h: 512 }), [text, color]);
  const inner = (
    <>
      <Cyl p={[0, 1.6, 0]} rad={0.025} h={3.2} c="#dcdcdc" solid />
      <Cyl p={[0.3, 3.1, 0]} rad={0.015} h={0.6} r={[0, 0, Math.PI / 2]} c="#dcdcdc" />
      <mesh geometry={G.plane} position={[0.3, 2.0, 0]} scale={[0.55, 2.2, 1]} material={std('#ffffff', { map: tex, side: THREE.DoubleSide })} castShadow />
      <Cyl p={[0, 0.06, 0]} rad={0.18} h={0.12} c="#5a5a60" />
    </>
  );
  if (!words) return <group position={p}>{inner}</group>;
  return (
    <group position={p}>
      <Interact words={words} radius={1.4} h={3.4}>
        {inner}
      </Interact>
    </group>
  );
}

const Dango = () => (
  <group>
    <Cyl p={[0, 0.2, 0]} rad={0.01} h={0.4} c="#e5cfa5" />
    <Sph p={[0, 0.12, 0]} s={0.06} m={toon('#8fd18a')} />
    <Sph p={[0, 0.23, 0]} s={0.06} m={toon('#ffffff')} />
    <Sph p={[0, 0.34, 0]} s={0.06} m={toon('#ffb3c6')} />
  </group>
);
const Daifuku = () => (
  <group>
    {[-0.12, 0.12].map((x) => (
      <Sph key={x} p={[x, 0.07, 0]} s={[0.1, 0.07, 0.1]} m={toon('#fdf8f2')} />
    ))}
    <Sph p={[0, 0.07, 0.15]} s={[0.1, 0.07, 0.1]} m={toon('#f7c6d5')} />
  </group>
);
const Taiyaki = () => (
  <group>
    {[-0.12, 0.12].map((x) => (
      <group key={x} position={[x, 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Sph s={[0.06, 0.03, 0.14]} m={toon('#c9873e')} />
        <mesh geometry={G.cone(3)} material={toon('#c9873e')} position={[0, 0, -0.17]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.07, 0.07, 0.02]} />
      </group>
    ))}
  </group>
);

const Hat = () => (
  <group>
    <Cyl p={[0, 0.03, 0]} rad={0.22} h={0.02} m={toon('#f3e2b5')} />
    <Cyl p={[0, 0.1, 0]} rad={0.12} h={0.14} m={toon('#f3e2b5')} />
    <Cyl p={[0, 0.06, 0]} rad={0.125} h={0.03} m={toon('#e86a8a')} />
  </group>
);
const Shoes = () => (
  <group>
    {[-0.08, 0.08].map((x) => (
      <group key={x} position={[x, 0.05, 0]}>
        <Box s={[0.1, 0.08, 0.26]} m={toon('#f6f6f6')} />
        <Box p={[0, -0.03, 0]} s={[0.11, 0.03, 0.27]} m={toon('#e86a8a')} />
      </group>
    ))}
  </group>
);
const Bear = () => (
  <group>
    <Sph p={[0, 0.12, 0]} s={[0.12, 0.13, 0.1]} m={toon('#d9a066')} />
    <Sph p={[0, 0.3, 0]} s={0.1} m={toon('#d9a066')} />
    <Sph p={[0.07, 0.38, 0]} s={0.035} m={toon('#d9a066')} />
    <Sph p={[-0.07, 0.38, 0]} s={0.035} m={toon('#d9a066')} />
    <Sph p={[0, 0.28, 0.08]} s={0.035} m={toon('#f4dcc0')} />
  </group>
);
const Robot = () => (
  <group>
    <Box p={[0, 0.12, 0]} s={[0.16, 0.18, 0.1]} m={toon('#a5c8e8')} />
    <Box p={[0, 0.28, 0]} s={[0.14, 0.12, 0.1]} m={toon('#d6e6f5')} />
    <Sph p={[0.035, 0.29, 0.05]} s={0.015} m={std('#ff5a5a', { emissive: '#ff5a5a' })} />
    <Sph p={[-0.035, 0.29, 0.05]} s={0.015} m={std('#ff5a5a', { emissive: '#ff5a5a' })} />
    <Cyl p={[0, 0.38, 0]} rad={0.008} h={0.08} c="#888" />
  </group>
);
const Ball = () => <Sph p={[0, 0.15, 0]} s={0.15} m={toon('#ff8c5a')} />;
const Fan = () => (
  <group position={[0, 0.2, 0]} rotation={[-0.4, 0, 0]}>
    <mesh geometry={G.cyl(20)} material={std('#e85d75', { side: THREE.DoubleSide })} scale={[0.22, 0.01, 0.22]} rotation={[Math.PI / 2, 0, 0]} />
  </group>
);
const LuckyCat = () => (
  <group>
    <Sph p={[0, 0.12, 0]} s={[0.1, 0.12, 0.09]} m={toon('#ffffff')} />
    <Sph p={[0, 0.28, 0]} s={0.09} m={toon('#ffffff')} />
    <mesh geometry={G.cone(4)} material={toon('#ffffff')} position={[0.05, 0.36, 0]} scale={[0.03, 0.05, 0.02]} />
    <mesh geometry={G.cone(4)} material={toon('#ffffff')} position={[-0.05, 0.36, 0]} scale={[0.03, 0.05, 0.02]} />
    <Sph p={[0.1, 0.3, 0.02]} s={[0.03, 0.06, 0.03]} m={toon('#ffffff')} />
    <Sph p={[0, 0.17, 0.085]} s={0.03} m={toon('#f2c14e')} />
    <Box p={[0, 0.2, 0.08]} s={[0.1, 0.02, 0.01]} m={toon('#e0352b')} />
  </group>
);
const Bag = () => (
  <group>
    <Box p={[0, 0.12, 0]} s={[0.26, 0.2, 0.1]} m={toon('#c48a5a')} />
    <mesh geometry={G.torus(0.12, Math.PI)} material={toon('#8a5a3a')} position={[0, 0.22, 0]} scale={0.08} />
  </group>
);
const Wallet = () => <Box p={[0, 0.03, 0]} s={[0.2, 0.04, 0.12]} m={toon('#e86a8a')} />;
const Glasses = () => (
  <group position={[0, 0.05, 0]}>
    {[-0.06, 0.06].map((x) => (
      <mesh key={x} geometry={G.torus(0.15)} material={std('#333')} position={[x, 0, 0]} scale={0.045} />
    ))}
  </group>
);
const Watch = () => (
  <group position={[0, 0.04, 0]}>
    <Cyl rad={0.05} h={0.02} c="#d9d9d9" />
    <Box s={[0.04, 0.012, 0.22]} m={toon('#5a3a2a')} />
  </group>
);
const PriceTag = () => (
  <group>
    <Box p={[0, 0.12, 0]} s={[0.25, 0.18, 0.02]} c="#ffd34d" />
  </group>
);
const OpenUmbrella = ({ c }: { c: string }) => (
  <group>
    <Cyl p={[0, 0.5, 0]} rad={0.012} h={1} c="#555" />
    <mesh geometry={G.cone(8)} material={std(c, { side: THREE.DoubleSide })} position={[0, 0.95, 0]} scale={[0.5, 0.25, 0.5]} castShadow />
  </group>
);

export function Shopping() {
  return (
    <group>
      {/* overhead lantern strings zig-zag across the arcade */}
      {[36, 48, 60, 72, 84, 96].map((x, i) => (
        <LanternString key={x} from={[x, -6.8]} to={[x + 6, 6.8]} y={4.7} count={7} alt={i % 2 === 1} />
      ))}

      {/* north side */}
      <ProduceStand
        p={[37, 0, -5.7]}
        items={[
          { word: 'vegetables', color: '#6fbf4a' },
          { word: 'tomato', color: '#e8412c' },
          { word: 'carrot', color: '#f08a24', shape: 'long' },
          { word: 'fruit', color: '#f6c445' },
          { word: 'watermelon', color: '#2f8f3a', shape: 'big' },
        ]}
      />
      <Nobori p={[42.4, 0, -6.4]} text="新鮮野菜" color="#3f8f3a" words={['flag']} />
      <Mannequin p={[45.6, 0, -5.9]} outfit="#f6a6c1" words={['tshirt']} />
      <Mannequin p={[47.3, 0, -5.9]} outfit="#fff1c9" skirt words={['skirt']} />
      <Mannequin p={[49, 0, -5.9]} outfit="#8aa8d6" words={['jacket']} />
      <DisplayTable
        p={[52.4, 0, -5.7]}
        cloth="#f3e6f4"
        items={[
          { word: 'hat', node: <Hat /> },
          { word: 'shoes', node: <Shoes /> },
        ]}
      />
      <Bicycle p={[56.3, 0, -5.8]} ry={Math.PI / 2} color="#7cc4a4" noWord />
      <DisplayTable
        p={[72.5, 0, -5.7]}
        cloth="#fff3d1"
        items={[
          { word: 'stuffed_toy', node: <Bear /> },
          { word: 'robot', node: <Robot /> },
          { word: 'ball', node: <Ball /> },
        ]}
      />
      <Nobori p={[77.6, 0, -6.4]} text="おもちゃ" color="#f08a4b" />
      <DisplayTable
        p={[85, 0, -5.7]}
        cloth="#efe0c6"
        items={[
          { word: 'folding_fan', node: <Fan /> },
          { word: 'maneki_neko', node: <LuckyCat /> },
        ]}
      />
      <Nobori p={[89.8, 0, -6.4]} text="お土産" color="#7a2a2a" />
      <group position={[97, 0, -5.7]}>
        <Box p={[0, 0.45, 0]} s={[3.2, 0.9, 0.9]} c="#e9f4f8" solid />
        <Box p={[0, 0.92, 0]} s={[3.1, 0.06, 0.85]} c="#dff3fb" />
        {[-1.1, -0.4, 0.3, 1.0].map((x, i) => (
          <Sph key={x} p={[x, 1.0, 0]} s={[0.12, 0.06, 0.3]} m={toon(['#8fb3c9', '#e9a07a', '#c9d4dc', '#f2b48c'][i])} />
        ))}
      </group>

      {/* south side */}
      <DisplayTable
        p={[37, 0, 5.7]}
        ry={Math.PI}
        cloth="#efd9e4"
        items={[
          { word: 'dango', node: <Dango /> },
          { word: 'daifuku', node: <Daifuku /> },
          { word: 'taiyaki', node: <Taiyaki /> },
        ]}
      />
      <Nobori p={[42.6, 0, 6.4]} text="和菓子" color="#8c3b5c" />
      <Kiosk p={[49, 0, 5.3]} ry={Math.PI} title="たこ焼き" color="#d9443c">
        <group position={[0, 1.02, 0.1]}>
          {[-0.6, 0, 0.6].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <Box s={[0.5, 0.04, 0.4]} c="#2b2b30" />
              {[-0.12, 0, 0.12].map((dx) => [-0.1, 0.1].map((dz) => <Sph key={`${dx}${dz}`} p={[dx, 0.05, dz]} s={0.05} m={toon('#c9873e')} />))}
            </group>
          ))}
        </group>
      </Kiosk>
      <DisplayTable
        p={[61, 0, 5.7]}
        ry={Math.PI}
        cloth="#efeaf7"
        items={[
          { word: 'bag', node: <Bag /> },
          { word: 'wallet', node: <Wallet /> },
          { word: 'glasses', node: <Glasses /> },
          { word: 'wristwatch', node: <Watch /> },
        ]}
      />
      <group position={[85, 0, 5.8]}>
        <Interact words={['umbrella']} radius={1.6} h={1.5}>
          {['#7ccac4', '#f6a6c1', '#ffd36b'].map((c, i) => (
            <group key={c} position={[(i - 1) * 0.9, 0, 0]}>
              <OpenUmbrella c={c} />
            </group>
          ))}
        </Interact>
      </group>
      <DisplayTable p={[97, 0, 5.7]} ry={Math.PI} cloth="#fff4dd" items={[{ word: 'buy', node: <PriceTag /> }]} />
      <Quad p={[97, 1.24, 5.68]} r={[0, Math.PI, 0]} s={[0.24, 0.16]} map={signTexture('¥100', { bg: '#ffd34d', fg: '#c0392b', w: 128, h: 96 })} />
      <VendingMachine p={[67.6, 0, 6.4]} ry={Math.PI} color="#f08a4b" words={['drink']} />

      {/* center of the arcade */}
      <Bench p={[60, 0, 0]} ry={Math.PI / 2} />
      <Bench p={[60, 0, 1.6]} ry={-Math.PI / 2} noWord />
      <Planter p={[66, 0, 0]} w={3} />
      <Planter p={[90, 0, 0]} w={3} />
      <Bench p={[84, 0, -1]} ry={0} noWord />
      <Tree p={[78, 0, 0]} scale={0.75} seed={11} />
      <Tree p={[42, 0, 0]} scale={0.75} seed={12} />
      <StreetLamp p={[54, 0, 0]} noWord />
      <StreetLamp p={[100, 0, 0]} noWord />
      <Bird p={[70, 0.05, 2]} color="#a9c8e8" />
    </group>
  );
}
