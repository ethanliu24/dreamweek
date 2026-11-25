import {
  BoxGeometry, Color, DirectionalLight, HemisphereLight, Mesh,
  MeshStandardMaterial, OctahedronGeometry, PlaneGeometry, Scene,
} from 'three';
import { createGame } from '../app/game.js';
import { createAssets, disposeScene } from '../runtime/assets.js';
import { createControls } from '../runtime/controls.js';
import { createDisplay } from '../runtime/display.js';
import { createInput } from '../runtime/input.js';
import { createLoop } from '../runtime/loop.js';
import { createWorldHost } from '../runtime/world-host.js';
import { createWorldRegistry } from '../worlds/registry.js';
import { createInputPreview } from './input-preview.js';

const SCENE_LABELS = { 'scene-a': 'Scene A', 'scene-b': 'Scene B' };

function waitForFixture(signal) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      resolve();
    }, 500);

    function cancel() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener('abort', cancel, { once: true });
  });
}

function createFixtureWorld({ assets, sceneB, fail }) {
  const scene = new Scene();
  scene.name = sceneB ? 'Scene B' : 'Scene A';
  scene.background = new Color(sceneB ? 0x382a49 : 0x243752);
  scene.userData.interactPresses = 0;
  const fill = new HemisphereLight(0xc2dcff, 0x52634d, 1.4);
  const key = new DirectionalLight(0xffeed7, 2.2);
  key.position.set(3, 5, 4);
  scene.add(fill, key);

  let floorLease;
  let landmark;
  let startedAt;

  return {
    scene,
    async prepare(signal) {
      const lease = await assets.acquire('qa:floor', () => ({
        value: new PlaneGeometry(18, 18),
        dispose: geometry => geometry.dispose(),
      }), signal);
      if (signal.aborted) {
        lease.release();
        signal.throwIfAborted();
      }
      floorLease = lease;
      const floor = new Mesh(
        lease.value, new MeshStandardMaterial({ color: sceneB ? 0x736986 : 0x568578 }),
      );
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      landmark = new Mesh(
        sceneB ? new OctahedronGeometry(1.1) : new BoxGeometry(1.4, 1.8, 1.4),
        new MeshStandardMaterial({ color: sceneB ? 0x62dbfa : 0xfdb251 }),
      );
      landmark.position.y = sceneB ? 1.1 : 0.9;
      scene.add(landmark);

      if (sceneB) await waitForFixture(signal);
      if (fail) throw new Error('The QA fixture failed during preparation.');
    },
    enter() {},
    update(dt, { actions }) {
      if (actions.interact) scene.userData.interactPresses++;
    },
    present(elapsed) {
      startedAt ??= elapsed;
      landmark.rotation.y = elapsed - startedAt;
    },
    exit() {},
    dispose() {
      try {
        disposeScene(scene, new Set(floorLease ? [floorLease.value] : []));
      } finally {
        floorLease?.release();
        floorLease = undefined;
      }
    },
  };
}

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

  function loadFixture(sceneB) {
    const fail = failNext;
    failNext = false;
    failButton.disabled = false;
    failButton.textContent = 'Fail next load';
    return { createWorld: context => createFixtureWorld({ ...context, sceneB, fail }) };
  }

  const registry = createWorldRegistry({
    'scene-a': () => loadFixture(false),
    'scene-b': () => loadFixture(true),
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
      const createFixture = selected === 'input' ? createInputPreview : createGame;
      game = createFixture({ mount: gameMount });
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
