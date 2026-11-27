import { MathUtils, Scene, Vector3 } from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { createReturnRing } from '../../shared/props/return-ring.js';
import { canReturn } from '../../state/progress.js';
import { IGNITION, INTRO, OFFER, PLAYER_REPLY, REQUEST, THANKS } from './lines.js';
import { createFirePit } from './hearth.js';
import { createMallow } from './mallow.js';
import { dressForest } from './scenery.js';

const ARRIVAL = new Vector3(0, 0, 4.7);
const WALK_BOUNDS = { minX: -20, maxX: 20, minZ: -20, maxZ: 20 };

export function createWorld({ player, camera, controls, interactions, ui, signal, progress, travel }) {
  const scene = new Scene();
  scene.name = 'Wood';
  const animateForest = dressForest(scene);
  const clearing = createFirePit(scene);
  const giftRest = clearing.gift.position.clone();
  const offeredGift = new Vector3();
  let offerStart;
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

  // Stage the close-up over the open shoulder, even when the player approaches
  // from the side of the clearing normally occupied by a fixed camera.
  function shoulderShot(subject, lookAt, distance, height) {
    const bearing = Math.atan2(player.position.x - subject.x, player.position.z - subject.z);
    // At arm's length, use the spirit's viewpoint for the portrait.
    const close = Math.hypot(player.position.x - subject.x, player.position.z - subject.z) < .94;
    player.root.visible = !close;
    const angle = bearing + (bearing >= 0 ? -1 : 1) * (close ? .25 : .90);
    camera.shot({
      eye: new Vector3(subject.x + Math.sin(angle) * distance, height, subject.z + Math.cos(angle) * distance),
      lookAt,
    });
  }

  async function request() {
    mallow.face(player.position);
    phase = 'request';
    const release = controls.acquire('story');
    shoulderShot(mallow.root.position, new Vector3(-0.32, 0.42, -1.38), 2.85, 1.19);
    try {
      await say(REQUEST);
      phase = 'ready';
      ui.objective('Light the prepared fire with Wick’s Candle', clearing.pit);
    } finally {
      player.root.visible = true;
      camera.releaseShot();
      release();
    }
  }

  function light() {
    phase = 'lighting';
    burn = 0.01;
    releaseIgnition = controls.acquire('story');
    shoulderShot(clearing.pit, new Vector3(0.28, 0.42, -1.48), 2.95, 1.32);
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
      player.root.visible = true;
      camera.releaseShot();
      releaseIgnition?.();
      releaseIgnition = undefined;
    }
  }

  async function thank() {
    phase = 'thanks';
    mallow.face(player.position);
    const release = controls.acquire('story');
    shoulderShot(mallow.root.position, new Vector3(-1.25, 0.44, -1.24), 2.05, 0.94);
    try {
      await say(THANKS);
      await ui.say(PLAYER_REPLY, signal);
      phase = 'offer';
      await say(OFFER);
      if (progress.apply('helpMallow').changed) showReturn();
      else phase = 'lit';
    } finally {
      player.root.visible = true;
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
      camera.resetOrbit({ pitch: 0.24 });
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
      if (pose === 'offer') {
        offerStart ??= elapsed;
        const lift = MathUtils.smoothstep(elapsed - offerStart, 0, .52);
        mallow.root.localToWorld(offeredGift.set(0, .26, .26));
        clearing.gift.position.lerpVectors(giftRest, offeredGift, lift);
        clearing.gift.position.y += .12 * Math.sin(Math.PI * lift);
        clearing.gift.rotation.y = MathUtils.lerp(-.3, mallow.root.rotation.y + Math.PI / 2, lift);
      } else if (offerStart !== undefined && clearing.gift.visible) {
        offerStart = undefined;
        clearing.gift.position.copy(giftRest);
        clearing.gift.rotation.y = -.3;
      }
      clearing.animate(elapsed, burn);
      animateForest(elapsed);
    },
    exit() {
      for (const remove of unregister) remove();
      releaseOpening?.();
      releaseIgnition?.();
      player.root.visible = true;
      camera.releaseShot();
      player.root.removeFromParent();
    },
    dispose() { disposeScene(scene); },
  };
}
