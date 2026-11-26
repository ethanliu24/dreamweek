import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Shape } from 'three';

export function createSword() {
  const root = new Group();
  root.name = 'Sword';
  root.userData.kind = 'sword';
  const silver = new MeshStandardMaterial({ color: 0xc7dae2, metalness: 0.52, roughness: 0.29 });
  const bronze = new MeshStandardMaterial({ color: 0xb28756, metalness: 0.38, roughness: 0.42 });
  const leather = new MeshStandardMaterial({ color: 0x3b3033 });
  const blade = new Shape();
  blade.moveTo(-0.061, 0.12);
  blade.lineTo(-0.045, 0.79);
  blade.lineTo(0, 0.97);
  blade.lineTo(0.045, 0.79);
  blade.lineTo(0.061, 0.12);
  blade.closePath();
  const geometry = new ExtrudeGeometry(blade, { depth: 0.027, bevelEnabled: false });
  geometry.translate(0, 0, -0.0135);
  root.add(new Mesh(geometry, silver));

  const grip = new Mesh(new CylinderGeometry(0.028, 0.032, 0.19, 10), leather);
  const pommel = new Mesh(new CylinderGeometry(0.045, 0.035, 0.039, 10), bronze);
  pommel.position.y = -0.106;
  for (const side of [-1, 1]) {
    const guard = new Mesh(new BoxGeometry(0.145, 0.035, 0.049), bronze);
    guard.position.set(side * 0.061, 0.114, 0);
    guard.rotation.z = side * 0.21;
    root.add(guard);
  }
  root.add(grip, pommel);
  return root;
}
