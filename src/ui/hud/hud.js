import { createDialogue } from '../dialogue/dialogue.js';
import { createGuidance } from '../guidance/guidance.js';
import { createIris } from '../iris/iris.js';
import markup from './hud.html?raw';
import './hud.css';

export function createHud({ mount, canvas, controls }) {
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
    dialogue.cancel();
    guidance.objective(null);
    guidance.prompt(null);
    guidance.bossHealth(null);
    showPlate(null);
    iris.clearError();
  }

  return {
    objective: guidance.objective,
    bossHealth: guidance.bossHealth,
    prompt: guidance.prompt,
    update: guidance.update,
    say: dialogue.say,
    choose: dialogue.choose,
    plate: showPlate,
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
