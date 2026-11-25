import {
  CylinderGeometry, Group, LatheGeometry, Mesh, MeshStandardMaterial, Vector2,
} from 'three';

export function createCookingPot({ base, height, rim }) {
  const width = 0.25 + base * 0.17;
  const lip = 0.35 + rim * 0.14;
  const depth = 0.32 + height * 0.24;
  const profile = [
    [0, 0], [width * 0.83, 0], [width, 0.04], [Math.max(width, lip) * 1.06, depth * 0.48],
    [lip, depth * 0.93], [lip + 0.035, depth], [lip - 0.028, depth],
    [lip - 0.044, depth * 0.9], [width * 0.82, 0.065], [0, 0.065],
  ].map(([x, y]) => new Vector2(x, y));
  const root = new Group();
  const clay = new Mesh(new LatheGeometry(profile, 32), new MeshStandardMaterial({
    color: 0x9f6454, roughness: 0.62,
  }));
  const liquid = new Mesh(new CylinderGeometry(lip - 0.052, lip - 0.052, 0.02, 32),
    new MeshStandardMaterial({ color: 0x70b9d2, roughness: 0.28 }));
  liquid.position.y = depth * 0.85;
  root.add(clay, liquid);
  return { root, liquid, radius: lip - 0.052 };
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
