import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGame, isDue } from '../../state/store';
import { VOCAB, WORDS } from '../../data/vocab';
import { XP } from '../../data/progression';
import { audio, speak } from '../../systems/audio';
import type { Word } from '../../types';
import { CATEGORY_LABEL, Bar, Empty, Icon } from './common';

type Fmt = 'jp-en' | 'en-jp' | 'listen' | 'romaji';

interface Question {
  word: Word;
  fmt: Fmt;
  options: string[];
  answer: number;
}

const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** Case, spacing, hyphens, apostrophes, macrons ignored; long vowels collapsed. */
export function normRomaji(s: string): string {
  const macron: Record<string, string> = { ā: 'aa', ī: 'ii', ū: 'uu', ē: 'ee', ō: 'oo' };
  return s
    .toLowerCase()
    .replace(/[āīūēō]/g, (c) => macron[c])
    .replace(/[\s\-'’`.,!?]/g, '')
    .replace(/ou/g, 'o')
    .replace(/([aiueo])\1/g, '$1');
}

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function buildQuestion(word: Word): Question {
  const fmts: Fmt[] = ['jp-en', 'en-jp', 'romaji'];
  if (canSpeak()) fmts.push('listen');
  const fmt = fmts[Math.floor(Math.random() * fmts.length)];
  if (fmt === 'romaji') return { word, fmt, options: [], answer: -1 };

  const label = (w: Word) => (fmt === 'en-jp' ? w.jp : w.en);
  const pool = VOCAB.filter((w) => w.id !== word.id && w.en !== word.en && w.jp !== word.jp);
  const ordered = [...shuffle(pool.filter((w) => w.category === word.category)), ...shuffle(pool.filter((w) => w.category !== word.category))];
  const opts: string[] = [label(word)];
  for (const w of ordered) {
    if (opts.length >= 4) break;
    if (!opts.includes(label(w))) opts.push(label(w));
  }
  const options = shuffle(opts);
  return { word, fmt, options, answer: options.indexOf(label(word)) };
}

function pickWords(): Word[] {
  const { dictionary } = useGame.getState();
  const now = Date.now();
  const entries = Object.entries(dictionary).filter(([id]) => WORDS[id]);
  const due = entries.filter(([, e]) => isDue(e, now)).sort((a, b) => a[1].srs.due - b[1].srs.due);
  const rest = entries
    .filter(([, e]) => !isDue(e, now))
    .sort((a, b) => (a[1].srs.lastReviewed ?? 0) - (b[1].srs.lastReviewed ?? 0));
  return [...due, ...rest].slice(0, 10).map(([id]) => WORDS[id]);
}

interface Result {
  word: Word;
  correct: boolean;
}

export function Practice() {
  const dictionary = useGame((s) => s.dictionary);
  const showRomaji = useGame((s) => s.settings.showRomaji);
  const ids = Object.keys(dictionary).filter((id) => WORDS[id]);
  const dueCount = ids.filter((id) => isDue(dictionary[id])).length;

  const [questions, setQuestions] = useState<Question[] | null>(null);

  if (!questions) {
    return (
      <div className="pn-practice-intro">
        <div className="pn-stats">
          <div className="pn-stat"><b>{dueCount}</b><span>Due now</span></div>
          <div className="pn-stat"><b>{ids.length}</b><span>Saved words</span></div>
        </div>
        {ids.length === 0 ? (
          <Empty>
            Practice reviews the words in your dictionary. Walk up to sparkling objects, press E to study them, and choose
            "Add to Dictionary" on the word card. Then come back here.
          </Empty>
        ) : (
          <>
            <p className="pn-muted pn-center">
              A session has up to 10 questions. Due words come first; spaced repetition schedules each word again based on your answers.
              {dueCount === 0 && ' Nothing is due right now, so least recently reviewed words will be used.'}
            </p>
            <div className="pn-center">
              <button className="pn-btn pn-primary big" onClick={() => setQuestions(pickWords().map(buildQuestion))}>Start practice</button>
            </div>
          </>
        )}
      </div>
    );
  }
  return <Session questions={questions} showRomaji={showRomaji} onRestart={() => setQuestions(null)} />;
}

function Session({ questions, showRomaji, onRestart }: { questions: Question[]; showRomaji: boolean; onRestart: () => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const finished = useRef(false);

  const done = idx >= questions.length;
  const q = done ? null : questions[idx];
  const answered = verdict !== null;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!q) return;
    if (q.fmt === 'listen') {
      const t = setTimeout(() => speak(q.word.jp), 250);
      return () => clearTimeout(t);
    }
    if (q.fmt === 'romaji') inputRef.current?.focus();
  }, [q]);

  useEffect(() => {
    if (done && !finished.current) {
      finished.current = true;
      useGame.getState().finishPractice(results.length, results.filter((r) => r.correct).length);
    }
  }, [done, results]);

  const settle = useCallback(
    (correct: boolean) => {
      if (!q || answered) return;
      useGame.getState().recordReview(q.word.id, correct);
      audio.play(correct ? 'success' : 'error');
      setVerdict(correct);
      setResults((r) => [...r, { word: q.word, correct }]);
    },
    [q, answered],
  );

  const choose = useCallback(
    (i: number) => {
      if (!q || answered || q.fmt === 'romaji' || i >= q.options.length) return;
      setPicked(i);
      settle(i === q.answer);
    },
    [q, answered, settle],
  );

  const submitTyped = useCallback(() => {
    if (!q || answered || !typed.trim()) return;
    settle(normRomaji(typed) === normRomaji(q.word.romaji));
  }, [q, answered, typed, settle]);

  const next = useCallback(() => {
    setIdx((i) => i + 1);
    setPicked(null);
    setTyped('');
    setVerdict(null);
  }, []);

  const handler = useRef<(e: KeyboardEvent) => void>(() => {});
  handler.current = (e) => {
    if (done) return;
    const inInput = (e.target as HTMLElement | null)?.tagName === 'INPUT';
    if (e.key === 'Enter') {
      e.preventDefault();
      if (answered) next();
      else if (q?.fmt === 'romaji') submitTyped();
    } else if (!inInput && !e.ctrlKey && !e.metaKey && !e.altKey && /^[1-4]$/.test(e.key)) {
      choose(Number(e.key) - 1);
    }
  };
  useEffect(() => {
    const fn = (e: KeyboardEvent) => handler.current(e);
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const correctCount = results.filter((r) => r.correct).length;
  const mistakes = useMemo(() => results.filter((r) => !r.correct), [results]);

  if (done) {
    const xp = correctCount * XP.reviewCorrect + (results.length - correctCount) * XP.reviewWrong + XP.practiceSession;
    return (
      <div className="pn-practice-end">
        <div className="pn-score">{correctCount}<small> / {results.length}</small></div>
        <div className="pn-muted pn-center">About +{xp} XP earned this session.</div>
        {mistakes.length > 0 ? (
          <div className="pn-mistakes">
            <h4 className="pn-h4">To review</h4>
            {mistakes.map((m) => (
              <div key={m.word.id} className="pn-mistake">
                <span className="pn-jp">{m.word.jp}</span>
                <span className="pn-kana">{m.word.kana}</span>
                <span className="pn-en">{m.word.en}</span>
                <button className="pn-icon-btn" aria-label="Listen" onClick={() => speak(m.word.jp)}><Icon name="speaker" /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="pn-muted pn-center">Perfect round!</div>
        )}
        <div className="pn-center pn-row-btns">
          <button className="pn-btn pn-primary" onClick={onRestart}>Practice again</button>
          <button className="pn-btn" onClick={() => document.dispatchEvent(new CustomEvent('pn-close'))}>Close</button>
        </div>
      </div>
    );
  }

  if (!q) return null;
  const w = q.word;
  const prompt =
    q.fmt === 'jp-en' ? 'What does this mean?' : q.fmt === 'en-jp' ? 'Which is the Japanese word?' : q.fmt === 'listen' ? 'Listen and choose the meaning' : 'Type the romaji';

  return (
    <div className="pn-quiz">
      <div className="pn-quiz-top">
        <span className="pn-muted">Question {idx + 1} / {questions.length}</span>
        <Bar value={idx + (answered ? 1 : 0)} max={questions.length} tone="blue" />
      </div>
      <div className="pn-quiz-prompt">{prompt}</div>
      <div className="pn-quiz-card">
        {q.fmt === 'jp-en' && <div className="pn-quiz-jp">{w.jp}</div>}
        {q.fmt === 'en-jp' && <div className="pn-quiz-en">{w.en}</div>}
        {q.fmt === 'listen' && (
          <button className="pn-btn pn-primary big" onClick={() => speak(w.jp)}><Icon name="speaker" /> Replay</button>
        )}
        {q.fmt === 'romaji' && (
          <>
            <div className="pn-quiz-jp">{w.jp}</div>
            <div className="pn-quiz-en small">{w.en}</div>
          </>
        )}
      </div>

      {q.fmt === 'romaji' ? (
        <div className="pn-typebox">
          <input
            ref={inputRef}
            className="pn-input"
            value={typed}
            disabled={answered}
            placeholder="romaji, e.g. neko"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={(e) => setTyped(e.target.value)}
          />
          {!answered && <button className="pn-btn pn-primary" onClick={submitTyped} disabled={!typed.trim()}>Submit</button>}
        </div>
      ) : (
        <div className="pn-options">
          {q.options.map((o, i) => {
            const cls = answered ? (i === q.answer ? 'right' : i === picked ? 'wrong' : 'dim') : '';
            return (
              <button key={o} className={`pn-opt ${cls}`} disabled={answered} onClick={() => choose(i)}>
                <kbd>{i + 1}</kbd>
                <span className={q.fmt === 'en-jp' ? 'pn-opt-jp' : ''}>{o}</span>
              </button>
            );
          })}
        </div>
      )}

      {answered && (
        <div className={`pn-feedback ${verdict ? 'ok' : 'bad'}`}>
          <div className="pn-feedback-head">{verdict ? 'Correct!' : 'Not quite'}</div>
          <div className="pn-feedback-word">
            <span className="pn-jp">{w.jp}</span>
            <span className="pn-kana">{w.kana}{showRomaji || q.fmt === 'romaji' ? ` / ${w.romaji}` : ''}</span>
            <span className="pn-en">{w.en}</span>
            <span className="pn-cat">{CATEGORY_LABEL[w.category]}</span>
            <button className="pn-icon-btn" aria-label="Listen" onClick={() => speak(w.jp)}><Icon name="speaker" /></button>
          </div>
          <div className="pn-ex-jp">{w.ex}</div>
          {showRomaji && <div className="pn-ex-ro">{w.exRomaji}</div>}
          <div className="pn-ex-en">{w.exEn}</div>
          <div className="pn-center">
            <button className="pn-btn pn-primary" onClick={next}>{idx + 1 >= questions.length ? 'Finish' : 'Next'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
