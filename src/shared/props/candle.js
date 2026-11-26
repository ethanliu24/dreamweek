import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, SphereGeometry } from 'three';
import { flameGeometry } from './flame.js';

export function createCandle() {
  const root = new Group();
  root.name = 'Candle gift';
  const wax = new MeshStandardMaterial({ color: 0xb92c38, roughness: 0.44 });
  root.add(new Mesh(new CylinderGeometry(0.095, 0.11, 0.25, 24), wax));

  const dripGeometry = new SphereGeometry(1, 16, 10);
  for (const [angle, length] of [[0.2, 0.058], [2.1, 0.033], [4.1, 0.046]]) {
    const drip = new Mesh(dripGeometry, wax);
    drip.scale.set(0.023, length, 0.015);
    drip.position.set(Math.sin(angle) * 0.091, 0.126 - length, Math.cos(angle) * 0.091);
    drip.rotation.y = angle;
    root.add(drip);
  }

  const pool = new Mesh(new CylinderGeometry(0.057, 0.057, 0.008, 20),
    new MeshStandardMaterial({ color: 0xe05c50, roughness: 0.24 }));
  pool.position.y = 0.126;
  const wick = new Mesh(new CylinderGeometry(0.008, 0.011, 0.045, 8),
    new MeshStandardMaterial({ color: 0x302127 }));
  wick.position.y = 0.148;
  wick.rotation.z = -0.16;
  root.add(pool, wick);

  const geometry = flameGeometry();
  for (const [color, width, height, base, opacity] of [
    [0xff7d27, 0.033, 0.119, 0.159, 0.84],
    [0xffedab, 0.019, 0.071, 0.17, 1],
  ]) {
    const flame = new Mesh(geometry, new MeshBasicMaterial({
      color, toneMapped: false, opacity, transparent: opacity < 1, depthWrite: opacity === 1,
    }));
    flame.scale.set(width, height, width);
    flame.position.y = base;
    root.add(flame);
  }
  return root;
}
