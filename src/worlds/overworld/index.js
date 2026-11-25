import { MathUtils, Vector3 } from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { nextDream } from '../../state/progress.js';
import { createScenery, floorHeight, keepInsideIsland } from './scenery.js';

const LOWER_SECONDS = 0.48;
const SLEEP_SECONDS = 0.75;
const WAKE_PITCH = 0.19;
const AUDIO = { cues: ['hammock.lower'] };

function keepOutsideCottage(position, bounds) {
  const { min, max } = bounds;
  const left = position.x - min.x;
  const right = max.x - position.x;
  const back = position.z - min.z;
  const front = max.z - position.z;
  const nearest = Math.min(left, right, back, front);
  if (nearest <= 0) return;

  const previousFloor = floorHeight(position.x, position.z);
  if (nearest === left) position.x = min.x;
  else if (nearest === right) position.x = max.x;
  else if (nearest === back) position.z = min.z;
  else position.z = max.z;
  position.y += floorHeight(position.x, position.z) - previousFloor;
}

export function createWorld({ audio, camera, controls, interactions, player, progress, travel, ui }) {
  const { scene, cottageBounds, hammock, wake, animate } = createScenery();
  const cottageFootprint = cottageBounds.clone().expandByScalar(0.22);
  const bed = hammock.point.clone().add(new Vector3(0.33, 0.87, 0));
  let unregister;
  let sleep;
  let objective;

  function refreshObjective() {
    const destination = nextDream(progress.read());
    if (objective === destination) return;
    objective = destination;
    if (destination && travel.canEnterNext()) {
      ui.objective('Sleep in the hammock to enter the next dream', hammock.point);
    } else if (destination) {
      const name = destination === 'void' ? 'Sun' : destination[0].toUpperCase() + destination.slice(1);
      ui.objective(`The ${name} dream is unavailable in this build`);
    } else {
      ui.objective('');
    }
  }

  return {
    scene,
    surfaces: {
      floorHeight,
      safeSpawn: wake,
      walkBounds: { minX: -10, maxX: 10, minZ: -8, maxZ: 8 },
    },
    prepare: signal => audio.prepare(AUDIO, signal),
    enter() {
      player.root.rotation.set(0, Math.PI, 0);
      player.setPose('idle');
      player.teleport(wake);
      camera.resetOrbit({ pitch: WAKE_PITCH });
      camera.setObstructions([cottageBounds]);
      scene.add(player.root);
      audio.enter(AUDIO);
      refreshObjective();
      unregister = interactions.register({
        id: 'hammock',
        point: hammock.point,
        enabled: travel.canEnterNext,
        label: 'Sleep in the hammock',
        run() {
          sleep = {
            release: controls.acquire('transition'),
            start: player.position.clone(),
            yaw: Math.atan2(Math.sin(player.root.rotation.y), Math.cos(player.root.rotation.y)),
            elapsed: 0,
          };
          audio.play('hammock.lower', { position: hammock.point });
        },
      });
    },
    update(dt) {
      if (sleep) {
        sleep.elapsed += dt;
        const weight = MathUtils.smoothstep(sleep.elapsed, 0, LOWER_SECONDS);
        player.position.lerpVectors(sleep.start, bed, weight);
        player.root.rotation.set(-0.52 * weight, MathUtils.lerp(sleep.yaw, 0, weight), Math.PI * 0.49 * weight);
        hammock.setSag(weight);
        if (sleep.elapsed < SLEEP_SECONDS || travel.enterNext()) return;

        player.root.rotation.set(0, sleep.yaw, 0);
        player.teleport(sleep.start);
        hammock.setSag(0);
        sleep.release();
        sleep = null;
        return;
      }

      keepOutsideCottage(player.position, cottageFootprint);
      keepInsideIsland(player.position);
      refreshObjective();
    },
    present(elapsed) {
      animate(elapsed, player.position);
    },
    exit() {
      unregister?.();
      sleep?.release();
      sleep = null;
      camera.setObstructions([]);
      player.root.rotation.set(0, Math.PI, 0);
      player.root.removeFromParent();
    },
    dispose() {
      disposeScene(scene);
    },
  };
}
