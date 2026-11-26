import { Scene, Vector3 } from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { createCookingPot } from '../../shared/props/cooking.js';
import { createDreamSky } from './sky.js';
import { createReturnRing } from '../../shared/props/return-ring.js';
import { canReturn } from '../../state/progress.js';
import { createInvestigation } from './investigation.js';
import { LOCKDOWN, LOCKDOWN_THOUGHT, NO_BUBBLE, PRE_LOCKDOWN_SHORE } from './lines.js';
import { BEACH_END, REEF_END, buildShore, floorHeight } from './shore.js';

const ARRIVAL = new Vector3(0, 0, 8.65);
const CLAM_SECONDS = 1.6;

export function createWorld({ player, camera, controls, interactions, ui, signal, progress, travel, audio }) {
  const scene = new Scene();
  scene.name = 'Water';
  const sky = createDreamSky(scene);
  const shore = buildShore(scene);
  const ring = createReturnRing(ARRIVAL);
  const safeSpawn = ARRIVAL.clone();
  const walkBounds = { minX: -19.7, maxX: 19.7, minZ: 0, maxZ: BEACH_END - 0.3 };
  const surfaces = { floorHeight, walkBounds, safeSpawn };
  const complete = () => canReturn('water', progress.read());
  const unregister = [];
  let pot;
  let bubbleTime = 0;
  let releaseClam;
  let announcing = false;
  let warned = false;
  scene.add(ring);
  const investigation = createInvestigation({
    scene, shore, player, camera, ui, signal, progress,
    onResolve() {
      refreshBeach();
      guide();
    },
  });

  function refreshBeach() {
    const filled = progress.read().pot.phase === 'filled';
    const open = complete();
    if (pot) pot.liquid.visible = filled;
    shore.barrier.visible = filled && !open;
    walkBounds.maxZ = shore.barrier.visible ? 7.72 : BEACH_END - 0.3;
    safeSpawn.z = shore.barrier.visible ? 7.5 : ARRIVAL.z;
    ring.material.color.setHex(open ? 0xffdf61 : 0xb99c58);
  }

  function guide() {
    if (complete()) {
      ui.objective('Return through the yellow ring', ring.position);
    } else if (progress.read().pot.phase === 'empty') {
      ui.objective('Fill the pot at the faucet', shore.faucet);
    } else if (bubbleTime === 1) {
      investigation.guide();
    } else {
      ui.objective('Visit the sleepy clam', shore.clam);
    }
  }

  async function sayThought(line) {
    const lookAt = player.position.clone().add(new Vector3(0, 0.65, 0));
    const eye = new Vector3(-2.35, 1.75, 2.6)
      .applyAxisAngle(player.root.up, player.root.rotation.y)
      .add(lookAt);
    camera.shot({ eye, lookAt });
    try {
      await ui.say(line, signal);
    } finally {
      if (!signal.aborted) camera.releaseShot();
    }
  }

  async function fill() {
    if (!progress.apply('fillPot').changed) return;
    refreshBeach();
    const release = controls.acquire('story');
    announcing = true;
    try {
      audio?.play('water.shell-siren');
      camera.shot({ eye: new Vector3(2.9, 2.5, 7.7), lookAt: new Vector3(0.6, 1.35, 3.2) });
      await ui.say(LOCKDOWN, signal);
      await sayThought(LOCKDOWN_THOUGHT);
    } finally {
      if (!signal.aborted) {
        announcing = false;
        camera.releaseShot();
        guide();
      }
      release();
    }
  }

  return {
    scene,
    surfaces,
    prepare() {},
    enter() {
      const { shape, phase } = progress.read().pot;
      if (shape && (phase === 'empty' || phase === 'filled')) {
        pot = createCookingPot(shape);
        pot.root.position.set(-0.03, -0.13, 0.20);
        player.setHeld(pot.root);
      }
      refreshBeach();
      player.teleport(safeSpawn);
      sky.update(0, player.position);
      player.root.rotation.set(0, Math.PI, 0);
      player.setPose('idle');
      scene.add(player.root);
      camera.resetOrbit();
      shore.animate(0, player.position, bubbleTime, announcing);
      guide();

      unregister.push(interactions.register({
        id: 'faucet', point: shore.faucet, label: 'Fill pot',
        enabled: () => progress.read().pot.phase === 'empty', run: fill,
      }));
      unregister.push(interactions.register({
        id: 'clam', point: shore.clam, label: 'Wake the clam',
        enabled: () => progress.read().pot.phase === 'filled' && bubbleTime === 0,
        run() {
          releaseClam = controls.acquire('story');
          camera.shot({
            eye: new Vector3(shore.clam.x + 2.8, 1.75, shore.clam.z + 3.6),
            lookAt: new Vector3().lerpVectors(shore.clam, player.position, 0.5).add(new Vector3(0, 0.52, 0)),
          });
        },
      }));
      unregister.push(interactions.register({
        id: 'beach-exit', point: ring.position,
        label: () => complete() ? 'Return to the Overworld' : 'Check beach exit',
        run: () => complete() ? travel.returnHome() : sayThought({
          kind: 'thought',
          lines: [shore.barrier.visible ? 'The beach is closed.' : 'I still need to fill the pot.'],
        }),
      }));
      unregister.push(...investigation.register(interactions, () => shore.barrier.visible, () => bubbleTime === 1));
    },
    update(dt, { mode, actions }) {
      if (releaseClam) {
        bubbleTime = Math.min(1, bubbleTime + dt / CLAM_SECONDS);
        if (bubbleTime === 1) {
          walkBounds.minZ = REEF_END + 0.3;
          camera.releaseShot();
          releaseClam();
          releaseClam = undefined;
          guide();
        }
      }

      if (bubbleTime === 1 || mode !== 'explore') return;
      if (player.position.z > 0.8) warned = false;
      const towardWater = (actions.moveZ ?? 0) * Math.cos(camera.yaw) -
        (actions.moveX ?? 0) * Math.sin(camera.yaw) < -0.01;
      if (warned || player.position.z > 0 || !towardWater) return;
      warned = true;
      const thought = shore.barrier.visible ? NO_BUBBLE : PRE_LOCKDOWN_SHORE;
      void sayThought(thought).catch(error => {
        if (!signal.aborted) console.error('Water shoreline dialogue failed', error);
      });
    },
    present(elapsed) {
      sky.update(elapsed, player.position);
      shore.animate(elapsed, player.position, bubbleTime, announcing);
      investigation.animate(elapsed);
    },
    exit() {
      for (const remove of unregister) remove();
      releaseClam?.();
      camera.releaseShot();
      if (pot) {
        player.setHeld(null);
        scene.add(pot.root);
      }
      player.root.removeFromParent();
    },
    dispose() { sky.dispose(); disposeScene(scene); },
  };
}
