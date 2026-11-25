import { createGame } from '../app/game.js';

export function createRoundTripPreview({ mount }) {
  const fixture = document.createElement('section');
  fixture.innerHTML = `
    <h2>Round trip</h2>
    <p>Use <kbd>WASD</kbd> to move and <kbd>E</kbd> to interact. In Fire, try the ring before collecting the Candle, then return whenever you’re ready.</p>
    <div data-game></div>
  `;
  mount.replaceChildren(fixture);
  const game = createGame({ mount: fixture.querySelector('[data-game]') });
  return {
    dispose() {
      game.dispose();
      fixture.remove();
    },
  };
}
