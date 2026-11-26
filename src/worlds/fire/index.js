import { Vector3 } from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { createScenery } from './scenery.js';

export function createWorld({ camera, player, ui }) {
  const { scene, platforms, walkBounds } = createScenery();
  const safeSpawn = new Vector3(0, 0, 3.6);

  return {
    scene,
    surfaces: { floorHeight: () => 0, platforms, walkBounds, safeSpawn },
    prepare() {},
    enter() {
      player.root.rotation.set(0, Math.PI, 0);
      player.setPose('idle');
      player.teleport(safeSpawn);
      camera.resetOrbit({ pitch: 0.18 });
      scene.add(player.root);
      ui.objective('Climb the lanterns with Space');
    },
    update() {},
    exit() {
      player.root.removeFromParent();
    },
    dispose() {
      disposeScene(scene);
    },
  };
}
