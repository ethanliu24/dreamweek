import {
  Color, DirectionalLight, HemisphereLight, Mesh, MeshStandardMaterial, PlaneGeometry, Scene,
} from 'three';
import { disposeScene } from '../runtime/assets.js';

export function createFixtureWorld({ assets, fail }, { name, background, floorColor, createLandmark, prepare }) {
  const scene = new Scene();
  scene.name = name;
  scene.background = new Color(background);
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
        lease.value, new MeshStandardMaterial({ color: floorColor }),
      );
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      landmark = createLandmark();
      scene.add(landmark);

      if (prepare) await prepare(signal);
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
