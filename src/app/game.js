export function createGame({ mount }) {
  const shell = document.createElement('section');
  shell.innerHTML = `
    <h1>Dreamweek</h1>
    <button type="button">Start</button>
    <p role="status"></p>
    <div>
      <canvas aria-label="Game canvas"></canvas>
    </div>
  `;

  const startButton = shell.querySelector('button');
  const status = shell.querySelector('[role="status"]');
  let disposed = false;

  function start() {
    if (disposed || startButton.disabled) return;

    startButton.disabled = true;
    status.textContent = 'Dreamweek is running.';
  }

  function dispose() {
    disposed = true;
    startButton.removeEventListener('click', start);
    shell.remove();
  }

  startButton.addEventListener('click', start);
  mount.replaceChildren(shell);

  return { start, dispose };
}
