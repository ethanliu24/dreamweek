import { createGame } from './app/game.js';

const mount = document.querySelector('#app');

try {
  createGame({ mount });
} catch (error) {
  const notice = document.createElement('p');
  notice.setAttribute('role', 'alert');
  notice.textContent = 'Dreamweek could not start. Reload the page to try again.';
  (mount ?? document.body).replaceChildren(notice);
  console.error(error);
}
