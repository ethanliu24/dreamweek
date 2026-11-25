import {
  BoxGeometry, Color, CylinderGeometry, DirectionalLight, HemisphereLight, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, RingGeometry, Scene, SphereGeometry, Vector3,
} from 'three';
import { createGame } from '../app/game.js';
import { disposeScene } from '../runtime/assets.js';
import { canReturn, nextDream } from '../state/progress.js';
import { createWorldRegistry } from '../worlds/registry.js';

const HOME = new Vector3(0, 0, 1.8);
const HAMMOCK = new Vector3(0, 0, 0.85);
const FIRE_ARRIVAL = new Vector3(0, 0, 2);
const REWARD = new Vector3(0, 0, -1.2);

function createFixture(ctx, { name, sky, ground, arrival, cues, setup }) {
  const { player, audio } = ctx;
  const scene = new Scene();
  scene.name = name;
  scene.background = new Color(sky);
  const sun = new DirectionalLight(0xffebcb, 2);
  sun.position.set(3, 5, 4);
  scene.add(new HemisphereLight(0xdde9ff, 0x57565a, 1.6), sun);
  const floor = new Mesh(new BoxGeometry(10, 0.3, 12), new MeshStandardMaterial({ color: ground }));
  floor.position.y = -0.15;
  scene.add(floor);

  let unregister = [];
  const profile = { cues };
  return {
    scene,
    surfaces: {
      floorHeight: () => 0,
      walkBounds: { minX: -4.7, maxX: 4.7, minZ: -5.7, maxZ: 5.7 },
      safeSpawn: arrival,
    },
    prepare: signal => audio.prepare(profile, signal),
    enter() {
      player.teleport(arrival);
      scene.add(player.root);
      unregister = setup(scene);
      audio.enter(profile);
    },
    update() {},
    exit() {
      for (const remove of unregister) remove();
      player.root.removeFromParent();
    },
    dispose() { disposeScene(scene); },
  };
}

function createHome(ctx) {
  const { audio, interactions, progress, travel, ui } = ctx;
  return createFixture(ctx, {
    name: 'Overworld', sky: 0x7bb0cc, ground: 0x48796b, arrival: HOME,
    cues: ['hammock.lower'],
    setup(scene) {
      const cloth = new Mesh(new BoxGeometry(2, 0.12, 0.65), new MeshStandardMaterial({ color: 0xddae73 }));
      cloth.position.copy(HAMMOCK).setY(0.64);
      scene.add(cloth);
      for (const side of [-1, 1]) {
        const post = new Mesh(new CylinderGeometry(0.065, 0.085, 1.28), new MeshStandardMaterial({ color: 0x694c39 }));
        post.position.copy(HAMMOCK).add(new Vector3(side * 1.04, 0.64, 0));
        scene.add(post);
      }

      const destination = nextDream(progress.read());
      const name = destination && destination[0].toUpperCase() + destination.slice(1);
      if (name) ui.objective(`Next dream: ${name}`, cloth.position);

      return [interactions.register({
        id: 'hammock', point: HAMMOCK, enabled: destination === 'fire', label: 'Sleep in the hammock',
        run() {
          if (travel.enterNext()) audio.play('hammock.lower', { position: HAMMOCK });
        },
      })];
    },
  });
}

function createFire(ctx) {
  const { audio, interactions, progress, travel, ui } = ctx;
  const complete = () => canReturn('fire', progress.read());
  return createFixture(ctx, {
    name: 'Fire', sky: 0x514461, ground: 0x864e48, arrival: FIRE_ARRIVAL,
    cues: ['candle.chime'],
    setup(scene) {
      const ring = new Mesh(new RingGeometry(0.85, 0.98, 40), new MeshBasicMaterial({ color: 0xf1c65c }));
      ring.position.copy(FIRE_ARRIVAL).setY(0.012);
      ring.rotation.x = -Math.PI / 2;
      const stand = new Mesh(new CylinderGeometry(0.42, 0.48, 0.5), new MeshStandardMaterial({ color: 0x654052 }));
      stand.position.copy(REWARD).setY(0.25);
      const candle = new Mesh(new CylinderGeometry(0.13, 0.13, 0.37), new MeshStandardMaterial({ color: 0xffe4ae }));
      candle.position.copy(REWARD).setY(0.69);
      const flame = new Mesh(new SphereGeometry(0.09, 12, 8), new MeshBasicMaterial({ color: 0xffae45 }));
      flame.position.copy(REWARD).setY(0.94);
      flame.scale.y = 1.55;
      scene.add(ring, stand, candle, flame);

      function refresh() {
        const unlocked = complete();
        candle.visible = flame.visible = !unlocked;
        ring.material.color.setHex(unlocked ? 0xffe36a : 0x9d7a40);
        if (unlocked) ui.objective('Return through the yellow ring when ready', ring.position);
        else ui.objective('Collect the Candle to unlock the return ring', candle.position);
      }
      refresh();

      return [
        interactions.register({
          id: 'candle', point: REWARD, enabled: () => !complete(), label: 'Collect Candle',
          run() {
            if (!progress.apply('earnCandle').changed) return;
            audio.play('candle.chime', { position: REWARD });
            refresh();
          },
        }),
        interactions.register({
          id: 'return', point: FIRE_ARRIVAL, enabled: complete, label: 'Return to the Overworld',
          run: travel.returnHome,
        }),
      ];
    },
  });
}

export function createRoundTripPreview({ mount }) {
  const fixture = document.createElement('section');
  fixture.innerHTML = `
    <h2>Round trip</h2>
    <p>Use <kbd>WASD</kbd> to move and <kbd>E</kbd> to interact. In Fire, try the ring before collecting the Candle, then return whenever you’re ready.</p>
    <div data-game></div>
  `;
  mount.replaceChildren(fixture);
  const registry = createWorldRegistry({
    overworld: () => ({ createWorld: createHome }),
    fire: () => ({ createWorld: createFire }),
  });
  const game = createGame({ mount: fixture.querySelector('[data-game]'), registry });
  return {
    dispose() {
      game.dispose();
      fixture.remove();
    },
  };
}
