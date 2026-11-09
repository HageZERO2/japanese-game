import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { Town } from './world/Town';
import { Atmosphere } from './world/Atmosphere';
import { Player } from './game/Player';
import { Interior, INTERIOR_SPAWN } from './interiors';
import { useControls } from './game/controls';
import { useUI } from './state/ui';
import { useGame } from './state/store';
import { HUD } from './ui/HUD';
import { WordCard } from './ui/WordCard';
import { DialogBox } from './ui/DialogBox';
import { StartScreen } from './ui/StartScreen';
import { Panels } from './ui/panels/Panels';
import { audio } from './systems/audio';
import { player } from './game/runtime';
import { SPAWN } from './world/layout';

// Dev-only handle for automated checks in a headless browser.
if (import.meta.env.DEV) {
  (window as unknown as { __yume: unknown }).__yume = { player, ui: useUI, game: useGame, spawn: INTERIOR_SPAWN };
}

function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.82} luminanceSmoothing={0.2} />
      <ToneMapping mode={6} />
      <Vignette offset={0.25} darkness={0.45} />
    </EffectComposer>
  );
}

/** Wait for the UI font so canvas-painted Japanese signs use it. */
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };
    const t = setTimeout(finish, 3000);
    Promise.all([
      document.fonts.load('800 64px "M PLUS Rounded 1c"', '夢の街ラーメン'),
      document.fonts.load('700 64px "M PLUS Rounded 1c"', '商店街カフェ通り'),
    ])
      .then(finish)
      .catch(finish);
    return () => clearTimeout(t);
  }, []);
  return ready;
}

export default function App() {
  useControls();
  const fontsReady = useFontsReady();
  const location = useUI((s) => s.location);
  const quality = useGame((s) => s.settings.quality);
  const musicVolume = useGame((s) => s.settings.musicVolume);
  const sfxVolume = useGame((s) => s.settings.sfxVolume);
  const fp = useGame((s) => s.settings.cameraMode === 'first');
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    player.pos.set(SPAWN.x, 0, SPAWN.z);
    player.camYaw = SPAWN.camYaw;
  }, []);
  useEffect(() => audio.setMusicVolume(musicVolume), [musicVolume]);
  useEffect(() => audio.setSfxVolume(sfxVolume), [sfxVolume]);

  return (
    <>
      {fontsReady && (
        <Canvas
          shadows
          dpr={quality === 'high' ? [1, 1.75] : [0.75, 1]}
          camera={{ fov: fp ? 72 : 58, near: 0.08, far: 900, position: [SPAWN.x, 2, SPAWN.z + 5] }}
          gl={{ antialias: quality !== 'high', powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            if (import.meta.env.DEV) (window as unknown as { __yume: Record<string, unknown> }).__yume.gl = gl;
            setSceneReady(true);
          }}
        >
          <Suspense fallback={null}>
            <Atmosphere outside={location === 'outside'} quality={quality} />
            <Town visible={location === 'outside'} />
            {location !== 'outside' && <Interior id={location} />}
            <Player />
            {quality === 'high' && <Effects />}
          </Suspense>
        </Canvas>
      )}
      <HUD />
      <WordCard />
      <DialogBox />
      <Panels />
      <StartScreen ready={fontsReady && sceneReady} />
    </>
  );
}
