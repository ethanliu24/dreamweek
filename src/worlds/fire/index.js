import { Vector3 } from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { createScenery } from './scenery.js';
import { createFireStory } from './story.js';

const AUDIO = {
  music: 'fire.music',
  ambience: ['fire.ambience.crowd'],
  cues: ['shared.obtain', 'seagull.fly', 'seagull.drop', 'latern.move'],
};

export function createWorld(context) {
  const { audio, camera, player } = context;
  const scenery = createScenery();
  const { scene, platforms, advancePlatforms, walkBounds } = scenery;
  const safeSpawn = new Vector3(0, 0, 3.6);
  const story = createFireStory({ ...context, ...scenery, summit: platforms.at(-1), safeSpawn });

  return {
    scene,
    surfaces: { floorHeight: () => 0, platforms, advancePlatforms, walkBounds, safeSpawn },
    prepare: signal => audio.prepare(AUDIO, signal),
    enter() {
      player.root.rotation.set(0, Math.PI, 0);
      player.setPose('idle');
      player.teleport(safeSpawn);
      camera.resetOrbit({ pitch: 0.18 });
      scene.add(player.root);
      audio.enter(AUDIO);
      story.enter();
    },
    update: story.update,
    present: scenery.animate,
    exit() {
      story.exit();
      player.root.removeFromParent();
    },
    dispose() {
      disposeScene(scene);
    },
  };
}
