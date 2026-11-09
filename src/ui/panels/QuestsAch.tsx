import { useGame, questProgress } from '../../state/store';
import { ACHIEVEMENTS, DAILY_GOALS, INTERIOR_NAMES, QUESTS, ZONES, XP, levelFor, type QuestDef } from '../../data/progression';
import { NPC_BY_ID } from '../../data/npcs';
import { zoneAt } from '../../world/layout';
import { Bar, Empty, Icon, Section, fmtDate } from './common';

function giverWhere(id: string): string {
  const n = NPC_BY_ID[id];
  if (!n) return '';
  if (n.location === 'outside') {
    const z = zoneAt(n.pos[0], n.pos[2]);
    return z ? `${ZONES[z].name} (${ZONES[z].jp})` : 'outdoors';
  }
  return `inside ${INTERIOR_NAMES[n.location].name}`;
}

export function Quests() {
  const s = useGame();
  const lv = levelFor(s.xp);
  const active = QUESTS.filter((q) => s.quests[q.id] === 'active');
  const done = QUESTS.filter((q) => s.quests[q.id] === 'done');
  const available = QUESTS.filter((q) => !s.quests[q.id]);

  const card = (q: QuestDef, state: 'active' | 'done' | 'available') => {
    const p = questProgress(q, s);
    const giver = q.giver ? NPC_BY_ID[q.giver] : undefined;
    return (
      <div key={q.id} className={`pn-quest pn-q-${state}`}>
        <div className="pn-quest-head">
          <div>
            <div className="pn-quest-title">{q.title}</div>
            <div className="pn-quest-jp">{q.jp}</div>
          </div>
          <span className="pn-xp">+{q.xp} XP</span>
        </div>
        <p className="pn-quest-desc">{q.description}</p>
        {state !== 'available' && (
          <div className="pn-quest-prog">
            <Bar value={state === 'done' ? p.target : p.current} max={p.target} tone={state === 'done' ? 'blue' : 'pink'} />
            <span>{state === 'done' ? p.target : p.current} / {p.target}</span>
          </div>
        )}
        {state === 'available' && giver && (
          <div className="pn-quest-hint">Talk to <b>{giver.name}</b> ({giver.jpName}), {giverWhere(giver.id)}.</div>
        )}
        {state === 'available' && !giver && (
          <div className="pn-quest-hint">
            Starts automatically
            {q.requires && q.requires.length > 0 ? ` after: ${q.requires.map((r) => QUESTS.find((x) => x.id === r)?.title ?? r).join(', ')}` : ''}.
          </div>
        )}
        {state !== 'done' && <div className="pn-quest-hint">Hint: {q.hint}</div>}
        {state === 'done' && <div className="pn-quest-hint"><Icon name="check" /> Completed</div>}
      </div>
    );
  };

  return (
    <div className="pn-cols">
      <div className="pn-col-main">
        <Section title="Active" jp="進行中">
          {active.length ? active.map((q) => card(q, 'active')) : <Empty>No active quests. Talk to townspeople to receive new ones.</Empty>}
        </Section>
        <Section title="Available" jp="受付中">
          {available.length ? available.map((q) => card(q, 'available')) : <Empty>No more quests to discover.</Empty>}
        </Section>
        <Section title="Completed" jp="完了">
          {done.length ? done.map((q) => card(q, 'done')) : <Empty>Nothing completed yet.</Empty>}
        </Section>
      </div>
      <aside className="pn-col-side">
        <Section title="Player" jp="プレイヤー">
          <div className="pn-player">
            <div className="pn-level">Lv {lv.level}</div>
            <div>
              <div className="pn-level-title">{lv.title}</div>
              <div className="pn-quest-jp">{lv.jp}</div>
            </div>
          </div>
          <Bar value={lv.progress} tone="orange" />
          <div className="pn-muted">{s.xp} XP{lv.next ? ` / ${lv.next.xp} for ${lv.next.title}` : ' (max level)'}</div>
        </Section>
        <Section title="Daily Goals" jp="デイリー">
          {DAILY_GOALS.map((g) => {
            const v = Math.min(g.target, s.daily[g.id]);
            const claimed = s.daily.claimed.includes(g.id);
            return (
              <div key={g.id} className="pn-goal">
                <div className="pn-goal-head">
                  <span>{g.label}</span>
                  <span>{claimed ? <b className="pn-claimed">Claimed +{XP.dailyGoal} XP</b> : `${v} / ${g.target}`}</span>
                </div>
                <Bar value={v} max={g.target} tone={claimed ? 'blue' : 'pink'} />
              </div>
            );
          })}
        </Section>
      </aside>
    </div>
  );
}

export function Achievements() {
  const ach = useGame((s) => s.achievements);
  const count = ACHIEVEMENTS.filter((a) => ach[a.id]).length;
  return (
    <div>
      <div className="pn-stats">
        <div className="pn-stat"><b>{count}<small> / {ACHIEVEMENTS.length}</small></b><span>Unlocked</span></div>
      </div>
      <div className="pn-ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const at = ach[a.id];
          return (
            <div key={a.id} className={`pn-ach ${at ? 'on' : 'off'}`}>
              <div className="pn-ach-badge">{a.icon}</div>
              <div>
                <div className="pn-ach-title">{a.title}</div>
                <div className="pn-ach-desc">{a.description}</div>
                <div className="pn-ach-date">{at ? fmtDate(at) : 'Locked'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
