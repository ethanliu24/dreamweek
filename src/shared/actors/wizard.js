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
  const moon = new Mesh(sphere, new MeshStandardMaterial({
    color: 0xe8e3f8, emissive: 0xc6a1ed, emissiveIntensity: 0.52,
  }));
  moon.position.set(0, 0.28, 0.367);
  moon.scale.set(0.116, 0.116, 0.035);
  moon.name = 'Belly Moon';
  frog.add(moon);
  return frog;
}

export const WIZARD_COLLAPSE_ANGLE = -0.58;

export function addWizardCombatPose(frog) {
  const sphere = new SphereGeometry(1, 14, 10);
  const arm = new Group();
  arm.position.set(0.32, 0.36, 0.12);
  mesh(arm, sphere, 0x6d9a76, 0.09, -0.09, 0).scale.set(0.16, 0.082, 0.09);
  const hand = new Group();
  hand.position.set(0.23, -0.09, 0);
  arm.add(hand);
  frog.add(arm);

  const mouth = mesh(frog, sphere, 0x371d39, 0, 0.448, 0.303);
  const scale = frog.scale.x;
  return {
    hand,
    mouth,
    set({ crouch = 0, cast = 0, open = 0, hit = 0 } = {}) {
      frog.scale.set(scale * (1 + crouch * 0.15), scale * (1 - crouch * 0.3 + hit * 0.1), scale);
      arm.rotation.z = 1.7 * cast;
      mouth.scale.set(0.22, 0.018 + 0.076 * open, 0.05);
    },
  };
}
