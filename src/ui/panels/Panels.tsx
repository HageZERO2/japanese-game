import type { ReactNode } from 'react';
import { useUI, type Panel } from '../../state/ui';
import { closeModal, lockPointer } from '../../systems/interaction';
import { audio } from '../../systems/audio';
import { Icon } from './common';
import { Dictionary } from './Dictionary';
import { Quests, Achievements } from './QuestsAch';
import { Practice } from './Practice';
import { Character, Settings } from './CharSettings';
import { MapPanel } from './MapPanel';
import './panels.css';

const META: Record<Panel, { title: string; jp: string }> = {
  pause: { title: 'YUME NO MACHI', jp: '夢の街' },
  dictionary: { title: 'Dictionary', jp: '辞書' },
  quests: { title: 'Quests', jp: 'クエスト' },
  achievements: { title: 'Achievements', jp: '実績' },
  practice: { title: 'Practice', jp: '練習' },
  character: { title: 'Character', jp: 'キャラクター' },
  map: { title: 'Map', jp: '地図' },
  settings: { title: 'Settings', jp: '設定' },
};

const TABS: Exclude<Panel, 'pause'>[] = ['dictionary', 'quests', 'achievements', 'practice', 'character', 'map', 'settings'];

const CONTROLS: [string, string][] = [
  ['W A S D', 'Move'],
  ['Shift', 'Run'],
  ['Space', 'Jump'],
  ['E', 'Interact'],
  ['Mouse', 'Look (click to capture mouse)'],
  ['Wheel', 'Zoom camera'],
  ['V', 'First / third person'],
  ['Tab', 'Dictionary'],
  ['Q', 'Quests'],
  ['P', 'Practice'],
  ['M', 'Map'],
  ['C', 'Character'],
  ['Esc', 'Menu'],
];

const close = () => {
  closeModal();
  lockPointer();
};
const go = (p: Panel) => {
  audio.play('ui');
  useUI.getState().openPanel(p);
};

function Pause() {
  return (
    <div className="pn-pause">
      <div className="pn-pause-menu">
        <button className="pn-btn pn-primary big" onClick={close}>Resume</button>
        {TABS.map((t) => (
          <button key={t} className="pn-btn big" onClick={() => go(t)}>
            {META[t].title}<span className="pn-btn-jp">{META[t].jp}</span>
          </button>
        ))}
      </div>
      <div className="pn-controls">
        <h3 className="pn-h3">Controls<span className="pn-h3-jp">操作</span></h3>
        {CONTROLS.map(([k, v]) => (
          <div key={k} className="pn-ctl"><kbd>{k}</kbd><span>{v}</span></div>
        ))}
      </div>
    </div>
  );
}

function body(p: Panel): ReactNode {
  switch (p) {
    case 'pause': return <Pause />;
    case 'dictionary': return <Dictionary />;
    case 'quests': return <Quests />;
    case 'achievements': return <Achievements />;
    case 'practice': return <Practice onClose={close} />;
    case 'character': return <Character />;
    case 'map': return <MapPanel />;
    case 'settings': return <Settings />;
  }
}

export function Panels() {
  const panel = useUI((s) => s.panel);
  if (!panel) return null;
  const m = META[panel];
  return (
    <div className="pn-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className={`pn-modal pn-modal-${panel}`} role="dialog" aria-modal="true" aria-label={m.title}>
        <header className="pn-head">
          <div className="pn-title">
            <span className={panel === 'pause' ? 'pn-title-big' : ''}>{m.jp}</span>
            <small>{panel === 'pause' ? 'YUME NO MACHI' : m.title}</small>
          </div>
          {panel !== 'pause' && (
            <nav className="pn-tabs" aria-label="Menu sections">
              {TABS.map((t) => (
                <button key={t} className={`pn-tab ${t === panel ? 'on' : ''}`} onClick={() => go(t)} aria-current={t === panel}>
                  {META[t].title}
                </button>
              ))}
            </nav>
          )}
          <button className="pn-close" onClick={close} aria-label="Close"><Icon name="close" /></button>
        </header>
        <div className="pn-body" key={panel}>{body(panel)}</div>
      </div>
    </div>
  );
}
