import { useEffect, useRef } from 'react';
import { useGame } from '../../state/store';
import { useUI } from '../../state/ui';
import { INTERIOR_NAMES, ZONES } from '../../data/progression';
import { NPCS } from '../../data/npcs';
import { BUILDINGS, PARK, POND, ROADS, ROCK_GARDEN, ZONE_RECTS } from '../../world/layout';
import { player } from '../../game/runtime';

const SIZE = 760;
const RANGE = 110;
const sc = SIZE / (RANGE * 2);
const X = (x: number) => (x + RANGE) * sc;
const Y = (z: number) => (z + RANGE) * sc;

const ROAD_COLOR = { asphalt: '#8d8896', sidewalk: '#d8cfc4', cobble: '#c9b49a', gravel: '#d9d2c3', stone: '#b9b3aa' } as const;

function draw(ctx: CanvasRenderingContext2D, visited: string[]) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = '#e9f2dc';
  ctx.fillRect(0, 0, SIZE, SIZE);

  for (const { zone, r } of ZONE_RECTS) {
    const seen = visited.includes(zone);
    ctx.globalAlpha = seen ? 0.55 : 0.25;
    ctx.fillStyle = ZONES[zone].color;
    ctx.fillRect(X(r.x0), Y(r.z0), (r.x1 - r.x0) * sc, (r.z1 - r.z0) * sc);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(61,48,71,0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(X(r.x0), Y(r.z0), (r.x1 - r.x0) * sc, (r.z1 - r.z0) * sc);
  }

  // park, pond, rock garden
  ctx.fillStyle = '#b9dca0';
  ctx.fillRect(X(PARK.x0), Y(PARK.z0), (PARK.x1 - PARK.x0) * sc, (PARK.z1 - PARK.z0) * sc);
  ctx.fillStyle = '#7fbfe8';
  ctx.beginPath();
  ctx.ellipse(X(POND.x), Y(POND.z), POND.rx * sc, POND.rz * sc, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e4dccb';
  ctx.fillRect(X(ROCK_GARDEN.x0), Y(ROCK_GARDEN.z0), (ROCK_GARDEN.x1 - ROCK_GARDEN.x0) * sc, (ROCK_GARDEN.z1 - ROCK_GARDEN.z0) * sc);

  for (const r of ROADS) {
    ctx.fillStyle = ROAD_COLOR[r.kind];
    ctx.fillRect(X(r.x0), Y(r.z0), (r.x1 - r.x0) * sc, (r.z1 - r.z0) * sc);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 11px "M PLUS Rounded 1c", sans-serif';
  ctx.fillStyle = '#3d4a2f';
  ctx.fillText('Park', X((PARK.x0 + PARK.x1) / 2), Y((PARK.z0 + PARK.z1) / 2));
  ctx.fillText('Koi pond', X(POND.x), Y(POND.z));
  ctx.fillText('Rock garden', X((ROCK_GARDEN.x0 + ROCK_GARDEN.x1) / 2), Y((ROCK_GARDEN.z0 + ROCK_GARDEN.z1) / 2));

  // buildings
  for (const b of BUILDINGS) {
    const x = X(b.x - b.w / 2);
    const y = Y(b.z - b.d / 2);
    ctx.fillStyle = b.enter ? '#f6b26b' : b.wall;
    ctx.strokeStyle = b.enter ? '#c97b22' : 'rgba(61,48,71,0.45)';
    ctx.lineWidth = b.enter ? 2 : 1;
    ctx.fillRect(x, y, b.w * sc, b.d * sc);
    ctx.strokeRect(x, y, b.w * sc, b.d * sc);
  }
  for (const b of BUILDINGS) {
    if (!b.enter) continue;
    const n = INTERIOR_NAMES[b.enter];
    const cx = X(b.x);
    const cy = Y(b.z);
    ctx.fillStyle = '#fff8f0';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c97b22';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#3d3047';
    ctx.font = '700 10px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText('入', cx, cy + 0.5);
    ctx.font = '700 11px "M PLUS Rounded 1c", sans-serif';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,248,240,0.9)';
    ctx.strokeText(n.jp, cx, cy + 20);
    ctx.fillText(n.jp, cx, cy + 20);
  }

  // zone labels
  for (const { zone, r } of ZONE_RECTS) {
    const seen = visited.includes(zone);
    const cx = X((r.x0 + r.x1) / 2);
    const cy = Y((r.z0 + r.z1) / 2);
    ctx.globalAlpha = seen ? 1 : 0.6;
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,248,240,0.95)';
    ctx.fillStyle = '#3d3047';
    ctx.font = '800 16px "M PLUS Rounded 1c", sans-serif';
    ctx.strokeText(ZONES[zone].name, cx, cy - 10);
    ctx.fillText(ZONES[zone].name, cx, cy - 10);
    ctx.font = '700 13px "M PLUS Rounded 1c", sans-serif';
    ctx.strokeText(ZONES[zone].jp, cx, cy + 8);
    ctx.fillText(ZONES[zone].jp, cx, cy + 8);
    if (!seen) {
      ctx.font = '800 26px "M PLUS Rounded 1c", sans-serif';
      ctx.strokeText('?', cx, cy + 32);
      ctx.fillText('?', cx, cy + 32);
    }
    ctx.globalAlpha = 1;
  }

  // outdoor NPCs
  ctx.font = '600 10px "M PLUS Rounded 1c", sans-serif';
  for (const n of NPCS) {
    if (n.location !== 'outside') continue;
    const x = X(n.pos[0]);
    const y = Y(n.pos[2]);
    ctx.fillStyle = '#8ec5f2';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3d3047';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,248,240,0.9)';
    ctx.strokeText(n.name, x, y - 11);
    ctx.fillText(n.name, x, y - 11);
  }

  // player
  if (player.location === 'outside') {
    const px = X(player.pos.x);
    const py = Y(player.pos.z);
    const dx = Math.sin(player.facing);
    const dy = Math.cos(player.facing);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2);
    ctx.fillStyle = '#f6a6c1';
    ctx.strokeStyle = '#3d3047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(8, -7);
    ctx.lineTo(0, -3);
    ctx.lineTo(-8, -7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

export function MapPanel() {
  const ref = useRef<HTMLCanvasElement>(null);
  const location = useUI((s) => s.location);
  const visited = useGame((s) => s.visitedZones);
  const visitedRef = useRef(visited);
  visitedRef.current = visited;

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last >= 100) {
        last = t;
        draw(ctx, visitedRef.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const inside = location !== 'outside';
  return (
    <div className="pn-map-wrap">
      <canvas ref={ref} className="pn-map" width={SIZE} height={SIZE} />
      <aside className="pn-map-side">
        <div className="pn-map-loc">
          {inside ? (
            <>
              <div className="pn-muted">You are inside</div>
              <div className="pn-level-title">{INTERIOR_NAMES[location].name}</div>
              <div className="pn-quest-jp">{INTERIOR_NAMES[location].jp}</div>
            </>
          ) : (
            <>
              <div className="pn-muted">You are outside</div>
              <div className="pn-level-title">The pink arrow is you</div>
            </>
          )}
        </div>
        <ul className="pn-legend">
          <li><i style={{ background: '#f6b26b' }} /> Enterable building (入)</li>
          <li><i style={{ background: '#8ec5f2', borderRadius: '50%' }} /> Townsperson</li>
          <li><i style={{ background: '#7fbfe8', borderRadius: '50%' }} /> Pond</li>
          <li><i style={{ background: '#b9dca0' }} /> Park</li>
        </ul>
        <div className="pn-muted">Districts marked "?" are not explored yet. North is up.</div>
      </aside>
    </div>
  );
}
