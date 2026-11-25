import { createGame } from './app/game.js';

const mount = document.querySelector('#app');

try {
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('qa')) {
    const { mountPreview } = await import('./dev/preview.js');
    mountPreview({ mount });
  } else {
    createGame({ mount });
  }
} catch (error) {
  const notice = document.createElement('p');
  notice.setAttribute('role', 'alert');
  notice.textContent = 'Dreamweek could not start. Reload the page to try again.';
  (mount ?? document.body).replaceChildren(notice);
  console.error(error);
}
