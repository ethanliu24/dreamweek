import {
  BackSide, Box3, BoxGeometry, BufferGeometry, Color, CylinderGeometry, DirectionalLight, DoubleSide,
  ExtrudeGeometry, Float32BufferAttribute, Fog, Group, HemisphereLight, Mesh, MeshStandardMaterial,
  PlaneGeometry, Scene, ShaderMaterial, Shape, SphereGeometry, TorusGeometry, Vector3,
} from 'three';

const ISLAND_X = 9;
const ISLAND_Z = 7;
const EDGE_INSET = 0.6;
const COTTAGE = new Vector3(-3.7, 0, -3.7);
const HAMMOCK = new Vector3(3.6, 0, -1.35);
const HEARTH = new Vector3(-0.15, 0, 0.05);
const WAKE = new Vector3(0.65, 0, 4.1);

function outline(angle) {
  return 1 + 0.055 * Math.sin(3 * angle + 0.4) + 0.035 * Math.cos(5 * angle);
}

export function floorHeight(x, z) {
  const hill = Math.max(0, 1 - (x / 7) ** 2 - (z / 5.6) ** 2);
  return 0.24 * hill ** 2;
}

export function keepInsideIsland(position) {
  const angle = Math.atan2(position.z / ISLAND_Z, position.x / ISLAND_X);
  const radius = Math.hypot(position.x / ISLAND_X, position.z / ISLAND_Z);
  const edge = outline(angle) - EDGE_INSET / ISLAND_Z;
  if (radius <= edge) return;
  const previousFloor = floorHeight(position.x, position.z);
  position.x *= edge / radius;
  position.z *= edge / radius;
  position.y += floorHeight(position.x, position.z) - previousFloor;
}

function material(color, options) {
  return new MeshStandardMaterial({ color, roughness: 0.85, ...options });
}

function mesh(parent, geometry, surface, x = 0, y = 0, z = 0) {
  const object = new Mesh(geometry, surface);
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

function anchor(parent, point) {
  const group = new Group();
  group.position.copy(point);
  group.position.y = floorHeight(point.x, point.z);
  parent.add(group);
  return group;
}

function createIsland(scene) {
  const segments = 64;
  const rings = [
    { radius: 0.52, drop: 0 },
    { radius: 1, drop: 0 },
    { radius: 1.025, drop: 0.52 },
    { radius: 0.54, drop: 3.05 },
  ];
  const positions = [0, floorHeight(0, 0), 0];
  const indices = [];
  for (const { radius, drop } of rings) {
    for (let i = 0; i < segments; i++) {
      const angle = i * Math.PI * 2 / segments;
      const r = radius * outline(angle);
      const x = Math.cos(angle) * r * ISLAND_X;
      const z = Math.sin(angle) * r * ISLAND_Z;
      positions.push(x, floorHeight(x, z) - drop * (1 + 0.15 * Math.cos(3 * angle)), z);
    }
  }

  for (let i = 0; i < segments; i++) indices.push(0, 1 + (i + 1) % segments, 1 + i);
  for (let ring = 0; ring < rings.length - 1; ring++) {
    const inner = 1 + ring * segments;
    const outer = inner + segments;
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      indices.push(inner + i, inner + next, outer + i, inner + next, outer + next, outer + i);
    }
  }
  const bottom = positions.length / 3;
  positions.push(-0.55, -4.45, 0.3);
  const lastRing = bottom - segments;
  for (let i = 0; i < segments; i++) indices.push(lastRing + i, lastRing + (i + 1) % segments, bottom);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const topCount = segments * 9;
  geometry.addGroup(0, topCount, 0);
  geometry.addGroup(topCount, segments * 6, 1);
  geometry.addGroup(topCount + segments * 6, indices.length - topCount - segments * 6, 2);
  mesh(scene, geometry, [material(0x538d78), material(0x466e64), material(0x505774)]);
}

function createSky(scene) {
  mesh(scene, new SphereGeometry(110, 32, 20), new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    uniforms: {
      zenith: { value: new Color(0x367dd1) },
      horizon: { value: new Color(0x9bcfea) },
      pink: { value: new Color(0xeab0ce) },
      mauve: { value: new Color(0xa66bad) },
    },
    vertexShader: `
      varying vec3 skyPoint;
      void main() {
        skyPoint = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 zenith, horizon, pink, mauve;
      varying vec3 skyPoint;
      void main() {
        vec3 direction = normalize(skyPoint);
        vec3 color = mix(horizon, zenith, smoothstep(-0.1, 0.54, direction.y));
        float warmSide = smoothstep(0.25, 0.94, dot(direction, normalize(vec3(1.0, 0.0, -0.35))));
        float band = 1.0 - smoothstep(0.0, 0.52, abs(direction.y + 0.04));
        color = mix(color, mix(pink, mauve, smoothstep(-0.16, 0.35, direction.y)), 0.68 * warmSide * band);
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
  })).renderOrder = -1;

  scene.fog = new Fog(0xb5d6ed, 22, 91);
  mesh(scene, new CylinderGeometry(86, 86, 1, 48), material(0xa2c6e4), 0, -12, 0);
  const puff = new SphereGeometry(1, 20, 12);
  const surfaces = [material(0xe0effa), material(0xd8daf5), material(0xf0deed)];
  const banks = [
    [-13, -5.9, -10, 1.15], [13, -5.7, -11, 1.15], [0, -7.2, -16, 1.55],
    [-22, -5.1, -25, 1.85], [17, -4.9, -30, 2.2], [-2, -4.1, -39, 2.4],
    [17, -7, 4, 1.45], [-15, -6.2, 6, 1.25], [3, -7.2, 18, 1.6],
    [-25, -7.4, 20, 2.05], [26, -8, 23, 2.25], [38, -7.8, -14, 2.15],
  ];
  return banks.map(([x, y, z, size], index) => {
    const bank = new Group();
    bank.position.set(x, y, z);
    scene.add(bank);
    for (let i = 0; i < 4; i++) {
      const cloud = mesh(bank, puff, surfaces[index % surfaces.length],
        (i - 1.5) * 2.2 * size, Math.sin(i * 2.1 + index) * 0.4, Math.cos(i * 2.5) * size);
      cloud.scale.set(3.5 * size, (1.05 + 0.25 * Math.sin(i * 1.7)) * size, 2.2 * size);
    }
    return { bank, x };
  });
}

function createCottage(scene) {
  const cottage = anchor(scene, COTTAGE);
  const siding = material(0x71a9ce);
  const trim = material(0xb0d4df);
  const roof = material(0x385783);
  const wood = material(0x76504a);
  mesh(cottage, new BoxGeometry(4, 2.14, 2.8), siding, 0, 1.05);
  const gable = new Shape();
  gable.moveTo(-2.25, 2.06);
  gable.quadraticCurveTo(-1.1, 2.73, 0, 3.6);
  gable.quadraticCurveTo(1.1, 2.73, 2.25, 2.06);
  gable.closePath();
  mesh(cottage, new ExtrudeGeometry(gable, {
    depth: 3.12, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.1, bevelSegments: 2,
  }), roof, 0, 0, -1.56);
  mesh(cottage, new BoxGeometry(0.42, 1, 0.42), roof, -1.03, 2.92, -0.75);

  const door = new Shape();
  door.moveTo(-0.42, 0);
  door.lineTo(0.42, 0);
  door.lineTo(0.42, 1.02);
  door.absarc(0, 1.02, 0.42, 0, Math.PI, false);
  door.closePath();
  const doorGeometry = new ExtrudeGeometry(door, { depth: 0.035, bevelEnabled: false });
  mesh(cottage, doorGeometry, trim, 0, 0.05, 1.42).scale.set(1.2, 1.09, 1);
  mesh(cottage, doorGeometry, wood, 0, 0.075, 1.445);
  mesh(cottage, new BoxGeometry(1.38, 0.17, 0.53), material(0x70758c), 0, 0.09, 1.55);

  const amber = material(0xffc675, { emissive: 0xf2a34f, emissiveIntensity: 0.32 });
  for (const x of [-1.28, 1.28]) {
    mesh(cottage, new BoxGeometry(0.77, 0.77, 0.1), trim, x, 1.32, 1.42);
    mesh(cottage, new BoxGeometry(0.61, 0.61, 0.04), amber, x, 1.32, 1.485);
    mesh(cottage, new BoxGeometry(0.045, 0.61, 0.04), trim, x, 1.32, 1.52);
    mesh(cottage, new BoxGeometry(0.61, 0.045, 0.04), trim, x, 1.32, 1.52);
    mesh(cottage, new BoxGeometry(0.91, 0.095, 0.24), trim, x, 0.94, 1.49);
  }

  const bush = new SphereGeometry(1, 16, 10);
  const leaves = material(0x487962);
  for (const [x, z, size] of [[-2.23, 1.35, 0.53], [2.13, 1.25, 0.45], [2.35, 0.97, 0.32]]) {
    mesh(cottage, bush, leaves, x, size * 0.44, z).scale.set(size, size * 0.78, size);
  }
  const { x, y, z } = cottage.position;
  return new Box3(new Vector3(x - 2.25, y - 0.2, z - 1.65),
    new Vector3(x + 2.25, y + 3.7, z + 1.7));
}

function createHammock(scene) {
  const hammock = anchor(scene, HAMMOCK);
  const post = new CylinderGeometry(0.07, 0.11, 1.78, 12);
  const cord = new CylinderGeometry(0.018, 0.018, 1, 8);
  const wood = material(0x6d5352);
  const rope = material(0xc4a98d);
  const up = new Vector3(0, 1, 0);
  for (const side of [-1, 1]) {
    const x = side * 1.43;
    mesh(hammock, post, wood, x, 0.86);
    for (const z of [-0.09, 0.09]) {
      const top = new Vector3(x, 1.59, 0);
      const end = new Vector3(side * 1.1, 1.3, z);
      const span = top.clone().sub(end);
      const tie = mesh(hammock, cord, rope);
      tie.position.copy(top).lerp(end, 0.5);
      tie.scale.y = span.length();
      tie.quaternion.setFromUnitVectors(up, span.normalize());
    }
  }
  const cloth = new PlaneGeometry(2.2, 1, 24, 10);
  const positions = cloth.attributes.position;
  const flat = positions.array.slice();
  mesh(hammock, cloth, material(0xe2ad82, { side: DoubleSide }));
  function setSag(weight) {
    for (let i = 0; i < positions.count; i++) {
      const x = flat[i * 3];
      const across = flat[i * 3 + 1] * 2;
      const sag = 1 - (x / 1.1) ** 2;
      positions.setXYZ(i, x,
        1.3 - sag * (0.54 + 0.16 * weight - 0.14 * across ** 2),
        -across * (0.09 + 0.38 * sag));
    }
    positions.needsUpdate = true;
    cloth.computeVertexNormals();
  }
  setSag(0);
  return { point: hammock.position, setSag };
}

function createHearth(scene) {
  const hearth = anchor(scene, HEARTH);
  hearth.name = 'Hearth';
  const stone = new SphereGeometry(1, 12, 8);
  const rock = material(0x717786);
  const earth = material(0x4d514f);
  const iron = material(0x424654, { metalness: 0.55, roughness: 0.65 });
  mesh(hearth, new CylinderGeometry(0.98, 0.98, 0.12, 32), earth, 0, 0.05);
  for (let i = 0; i < 11; i++) {
    const angle = i * Math.PI * 2 / 11;
    const block = mesh(hearth, stone, rock, 0.95 * Math.cos(angle), 0.13, 0.95 * Math.sin(angle));
    block.scale.set(0.18, 0.16 + 0.035 * Math.cos(i * 2), 0.28);
    block.rotation.y = -angle;
  }
  const trivet = mesh(hearth, new TorusGeometry(0.49, 0.047, 8, 28), iron, 0, 0.59);
  trivet.rotation.x = -Math.PI / 2;
  const leg = new CylinderGeometry(0.036, 0.052, 0.55, 8);
  for (let i = 0; i < 3; i++) {
    const angle = i * Math.PI * 2 / 3;
    mesh(hearth, leg, iron, 0.48 * Math.cos(angle), 0.33, 0.48 * Math.sin(angle));
  }
  return hearth;
}

export function createScenery() {
  const scene = new Scene();
  scene.name = 'Overworld';
  const key = new DirectionalLight(0xffe8ce, 2.2);
  key.position.set(3, 6, 5);
  scene.add(new HemisphereLight(0xc4e2ff, 0x797198, 1.65), key);
  const clouds = createSky(scene);
  createIsland(scene);
  const cottageBounds = createCottage(scene);
  const hammock = createHammock(scene);
  const hearth = createHearth(scene);
  const wake = WAKE.clone().setY(floorHeight(WAKE.x, WAKE.z));
  return {
    scene, cottageBounds, hammock, hearth, wake,
    driftClouds(elapsed) {
      for (const [index, { bank, x }] of clouds.entries()) {
        bank.position.x = x + Math.sin(elapsed * 0.13 + index) * 0.7;
      }
    },
  };
}
