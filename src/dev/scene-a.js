import { BoxGeometry, Mesh, MeshStandardMaterial } from 'three';
import { createFixtureWorld } from './fixture-world.js';

export function createWorld(context) {
  return createFixtureWorld(context, {
    name: 'Scene A',
    background: 0x243752,
    floorColor: 0x568578,
    createLandmark() {
      const mesh = new Mesh(new BoxGeometry(1.4, 1.8, 1.4), new MeshStandardMaterial({ color: 0xfdb251 }));
      mesh.position.y = 0.9;
      return mesh;
    },
  });
}
