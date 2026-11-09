import { useMemo } from 'react';
import { Interact, Quad, Box, Cyl } from '../parts';
import { signTexture } from '../textures';
import {
  VendingMachine,
  PhoneBooth,
  Bicycle,
  Postbox,
  StreetLamp,
  UtilityPole,
  Wires,
  TrafficLight,
  RoadSign,
  Bench,
  Car,
  Bus,
  BusStop,
  FireHydrant,
  Flowerpot,
  Tree,
  Crosswalk,
  Motorbike,
  Planter,
} from '../Props';
import { Cat, Bird } from '../../game/Animals';

function ABoard({ p, ry = 0 }: { p: [number, number, number]; ry?: number }) {
  const tex = useMemo(() => signTexture('焼きたて', { sub: 'FRESH BREAD', bg: '#2f3a32', fg: '#fdf3d8', w: 256, h: 192 }), []);
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Interact words={['signboard']} radius={1.4} h={1.2}>
        <Box p={[0, 0.5, 0.12]} s={[0.6, 0.9, 0.04]} r={[-0.18, 0, 0]} c="#8a6244" solid />
        <Box p={[0, 0.5, -0.12]} s={[0.6, 0.9, 0.04]} r={[0.18, 0, 0]} c="#8a6244" />
        <Quad p={[0, 0.52, 0.152]} r={[-0.18, 0, 0]} s={[0.5, 0.38]} map={tex} />
      </Interact>
    </group>
  );
}

export function MainStreet() {
  const poles: [number, number][] = [
    [-29, -6.5],
    [-17, -6.5],
    [-6, -6.5],
    [7, -6.5],
    [19, -6.5],
    [30, -6.5],
  ];
  return (
    <group>
      {/* north sidewalk */}
      {poles.map(([x, z], i) => (
        <UtilityPole key={x} p={[x, 0, z]} noWord={i !== 2} />
      ))}
      <Wires points={poles} />
      <StreetLamp p={[-24, 0, -4.1]} noWord={false} />
      <StreetLamp p={[-11, 0, -4.1]} />
      <StreetLamp p={[12, 0, -4.1]} />
      <StreetLamp p={[25, 0, -4.1]} />
      <StreetLamp p={[-18, 0, 4.1]} ry={Math.PI} />
      <StreetLamp p={[-3.8, 0, 4.1]} ry={Math.PI} />
      <StreetLamp p={[16, 0, 4.1]} ry={Math.PI} />
      <StreetLamp p={[28, 0, 4.1]} ry={Math.PI} />

      <VendingMachine p={[-22.6, 0, -6.45]} />
      <VendingMachine p={[-21.5, 0, -6.45]} color="#3d8bd9" words={['drink']} />
      <PhoneBooth p={[-29.2, 0, -5.3]} />
      <Flowerpot p={[-19.8, 0, -6.4]} />
      <Flowerpot p={[-18.6, 0, -6.5]} color="#ffd36b" words={['flower']} />
      <Flowerpot p={[-14.4, 0, -6.5]} color="#c9a7ff" noWord />
      <Bicycle p={[-7.4, 0, -5.9]} ry={Math.PI / 2} color="#ffffff" noWord />
      <FireHydrant p={[5.6, 0, -6.4]} />
      <ABoard p={[9, 0, -6.1]} ry={0.2} />
      <Bicycle p={[10.6, 0, -5.9]} ry={Math.PI / 2} />
      <Bench p={[17, 0, -6.3]} />
      <Postbox p={[24.2, 0, -6.4]} />
      <Tree p={[3.6, 0, -6.2]} scale={0.7} seed={3} />
      <Tree p={[-3.6, 0, 6.2]} scale={0.7} seed={4} />
      <Tree p={[29.6, 0, 6.2]} scale={0.75} seed={5} />
      <Planter p={[-26, 0, 6.5]} w={3} />

      {/* south sidewalk */}
      <BusStop p={[-27.5, 0, 4.7]} ry={Math.PI} />
      <Bus p={[-17, 0, 1.9]} ry={Math.PI / 2} />
      <Motorbike p={[18.4, 0, 5.6]} ry={Math.PI / 2} />
      <RoadSign p={[-4.6, 0, 5.4]} ry={Math.PI} />
      <TrafficLight p={[-4.3, 0, -4.5]} />
      <TrafficLight p={[4.3, 0, 4.5]} ry={Math.PI} />
      <Crosswalk p={[0, 0, 0]} width={4} len={6.8} />
      <Car p={[12, 0, -1.9]} ry={Math.PI / 2} color="#f2efe8" />
      <Car p={[23, 0, 1.9]} ry={-Math.PI / 2} color="#ffd34d" words={['taxi']} taxi />
      <Car p={[-25, 0, -1.9]} ry={Math.PI / 2} color="#9ec9f0" />

      {/* konbini forecourt */}
      <VendingMachine p={[-4.55, 0, 8.6]} ry={Math.PI / 2} color="#f2f2f2" noWord />
      <Bicycle p={[-20.2, 0, 6.2]} ry={Math.PI / 2} color="#f6a6c1" noWord />
      <Box p={[-6.2, 0.45, 6.6]} s={[0.5, 0.9, 0.4]} c="#3a9a5c" />
      <Cyl p={[-6.2, 0.95, 6.6]} rad={0.2} h={0.1} c="#2b2b30" />

      <Cat p={[-24, 0, -5.4]} points={[[-26, -5.3], [-17, -5.5], [-21, -5.0], [-28, -5.4]]} />
      <Bird p={[15.5, 0.07, -5.0]} />
      <Bird p={[-9, 0.07, 5.2]} color="#c7a27a" />
    </group>
  );
}
