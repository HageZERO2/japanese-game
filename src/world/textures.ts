import * as THREE from 'three';

export const JP_FONT = '"M PLUS Rounded 1c", "Noto Sans CJK JP", "Hiragino Maru Gothic ProN", "Yu Gothic", "Meiryo", sans-serif';

const cache = new Map<string, THREE.Texture>();

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function finish(c: HTMLCanvasElement, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

/** Deterministic PRNG so textures look the same every load. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export interface SignOpts {
  bg?: string;
  fg?: string;
  vertical?: boolean;
  border?: string;
  sub?: string;
  w?: number;
  h?: number;
  glow?: boolean;
  weight?: number;
}

export function signTexture(text: string, o: SignOpts = {}) {
  const key = `sign:${text}:${JSON.stringify(o)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const w = o.w ?? (o.vertical ? 128 : 512);
  const h = o.h ?? (o.vertical ? 512 : 160);
  const [c, g] = canvas(w, h);
  g.fillStyle = o.bg ?? '#fff7e8';
  g.fillRect(0, 0, w, h);
  if (o.border) {
    g.strokeStyle = o.border;
    g.lineWidth = Math.max(6, w * 0.02);
    g.strokeRect(g.lineWidth, g.lineWidth, w - g.lineWidth * 2, h - g.lineWidth * 2);
  }
  g.fillStyle = o.fg ?? '#3a2a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (o.glow) {
    g.shadowColor = o.fg ?? '#fff';
    g.shadowBlur = 18;
  }
  const weight = o.weight ?? 800;
  if (o.vertical) {
    const chars = [...text];
    const size = Math.min(w * 0.72, (h * 0.9) / chars.length);
    g.font = `${weight} ${size}px ${JP_FONT}`;
    const start = h / 2 - ((chars.length - 1) * size) / 2;
    chars.forEach((ch, i) => g.fillText(ch, w / 2, start + i * size));
  } else {
    let size = h * (o.sub ? 0.5 : 0.62);
    g.font = `${weight} ${size}px ${JP_FONT}`;
    const m = g.measureText(text).width;
    if (m > w * 0.9) {
      size *= (w * 0.9) / m;
      g.font = `${weight} ${size}px ${JP_FONT}`;
    }
    g.fillText(text, w / 2, o.sub ? h * 0.4 : h / 2 + size * 0.04);
    if (o.sub) {
      g.shadowBlur = 0;
      g.font = `600 ${h * 0.2}px ${JP_FONT}`;
      g.globalAlpha = 0.8;
      g.fillText(o.sub, w / 2, h * 0.8);
    }
  }
  const t = finish(c);
  cache.set(key, t);
  return t;
}

type Pattern =
  | 'asphalt'
  | 'sidewalk'
  | 'cobble'
  | 'tatami'
  | 'wood'
  | 'planks'
  | 'roof'
  | 'stone'
  | 'sand'
  | 'grass'
  | 'shoji'
  | 'tile'
  | 'siding'
  | 'brick'
  | 'checker'
  | 'gravel'
  | 'bookspines'
  | 'shelfgoods'
  | 'wallpaper'
  | 'fabric';

export function pattern(kind: Pattern, repeat: [number, number] = [1, 1], tint?: string) {
  const key = `pat:${kind}:${repeat.join(',')}:${tint ?? ''}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const S = 256;
  const [c, g] = canvas(S, S);
  const r = rng(kind.length * 977 + (tint ? tint.charCodeAt(1) * 31 : 0));
  const speckle = (n: number, colors: string[], size = 2) => {
    for (let i = 0; i < n; i++) {
      g.fillStyle = colors[Math.floor(r() * colors.length)];
      g.fillRect(r() * S, r() * S, size * (0.5 + r()), size * (0.5 + r()));
    }
  };
  switch (kind) {
    case 'asphalt':
      g.fillStyle = tint ?? '#6b6a72';
      g.fillRect(0, 0, S, S);
      speckle(2200, ['#5d5c64', '#77767e', '#64636b', '#827f86'], 2);
      break;
    case 'sidewalk':
      g.fillStyle = tint ?? '#d9cfc2';
      g.fillRect(0, 0, S, S);
      speckle(900, ['#cfc4b6', '#e2d9cc', '#c8bcad'], 2);
      g.strokeStyle = 'rgba(120,100,90,0.35)';
      g.lineWidth = 3;
      for (let i = 0; i <= 2; i++) {
        g.beginPath();
        g.moveTo(0, (i * S) / 2);
        g.lineTo(S, (i * S) / 2);
        g.moveTo((i * S) / 2, 0);
        g.lineTo((i * S) / 2, S);
        g.stroke();
      }
      break;
    case 'cobble': {
      g.fillStyle = '#8f8379';
      g.fillRect(0, 0, S, S);
      const n = 8;
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          const v = 165 + Math.floor(r() * 50);
          g.fillStyle = tint && r() > 0.5 ? tint : `rgb(${v},${v - 12},${v - 22})`;
          const off = y % 2 ? S / n / 2 : 0;
          g.beginPath();
          g.roundRect(x * (S / n) + off + 2, y * (S / n) + 2, S / n - 4, S / n - 4, 6);
          g.fill();
        }
      break;
    }
    case 'tatami': {
      g.fillStyle = '#c9c17a';
      g.fillRect(0, 0, S, S);
      for (let y = 0; y < S; y += 3) {
        g.fillStyle = y % 6 ? 'rgba(120,120,40,0.18)' : 'rgba(255,255,200,0.15)';
        g.fillRect(0, y, S, 2);
      }
      g.fillStyle = '#3e5a3a';
      g.fillRect(0, 0, S, 10);
      g.fillRect(0, S - 10, S, 10);
      break;
    }
    case 'wood':
    case 'planks': {
      const base = tint ?? (kind === 'wood' ? '#b98a5e' : '#c99a6b');
      g.fillStyle = base;
      g.fillRect(0, 0, S, S);
      const rows = kind === 'planks' ? 6 : 1;
      for (let i = 0; i < 90; i++) {
        g.strokeStyle = `rgba(80,50,30,${0.05 + r() * 0.12})`;
        g.lineWidth = 1 + r() * 2;
        const y = r() * S;
        g.beginPath();
        g.moveTo(0, y);
        g.bezierCurveTo(S * 0.3, y + r() * 8 - 4, S * 0.6, y + r() * 8 - 4, S, y + r() * 6 - 3);
        g.stroke();
      }
      if (rows > 1) {
        g.fillStyle = 'rgba(60,35,20,0.35)';
        for (let i = 1; i < rows; i++) g.fillRect(0, (i * S) / rows - 1, S, 2);
        for (let i = 0; i < rows; i++) g.fillRect(((i * 97) % S) | 0, (i * S) / rows, 2, S / rows);
      }
      break;
    }
    case 'roof': {
      g.fillStyle = tint ?? '#4a5568';
      g.fillRect(0, 0, S, S);
      const rowsN = 8;
      for (let y = 0; y < rowsN; y++) {
        g.fillStyle = 'rgba(0,0,0,0.25)';
        g.fillRect(0, (y + 1) * (S / rowsN) - 4, S, 4);
        g.fillStyle = 'rgba(255,255,255,0.08)';
        g.fillRect(0, y * (S / rowsN), S, 3);
        for (let x = 0; x < 8; x++) {
          g.fillStyle = 'rgba(0,0,0,0.12)';
          g.fillRect(x * 32 + (y % 2) * 16, y * (S / rowsN), 2, S / rowsN);
        }
      }
      break;
    }
    case 'stone':
      g.fillStyle = tint ?? '#a7a39b';
      g.fillRect(0, 0, S, S);
      speckle(1500, ['#9a968e', '#b4b0a8', '#8f8b84', '#bdb9b0'], 3);
      break;
    case 'gravel':
      g.fillStyle = '#c8bfae';
      g.fillRect(0, 0, S, S);
      speckle(3000, ['#b6ac99', '#ddd5c6', '#a99f8c', '#e8e1d4'], 2.5);
      break;
    case 'sand': {
      g.fillStyle = '#e8dcc0';
      g.fillRect(0, 0, S, S);
      g.strokeStyle = 'rgba(150,130,90,0.35)';
      g.lineWidth = 2;
      for (let y = 6; y < S; y += 12) {
        g.beginPath();
        for (let x = 0; x <= S; x += 8) g.lineTo(x, y + Math.sin(x / 20) * 2);
        g.stroke();
      }
      break;
    }
    case 'grass':
      g.fillStyle = tint ?? '#8fbf6a';
      g.fillRect(0, 0, S, S);
      speckle(2600, ['#80b25c', '#9fcb78', '#76a653', '#a9d384', '#8cbc66'], 3);
      break;
    case 'shoji': {
      g.fillStyle = '#fbf6ea';
      g.fillRect(0, 0, S, S);
      g.fillStyle = '#9b7652';
      for (let i = 0; i <= 4; i++) g.fillRect((i * S) / 4 - 3, 0, 6, S);
      for (let i = 0; i <= 6; i++) g.fillRect(0, (i * S) / 6 - 3, S, 6);
      break;
    }
    case 'tile': {
      g.fillStyle = tint ?? '#f0ece4';
      g.fillRect(0, 0, S, S);
      g.strokeStyle = 'rgba(0,0,0,0.12)';
      g.lineWidth = 3;
      for (let i = 0; i <= 4; i++) {
        g.beginPath();
        g.moveTo((i * S) / 4, 0);
        g.lineTo((i * S) / 4, S);
        g.moveTo(0, (i * S) / 4);
        g.lineTo(S, (i * S) / 4);
        g.stroke();
      }
      break;
    }
    case 'checker': {
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) {
          g.fillStyle = (x + y) % 2 ? '#3b3330' : tint ?? '#efe6d6';
          g.fillRect((x * S) / 8, (y * S) / 8, S / 8, S / 8);
        }
      break;
    }
    case 'siding': {
      g.fillStyle = tint ?? '#f3e9da';
      g.fillRect(0, 0, S, S);
      for (let y = 0; y < S; y += 16) {
        g.fillStyle = 'rgba(0,0,0,0.07)';
        g.fillRect(0, y + 13, S, 3);
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.fillRect(0, y, S, 2);
      }
      break;
    }
    case 'brick': {
      g.fillStyle = '#c9b8a6';
      g.fillRect(0, 0, S, S);
      for (let y = 0; y < 16; y++)
        for (let x = 0; x < 8; x++) {
          const v = r() * 25;
          g.fillStyle = tint ? tint : `rgb(${176 + v},${96 + v},${74 + v})`;
          g.fillRect(x * 32 + (y % 2) * 16 + 1, y * 16 + 1, 30, 14);
        }
      break;
    }
    case 'bookspines': {
      g.fillStyle = '#6b4a33';
      g.fillRect(0, 0, S, S);
      const cols = ['#d9534f', '#f0ad4e', '#5bc0de', '#5cb85c', '#9b59b6', '#f7e1b5', '#34495e', '#e67e22', '#ffffff', '#e8a1b8'];
      for (let row = 0; row < 4; row++) {
        let x = 4;
        while (x < S - 6) {
          const bw = 6 + r() * 12;
          const bh = 40 + r() * 20;
          g.fillStyle = cols[Math.floor(r() * cols.length)];
          g.fillRect(x, row * 64 + 62 - bh, bw, bh);
          g.fillStyle = 'rgba(255,255,255,0.35)';
          g.fillRect(x + 1, row * 64 + 62 - bh + 6, bw - 2, 2);
          x += bw + 1;
        }
        g.fillStyle = '#4a3121';
        g.fillRect(0, row * 64 + 60, S, 4);
      }
      break;
    }
    case 'shelfgoods': {
      g.fillStyle = '#f4f4f2';
      g.fillRect(0, 0, S, S);
      const cols = ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#f78c6b', '#83c5be', '#ffffff', '#cdb4db', '#ffafcc'];
      for (let row = 0; row < 4; row++) {
        let x = 3;
        while (x < S - 8) {
          const bw = 10 + r() * 16;
          const bh = 26 + r() * 26;
          g.fillStyle = cols[Math.floor(r() * cols.length)];
          g.beginPath();
          g.roundRect(x, row * 64 + 60 - bh, bw, bh, 3);
          g.fill();
          g.fillStyle = 'rgba(255,255,255,0.5)';
          g.fillRect(x + 2, row * 64 + 60 - bh + 5, bw - 4, 4);
          x += bw + 2;
        }
        g.fillStyle = '#c9ced6';
        g.fillRect(0, row * 64 + 60, S, 4);
      }
      break;
    }
    case 'wallpaper': {
      g.fillStyle = tint ?? '#f6efe4';
      g.fillRect(0, 0, S, S);
      g.fillStyle = 'rgba(200,150,140,0.15)';
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
          g.beginPath();
          g.arc(x * 64 + (y % 2) * 32 + 16, y * 64 + 32, 6, 0, Math.PI * 2);
          g.fill();
        }
      break;
    }
    case 'fabric':
      g.fillStyle = tint ?? '#e9a3b5';
      g.fillRect(0, 0, S, S);
      g.fillStyle = 'rgba(255,255,255,0.35)';
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) {
          g.beginPath();
          g.arc(x * 32 + (y % 2) * 16 + 8, y * 32 + 16, 5, 0, Math.PI * 2);
          g.fill();
        }
      break;
  }
  const t = finish(c, repeat);
  cache.set(key, t);
  return t;
}

/** Soft round sprite used for clouds, glows and particles. */
export function softDot(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const key = `dot:${inner}:${outer}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [c, g] = canvas(128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.45, inner.replace(/[\d.]+\)$/, '0.6)'));
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = finish(c);
  cache.set(key, t);
  return t;
}

export function petalTexture() {
  const hit = cache.get('petal');
  if (hit) return hit;
  const [c, g] = canvas(64, 64);
  g.fillStyle = '#ffd1e0';
  g.beginPath();
  g.moveTo(32, 4);
  g.bezierCurveTo(58, 14, 54, 50, 32, 60);
  g.bezierCurveTo(10, 50, 6, 14, 32, 4);
  g.fill();
  g.fillStyle = '#ffb3cb';
  g.beginPath();
  g.ellipse(32, 40, 8, 14, 0, 0, Math.PI * 2);
  g.fill();
  const t = finish(c);
  cache.set('petal', t);
  return t;
}

/** Cute anime face texture: big glossy eyes + blush + small mouth. */
export function faceTexture(eye: string, mood: 'happy' | 'calm' = 'calm', skin = '#ffe1cf') {
  const key = `face:${eye}:${mood}:${skin}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [c, g] = canvas(256, 256);
  g.fillStyle = skin;
  g.fillRect(0, 0, 256, 256);
  const drawEye = (x: number) => {
    g.fillStyle = '#2a1f2d';
    g.beginPath();
    g.ellipse(x, 128, 19, 27, 0, 0, Math.PI * 2);
    g.fill();
    const grad = g.createLinearGradient(0, 104, 0, 152);
    grad.addColorStop(0, '#1d1420');
    grad.addColorStop(1, eye);
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(x, 131, 15, 22, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
    g.beginPath();
    g.ellipse(x - 6, 120, 6, 8, -0.3, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(x + 6, 142, 3, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#2a1f2d';
    g.lineWidth = 5;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x - 24, 104);
    g.quadraticCurveTo(x, 94, x + 24, 106);
    g.stroke();
  };
  drawEye(88);
  drawEye(168);
  g.fillStyle = 'rgba(255,120,140,0.35)';
  g.beginPath();
  g.ellipse(66, 166, 18, 9, 0, 0, Math.PI * 2);
  g.ellipse(190, 166, 18, 9, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#8a4a4a';
  g.lineWidth = 4;
  g.lineCap = 'round';
  g.beginPath();
  if (mood === 'happy') g.arc(128, 172, 10, 0.15 * Math.PI, 0.85 * Math.PI);
  else {
    g.moveTo(120, 180);
    g.quadraticCurveTo(128, 185, 136, 180);
  }
  g.stroke();
  const t = finish(c);
  cache.set(key, t);
  return t;
}
