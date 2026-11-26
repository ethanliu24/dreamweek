import {
  BoxGeometry, CatmullRomCurve3, ConeGeometry, CylinderGeometry, DirectionalLight, Fog, Group, HemisphereLight,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, Scene, SphereGeometry, TubeGeometry, Vector3,
} from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { createReturnRing } from '../../shared/props/return-ring.js';
import { createSword } from '../../shared/props/sword.js';
import { canReturn } from '../../state/progress.js';
import { createPipeBoard } from './board.js';
import { createClink } from './clink.js';
import { EXPLANATION, INTRO, REWARD } from './lines.js';

const ARRIVAL = new Vector3(0, 0, 5);
const BOARD_POINT = new Vector3(-3.5, 0, -3.85);
const CLINK_POINT = new Vector3(1.65, 0, -1.8);
const FORGE_POINT = new Vector3(3.7, 0, -4.28);
const SWORD_PEDESTAL = { x: 4.25, z: -2.28, halfX: 0.38, halfZ: 0.36, height: 0.62 };
const WALK_BOUNDS = { minX: -16, maxX: 16, minZ: -16, maxZ: 15 };
const OBSTACLES = [
  { x: CLINK_POINT.x, z: CLINK_POINT.z, halfX: 0.61, halfZ: 0.38, height: 0.8 },
  { x: FORGE_POINT.x, z: FORGE_POINT.z, halfX: 1.625, halfZ: 1.075, height: 2.7 },
  SWORD_PEDESTAL,
  { x: -1, z: -6.03, halfX: 8.5, halfZ: 0.375, height: 8.45 },
  { x: BOARD_POINT.x - 0.06, z: -5.64, halfX: 3.65, halfZ: 0.78, height: 6.25 },
];
const CELL_TIME = 0.065;
const CONDUIT_TIME = 0.8;

function keepOutside(position) {
  const playerRadius = 0.26;
  for (const { x, z, halfX, halfZ, height } of OBSTACLES) {
    if (position.y >= height) continue;
    const dx = position.x - x;
    const dz = position.z - z;
    const overlapX = halfX + playerRadius - Math.abs(dx);
    const overlapZ = halfZ + playerRadius - Math.abs(dz);
    if (overlapX <= 0 || overlapZ <= 0) continue;
    if (overlapX < overlapZ) position.x += dx < 0 ? -overlapX : overlapX;
    else position.z += dz < 0 ? -overlapZ : overlapZ;
  }
}

function dressCavern(scene, board) {
  scene.fog = new Fog(0x19202c, 12, 32);
  scene.background = scene.fog.color;
  scene.add(new HemisphereLight(0xdce9ff, 0x70617b, 1.95));
  const key = new DirectionalLight(0xffdfbc, 2.05);
  key.position.set(-3, 7, 5);
  scene.add(key);

  const stone = new MeshStandardMaterial({ color: 0x303746 });
  const rock = new MeshStandardMaterial({ color: 0x41495a });
  const copper = new MeshStandardMaterial({ color: 0x91634f, metalness: 0.39, roughness: 0.43 });
  const gold = new MeshStandardMaterial({
    color: 0xffd265, emissive: 0xffa92f, emissiveIntensity: 0.9, metalness: 0.22, roughness: 0.22,
  });
  const ember = new MeshStandardMaterial({ color: 0x3e3332, emissive: 0xff7631, emissiveIntensity: 0 });
  const box = new BoxGeometry();
  const chamber = new Group();
  scene.add(chamber);

  function mesh(geometry, material, position, scale = [1, 1, 1]) {
    const object = new Mesh(geometry, material);
    object.position.set(...position);
    object.scale.set(...scale);
    chamber.add(object);
    return object;
  }

  mesh(box, rock, [0, -0.13, -0.5], [46, 0.26, 46]);
  mesh(box, stone, [-1, 4.2, -6.03], [17, 8.5, 0.75]);
  mesh(box, rock, [-17, 3.8, -1], [0.6, 8, 34]);
  mesh(box, rock, [17, 3.7, -1], [0.6, 8, 34]);
  mesh(box, stone, [0, 3.7, -17], [34, 8, 0.6]);
  const stalactite = new ConeGeometry(0.51, 2.15, 7);
  for (const [i, x] of [-7.5, -5.9, -2.4, 0.7, 4.8, 6.2, 7.1].entries()) {
    const rib = mesh(stalactite, rock, [x, 6.8 + i % 2 * 0.6, -5.2 + i % 3 * 0.7], [1.3, 1.2, 1]);
    rib.rotation.z = Math.PI + i * 0.04;
  }

  const forge = FORGE_POINT;
  mesh(box, stone, [forge.x, 0.18, forge.z], [3.25, 0.36, 2.15]);
  mesh(box, rock, [forge.x, 0.52, forge.z], [2.65, 0.44, 1.78]);
  mesh(box, stone, [forge.x, 1.67, forge.z - 0.56], [2.49, 2.4, 0.6]);
  for (const side of [-1, 1]) mesh(box, rock, [forge.x + side * 1.03, 1.48, forge.z], [0.46, 1.78, 1.06]);
  mesh(box, stone, [forge.x, 2.42, forge.z], [2.62, 0.51, 1.29]);
  mesh(new CylinderGeometry(0.66, 0.49, 0.41, 24), copper, [forge.x, 0.97, forge.z + 0.23]);
  const surface = mesh(new CylinderGeometry(0.57, 0.57, 0.036, 28), ember, [forge.x, 1.18, forge.z + 0.23]);
  const fireLight = new PointLight(0xff9b53, 0, 6);
  fireLight.position.set(forge.x, 1.52, forge.z + 0.78);
  scene.add(fireLight);

  mesh(box, rock, [CLINK_POINT.x, 0.105, CLINK_POINT.z], [1.22, 0.21, 0.76]);
  const { x, z, halfX, halfZ, height } = SWORD_PEDESTAL;
  mesh(box, stone, [x, height / 2, z], [halfX * 2, height, halfZ * 2]);
  const sword = createSword();
  sword.position.set(x, height + 0.01, z);
  sword.rotation.z = -0.14;
  scene.add(sword);

  board.root.position.set(BOARD_POINT.x, 3.03, -5.07);
  board.root.rotation.y = 0.1;
  scene.add(board.root);
  const backing = mesh(box, rock, [BOARD_POINT.x - 0.06, 3.03, -5.64], [7.3, 6.45, 0.95]);
  backing.rotation.y = board.root.rotation.y;

  const outlet = board.outletPoint();
  const curve = new CatmullRomCurve3([
    outlet, outlet.clone().add(new Vector3(0.43, -0.02, 0.05)), new Vector3(1.4, 1.85, -5.2),
    new Vector3(2.68, 1.24, -4.37), new Vector3(forge.x - 0.48, 1.18, forge.z + 0.23),
  ]);
  const segments = 36;
  const sides = 10;
  mesh(new TubeGeometry(curve, segments, 0.14, sides), copper, [0, 0, 0]);
  const stripe = mesh(new TubeGeometry(curve, segments, 0.046, sides), gold, [0, 0, 0.145]);
  stripe.geometry.setDrawRange(0, 0);
  const mote = new SphereGeometry(0.03, 6, 4);
  const sparkle = new MeshBasicMaterial({ color: 0xffebae, toneMapped: false });
  const sparks = Array.from({ length: 5 }, () => mesh(mote, sparkle, [0, 0, 0]));
  let flowAmount = 0;

  return {
    sword,
    forge,
    flow(value) {
      flowAmount = value;
      stripe.geometry.setDrawRange(0, Math.floor(value * segments) * sides * 6);
    },
    animate(time, lit) {
      const flicker = lit ? 1 + 0.08 * Math.sin(time * 9) : 0;
      surface.material.emissiveIntensity = 1.5 * flicker;
      fireLight.intensity = 10 * flicker;
      gold.emissiveIntensity = 0.9 + Math.sin(time * 9) * 0.14;
      for (const [i, spark] of sparks.entries()) {
        const along = (time * 0.75 + i / sparks.length) % 1;
        spark.visible = along < flowAmount;
        if (!spark.visible) continue;
        curve.getPoint(along, spark.position);
        spark.position.y += 0.08 + (i % 3) * 0.045;
        spark.position.z += 0.17;
        spark.scale.setScalar(0.25 + 0.8 * Math.abs(Math.sin(time * 10 + i)));
      }
    },
  };
}

export function createWorld({ canvas, viewCamera, camera, controls, interactions, player, progress, signal, travel, ui }) {
  const scene = new Scene();
  scene.name = 'Metal';
  const board = createPipeBoard();
  const cavern = dressCavern(scene, board);
  const clink = createClink();
  clink.root.position.copy(CLINK_POINT).setY(0.21);
  const ring = createReturnRing(ARRIVAL);
  scene.add(clink.root, ring);

  const finished = () => canReturn('metal', progress.read());
  const say = lines => ui.say({ speaker: 'Clink', lines }, signal);
  const unregister = [];
  let phase = 'arrival';
  let releasePuzzle;
  let elapsed = 0;
  let previousAspect;
  let route;
  let shown = 0;
  let lit = false;

  function clinkShot() {
    camera.shot({
      eye: CLINK_POINT.clone().add(new Vector3(0.75, 1.26, 2.35)),
      lookAt: CLINK_POINT.clone().add(new Vector3(0, 0.56, 0)),
    });
  }

  function showReturn() {
    phase = 'complete';
    cavern.sword.visible = false;
    ring.material.color.setHex(0xffdf61);
    ui.objective('Return through the yellow ring', ring.position);
  }

  async function talk() {
    const reward = phase === 'repaired';
    const release = controls.acquire('story');
    phase = reward ? 'reward' : 'explaining';
    clinkShot();
    try {
      if (reward) {
        await say(REWARD);
        if (!progress.apply('earnSword').changed) {
          phase = 'repaired';
          return;
        }
        cavern.sword.visible = false;
        showReturn();
      } else {
        await say(EXPLANATION);
        phase = 'ready';
        ui.objective('Repair the pipe board', BOARD_POINT);
      }
    } finally {
      if (!signal.aborted) camera.releaseShot();
      release();
    }
  }

  function frameBoard(seconds) {
    previousAspect = viewCamera.aspect;
    camera.shot({ ...board.frame(viewCamera), seconds });
  }

  function startPuzzle() {
    phase = 'puzzle';
    elapsed = 0;
    releasePuzzle = controls.acquire('puzzle');
    player.root.visible = false;
    ui.objective('Click a pipe to rotate it');
    frameBoard(0.45);
  }

  function click(event) {
    if (phase !== 'puzzle' || elapsed < 0.45 || !board.rotateAtPointer(event, canvas, viewCamera)) return;
    route = board.connectedPath();
    if (!route) return;
    phase = 'flow';
    elapsed = 0;
    ui.objective('Watch the flow reach the forge');
  }

  function showFlow() {
    const count = Math.min(route.length, Math.floor(elapsed / CELL_TIME));
    if (shown !== count) {
      shown = count;
      board.setPowered(route.slice(0, count));
    }
    const outside = elapsed - route.length * CELL_TIME;
    if (outside <= 0) return;
    cavern.flow(MathUtils.clamp(outside / CONDUIT_TIME, 0, 1));
    if (outside < CONDUIT_TIME) return;
    phase = 'forge';
    elapsed = 0;
    lit = true;
    player.root.visible = true;
    camera.shot({
      eye: cavern.forge.clone().add(new Vector3(0.55, 1.95, 4.75)),
      lookAt: cavern.forge.clone().add(new Vector3(0, 1.34, 0.45)),
    });
  }

  return {
    scene,
    surfaces: {
      floorHeight: () => 0, safeSpawn: ARRIVAL,
      walkBounds: WALK_BOUNDS,
    },
    prepare() {},
    enter() {
      player.teleport(ARRIVAL);
      player.root.rotation.set(0, Math.PI, 0);
      player.setPose('idle');
      camera.resetOrbit();
      scene.add(player.root);
      if (finished()) {
        lit = true;
        cavern.flow(1);
        showReturn();
      } else {
        ring.material.color.setHex(0xb99c58);
      }
      canvas.addEventListener('click', click, { signal });
      unregister.push(
        interactions.register({
          id: 'clink', point: CLINK_POINT, label: 'Talk to Clink',
          enabled: () => phase === 'meet' || phase === 'repaired', run: talk,
        }),
        interactions.register({
          id: 'pipe-board', point: BOARD_POINT, label: 'Repair the pipes',
          enabled: () => phase === 'ready', run: startPuzzle,
        }),
        interactions.register({
          id: 'return', point: ring.position, label: 'Return to the Overworld',
          enabled: () => phase === 'complete' && finished(), run: travel.returnHome,
        }),
      );
    },
    update(dt) {
      keepOutside(player.position);
      elapsed += dt;
      if (phase === 'arrival' && elapsed >= 0.55) {
        phase = 'calling';
        clinkShot();
        void say(INTRO).then(() => {
          phase = 'meet';
          ui.objective('Talk to Clink', CLINK_POINT);
        }).catch(error => {
          if (!signal.aborted) console.error('Clink introduction failed', error);
        }).finally(() => {
          if (!signal.aborted) camera.releaseShot();
        });
      }
      if ((phase === 'puzzle' || phase === 'flow') && previousAspect !== viewCamera.aspect) frameBoard(0);
      if (phase === 'flow') showFlow();
      if (phase === 'forge' && elapsed >= 1.2) {
        phase = 'repaired';
        camera.releaseShot();
        releasePuzzle();
        releasePuzzle = undefined;
        ui.objective('Return to Clink', CLINK_POINT);
      }
    },
    present(time) {
      clink.animate(time, phase);
      board.animateFlow(time);
      cavern.animate(time, lit);
    },
    exit() {
      for (const remove of unregister) remove();
      releasePuzzle?.();
      camera.releaseShot();
      player.root.visible = true;
      player.root.removeFromParent();
    },
    dispose() { disposeScene(scene); },
  };
}
