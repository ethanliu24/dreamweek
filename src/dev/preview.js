import { createGame } from '../app/game.js';
import { createAssets } from '../runtime/assets.js';
import { createControls } from '../runtime/controls.js';
import { createDisplay } from '../runtime/display.js';
import { createInput } from '../runtime/input.js';
import { createLoop } from '../runtime/loop.js';
import { createWorldHost } from '../runtime/world-host.js';
import { createWorldRegistry } from '../worlds/registry.js';
import { createAudioPreview } from './audio-preview.js';
import { createHubPreview } from './hub-preview.js';
import { createInputPreview } from './input-preview.js';
import { createProgressPreview } from './progress-preview.js';
import { createRoundTripPreview } from './round-trip-preview.js';
import { createTraversalPreview } from './traversal.js';
import { createUiPreview } from './ui-preview.js';

const SCENE_LABELS = { 'scene-a': 'Scene A', 'scene-b': 'Scene B' };
const PREVIEWS = {
  shell: createGame,
  input: createInputPreview,
  traversal: createTraversalPreview,
  progression: createProgressPreview,
  dialogue: createUiPreview,
  audio: createAudioPreview,
  'round-trip': createRoundTripPreview,
  'earth-arrival': ({ mount }) => createGame({ mount, initialWorld: 'earth',
    initialProgress: { completed: ['fire'], items: ['Candle'] } }),
  'fire-arrival': ({ mount }) => createGame({ mount, initialWorld: 'fire' }),
  'water-arrival': ({ mount }) => createGame({ mount, initialWorld: 'water', initialProgress: {
    completed: ['fire', 'earth'], items: ['Candle'],
    pot: { phase: 'empty', shape: { base: 0.5, height: 0.62, rim: 0.66 } },
  } }),
  'wood-arrival': ({ mount }) => createGame({ mount, initialWorld: 'wood', initialProgress: {
    completed: ['fire', 'earth', 'water'], items: ['Candle'], hearth: 'potPlaced',
    pot: { phase: 'placed', shape: { base: 0.5, height: 0.62, rim: 0.66 } },
  } }),
  'hub-water': ({ mount }) => createHubPreview({ mount, after: 'water' }),
  'hub-wood': ({ mount }) => createHubPreview({ mount, after: 'wood' }),
  'hub-metal': ({ mount }) => createHubPreview({ mount, after: 'metal' }),
  'hub-moon': ({ mount }) => createHubPreview({ mount, after: 'moon' }),
};

function createScenePreview({ mount, initial }) {
  const fixture = document.createElement('section');
  fixture.innerHTML = `
    <h1>${SCENE_LABELS[initial]}</h1>
    <button type="button" data-fail>Fail next load</button>
    <p data-counts></p>
    <div style="position:relative">
      <canvas inert tabindex="0" aria-label="Scene" style="display:block;width:100%;aspect-ratio:16/9;max-height:75vh"></canvas>
      <div data-cover style="position:absolute;inset:0;background:#000;color:#fff">
        <div style="display:grid;place-content:center;height:100%;text-align:center">
          <p role="status">Loading scene…</p>
          <button type="button" data-retry hidden>Retry</button>
        </div>
      </div>
    </div>
  `;
  mount.replaceChildren(fixture);

  const canvas = fixture.querySelector('canvas');
  const title = fixture.querySelector('h1');
  const counts = fixture.querySelector('[data-counts]');
  const cover = fixture.querySelector('[data-cover]');
  const status = cover.querySelector('[role="status"]');
  const retryButton = fixture.querySelector('[data-retry]');
  const failButton = fixture.querySelector('[data-fail]');
  let display;
  try {
    display = createDisplay(canvas);
  } catch (error) {
    const notice = document.createElement('p');
    notice.setAttribute('role', 'alert');
    notice.textContent = 'The scene could not start. WebGL 2 is required to render it.';
    fixture.replaceChildren(notice);
    console.error(error);
    return { select: () => false, dispose: () => fixture.remove() };
  }

  display.camera.position.set(4, 3.5, 6);
  display.camera.lookAt(0, 0.65, 0);
  const input = createInput(canvas);
  const controls = createControls(input);
  const assets = createAssets();
  let failNext = false;
  let retry;
  let focusAfterRetry = false;
  let reveal;

  async function loadFixture(load) {
    const fail = failNext;
    failNext = false;
    failButton.disabled = false;
    failButton.textContent = 'Fail next load';
    const { createWorld } = await load();
    return { createWorld: context => createWorld({ ...context, fail }) };
  }

  const registry = createWorldRegistry({
    'scene-a': () => loadFixture(() => import('./scene-a.js')),
    'scene-b': () => loadFixture(() => import('./scene-b.js')),
  });

  const host = createWorldHost({
    registry, controls, assets,
    ui: {
      clearWorld() {
        retry = undefined;
        retryButton.hidden = true;
        status.textContent = 'Loading scene…';
      },
      iris: {
        close() {
          canvas.inert = true;
          cover.hidden = false;
        },
        open(signal) {
          return new Promise((resolve, reject) => {
            function cancel() {
              reveal = undefined;
              reject(signal.reason);
            }
            signal.addEventListener('abort', cancel, { once: true });
            reveal = scene => {
              signal.removeEventListener('abort', cancel);
              reveal = undefined;
              canvas.setAttribute('aria-label', scene.name);
              canvas.inert = false;
              cover.hidden = true;
              failButton.disabled = failNext;
              if (focusAfterRetry) canvas.focus({ preventScroll: true });
              focusAfterRetry = false;
              resolve();
            };
          });
        },
      },
      showLoadError(error, actions) {
        cover.hidden = false;
        status.textContent = `${error.message} Retry to load the same scene.`;
        retry = actions.retry;
        retryButton.hidden = false;
        retryButton.focus();
      },
    },
  });

  function select(id) {
    if (!host.request({ id, spawn: 'arrival' })) return false;
    title.textContent = SCENE_LABELS[id];
    return true;
  }

  function onFail() {
    failNext = true;
    failButton.textContent = 'Next load will fail';
    failButton.disabled = true;
  }

  function onRetry() {
    focusAfterRetry = true;
    retry?.();
  }

  failButton.addEventListener('click', onFail);
  retryButton.addEventListener('click', onRetry);

  const loop = createLoop({
    update: host.update,
    render(elapsed, dt) {
      const scene = host.scene;
      if (scene) {
        host.present(elapsed, dt);
        display.render(scene);
        reveal?.(scene);
      }

      const { render, memory } = display.renderer.info;
      const readout = [
        `Active scenes ${scene ? 1 : 0}`,
        `Draws ${scene ? render.calls : 0}`,
        `Triangles ${scene ? render.triangles : 0}`,
        `Geometries ${memory.geometries}`,
        `Textures ${memory.textures}`,
        `Cached assets ${assets.size}`,
        `E presses ${scene?.userData.interactPresses ?? 0}`,
      ].join(' · ');
      if (counts.textContent !== readout) counts.textContent = readout;
    },
  });
  loop.resume();
  select(initial);

  return {
    select,
    dispose() {
      loop.dispose();
      host.dispose();
      input.dispose();
      display.dispose();
      failButton.removeEventListener('click', onFail);
      retryButton.removeEventListener('click', onRetry);
      fixture.remove();
    },
  };
}

export function mountPreview({ mount }) {
  const panel = document.createElement('section');
  panel.innerHTML = `
    <label>
      QA fixture
      <select>
        <option value="shell">Shell</option>
        <option value="scene-a">Scene A</option>
        <option value="scene-b">Scene B</option>
        <option value="input">Input</option>
        <option value="traversal">Traversal</option>
        <option value="progression">Progression</option>
        <option value="dialogue">Dialogue</option>
        <option value="audio">Audio</option>
        <option value="round-trip" selected>Round trip</option>
        <option value="fire-arrival">Fire arrival</option>
        <option value="earth-arrival">Earth arrival</option>
        <option value="water-arrival">Water arrival</option>
        <option value="wood-arrival">Wood arrival</option>
        <option value="hub-water">Hub after Water</option>
        <option value="hub-wood">Hub after Wood</option>
        <option value="hub-metal">Hub after Metal</option>
        <option value="hub-moon">Hub after Moon</option>
      </select>
    </label>
    <button type="button">Reset</button>
  `;

  const fixture = panel.querySelector('select');
  const reset = panel.querySelector('button');
  const gameMount = document.createElement('div');
  let game;
  let selected = fixture.value;

  function restart() {
    game?.dispose();
    selected = fixture.value;
    if (Object.hasOwn(SCENE_LABELS, selected)) {
      game = createScenePreview({ mount: gameMount, initial: selected });
    } else {
      game = PREVIEWS[selected]({ mount: gameMount });
    }
  }

  mount.replaceChildren(panel, gameMount);
  restart();
  fixture.addEventListener('change', () => {
    if (game.select && Object.hasOwn(SCENE_LABELS, fixture.value)) {
      if (game.select(fixture.value)) selected = fixture.value;
      else fixture.value = selected;
    } else {
      restart();
    }
  });
  reset.addEventListener('click', restart);
}
