import { useMemo, useState } from 'react';
import { useGame, statusOf, isDue, type WordStatus } from '../../state/store';
import { VOCAB, WORDS } from '../../data/vocab';
import { speak } from '../../systems/audio';
import type { Category, Word } from '../../types';
import { CATEGORY_LABEL, Empty, Icon, fmtDate } from './common';

type Sort = 'newest' | 'oldest' | 'romaji' | 'status' | 'category';
const STATUS_ORDER: Record<WordStatus, number> = { new: 0, learning: 1, mastered: 2 };
const STATUS_LABEL: Record<WordStatus, string> = { new: 'New', learning: 'Learning', mastered: 'Mastered' };
const CATEGORIES = Array.from(new Set(VOCAB.map((w) => w.category))).sort() as Category[];

const matches = (w: Word, q: string) =>
  !q ||
  w.jp.toLowerCase().includes(q) ||
  w.kana.toLowerCase().includes(q) ||
  w.romaji.toLowerCase().includes(q) ||
  w.en.toLowerCase().includes(q);

export function Dictionary() {
  const dictionary = useGame((s) => s.dictionary);
  const discovered = useGame((s) => s.discovered);
  const showRomaji = useGame((s) => s.settings.showRomaji);
  const { toggleFavorite, removeFromDictionary, addToDictionary } = useGame.getState();

  const [tab, setTab] = useState<'saved' | 'discovered'>('saved');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'all' | Category>('all');
  const [sort, setSort] = useState<Sort>('newest');
  const [favOnly, setFavOnly] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const ids = Object.keys(dictionary).filter((id) => WORDS[id]);
  const mastered = ids.filter((id) => statusOf(dictionary[id]) === 'mastered').length;
  const discoveredCount = Object.keys(discovered).length;

  const rows = useMemo(() => {
    const list = Object.keys(dictionary).filter((id) => {
      const w = WORDS[id];
      if (!w) return false;
      if (cat !== 'all' && w.category !== cat) return false;
      if (favOnly && !dictionary[id].favorite) return false;
      return matches(w, q);
    });
    const byRomaji = (a: string, b: string) => WORDS[a].romaji.localeCompare(WORDS[b].romaji);
    list.sort((a, b) => {
      const ea = dictionary[a];
      const eb = dictionary[b];
      switch (sort) {
        case 'newest':
          return eb.addedAt - ea.addedAt;
        case 'oldest':
          return ea.addedAt - eb.addedAt;
        case 'romaji':
          return byRomaji(a, b);
        case 'status':
          return STATUS_ORDER[statusOf(ea)] - STATUS_ORDER[statusOf(eb)] || byRomaji(a, b);
        case 'category':
          return WORDS[a].category.localeCompare(WORDS[b].category) || byRomaji(a, b);
      }
    });
    return list;
  }, [dictionary, cat, favOnly, q, sort]);

  const unsavedAll = Object.keys(discovered).filter((id) => WORDS[id] && !dictionary[id]);
  const unsaved = unsavedAll
    .filter((id) => (cat === 'all' || WORDS[id].category === cat) && matches(WORDS[id], q))
    .sort((a, b) => discovered[b].at - discovered[a].at);

  return (
    <div className="pn-dict">
      <div className="pn-stats">
        <div className="pn-stat"><b>{ids.length}</b><span>Saved</span></div>
        <div className="pn-stat"><b>{mastered}</b><span>Mastered</span></div>
        <div className="pn-stat"><b>{discoveredCount}<small> / {VOCAB.length}</small></b><span>Discovered</span></div>
      </div>

      <div className="pn-toolbar">
        <div className="pn-seg">
          <button className={tab === 'saved' ? 'on' : ''} onClick={() => setTab('saved')}>My words</button>
          <button className={tab === 'discovered' ? 'on' : ''} onClick={() => setTab('discovered')}>Discovered ({unsavedAll.length})</button>
        </div>
        <input className="pn-input" type="search" placeholder="Search Japanese, kana, romaji, English" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="pn-select" value={cat} onChange={(e) => setCat(e.target.value as 'all' | Category)} aria-label="Category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
        {tab === 'saved' && (
          <>
            <select className="pn-select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="romaji">A-Z romaji</option>
              <option value="status">Status</option>
              <option value="category">Category</option>
            </select>
            <button className={`pn-chip-btn ${favOnly ? 'on' : ''}`} onClick={() => setFavOnly(!favOnly)} aria-pressed={favOnly}>
              <Icon name={favOnly ? 'starOn' : 'star'} /> Favorites
            </button>
          </>
        )}
      </div>

      {tab === 'saved' && (
        <div className="pn-list">
          {rows.length === 0 && (
            <Empty>
              {ids.length === 0
                ? 'Your dictionary is empty. Walk up to sparkling objects in town and press E to study them, then choose "Add to Dictionary" on the word card.'
                : 'No saved words match these filters.'}
            </Empty>
          )}
          {rows.map((id) => {
            const w = WORDS[id];
            const e = dictionary[id];
            const st = statusOf(e);
            const expanded = open === id;
            const toggle = () => setOpen(expanded ? null : id);
            return (
              <div key={id} className={`pn-row ${expanded ? 'open' : ''}`}>
                <div
                  className="pn-row-main"
                  onClick={toggle}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(ev) => {
                    if (ev.target === ev.currentTarget && (ev.key === 'Enter' || ev.key === ' ')) {
                      ev.preventDefault();
                      toggle();
                    }
                  }}
                >
                  <span className={`pn-caret ${expanded ? 'open' : ''}`}><Icon name="chevron" /></span>
                  <div className="pn-word">
                    <div className="pn-jp">{w.jp}</div>
                    <div className="pn-kana">{w.kana}{showRomaji && <span className="pn-romaji"> {w.romaji}</span>}</div>
                  </div>
                  <div className="pn-en">{w.en}</div>
                  <div className="pn-badges">
                    <span className="pn-cat">{CATEGORY_LABEL[w.category]}</span>
                    <span className={`pn-status pn-st-${st}`}>{STATUS_LABEL[st]}</span>
                    {isDue(e) && <span className="pn-due">Due</span>}
                    <span className="pn-date">{fmtDate(e.addedAt)}</span>
                  </div>
                  <div className="pn-actions" onClick={(ev) => ev.stopPropagation()}>
                    <button className={`pn-icon-btn ${e.favorite ? 'fav' : ''}`} title="Favorite" aria-label="Toggle favorite" aria-pressed={e.favorite} onClick={() => toggleFavorite(id)}>
                      <Icon name={e.favorite ? 'starOn' : 'star'} />
                    </button>
                    <button className="pn-icon-btn" title="Listen" aria-label="Listen" onClick={() => speak(w.jp)}><Icon name="speaker" /></button>
                    {confirm === id ? (
                      <>
                        <button className="pn-btn pn-danger small" onClick={() => { removeFromDictionary(id); setConfirm(null); }}>Delete?</button>
                        <button className="pn-btn small" onClick={() => setConfirm(null)}>Keep</button>
                      </>
                    ) : (
                      <button className="pn-icon-btn" title="Delete" aria-label="Delete word" onClick={() => setConfirm(id)}><Icon name="trash" /></button>
                    )}
                  </div>
                </div>
                {expanded && (
                  <div className="pn-row-ex">
                    <div className="pn-ex-jp">{w.ex}</div>
                    {showRomaji && <div className="pn-ex-ro">{w.exRomaji}</div>}
                    <div className="pn-ex-en">{w.exEn}</div>
                    <button className="pn-btn small" onClick={() => speak(w.ex)}><Icon name="speaker" /> Play sentence</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'discovered' && (
        <div className="pn-list">
          {unsaved.length === 0 && (
            <Empty>
              {discoveredCount === 0
                ? 'No words discovered yet. Walk up to sparkling objects and press E to study them.'
                : 'Every discovered word is already in your dictionary (or hidden by the filters).'}
            </Empty>
          )}
          {unsaved.map((id) => {
            const w = WORDS[id];
            return (
              <div key={id} className="pn-row">
                <div className="pn-row-main static">
                  <div className="pn-word">
                    <div className="pn-jp">{w.jp}</div>
                    <div className="pn-kana">{w.kana}{showRomaji && <span className="pn-romaji"> {w.romaji}</span>}</div>
                  </div>
                  <div className="pn-en">{w.en}</div>
                  <div className="pn-badges">
                    <span className="pn-cat">{CATEGORY_LABEL[w.category]}</span>
                    <span className="pn-date">{fmtDate(discovered[id].at)}</span>
                  </div>
                  <div className="pn-actions">
                    <button className="pn-icon-btn" title="Listen" aria-label="Listen" onClick={() => speak(w.jp)}><Icon name="speaker" /></button>
                    <button className="pn-btn small pn-primary" onClick={() => addToDictionary(id)}><Icon name="plus" /> Add</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
