import { useEffect, useMemo } from 'react';
import { useUI } from '../state/ui';
import { useGame, statusOf } from '../state/store';
import { WORDS, VOCAB } from '../data/vocab';
import { audio, speak } from '../systems/audio';
import { closeModal, lockPointer, revealWord } from '../systems/interaction';
import type { Category } from '../types';

export const CATEGORY_LABEL: Record<Category, string> = {
  animals: 'Animals',
  food: 'Food',
  drinks: 'Drinks',
  furniture: 'Furniture',
  nature: 'Nature',
  transport: 'Transport',
  buildings: 'Buildings',
  clothing: 'Clothing',
  technology: 'Technology',
  household: 'Household',
  activities: 'Daily Activities',
  culture: 'Culture',
  people: 'People',
  stationery: 'Stationery',
  phrases: 'Phrases',
};

const SMALL = new Set(['ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゎ', 'ー']);

/** Splits kana into morae (e.g. きょう -> きょ・う) as a pronunciation guide. */
export function morae(kana: string) {
  const out: string[] = [];
  for (const ch of kana) {
    if (ch === ' ') continue;
    if (SMALL.has(ch) && out.length) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out.join('・');
}

export function WordCard() {
  const card = useUI((s) => s.card);
  const showRomaji = useGame((s) => s.settings.showRomaji);
  const dict = useGame((s) => s.dictionary);
  const discovered = useGame((s) => s.discovered);
  const add = useGame((s) => s.addToDictionary);
  const id = card ? card.words[card.index] : null;
  const w = id ? WORDS[id] : null;

  const next = () => {
    const ui = useUI.getState();
    const c = ui.card;
    if (!c) return;
    audio.play('pop');
    if (c.index < c.words.length - 1) {
      ui.setCardIndex(c.index + 1);
      revealWord(c.words[c.index + 1]);
      return;
    }
    // Past the object's own words: suggest a related word from the same category.
    const cur = WORDS[c.words[c.index]];
    const pool = VOCAB.filter((v) => v.category === cur.category && !c.words.includes(v.id));
    const fresh = pool.filter((v) => !useGame.getState().discovered[v.id]);
    const pickFrom = fresh.length ? fresh : pool.length ? pool : VOCAB.filter((v) => !c.words.includes(v.id));
    const pick = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    ui.openCard({ ...c, words: [...c.words, pick.id], index: c.index + 1 });
    revealWord(pick.id);
  };

  const close = () => {
    closeModal();
    lockPointer();
  };

  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const cur = useUI.getState().card;
      if (!cur) return;
      const wid = cur.words[cur.index];
      if (e.code === 'KeyL') speak(WORDS[wid].jp);
      else if (e.code === 'KeyF') {
        if (!useGame.getState().dictionary[wid]) {
          useGame.getState().addToDictionary(wid);
          audio.play('success');
        }
      } else if (e.code === 'KeyN' || e.code === 'ArrowRight') next();
      else if (e.code === 'KeyE' || e.code === 'Enter') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!card]);

  const isNew = useMemo(() => {
    if (!id) return false;
    const d = discovered[id];
    return !!d && Date.now() - d.at < 4000;
  }, [id, discovered]);

  if (!card || !w) return null;
  const saved = !!dict[w.id];
  const status = saved ? statusOf(dict[w.id]) : null;
  const showKana = w.kana !== w.jp;

  return (
    <div className="card-wrap" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="word-card" key={w.id}>
        <div className="wc-top">
          <span className={`cat-chip cat-${w.category}`}>{CATEGORY_LABEL[w.category]}</span>
          {isNew && <span className="new-chip">NEW +10 XP</span>}
          <span className="wc-source">{card.source}</span>
          <span className="wc-count">
            {card.index + 1}/{card.words.length}
          </span>
        </div>
        <div className="wc-main">
          <div className="wc-jp" lang="ja">
            {w.jp}
          </div>
          {showKana && (
            <div className="wc-kana" lang="ja">
              {w.kana}
            </div>
          )}
          {showRomaji && <div className="wc-romaji">{w.romaji}</div>}
          <div className="wc-en">{w.en}</div>
        </div>
        <div className="wc-grid">
          <div>
            <label>Japanese</label>
            <span lang="ja">{w.jp}</span>
          </div>
          <div>
            <label>Hiragana</label>
            <span lang="ja">{w.kana}</span>
          </div>
          <div>
            <label>Romaji</label>
            <span>{w.romaji}</span>
          </div>
          <div>
            <label>Pronunciation</label>
            <span lang="ja">{morae(w.kana)}</span>
          </div>
        </div>
        <div className="wc-example">
          <label>Example</label>
          <div className="ex-jp" lang="ja">
            {w.ex}
            <button className="icon-btn" onClick={() => speak(w.ex)} title="Listen to the sentence">
              <SpeakerIcon />
            </button>
          </div>
          {showRomaji && <div className="ex-romaji">{w.exRomaji}</div>}
          <div className="ex-en">{w.exEn}</div>
        </div>
        <div className="wc-actions">
          <button
            className="btn"
            onClick={() => {
              if (!speak(w.jp)) useUI.getState().flash('Speech is not supported in this browser.');
            }}
          >
            <SpeakerIcon /> Listen <kbd>L</kbd>
          </button>
          <button
            className={`btn ${saved ? 'btn-done' : 'btn-primary'}`}
            disabled={saved}
            onClick={() => {
              add(w.id);
              audio.play('success');
            }}
          >
            <StarIcon filled={saved} /> {saved ? `Saved (${status})` : 'Add to Dictionary'} {!saved && <kbd>F</kbd>}
          </button>
          <button className="btn" onClick={next}>
            Next Word <kbd>N</kbd>
          </button>
          <button className="btn btn-ghost" onClick={close}>
            Close <kbd>E</kbd>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
