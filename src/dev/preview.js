import { createGame } from '../app/game.js';

export function mountPreview({ mount }) {
  const panel = document.createElement('section');
  panel.innerHTML = `
    <label>
      QA fixture
      <select><option value="shell">Shell</option></select>
    </label>
    <button type="button">Reset</button>
  `;

  const fixture = panel.querySelector('select');
  const reset = panel.querySelector('button');
  const gameMount = document.createElement('div');
  const fixtures = { shell: createGame };
  let game;

  function restart() {
    game?.dispose();
    game = fixtures[fixture.value]({ mount: gameMount });
  }

  restart();
  mount.replaceChildren(panel, gameMount);
  fixture.addEventListener('change', restart);
  reset.addEventListener('click', restart);
}
