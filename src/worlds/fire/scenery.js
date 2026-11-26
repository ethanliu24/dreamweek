import {
  BoxGeometry, DirectionalLight, Group, HemisphereLight, Mesh, MeshStandardMaterial, PointLight, Scene,
} from 'three';
import { dressFestival } from './festival.js';
import { batches, lanternKit } from './lanterns.js';

// Fold the route back over the valley. Small offsets vary each visit while
// the anchors keep consecutive jumps reachable and leave room overhead.
const ROUTE = [
  [0, 0], [1.4, -2], [3.6, -3], [4.3, -5.4], [2.4, -7],
  [0, -7.4], [-1.8, -5.7], [-4, -4.8], [-4.5, -2.4], [-2.5, -1],
  [-0.2, -1.8], [1.3, -3.8], [3.7, -4.3], [4.4, -6.7], [2.5, -8.2],
  [0.2, -7.3], [-2, -8.4], [-4, -6.9], [-3.8, -4.4], [-1.7, -3.1],
  [0.6, -3.9], [2, -6], [1, -8.2], [-1.4, -10.2],
];

function between(min, max) {
  return min + Math.random() * (max - min);
}

export function createScenery() {
  const scene = new Scene();
  scene.name = 'Fire';
  const animate = dressFestival(scene);
  const walkBounds = { minX: -9, maxX: 9, minZ: -33, maxZ: 7 };
  const summitLantern = new Group();
  scene.add(summitLantern);
  const steps = batches(scene);
  const ceremonial = batches(summitLantern);
  const lantern = lanternKit();
  let y = 0;
  const platforms = ROUTE.map(([anchorX, anchorZ], index) => {
    const summit = index === ROUTE.length - 1;
    const x = anchorX + between(-0.14, 0.14);
    const z = anchorZ + between(-0.14, 0.14);
    y += between(0.72, 0.89);
    const width = summit ? 3.4 : between(1.45, 2.4);
    const depth = summit ? 2.2 : between(1.25, 1.8);
    const body = summit ? 0.95 : between(0.26, 0.42);

    lantern(summit ? ceremonial : steps, x, y, z, width, body * 1.5, depth);

    return { y, minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 };
  });

  steps.finish();
  ceremonial.finish();
  const key = new DirectionalLight(0xffdbc3, 1.8);
  key.position.set(-4, 8, 5);
  const glow = new PointLight(0xffa24d, 32, 10);
  glow.position.set(0, 2, 2);
  scene.add(new HemisphereLight(0xc2d2ff, 0xbe816b, 1.65), key, glow);
  return { scene, platforms, walkBounds, summitLantern, animate };
}
