import {
  BoxGeometry, Color, CylinderGeometry, DirectionalLight, HemisphereLight, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, Scene, SphereGeometry, Vector3,
} from 'three';
import { disposeScene } from '../runtime/assets.js';
import { createReturnRing } from '../shared/props/return-ring.js';
import { canReturn } from '../state/progress.js';

const ARRIVAL = new Vector3(0, 0, 2);
const REWARD = new Vector3(0, 0, -1.2);
const AUDIO = { cues: ['shared.obtain'] };

export function createWorld({ player, audio, interactions, progress, travel, ui }) {
  const scene = new Scene();
  scene.name = 'Fire';
  scene.background = new Color(0x514461);

  const sun = new DirectionalLight(0xffebcb, 2);
  sun.position.set(3, 5, 4);
  scene.add(new HemisphereLight(0xdde9ff, 0x57565a, 1.6), sun);

  const floor = new Mesh(new BoxGeometry(10, 0.3, 12), new MeshStandardMaterial({ color: 0x864e48 }));
  floor.position.y = -0.15;
  const ring = createReturnRing(ARRIVAL);
  const stand = new Mesh(new CylinderGeometry(0.42, 0.48, 0.5), new MeshStandardMaterial({ color: 0x654052 }));
  stand.position.copy(REWARD).setY(0.25);
  const candle = new Mesh(new CylinderGeometry(0.13, 0.13, 0.37), new MeshStandardMaterial({ color: 0xffe4ae }));
  candle.position.copy(REWARD).setY(0.69);
  const flame = new Mesh(new SphereGeometry(0.09, 12, 8), new MeshBasicMaterial({ color: 0xffae45 }));
  flame.position.copy(REWARD).setY(0.94);
  flame.scale.y = 1.55;
  scene.add(floor, ring, stand, candle, flame);

  const readyColor = ring.material.color.clone();
  const complete = () => canReturn('fire', progress.read());
  const unregister = [];
  function refresh() {
    const unlocked = complete();
    candle.visible = flame.visible = !unlocked;
    if (unlocked) {
      ring.material.color.copy(readyColor);
      ui.objective('Return through the yellow ring when ready', ring.position);
    } else {
      ring.material.color.setHex(0x9d7a40);
      ui.objective('Collect the Candle to unlock the return ring', candle.position);
    }
  }

  return {
    scene,
    surfaces: {
      floorHeight: () => 0,
      walkBounds: { minX: -4.7, maxX: 4.7, minZ: -5.7, maxZ: 5.7 },
      safeSpawn: ARRIVAL,
    },
    prepare: signal => audio.prepare(AUDIO, signal),
    enter() {
      player.teleport(ARRIVAL);
      scene.add(player.root);
      audio.enter(AUDIO);
      refresh();
      unregister.push(interactions.register({
        id: 'candle', point: REWARD, enabled: () => !complete(), label: 'Collect Candle',
        run() {
          if (!progress.apply('earnCandle').changed) return;
          audio.play('shared.obtain', { position: REWARD });
          refresh();
        },
      }));
      unregister.push(interactions.register({
        id: 'return', point: ARRIVAL, enabled: complete, label: 'Return to the Overworld',
        run: travel.returnHome,
      }));
    },
    update() {},
    exit() {
      for (const remove of unregister) remove();
      player.root.removeFromParent();
    },
    dispose() { disposeScene(scene); },
  };
}
