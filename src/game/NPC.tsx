import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { Character, type AnimSource } from './Character';
import { NPCS, type NpcDef } from '../data/npcs';
import { Interact, Solid, G } from '../world/parts';
import { player } from './runtime';
import { useUI } from '../state/ui';
import { useGame } from '../state/store';
import { basic } from '../world/materials';
import { signTexture } from '../world/textures';
import type { LocationId } from '../types';

function NameTag({ def, y }: { def: NpcDef; y: number }) {
  const tex = useMemo(() => signTexture(def.jpName, { sub: def.name, bg: '#fffaf3', fg: '#4a3a52', w: 384, h: 128, border: '#f3b6c9' }), [def]);
  const questState = useGame((s) => (def.quest ? s.quests[def.quest] : undefined));
  const mark = def.quest && !questState ? '!' : def.quest && questState === 'active' ? '…' : null;
  const markTex = useMemo(() => (mark ? signTexture(mark, { bg: mark === '!' ? '#ffcf4a' : '#d9d3e8', fg: '#5a3a1a', w: 128, h: 128 }) : null), [mark]);
  return (
    <Billboard position={[0, y, 0]}>
      <mesh scale={[0.72, 0.24, 1]} material={basic('#ffffff', { map: tex, transparent: true, fog: false })} geometry={G.plane} />
      {markTex && <mesh position={[0, 0.32, 0]} scale={[0.26, 0.26, 1]} material={basic('#ffffff', { map: markTex, fog: false })} geometry={G.plane} />}
    </Billboard>
  );
}

function NPC({ def }: { def: NpcDef }) {
  const body = useRef<THREE.Group>(null);
  const source = useRef<AnimSource>({ anim: 'idle', speed: 0, talking: false });
  const home = useMemo(() => new THREE.Vector3(...def.pos), [def]);

  const root = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    const talking = useUI.getState().dialog?.npcId === def.id;
    source.current.talking = talking;
    if (root.current) root.current.visible = player.location === def.location && player.pos.distanceTo(home) < 70;
    if (!body.current) return;
    const near = player.location === def.location && player.pos.distanceTo(home) < 6;
    const target = near ? Math.atan2(player.pos.x - home.x, player.pos.z - home.z) : def.yaw;
    let d = target - body.current.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    body.current.rotation.y += d * (1 - Math.exp(-5 * Math.min(dt, 0.05)));
  });

  const scale = def.look.scale;
  return (
    <group ref={root} position={def.pos}>
      <Interact kind="npc" npcId={def.id} label={`${def.name} (${def.role})`} radius={2.4} h={1.75 * scale} noMarker>
        <group ref={body} rotation={[0, def.yaw, 0]}>
          <Character look={def.look} source={source.current} />
        </group>
      </Interact>
      <Solid p={[0, 0.8, 0]} s={[0.55, 1.6, 0.55]} />
      <NameTag def={def} y={1.95 * scale + 0.2} />
    </group>
  );
}

export function NPCs({ location }: { location: LocationId }) {
  const list = NPCS.filter((n) => n.location === location);
  return (
    <>
      {list.map((n) => (
        <NPC key={n.id} def={n} />
      ))}
    </>
  );
}
