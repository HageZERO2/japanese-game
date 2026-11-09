import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { env, player, swayers } from '../game/runtime';
import { useGame, type TimeMode } from '../state/store';
import { useUI } from '../state/ui';
import { updateGlows, updateWet } from './materials';
import { petalTexture, softDot } from './textures';
import { audio } from '../systems/audio';

interface Preset {
  top: string;
  horizon: string;
  bottom: string;
  sun: string;
  sunI: number;
  sunDir: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  hemiI: number;
  ambient: number;
  fog: string;
  fogNear: number;
  fogFar: number;
  night: number;
  rain: number;
  petals: number;
  cloud: string;
  cloudOpacity: number;
  envI: number;
}

export const PRESETS: Record<TimeMode, Preset> = {
  morning: { top: '#7fbdf0', horizon: '#ffe6d6', bottom: '#f7efe6', sun: '#ffe1bd', sunI: 2.1, sunDir: [50, 34, 30], hemiSky: '#cfe6ff', hemiGround: '#e9d7c4', hemiI: 0.75, ambient: 0.15, fog: '#f3e6e0', fogNear: 70, fogFar: 280, night: 0, rain: 0, petals: 0.25, cloud: '#ffffff', cloudOpacity: 0.9, envI: 0.8 },
  afternoon: { top: '#4f9fe6', horizon: '#d6ebfb', bottom: '#eef4f7', sun: '#fff5e6', sunI: 2.5, sunDir: [20, 70, 18], hemiSky: '#d8ecff', hemiGround: '#e2d6c2', hemiI: 0.8, ambient: 0.15, fog: '#dcebf5', fogNear: 90, fogFar: 320, night: 0, rain: 0, petals: 0.2, cloud: '#ffffff', cloudOpacity: 0.95, envI: 0.9 },
  sunset: { top: '#5b4f9c', horizon: '#ff9e6b', bottom: '#f6c4a3', sun: '#ff9257', sunI: 2.2, sunDir: [-70, 14, -25], hemiSky: '#ffb796', hemiGround: '#7a5a6a', hemiI: 0.8, ambient: 0.3, fog: '#e8a58c', fogNear: 50, fogFar: 230, night: 0.45, rain: 0, petals: 0.25, cloud: '#ffc2a8', cloudOpacity: 0.85, envI: 0.6 },
  night: { top: '#0b1030', horizon: '#2a2d5c', bottom: '#1b1c38', sun: '#a9bcff', sunI: 0.55, sunDir: [-30, 55, -30], hemiSky: '#3a4a8a', hemiGround: '#1e1a2e', hemiI: 0.55, ambient: 0.22, fog: '#1d2147', fogNear: 30, fogFar: 170, night: 1, rain: 0, petals: 0.15, cloud: '#4a5280', cloudOpacity: 0.5, envI: 0.25 },
  rain: { top: '#6f7b8a', horizon: '#aab3bf', bottom: '#9aa2ad', sun: '#d9dfe8', sunI: 0.7, sunDir: [30, 60, 20], hemiSky: '#b9c3cf', hemiGround: '#5e6670', hemiI: 0.9, ambient: 0.35, fog: '#9aa4b0', fogNear: 18, fogFar: 140, night: 0.45, rain: 1, petals: 0, cloud: '#8e98a6', cloudOpacity: 0.95, envI: 0.5 },
  sakura: { top: '#8fcaf4', horizon: '#ffe0eb', bottom: '#fbeef2', sun: '#ffe9d6', sunI: 2.2, sunDir: [40, 45, 25], hemiSky: '#ffe3f0', hemiGround: '#efd6d6', hemiI: 0.78, ambient: 0.15, fog: '#f8e1ea', fogNear: 55, fogFar: 250, night: 0, rain: 0, petals: 1, cloud: '#fff4f8', cloudOpacity: 0.9, envI: 0.95 },
};

const skyVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * p;
  gl_Position.z = gl_Position.w;
}`;
const skyFrag = /* glsl */ `
uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sunColor; uniform vec3 sunDir; uniform float night;
varying vec3 vDir;
void main() {
  float h = vDir.y;
  vec3 col = h > 0.0 ? mix(horizon, top, pow(smoothstep(0.0, 0.65, h), 0.8)) : mix(horizon, bottom, smoothstep(0.0, -0.25, h));
  float s = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
  float disc = smoothstep(0.9993, 0.9997, s);
  float halo = pow(s, 12.0) * 0.45 + pow(s, 200.0) * 0.6;
  col += sunColor * (halo * (1.0 - night * 0.6) + disc * (night > 0.5 ? 0.9 : 1.6));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const C = (s: string) => new THREE.Color(s);

function Sky({ state }: { state: React.RefObject<LiveState> }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color() },
          horizon: { value: new THREE.Color() },
          bottom: { value: new THREE.Color() },
          sunColor: { value: new THREE.Color() },
          sunDir: { value: new THREE.Vector3(0, 1, 0) },
          night: { value: 0 },
        },
      }),
    [],
  );
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    const s = state.current;
    if (!s) return;
    mat.uniforms.top.value.copy(s.top);
    mat.uniforms.horizon.value.copy(s.horizon);
    mat.uniforms.bottom.value.copy(s.bottom);
    mat.uniforms.sunColor.value.copy(s.sun);
    mat.uniforms.sunDir.value.copy(s.sunDir).normalize();
    mat.uniforms.night.value = s.night;
    ref.current?.position.copy(camera.position);
  });
  return (
    <mesh ref={ref} material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[450, 32, 16]} />
    </mesh>
  );
}

function Stars({ state }: { state: React.RefObject<LiveState> }) {
  const { geo, mat } = useMemo(() => {
    const n = 1400;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random();
      const v = Math.random() * 0.9 + 0.1;
      const th = u * Math.PI * 2;
      const ph = Math.acos(v);
      pos.set([Math.sin(ph) * Math.cos(th) * 420, Math.cos(ph) * 420, Math.sin(ph) * Math.sin(th) * 420], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: '#ffffff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
    return { geo: g, mat: m };
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame(({ camera, clock }) => {
    const s = state.current;
    if (!s) return;
    mat.opacity = Math.max(0, s.night - 0.4 - s.rain) * (0.85 + Math.sin(clock.elapsedTime * 2) * 0.05);
    ref.current?.position.copy(camera.position);
  });
  return <points ref={ref} geometry={geo} material={mat} renderOrder={-9} frustumCulled={false} />;
}

function Clouds({ state }: { state: React.RefObject<LiveState> }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: softDot('rgba(255,255,255,1)'), transparent: true, depthWrite: false, fog: false, opacity: 0.9 }), []);
  const puffs = useMemo(() => {
    const out: { x: number; y: number; z: number; s: number }[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.random() * 0.3;
      const r = 160 + Math.random() * 120;
      const cx = Math.cos(a) * r;
      const cz = Math.sin(a) * r;
      const cy = 70 + Math.random() * 45;
      const n = 6 + Math.floor(Math.random() * 5);
      for (let k = 0; k < n; k++) out.push({ x: cx + (Math.random() - 0.5) * 50, y: cy + (Math.random() - 0.3) * 9, z: cz + (Math.random() - 0.5) * 18, s: 22 + Math.random() * 26 });
    }
    return out;
  }, []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const spin = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ camera }, dt) => {
    const s = state.current;
    const m = mesh.current;
    if (!s || !m) return;
    mat.color.copy(s.cloud);
    mat.opacity = s.cloudOpacity;
    spin.current += dt * 0.004 * (0.5 + env.wind);
    const c = Math.cos(spin.current);
    const sn = Math.sin(spin.current);
    // All puffs billboard toward the camera, so they share its orientation.
    puffs.forEach((p, i) => {
      dummy.position.set(camera.position.x + p.x * c - p.z * sn, p.y, camera.position.z + p.x * sn + p.z * c);
      dummy.quaternion.copy(camera.quaternion);
      dummy.scale.set(p.s, p.s * 0.6, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, mat, puffs.length]} frustumCulled={false} renderOrder={-8}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
}

function Rain() {
  const N = 1800;
  const { geo, mat, speeds } = useMemo(() => {
    const pos = new Float32Array(N * 6);
    const sp = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = Math.random() * 25;
      const z = (Math.random() - 0.5) * 50;
      pos.set([x, y, z, x + 0.05, y - 0.55, z], i * 6);
      sp[i] = 18 + Math.random() * 8;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.LineBasicMaterial({ color: '#cfd8e6', transparent: true, opacity: 0, depthWrite: false });
    return { geo: g, mat: m, speeds: sp };
  }, []);
  const ref = useRef<THREE.LineSegments>(null);
  useFrame(({ camera }, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    mat.opacity = env.rain * 0.55;
    if (!ref.current) return;
    ref.current.visible = env.rain > 0.02 && player.location === 'outside';
    if (!ref.current.visible) return;
    ref.current.position.set(camera.position.x, 0, camera.position.z);
    const a = geo.attributes.position as THREE.BufferAttribute;
    const arr = a.array as Float32Array;
    for (let i = 0; i < N; i++) {
      const o = i * 6;
      const dy = speeds[i] * dt;
      arr[o + 1] -= dy;
      arr[o + 4] -= dy;
      if (arr[o + 4] < camera.position.y - 12 || arr[o + 4] < 0) {
        const y = camera.position.y + 8 + Math.random() * 14;
        arr[o + 1] = y;
        arr[o + 4] = y - 0.55;
      }
    }
    a.needsUpdate = true;
  });
  return <lineSegments ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

function Petals() {
  const N = 380;
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(
    () =>
      Array.from({ length: N }, () => ({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 14,
        z: (Math.random() - 0.5) * 40,
        sp: 0.5 + Math.random() * 0.7,
        ph: Math.random() * 10,
        rot: Math.random() * 6,
      })),
    [],
  );
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: petalTexture(), transparent: true, side: THREE.DoubleSide, alphaTest: 0.3, depthWrite: false }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ camera, clock }, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const m = ref.current;
    if (!m) return;
    const visibleCount = Math.floor(N * env.petals);
    m.visible = visibleCount > 0 && player.location === 'outside';
    if (!m.visible) return;
    m.count = visibleCount;
    const t = clock.elapsedTime;
    const cx = camera.position.x;
    const cz = camera.position.z;
    for (let i = 0; i < visibleCount; i++) {
      const p = data[i];
      p.y -= p.sp * dt;
      p.x += (Math.sin(t * 0.8 + p.ph) * 0.6 + env.wind * 0.8) * dt;
      p.z += Math.cos(t * 0.6 + p.ph) * 0.4 * dt;
      if (p.y < 0) {
        p.y = 10 + Math.random() * 5;
        p.x = (Math.random() - 0.5) * 40;
        p.z = (Math.random() - 0.5) * 40;
      }
      if (p.x - cx > 20) p.x -= 40;
      else if (p.x - cx < -20) p.x += 40;
      if (p.z - cz > 20) p.z -= 40;
      else if (p.z - cz < -20) p.z += 40;
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(t * 1.5 + p.rot, t + p.ph, Math.sin(t * 2 + p.ph));
      dummy.scale.setScalar(0.09);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
}

interface LiveState {
  top: THREE.Color;
  horizon: THREE.Color;
  bottom: THREE.Color;
  sun: THREE.Color;
  sunI: number;
  sunDir: THREE.Vector3;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiI: number;
  ambient: number;
  fog: THREE.Color;
  fogNear: number;
  fogFar: number;
  night: number;
  rain: number;
  petals: number;
  cloud: THREE.Color;
  cloudOpacity: number;
  envI: number;
}

function toLive(p: Preset): LiveState {
  return {
    top: C(p.top),
    horizon: C(p.horizon),
    bottom: C(p.bottom),
    sun: C(p.sun),
    sunI: p.sunI,
    sunDir: new THREE.Vector3(...p.sunDir),
    hemiSky: C(p.hemiSky),
    hemiGround: C(p.hemiGround),
    hemiI: p.hemiI,
    ambient: p.ambient,
    fog: C(p.fog),
    fogNear: p.fogNear,
    fogFar: p.fogFar,
    night: p.night,
    rain: p.rain,
    petals: p.petals,
    cloud: C(p.cloud),
    cloudOpacity: p.cloudOpacity,
    envI: p.envI,
  };
}

/** Outdoor sky, sun, weather and the global time-of-day blending. */
export function Atmosphere({ outside, quality }: { outside: boolean; quality: 'low' | 'high' }) {
  const mode = useGame((s) => s.settings.timeMode);
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const live = useRef<LiveState>(toLive(PRESETS[mode]));
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const targets = useMemo(() => Object.fromEntries(Object.entries(PRESETS).map(([k, v]) => [k, toLive(v)])) as Record<TimeMode, LiveState>, []);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.fog = new THREE.Fog('#f3e6e0', 60, 260);
    return () => {
      scene.environment = null;
      envTex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  // Ambient audio follows mode, location and zone.
  const location = useUI((s) => s.location);
  const zone = useUI((s) => s.zone);
  useEffect(() => {
    const p = PRESETS[mode];
    audio.setAmbience({ rain: p.rain > 0.5, night: p.night > 0.7, indoor: location !== 'outside', zone });
  }, [mode, location, zone]);

  useFrame(({ clock }, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const s = live.current;
    const t = targets[useGame.getState().settings.timeMode];
    const k = 1 - Math.exp(-1.8 * dt);
    s.top.lerp(t.top, k);
    s.horizon.lerp(t.horizon, k);
    s.bottom.lerp(t.bottom, k);
    s.sun.lerp(t.sun, k);
    s.hemiSky.lerp(t.hemiSky, k);
    s.hemiGround.lerp(t.hemiGround, k);
    s.fog.lerp(t.fog, k);
    s.cloud.lerp(t.cloud, k);
    s.sunDir.lerp(t.sunDir, k);
    s.sunI += (t.sunI - s.sunI) * k;
    s.hemiI += (t.hemiI - s.hemiI) * k;
    s.ambient += (t.ambient - s.ambient) * k;
    s.fogNear += (t.fogNear - s.fogNear) * k;
    s.fogFar += (t.fogFar - s.fogFar) * k;
    s.night += (t.night - s.night) * k;
    s.rain += (t.rain - s.rain) * k;
    s.petals += (t.petals - s.petals) * k;
    s.cloudOpacity += (t.cloudOpacity - s.cloudOpacity) * k;
    s.envI += (t.envI - s.envI) * k;

    env.night = s.night;
    env.rain = s.rain;
    env.petals = s.petals;
    env.wind = 0.4 + s.rain * 0.6 + Math.sin(clock.elapsedTime * 0.13) * 0.2;
    updateGlows(outside ? s.night : 0.85);
    updateWet(s.rain);

    if (outside) {
      const fog = scene.fog as THREE.Fog | null;
      if (fog) {
        fog.color.copy(s.fog);
        fog.near = s.fogNear;
        fog.far = s.fogFar;
      }
      scene.environmentIntensity = s.envI;
    }

    if (sun.current) {
      sun.current.color.copy(s.sun);
      sun.current.intensity = outside ? s.sunI : 0;
      const dir = s.sunDir.clone().normalize();
      sun.current.position.set(player.pos.x + dir.x * 60, player.pos.y + dir.y * 60, player.pos.z + dir.z * 60);
      sun.current.target.position.set(player.pos.x, player.pos.y, player.pos.z);
      sun.current.target.updateMatrixWorld();
    }
    if (hemi.current) {
      hemi.current.color.copy(s.hemiSky);
      hemi.current.groundColor.copy(s.hemiGround);
      hemi.current.intensity = outside ? s.hemiI : 0;
    }
    if (amb.current) amb.current.intensity = outside ? s.ambient : 0;

    // Wind sway for foliage
    const tt = clock.elapsedTime;
    for (const sw of swayers) {
      sw.obj.rotation.z = Math.sin(tt * 1.3 + sw.phase) * sw.amount * (0.6 + env.wind);
      sw.obj.rotation.x = Math.cos(tt * 1.1 + sw.phase * 1.3) * sw.amount * 0.6 * (0.6 + env.wind);
    }
  });

  const shadowSize = quality === 'high' ? 2048 : 1024;
  return (
    <>
      <directionalLight
        ref={sun}
        castShadow
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      <hemisphereLight ref={hemi} />
      <ambientLight ref={amb} />
      {outside && (
        <>
          <Sky state={live} />
          <Stars state={live} />
          <Clouds state={live} />
          <Rain />
          <Petals />
        </>
      )}
    </>
  );
}
