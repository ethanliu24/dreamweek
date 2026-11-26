const CHAPTERS = ['fire', 'earth', 'water', 'wood', 'metal', 'sun', 'moon'];
const WORLDS = ['overworld', 'fire', 'earth', 'water', 'wood', 'metal', 'void'];

const completed = (snapshot, chapter) => snapshot.completed.includes(chapter);
const nextChapter = snapshot => CHAPTERS.find(chapter => !completed(snapshot, chapter));

export function nextDream(snapshot) {
  if (snapshot.ended) return null;

  switch (nextChapter(snapshot)) {
    case 'fire': return 'fire';
    case 'earth': return completed(snapshot, 'fire') ? 'earth' : null;
    case 'water': return snapshot.pot.phase === 'empty' ? 'water' : null;
    case 'wood': return snapshot.hearth === 'potPlaced' ? 'wood' : null;
    case 'metal': return snapshot.hearth === 'lit' ? 'metal' : null;
    case 'sun': return snapshot.hearth === 'boiled' && completed(snapshot, 'metal') ? 'void' : null;
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
    ready: s => completed(s, 'wood'),
    update: () => ({ hearth: 'woodPlaced' }),
  },
  woodPlaced: {
    command: 'lightWood',
    ready: s => completed(s, 'fire'),
    update: () => ({ hearth: 'lit' }),
  },
  boiled: {
    command: 'addSun',
    ready: s => s.wizard === 'home' && completed(s, 'sun'),
    update: () => ({ hearth: 'sunAdded' }),
  },
  sunAdded: {
    command: 'addMoon',
    ready: s => completed(s, 'moon'),
    update: () => ({ hearth: 'moonAdded' }),
  },
  moonAdded: {
    command: 'stir',
    ready: s => completed(s, 'metal'),
    update: () => ({ hearth: 'stirred' }),
  },
  stirred: {
    command: 'takeSoup',
    ready: () => true,
    update: () => ({ hearth: 'served' }),
  },
  served: {
    command: 'feed',
    ready: s => s.wizard === 'home',
    update: () => ({ wizard: 'fed', ended: true }),
  },
};

export function nextStationAction(snapshot) {
  const action = STATION_ACTIONS[snapshot.hearth];
  return !snapshot.ended && action?.ready(snapshot) ? action.command : null;
}

function finishChapter(snapshot, chapter) {
  return { completed: [...snapshot.completed, chapter] };
}

// The owning world checks the local story or puzzle trigger before calling the ledger.
const DREAM_COMMANDS = {
  fire: {
    earnCandle(s) {
      if (nextDream(s) !== 'fire') return;
      return finishChapter(s, 'fire');
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
      if (nextDream(s) !== 'wood' || !completed(s, 'fire')) return;
      return finishChapter(s, 'wood');
    },
  },
  metal: {
    earnSword(s) {
      if (nextDream(s) !== 'metal') return;
      return { ...finishChapter(s, 'metal'), hearth: 'boiled' };
    },
  },
  void: {
    defeatWizard(s) {
      if (s.wizard !== 'distant' || (nextDream(s) !== 'void' && nextChapter(s) !== 'moon')) return;
      return { wizard: 'unconscious' };
    },
    takeEssences(s) {
      if (s.wizard !== 'unconscious') return;
      if (nextDream(s) === 'void') {
        return { completed: [...s.completed, 'sun', 'moon'] };
      }
      if (nextChapter(s) === 'moon' && completed(s, 'sun')) return finishChapter(s, 'moon');
    },
    bringWizardHome(s) {
      if (s.wizard !== 'unconscious' || !completed(s, 'sun') || !completed(s, 'moon')) return;
      return { wizard: 'home' };
    },
  },
};

function freezeSnapshot(snapshot) {
  // These arrays hold unique values and stay read-only and structured-cloneable for travel.
  Object.freeze(snapshot.completed);
  Object.freeze(snapshot.pot.shape);
  Object.freeze(snapshot.pot);
  Object.freeze(snapshot.thoughtsSeen);
  return Object.freeze(snapshot);
}

export function createProgress({ getActiveWorld = () => null, seed } = {}) {
  let snapshot = freezeSnapshot({
    completed: [],
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
      snapshot = freezeSnapshot(next);
      return { changed: true, snapshot };
    },
  };
}
