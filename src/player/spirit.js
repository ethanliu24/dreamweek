
import {
  Color, DynamicDrawUsage, Float32BufferAttribute, Group, LatheGeometry, Mesh, MeshPhysicalMaterial,
  MeshStandardMaterial, SphereGeometry, Vector2, Vector3, QuadraticBezierCurve3, TubeGeometry,
} from 'three';

const PROFILE = [
  // Begin inside the folded lip, roll outward, then rise into the dome.
  [0.22, 0.13], [0.25, 0.08], [0.28, 0.067], [0.296, 0.08],
  [0.30, 0.12], [0.292, 0.18], [0.29, 0.26], [0.30, 0.36],
  [0.32, 0.47], [0.325, 0.57], [0.322, 0.68], [0.312, 0.77],
  [0.29, 0.84], [0.25, 0.90], [0.19, 0.95], [0.115, 0.985], [0, 1],
];
const STYLE = {
  hemOpacity: 0.58,   // The crown stays milky as the lower veil fades.
  foldDepth: 0.15,    // Radial displacement as a fraction of skirt radius.
  rippleHeight: 0.065, // Vertical displacement in world units.
  rippleSpeed: 1.6,   // Radians per second.
  glow: 0.15,         // Soft blue emission independent of scene lighting.
};
const CYCLE = 2.4;
const TAU = 2 * Math.PI;

export function createSpirit() {
  const model = new Group();
  const geometry = new LatheGeometry(PROFILE.map(([radius, y]) => new Vector2(radius, y)), 40);
  const positions = geometry.attributes.position.setUsage(DynamicDrawUsage);
  const underside = new Color(0xb1c9ff);
  const milk = new Color(0xe8f4f5);
  const color = new Color();
  const colors = new Float32Array(positions.count * 4);

  const angles = new Float32Array(positions.count);
  const weights = new Float32Array(positions.count);
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    angles[i] = Math.atan2(z, x);
    weights[i] = (1 - Math.min(1, y / 0.65)) ** 1.4;
    positions.setZ(i, z * 0.92);
    color.copy(underside).lerp(milk, Math.min(1, y / 0.65)).toArray(colors, 4 * i);
    colors[4 * i + 3] = 1 - (1 - STYLE.hemOpacity) * weights[i];
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 4));
  const rest = positions.array.slice();
  const bodyMaterial = new MeshPhysicalMaterial({
    vertexColors: true,
    transparent: true,
    emissive: 0x9db9f1,
    emissiveIntensity: STYLE.glow,
    roughness: 0.33,
    iridescence: 0.16,
    sheen: 0.35,
    sheenColor: 0xb9d5f0,
    sheenRoughness: 0.6,
  });
  const body = new Mesh(geometry, bodyMaterial);
  model.add(body);

  const sphere = new SphereGeometry(1, 16, 12);
  const faceMaterial = new MeshStandardMaterial({ color: 0x273747, roughness: 0.5 });
  const glintMaterial = new MeshStandardMaterial({ color: 0xffffff, emissive: 0x526772 });
  const armMaterial = new MeshStandardMaterial({
    color: 0xd7e9ef,
    roughness: 0.53,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });

  function ellipsoid(parent, material, x, y, z, sx, sy, sz) {
    const mesh = new Mesh(sphere, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    parent.add(mesh);
    return mesh;
  }

  ellipsoid(model, armMaterial, 0, 0.49, 0, 0.225, 0.39, 0.20);
  const blush = new MeshStandardMaterial({ color: 0xe8bfd3, roughness: 0.75 });
  const eyes = [-0.112, 0.112].map(x => {
    const eye = new Group();
    eye.position.set(x, 0.69, 0.277);
    eye.rotation.y = x * 2.6;
    model.add(eye);
    ellipsoid(eye, faceMaterial, 0, 0, 0, 0.040, 0.059, 0.021);
    ellipsoid(eye, glintMaterial, -0.007, 0.020, 0.020, 0.012, 0.014, 0.003);
    return eye;
  });
  const mouth = new TubeGeometry(new QuadraticBezierCurve3(
    new Vector3(-0.029, 0.606, 0.298),
    new Vector3(0, 0.604, 0.304),
    new Vector3(0.029, 0.606, 0.298),
  ), 10, 0.004, 6, false);
  model.add(new Mesh(mouth, faceMaterial));

  const armHeight = 0.54;
  function createArm(side) {
    const arm = new Group();
    arm.position.set(side * 0.3, armHeight, 0.29);
    ellipsoid(arm, armMaterial, 0, 0, 0, 0.05, 0.05, 0.05);
    model.add(arm);
    return arm;
  }

  const left = createArm(-1);
  const right = createArm(1);
  const restingHand = right.position.clone();
  const grip = new Group();
  grip.name = 'grip';
  grip.position.set(0, 0, 0.078);
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
      const weight = weights[i];
      const angle = angles[i];
      const phase = time * STYLE.rippleSpeed;
      const wave = Math.sin(4 * angle + 0.6 * Math.sin(phase) + rest[offset + 1] * 3);
      const fold = 1 + STYLE.foldDepth * weight * wave;
      const lift = STYLE.rippleHeight * weight * (wave + 0.3 * Math.sin(2 * angle - phase));
      positions.setXYZ(i, rest[offset] * fold + tailX * weight,
        rest[offset + 1] + lift, rest[offset + 2] * fold + tailZ * weight);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    // A lathe duplicates its UV seam. Match its normals as the folds move.
    const normals = geometry.attributes.normal;
    for (let i = 0; i < PROFILE.length; i++) {
      const end = normals.count - PROFILE.length + i;
      const nx = normals.getX(i) + normals.getX(end);
      const ny = normals.getY(i) + normals.getY(end);
      const nz = normals.getZ(i) + normals.getZ(end);
      const length = Math.hypot(nx, ny, nz) || 1;
      normals.setXYZ(i, nx / length, ny / length, nz / length);
      normals.setXYZ(end, nx / length, ny / length, nz / length);
    }

    const reaching = pose === 'carry' || pose === 'interact' || (holding && heldKind !== 'sword');
    const carry = reaching || holding;
    const armBob = Math.sin(time * TAU / CYCLE) * 0.018;
    left.position.y = armHeight + armBob;
    right.position.copy(restingHand);
    right.position.y -= armBob;
    left.rotation.y = reaching ? 0.52 : 0;
    left.rotation.x = reaching ? -0.32 : 0;
    right.rotation.set(carry ? -0.26 : 0, carry ? -0.5 : 0, carry ? -0.25 : 0);
    if (pose === 'stir') {
      right.rotation.x += Math.cos(time * 5) * 0.2;
      right.rotation.y = -0.7 + Math.sin(time * 5) * 0.25;
    }
    if (heldKind === 'sword') {
      const arc = swing ?? 0;
      const reach = Math.max(0, -arc);
      right.position.x += arc * 0.10;
      right.position.z += 0.12 + reach * 0.17;
      // Pitch the blade forward before sweeping it across the front of the veil.
      right.rotation.set(0.65 + reach * 0.46, arc * 0.63, -0.18, 'YXZ');
    } else {
      right.rotation.order = 'XYZ';
    }
    const blink = Math.max(0.06, Math.min(1, Math.abs((time + 0.9) % 4.2 - 3.8) / 0.085));
    for (const eye of eyes) eye.scale.y = blink;
  }

  return {
    model, grip, reset, update,
    dispose() {
      geometry.dispose();
      sphere.dispose();
      mouth.dispose();
      blush.dispose();
      bodyMaterial.dispose();
      armMaterial.dispose();
      faceMaterial.dispose();
      glintMaterial.dispose();
    },
  };
}
