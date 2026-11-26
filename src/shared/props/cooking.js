import {
  CylinderGeometry, Group, LatheGeometry, Mesh, MeshStandardMaterial, Vector2,
} from 'three';

import { potDimensions, potGeometry } from './pot.js';

export function createCookingPot(shape) {
  const { lip, top } = potDimensions(shape);
  const root = new Group();
  const clay = new Mesh(potGeometry(shape), new MeshStandardMaterial({
    color: 0x9f6454, roughness: 0.62,
  }));
  const radius = lip - 0.008;
  const liquid = new Mesh(new CylinderGeometry(radius, radius, 0.016, 36),
    new MeshStandardMaterial({ color: 0x70b9d2, roughness: 0.28 }));
  liquid.position.y = top * 0.88;
  root.add(clay, liquid);
  return { root, liquid, radius };
}

export function createSoupBowl() {
  const bowl = new Group();
  const profile = [[0, 0], [0.11, 0], [0.2, 0.12], [0.18, 0.12], [0.09, 0.025], [0, 0.025]]
    .map(([x, y]) => new Vector2(x, y));
  bowl.add(new Mesh(new LatheGeometry(profile, 24), new MeshStandardMaterial({ color: 0x709ab4 })));
  const soup = new Mesh(new CylinderGeometry(0.171, 0.171, 0.015, 24),
    new MeshStandardMaterial({ color: 0xffac67, emissive: 0x8d4025, emissiveIntensity: 0.35 }));
  soup.position.y = 0.097;
  bowl.add(soup);
  return bowl;
}
