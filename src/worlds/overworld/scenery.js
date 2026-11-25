import {
  Box3, BoxGeometry, BufferGeometry, Color, CylinderGeometry, DirectionalLight, DoubleSide,
  ExtrudeGeometry, Float32BufferAttribute, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PlaneGeometry, Scene, Shape, SphereGeometry, TorusGeometry, Vector3,
} from 'three';

import { createAtmosphere } from './atmosphere.js';
import { batch, dressCottage, plantGarden } from './garden.js';
import { contactTexture, wovenTexture } from './surfaces.js';

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
    ...Array.from({ length: 12 }, (_, i) => ({ radius: (i + 1) / 12, drop: 0 })),
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
  const colors = [];
  const seafoam = new Color(0x68ab99);
  const mint = new Color(0x96c19c);
  const tint = new Color();
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], z = positions[i + 2];
    const pigment = 0.5 + 0.25 * Math.sin(x * 0.87 + z * 0.33) + 0.25 * Math.cos(z * 0.86 - x * 0.12);
    tint.copy(seafoam).lerp(mint, pigment);
    colors.push(tint.r, tint.g, tint.b);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const topCount = segments * (3 + (rings.length - 3) * 6);
  geometry.addGroup(0, topCount, 0);
  geometry.addGroup(topCount, segments * 6, 1);
  geometry.addGroup(topCount + segments * 6, indices.length - topCount - segments * 6, 2);
  mesh(scene, geometry, [material(0xffffff, { vertexColors: true }), material(0x7fa9a1), material(0x8587a1)]).receiveShadow = true;
}

function createCottage(scene) {
  const cottage = anchor(scene, COTTAGE);
  const siding = material(0x71abc0);
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
  dressCottage(cottage);
  cottage.traverse(part => {
    if (part.isMesh) part.castShadow = part.receiveShadow = true;
  });
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
  const wrap = batch(hammock, new TorusGeometry(0.089, 0.014, 6, 12), 16);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) wrap(side * 1.43, 1.46 + i * 0.028, 0, 1, 1, 1, 0xe4c7a2, Math.PI / 2 + side * 0.045);
  }
  const cloth = new PlaneGeometry(2.2, 1, 24, 10);
  const positions = cloth.attributes.position;
  const flat = positions.array.slice();
  mesh(hammock, cloth, material(0xffffff, { map: wovenTexture(), side: DoubleSide }));
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
  const key = new DirectionalLight(0xffe1c9, 2.0);
  key.position.set(8, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 10, bottom: -10, near: 0.5, far: 32 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.normalBias = 0.025;
  key.shadow.intensity = 0.4;
  // The large casters stay put. One bake per island visit keeps their shadows off the frame budget.
  key.shadow.autoUpdate = false;
  key.shadow.needsUpdate = true;
  scene.add(new HemisphereLight(0xd3ddff, 0xe8c4d5, 1.65), key);
  const driftSky = createAtmosphere(scene);
  createIsland(scene);
  const cottageBounds = createCottage(scene);
  const hammock = createHammock(scene);
  const hearth = createHearth(scene);
  const driftMotes = plantGarden(scene, floorHeight, outline);
  const contact = mesh(scene, new PlaneGeometry(1.1, 0.75), new MeshBasicMaterial({
    map: contactTexture(), transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  }));
  contact.rotation.x = -Math.PI / 2;
  const wake = WAKE.clone().setY(floorHeight(WAKE.x, WAKE.z));
  return {
    scene, cottageBounds, hammock, hearth, wake,
    animate(elapsed, playerPosition) {
      const ground = floorHeight(playerPosition.x, playerPosition.z);
      contact.position.set(playerPosition.x, ground + 0.012, playerPosition.z);
      contact.material.opacity = Math.max(0.14, 0.66 - (playerPosition.y - ground) * 0.45);
      driftMotes(elapsed, playerPosition);
      driftSky(elapsed);
    },
  };
}
