import { createGame } from '../app/game.js';

const chapters = ['fire', 'earth', 'water', 'wood', 'metal', 'sun', 'moon'];
const seeds = {
  water: { completed: 3, phase: 'filled', hearth: 'empty' },
  wood: { completed: 4, phase: 'placed', hearth: 'potPlaced' },
  metal: { completed: 5, phase: 'placed', hearth: 'boiled' },
  moon: {
    completed: 7,
    phase: 'placed', hearth: 'boiled', wizard: 'home',
  },
};

export function createHubPreview({ mount, after }) {
  const seed = seeds[after];
  return createGame({
    mount,
    initialProgress: {
      completed: chapters.slice(0, seed.completed),
      pot: { phase: seed.phase, shape: { base: 0.5, height: 0.62, rim: 0.66 } },
      hearth: seed.hearth,
      wizard: seed.wizard ?? 'distant',
    },
  });
}
