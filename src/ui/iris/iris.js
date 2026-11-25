import markup from './iris.html?raw';
import './iris.css';

export function createIris({ mount, onCover }) {
  mount.insertAdjacentHTML('beforeend', markup);
  const cover = mount.querySelector('.dream-iris');
  const errorPanel = mount.querySelector('.dream-load-error');
  const message = errorPanel.querySelector('[role="alert"]');
  const retry = errorPanel.querySelector('[data-retry]');
  const home = errorPanel.querySelector('[data-home]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');

  let actions;
  let stopAnimation;
  retry.addEventListener('click', () => actions?.retry());
  home.addEventListener('click', () => actions?.returnHome?.());

  function clearError() {
    actions = undefined;
    errorPanel.hidden = true;
    message.textContent = '';
  }

  function finishCover(closed) {
    cover.classList.remove('is-moving');
    cover.hidden = !closed;
    onCover(closed);
  }

  function animate(closing, signal) {
    if (signal?.aborted) return Promise.reject(signal.reason);
    stopAnimation?.(new DOMException('Iris animation replaced', 'AbortError'));
    clearError();
    cover.hidden = false;
    onCover(true);
    const reduced = motion.matches;
    const duration = reduced ? 120 : closing ? 400 : 400;
    const holdDuration = closing ? 1000 : 0;
    cover.classList.toggle('is-moving', !reduced);

    return new Promise((resolve, reject) => {
      const start = performance.now();
      let frame;
      function cleanup() {
        cancelAnimationFrame(frame);
        signal?.removeEventListener('abort', onAbort);
        stopAnimation = undefined;
        cover.style.removeProperty('opacity');
      }
      function abort(reason = signal.reason) {
        cleanup();
        finishCover(true);
        reject(reason);
      }
      function render(time) {
        const elapsed = Math.min(1, Math.max(0, (time - start) / duration));
        const open = closing ? 1 - elapsed : elapsed;
        if (reduced) cover.style.opacity = 1 - open;
        else cover.style.setProperty('--aperture', `${100 * open}%`);

        if (elapsed < 1) {
          frame = requestAnimationFrame(render);
        } else {
          cleanup();
          finishCover(closing);
          resolve();
        }
      }
      function onAbort() { abort(signal.reason); }

      stopAnimation = abort;
      signal?.addEventListener('abort', onAbort, { once: true });
      render(start);
    });
  }

  return {
    close: signal => animate(true, signal),
    open: signal => animate(false, signal),
    clearError,
    showLoadError(_error, nextActions) {
      finishCover(true);
      actions = nextActions;
      message.textContent = 'The dream could not load.';
      home.hidden = !actions.returnHome;
      errorPanel.hidden = false;
      retry.focus();
    },
    dispose() {
      stopAnimation?.(new DOMException('Iris disposed', 'AbortError'));
      cover.remove();
      errorPanel.remove();
    },
  };
}
