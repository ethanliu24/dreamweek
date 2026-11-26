import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

export function createMallow() {
  const root = new Group();
  const head = new Group();
  head.position.y = 0.62;
  root.add(head);

  const sphere = new SphereGeometry(1, 24, 16);
  const cream = new MeshStandardMaterial({ color: 0xebd6af });
  const rose = new MeshStandardMaterial({ color: 0xb76f68 });
  const green = new MeshStandardMaterial({ color: 0x657954 });
  const brown = new MeshStandardMaterial({ color: 0x58382e });

  function oval(parent, material, x, y, z, sx, sy, sz) {
    const mesh = new Mesh(sphere, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    parent.add(mesh);
    return mesh;
  }

  oval(root, cream, 0, 0.31, 0, 0.235, 0.29, 0.19);
  oval(root, green, 0, 0.245, 0.145, 0.176, 0.16, 0.073);
  oval(root, green, 0, 0.225, 0.211, 0.076, 0.053, 0.018);
  for (const x of [-0.092, 0.092]) {
    oval(root, cream, x, 0.077, 0.064, 0.089, 0.077, 0.114);
    oval(root, brown, x, 0.448, 0.172, 0.036, 0.049, 0.022);
  }
  oval(root, brown, 0, 0.38, 0.19, 0.028, 0.012, 0.016);

  oval(head, cream, 0, -0.028, 0, 0.385, 0.084, 0.292);
  oval(head, rose, 0, 0.042, -0.023, 0.426, 0.177, 0.325).rotation.z = -0.08;
  for (const [x, y, z, size] of [[-0.18, 0.156, 0.16, 0.063], [0.13, 0.168, 0.15, 0.07], [0.26, 0.11, 0.16, 0.039]]) {
    oval(head, cream, x, y, z, size, size * 0.37, size * 0.83).rotation.x = 0.45;
  }

  const arms = [-1, 1].map(side => {
    const arm = new Group();
    arm.position.set(side * 0.18, 0.34, 0.035);
    root.add(arm);
    oval(arm, cream, 0, -0.08, 0.055, 0.062, 0.12, 0.064);
    return arm;
  });

  return {
    root,
    face(point) {
      root.rotation.y = Math.atan2(point.x - root.position.x, point.z - root.position.z);
    },
    animate(time, pose) {
      const shy = pose === 'shy';
      const happy = pose === 'happy' || pose === 'offer';
      head.rotation.x = (shy ? 0.26 : happy ? -0.13 : 0.035) + Math.sin(time * 3) * 0.028;
      head.rotation.z = Math.sin(time * 2.1) * 0.035;
      arms.forEach((arm, i) => {
        arm.rotation.x = shy || pose === 'offer' ? -0.93 : -0.35;
        arm.rotation.z = (i ? 1 : -1) * (happy ? 1.02 : shy ? -0.38 : 0.34);
      });
    },
  };
}
