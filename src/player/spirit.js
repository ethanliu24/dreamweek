import {
  Color, DynamicDrawUsage, Float32BufferAttribute, Group, LatheGeometry, Mesh,
  MeshPhysicalMaterial, MeshStandardMaterial, SphereGeometry, Vector2,
} from 'three';

const PROFILE = [
  [0, 0], [0.08, 0.035], [0.13, 0.08], [0.18, 0.14], [0.23, 0.21],
  [0.27, 0.28], [0.30, 0.35], [0.32, 0.43], [0.325, 0.51],
  [0.31, 0.64], [0.27, 0.78], [0.20, 0.90], [0.11, 0.97], [0, 1],
];
const CYCLE = 2.4;
const TAU = 2 * Math.PI;

export function createSpirit() {
  const model = new Group();
  const geometry = new LatheGeometry(PROFILE.map(([radius, y]) => new Vector2(radius, y)), 32);
  const positions = geometry.attributes.position.setUsage(DynamicDrawUsage);
  const underside = new Color(0xb6d8ed);
  const milk = new Color(0xe8f4f5);
  const color = new Color();
  const colors = new Float32Array(positions.count * 3);

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const angle = Math.atan2(z, x);
    const hem = Math.max(0, 1 - y / 0.45);
    positions.setXYZ(i, x, y + Math.sin(3 * angle) * Math.hypot(x, z) * hem * 0.22, z * 0.9);
    color.copy(underside).lerp(milk, Math.min(1, y / 0.60)).toArray(colors, 3 * i);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const rest = positions.array.slice();
  const bodyMaterial = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.43,
    sheen: 0.35,
    sheenColor: 0xb9d5f0,
    sheenRoughness: 0.6,
  });
  const body = new Mesh(geometry, bodyMaterial);
  model.add(body);

  const sphere = new SphereGeometry(1, 16, 12);
  const armMaterial = new MeshStandardMaterial({ color: 0xd7e9ef, roughness: 0.53 });
  const faceMaterial = new MeshStandardMaterial({ color: 0x273747, roughness: 0.5 });
  const glintMaterial = new MeshStandardMaterial({ color: 0xffffff, emissive: 0x526772 });

  function ellipsoid(parent, material, x, y, z, sx, sy, sz) {
    const mesh = new Mesh(sphere, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    parent.add(mesh);
    return mesh;
  }

  const eyes = [-0.10, 0.10].map(x => {
    const eye = new Group();
    eye.position.set(x, 0.70, 0.255);
    eye.rotation.y = x * 2.6;
    model.add(eye);
    ellipsoid(eye, faceMaterial, 0, 0, 0, 0.033, 0.048, 0.018);
    ellipsoid(eye, glintMaterial, -0.007, 0.016, 0.017, 0.009, 0.011, 0.003);
    return eye;
  });
  ellipsoid(model, faceMaterial, 0, 0.59, 0.286, 0.025, 0.011, 0.008);

  function createArm(side) {
    const shoulder = new Group();
    shoulder.position.set(side * 0.25, 0.58, 0.055);
    ellipsoid(shoulder, armMaterial, side * 0.055, -0.042, 0.055, 0.088, 0.075, 0.11);
    model.add(shoulder);
    return shoulder;
  }

  const left = createArm(-1);
  const right = createArm(1);
  const grip = new Group();
  grip.name = 'grip';
  grip.position.set(0.055, -0.045, 0.15);
  right.add(grip);
  let time = 0;
  let tailX = 0;
  let tailZ = 0;

  function reset() {
    time = 0;
    tailX = 0;
    tailZ = 0;
  }

  function update(dt, { localX, localZ, rise, squash, pose, heldKind, holding, swing }) {
    time += dt;
    const blend = 1 - Math.exp(-10 * dt);
    const stretch = Math.max(-0.04, Math.min(0.09, rise * 0.018));
    const reclined = pose === 'recline';
    model.position.y = 0.085 + Math.sin(time * TAU / CYCLE) * 0.04;
    model.scale.set(1 + squash * 0.55, 1 + stretch - squash, 1 + squash * 0.55);
    model.rotation.set(reclined ? -1.2 : localZ * 0.028, 0, -localX * 0.028 + (pose === 'look' ? 0.12 : 0));

    tailX += (-localX * 0.033 - tailX) * blend;
    tailZ += (-localZ * 0.033 - tailZ) * blend;
    for (let i = 0; i < positions.count; i++) {
      const offset = i * 3;
      const weight = Math.max(0, 1 - rest[offset + 1] / 0.5) ** 2;
      positions.setXYZ(i, rest[offset] + tailX * weight, rest[offset + 1], rest[offset + 2] + tailZ * weight);
    }
    positions.needsUpdate = true;

    const reaching = pose === 'carry' || pose === 'interact' || (holding && heldKind !== 'sword');
    const carry = reaching || holding;
    left.rotation.y = reaching ? 0.52 : 0;
    left.rotation.x = reaching ? -0.32 : 0;
    right.rotation.set(carry ? -0.26 : 0, carry ? -0.5 : 0, carry ? -0.25 : 0);
    if (pose === 'stir') {
      right.rotation.x += Math.cos(time * 5) * 0.2;
      right.rotation.y = -0.7 + Math.sin(time * 5) * 0.25;
    }
    if (swing !== null) {
      right.rotation.set(-0.35 + swing * 0.28, -0.50 + swing, -0.25 - swing * 0.45);
    }
    const blink = Math.max(0.06, Math.min(1, Math.abs((time + 0.9) % 4.2 - 3.8) / 0.085));
    for (const eye of eyes) eye.scale.y = blink;
  }

  return {
    model, grip, reset, update,
    dispose() {
      geometry.dispose();
      sphere.dispose();
      bodyMaterial.dispose();
      armMaterial.dispose();
      faceMaterial.dispose();
      glintMaterial.dispose();
    },
  };
}
