import { Color, DirectionalLight, HemisphereLight, Scene } from 'three';
import { disposeScene } from '../runtime/assets.js';
import { createDisplay } from '../runtime/display.js';
import { createLoop } from '../runtime/loop.js';
import { createPipeBoard } from '../worlds/metal/board.js';

export function createBoardPreview({ mount }) {
  const view = document.createElement('section');
  view.innerHTML = `
    <p>Click a pipe to turn it 90° and connect the inlet to the outlet.</p>
    <canvas aria-label="Metal pipe board" style="display:block;width:100%;height:70vh"></canvas>
    <p role="status">Outlet disconnected</p>
  `;
  mount.replaceChildren(view);
  const canvas = view.querySelector('canvas');
  const status = view.querySelector('[role="status"]');
  let display;
  try {
    display = createDisplay(canvas);
  } catch {
    canvas.hidden = true;
    status.textContent = 'The pipe board requires WebGL 2.';
    return { dispose() { view.remove(); } };
  }

  const scene = new Scene();
  scene.background = new Color(0x161c28);
  const key = new DirectionalLight(0xffebce, 2.3);
  key.position.set(-2, 5, 6);
  const board = createPipeBoard();
  scene.add(key, new HemisphereLight(0xe1eeff, 0x677088, 2.1), board.root);

  function updateFlow() {
    const path = board.connectedPath();
    board.setPowered(path ?? []);
    status.textContent = path ? `Outlet connected · ${path.length} pipes` : 'Outlet disconnected';
  }

  function click(event) {
    if (board.rotateAtPointer(event, canvas, display.camera)) updateFlow();
  }

  const loop = createLoop({
    update() {},
    render(elapsed) {
      board.animateFlow(elapsed);
      const { eye, lookAt } = board.frame(display.camera);
      display.camera.position.copy(eye);
      display.camera.lookAt(lookAt);
      display.render(scene);
    },
  });
  canvas.addEventListener('click', click);
  loop.resume();
  return {
    dispose() {
      canvas.removeEventListener('click', click);
      loop.dispose();
      disposeScene(scene);
      display.dispose();
      view.remove();
    },
  };
}
