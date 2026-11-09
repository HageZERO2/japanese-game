import { useGame } from '../state/store';
import { useUI } from '../state/ui';
import { levelFor } from '../data/progression';
import { audio } from '../systems/audio';
import { lockPointer } from '../systems/interaction';

export function StartScreen({ ready }: { ready: boolean }) {
  const started = useUI((s) => s.started);
  const xp = useGame((s) => s.xp);
  const words = useGame((s) => Object.keys(s.discovered).length);
  const name = useGame((s) => s.appearance.name);
  if (started) return null;
  const lv = levelFor(xp);
  const hasSave = xp > 0 || words > 0;

  const play = () => {
    audio.init();
    const s = useGame.getState().settings;
    audio.setMusicVolume(s.musicVolume);
    audio.setSfxVolume(s.sfxVolume);
    useUI.getState().setStarted(true);
    useGame.getState().evaluate();
    lockPointer();
  };

  return (
    <div className="start">
      <div className="start-petals" aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i * 0.7) % 6}s`, animationDuration: `${7 + (i % 5)}s` }} />
        ))}
      </div>
      <div className="start-card">
        <div className="start-jp" lang="ja">
          夢の街
        </div>
        <div className="start-title">YUME NO MACHI</div>
        <div className="start-sub">A cozy town where every object teaches you Japanese</div>
        <button className="btn btn-primary start-btn" disabled={!ready} onClick={play}>
          {!ready ? 'Loading the town...' : hasSave ? 'Continue' : 'Start exploring'}
        </button>
        {hasSave && (
          <div className="start-save">
            {name} - Level {lv.level} {lv.title} - {words} words studied
          </div>
        )}
        <div className="start-controls">
          <span>
            <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> move
          </span>
          <span>
            <kbd>Shift</kbd> run
          </span>
          <span>
            <kbd>Space</kbd> jump
          </span>
          <span>
            <kbd>E</kbd> interact
          </span>
          <span>
            <kbd>Mouse</kbd> look
          </span>
          <span>
            <kbd>V</kbd> 1st/3rd person
          </span>
          <span>
            <kbd>Tab</kbd> dictionary
          </span>
          <span>
            <kbd>Esc</kbd> menu
          </span>
        </div>
        <div className="start-hint">Walk up to anything that sparkles and press E to learn its name.</div>
      </div>
    </div>
  );
}
