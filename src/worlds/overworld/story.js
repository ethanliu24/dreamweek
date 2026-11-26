import { ending, intro, wakeThoughts } from './lines.js';
import { endingPlate, openingPlate } from './plates.js';

function reminder(snapshot) {
  switch (snapshot.completed.at(-1)) {
    case 'fire': return 'OVERWORLD_FIRE_RETURN';
    case 'earth': return 'OVERWORLD_EARTH_RETURN';
    case 'water': return snapshot.hearth === 'potPlaced' ? 'OVERWORLD_WATER_RETURN' : null;
    case 'wood': return snapshot.hearth === 'lit' ? 'OVERWORLD_WOOD_RETURN' : null;
    case 'metal': return 'OVERWORLD_METAL_RETURN';
    case 'moon': return snapshot.wizard === 'home' ? 'OVERWORLD_MOON_RETURN' : null;
    default: return null;
  }
}

export function createOverworldStory({ ui, controls, progress, signal }) {
  let openingPending = false;
  let busy = false;
  let endingStarted = false;

  function play(sequence) {
    busy = true;
    const release = controls.acquire('story');
    void sequence().catch(error => {
      if (!signal.aborted) console.error('Overworld story failed', error);
    }).finally(() => {
      busy = false;
      release();
    });
  }

  return {
    enter(spawn) {
      openingPending = spawn === 'arrival' && progress.read().completed.length === 0;
    },
    update() {
      if (busy || endingStarted) return;
      const snapshot = progress.read();
      if (snapshot.ended) {
        endingStarted = true;
        play(async () => {
          ui.plate(endingPlate(), 'The restored Moon lights the cottage, the overstuffed Frog Wizard and the spirit beside an empty bowl.');
          for (const exchange of ending) await ui.say(exchange, signal);
          signal.throwIfAborted();
          ui.showEnding();
        });
      } else if (openingPending) {
        openingPending = false;
        play(async () => {
          await ui.fadePlate(openingPlate(), 'Six elemental dreams curve around a white arena. An empty place marks the missing Moon.', signal);
          await ui.say(intro, signal);
          await ui.fadePlate(null, '', signal);
        });
      } else {
        const id = reminder(snapshot);
        if (!id || snapshot.thoughtsSeen.includes(id)) return;
        progress.apply('markThoughtSeen', id);
        play(() => ui.say({ kind: 'thought', lines: [wakeThoughts[id]] }, signal));
      }
    },
  };
}
