import type { InteriorId, ZoneId } from '../types';

export interface Rect {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export const ZONE_RECTS: { zone: ZoneId; r: Rect }[] = [
  { zone: 'main', r: { x0: -31, x1: 31, z0: -17, z1: 17 } },
  { zone: 'shopping', r: { x0: 31, x1: 104, z0: -17, z1: 17 } },
  { zone: 'cafe', r: { x0: -104, x1: -31, z0: -17, z1: 17 } },
  { zone: 'traditional', r: { x0: -47, x1: 47, z0: -104, z1: -17 } },
  { zone: 'residential', r: { x0: -47, x1: 47, z0: 17, z1: 104 } },
];

export function zoneAt(x: number, z: number): ZoneId | null {
  for (const { zone, r } of ZONE_RECTS) if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return zone;
  return null;
}

export type BuildingStyle = 'shop' | 'house' | 'apartment' | 'traditional' | 'konbini' | 'police' | 'cafe';

export interface SignDef {
  text: string;
  sub?: string;
  bg: string;
  fg: string;
  vertical?: boolean;
  neon?: boolean;
}

export interface Building {
  id: string;
  /** Center of footprint. */
  x: number;
  z: number;
  /** Footprint size along x and z. */
  w: number;
  d: number;
  h: number;
  /** Direction the front faces. */
  face: 'n' | 's' | 'e' | 'w';
  style: BuildingStyle;
  wall: string;
  trim: string;
  roof: string;
  sign?: SignDef;
  /** Word studied when interacting with the storefront / sign. */
  word?: string;
  awning?: string;
  enter?: InteriorId;
  /** Shop window display texture. */
  display?: 'shelfgoods' | 'bookspines' | 'fabric' | 'none';
  noren?: string;
  lockedText?: string;
}

const north = (x0: number, x1: number, d = 9): Pick<Building, 'x' | 'z' | 'w' | 'd' | 'face'> => ({
  x: (x0 + x1) / 2,
  z: -7 - d / 2,
  w: x1 - x0,
  d,
  face: 's',
});
const south = (x0: number, x1: number, d = 9): Pick<Building, 'x' | 'z' | 'w' | 'd' | 'face'> => ({
  x: (x0 + x1) / 2,
  z: 7 + d / 2,
  w: x1 - x0,
  d,
  face: 'n',
});

export const BUILDINGS: Building[] = [
  // Main Street, north side
  { id: 'pharmacy', ...north(-31, -21), h: 8, style: 'shop', wall: '#f4e3cf', trim: '#7fb6a4', roof: '#5a6b78', sign: { text: '薬局', sub: 'PHARMACY', bg: '#e8f5ef', fg: '#2f7d63' }, word: 'shop', awning: '#7fc4ad', display: 'shelfgoods' },
  { id: 'flowers', ...north(-21, -13), h: 7, style: 'shop', wall: '#fbe6ea', trim: '#e38aa5', roof: '#6a5a74', sign: { text: '花屋', sub: 'FLOWERS', bg: '#fff0f4', fg: '#c45079' }, word: 'flower', awning: '#f2a7bf', display: 'fabric' },
  { id: 'police', ...north(-13, -5), h: 5, style: 'police', wall: '#eef0f2', trim: '#2c4a7a', roof: '#3d4f6b', sign: { text: '交番', sub: 'KOBAN', bg: '#2c4a7a', fg: '#ffffff' }, word: 'police_box' },
  { id: 'bakery', ...north(5, 13), h: 7, style: 'shop', wall: '#f8e7c9', trim: '#b8834f', roof: '#7a4f3a', sign: { text: 'パン屋', sub: 'BAKERY', bg: '#fff6e3', fg: '#9a5a2a' }, word: 'bread', awning: '#e9b67c', display: 'shelfgoods' },
  { id: 'apt_n', ...north(13, 22), h: 12, style: 'apartment', wall: '#e9eef2', trim: '#8aa1b4', roof: '#56606b', word: 'apartment' },
  { id: 'postoffice', ...north(22, 31), h: 8, style: 'shop', wall: '#ffffff', trim: '#d9443c', roof: '#5c616b', sign: { text: '郵便局', sub: 'POST OFFICE', bg: '#ffffff', fg: '#d9443c' }, word: 'building', awning: '#d9443c', display: 'none' },
  // Main Street, south side
  { id: 'apt_s', ...south(-31, -21), h: 13, style: 'apartment', wall: '#f3e6dc', trim: '#b88f7a', roof: '#5f5650', word: 'building' },
  { id: 'konbini', ...south(-21, -5, 10), h: 5.5, style: 'konbini', wall: '#ffffff', trim: '#3aa16b', roof: '#e8e8e8', sign: { text: 'ゆめマート', sub: '24H', bg: '#ffffff', fg: '#2f8f5b' }, word: 'convenience_store', enter: 'konbini', display: 'shelfgoods' },
  { id: 'house_s1', ...south(5, 14), h: 7.5, style: 'house', wall: '#f6ecd8', trim: '#9b7a5b', roof: '#4b5a6e', word: 'house' },
  { id: 'salon', ...south(14, 22), h: 7, style: 'shop', wall: '#e6f1fb', trim: '#6f9fd1', roof: '#4e5b70', sign: { text: '美容室', sub: 'HAIR SALON', bg: '#f2f8ff', fg: '#4a7fb8' }, word: 'mirror', awning: '#9cc4ea', display: 'none' },
  { id: 'house_s2', ...south(22, 31), h: 8, style: 'house', wall: '#fbeee6', trim: '#c4846b', roof: '#6b4b45', word: 'roof' },

  // Shopping District (商店街)
  { id: 'yaoya', ...north(31, 43), h: 7, style: 'shop', wall: '#f7ecd6', trim: '#6aa84f', roof: '#5d6a52', sign: { text: '八百屋', sub: 'GREENGROCER', bg: '#fdf8e8', fg: '#3f7d2c' }, word: 'greengrocer', awning: '#83c46a', display: 'none' },
  { id: 'clothes', ...north(43, 55), h: 8, style: 'shop', wall: '#f5e9f2', trim: '#a46aa0', roof: '#5c4c62', sign: { text: '服屋', sub: 'FASHION', bg: '#fff2fa', fg: '#8a4a87' }, word: 'clothes', awning: '#d8a3d3', display: 'fabric' },
  { id: 'bookstore', ...north(55, 67), h: 8, style: 'shop', wall: '#efe4d2', trim: '#6b4a33', roof: '#4a3f3a', sign: { text: '本屋', sub: 'BOOKS', bg: '#2e4057', fg: '#f7e8c8' }, word: 'bookstore', awning: '#3d5a80', enter: 'bookstore', display: 'bookspines' },
  { id: 'toys', ...north(67, 79), h: 7, style: 'shop', wall: '#fff3d1', trim: '#f08a4b', roof: '#6a5244', sign: { text: 'おもちゃ', sub: 'TOYS', bg: '#fff8e1', fg: '#e4572e' }, word: 'toy', awning: '#ffb35c', display: 'shelfgoods' },
  { id: 'souvenir', ...north(79, 91), h: 7.5, style: 'traditional', wall: '#e8d8bd', trim: '#7a4a2a', roof: '#3d3a3e', sign: { text: 'お土産', sub: 'SOUVENIRS', bg: '#7a2a2a', fg: '#fbe9c9' }, word: 'souvenir', noren: '#2e4a7a' },
  { id: 'fishmonger', ...north(91, 103), h: 7, style: 'shop', wall: '#e3f0f5', trim: '#2f6f8f', roof: '#455a66', sign: { text: '魚屋', sub: 'FISH', bg: '#e9f6fb', fg: '#215f80' }, word: 'fish', awning: '#5ea8c9', display: 'none' },
  { id: 'wagashi', ...south(31, 43), h: 7, style: 'traditional', wall: '#efe2c8', trim: '#6b3e26', roof: '#3a3637', sign: { text: '和菓子', sub: 'SWEETS', bg: '#5a2f45', fg: '#fde7ef' }, word: 'wagashi', noren: '#8c3b5c' },
  { id: 'takoyaki', ...south(43, 55), h: 6.5, style: 'shop', wall: '#fff0db', trim: '#d9443c', roof: '#5b4a42', sign: { text: 'たこ焼き', sub: 'TAKOYAKI', bg: '#d9443c', fg: '#fff3dc' }, word: 'takoyaki', awning: '#f06b5d', display: 'none' },
  { id: 'zakka', ...south(55, 67), h: 7.5, style: 'shop', wall: '#f0ebf7', trim: '#7d6bb3', roof: '#4d4a63', sign: { text: '雑貨', sub: 'ACCESSORIES', bg: '#f7f3ff', fg: '#5d4b9a' }, word: 'shop', awning: '#b2a3e0', display: 'fabric' },
  { id: 'electronics', ...south(67, 79), h: 9, style: 'shop', wall: '#e5e9ee', trim: '#3a5ba0', roof: '#3f4652', sign: { text: '電気屋', sub: 'ELECTRONICS', bg: '#1f3b73', fg: '#ffffff' }, word: 'camera', awning: '#4d79c7', display: 'shelfgoods' },
  { id: 'umbrella', ...south(79, 91), h: 7, style: 'shop', wall: '#fdf0e6', trim: '#3f8f8a', roof: '#4c5a5a', sign: { text: '傘', sub: 'UMBRELLAS', bg: '#eaf7f6', fg: '#2c7a75' }, word: 'umbrella', awning: '#7ccac4', display: 'none' },
  { id: 'kiosk_b', ...south(91, 103), h: 7, style: 'shop', wall: '#f7f0e4', trim: '#c08a3e', roof: '#5a5048', sign: { text: '売店', sub: 'KIOSK', bg: '#fff4dd', fg: '#a8681f' }, word: 'kiosk', awning: '#e8b766', display: 'shelfgoods' },

  // Café Street (カフェ通り)
  { id: 'cafe', ...north(-43, -31), h: 7.5, style: 'cafe', wall: '#fbeee6', trim: '#8a5a44', roof: '#5a4038', sign: { text: 'カフェ・さくら', sub: 'CAFÉ SAKURA', bg: '#fff5f7', fg: '#c45079' }, word: 'cafe', awning: '#f2b5c6', enter: 'cafe', display: 'none' },
  { id: 'sushi', ...north(-55, -43), h: 7, style: 'traditional', wall: '#efe4cf', trim: '#5a3a26', roof: '#33363d', sign: { text: '寿司', sub: 'SUSHI', bg: '#f5efe1', fg: '#1d2b44' }, word: 'sushi_shop', noren: '#1d2b44' },
  { id: 'kissa', ...north(-67, -55), h: 7.5, style: 'shop', wall: '#e9d9c6', trim: '#6b3e2e', roof: '#463733', sign: { text: '喫茶店', sub: 'KISSATEN', bg: '#3f2a22', fg: '#f6d7a7', neon: true }, word: 'kissaten', awning: '#8a5a44', display: 'none' },
  { id: 'cakeshop', ...north(-79, -67), h: 7, style: 'shop', wall: '#fff0f3', trim: '#e38aa5', roof: '#6a5462', sign: { text: 'ケーキ屋', sub: 'PÂTISSERIE', bg: '#fff7fa', fg: '#c45079' }, word: 'cake_shop', awning: '#f7c6d5', display: 'shelfgoods' },
  { id: 'restaurant', ...north(-91, -79), h: 8, style: 'shop', wall: '#f3ead8', trim: '#a0522d', roof: '#4f3d33', sign: { text: 'レストラン', sub: 'RESTAURANT', bg: '#fff8ec', fg: '#8b3a1a' }, word: 'restaurant', awning: '#c98b5e', display: 'none' },
  { id: 'izakaya', ...north(-103, -91), h: 7, style: 'traditional', wall: '#e2d2b8', trim: '#4a2e1f', roof: '#2f2c2e', sign: { text: '居酒屋', sub: 'IZAKAYA', bg: '#3a1f1f', fg: '#ffb46b', neon: true }, word: 'paper_lantern', noren: '#6b1f1f' },
  { id: 'ramen', ...south(-43, -31), h: 7, style: 'traditional', wall: '#f2e6cf', trim: '#6b2a1f', roof: '#2f2c2e', sign: { text: 'ラーメン', sub: 'RAMEN', bg: '#b3261e', fg: '#fff3dc' }, word: 'ramen_shop', enter: 'ramen', noren: '#b3261e' },
  { id: 'crepe', ...south(-55, -43), h: 6.5, style: 'shop', wall: '#fff6e9', trim: '#f29e4c', roof: '#5f5048', sign: { text: 'クレープ', sub: 'CRÊPES', bg: '#fff1dc', fg: '#e07a2e' }, word: 'crepe', awning: '#ffc48a', display: 'none' },
  { id: 'karaoke', ...south(-67, -55), h: 9, style: 'shop', wall: '#2f2a3f', trim: '#ff5fa2', roof: '#26222f', sign: { text: 'カラオケ', sub: 'KARAOKE', bg: '#1b1630', fg: '#ff6fb5', neon: true }, word: 'neon', awning: '#5a4a8a', display: 'none' },
  { id: 'teishoku', ...south(-79, -67), h: 7, style: 'traditional', wall: '#ece0c9', trim: '#5a3a26', roof: '#3a3637', sign: { text: '定食', sub: 'SET MEALS', bg: '#f5efe1', fg: '#5a3a26' }, word: 'delicious', noren: '#3f5a3a' },
  { id: 'tempura', ...south(-91, -79), h: 7.5, style: 'shop', wall: '#f7ecd2', trim: '#b8862f', roof: '#55493c', sign: { text: '天ぷら', sub: 'TEMPURA', bg: '#fff6dc', fg: '#9a6a12' }, word: 'tempura', awning: '#e7c06a', display: 'none' },
  { id: 'apt_c', ...south(-103, -91), h: 11, style: 'apartment', wall: '#eee6f2', trim: '#9a88b0', roof: '#544c5f', word: 'building' },

  // Residential (住宅街) west side, fronts face the road (east)
  { id: 'tanaka', x: -17, z: 29, w: 10, d: 11, h: 7.5, face: 'e', style: 'house', wall: '#f7efdf', trim: '#8c6a4a', roof: '#3f4d63', word: 'house', enter: 'house', lockedText: 'This is the Tanaka family home. Maybe say hello to Mrs. Tanaka first.' },
  { id: 'res_w2', x: -17, z: 46, w: 10, d: 10, h: 7, face: 'e', style: 'house', wall: '#eaf1e6', trim: '#6f8f62', roof: '#5a4a44', word: 'roof' },
  // east side, fronts face west
  { id: 'res_e1', x: 17, z: 27, w: 10, d: 10, h: 7.5, face: 'w', style: 'house', wall: '#fbeee6', trim: '#b97a62', roof: '#4b5a6e', word: 'house' },
  { id: 'res_e2', x: 17, z: 43, w: 10, d: 10, h: 7, face: 'w', style: 'house', wall: '#eef3fb', trim: '#6f8fb8', roof: '#6b4b45', word: 'stairs' },
  { id: 'res_apt', x: 19, z: 62, w: 14, d: 14, h: 11, face: 'w', style: 'apartment', wall: '#f5efe3', trim: '#a08a6a', roof: '#5a5650', word: 'apartment' },
  { id: 'res_e3', x: 17, z: 82, w: 10, d: 10, h: 7.5, face: 'w', style: 'house', wall: '#fff4e0', trim: '#c49a4a', roof: '#45505e', word: 'window' },
  { id: 'res_e4', x: 17, z: 96, w: 10, d: 9, h: 7, face: 'w', style: 'traditional', wall: '#e9dcc3', trim: '#5a3a26', roof: '#333238', word: 'old_house' },

  // Traditional district
  { id: 'minka_w', x: -30, z: -26, w: 12, d: 9, h: 6.5, face: 'e', style: 'traditional', wall: '#e8dcc3', trim: '#4f3322', roof: '#3a3a40', word: 'old_house' },
  { id: 'teahouse', x: 31, z: -26, w: 11, d: 9, h: 6, face: 'w', style: 'traditional', wall: '#efe3c9', trim: '#5a3a26', roof: '#333238', sign: { text: '茶屋', sub: 'TEAHOUSE', bg: '#3f5a3a', fg: '#f7efd8' }, word: 'green_tea', noren: '#3f5a3a' },
];

/** Walkable ground surfaces drawn on the minimap and the ground. */
export const ROADS: (Rect & { kind: 'asphalt' | 'sidewalk' | 'cobble' | 'gravel' | 'stone' })[] = [
  { x0: -31, x1: 31, z0: -3.5, z1: 3.5, kind: 'asphalt' },
  { x0: -31, x1: 31, z0: -7, z1: -3.5, kind: 'sidewalk' },
  { x0: -31, x1: 31, z0: 3.5, z1: 7, kind: 'sidewalk' },
  { x0: 31, x1: 104, z0: -7, z1: 7, kind: 'cobble' },
  { x0: -104, x1: -31, z0: -7, z1: 7, kind: 'cobble' },
  { x0: -3, x1: 3, z0: 7, z1: 104, kind: 'asphalt' },
  { x0: -5, x1: -3, z0: 7, z1: 104, kind: 'sidewalk' },
  { x0: 3, x1: 5, z0: 7, z1: 104, kind: 'sidewalk' },
  { x0: -2.5, x1: 2.5, z0: -82, z1: -7, kind: 'stone' },
  { x0: -12, x1: 12, z0: -96, z1: -66, kind: 'gravel' },
];

export const POND = { x: -25, z: -44, rx: 10, rz: 6.5 };
export const ROCK_GARDEN = { x0: 15, x1: 31, z0: -50, z1: -39 };
export const PARK = { x0: -45, x1: -7, z0: 56, z1: 102 };
export const BRIDGE = { x0: -36.5, x1: -13.5, z: -44, halfWidth: 1.3, rise: 1.1 };
export const SHRINE_PLATFORM = { x0: -9, x1: 9, z0: -97, z1: -82, y: 0.9 };

/** Ground height for walkable raised surfaces outside. */
export function groundHeight(x: number, z: number): number {
  if (x > BRIDGE.x0 && x < BRIDGE.x1 && Math.abs(z - BRIDGE.z) < BRIDGE.halfWidth + 0.2) {
    const t = (x - BRIDGE.x0) / (BRIDGE.x1 - BRIDGE.x0);
    return Math.sin(t * Math.PI) * BRIDGE.rise;
  }
  const p = SHRINE_PLATFORM;
  if (x > p.x0 && x < p.x1 && z > p.z0 - 0 && z < p.z1 + 2.5) {
    if (z < p.z1) return p.y;
    return p.y * (1 - (z - p.z1) / 2.5);
  }
  return 0;
}

/** Spot just outside a building's front door, facing away from it. */
export function doorFront(b: Building, dist = 1.6): { x: number; z: number; yaw: number } {
  switch (b.face) {
    case 's':
      return { x: b.x, z: b.z + b.d / 2 + dist, yaw: Math.PI };
    case 'n':
      return { x: b.x, z: b.z - b.d / 2 - dist, yaw: 0 };
    case 'e':
      return { x: b.x + b.w / 2 + dist, z: b.z, yaw: -Math.PI / 2 };
    case 'w':
      return { x: b.x - b.w / 2 - dist, z: b.z, yaw: Math.PI / 2 };
  }
}

export const SPAWN = { x: 2, z: 5.2, camYaw: 0 };
