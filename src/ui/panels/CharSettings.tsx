import { useState } from 'react';
import { useGame, statusOf, type TimeMode } from '../../state/store';
import { VOCAB } from '../../data/vocab';
import { QUESTS, levelFor } from '../../data/progression';
import { NPCS } from '../../data/npcs';
import { audio, hasJapaneseVoice } from '../../systems/audio';
import { Bar, Section } from './common';

const HAIR = ['#4a3358', '#2f2a3a', '#7a4a32', '#d9a066', '#f2d27a', '#f08fb0', '#7fb2e5', '#b79be0'];
const OUTFIT = ['#f3a5bf', '#f6b26b', '#8ec5f2', '#a8d8b0', '#c7a6f0', '#fff1d6', '#e57f84', '#6f8fc8'];
const ACCENT = ['#7ec8e3', '#f6a6c1', '#f9d56e', '#9fdcb2', '#d4b5f5', '#ffb88c', '#ffffff', '#3d3047'];

function Swatches({ colors, value, onPick, label }: { colors: string[]; value: string; onPick: (c: string) => void; label: string }) {
  return (
    <div className="pn-swatches" role="group" aria-label={label}>
      {colors.map((c) => (
        <button
          key={c}
          className={`pn-swatch ${value.toLowerCase() === c ? 'on' : ''}`}
          style={{ background: c }}
          aria-label={`${label} ${c}`}
          aria-pressed={value.toLowerCase() === c}
          onClick={() => onPick(c)}
        />
      ))}
    </div>
  );
}

export function Character() {
  const s = useGame();
  const a = s.appearance;
  const lv = levelFor(s.xp);
  const saved = Object.keys(s.dictionary);
  const mastered = saved.filter((id) => statusOf(s.dictionary[id]) === 'mastered').length;
  const questsDone = QUESTS.filter((q) => s.quests[q.id] === 'done').length;
  const set = s.setAppearance;
  const stats: [string, string][] = [
    ['Words discovered', `${Object.keys(s.discovered).length} / ${VOCAB.length}`],
    ['Words saved', String(saved.length)],
    ['Words mastered', String(mastered)],
    ['Quests completed', `${questsDone} / ${QUESTS.length}`],
    ['People met', `${s.talkedNpcs.length} / ${NPCS.length}`],
    ['Districts visited', `${s.visitedZones.length} / 5`],
    ['Interiors visited', `${s.visitedInteriors.length} / 5`],
  ];
  return (
    <div className="pn-cols">
      <div className="pn-col-main">
        <Section title="Name" jp="名前">
          <input className="pn-input" maxLength={16} value={a.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your name" />
        </Section>
        <Section title="Hairstyle" jp="髪型">
          <div className="pn-seg">
            {(['long', 'short', 'twin'] as const).map((h) => (
              <button key={h} className={a.hairStyle === h ? 'on' : ''} onClick={() => set({ hairStyle: h })}>
                {h === 'long' ? 'Long' : h === 'short' ? 'Short' : 'Twin tails'}
              </button>
            ))}
          </div>
        </Section>
        <Section title="Hair color" jp="髪の色">
          <Swatches colors={HAIR} value={a.hair} onPick={(c) => set({ hair: c })} label="Hair color" />
        </Section>
        <Section title="Outfit color" jp="服の色">
          <Swatches colors={OUTFIT} value={a.outfit} onPick={(c) => set({ outfit: c })} label="Outfit color" />
        </Section>
        <Section title="Accent color" jp="アクセント">
          <Swatches colors={ACCENT} value={a.accent} onPick={(c) => set({ accent: c })} label="Accent color" />
        </Section>
      </div>
      <aside className="pn-col-side">
        <Section title={a.name || 'Traveler'} jp="ステータス">
          <div className="pn-player">
            <div className="pn-level">Lv {lv.level}</div>
            <div>
              <div className="pn-level-title">{lv.title}</div>
              <div className="pn-quest-jp">{lv.jp}</div>
            </div>
          </div>
          <Bar value={lv.progress} tone="orange" />
          <div className="pn-muted">{s.xp} XP{lv.next ? ` / ${lv.next.xp}` : ''}</div>
          <dl className="pn-dl">
            {stats.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </Section>
      </aside>
    </div>
  );
}

const TIMES: { id: TimeMode; en: string; jp: string }[] = [
  { id: 'morning', en: 'Morning', jp: '朝' },
  { id: 'afternoon', en: 'Afternoon', jp: '昼' },
  { id: 'sunset', en: 'Sunset', jp: '夕方' },
  { id: 'night', en: 'Night', jp: '夜' },
  { id: 'rain', en: 'Rain', jp: '雨' },
  { id: 'sakura', en: 'Sakura', jp: '桜' },
];

function Toggle({ label, desc, on, onChange }: { label: string; desc?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="pn-toggle">
      <span>
        <b>{label}</b>
        {desc && <small>{desc}</small>}
      </span>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <i className="pn-switch" />
    </label>
  );
}

function Slider({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt: (v: number) => string }) {
  return (
    <label className="pn-slider">
      <span>{label}<b>{fmt(value)}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Settings() {
  const st = useGame((s) => s.settings);
  const setSettings = useGame((s) => s.setSettings);
  const reset = useGame((s) => s.resetProgress);
  const [confirm, setConfirm] = useState(false);
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const voice = hasJapaneseVoice();
  return (
    <div className="pn-cols">
      <div className="pn-col-main">
        <Section title="Audio" jp="音">
          <Slider label="Music" value={st.musicVolume} min={0} max={1} step={0.01} fmt={pct}
            onChange={(v) => { setSettings({ musicVolume: v }); audio.setMusicVolume(v); }} />
          <Slider label="Sound effects" value={st.sfxVolume} min={0} max={1} step={0.01} fmt={pct}
            onChange={(v) => { setSettings({ sfxVolume: v }); audio.setSfxVolume(v); }} />
        </Section>
        <Section title="Time and weather" jp="時間と天気">
          <div className="pn-time-grid">
            {TIMES.map((t) => (
              <button key={t.id} className={`pn-time ${st.timeMode === t.id ? 'on' : ''}`} onClick={() => setSettings({ timeMode: t.id })} aria-pressed={st.timeMode === t.id}>
                <span className="pn-time-jp">{t.jp}</span>
                <span>{t.en}</span>
              </button>
            ))}
          </div>
        </Section>
        <Section title="Controls" jp="操作">
          <Slider label="Mouse sensitivity" value={st.sensitivity} min={0.3} max={2.5} step={0.05} fmt={(v) => `${v.toFixed(2)}x`} onChange={(v) => setSettings({ sensitivity: v })} />
          <Toggle label="Invert Y axis" on={st.invertY} onChange={(v) => setSettings({ invertY: v })} />
          <div className="pn-field">
            <span>Camera</span>
            <div className="pn-seg">
              <button className={st.cameraMode === 'third' ? 'on' : ''} onClick={() => setSettings({ cameraMode: 'third' })}>Third person</button>
              <button className={st.cameraMode === 'first' ? 'on' : ''} onClick={() => setSettings({ cameraMode: 'first' })}>First person</button>
            </div>
          </div>
        </Section>
      </div>
      <aside className="pn-col-side">
        <Section title="Game" jp="ゲーム">
          <div className="pn-field">
            <span>Graphics quality</span>
            <div className="pn-seg">
              <button className={st.quality === 'low' ? 'on' : ''} onClick={() => setSettings({ quality: 'low' })}>Low</button>
              <button className={st.quality === 'high' ? 'on' : ''} onClick={() => setSettings({ quality: 'high' })}>High</button>
            </div>
          </div>
          <Toggle label="Show romaji" desc="Display romaji under Japanese text" on={st.showRomaji} onChange={(v) => setSettings({ showRomaji: v })} />
          <Toggle label="Discovery sparkles" desc="Highlight objects you can study" on={st.showMarkers} onChange={(v) => setSettings({ showMarkers: v })} />
          <Toggle label="Auto-pronounce" desc="Speak words when a card opens" on={st.autoSpeak} onChange={(v) => setSettings({ autoSpeak: v })} />
          <p className="pn-muted">
            {voice
              ? 'A Japanese (ja-JP) voice is available for pronunciation.'
              : 'No Japanese voice was detected in this browser. Pronunciation may be silent or use a default voice; install a Japanese system voice for best results.'}
          </p>
        </Section>
        <Section title="Progress" jp="進行状況">
          {confirm ? (
            <div className="pn-confirm">
              <p>This erases your dictionary, XP, quests and achievements. This cannot be undone.</p>
              <div className="pn-row-btns">
                <button className="pn-btn pn-danger" onClick={() => { reset(); setConfirm(false); }}>Yes, reset everything</button>
                <button className="pn-btn" onClick={() => setConfirm(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="pn-btn pn-danger" onClick={() => setConfirm(true)}>Reset progress</button>
          )}
        </Section>
      </aside>
    </div>
  );
}
