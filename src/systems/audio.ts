export type Sfx =
  | 'footstep' | 'footstepWood' | 'door' | 'vending' | 'ui' | 'open' | 'close'
  | 'success' | 'levelup' | 'pop' | 'jump' | 'land' | 'error' | 'chime' | 'bell';

export interface AmbienceState {
  rain: boolean;
  night: boolean;
  indoor: boolean;
  zone: 'main' | 'shopping' | 'traditional' | 'cafe' | 'residential' | null;
}

type Ctx = AudioContext;

let ctx: Ctx | null = null;
let isReady = false;
let musicVol = 0.5;
let sfxVol = 0.7;
let musicGain: GainNode;
let sfxGain: GainNode;
let ambGain: GainNode;
let musicBus: GainNode;
let whiteBuf: AudioBuffer;
let brownBuf: AudioBuffer;
let timer: ReturnType<typeof setInterval> | null = null;
let amb: AmbienceState = { rain: false, night: false, indoor: false, zone: null };

interface Layer { gain: GainNode }
let layers: Record<'wind' | 'murmur' | 'water' | 'rain', Layer>;
let ambLP: BiquadFilterNode;
let birdBus: GainNode;
let cricketBus: GainNode;
let windFilter: BiquadFilterNode;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function ramp(p: AudioParam, v: number, t = 0.08) {
  if (!ctx) return;
  p.cancelScheduledValues(ctx.currentTime);
  p.setTargetAtTime(v, ctx.currentTime, t);
}

function makeNoise(c: Ctx, seconds: number, brown: boolean) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
  }
  return buf;
}

function makeIR(c: Ctx, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

function loopNoise(brown: boolean) {
  const s = ctx!.createBufferSource();
  s.buffer = brown ? brownBuf : whiteBuf;
  s.loop = true;
  s.loopStart = 0;
  s.start(0, Math.random() * 1.5);
  return s;
}

function autoDisconnect(src: AudioScheduledSourceNode, ...nodes: AudioNode[]) {
  src.onended = () => { try { src.disconnect(); nodes.forEach((n) => n.disconnect()); } catch { /* already gone */ } };
}

// ---------- one-shot helpers ----------
function env(dest: AudioNode, t: number, peak: number, attack: number, decay: number) {
  const g = ctx!.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(dest);
  return g;
}

function tone(dest: AudioNode, type: OscillatorType, f0: number, f1: number, t: number, peak: number, attack: number, decay: number) {
  const o = ctx!.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + attack + decay);
  const g = env(dest, t, peak, attack, decay);
  o.connect(g);
  o.start(t);
  o.stop(t + attack + decay + 0.05);
  autoDisconnect(o, g);
}

function noiseHit(dest: AudioNode, t: number, type: BiquadFilterType, freq: number, q: number, peak: number, attack: number, decay: number, freqEnd?: number) {
  const s = ctx!.createBufferSource();
  s.buffer = whiteBuf;
  const f = ctx!.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + attack + decay);
  f.Q.value = q;
  const g = env(dest, t, peak, attack, decay);
  s.connect(f).connect(g);
  s.start(t, Math.random() * 1.5, attack + decay + 0.05);
  autoDisconnect(s, f, g);
}

// ---------- SFX ----------
function playSfx(s: Sfx) {
  const c = ctx!;
  const t = c.currentTime;
  const d = sfxGain;
  switch (s) {
    case 'footstep':
      noiseHit(d, t, 'lowpass', rnd(350, 600), 0.7, 0.28, 0.005, 0.09);
      tone(d, 'sine', rnd(90, 120), 55, t, 0.18, 0.003, 0.08);
      break;
    case 'footstepWood':
      tone(d, 'triangle', rnd(180, 230), 110, t, 0.22, 0.002, 0.07);
      noiseHit(d, t, 'bandpass', rnd(700, 1100), 2, 0.12, 0.002, 0.06);
      break;
    case 'door':
      noiseHit(d, t, 'bandpass', 500, 1.5, 0.22, 0.12, 0.3, 1800);
      tone(d, 'sine', 90, 50, t + 0.38, 0.35, 0.004, 0.14);
      noiseHit(d, t + 0.38, 'lowpass', 400, 0.7, 0.2, 0.003, 0.08);
      break;
    case 'vending':
      tone(d, 'square', 120, 70, t, 0.12, 0.003, 0.1);
      noiseHit(d, t, 'lowpass', 600, 1, 0.25, 0.004, 0.12);
      tone(d, 'sine', 70, 45, t + 0.35, 0.4, 0.004, 0.18);
      for (let i = 0; i < 4; i++) {
        noiseHit(d, t + 0.5 + i * rnd(0.03, 0.07), 'bandpass', rnd(2500, 5000), 8, 0.12, 0.001, 0.04);
        tone(d, 'triangle', rnd(1800, 3200), rnd(900, 1500), t + 0.5 + i * 0.05, 0.05, 0.001, 0.05);
      }
      break;
    case 'ui':
      tone(d, 'sine', 1400, 900, t, 0.1, 0.002, 0.04);
      break;
    case 'open':
      tone(d, 'sine', 500, 800, t, 0.13, 0.01, 0.12);
      tone(d, 'triangle', 750, 1200, t + 0.05, 0.07, 0.01, 0.1);
      break;
    case 'close':
      tone(d, 'sine', 800, 480, t, 0.12, 0.01, 0.12);
      break;
    case 'success':
      [523.25, 659.25, 783.99].forEach((f, i) => {
        tone(d, 'sine', f, f, t + i * 0.09, 0.14, 0.008, 0.45);
        tone(d, 'triangle', f * 2, f * 2, t + i * 0.09, 0.03, 0.008, 0.3);
      });
      break;
    case 'levelup':
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        tone(d, 'sine', f, f, t + i * 0.08, 0.14, 0.006, 0.7);
        tone(d, 'triangle', f * 2.01, f * 2.01, t + i * 0.08, 0.04, 0.006, 0.5);
      });
      for (let i = 0; i < 8; i++) tone(d, 'sine', rnd(2400, 4800), rnd(2400, 4800), t + 0.3 + i * 0.07, 0.03, 0.004, 0.3);
      break;
    case 'pop':
      tone(d, 'sine', 300, 900, t, 0.2, 0.002, 0.07);
      break;
    case 'jump':
      tone(d, 'sine', 260, 520, t, 0.1, 0.01, 0.12);
      noiseHit(d, t, 'highpass', 2000, 0.7, 0.04, 0.01, 0.1);
      break;
    case 'land':
      tone(d, 'sine', 100, 50, t, 0.25, 0.003, 0.1);
      noiseHit(d, t, 'lowpass', 500, 0.7, 0.2, 0.003, 0.08);
      break;
    case 'error':
      tone(d, 'sawtooth', 110, 90, t, 0.08, 0.01, 0.22);
      tone(d, 'sawtooth', 116, 95, t, 0.06, 0.01, 0.22);
      break;
    case 'chime':
      for (let i = 0; i < 6; i++) {
        const f = pick([1568, 1760, 2093, 2349, 2637, 3136]);
        tone(d, 'sine', f, f, t + i * rnd(0.05, 0.11), 0.06, 0.002, 0.9);
      }
      break;
    case 'bell': {
      const base = 220;
      [[1, 0.3, 3.5], [2.76, 0.18, 2.5], [5.4, 0.1, 1.6], [8.93, 0.05, 1.0], [0.5, 0.15, 4]].forEach(([r, g, dec]) => {
        tone(d, 'sine', base * r, base * r, t, g, 0.003, dec);
      });
      noiseHit(d, t, 'bandpass', 3000, 2, 0.08, 0.001, 0.05);
      break;
    }
  }
}

// ---------- music ----------
// Miyako-bushi (in) scale on D: 0 1 5 7 8
const SCALE = [0, 1, 5, 7, 8];
const ROOT = 62;
const BEAT = 60 / 70;
const STEP = BEAT / 2;
let nextStepTime = 0;
let stepIdx = 0;
let degree = 5;
let reverbIn: GainNode;

function scaleNote(deg: number) {
  const oct = Math.floor(deg / 5);
  return ROOT + oct * 12 + SCALE[((deg % 5) + 5) % 5];
}

function pluck(t: number, midi: number, vel: number) {
  const c = ctx!;
  const f = mtof(midi);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(f * 7, t);
  lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.5);
  const g = env(lp, t, vel, 0.003, 1.8);
  const pan = c.createStereoPanner();
  pan.pan.value = rnd(-0.3, 0.3);
  lp.connect(pan).connect(musicBus);
  [-4, 4].forEach((det) => {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    o.detune.value = det;
    o.connect(g);
    o.start(t);
    o.stop(t + 1.9);
    autoDisconnect(o);
  });
  const last = c.createOscillator();
  last.type = 'sine';
  last.frequency.value = f * 2;
  const lg = env(lp, t, vel * 0.3, 0.002, 0.4);
  last.connect(lg);
  last.start(t);
  last.stop(t + 0.5);
  autoDisconnect(last, lg);
  setTimeout(() => { try { g.disconnect(); lp.disconnect(); pan.disconnect(); } catch { /* ok */ } }, (t - c.currentTime + 2.2) * 1000);
}

function padChord(t: number, dur: number, vel: number) {
  const c = ctx!;
  const notes = [ROOT - 12, ROOT - 5, ROOT + 7 - 12 + 12];
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vel, t + dur * 0.4);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  lp.connect(g).connect(musicBus);
  notes.forEach((m) => {
    [-6, 6].forEach((det) => {
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.value = mtof(m);
      o.detune.value = det;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.1);
      autoDisconnect(o);
    });
  });
  setTimeout(() => { try { lp.disconnect(); g.disconnect(); } catch { /* ok */ } }, (t - c.currentTime + dur + 0.3) * 1000);
}

function flute(t: number, midi: number, dur: number, vel: number) {
  const c = ctx!;
  const f = mtof(midi);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vel, t + 0.18);
  g.gain.setTargetAtTime(vel * 0.7, t + 0.2, 0.3);
  g.gain.setTargetAtTime(0.0001, t + dur, 0.2);
  const pan = c.createStereoPanner();
  pan.pan.value = rnd(-0.2, 0.4);
  g.connect(pan).connect(musicBus);
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(f * 0.97, t);
  o.frequency.exponentialRampToValueAtTime(f, t + 0.15);
  const lfo = c.createOscillator();
  lfo.frequency.value = 5;
  const lg = c.createGain();
  lg.gain.setValueAtTime(0, t);
  lg.gain.linearRampToValueAtTime(f * 0.012, t + dur * 0.5);
  lfo.connect(lg).connect(o.frequency);
  const o2 = c.createOscillator();
  o2.type = 'triangle';
  o2.frequency.value = f * 2;
  const o2g = c.createGain();
  o2g.gain.value = 0.15;
  o.connect(g);
  o2.connect(o2g).connect(g);
  const n = c.createBufferSource();
  n.buffer = whiteBuf;
  const nf = c.createBiquadFilter();
  nf.type = 'bandpass';
  nf.frequency.value = f * 2;
  nf.Q.value = 3;
  const ng = c.createGain();
  ng.gain.value = 0.5;
  n.connect(nf).connect(ng).connect(g);
  const end = t + dur + 1.2;
  [o, o2, lfo].forEach((x) => { x.start(t); x.stop(end); });
  n.start(t, Math.random(), dur + 1.2);
  autoDisconnect(o, g, pan, lg, o2g, nf, ng);
}

function scheduleMusic() {
  const c = ctx!;
  const night = amb.night;
  while (nextStepTime < c.currentTime + 0.5) {
    const t = nextStepTime;
    const bar = stepIdx % 16;
    if (bar === 0 && Math.random() < (night ? 0.9 : 0.7)) padChord(t, BEAT * 8, night ? 0.025 : 0.04);
    const playP = night ? 0.28 : 0.5;
    const onBeat = stepIdx % 2 === 0;
    if (Math.random() < (onBeat ? playP + 0.15 : playP - 0.15)) {
      const r = Math.random();
      degree += r < 0.35 ? 0 : r < 0.65 ? 1 : r < 0.9 ? -1 : pick([-2, 2, 3]);
      degree = Math.max(0, Math.min(11, degree));
      const vel = (night ? 0.07 : 0.11) * rnd(0.7, 1.1);
      pluck(t, scaleNote(degree), vel);
      if (Math.random() < 0.12) pluck(t + STEP, scaleNote(degree + 2), vel * 0.7);
    }
    if (bar === 8 && Math.random() < (night ? 0.2 : 0.35)) {
      flute(t, scaleNote(pick([5, 6, 8, 10])), BEAT * rnd(2.5, 4), night ? 0.05 : 0.08);
    }
    stepIdx++;
    nextStepTime += STEP * (Math.random() < 0.04 ? 2 : 1);
  }
}

// ---------- ambience ----------
function chirp(t: number, base: number, pan: number) {
  const c = ctx!;
  const p = c.createStereoPanner();
  p.pan.value = pan;
  p.connect(birdBus);
  const n = Math.floor(rnd(2, 6));
  for (let i = 0; i < n; i++) {
    const st = t + i * rnd(0.07, 0.13);
    const f0 = base * rnd(0.9, 1.3);
    tone(p, 'sine', f0, f0 * rnd(0.6, 1.6), st, 0.5, 0.01, rnd(0.04, 0.08));
  }
  setTimeout(() => { try { p.disconnect(); } catch { /* ok */ } }, (t - c.currentTime + 1.2) * 1000);
}

let nextBird = 0;
let nextCricket = 0;
let nextDrop = 0;

function scheduleAmbience() {
  const c = ctx!;
  const now = c.currentTime;
  const ahead = now + 0.5;
  if (!amb.night && !amb.rain && nextBird < ahead) {
    if (nextBird > 0) chirp(Math.max(nextBird, now), rnd(2400, 4200), rnd(-0.9, 0.9));
    nextBird = ahead + rnd(1.5, 6);
  }
  if (amb.night && !amb.rain && nextCricket < ahead) {
    const t = Math.max(nextCricket, now);
    const f = 4300;
    for (let i = 0; i < 3; i++) {
      tone(cricketBus, 'sine', f, f, t + i * 0.09, 0.4, 0.005, 0.05);
    }
    nextCricket = t + 0.55 + rnd(0, 0.15);
  }
  if (amb.rain && nextDrop < ahead) {
    const t = Math.max(nextDrop, now);
    noiseHit(layers.rain.gain, t, 'bandpass', rnd(3000, 7000), 4, 0.6, 0.001, 0.015);
    nextDrop = t + rnd(0.04, 0.25);
  }
}

function applyAmbience() {
  if (!ctx) return;
  const s = amb;
  const z = s.zone;
  const T = 0.5; // time constant, ~1.5 s settle
  const city = z === 'main' || z === 'shopping' || z === 'cafe' ? 0.5 : z === 'residential' ? 0.2 : 0.08;
  const water = z === 'traditional' ? 0.45 : 0;
  ramp(layers.wind.gain.gain, s.rain ? 0.25 : 0.2, T);
  ramp(layers.murmur.gain.gain, city * 0.6, T);
  ramp(layers.water.gain.gain, water * 0.25, T);
  ramp(layers.rain.gain.gain, s.rain ? 0.35 : 0, T);
  ramp(birdBus.gain, s.night || s.rain ? 0 : 0.12, T);
  ramp(cricketBus.gain, s.night && !s.rain ? 0.05 : 0, T);
  ramp(ambLP.frequency, s.indoor ? 500 : 20000, T);
  ramp(ambGain.gain, s.indoor ? 0.35 : 1, T);
}

// ---------- init ----------
function init() {
  if (ctx || typeof window === 'undefined') return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const c = new AC();
    ctx = c;
    whiteBuf = makeNoise(c, 2, false);
    brownBuf = makeNoise(c, 4, true);

    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    comp.connect(c.destination);
    musicGain = c.createGain();
    musicGain.gain.value = musicVol;
    sfxGain = c.createGain();
    sfxGain.gain.value = sfxVol;
    musicGain.connect(comp);
    sfxGain.connect(comp);
    ambGain = c.createGain();
    ambGain.connect(sfxGain);

    musicBus = c.createGain();
    musicBus.connect(musicGain);
    const conv = c.createConvolver();
    conv.buffer = makeIR(c, 3);
    reverbIn = c.createGain();
    reverbIn.gain.value = 0.5;
    musicBus.connect(reverbIn).connect(conv).connect(musicGain);

    ambLP = c.createBiquadFilter();
    ambLP.type = 'lowpass';
    ambLP.frequency.value = 20000;
    ambLP.connect(ambGain);

    const mk = (): Layer => {
      const g = c.createGain();
      g.gain.value = 0;
      g.connect(ambLP);
      return { gain: g };
    };
    layers = { wind: mk(), murmur: mk(), water: mk(), rain: mk() };

    windFilter = c.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 500;
    windFilter.Q.value = 0.6;
    loopNoise(false).connect(windFilter).connect(layers.wind.gain);
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.07;
    const lg = c.createGain();
    lg.gain.value = 250;
    lfo.connect(lg).connect(windFilter.frequency);
    lfo.start();

    const mlp = c.createBiquadFilter();
    mlp.type = 'lowpass';
    mlp.frequency.value = 350;
    loopNoise(true).connect(mlp).connect(layers.murmur.gain);

    const wbp = c.createBiquadFilter();
    wbp.type = 'bandpass';
    wbp.frequency.value = 2500;
    wbp.Q.value = 1.2;
    loopNoise(false).connect(wbp).connect(layers.water.gain);
    const wlfo = c.createOscillator();
    wlfo.frequency.value = 3.3;
    const wlg = c.createGain();
    wlg.gain.value = 700;
    wlfo.connect(wlg).connect(wbp.frequency);
    wlfo.start();

    const rlp = c.createBiquadFilter();
    rlp.type = 'lowpass';
    rlp.frequency.value = 9000;
    const rhs = c.createBiquadFilter();
    rhs.type = 'highshelf';
    rhs.frequency.value = 3000;
    rhs.gain.value = 4;
    const rls = c.createBiquadFilter();
    rls.type = 'lowshelf';
    rls.frequency.value = 400;
    rls.gain.value = -12;
    loopNoise(false).connect(rls).connect(rhs).connect(rlp).connect(layers.rain.gain);

    birdBus = c.createGain();
    birdBus.gain.value = 0;
    birdBus.connect(ambLP);
    cricketBus = c.createGain();
    cricketBus.gain.value = 0;
    cricketBus.connect(ambLP);

    applyAmbience();
    nextStepTime = c.currentTime + 0.3;
    timer = setInterval(() => {
      if (!ctx || ctx.state !== 'running') return;
      scheduleMusic();
      scheduleAmbience();
    }, 100);
    if (c.state === 'suspended') void c.resume();
    isReady = true;
  } catch {
    isReady = false;
    if (timer) clearInterval(timer);
    timer = null;
    ctx = null;
  }
}

export const audio = {
  init,
  get ready() { return isReady; },
  setMusicVolume(v: number) {
    musicVol = Math.max(0, Math.min(1, v));
    if (isReady) ramp(musicGain.gain, musicVol);
  },
  setSfxVolume(v: number) {
    sfxVol = Math.max(0, Math.min(1, v));
    if (isReady) ramp(sfxGain.gain, sfxVol);
  },
  setAmbience(s: AmbienceState) {
    amb = { ...s };
    if (isReady) applyAmbience();
  },
  play(s: Sfx) {
    if (!isReady || !ctx || ctx.state !== 'running') return;
    try { playSfx(s); } catch { /* never break gameplay on audio errors */ }
  },
  suspend() { if (ctx) void ctx.suspend().catch(() => {}); },
  resume() { if (ctx) void ctx.resume().catch(() => {}); },
};

// ---------- speech ----------
let voicesHooked = false;
function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const s = window.speechSynthesis;
  if (!voicesHooked) {
    voicesHooked = true;
    s.addEventListener?.('voiceschanged', () => { s.getVoices(); });
  }
  return s;
}

function japaneseVoice(s: SpeechSynthesis, lang = 'ja-JP'): SpeechSynthesisVoice | null {
  const voices = s.getVoices();
  const norm = (l: string) => l.replace('_', '-').toLowerCase();
  return (
    voices.find((v) => norm(v.lang) === norm(lang)) ??
    voices.find((v) => norm(v.lang).startsWith('ja')) ??
    null
  );
}

export function speak(text: string, opts?: { rate?: number; lang?: string }): boolean {
  const s = synth();
  if (!s || typeof SpeechSynthesisUtterance === 'undefined') return false;
  try {
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts?.lang ?? 'ja-JP';
    u.rate = opts?.rate ?? 0.85;
    const v = japaneseVoice(s, u.lang);
    if (v) u.voice = v;
    s.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function hasJapaneseVoice(): boolean {
  const s = synth();
  if (!s) return false;
  return japaneseVoice(s) !== null;
}
