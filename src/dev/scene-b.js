import { OctahedronGeometry, Mesh, MeshStandardMaterial } from 'three';
import { createFixtureWorld } from './fixture-world.js';

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

export function createWorld(context) {
  return createFixtureWorld(context, {
    name: 'Scene B',
    background: 0x382a49,
    floorColor: 0x736986,
    prepare: waitForFixture,
    createLandmark() {
      const mesh = new Mesh(new OctahedronGeometry(1.1), new MeshStandardMaterial({ color: 0x62dbfa }));
      mesh.position.y = 1.1;
      return mesh;
    },
  });
}
