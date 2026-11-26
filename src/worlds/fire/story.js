import { MathUtils, Vector3 } from 'three';
import { createReturnRing } from '../../shared/props/return-ring.js';
import { canReturn } from '../../state/progress.js';
import { descent, fright, gift, intro, relief, rescue } from './lines.js';
import { createCandle, createSeagull, createWick } from './wick.js';

const RISE_SECONDS = 2;
const PASS_SECONDS = 2.7;
const SHAKE_SECONDS = 0.38;
const RISE_DISTANCE = 4.5;

export function createFireStory({
  scene, summit, summitLantern, safeSpawn, walkBounds,
  camera, player, ui, controls, interactions, progress, travel, audio, signal,
}) {
  const perch = new Vector3((summit.minX + summit.maxX) / 2, summit.y, (summit.minZ + summit.maxZ) / 2);
  const wickCloseup = perch.clone().add(new Vector3(0, 0.75, 0.35));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wick = createWick();
  const candle = createCandle();
  const gull = createSeagull();
  const ring = createReturnRing(safeSpawn);
  const ringColor = ring.material.color.clone();
  summitLantern.add(wick.root);
  scene.add(ring, candle, gull.root, gull.speck);
  candle.visible = gull.root.visible = gull.speck.visible = false;

  let phase = 'arrival';
  let time = 0;
  let releaseOpening;
  const unregister = [];
  const complete = () => canReturn('fire', progress.read());
  const say = (...lines) => ui.say({ speaker: 'Wick', lines }, signal);
  const onSummit = ({ x, y, z }) => y === summit.y &&
    x >= summit.minX && x <= summit.maxX && z >= summit.minZ && z <= summit.maxZ;

  function showReturn() {
    phase = 'complete';
    ring.material.color.copy(ringColor);
    ui.objective('Return through the yellow ring when ready', ring.position);
  }

  function shot(point, x, y, z, seconds) {
    camera.shot({ eye: point.clone().add(new Vector3(x, y, z)), lookAt: point, seconds });
  }

  function play(sequence) {
    const release = controls.acquire('story');
    return sequence().catch(error => {
      if (!signal.aborted) console.error('Fire story failed', error);
    }).finally(release);
  }

  function beginClimb() {
    phase = 'climb';
    camera.releaseShot();
    ui.objective('Climb to the top lantern', perch);
  }

  function rescueScene() {
    phase = 'rescue';
    ui.objective('');
    const pair = player.position.clone().lerp(perch, 0.5).add(new Vector3(0, 0.5, 0));
    shot(pair, 2.2, 0.9, 2.1);
    void play(async () => {
      await say(rescue);
      camera.releaseShot();
      phase = 'pickup';
    });
  }

  function pickUp() {
    phase = 'pickup-line';
    wick.root.position.set(0.01, -0.23, 0.17);
    wick.root.rotation.set(0.35, -0.35, -0.42);
    wick.root.scale.setScalar(0.8);
    wick.pose('carried');
    player.setHeld(wick.root);
    return play(async () => {
      await say(descent);
      phase = 'descent';
      ui.objective('Carry Wick to the festival floor');
    });
  }

  function resolve() {
    phase = 'resolution';
    ui.objective('');
    player.setHeld(null);
    scene.add(wick.root);
    wick.root.position.set(
      player.position.x + (player.position.x > walkBounds.maxX - 1 ? -0.85 : 0.85),
      0,
      player.position.z,
    );
    wick.root.rotation.set(0, 0, 0);
    wick.root.scale.setScalar(1);
    wick.pose('recovering');
    const pair = player.position.clone().lerp(wick.root.position, 0.5).add(new Vector3(0, 0.45, 0));
    shot(pair, 0.2, 1.05, 3.1);

    void play(async () => {
      await say(relief);
      wick.pose('relieved');
      candle.position.copy(wick.root.position).add(new Vector3(-0.19, 0.44, 0.26));
      candle.visible = true;
      await say(gift);
      candle.visible = false;
      if (progress.apply('earnCandle').changed) audio.play('candle.chime', { position: wick.root.position });
      camera.releaseShot();
      if (complete()) showReturn();
    });
  }

  return {
    enter() {
      wick.root.position.copy(perch).add(new Vector3(0, 0, -0.32));
      wick.pose('proud');
      unregister.push(interactions.register({
        id: 'carry-wick', point: wick.root.position, radius: 2.1,
        label: 'Carry Wick', enabled: () => phase === 'pickup' && onSummit(player.position), run: pickUp,
      }));
      unregister.push(interactions.register({
        id: 'return', point: safeSpawn, label: 'Return to the Overworld',
        enabled: complete, run: travel.returnHome,
      }));

      if (complete()) {
        scene.add(wick.root);
        wick.root.position.copy(safeSpawn).add(new Vector3(1.65, 0, 0));
        wick.pose('relieved');
        showReturn();
      } else {
        ring.material.color.setHex(0x9d7a40);
        summitLantern.position.set(0, -RISE_DISTANCE, -3.5);
      }
    },
    update(dt) {
      time += dt;
      switch (phase) {
        case 'arrival':
          phase = 'rise';
          time = 0;
          releaseOpening = controls.acquire('story');
          shot(perch.clone().add(new Vector3(0, -1.5, -1.5)), -6.2, 3.4, 6.4, 0);
          break;
        case 'rise': {
          const remaining = 1 - MathUtils.smoothstep(time, 0, RISE_SECONDS);
          summitLantern.position.set(0, -RISE_DISTANCE * remaining, -3.5 * remaining * remaining);
          if (time < RISE_SECONDS) break;
          phase = 'intro';
          shot(wickCloseup, 1.95, 0.35, 3.15);
          void play(async () => {
            await say(intro);
            phase = 'gull';
            time = 0;
            gull.root.visible = true;
          });
          break;
        }
        case 'gull': {
          gull.fly(perch, time);
          const descentLook = MathUtils.smoothstep(time, 1.05, 2.06);
          const sideLook = MathUtils.lerp(0.9, -0.25, MathUtils.smoothstep(time, 0, 1.05));
          wick.pose(time > 2.2 ? 'scared' : 'proud', time, sideLook * (1 - descentLook), descentLook);
          const shakeTime = Math.max(0, time - 2.2);
          if (shakeTime > 0 && !reducedMotion.matches) {
            const strength = 0.14 * (1 - MathUtils.smoothstep(shakeTime, 0, SHAKE_SECONDS));
            shot(wickCloseup, 1.95 + Math.sin(shakeTime * 63) * strength,
              0.35 + Math.sin(shakeTime * 87) * strength * 0.55, 3.15, 0);
          }
          if (time < PASS_SECONDS) break;
          gull.root.visible = gull.speck.visible = false;
          phase = 'fright';
          void play(async () => {
            await say(fright);
            beginClimb();
            releaseOpening();
          });
          break;
        }
        case 'fright':
          wick.pose('scared', time);
          break;
        case 'climb':
        case 'pickup':
          wick.pose('scared', time);
          if (phase === 'climb' && onSummit(player.position)) rescueScene();
          break;
        case 'descent':
          wick.pose('carried', time);
          if (player.position.y === 0) resolve();
          break;
      }
    },
    exit() {
      releaseOpening?.();
      for (const remove of unregister) remove();
      camera.releaseShot();
      if (wick.root.parent !== scene && wick.root.parent !== summitLantern) {
        player.setHeld(null);
        scene.add(wick.root);
      }
    },
  };
}
