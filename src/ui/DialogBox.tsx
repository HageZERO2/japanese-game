import { useEffect, useRef } from 'react';
import { useUI } from '../state/ui';
import { useGame, questProgress } from '../state/store';
import { NPC_BY_ID, type DialogChoice } from '../data/npcs';
import { QUESTS } from '../data/progression';
import { WORDS } from '../data/vocab';
import { audio, speak } from '../systems/audio';
import { closeModal, lockPointer, openCard, revealWord } from '../systems/interaction';
import { SpeakerIcon } from './WordCard';

/** Correct replies reward XP once per NPC node per session. */
const rewarded = new Set<string>();

export function DialogBox() {
  const dialog = useUI((s) => s.dialog);
  const showRomaji = useGame((s) => s.settings.showRomaji);
  const quests = useGame((s) => s.quests);
  const game = useGame();
  const learnedRef = useRef<string>('');

  const npc = dialog ? NPC_BY_ID[dialog.npcId] : null;
  const node = npc && dialog ? npc.nodes[dialog.node] : null;

  useEffect(() => {
    if (!npc || !node || !dialog) return;
    const key = `${npc.id}:${dialog.node}`;
    if (learnedRef.current === key) return;
    learnedRef.current = key;
    if (dialog.node === 'start') revealWord(npc.roleWord);
    node.learn?.forEach((w) => revealWord(w));
  }, [npc, node, dialog]);

  useEffect(() => {
    if (!dialog) learnedRef.current = '';
  }, [dialog]);

  if (!dialog || !npc || !node) return null;

  const quest = npc.quest ? QUESTS.find((q) => q.id === npc.quest) : undefined;
  const qState = quest ? quests[quest.id] : undefined;
  const choices: DialogChoice[] = [...node.choices];
  if (dialog.node === 'start') {
    if (quest && !qState && npc.nodes.quest_offer) {
      choices.push({ jp: '何か手伝いましょうか？', romaji: 'Nanika tetsudaimashou ka?', en: 'Can I help with anything?', next: 'quest_offer' });
    }
    if (!choices.some((c) => c.next === null)) choices.push({ jp: 'さようなら。', romaji: 'Sayounara.', en: 'Goodbye.', next: null });
  }

  const pick = (c: DialogChoice) => {
    const key = `${npc.id}:${dialog.node}`;
    if (c.correct === true) {
      audio.play('success');
      if (!rewarded.has(key)) {
        rewarded.add(key);
        useGame.getState().rewardPhrase();
      }
    } else if (c.correct === false) audio.play('error');
    else audio.play('ui');
    if (c.acceptQuest && npc.quest) useGame.getState().acceptQuest(npc.quest);
    if (c.next === null || c.next === undefined) {
      if (c.jp === 'さようなら。') revealWord('goodbye');
      closeModal();
      lockPointer();
    } else {
      useUI.getState().openDialog({ npcId: npc.id, node: c.next });
    }
  };

  const progress = quest && qState === 'active' ? questProgress(quest, game) : null;
  const learnIds = [...(dialog.node === 'start' ? [npc.roleWord] : []), ...(node.learn ?? [])].filter((id) => WORDS[id]);

  return (
    <div className="dialog-wrap">
      <div className="dialog">
        <div className="dlg-name">
          <span className="jp">{npc.jpName}</span>
          <span>{npc.name}</span>
          <small>{npc.role}</small>
        </div>
        <div className="dlg-line">
          <div className="dlg-jp" lang="ja">
            {node.line.jp}
            <button className="icon-btn" onClick={() => speak(node.line.jp)} title="Listen">
              <SpeakerIcon />
            </button>
          </div>
          {showRomaji && <div className="dlg-romaji">{node.line.romaji}</div>}
          <div className="dlg-en">{node.line.en}</div>
        </div>
        {learnIds.length > 0 && (
          <div className="dlg-learn">
            <span>Words:</span>
            {learnIds.map((id) => (
              <button
                key={id}
                className="learn-chip"
                onClick={() => {
                  useUI.getState().openDialog(null);
                  openCard([id], npc.name);
                }}
                title="Open word card"
              >
                <b lang="ja">{WORDS[id].jp}</b> {WORDS[id].en}
              </button>
            ))}
          </div>
        )}
        {progress && quest && (
          <div className="dlg-quest">
            頑張って！ (Ganbatte! Good luck!) {quest.title}: {progress.current}/{progress.target}
          </div>
        )}
        <div className="dlg-choices">
          {choices.map((c, i) => (
            <button key={i} className="choice" onClick={() => pick(c)}>
              <span className="ci">{i + 1}</span>
              <span className="c-text">
                <span className="c-jp" lang="ja">
                  {c.jp}
                </span>
                {showRomaji && <span className="c-romaji">{c.romaji}</span>}
                <span className="c-en">{c.en}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <DialogKeys count={choices.length} onPick={(i) => pick(choices[i])} />
    </div>
  );
}

function DialogKeys({ count, onPick }: { count: number; onPick: (i: number) => void }) {
  const ref = useRef(onPick);
  ref.current = onPick;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const n = Number(e.key);
      if (n >= 1 && n <= count) ref.current(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count]);
  return null;
}
