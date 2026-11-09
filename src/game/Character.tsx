import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Outlines } from '@react-three/drei';
import { G } from '../world/parts';
import { toon } from '../world/materials';
import { faceTexture } from '../world/textures';
import type { AnimState } from './runtime';

export interface CharacterLook {
  hairStyle: 'long' | 'short' | 'twin' | 'bun' | 'bald';
  hair: string;
  outfit: string;
  accent: string;
  skin: string;
  eye?: string;
  skirt?: boolean;
  apron?: string;
  hat?: string;
  scale?: number;
}

export interface AnimSource {
  anim: AnimState;
  speed: number;
  /** Optional: true while this character is talking (NPCs). */
  talking?: boolean;
}

const OUTLINE = '#3b2c3f';

/** Face is a front slice of a sphere so the texture wraps the head naturally. */
const faceGeo = new THREE.SphereGeometry(1.004, 24, 16, Math.PI * 0.5 - 0.95, 1.9, Math.PI * 0.3, Math.PI * 0.42);

function Part({ geo, mat, p, s, r, outline = true }: { geo: THREE.BufferGeometry; mat: THREE.Material; p?: [number, number, number]; s?: [number, number, number]; r?: [number, number, number]; outline?: boolean }) {
  return (
    <mesh geometry={geo} material={mat} position={p} scale={s} rotation={r} castShadow>
      {outline && <Outlines thickness={0.012} color={OUTLINE} screenspace={false} />}
    </mesh>
  );
}

const damp = (cur: number, target: number, k: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-k * dt));

export function Character({ look, source, hideHead }: { look: CharacterLook; source: AnimSource; hideHead?: boolean }) {
  const skin = toon(look.skin);
  const hair = toon(look.hair);
  const outfit = toon(look.outfit);
  const accent = toon(look.accent);
  const dark = toon('#3a3340');
  const shoe = toon('#5a4a52');
  const sock = toon('#fbf7f2');
  const apron = look.apron ? toon(look.apron) : null;
  const faceMat = useMemo(() => new THREE.MeshToonMaterial({ map: faceTexture(look.eye ?? '#6a7fd0', 'calm', look.skin), transparent: false }), [look.eye, look.skin]);

  const hips = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const elbowL = useRef<THREE.Group>(null);
  const elbowR = useRef<THREE.Group>(null);
  const hairBack = useRef<THREE.Group>(null);
  const phase = useRef(Math.random() * 10);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const a = source.anim;
    const sp = source.speed;
    const moving = a === 'walk' || a === 'run';
    const freq = a === 'run' ? 11 : 7.5;
    phase.current += dt * (moving ? freq * Math.max(0.6, sp / (a === 'run' ? 6.5 : 3.2)) : 1.6);
    const t = phase.current;
    const s = Math.sin(t);
    const k = 12;

    let legSwing = 0;
    let kneeBend = 0;
    let armSwing = 0;
    let lean = 0;
    let bob = 0;
    let armOut = 0.12;
    let elbow = -0.15;
    let headTilt = 0;
    let rArmLift = 0;
    let rElbow = 0;
    let lArmLift = 0;

    if (a === 'walk') {
      legSwing = s * 0.55;
      kneeBend = 0.35;
      armSwing = -s * 0.45;
      bob = Math.abs(Math.cos(t)) * 0.035;
      lean = 0.05;
    } else if (a === 'run') {
      legSwing = s * 0.95;
      kneeBend = 0.9;
      armSwing = -s * 0.9;
      elbow = -1.2;
      bob = Math.abs(Math.cos(t)) * 0.07;
      lean = 0.22;
    } else if (a === 'jump') {
      legSwing = 0.25;
      kneeBend = 0.9;
      armOut = 0.6;
      lArmLift = -0.6;
      rArmLift = -0.6;
      elbow = -0.4;
    } else if (a === 'interact') {
      rArmLift = -1.35;
      rElbow = 0.1;
      lean = 0.08;
      headTilt = 0.15;
    } else if (a === 'inspect') {
      lean = 0.18;
      headTilt = 0.35;
      rArmLift = -1.0;
      rElbow = -1.6;
    } else {
      // idle breathing
      bob = Math.sin(t * 1.2) * 0.006;
      headTilt = Math.sin(t * 0.5) * 0.05;
    }
    if (source.talking) {
      headTilt = Math.sin(t * 3) * 0.08;
      rArmLift = -0.5 + Math.sin(t * 2.4) * 0.25;
      rElbow = -0.9;
    }

    const legLx = legSwing;
    const legRx = -legSwing;
    if (legL.current && legR.current && kneeL.current && kneeR.current) {
      legL.current.rotation.x = damp(legL.current.rotation.x, a === 'jump' ? -0.5 : -legLx, k, dt);
      legR.current.rotation.x = damp(legR.current.rotation.x, a === 'jump' ? -0.1 : -legRx, k, dt);
      const kl = moving ? Math.max(0, Math.sin(t + Math.PI * 0.5)) * kneeBend : a === 'jump' ? kneeBend : 0;
      const kr = moving ? Math.max(0, Math.sin(t + Math.PI * 1.5)) * kneeBend : a === 'jump' ? kneeBend * 0.6 : 0;
      kneeL.current.rotation.x = damp(kneeL.current.rotation.x, kl, k, dt);
      kneeR.current.rotation.x = damp(kneeR.current.rotation.x, kr, k, dt);
    }
    if (armL.current && armR.current && elbowL.current && elbowR.current) {
      armL.current.rotation.x = damp(armL.current.rotation.x, armSwing + lArmLift, k, dt);
      armR.current.rotation.x = damp(armR.current.rotation.x, -armSwing + rArmLift, k, dt);
      armL.current.rotation.z = damp(armL.current.rotation.z, armOut, k, dt);
      armR.current.rotation.z = damp(armR.current.rotation.z, -armOut, k, dt);
      elbowL.current.rotation.x = damp(elbowL.current.rotation.x, elbow, k, dt);
      elbowR.current.rotation.x = damp(elbowR.current.rotation.x, rElbow || elbow, k, dt);
    }
    if (hips.current) hips.current.position.y = damp(hips.current.position.y, 0.78 + bob, 20, dt);
    if (torso.current) {
      torso.current.rotation.x = damp(torso.current.rotation.x, lean, 8, dt);
      torso.current.rotation.y = damp(torso.current.rotation.y, moving ? s * 0.08 : 0, 8, dt);
      const breathe = a === 'idle' ? 1 + Math.sin(t * 1.2) * 0.012 : 1;
      torso.current.scale.y = breathe;
    }
    if (head.current) head.current.rotation.x = damp(head.current.rotation.x, headTilt - lean * 0.6, 8, dt);
    if (hairBack.current) hairBack.current.rotation.x = damp(hairBack.current.rotation.x, moving ? 0.15 + Math.abs(s) * (a === 'run' ? 0.25 : 0.08) : 0.02, 6, dt);
  });

  const sc = look.scale ?? 1;
  const longHair = look.hairStyle === 'long';
  const twin = look.hairStyle === 'twin';
  const bun = look.hairStyle === 'bun';
  const bald = look.hairStyle === 'bald';

  const leg = (side: 1 | -1, ref: React.RefObject<THREE.Group | null>, knee: React.RefObject<THREE.Group | null>) => (
    <group ref={ref} position={[0.085 * side, 0, 0]}>
      <Part geo={G.capsule} mat={look.skirt ? skin : outfit} p={[0, -0.18, 0]} s={[0.1, 0.24, 0.1]} />
      <group ref={knee} position={[0, -0.38, 0]}>
        <Part geo={G.capsule} mat={look.skirt ? sock : outfit} p={[0, -0.17, 0]} s={[0.085, 0.22, 0.085]} />
        <Part geo={G.box} mat={shoe} p={[0, -0.36, 0.035]} s={[0.1, 0.07, 0.19]} />
      </group>
    </group>
  );

  const arm = (side: 1 | -1, ref: React.RefObject<THREE.Group | null>, el: React.RefObject<THREE.Group | null>) => (
    <group ref={ref} position={[0.19 * side, 0.4, 0]}>
      <Part geo={G.capsule} mat={outfit} p={[0, -0.12, 0]} s={[0.075, 0.15, 0.075]} />
      <group ref={el} position={[0, -0.25, 0]}>
        <Part geo={G.capsule} mat={skin} p={[0, -0.1, 0]} s={[0.062, 0.13, 0.062]} />
        <Part geo={G.sphere} mat={skin} p={[0, -0.22, 0]} s={[0.045, 0.05, 0.045]} outline={false} />
      </group>
    </group>
  );

  return (
    <group scale={sc}>
      <group ref={hips} position={[0, 0.78, 0]}>
        {leg(1, legL, kneeL)}
        {leg(-1, legR, kneeR)}
        {look.skirt ? (
          <Part geo={G.taper(0.55, 18)} mat={outfit} p={[0, -0.09, 0]} s={[0.26, 0.24, 0.22]} />
        ) : (
          <Part geo={G.taper(0.85, 14)} mat={dark} p={[0, -0.04, 0]} s={[0.19, 0.14, 0.15]} />
        )}
        <group ref={torso}>
          <Part geo={G.capsule} mat={outfit} p={[0, 0.24, 0]} s={[0.3, 0.2, 0.2]} />
          {/* sailor-style collar + ribbon */}
          <Part geo={G.box} mat={accent} p={[0, 0.4, -0.06]} s={[0.26, 0.04, 0.12]} outline={false} />
          <Part geo={G.sphere} mat={accent} p={[0, 0.34, 0.11]} s={[0.05, 0.035, 0.03]} outline={false} />
          <Part geo={G.cone(8)} mat={accent} p={[0.03, 0.29, 0.11]} s={[0.025, 0.07, 0.015]} r={[0, 0, 0.4]} outline={false} />
          <Part geo={G.cone(8)} mat={accent} p={[-0.03, 0.29, 0.11]} s={[0.025, 0.07, 0.015]} r={[0, 0, -0.4]} outline={false} />
          {apron && <Part geo={G.box} mat={apron} p={[0, 0.12, 0.1]} s={[0.24, 0.34, 0.02]} outline={false} />}
          <Part geo={G.cyl(10)} mat={dark} p={[0, 0.05, 0]} s={[0.155, 0.04, 0.105]} outline={false} />
          {arm(1, armL, elbowL)}
          {arm(-1, armR, elbowR)}
          <Part geo={G.cyl(10)} mat={skin} p={[0, 0.47, 0]} s={[0.04, 0.08, 0.04]} outline={false} />
          <group ref={head} position={[0, 0.66, 0]} visible={!hideHead}>
            <Part geo={G.sphere} mat={skin} s={[0.17, 0.165, 0.16]} />
            <mesh geometry={faceGeo} material={faceMat} scale={[0.17, 0.165, 0.16]} />
            {!bald && (
              <>
                {/* crown + bangs */}
                <Part geo={G.sphere} mat={hair} p={[0, 0.045, -0.012]} s={[0.185, 0.17, 0.18]} />
                <Part geo={G.sphere} mat={hair} p={[0, 0.08, 0.1]} s={[0.17, 0.07, 0.085]} r={[0.4, 0, 0]} outline={false} />
                <Part geo={G.cone(6)} mat={hair} p={[-0.07, 0.02, 0.135]} s={[0.04, 0.12, 0.03]} r={[0.25, 0, 0.15]} outline={false} />
                <Part geo={G.cone(6)} mat={hair} p={[0.07, 0.02, 0.135]} s={[0.04, 0.12, 0.03]} r={[0.25, 0, -0.15]} outline={false} />
                <Part geo={G.cone(6)} mat={hair} p={[0, 0.0, 0.15]} s={[0.035, 0.1, 0.025]} r={[0.3, 0, 0]} outline={false} />
                {/* side locks */}
                <Part geo={G.capsule} mat={hair} p={[0.15, -0.07, 0.04]} s={[0.04, longHair || twin ? 0.16 : 0.08, 0.05]} />
                <Part geo={G.capsule} mat={hair} p={[-0.15, -0.07, 0.04]} s={[0.04, longHair || twin ? 0.16 : 0.08, 0.05]} />
                {/* ahoge */}
                <Part geo={G.cone(5)} mat={hair} p={[0.02, 0.22, 0.02]} s={[0.015, 0.08, 0.015]} r={[-0.5, 0, 0.3]} outline={false} />
              </>
            )}
            {bald && <Part geo={G.sphere} mat={hair} p={[0, -0.02, -0.05]} s={[0.175, 0.12, 0.15]} outline={false} />}
            <group ref={hairBack} position={[0, 0.05, -0.08]}>
              {longHair && <Part geo={G.capsule} mat={hair} p={[0, -0.25, -0.04]} s={[0.3, 0.38, 0.13]} />}
              {look.hairStyle === 'short' && <Part geo={G.sphere} mat={hair} p={[0, -0.08, -0.02]} s={[0.17, 0.14, 0.12]} />}
              {twin && (
                <>
                  <Part geo={G.capsule} mat={hair} p={[0.2, -0.25, 0]} s={[0.1, 0.38, 0.1]} r={[0, 0, 0.15]} />
                  <Part geo={G.capsule} mat={hair} p={[-0.2, -0.25, 0]} s={[0.1, 0.38, 0.1]} r={[0, 0, -0.15]} />
                  <Part geo={G.sphere} mat={accent} p={[0.17, 0.02, 0.02]} s={[0.04, 0.04, 0.04]} outline={false} />
                  <Part geo={G.sphere} mat={accent} p={[-0.17, 0.02, 0.02]} s={[0.04, 0.04, 0.04]} outline={false} />
                </>
              )}
              {bun && <Part geo={G.sphere} mat={hair} p={[0, 0.12, -0.04]} s={[0.09, 0.09, 0.09]} />}
            </group>
            {look.hat && (
              <group position={[0, 0.13, 0]}>
                <Part geo={G.cyl(18)} mat={toon(look.hat)} p={[0, 0, 0.02]} s={[0.23, 0.02, 0.23]} />
                <Part geo={G.cyl(18)} mat={toon(look.hat)} p={[0, 0.06, 0]} s={[0.16, 0.12, 0.16]} />
              </group>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}
