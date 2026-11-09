import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Character } from './Character';
import { boxesFor, input, interactables, player, type Box, type Interactable } from './runtime';
import { useGame } from '../state/store';
import { isModalOpen, useUI } from '../state/ui';
import { groundHeight, zoneAt } from '../world/layout';
import { audio } from '../systems/audio';
import { ZONES } from '../data/progression';

const RADIUS = 0.32;
const WALK = 3.4;
const RUN = 7;
const GRAVITY = 18;
const JUMP_V = 6;

const damp = (cur: number, target: number, k: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-k * dt));
function dampAngle(cur: number, target: number, k: number, dt: number) {
  let d = target - cur;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return cur + d * (1 - Math.exp(-k * dt));
}

export function resolveCollisions(pos: THREE.Vector3, boxes: Box[]) {
  for (let iter = 0; iter < 3; iter++) {
    let moved = false;
    for (const b of boxes) {
      if (pos.y + 1.5 < b.minY || pos.y + 0.35 > b.maxY) continue;
      const cx = Math.max(b.minX, Math.min(pos.x, b.maxX));
      const cz = Math.max(b.minZ, Math.min(pos.z, b.maxZ));
      const dx = pos.x - cx;
      const dz = pos.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= RADIUS * RADIUS) continue;
      if (d2 > 1e-9) {
        const d = Math.sqrt(d2);
        pos.x += (dx / d) * (RADIUS - d);
        pos.z += (dz / d) * (RADIUS - d);
      } else {
        // Center is inside the box: push out along the shallowest axis.
        const pen = [pos.x - b.minX, b.maxX - pos.x, pos.z - b.minZ, b.maxZ - pos.z];
        const i = pen.indexOf(Math.min(...pen));
        if (i === 0) pos.x = b.minX - RADIUS;
        else if (i === 1) pos.x = b.maxX + RADIUS;
        else if (i === 2) pos.z = b.minZ - RADIUS;
        else pos.z = b.maxZ + RADIUS;
      }
      moved = true;
    }
    if (!moved) break;
  }
}

/** Distance along a segment to the first box hit (slab test), or 1 if clear. */
function segmentHit(from: THREE.Vector3, to: THREE.Vector3, boxes: Box[], pad = 0.18) {
  let best = 1;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  for (const b of boxes) {
    let t0 = 0;
    let t1 = best;
    const axes: [number, number, number, number][] = [
      [from.x, dx, b.minX - pad, b.maxX + pad],
      [from.y, dy, b.minY - pad, b.maxY + pad],
      [from.z, dz, b.minZ - pad, b.maxZ + pad],
    ];
    let hit = true;
    for (const [o, d, mn, mx] of axes) {
      if (Math.abs(d) < 1e-8) {
        if (o < mn || o > mx) {
          hit = false;
          break;
        }
      } else {
        let a = (mn - o) / d;
        let c = (mx - o) / d;
        if (a > c) [a, c] = [c, a];
        t0 = Math.max(t0, a);
        t1 = Math.min(t1, c);
        if (t0 > t1) {
          hit = false;
          break;
        }
      }
    }
    // Ignore boxes the target point is already inside of (e.g. thin floors).
    if (hit && t0 > 0 && t0 < best) best = t0;
  }
  return best;
}

const tmpTarget = new THREE.Vector3();
const tmpDesired = new THREE.Vector3();
const fwd3 = new THREE.Vector3();
const moveDir = new THREE.Vector3();
let stepAccum = 0;
let focusTimer = 0;

function pickFocus(): Interactable | null {
  const fx = -Math.sin(player.camYaw);
  const fz = -Math.cos(player.camYaw);
  let best: Interactable | null = null;
  let bestScore = Infinity;
  for (const it of interactables.values()) {
    if (it.location !== player.location) continue;
    const dx = it.pos.x - player.pos.x;
    const dz = it.pos.z - player.pos.z;
    const d = Math.hypot(dx, dz);
    if (d > it.radius) continue;
    const dot = d > 0.01 ? (dx * fx + dz * fz) / d : 1;
    if (dot < 0.15 && d > 0.9) continue;
    const score = d - dot * 1.2;
    if (score < bestScore) {
      bestScore = score;
      best = it;
    }
  }
  return best;
}

export function Player() {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const appearance = useGame((s) => s.appearance);
  const firstPerson = useGame((s) => s.settings.cameraMode === 'first');

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const ui = useUI.getState();
    const locked = isModalOpen(ui) || ui.fading;
    const settings = useGame.getState().settings;
    const fp = settings.cameraMode === 'first';

    // Look
    const sens = 0.0022 * settings.sensitivity;
    if (!locked) {
      player.camYaw -= input.mouseDX * sens;
      player.camPitch -= input.mouseDY * sens * (settings.invertY ? -1 : 1);
    }
    input.mouseDX = 0;
    input.mouseDY = 0;
    player.camPitch = fp ? Math.max(-1.35, Math.min(1.35, player.camPitch)) : Math.max(-1.25, Math.min(0.5, player.camPitch));
    if (input.wheel) {
      player.camDist = Math.max(1.8, Math.min(9, player.camDist + input.wheel * 0.004));
      input.wheel = 0;
    }

    // Move
    const k = input.keys;
    let mx = 0;
    let mz = 0;
    if (!locked) {
      if (k.has('KeyW') || k.has('ArrowUp')) mz += 1;
      if (k.has('KeyS') || k.has('ArrowDown')) mz -= 1;
      if (k.has('KeyA') || k.has('ArrowLeft')) mx -= 1;
      if (k.has('KeyD') || k.has('ArrowRight')) mx += 1;
    }
    const running = k.has('ShiftLeft') || k.has('ShiftRight');
    const sy = Math.sin(player.camYaw);
    const cy = Math.cos(player.camYaw);
    const dx = -sy * mz + cy * mx;
    const dz = -cy * mz - sy * mx;
    const len = Math.hypot(dx, dz);
    if (len > 0) moveDir.set(dx / len, 0, dz / len);
    const target = len > 0 ? (running ? RUN : WALK) : 0;
    player.speed = damp(player.speed, target, len > 0 ? 8 : 12, dt);
    if (player.speed < 0.02) player.speed = 0;

    const boxes = boxesFor(player.location);
    const pos = player.pos;
    const prevX = pos.x;
    const prevZ = pos.z;
    pos.x += moveDir.x * player.speed * dt;
    pos.z += moveDir.z * player.speed * dt;
    resolveCollisions(pos, boxes);
    const actual = Math.hypot(pos.x - prevX, pos.z - prevZ) / Math.max(dt, 1e-4);

    // Vertical
    const ground = player.location === 'outside' ? groundHeight(pos.x, pos.z) : 0;
    if (input.jumpQueued) {
      input.jumpQueued = false;
      if (player.grounded && !locked) {
        player.vy = JUMP_V;
        player.grounded = false;
        audio.play('jump');
      }
    }
    if (player.grounded && pos.y - ground > 0.35) player.grounded = false;
    if (!player.grounded) {
      player.vy -= GRAVITY * dt;
      pos.y += player.vy * dt;
      if (pos.y <= ground) {
        if (player.vy < -4) audio.play('land');
        pos.y = ground;
        player.vy = 0;
        player.grounded = true;
      }
    } else {
      pos.y = ground;
    }

    // Facing + animation
    if (fp) player.facing = player.camYaw + Math.PI;
    else if (len > 0 && player.speed > 0.1) player.facing = dampAngle(player.facing, Math.atan2(moveDir.x, moveDir.z), 12, dt);
    player.actionTimer = Math.max(0, player.actionTimer - dt);
    const effSpeed = Math.min(player.speed, actual + 0.5);
    player.anim = !player.grounded ? 'jump' : player.actionTimer > 0 ? player.actionKind : effSpeed > 4.6 ? 'run' : effSpeed > 0.4 ? 'walk' : 'idle';

    // Footsteps
    if (player.grounded && effSpeed > 0.4) {
      stepAccum += effSpeed * dt;
      const stride = player.anim === 'run' ? 1.25 : 0.85;
      if (stepAccum > stride) {
        stepAccum = 0;
        audio.play(player.location === 'outside' ? 'footstep' : 'footstepWood');
      }
    }

    if (group.current) {
      group.current.position.copy(pos);
      group.current.rotation.y = player.facing;
    }

    // Camera
    const pitch = player.camPitch;
    fwd3.set(-sy * Math.cos(pitch), Math.sin(pitch), -cy * Math.cos(pitch));
    camera.rotation.set(pitch, player.camYaw, 0, 'YXZ');
    if (fp) {
      tmpTarget.set(pos.x, pos.y + 1.42, pos.z).addScaledVector(new THREE.Vector3(-sy, 0, -cy), 0.12);
      camera.position.copy(tmpTarget);
    } else {
      tmpTarget.set(pos.x, pos.y + 1.4, pos.z);
      const dist = player.location === 'outside' ? player.camDist : Math.min(player.camDist, 3.4);
      tmpDesired.copy(tmpTarget).addScaledVector(fwd3, -dist);
      const t = segmentHit(tmpTarget, tmpDesired, boxes);
      tmpDesired.lerpVectors(tmpTarget, tmpDesired, Math.max(0.12, t - 0.04));
      tmpDesired.y = Math.max(tmpDesired.y, ground + 0.25);
      const cur = camera.position;
      // Snap in when blocked, ease out when free, to avoid clipping through walls.
      const desiredDist = tmpDesired.distanceTo(tmpTarget);
      const curDist = cur.distanceTo(tmpTarget);
      if (desiredDist < curDist - 0.05 || curDist > dist + 2) cur.copy(tmpDesired);
      else cur.lerp(tmpDesired, 1 - Math.exp(-14 * dt));
    }

    // Focus (throttled)
    focusTimer -= dt;
    if (focusTimer <= 0) {
      focusTimer = 0.08;
      const f = locked ? null : pickFocus();
      if (f?.id !== ui.focus?.id) ui.setFocus(f);
    }

    // Zones
    if (player.location === 'outside') {
      const z = zoneAt(pos.x, pos.z);
      if (z && z !== player.zone) {
        player.zone = z;
        ui.setZone(z);
        ui.showZoneBanner(ZONES[z].name, ZONES[z].jp);
        useGame.getState().visitZone(z);
      }
    }
  });

  return (
    <group ref={group}>
      <Character
        look={{ ...appearance, skin: '#ffe3d2', eye: '#7a62c9', skirt: appearance.hairStyle !== 'short', scale: 1 }}
        source={player}
        hideHead={firstPerson}
      />
    </group>
  );
}
