import { Scene, Vector3 } from 'three';
import { dressBasin } from './scenery.js';
import { disposeScene } from '../../runtime/assets.js';
import { canReturn } from '../../state/progress.js';
import { createReturnRing } from '../../shared/props/return-ring.js';
import { createBob, createReaction } from './bob.js';
import { createPotStory } from './story.js';
import { createWheel } from './wheel.js';

const ARRIVAL = new Vector3(0, 0, 4.8);
const WALK_BOUNDS = { minX: -9, maxX: 9, minZ: -9, maxZ: 7 };

export function createWorld({ canvas, player, camera, controls, interactions, ui, signal, progress, travel }) {
  const scene = new Scene();
  scene.name = 'Earth';
  const animateBasin = dressBasin(scene);
  const bob = createBob();
  bob.root.position.set(-2.6, 0, 2.65);
  const reaction = createReaction();
  const ring = createReturnRing(ARRIVAL);
  let phase = 'meet';
  const wheel = createWheel({
    canvas, controls, camera,
    onShape: reaction.pop,
    onFinish(shape) {
      phase = 'wet';
      player.root.visible = true;
      potStory.shaped(shape);
    },
  });
  const potStory = createPotStory({ wheel, ring, scene, camera, controls, interactions, player, progress, travel, ui });
  scene.add(wheel.root, bob.root, ring, reaction.sprite);
  const reactionPoint = new Vector3();
  const unregister = [];

  function greet() {
    phase = 'greeting';
    const release = controls.acquire('story');
    void (async () => {
      try {
        await ui.say({ speaker: 'Bob', lines: ['Hiii my name is Bob, nice to meet you :)'] }, signal);
        await ui.say({ kind: 'thought', lines: ["This thing would make a great pot."] }, signal);
        phase = 'pickup';
        ui.objective('Pick up Bob', bob.root.position);
      } catch (error) {
        if (!signal.aborted) console.error('Earth greeting failed', error);
      } finally {
        release();
      }
    })();
  }

  return {
    scene,
    surfaces: { floorHeight: () => 0, walkBounds: WALK_BOUNDS, safeSpawn: ARRIVAL },
    prepare() {},
    enter() {
      player.root.rotation.set(0, Math.PI, 0);
      player.setPose('idle');
      player.teleport(ARRIVAL);
      camera.resetOrbit({ pitch: 0.04 });
      scene.add(player.root);
      potStory.enter();
      if (canReturn('earth', progress.read())) {
        phase = 'complete';
        bob.root.visible = false;
        return;
      }
      ui.objective('Meet Bob', bob.root.position);
      unregister.push(interactions.register({
        id: 'bob', point: bob.root.position, enabled: () => phase === 'pickup', label: 'Pick up Bob',
        run() {
          phase = 'carry';
          bob.root.position.set(0.01, -0.18, 0.16);
          bob.root.rotation.y = 0.4;
          player.setHeld(bob.root);
          reaction.pop();
          ui.objective('Take Bob to the pottery wheel', wheel.root.position);
        },
      }));
      unregister.push(interactions.register({
        id: 'wheel', point: wheel.root.position, enabled: () => phase === 'carry',
        label: 'Place Bob on the wheel',
        run() {
          phase = 'shape';
          player.setHeld(null);
          player.root.visible = false;
          ui.objective('');
          wheel.start(bob.root);
        },
      }));
    },
    update(dt, { actions }) {
      wheel.keepOutside(player.position);
      if (phase === 'meet' && player.position.distanceToSquared(bob.root.position) <= 4) {
        bob.root.rotation.y = Math.atan2(player.position.x - bob.root.position.x, player.position.z - bob.root.position.z);
        greet();
      }
      wheel.update(dt, actions);
      potStory.update(dt);
      const subject = phase === 'shape' || phase === 'wet' ? wheel.turntable : bob.root;
      subject.getWorldPosition(reactionPoint);
      reactionPoint.add(new Vector3(0.47, phase === 'shape' ? 0.45 : 0.56, 0));
      reaction.update(dt, reactionPoint);
    },
    present(elapsed) {
      animateBasin(elapsed);
      if (phase !== 'shape' && phase !== 'wet') bob.animate(elapsed, phase === 'carry');
    },
    exit() {
      for (const remove of unregister) remove();
      wheel.exit();
      potStory.exit();
      camera.releaseShot();
      player.root.visible = true;
      if (phase === 'carry') {
        player.setHeld(null);
        scene.add(bob.root);
      }
      player.root.removeFromParent();
    },
    dispose() { disposeScene(scene); },
  };
}
