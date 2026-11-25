const CHAPTERS = ['fire', 'earth', 'water', 'wood', 'metal', 'sun', 'moon'];
const WORLDS = ['overworld', 'fire', 'earth', 'water', 'wood', 'metal', 'void'];

const hasItem = (snapshot, item) => snapshot.items.includes(item);
const completed = (snapshot, chapter) => snapshot.completed.includes(chapter);
const nextChapter = snapshot => CHAPTERS.find(chapter => !completed(snapshot, chapter));

export function nextDream(snapshot) {
  if (snapshot.ended) return null;

  switch (nextChapter(snapshot)) {
    case 'fire': return 'fire';
    case 'earth': return hasItem(snapshot, 'Candle') ? 'earth' : null;
    case 'water': return snapshot.pot.phase === 'empty' ? 'water' : null;
    case 'wood': return snapshot.hearth === 'potPlaced' ? 'wood' : null;
    case 'metal': return snapshot.hearth === 'lit' ? 'metal' : null;
    case 'sun': return snapshot.hearth === 'boiled' && hasItem(snapshot, 'Sword') ? 'void' : null;
    default: return null;
  }
}

export function canReturn(world, snapshot) {
  // Void requests covered travel after the body capture commits, including on retry.
  if (world === 'void') return snapshot.wizard === 'home';
  return CHAPTERS.slice(0, 5).includes(world) && completed(snapshot, world);
}

const STATION_ACTIONS = {
  empty: {
    command: 'placePot',
    ready: s => completed(s, 'water') && s.pot.phase === 'filled',
    update: s => ({ hearth: 'potPlaced', pot: { ...s.pot, phase: 'placed' } }),
  },
  potPlaced: {
    command: 'placeWood',
    ready: s => completed(s, 'wood') && hasItem(s, 'Firewood'),
    update: s => ({ hearth: 'woodPlaced', items: s.items.filter(item => item !== 'Firewood') }),
  },
  woodPlaced: {
    command: 'lightWood',
    ready: s => hasItem(s, 'Candle'),
    update: () => ({ hearth: 'lit' }),
  },
  boiled: {
    command: 'addSun',
    ready: s => s.wizard === 'home' && hasItem(s, 'Sun Essence'),
    update: s => ({ hearth: 'sunAdded', items: s.items.filter(item => item !== 'Sun Essence') }),
  },
  sunAdded: {
    command: 'addMoon',
    ready: s => hasItem(s, 'Moon Essence'),
    update: s => ({ hearth: 'moonAdded', items: s.items.filter(item => item !== 'Moon Essence') }),
  },
  moonAdded: {
    command: 'stir',
    ready: s => hasItem(s, 'Sword'),
    update: () => ({ hearth: 'stirred' }),
  },
  stirred: {
    command: 'takeSoup',
    ready: () => true,
    update: s => ({ hearth: 'served', items: [...s.items, 'Soup'] }),
  },
  served: {
    command: 'feed',
    ready: s => s.wizard === 'home' && hasItem(s, 'Soup'),
    update: s => ({ wizard: 'fed', ended: true, items: s.items.filter(item => item !== 'Soup') }),
  },
};

export function nextStationAction(snapshot) {
  const action = STATION_ACTIONS[snapshot.hearth];
  return !snapshot.ended && action?.ready(snapshot) ? action.command : null;
}

export const INVENTORY_CAPACITY = 4;

export function inventoryItems(snapshot) {
  const items = [...snapshot.items];
  if (snapshot.pot.phase === 'empty') items.push('Empty Pot');
  if (snapshot.pot.phase === 'filled') items.push('Filled Pot');
  return items;
}

function finishChapter(snapshot, chapter, ...items) {
  return { completed: [...snapshot.completed, chapter], items: [...snapshot.items, ...items] };
}

// The owning world checks the local story or puzzle trigger before calling the ledger.
const DREAM_COMMANDS = {
  fire: {
    earnCandle(s) {
      if (nextDream(s) !== 'fire') return;
      return finishChapter(s, 'fire', 'Candle');
    },
  },
  earth: {
    collectPot(s, shape) {
      if (nextDream(s) !== 'earth' || s.pot.phase !== 'absent' || !shape) return;
      const { base, height, rim } = shape;
      if (![base, height, rim].every(value => Number.isFinite(value) && value >= 0 && value <= 1)) return;
      return { ...finishChapter(s, 'earth'), pot: { phase: 'empty', shape: { base, height, rim } } };
    },
  },
  water: {
    fillPot(s) {
      if (nextDream(s) !== 'water') return;
      return { pot: { ...s.pot, phase: 'filled' } };
    },
    clearBeach(s) {
      if (nextChapter(s) !== 'water' || s.pot.phase !== 'filled') return;
      return finishChapter(s, 'water');
    },
  },
  wood: {
    helpMallow(s) {
      if (nextDream(s) !== 'wood' || !hasItem(s, 'Candle')) return;
      return finishChapter(s, 'wood', 'Firewood');
    },
  },
  metal: {
    earnSword(s) {
      if (nextDream(s) !== 'metal') return;
      return { ...finishChapter(s, 'metal', 'Sword'), hearth: 'boiled' };
    },
  },
  void: {
    takeSun(s) {
      if (nextDream(s) !== 'void') return;
      return finishChapter(s, 'sun', 'Sun Essence');
    },
    defeatWizard(s) {
      if (nextChapter(s) !== 'moon' || s.wizard !== 'distant') return;
      return { wizard: 'unconscious' };
    },
    takeMoon(s) {
      if (nextChapter(s) !== 'moon' || s.wizard !== 'unconscious') return;
      return finishChapter(s, 'moon', 'Moon Essence');
    },
    bringWizardHome(s) {
      if (s.wizard !== 'unconscious' || !hasItem(s, 'Sun Essence') || !hasItem(s, 'Moon Essence')) return;
      return { wizard: 'home' };
    },
  },
};

function freezeSnapshot(snapshot) {
  // These arrays hold unique values and stay read-only and structured-cloneable for travel.
  Object.freeze(snapshot.completed);
  Object.freeze(snapshot.items);
  Object.freeze(snapshot.pot.shape);
  Object.freeze(snapshot.pot);
  Object.freeze(snapshot.thoughtsSeen);
  return Object.freeze(snapshot);
}

export function createProgress({ getActiveWorld = () => null, seed } = {}) {
  let snapshot = freezeSnapshot({
    completed: [],
    items: [],
    pot: { phase: 'absent', shape: null },
    hearth: 'empty',
    wizard: 'distant',
    ended: false,
    thoughtsSeen: [],
    ...structuredClone(seed),
  });

  function commandUpdate(command, payload) {
    const world = getActiveWorld();
    if (snapshot.ended || !WORLDS.includes(world)) return;

    if (command === 'markThoughtSeen') {
      if (typeof payload === 'string' && payload.trim() && !snapshot.thoughtsSeen.includes(payload)) {
        return { thoughtsSeen: [...snapshot.thoughtsSeen, payload] };
      }
      return;
    }

    if (world === 'overworld') {
      if (nextStationAction(snapshot) === command && command !== null) {
        return STATION_ACTIONS[snapshot.hearth].update(snapshot);
      }
      return;
    }

    const commands = DREAM_COMMANDS[world];
    if (Object.hasOwn(commands, command)) return commands[command](snapshot, payload);
  }

  return {
    read: () => snapshot,
    apply(command, payload) {
      const update = typeof command === 'string' && commandUpdate(command, payload);
      if (!update) return { changed: false, snapshot };
      const next = { ...snapshot, ...update };
      if (inventoryItems(next).length > INVENTORY_CAPACITY) return { changed: false, snapshot };
      snapshot = freezeSnapshot(next);
      return { changed: true, snapshot };
    },
  };
}
