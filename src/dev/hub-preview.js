import { createGame } from '../app/game.js';

const chapters = ['fire', 'earth', 'water', 'wood', 'metal', 'sun', 'moon'];
const seeds = {
  water: { completed: 3, items: ['Candle'], phase: 'filled', hearth: 'empty' },
  wood: { completed: 4, items: ['Candle', 'Firewood'], phase: 'placed', hearth: 'potPlaced' },
  metal: { completed: 5, items: ['Candle', 'Sword'], phase: 'placed', hearth: 'boiled' },
  moon: {
    completed: 7, items: ['Candle', 'Sword', 'Sun Essence', 'Moon Essence'],
    phase: 'placed', hearth: 'boiled', wizard: 'home',
  },
};

export function createHubPreview({ mount, after }) {
  const seed = seeds[after];
  return createGame({
    mount,
    initialProgress: {
      completed: chapters.slice(0, seed.completed),
      items: seed.items,
      pot: { phase: seed.phase, shape: { base: 0.5, height: 0.62, rim: 0.66 } },
      hearth: seed.hearth,
      wizard: seed.wizard ?? 'distant',
    },
  });
}
