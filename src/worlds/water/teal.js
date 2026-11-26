import { BoxGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry } from 'three';

export function createTeal() {
  const ivory = new MeshStandardMaterial({ color: 0xf2e4cb });
  const dark = new MeshStandardMaterial({ color: 0x203541 });
  const red = new MeshStandardMaterial({ color: 0xbb413b });
  const sphere = new SphereGeometry(1, 24, 16);
  const box = new BoxGeometry();

  function prop(parent, geometry, material, position, scale) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }

  const root = new Group();
  root.position.set(0, 1.3, 0.05);
  prop(root, sphere, ivory, [0, 0.43, 0], [0.39, 0.46, 0.34]);
  let flipperByGlasses;
  for (const x of [-0.32, 0.32]) {
    const flipper = prop(root, sphere, ivory, [x, 0.24, 0.11], [0.09, 0.2, 0.075]);
    flipper.rotation.z = x * 1.5;
    if (x > 0) flipperByGlasses = flipper;
  }
  for (const x of [-0.17, 0.17]) prop(root, sphere, dark, [x, 0.59, 0.279], [0.18, 0.11, 0.065]);
  prop(root, box, dark, [0, 0.61, 0.31], [0.15, 0.025, 0.03]);
  prop(root, sphere, ivory, [0, 0.44, 0.3], [0.15, 0.075, 0.08]);
  const lanyard = prop(root, new TorusGeometry(0.115, 0.012, 6, 20), red, [0, 0.28, 0.29], [1, 1.3, 1]);
  lanyard.rotation.x = -0.27;

  let reaction = 0;
  let embarrassed = false;

  return {
    root,
    react(count) { reaction = count; },
    confess() { embarrassed = true; },
    settle() {
      reaction = 0;
      embarrassed = false;
    },
    animate(elapsed, announcing) {
      root.rotation.x = announcing ? -0.18 : embarrassed ? 0.27 : -0.055 * reaction;
      root.rotation.y = reaction * (0.12 + Math.sin(elapsed * 6) * 0.022);
      flipperByGlasses.rotation.z = reaction >= 2 && !embarrassed ? 0.98 : 0.48;
      flipperByGlasses.position.y = reaction >= 2 && !embarrassed ? 0.42 : 0.24;
    },
  };
}
