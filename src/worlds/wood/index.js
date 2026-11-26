import {
  BoxGeometry, BufferGeometry, CylinderGeometry, DirectionalLight, DoubleSide, Float32BufferAttribute,
  Fog, Group, HemisphereLight, MathUtils, Mesh, MeshStandardMaterial, PointLight, Scene, SphereGeometry, Vector3,
} from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { createCandle } from '../../shared/props/candle.js';
import { createReturnRing } from '../../shared/props/return-ring.js';
import { canReturn } from '../../state/progress.js';
import { IGNITION, INTRO, OFFER, PLAYER_REPLY, REQUEST, THANKS } from './lines.js';
import { createMallow } from './mallow.js';

const ARRIVAL = new Vector3(0, 0, 4.7);
const WALK_BOUNDS = { minX: -20, maxX: 20, minZ: -20, maxZ: 20 };

function dressClearing(scene) {
  const sphere = new SphereGeometry(1, 20, 14);
  const box = new BoxGeometry();
  const standard = color => new MeshStandardMaterial({ color });
  const bark = standard(0x594436);
  bark.side = DoubleSide;
  const moss = standard(0x607256);
  const leaves = [standard(0x314c36), standard(0x456043), standard(0x536c44)];
  const stone = standard(0x787a65);
  const logSide = standard(0x67452e);
  const cutWood = standard(0xc99a65);

  function mesh(parent, geometry, material, position, scale) {
    const part = new Mesh(geometry, material);
    part.position.set(...position);
    part.scale.set(...scale);
    parent.add(part);
    return part;
  }

  scene.fog = new Fog(0x395446, 8, 26);
  scene.background = scene.fog.color;
  scene.add(new HemisphereLight(0xe4ead7, 0x685847, 2.1));
  const key = new DirectionalLight(0xffd59f, 2.2);
  key.position.set(-3, 7, 5);
  scene.add(key);
  mesh(scene, box, moss, [0, -0.13, 0], [52, 0.26, 52]);

  const tree = new Group();
  tree.position.z = -5.65;
  scene.add(tree);
  const vertices = [];
  const indices = [];
  const segments = 48;
  for (let i = 0; i <= segments; i++) {
    const angle = i * Math.PI * 2 / segments;
    const radius = 1.94 + 0.14 * Math.cos(angle * 5);
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    // Raise the base along the front arc to cut the hollow out of the trunk.
    const arch = z > 0 ? 1.45 * Math.sqrt(Math.max(0, 1 - (x / 0.95) ** 2)) : 0;
    vertices.push(x, arch, z, x * 0.84 + 0.12, 3.2, z * 0.79, x * 0.64 + 0.42, 10.8, z * 0.63);
    if (!i) continue;
    for (let row = 0; row < 2; row++) {
      const a = (i - 1) * 3 + row;
      indices.push(a, a + 3, a + 1, a + 3, a + 4, a + 1);
    }
  }
  const trunk = new BufferGeometry();
  trunk.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  trunk.setIndex(indices);
  trunk.computeVertexNormals();
  mesh(tree, trunk, bark, [0, 0, 0], [1, 1, 1]);
  const innerBark = standard(0x30261e);
  const lining = new BufferGeometry();
  const liningVertices = [];
  const liningIndices = [];
  for (let i = 0; i <= 16; i++) {
    const angle = i * Math.PI / 16;
    const x = Math.cos(angle) * 0.95;
    const z = 1.93 - x * x * 0.38;
    const y = Math.sin(angle) * 1.46;
    liningVertices.push(x, y, z, x * 0.83, y * 0.87, 0.72);
    if (i) {
      const first = (i - 1) * 2;
      liningIndices.push(first, first + 2, first + 1, first + 2, first + 3, first + 1);
    }
  }
  lining.setAttribute('position', new Float32BufferAttribute(liningVertices, 3));
  lining.setIndex(liningIndices);
  lining.computeVertexNormals();
  innerBark.side = DoubleSide;
  mesh(tree, lining, innerBark, [0, 0, 0], [1, 1, 1]);
  mesh(tree, box, innerBark, [0, 0.63, 0.64], [1.8, 1.3, 0.14]);

  for (const [x, z, yaw] of [[-1.65, 1.32, -0.7], [1.57, 1.38, 0.68], [1.83, -0.59, 1.25]]) {
    const root = mesh(tree, sphere, bark, [x, 0.04, z], [0.62, 0.45, 1.85]);
    root.rotation.set(0.13, yaw, 0);
  }
  for (const [i, [x, y, z]] of [[0, 9.6, 0], [-2.6, 8.1, 0.6], [2.9, 8.6, -0.6], [0, 7.5, 2.4]].entries()) {
    mesh(tree, sphere, leaves[i % 3], [x, y, z], [3.6, 2.35, 3.25]);
  }

  const smallTrunk = new CylinderGeometry(0.67, 1, 1, 12);
  for (const [i, [x, z]] of [[-4.4, 3], [4.9, 2.15], [-5.4, -2], [5.6, -3.4],
    [-5.4, -8.5], [5.7, -8.6], [-8.2, -4], [8.5, -5.3], [-3.5, -12], [2.6, -12]].entries()) {
    const height = 5.6 + (i % 3) * 0.85;
    mesh(scene, smallTrunk, bark, [x, height / 2, z], [0.49, height, 0.48]).rotation.z = (i % 3 - 1) * 0.06;
    mesh(scene, sphere, leaves[i % 3], [x, height, z], [2.85, 1.8, 2.95]);
    if (i > 1) mesh(scene, sphere, leaves[(i + 1) % 3], [x, 0.2, z + 0.55], [1.3, 0.55, 0.76]);
  }

  const pit = new Group();
  pit.position.set(1.18, 0, -1.65);
  scene.add(pit);
  const log = new CylinderGeometry(0.08, 0.08, 0.69, 10);
  const logMaterial = [logSide, cutWood, cutWood];
  const fire = new Group();
  pit.add(fire);
  for (let i = 0; i < 9; i++) {
    const angle = i / 9 * Math.PI * 2;
    mesh(pit, sphere, stone, [0.49 * Math.cos(angle), 0.06, 0.43 * Math.sin(angle)], [0.16, 0.10, 0.136]);
  }
  for (let i = 0; i < 3; i++) {
    mesh(pit, log, logMaterial, [0, 0.105 + i * 0.058, 0], [1, 1, 1]).rotation.set(Math.PI / 2, 0, i * 1.04);
  }

  const gift = new Group();
  gift.position.set(-1.95, 0.075, -1.4);
  gift.rotation.y = -0.3;
  scene.add(gift);
  for (const [x, y] of [[-0.083, 0], [0.083, 0], [0, 0.126]]) {
    mesh(gift, log, logMaterial, [x, y, 0], [0.94, 0.8, 0.94]).rotation.x = Math.PI / 2;
  }
  mesh(gift, box, standard(0xa98860), [0, 0.06, 0], [0.34, 0.29, 0.067]);

  const ember = new MeshStandardMaterial({ color: 0xf69249, emissive: 0xf9531c, emissiveIntensity: 1.3 });
  const core = new MeshStandardMaterial({ color: 0xffd887, emissive: 0xf89c40, emissiveIntensity: 1.4 });
  const flames = [ember, core, ember].map((material, i) =>
    mesh(fire, sphere, material, [(i - 1) * 0.12, 0.27, 0], [0.11, 0.24, 0.1]));
  const glow = new PointLight(0xff964e, 0, 4.5);
  glow.position.y = 0.65;
  pit.add(glow);

  const candle = createCandle();
  candle.scale.setScalar(0.72);
  candle.visible = false;
  pit.add(candle);
  mesh(candle, sphere, core, [0, 0.24, 0], [0.028, 0.053, 0.028]);

  return {
    pit: pit.position,
    gift,
    animate(time, burn) {
      const growth = MathUtils.smoothstep(burn, 0.15, 0.75);
      fire.visible = burn > 0.15;
      fire.scale.setScalar(growth);
      glow.intensity = growth * (3.2 + Math.sin(time * 12) * 0.37);
      flames.forEach((flame, i) => {
        flame.scale.y = 0.235 + Math.sin(time * 13 + i * 2) * 0.053;
        flame.rotation.z = (i - 1) * 0.24 + Math.sin(time * 8 + i) * 0.12;
      });
      candle.visible = burn > 0 && burn < 0.72;
      if (candle.visible) candle.position.set(0.53 - burn * 0.57, 0.29 - burn * 0.15, 0.12);
    },
  };
}

export function createWorld({ player, camera, controls, interactions, ui, signal, progress, travel }) {
  const scene = new Scene();
  scene.name = 'Wood';
  const clearing = dressClearing(scene);
  const mallow = createMallow();
  mallow.root.position.set(-1.04, 0, -1.17);
  const ring = createReturnRing(ARRIVAL);
  scene.add(mallow.root, ring);
  const finished = () => canReturn('wood', progress.read());
  const hasCandle = () => progress.read().completed.includes('fire');
  const unregister = [];
  let phase = 'arrival';
  let releaseOpening;
  let releaseIgnition;
  let openingTime = 0;
  let burn = 0;

  const say = lines => ui.say({ speaker: 'Mallow', lines }, signal);

  function showReturn() {
    phase = 'complete';
    clearing.gift.visible = false;
    ring.material.color.setHex(0xffdf61);
    ui.objective('Return through the yellow ring', ring.position);
  }

  async function request() {
    mallow.face(player.position);
    phase = 'request';
    const release = controls.acquire('story');
    camera.shot({ eye: new Vector3(1.85, 1.43, 1.92), lookAt: new Vector3(-0.12, 0.46, -1.33) });
    try {
      await say(REQUEST);
      phase = 'ready';
      ui.objective('Light the prepared fire with Wick’s Candle', clearing.pit);
    } finally {
      camera.releaseShot();
      release();
    }
  }

  function light() {
    phase = 'lighting';
    burn = 0.01;
    releaseIgnition = controls.acquire('story');
    camera.shot({ eye: new Vector3(2.62, 1.4, 0.78), lookAt: new Vector3(0.35, 0.42, -1.48) });
  }

  async function reactToFire() {
    phase = 'reacting';
    try {
      await say(IGNITION);
      phase = 'lit';
      ui.objective('Speak to Mallow again', mallow.root.position);
    } catch (error) {
      if (!signal.aborted) console.error('Mallow ignition dialogue failed', error);
    } finally {
      camera.releaseShot();
      releaseIgnition?.();
      releaseIgnition = undefined;
    }
  }

  async function thank() {
    phase = 'thanks';
    mallow.face(player.position);
    const release = controls.acquire('story');
    camera.shot({ eye: new Vector3(0.2, 1.31, 1.62), lookAt: new Vector3(-1.26, 0.51, -1.26) });
    try {
      await say(THANKS);
      await ui.say(PLAYER_REPLY, signal);
      phase = 'offer';
      await say(OFFER);
      if (progress.apply('helpMallow').changed) showReturn();
      else phase = 'lit';
    } finally {
      camera.releaseShot();
      release();
    }
  }

  return {
    scene,
    surfaces: { floorHeight: () => 0, walkBounds: WALK_BOUNDS, safeSpawn: ARRIVAL },
    prepare() {},
    enter() {
      player.teleport(ARRIVAL);
      player.root.rotation.set(0, Math.PI, 0);
      player.setPose('idle');
      camera.resetOrbit();
      scene.add(player.root);
      if (finished()) {
        burn = 1;
        showReturn();
      } else {
        ring.material.color.setHex(0xb99c58);
        ui.objective('Meet Mallow', mallow.root.position);
        releaseOpening = controls.acquire('story');
        camera.shot({ eye: new Vector3(2.2, 2.35, 6.6), lookAt: new Vector3(0, 1.75, -2.1) });
      }

      unregister.push(
        interactions.register({
          id: 'mallow', point: mallow.root.position, label: 'Talk to Mallow',
          enabled: () => phase === 'met' || phase === 'lit',
          run: () => phase === 'lit' ? thank() : request(),
        }),
        interactions.register({
          id: 'prepared-fire', point: clearing.pit, label: 'Use Wick’s Candle',
          enabled: () => phase === 'ready' && hasCandle(), run: light,
        }),
        interactions.register({
          id: 'return', point: ring.position, label: 'Return to the Overworld',
          enabled: finished, run: travel.returnHome,
        }),
      );
    },
    update(dt, { mode }) {
      if (releaseOpening) {
        openingTime += dt;
        if (openingTime > 1) {
          camera.releaseShot();
          releaseOpening();
          releaseOpening = undefined;
        }
      }
      if (burn > 0) burn = Math.min(1, burn + dt);
      if (phase === 'lighting' && burn >= 0.75) void reactToFire();
      if (mode === 'explore' && phase === 'arrival' && player.position.distanceToSquared(mallow.root.position) < 3.6) {
        phase = 'greeting';
        mallow.face(player.position);
        void say(INTRO).then(() => { phase = 'met'; }).catch(error => {
          if (!signal.aborted) console.error('Mallow greeting failed', error);
        });
      }
    },
    present(elapsed) {
      const pose = phase === 'request' || phase === 'greeting' ? 'shy'
        : phase === 'offer' ? 'offer' : burn >= 0.75 ? 'happy' : 'idle';
      mallow.animate(elapsed, pose);
      clearing.animate(elapsed, burn);
    },
    exit() {
      for (const remove of unregister) remove();
      releaseOpening?.();
      releaseIgnition?.();
      camera.releaseShot();
      player.root.removeFromParent();
    },
    dispose() { disposeScene(scene); },
  };
}
