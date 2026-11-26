import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

export function createClink() {
  const root = new Group();
  root.name = 'Clink';
  const body = new Group();
  root.add(body);
  const oval = new SphereGeometry(1, 24, 16);
  const shell = new MeshStandardMaterial({ color: 0x795841, metalness: 0.48, roughness: 0.42 });
  const gold = new MeshStandardMaterial({ color: 0xc29256, metalness: 0.4, roughness: 0.4 });
  const dark = new MeshStandardMaterial({ color: 0x3a2928 });
  const teal = new MeshStandardMaterial({ color: 0x5fddce, emissive: 0x35b6a4, emissiveIntensity: 0.9 });

  function part(parent, geometry, material, position, scale) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }

  part(body, oval, dark, [0, 0.22, 0.01], [0.27, 0.19, 0.35]);
  part(body, oval, shell, [0, 0.32, -0.09], [0.29, 0.22, 0.37]);
  part(body, oval, dark, [0, 0.407, -0.1], [0.015, 0.135, 0.334]);
  part(body, oval, gold, [0, 0.24, 0.25], [0.2, 0.175, 0.165]);
  part(body, oval, dark, [0, 0.18, 0.402], [0.045, 0.014, 0.014]);
  const antenna = new CylinderGeometry(0.014, 0.022, 0.15, 8);
  const arms = [];
  for (const side of [-1, 1]) {
    part(body, oval, teal, [side * 0.093, 0.282, 0.389], [0.057, 0.057, 0.027]);
    const stalk = new Group();
    stalk.position.set(side * 0.095, 0.387, 0.23);
    stalk.rotation.z = -side * 0.36;
    body.add(stalk);
    part(stalk, antenna, gold, [0, 0.064, 0], [1, 1, 1]);
    part(stalk, oval, teal, [0, 0.145, 0], [0.031, 0.031, 0.031]);
    for (const z of [-0.24, -0.025, 0.19]) {
      const leg = part(body, oval, dark, [side * 0.25, 0.095, z], [0.145, 0.059, 0.053]);
      leg.rotation.z = -side * 0.49;
      if (z > 0) arms.push({ leg, side });
    }
  }

  return {
    root,
    animate(time, phase) {
      const calling = phase === 'calling';
      const pleased = ['flow', 'repaired', 'reward', 'complete'].includes(phase);
      body.rotation.x = calling || pleased ? -0.16 : 0;
      body.position.y = (calling ? 0.055 : 0) + 0.012 * Math.sin(time * 5);
      for (const { leg, side } of arms) {
        const wave = calling ? 0.66 + 0.38 * Math.sin(time * 12) : pleased ? 0.43 : 0;
        leg.rotation.z = side * (wave - 0.49);
      }
    },
  };
}
