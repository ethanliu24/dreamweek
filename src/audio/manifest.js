// overworld
import overworldMusic from '../assets/overworld/audio/music.mp3?url';
import overworldWind from '../assets/overworld/audio/wind-ambience.mp3?url';
import overworldSleep from '../assets/overworld/audio/sleep.mp3?url';

// fire
import fireMusic from '../assets/fire/audio/music.mp3?url';
import fireCrowd from '../assets/fire/audio/crowd.mp3?url';
import seagullFly from '../assets/fire/audio/seagull.mp3?url';
import seagullDrop from '../assets/fire/audio/poop-falling.mp3?url';
import laternPlatform from '../assets/fire/audio/platform.mp3?url';

// shared
import selection from '../assets/shared/audio/selection.mp3?url';
import jump from '../assets/shared/audio/jump.mp3?url';
import obtain from '../assets/shared/audio/obtain.mp3?url';

const overworldManifest = {
  'overworld.music': { category: 'music', gain: 1.2, file: overworldMusic },
  'overworld.ambience.wind': { category: 'ambience', gain: 0.1, file: overworldWind },
  'hammock.sleep': { category: 'effects', gain: 1, file: overworldSleep },
};

const fireManifest = {
  'fire.music': { category: 'music', gain: 0.87, file: fireMusic },
  'fire.ambience.crowd': { category: 'ambience', gain: 1, file: fireCrowd },
  'seagull.fly': { category: 'effects', gain: 1, file: seagullFly },
  'seagull.drop': { category: 'effects', gain: 1, file: seagullDrop },
  'latern.move': { category: 'effects', gain: 1, file: laternPlatform },
};

const sharedManifest = {
  'shared.interaction': { category: 'effects', gain: 0.55, file: selection },
  'shared.jump': { category: 'effects', gain: 0.55, file: jump },
  'shared.obtain': { category: 'effects', gain: 0.55, file: obtain },
};

export const audioManifest = {
  'water.shell-siren': { category: 'effects', gain: 0.32, synth: { type: 'sawtooth', hz: 226, filterHz: 620, duration: 0.85 } },
  ...overworldManifest,
  ...fireManifest,
  ...sharedManifest,
};
