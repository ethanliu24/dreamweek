import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

function mesh(parent, geometry, color, x, y, z, options) {
  const object = new Mesh(geometry, new MeshStandardMaterial({ color, ...options }));
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

export function createWizard() {
  const frog = new Group();
  const sphere = new SphereGeometry(1, 14, 10);
  mesh(frog, sphere, 0x6d9a76, 0, 0.31, 0).scale.set(0.42, 0.34, 0.34);
  mesh(frog, sphere, 0xa9bc85, 0, 0.31, 0.23).scale.set(0.30, 0.23, 0.16);
  for (const x of [-0.2, 0.2]) {
    mesh(frog, sphere, 0x7da57a, x, 0.55, 0.18).scale.set(0.13, 0.12, 0.1);
    mesh(frog, new BoxGeometry(0.12, 0.018, 0.014), 0x334447, x, 0.553, 0.271);
  }
  mesh(frog, new CylinderGeometry(0.39, 0.39, 0.045, 24), 0x57547f, 0, 0.65, -0.06);
  mesh(frog, new ConeGeometry(0.24, 0.52, 24), 0x69638a, 0, 0.9, -0.06);
  return frog;
}
