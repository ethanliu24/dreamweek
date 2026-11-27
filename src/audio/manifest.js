// overworld
import overworldMusic from '../assets/overworld/audio/music.mp3?url';
import overworldWind from '../assets/overworld/audio/wind-ambience.mp3?url';
import overworldSleep from '../assets/overworld/audio/sleep.mp3?url';

// shared
import selection from '../assets/shared/audio/selection.mp3?url';

const overworldManifest = {
  'overworld.music': { category: 'music', gain: 1.2, file: overworldMusic },
  'overworld.ambience.wind': { category: 'ambience', gain: 0.45, file: overworldWind },
  'hammock.sleep': { category: 'effects', gain: 1, file: overworldSleep },
};

const sharedManifest = {
  'shared.interaction': { category: 'effects', gain: 0.55, file: selection },
};

export const audioManifest = {
  'candle.chime': { category: 'effects', gain: 0.2, synth: { type: 'sine', hz: 660, duration: 0.3 } },
  'water.shell-siren': { category: 'effects', gain: 0.32, synth: { type: 'sawtooth', hz: 226, filterHz: 620, duration: 0.85 } },
  ...overworldManifest,
  ...sharedManifest,
};
