import { MathUtils, Scene, Vector3 } from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { createReturnRing } from '../../shared/props/return-ring.js';
import { dressCavern } from './scenery.js';
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

export function createWorld({ canvas, viewCamera, camera, controls, interactions, player, progress, signal, travel, ui }) {
  const scene = new Scene();
  scene.name = 'Metal';
  const board = createPipeBoard();
  const cavern = dressCavern(scene, board, FORGE_POINT, CLINK_POINT, SWORD_PEDESTAL, BOARD_POINT);
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
    player.root.visible = false;
    if (reward) {
      const { x, z } = SWORD_PEDESTAL;
      camera.shot({
        eye: new Vector3(x - 1.05, 1.65, z + 2.85),
        lookAt: new Vector3(x - 0.18, 0.93, z),
      });
    } else {
      clinkShot();
    }
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
      if (!signal.aborted) {
        player.root.visible = true;
        camera.releaseShot();
      }
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
      camera.resetOrbit({ pitch: 0.12, distance: 7.1 });
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
