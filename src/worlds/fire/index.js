import { Vector3 } from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { createScenery } from './scenery.js';

export function createWorld({ camera, player, ui }) {
  const { scene, platforms, walkBounds } = createScenery();
  const safeSpawn = new Vector3(0, 0, 3.6);
  const summit = platforms.at(-1);
  const summitTarget = new Vector3(
    (summit.minX + summit.maxX) / 2,
    summit.y,
    (summit.minZ + summit.maxZ) / 2,
  );
  let reachedSummit = false;

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
      reachedSummit = false;
      ui.objective('Climb to the top lantern', summitTarget);
    },
    update() {
      if (reachedSummit) return;
      const { x, y, z } = player.position;
      if (y !== summit.y || x < summit.minX || x > summit.maxX || z < summit.minZ || z > summit.maxZ) return;
      reachedSummit = true;
      ui.objective('');
    },
    exit() {
      player.root.removeFromParent();
    },
    dispose() {
      disposeScene(scene);
    },
  };
}
