import {
  BoxGeometry, Color, DirectionalLight, HemisphereLight, Mesh,
  MeshStandardMaterial, PlaneGeometry, Scene,
} from 'three';
import { createGame } from '../app/game.js';
import { createDisplay } from '../runtime/display.js';
import { createLoop } from '../runtime/loop.js';
import { createInputPreview } from './input-preview.js';

function createSceneA({ mount }) {
  const fixture = document.createElement('section');
  fixture.innerHTML = `
    <h1>Scene A</h1>
    <p data-counts></p>
    <canvas aria-label="Scene A" style="display:block;width:100%;aspect-ratio:16/9;max-height:75vh"></canvas>
  `;
  mount.replaceChildren(fixture);

  const canvas = fixture.querySelector('canvas');
  const counts = fixture.querySelector('[data-counts]');
  let display;
  try {
    display = createDisplay(canvas);
  } catch (error) {
    const notice = document.createElement('p');
    notice.setAttribute('role', 'alert');
    notice.textContent = 'Scene A could not start. WebGL 2 is required to render it.';
    fixture.replaceChildren(notice);
    console.error(error);
    return { dispose: () => fixture.remove() };
  }

  const scene = new Scene();
  scene.background = new Color(0x243752);
  const floor = new Mesh(new PlaneGeometry(18, 18), new MeshStandardMaterial({ color: 0x568578 }));
  floor.rotation.x = -Math.PI / 2;
  const landmark = new Mesh(new BoxGeometry(1.4, 1.8, 1.4), new MeshStandardMaterial({ color: 0xfdb251 }));
  landmark.position.y = 0.9;

  const fill = new HemisphereLight(0xc2dcff, 0x52634d, 1.4);
  const key = new DirectionalLight(0xffeed7, 2.2);
  key.position.set(3, 5, 4);
  scene.add(floor, landmark, fill, key);

  display.camera.position.set(4, 3.5, 6);
  display.camera.lookAt(0, 0.65, 0);

  const loop = createLoop({
    update() {},
    render(elapsed) {
      landmark.rotation.y = elapsed;
      display.render(scene);

      const { render, memory } = display.renderer.info;
      const readout = `Draws ${render.calls} · Triangles ${render.triangles} · Geometries ${memory.geometries} · Textures ${memory.textures}`;
      if (counts.textContent !== readout) counts.textContent = readout;
    },
  });
  loop.resume();

  return {
    dispose() {
      loop.dispose();
      floor.geometry.dispose();
      floor.material.dispose();
      landmark.geometry.dispose();
      landmark.material.dispose();
      display.dispose();
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
        <option value="input">Input</option>
      </select>
    </label>
    <button type="button">Reset</button>
  `;

  const fixture = panel.querySelector('select');
  const reset = panel.querySelector('button');
  const gameMount = document.createElement('div');
  const fixtures = { shell: createGame, 'scene-a': createSceneA, input: createInputPreview };
  let game;

  function restart() {
    game?.dispose();
    game = fixtures[fixture.value]({ mount: gameMount });
  }

  restart();
  mount.replaceChildren(panel, gameMount);
  fixture.addEventListener('change', restart);
  reset.addEventListener('click', restart);
}
