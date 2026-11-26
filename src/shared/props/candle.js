import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

export function createCandle() {
  const root = new Group();
  root.name = 'Candle gift';
  const wax = new MeshStandardMaterial({ color: 0xffeed0 });
  root.add(new Mesh(new CylinderGeometry(0.095, 0.11, 0.25, 12), wax));
  const wick = new Mesh(new CylinderGeometry(0.014, 0.016, 0.06, 6),
    new MeshStandardMaterial({ color: 0x3b2830 }));
  wick.position.y = 0.148;
  root.add(wick);
  const drip = new Mesh(new SphereGeometry(1, 12, 8), wax);
  drip.scale.set(0.028,0.055,0.018);
  drip.position.set(0.022,0.087,0.089);
  root.add(drip);
  return root;
}
