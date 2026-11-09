import * as THREE from 'three';
import { useMemo } from 'react';
import { Box, Cyl, Quad, Interact, G, Solid } from './parts';
import { std, glow, M, registerGlow, basic } from './materials';
import { signTexture, pattern, rng, JP_FONT } from './textures';
import type { Building } from './layout';
import { INTERIOR_SPAWN } from '../interiors';
import { INTERIOR_NAMES } from '../data/progression';
import { useGame } from '../state/store';
import { PaperLantern, shade } from './Props';

const PX = 32; // facade texture pixels per meter

interface FacadeOpts {
  w: number;
  h: number;
  wall: string;
  trim: string;
  floors: number;
  groundShop: boolean;
  seed: number;
  style: Building['style'];
}

/** Paints a facade (wall + windows) and a matching emissive mask for lit windows at night. */
function facade(o: FacadeOpts) {
  const W = Math.max(64, Math.round(o.w * PX));
  const H = Math.max(64, Math.round(o.h * PX));
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    return [c, c.getContext('2d')!] as const;
  };
  const [c, g] = mk();
  const [ce, ge] = mk();
  const r = rng(o.seed);
  const trad = o.style === 'traditional';
  g.fillStyle = o.wall;
  g.fillRect(0, 0, W, H);
  ge.fillStyle = '#000';
  ge.fillRect(0, 0, W, H);
  if (trad) {
    // dark timber frame + plaster panels
    g.fillStyle = shade(o.trim, 1);
    for (let x = 0; x < W; x += PX * 1.8) g.fillRect(x, 0, PX * 0.18, H);
    g.fillRect(0, H * 0.5, W, PX * 0.2);
  } else if (o.style === 'apartment' || o.style === 'house') {
    g.fillStyle = 'rgba(0,0,0,0.05)';
    for (let y = 0; y < H; y += PX * 0.5) g.fillRect(0, y, W, 2);
  }
  const floorH = 3;
  const startFloor = o.groundShop ? 1 : 0;
  for (let f = startFloor; f < o.floors; f++) {
    const yTop = H - (f + 1) * floorH * PX + PX * 0.9;
    const n = Math.max(1, Math.floor(o.w / 2.6));
    const ww = trad ? PX * 1.4 : PX * 1.3;
    const wh = trad ? PX * 1.0 : PX * 1.4;
    for (let i = 0; i < n; i++) {
      const x = (o.w / n) * (i + 0.5) * PX - ww / 2;
      const lit = r() > 0.45;
      g.fillStyle = o.trim;
      g.fillRect(x - 4, yTop - 4, ww + 8, wh + 8);
      if (trad) {
        g.fillStyle = '#f6efdc';
        g.fillRect(x, yTop, ww, wh);
        g.fillStyle = o.trim;
        for (let k = 1; k < 4; k++) g.fillRect(x + (ww / 4) * k - 1, yTop, 2, wh);
        g.fillRect(x, yTop + wh / 2 - 1, ww, 2);
      } else {
        const grad = g.createLinearGradient(x, yTop, x + ww, yTop + wh);
        grad.addColorStop(0, '#cfe6f5');
        grad.addColorStop(0.5, '#9cc3dc');
        grad.addColorStop(1, '#d9ecf8');
        g.fillStyle = grad;
        g.fillRect(x, yTop, ww, wh);
        g.fillStyle = 'rgba(255,255,255,0.55)';
        g.beginPath();
        g.moveTo(x + 4, yTop + wh - 6);
        g.lineTo(x + ww * 0.4, yTop + 4);
        g.lineTo(x + ww * 0.55, yTop + 4);
        g.lineTo(x + 12, yTop + wh - 6);
        g.fill();
        g.fillStyle = o.trim;
        g.fillRect(x + ww / 2 - 1, yTop, 3, wh);
        // curtains
        if (r() > 0.4) {
          g.fillStyle = ['#f7c6d5', '#fff1c9', '#cfe8d7', '#e6dcf7'][Math.floor(r() * 4)];
          g.fillRect(x, yTop, ww * 0.22, wh);
          g.fillRect(x + ww * 0.78, yTop, ww * 0.22, wh);
        }
      }
      g.fillStyle = shade(o.trim, 0.8);
      g.fillRect(x - 6, yTop + wh + 4, ww + 12, 5);
      if (lit) {
        ge.fillStyle = trad ? '#ffd28a' : '#ffcf8f';
        ge.fillRect(x, yTop, ww, wh);
      }
    }
  }
  const tex = (cv: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const mat = new THREE.MeshStandardMaterial({ map: tex(c), emissiveMap: tex(ce), emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.85 });
  registerGlow(mat, 0, 1.25);
  return mat;
}

function stripes(color: string) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 32;
  const g = c.getContext('2d')!;
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? '#fffaf2' : color;
    g.fillRect(i * 16, 0, 16, 32);
  }
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(0, 26, 128, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function displayTex(kind: Building['display']) {
  if (kind === 'bookspines') return pattern('bookspines', [2, 1]);
  if (kind === 'fabric') return pattern('fabric', [3, 2], '#f2c6d6');
  return pattern('shelfgoods', [2, 1]);
}

const yawFor = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 } as const;

export function BuildingView({ b }: { b: Building }) {
  const sn = b.face === 's' || b.face === 'n';
  const W = sn ? b.w : b.d;
  const D = sn ? b.d : b.w;
  const H = b.h;
  const floors = Math.max(1, Math.round(H / 3.1));
  const seed = b.id.split('').reduce((a, ch) => a + ch.charCodeAt(0) * 7, 0);
  const groundShop = ['shop', 'konbini', 'cafe', 'police'].includes(b.style);
  const trad = b.style === 'traditional';

  const wallTex = useMemo(() => (trad ? pattern('planks', [Math.max(1, W / 4), Math.max(1, H / 4)], b.wall) : pattern('siding', [Math.max(1, W / 4), Math.max(1, H / 4)], b.wall)), [trad, W, H, b.wall]);
  const front = useMemo(() => facade({ w: W, h: H, wall: b.wall, trim: b.trim, floors, groundShop, seed, style: b.style }), [W, H, b.wall, b.trim, floors, groundShop, seed, b.style]);
  const side = useMemo(() => facade({ w: D, h: H, wall: b.wall, trim: b.trim, floors, groundShop: false, seed: seed + 3, style: b.style }), [D, H, b.wall, b.trim, floors, seed, b.style]);
  const signTex = useMemo(() => (b.sign ? signTexture(b.sign.text, { bg: b.sign.bg, fg: b.sign.fg, sub: b.sign.sub, glow: b.sign.neon, border: b.sign.neon ? undefined : shade(b.sign.fg, 1) }) : null), [b.sign]);
  const vertTex = useMemo(() => (b.sign ? signTexture(b.sign.text, { vertical: true, bg: b.sign.bg, fg: b.sign.fg, glow: b.sign.neon, w: 128, h: 128 * Math.max(2, [...b.sign.text].length) }) : null), [b.sign]);
  const awningMat = useMemo(() => (b.awning ? std('#ffffff', { map: stripes(b.awning), rough: 0.9, side: THREE.DoubleSide }) : null), [b.awning]);
  const tanakaQuest = useGame((s) => s.quests['home_sweet_home']);

  const wallMat = std(b.wall, { map: wallTex });
  const trimMat = std(b.trim);
  const roofTex = useMemo(() => pattern('roof', [Math.max(1, W / 3), Math.max(1, D / 3)], b.roof), [W, D, b.roof]);
  const roofMat = std('#ffffff', { map: roofTex, rough: 0.75 });

  const doorX = b.enter ? 0 : W > 9 ? -W * 0.28 : 0;
  const isEnter = !!b.enter;
  const locked = b.enter === 'house' && !tanakaQuest;

  let roof: React.ReactNode;
  if (b.style === 'house') {
    roof = (
      <>
        <mesh geometry={G.pyramid} material={roofMat} position={[0, H, 0]} scale={[W + 1.2, Math.min(W, D) * 0.38, D + 1.2]} castShadow />
        <Box p={[0, H - 0.05, 0]} s={[W + 1.25, 0.12, D + 1.25]} c={shade(b.roof, 0.8)} />
      </>
    );
  } else if (trad) {
    roof = (
      <>
        <mesh geometry={G.prism} material={roofMat} position={[0, H, 0]} rotation={[0, Math.PI / 2, 0]} scale={[D + 1.6, Math.min(3, D * 0.33), W + 1.0]} castShadow />
        <Box p={[0, H + 0.02, 0]} s={[W + 1.05, 0.16, D + 1.65]} c={shade(b.roof, 0.85)} />
        <Box p={[0, H + Math.min(3, D * 0.33), 0]} s={[W + 1.1, 0.2, 0.3]} c={shade(b.roof, 0.7)} />
        {/* lower eave over the shopfront */}
        <Box p={[0, 3.25, D / 2 + 0.55]} s={[W + 0.2, 0.1, 1.2]} m={roofMat} r={[0.28, 0, 0]} />
      </>
    );
  } else {
    roof = (
      <>
        <Box p={[0, H + 0.3, D / 2 - 0.1]} s={[W, 0.6, 0.2]} c={shade(b.wall, 0.92)} />
        <Box p={[0, H + 0.3, -D / 2 + 0.1]} s={[W, 0.6, 0.2]} c={shade(b.wall, 0.92)} />
        <Box p={[W / 2 - 0.1, H + 0.3, 0]} s={[0.2, 0.6, D]} c={shade(b.wall, 0.92)} />
        <Box p={[-W / 2 + 0.1, H + 0.3, 0]} s={[0.2, 0.6, D]} c={shade(b.wall, 0.92)} />
        <Box p={[0, H + 0.02, 0]} s={[W - 0.2, 0.04, D - 0.2]} c="#9a9a9f" cast={false} />
        {b.style === 'apartment' && <Cyl p={[W / 4, H + 1.0, -D / 4]} rad={0.7} h={1.6} c="#d9dde2" />}
        <Box p={[-W / 4, H + 0.4, -D / 5]} s={[0.9, 0.7, 0.6]} c="#e9ecef" />
      </>
    );
  }

  return (
    <group position={[b.x, 0, b.z]} rotation={[0, yawFor[b.face], 0]}>
      {/* body */}
      <mesh geometry={G.box} material={wallMat} position={[0, H / 2, 0]} scale={[W, H, D]} castShadow receiveShadow />
      <Solid p={[0, H / 2, 0]} s={[W, H, D]} />
      <mesh geometry={G.plane} material={front} position={[0, H / 2, D / 2 + 0.012]} scale={[W, H, 1]} receiveShadow />
      <mesh geometry={G.plane} material={side} position={[W / 2 + 0.012, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[D, H, 1]} />
      <mesh geometry={G.plane} material={side} position={[-W / 2 - 0.012, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[D, H, 1]} />
      <Box p={[0, 0.15, D / 2 + 0.05]} s={[W, 0.3, 0.12]} c={shade(b.wall, 0.75)} cast={false} />
      {roof}

      {/* storefront */}
      {groundShop && (
        <>
          <Box p={[0, 3.05, D / 2 + 0.06]} s={[W, 0.22, 0.14]} m={trimMat} />
          {b.display !== 'none' && (
            <>
              <mesh geometry={G.plane} position={[doorX + (doorX < 0 ? W * 0.35 : 0) + (doorX === 0 ? -W * 0.3 : 0), 1.55, D / 2 - 0.25]} scale={[W * 0.4, 2.1, 1]} material={glow('#ffffff', '#fff4e0', 0.15, 0.9, { map: displayTex(b.display) })} />
              {doorX === 0 && <mesh geometry={G.plane} position={[W * 0.3, 1.55, D / 2 - 0.25]} scale={[W * 0.36, 2.1, 1]} material={glow('#ffffff', '#fff4e0', 0.15, 0.9, { map: displayTex(b.display) })} />}
            </>
          )}
          {b.display === 'none' && <mesh geometry={G.plane} position={[0, 1.55, D / 2 - 0.25]} scale={[W - 0.6, 2.1, 1]} material={M.glassLit()} />}
          <Box p={[0, 1.5, D / 2 + 0.04]} s={[W - 0.5, 2.4, 0.04]} m={M.glass()} cast={false} />
          {[-W / 2 + 0.2, W / 2 - 0.2].map((x) => (
            <Box key={x} p={[x, 1.5, D / 2 + 0.08]} s={[0.25, 3, 0.18]} m={trimMat} />
          ))}
        </>
      )}

      {/* door */}
      <group position={[doorX, 0, D / 2]}>
        <Box p={[0, 1.15, 0.07]} s={[1.5, 2.3, 0.12]} m={trimMat} cast={false} />
        <Box p={[0, 1.1, 0.12]} s={[1.3, 2.15, 0.05]} m={groundShop ? M.glass() : trad ? std('#6b4a32', { map: pattern('wood', [1, 1], '#7a5638') }) : std(shade(b.trim, 0.9))} cast={false} />
        {!groundShop && !trad && <Box p={[0.45, 1.05, 0.17]} s={[0.06, 0.25, 0.05]} m={M.metal()} />}
        {!groundShop && <Box p={[0, 2.5, 0.45]} s={[1.9, 0.08, 0.9]} c={shade(b.trim, 1.05)} />}
        {!groundShop && !trad && <Box p={[0.95, 2.1, 0.15]} s={[0.25, 0.25, 0.06]} m={M.lamp()} />}
        {b.noren && signTex && (
          <group position={[0, 2.25, 0.32]}>
            {[-0.47, 0, 0.47].map((x, i) => (
              <mesh key={x} geometry={G.plane} position={[x, 0, 0]} scale={[0.44, 0.75, 1]} material={std(b.noren!, { side: THREE.DoubleSide, map: i === 1 ? signTexture(b.sign!.text.slice(0, 2), { vertical: false, bg: b.noren, fg: '#fff6e6', w: 128, h: 192 }) : undefined })} />
            ))}
            <Cyl p={[0, 0.38, 0]} rad={0.025} h={1.6} r={[0, 0, Math.PI / 2]} c="#6b4a32" />
          </group>
        )}
        {trad && (
          <>
            <PaperLantern p={[-1.05, 2.0, 0.4]} color="red" />
            <PaperLantern p={[1.05, 2.0, 0.4]} color="red" />
          </>
        )}
        {isEnter ? (
          <Interact
            kind="door"
            label={locked ? 'Door (locked)' : `Enter ${INTERIOR_NAMES[b.enter!].name}`}
            door={{ to: b.enter!, spawn: [INTERIOR_SPAWN[b.enter!].x, 0, INTERIOR_SPAWN[b.enter!].z], yaw: INTERIOR_SPAWN[b.enter!].yaw, locked, lockedText: b.lockedText }}
            p={[0, 0, 0.7]}
            radius={1.9}
            h={2.5}
          >
            <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1.6, 1, 1]} material={std('#c9b9a6', { rough: 0.9 })} receiveShadow />
          </Interact>
        ) : (
          b.word === 'house' || b.word === 'roof' || b.word === 'window' || b.word === 'stairs' ? null : null
        )}
      </group>

      {/* awning */}
      {awningMat && (
        <mesh geometry={G.box} material={awningMat} position={[0, 2.95, D / 2 + 0.75]} rotation={[0.38, 0, 0]} scale={[W - 0.3, 0.06, 1.6]} castShadow />
      )}

      {/* main sign */}
      {signTex && (
        <group position={[0, groundShop ? 3.75 : trad ? 3.9 : 3.3, D / 2 + 0.16]}>
          <Box p={[0, 0, -0.05]} s={[Math.min(W * 0.75, 6) + 0.2, 1.02, 0.1]} c={b.sign!.neon ? '#1d1a26' : shade(b.trim, 0.9)} cast={false} />
          <Quad s={[Math.min(W * 0.75, 6), 0.9]} map={signTex} emissive={!!b.sign!.neon} />
        </group>
      )}

      {/* vertical blade sign at the corner, a staple of Japanese streets */}
      {vertTex && (groundShop || trad) && b.style !== 'police' && (
        <group position={[W / 2 - 0.4, 5.2, D / 2 + 0.55]}>
          <Box s={[0.08, 2.2, 0.75]} c={b.sign!.bg} cast={false} />
          <mesh geometry={G.plane} position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={[0.62, 2.0, 1]} material={b.sign!.neon ? glow('#ffffff', '#ffffff', 0.5, 2.2, { map: vertTex }) : std('#ffffff', { map: vertTex })} />
          <mesh geometry={G.plane} position={[-0.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[0.62, 2.0, 1]} material={b.sign!.neon ? glow('#ffffff', '#ffffff', 0.5, 2.2, { map: vertTex }) : std('#ffffff', { map: vertTex })} />
        </group>
      )}

      {/* police box red lamp */}
      {b.style === 'police' && <mesh geometry={G.sphere} position={[0, 4.7, D / 2 + 0.2]} scale={0.22} material={glow('#ff4a3d', '#ff2a1d', 0.8, 3)} />}

      {/* konbini color band */}
      {b.style === 'konbini' && (
        <>
          <Box p={[0, 4.35, D / 2 + 0.08]} s={[W, 0.35, 0.1]} c="#3aa16b" cast={false} />
          <Box p={[0, 4.75, D / 2 + 0.08]} s={[W, 0.35, 0.1]} c="#4d8fd6" cast={false} />
          <Box p={[0, 3.05, D / 2 + 0.6]} s={[W, 0.08, 1.2]} c="#f4f4f4" />
        </>
      )}

      {/* apartment balconies + side stair */}
      {b.style === 'apartment' &&
        Array.from({ length: floors - 1 }, (_, f) =>
          [-W / 4, W / 4].map((x, i) => (
            <group key={`${f}${i}`} position={[x, 3 * (f + 1) + 0.1, D / 2 + 0.55]}>
              <Box p={[0, 0, 0]} s={[W / 2 - 0.6, 0.15, 1.1]} c={shade(b.wall, 0.9)} />
              <Box p={[0, 0.55, 0.52]} s={[W / 2 - 0.6, 0.95, 0.06]} m={std(b.trim, { transparent: true, opacity: 0.85 })} />
              {(f + i + seed) % 3 === 0 && (
                <group position={[0, 1.3, 0.1]}>
                  <Cyl p={[0, 0.3, 0]} rad={0.02} h={W / 2 - 0.8} r={[0, 0, Math.PI / 2]} c="#c9c9c9" />
                  {[-0.6, -0.1, 0.4].map((lx, k) => (
                    <Box key={lx} p={[lx, -0.05, 0]} s={[0.35, 0.6, 0.02]} c={['#ffffff', '#f6a6c1', '#8ec5f2'][k]} cast={false} />
                  ))}
                </group>
              )}
            </group>
          )),
        )}
      {(b.style === 'house' || b.style === 'apartment') && (
        <Box p={[W / 2 + 0.35, 2.2, -D / 4]} s={[0.6, 0.45, 0.35]} c="#eef0f2" />
      )}
      {b.style === 'house' && floors > 1 && (
        <group position={[0, 3.2, D / 2 + 0.45]}>
          <Box s={[W * 0.5, 0.12, 0.9]} c={shade(b.wall, 0.85)} />
          <Box p={[0, 0.5, 0.42]} s={[W * 0.5, 0.85, 0.05]} m={std(b.trim)} />
          <Cyl p={[0, 1.6, 0]} rad={0.02} h={W * 0.48} r={[0, 0, Math.PI / 2]} c="#cccccc" />
          {[-1, -0.3, 0.4, 1.0].map((lx, k) => (
            <Box key={lx} p={[lx * (W / 6), 1.25, 0]} s={[0.4, 0.62, 0.02]} c={['#ffffff', '#fbd3df', '#cfe6f8', '#fff3c4'][k]} cast={false} />
          ))}
        </group>
      )}

      {/* storefront word: interact with the sign / facade */}
      {b.word && (
        <Interact words={[b.word]} p={[isEnter ? W / 2 - 1.2 : doorX === 0 ? W / 4 : doorX + 2.2, 0, D / 2 + 1.0]} radius={1.8} h={2.6}>
          <group />
        </Interact>
      )}
    </group>
  );
}

/** Small decorative floor mat (unused for collisions). */
export function Doormat({ p }: { p: [number, number, number] }) {
  return <mesh geometry={G.plane} rotation={[-Math.PI / 2, 0, 0]} position={p} scale={[1.2, 0.7, 1]} material={basic('#b98d6a')} />;
}

export { JP_FONT };
