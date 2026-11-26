import { createDialogue } from '../dialogue/dialogue.js';
import { createGuidance } from '../guidance/guidance.js';
import { createIris } from '../iris/iris.js';
import markup from './hud.html?raw';
import './hud.css';

export function createHud({ mount, canvas, controls, onPlateCovered, plateFadeInMs = 450, plateFadeOutMs = 450 }) {
  const overlay = document.createElement('div');
  overlay.className = 'dream-hud';
  const content = document.createElement('div');
  content.className = 'dream-hud-content';
  content.innerHTML = markup;
  overlay.append(content);
  mount.append(overlay);

  const guidance = createGuidance({ mount: content, canvas });
  const guidanceLayer = content.lastElementChild;
  const plate = content.querySelector('[data-plate]');
  const image = plate.querySelector('img');
  const ending = content.querySelector('.dream-ending');
  const replay = ending.querySelector('[data-replay]');
  replay.addEventListener('click', () => window.location.reload());
  const wasInert = canvas.inert;
  let covered = false;

  const dialogue = createDialogue({
    mount: content,
    controls,
    onVisibility(visible) {
      guidanceLayer.hidden = visible;
      canvas.inert = covered || visible;
    },
  });

  const iris = createIris({
    mount: overlay,
    onCover(closed) {
      const reveal = covered && !closed;
      covered = closed;
      content.inert = closed;
      canvas.inert = closed || dialogue.active;
      if (reveal) {
        if (dialogue.active) dialogue.focus();
        else canvas.focus({ preventScroll: true });
      }
    },
  });

  function showPlate(src, alt = '') {
    plate.hidden = !src;
    if (src) image.src = src;
    else image.removeAttribute('src');
    image.alt = alt;
  }

  function clearWorld() {
    if (!ending.hidden) {
      ending.hidden = true;
      canvas.inert = covered;
    }
    dialogue.cancel();
    guidance.objective(null);
    guidance.prompt(null);
    guidance.bossHealth(null);
    showPlate(null);
    iris.clearError();
  }

  async function fadePlate(src, alt, signal) {
    signal.throwIfAborted();
    const swapPlate = () => {
      onPlateCovered?.();
      showPlate(src, alt);
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      swapPlate();
      return;
    }

    const blackout = document.createElement('div');
    blackout.className = 'dream-plate-blackout';
    blackout.setAttribute('aria-hidden', 'true');
    content.append(blackout);
    let animation;
    const cancel = () => animation?.cancel();
    signal.addEventListener('abort', cancel, { once: true });
    async function fade(from, to) {
      animation = blackout.animate([{ opacity: from }, { opacity: to }], {
        duration: to === 0 ? plateFadeInMs : plateFadeOutMs, easing: 'ease-in-out', fill: 'forwards',
      });
      await animation.finished;
      signal.throwIfAborted();
    }
    try {
      await fade(0, 1);
      swapPlate();
      const cover = animation;
      const reveal = fade(1, 0);
      cover.cancel();
      await reveal;
    } finally {
      cancel();
      blackout.remove();
      signal.removeEventListener('abort', cancel);
    }
  }

  return {
    objective: guidance.objective,
    bossHealth: guidance.bossHealth,
    prompt: guidance.prompt,
    update: guidance.update,
    say: dialogue.say,
    choose: dialogue.choose,
    plate: showPlate,
    fadePlate,
    showEnding() {
      ending.hidden = false;
      canvas.inert = true;
      replay.focus({ preventScroll: true });
    },
    iris,
    showLoadError: iris.showLoadError,
    clearWorld,
    dispose() {
      clearWorld();
      iris.dispose();
      guidance.dispose();
      overlay.remove();
      canvas.inert = wasInert;
    },
  };
}
