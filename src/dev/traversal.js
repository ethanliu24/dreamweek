import {
  Box3, BoxGeometry, CircleGeometry, Color, DirectionalLight, ExtrudeGeometry, Fog, GridHelper,
  Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, RingGeometry,
  Scene, Shape, Vector3,
} from 'three';
import { createCameraRig } from '../player/camera.js';
import { createPlayer } from '../player/controller.js';
import { disposeScene } from '../runtime/assets.js';
import { createControls } from '../runtime/controls.js';
import { createDisplay } from '../runtime/display.js';
import { createInput } from '../runtime/input.js';
import { createLoop } from '../runtime/loop.js';

const surfaces = {
  floorHeight: () => 0,
  walkBounds: { minX: -5, maxX: 5, minZ: -8, maxZ: 5 },
  safeSpawn: new Vector3(0, 0, 1.6),
  platforms: [0.45, 0.88, 1.31, 1.74].map((y, i) => ({
    y, minX: -1.05, maxX: 1.05, minZ: -2.1 - i * 1.5, maxZ: -0.6 - i * 1.5,
  })),
};

function createCourse(scene) {
  const floor = new Mesh(new BoxGeometry(11.8, 0.2, 13.3), new MeshStandardMaterial({ color: 0x456e79 }));
  floor.position.set(-0.75, -0.1, -1.5);
  scene.add(floor);

  const grid = new GridHelper(13, 13, 0x729ba4, 0x729ba4);
  grid.scale.x = 10 / 13;
  grid.position.set(0, 0.003, -1.5);
  scene.add(grid);

  const start = new Mesh(new RingGeometry(0.48, 0.52, 40), new MeshBasicMaterial({ color: 0xc4eee5 }));
  start.position.copy(surfaces.safeSpawn);
  start.position.y = 0.008;
  start.rotation.x = -Math.PI / 2;
  scene.add(start);

  const sides = new MeshStandardMaterial({ color: 0x27455b, roughness: 0.85 });
  const top = new MeshStandardMaterial({ color: 0xc2814e, roughness: 0.8 });
  const edge = new MeshStandardMaterial({ color: 0xf3cb82, roughness: 0.75 });
  const stripe = new BoxGeometry(2.1, 0.018, 0.07);
  const slabHeight = 0.16;
  for (const platform of surfaces.platforms) {
    const center = (platform.minZ + platform.maxZ) / 2;
    const block = new Mesh(
      new BoxGeometry(2.1, slabHeight, platform.maxZ - platform.minZ),
      [sides, sides, top, sides, sides, sides],
    );
    block.position.set(0, platform.y - slabHeight / 2, center);
    const lip = new Mesh(stripe, edge);
    lip.position.set(0, platform.y, platform.maxZ - 0.035);
    scene.add(block, lip);
  }
}

function createSword() {
  const sword = new Group();
  sword.userData.kind = 'sword';
  const blade = new Shape()
    .moveTo(-0.06, 0.11).lineTo(0.06, 0.11).lineTo(0.045, 0.63)
    .lineTo(0, 0.76).lineTo(-0.045, 0.63).closePath();
  const silver = new MeshStandardMaterial({ color: 0xaddef1, metalness: 0.55, roughness: 0.36 });
  const brass = new MeshStandardMaterial({ color: 0xe4af56, metalness: 0.55, roughness: 0.45 });
  const handle = new MeshStandardMaterial({ color: 0x473449, roughness: 0.8 });
  const guard = new Mesh(new BoxGeometry(0.25, 0.06, 0.07), brass);
  guard.position.y = 0.11;
  sword.add(
    new Mesh(new ExtrudeGeometry(blade, { depth: 0.025, bevelEnabled: false }), silver),
    guard,
    new Mesh(new BoxGeometry(0.06, 0.18, 0.05), handle),
  );
  sword.rotation.z = -0.37;
  return sword;
}

export function createTraversalPreview({ mount }) {
  const fixture = document.createElement('section');
  fixture.innerHTML = `
    <h1>Traversal</h1>
    <p id="qa-traversal-help">WASD to glide, Space to jump. Climb the steps and drop from the side. Left-drag to orbit. Left-click to swing when equipped.</p>
    <button type="button" data-sword aria-pressed="false">Equip sword</button>
    <button type="button" data-shot aria-pressed="false">Front shot</button>
    <button type="button" data-spawn>Return to start</button>
    <p data-readout></p>
    <canvas tabindex="0" aria-label="Traversal course" aria-describedby="qa-traversal-help"
      style="display:block;width:100%;aspect-ratio:16/9;max-height:70vh;touch-action:none"></canvas>
  `;
  mount.replaceChildren(fixture);

  const canvas = fixture.querySelector('canvas');
  const button = fixture.querySelector('[data-sword]');
  const shotButton = fixture.querySelector('[data-shot]');
  const spawnButton = fixture.querySelector('[data-spawn]');
  const readout = fixture.querySelector('[data-readout]');
  let display;
  try {
    display = createDisplay(canvas);
  } catch (error) {
    console.error(error);
    readout.setAttribute('role', 'alert');
    readout.textContent = 'Traversal could not start. WebGL is required.';
    for (const control of fixture.querySelectorAll('button')) control.disabled = true;
    return { dispose: () => fixture.remove() };
  }

  const scene = new Scene();
  scene.background = new Color(0x253952);
  scene.fog = new Fog(0x253952, 12, 25);
  const key = new DirectionalLight(0xffefda, 2.15);
  key.position.set(4, 6, 4);
  scene.add(new HemisphereLight(0xc7ddff, 0x567783, 1.55), key);
  createCourse(scene);
  const wall = new Mesh(new BoxGeometry(0.35, 3, 7), new MeshStandardMaterial({ color: 0x53748c }));
  wall.position.set(-6.4, 1.5, -1.5);
  scene.add(wall);

  const player = createPlayer();
  const sword = createSword();
  scene.add(player.root);
  player.teleport(surfaces.safeSpawn);
  player.root.rotation.y = Math.PI / 3;

  const shadow = new Mesh(new CircleGeometry(0.37, 32), new MeshBasicMaterial({
    color: 0x17243b, transparent: true, opacity: 0.32, depthWrite: false,
  }));
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  const input = createInput(canvas);
  const controls = createControls(input);
  let equipped = false;

  function toggleSword() {
    equipped = !equipped;
    player.setHeld(equipped ? sword : null);
    button.setAttribute('aria-pressed', String(equipped));
    button.textContent = equipped ? 'Unequip sword' : 'Equip sword';
    canvas.focus({ preventScroll: true });
  }

  const rig = createCameraRig(display.camera, { obstructions: [new Box3().setFromObject(wall)] });
  rig.follow(player);
  let releaseShotLock;

  function endShot() {
    if (!releaseShotLock) return;
    rig.releaseShot();
    releaseShotLock();
    releaseShotLock = null;
    shotButton.setAttribute('aria-pressed', 'false');
    shotButton.textContent = 'Front shot';
  }

  function toggleShot() {
    if (releaseShotLock) {
      endShot();
    } else {
      const lookAt = player.position.clone().add(new Vector3(0, 0.6, 0));
      const forward = player.strikeWindow().forward;
      const eye = lookAt.clone().addScaledVector(forward, 2.8);
      eye.y += 0.65;
      eye.x = Math.max(-5.9, eye.x);
      rig.shot({ eye, lookAt, seconds: 0.55 });
      releaseShotLock = controls.acquire('puzzle');
      shotButton.setAttribute('aria-pressed', 'true');
      shotButton.textContent = 'Resume follow';
    }
    canvas.focus({ preventScroll: true });
  }

  function returnToStart() {
    endShot();
    input.clear();
    player.teleport(surfaces.safeSpawn);
    canvas.focus({ preventScroll: true });
  }

  button.addEventListener('click', toggleSword);
  shotButton.addEventListener('click', toggleShot);
  spawnButton.addEventListener('click', returnToStart);

  const loop = createLoop({
    update(dt) {
      const actions = controls.sample();
      rig.orbit(actions.orbitX, actions.orbitY);
      player.step(dt, { ...actions, yaw: rig.yaw, mode: controls.mode }, surfaces);
    },
    render(_elapsed, dt) {
      const { x, y, z } = player.position;
      let support = surfaces.floorHeight(x, z);
      for (const platform of surfaces.platforms) {
        if (x >= platform.minX && x <= platform.maxX && z >= platform.minZ && z <= platform.maxZ && y >= platform.y) {
          support = Math.max(support, platform.y);
        }
      }
      shadow.position.set(x, support + 0.022, z);
      shadow.material.opacity = 0.32 / (1 + y - support);

      rig.update(dt);
      display.render(scene);

      const { swingId, active } = player.strikeWindow();
      const text = `X ${x.toFixed(2)} · Y ${y.toFixed(2)} · Z ${z.toFixed(2)} · Swings ${swingId} · Strike window ${active ? 'active' : 'closed'}`;
      if (readout.textContent !== text) readout.textContent = text;
    },
  });
  canvas.focus({ preventScroll: true });
  loop.resume();

  return {
    dispose() {
      loop.dispose();
      endShot();
      input.dispose();
      button.removeEventListener('click', toggleSword);
      shotButton.removeEventListener('click', toggleShot);
      spawnButton.removeEventListener('click', returnToStart);
      player.dispose();
      scene.add(sword);
      disposeScene(scene);
      display.dispose();
      fixture.remove();
    },
  };
}
