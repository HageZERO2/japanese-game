import { useEffect, useMemo, useRef } from 'react';
import { useUI } from '../state/ui';
import { useGame } from '../state/store';
import { levelFor, QUESTS, ZONES, INTERIOR_NAMES, DAILY_GOALS } from '../data/progression';
import { questProgress } from '../state/store';
import { VOCAB } from '../data/vocab';
import { BUILDINGS, ROADS, ZONE_RECTS, POND, PARK } from '../world/layout';
import { NPCS } from '../data/npcs';
import { player } from '../game/runtime';
import { togglePanel } from '../systems/interaction';
import type { InteriorId } from '../types';

function Minimap() {
  const ref = useRef<HTMLCanvasElement>(null);
  const location = useUI((s) => s.location);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 66) return;
      last = t;
      const c = ref.current;
      if (!c) return;
      const g = c.getContext('2d')!;
      const S = c.width;
      const scale = S / 90; // ~90 m across
      g.clearRect(0, 0, S, S);
      g.save();
      g.beginPath();
      g.arc(S / 2, S / 2, S / 2 - 2, 0, Math.PI * 2);
      g.clip();
      g.fillStyle = '#cfe6c0';
      g.fillRect(0, 0, S, S);
      if (player.location !== 'outside') {
        g.fillStyle = '#f6efe4';
        g.fillRect(0, 0, S, S);
        g.restore();
        return;
      }
      const tx = (x: number) => S / 2 + (x - player.pos.x) * scale;
      const tz = (z: number) => S / 2 + (z - player.pos.z) * scale;
      for (const { zone, r } of ZONE_RECTS) {
        g.fillStyle = ZONES[zone].color + '55';
        g.fillRect(tx(r.x0), tz(r.z0), (r.x1 - r.x0) * scale, (r.z1 - r.z0) * scale);
      }
      g.fillStyle = '#b8e0a8';
      g.fillRect(tx(PARK.x0), tz(PARK.z0), (PARK.x1 - PARK.x0) * scale, (PARK.z1 - PARK.z0) * scale);
      for (const r of ROADS) {
        g.fillStyle = r.kind === 'asphalt' ? '#8c8a92' : r.kind === 'sidewalk' ? '#e6ddd0' : r.kind === 'cobble' ? '#e8d6c0' : '#e2d8c6';
        g.fillRect(tx(r.x0), tz(r.z0), (r.x1 - r.x0) * scale, (r.z1 - r.z0) * scale);
      }
      g.fillStyle = '#7fc0e0';
      g.beginPath();
      g.ellipse(tx(POND.x), tz(POND.z), POND.rx * scale, POND.rz * scale, 0, 0, Math.PI * 2);
      g.fill();
      for (const b of BUILDINGS) {
        g.fillStyle = b.enter ? '#f6a6c1' : '#fffaf2';
        g.strokeStyle = '#8a7a8a';
        g.lineWidth = 1;
        const x = tx(b.x - b.w / 2);
        const z = tz(b.z - b.d / 2);
        g.fillRect(x, z, b.w * scale, b.d * scale);
        g.strokeRect(x, z, b.w * scale, b.d * scale);
      }
      for (const n of NPCS) {
        if (n.location !== 'outside') continue;
        g.fillStyle = '#ffcf4a';
        g.strokeStyle = '#5a3a1a';
        g.beginPath();
        g.arc(tx(n.pos[0]), tz(n.pos[2]), 3.5, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
      // player arrow
      g.translate(S / 2, S / 2);
      g.rotate(-player.facing + Math.PI);
      g.fillStyle = '#e8467c';
      g.strokeStyle = '#ffffff';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0, -8);
      g.lineTo(6, 7);
      g.lineTo(0, 3);
      g.lineTo(-6, 7);
      g.closePath();
      g.fill();
      g.stroke();
      g.restore();
      // north marker
      g.fillStyle = '#3d3047';
      g.font = '700 11px "M PLUS Rounded 1c", sans-serif';
      g.textAlign = 'center';
      g.fillText('N', S / 2, 13);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  const zone = useUI((s) => s.zone);
  const label = location !== 'outside' ? INTERIOR_NAMES[location as InteriorId] : zone ? ZONES[zone] : null;
  return (
    <button className="minimap" onClick={() => togglePanel('map')} title="Open map (M)">
      <canvas ref={ref} width={168} height={168} />
      {label && (
        <div className="minimap-label">
          <span className="jp">{label.jp}</span>
          <span>{label.name}</span>
        </div>
      )}
    </button>
  );
}

function PlayerCard() {
  const xp = useGame((s) => s.xp);
  const discovered = useGame((s) => Object.keys(s.discovered).length);
  const saved = useGame((s) => Object.keys(s.dictionary).length);
  const name = useGame((s) => s.appearance.name);
  const lv = levelFor(xp);
  return (
    <div className="player-card">
      <div className="lv-badge">
        <small>Lv</small>
        {lv.level}
      </div>
      <div className="pc-body">
        <div className="pc-name">
          {name} <span className="pc-title">{lv.title}</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${lv.progress * 100}%` }} />
        </div>
        <div className="pc-stats">
          <span>{lv.next ? `${xp - lv.xp} / ${lv.next.xp - lv.xp} XP` : `${xp} XP (max)`}</span>
          <span title="Words studied / total">
            <b>{discovered}</b>/{VOCAB.length} words
          </span>
          <span title="Saved in dictionary">
            <b>{saved}</b> saved
          </span>
        </div>
      </div>
    </div>
  );
}

function Objective() {
  const state = useGame();
  const active = QUESTS.filter((q) => state.quests[q.id] === 'active');
  const daily = state.daily;
  const q = active[0];
  const doneDaily = DAILY_GOALS.filter((g) => daily.claimed.includes(g.id)).length;
  return (
    <button className="objective" onClick={() => togglePanel('quests')} title="Quests (Q)">
      <div className="obj-head">
        <span className="obj-tag">Quest</span>
        {active.length > 1 && <span className="obj-more">+{active.length - 1} more</span>}
      </div>
      {q ? (
        <>
          <div className="obj-title">{q.title}</div>
          <div className="obj-desc">{q.description}</div>
          <div className="obj-progress">
            {(() => {
              const p = questProgress(q, state);
              return (
                <>
                  <div className="mini-bar">
                    <div style={{ width: `${(p.current / p.target) * 100}%` }} />
                  </div>
                  <span>
                    {p.current}/{p.target}
                  </span>
                </>
              );
            })()}
          </div>
        </>
      ) : (
        <div className="obj-desc">Talk to townspeople marked with ! to find new quests.</div>
      )}
      <div className="obj-daily">
        Daily goals {doneDaily}/{DAILY_GOALS.length}
      </div>
    </button>
  );
}

function Toasts() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          <div className="toast-title">{t.title}</div>
          {t.body && <div className="toast-body">{t.body}</div>}
        </div>
      ))}
    </div>
  );
}

function ZoneBanner() {
  const b = useUI((s) => s.zoneBanner);
  if (!b) return null;
  return (
    <div key={b.key} className="zone-banner">
      <div className="zb-jp">{b.jp}</div>
      <div className="zb-en">{b.title}</div>
    </div>
  );
}

function Flash() {
  const m = useUI((s) => s.message);
  if (!m) return null;
  return (
    <div key={m.key} className="flash">
      {m.text}
    </div>
  );
}

function Prompt() {
  const f = useUI((s) => s.focus);
  if (!f) return null;
  return (
    <div className="hud-prompt">
      <span className="key">E</span>
      {f.kind === 'npc' ? 'Talk' : f.kind === 'door' ? (f.door?.locked ? 'Locked' : 'Enter') : 'Interact'}
      <span className="hp-label">{f.label}</span>
    </div>
  );
}

function Hotbar() {
  const items = useMemo(
    () =>
      [
        ['Tab', 'Dictionary', 'dictionary'],
        ['Q', 'Quests', 'quests'],
        ['P', 'Practice', 'practice'],
        ['M', 'Map', 'map'],
        ['C', 'Character', 'character'],
        ['Esc', 'Menu', 'pause'],
      ] as const,
    [],
  );
  const due = useGame((s) => Object.values(s.dictionary).filter((e) => e.srs.due <= Date.now()).length);
  return (
    <div className="hotbar">
      {items.map(([k, label, panel]) => (
        <button key={panel} onClick={() => togglePanel(panel)}>
          <span className="key">{k}</span>
          {label}
          {panel === 'practice' && due > 0 && <span className="badge">{due}</span>}
        </button>
      ))}
    </div>
  );
}

export function HUD() {
  const started = useUI((s) => s.started);
  const fading = useUI((s) => s.fading);
  const locked = useUI((s) => s.pointerLocked);
  const modal = useUI((s) => !!(s.panel || s.card || s.dialog));
  const fp = useGame((s) => s.settings.cameraMode === 'first');
  return (
    <>
      <div className={`fade ${fading ? 'on' : ''}`} />
      {started && (
        <div className={`hud ${modal ? 'dim' : ''}`}>
          <PlayerCard />
          <Minimap />
          <Objective />
          <Toasts />
          <ZoneBanner />
          <Flash />
          {!modal && <Prompt />}
          <Hotbar />
          {fp && !modal && <div className="crosshair" />}
          {!locked && !modal && <div className="look-hint">Click the scene to look around (or drag with the mouse)</div>}
        </div>
      )}
    </>
  );
}
