import { useEffect } from 'react';
import { input } from './runtime';
import { useUI, isModalOpen } from '../state/ui';
import { useGame } from '../state/store';
import { closeModal, consumeIntentionalUnlock, interact, lockPointer, queueJump, togglePanel } from '../systems/interaction';
import { audio } from '../systems/audio';

const typingTarget = (e: Event) => {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
};

/** Global keyboard / mouse bindings. */
export function useControls() {
  useEffect(() => {
    let dragging = false;
    let lastAutoPause = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      const ui = useUI.getState();
      if (e.code === 'Tab') e.preventDefault();
      if (e.code === 'Escape') {
        // Esc while pointer-locked is consumed by the browser to exit the lock; onLockChange handles it.
        if (ui.pointerLocked || performance.now() - lastAutoPause < 250) return;
        if (ui.card || ui.dialog || ui.panel) closeModal();
        else if (ui.started) togglePanel('pause');
        return;
      }
      if (typingTarget(e)) return;
      if (!ui.started) return;
      if (!e.repeat) input.keys.add(e.code);
      if (e.repeat) return;
      switch (e.code) {
        case 'KeyE':
          if (!isModalOpen(ui)) interact();
          break;
        case 'Space':
          e.preventDefault();
          if (!isModalOpen(ui)) queueJump();
          break;
        case 'Tab':
          togglePanel('dictionary');
          break;
        case 'KeyQ':
          togglePanel('quests');
          break;
        case 'KeyP':
          togglePanel('practice');
          break;
        case 'KeyM':
          togglePanel('map');
          break;
        case 'KeyC':
          togglePanel('character');
          break;
        case 'KeyV': {
          if (isModalOpen(ui)) break;
          const g = useGame.getState();
          g.setSettings({ cameraMode: g.settings.cameraMode === 'third' ? 'first' : 'third' });
          audio.play('ui');
          break;
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => input.keys.delete(e.code);
    const onBlur = () => input.keys.clear();

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement || dragging) {
        input.mouseDX += e.movementX;
        input.mouseDY += e.movementY;
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName !== 'CANVAS') return;
      if (isModalOpen()) return;
      dragging = true;
      lockPointer();
    };
    const onMouseUp = () => {
      dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).tagName === 'CANVAS') input.wheel += e.deltaY;
    };
    const onLockChange = () => {
      const locked = !!document.pointerLockElement;
      const ui = useUI.getState();
      ui.setPointerLocked(locked);
      const intentional = consumeIntentionalUnlock();
      if (!locked && !intentional && ui.started && !isModalOpen(ui)) {
        lastAutoPause = performance.now();
        ui.openPanel('pause');
      }
    };
    const onVisibility = () => {
      if (document.hidden) audio.suspend();
      else audio.resume();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('wheel', onWheel, { passive: true });
    document.addEventListener('pointerlockchange', onLockChange);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('wheel', onWheel);
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
}
