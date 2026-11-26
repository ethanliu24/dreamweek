import { arrival, ending, intro, wakeThoughts } from './lines.js';
import { openingPlate, endingPlate } from './plates.js';

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
      if (openingPending) ui.plate(openingPlate(), 'Six elemental dreams curve around a white arena. An empty place marks the missing Moon.');
    },
    update() {
      if (busy || endingStarted) return;
      const snapshot = progress.read();
      if (snapshot.ended) {
        endingStarted = true;
        play(async () => {
          ui.plate(endingPlate(), 'The restored Moon lights the cottage, the overstuffed Frog Wizard and the spirit beside an empty bowl.');
          for (const exchange of ending) await ui.say(exchange, signal);
        });
      } else if (openingPending) {
        openingPending = false;
        play(async () => {
          try {
            await ui.say(intro, signal);
            await ui.iris.close(signal);
          } finally {
            if (!signal.aborted) ui.plate(null);
          }
          await ui.iris.open(signal);
          await ui.say(arrival, signal);
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
