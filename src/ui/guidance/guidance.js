import { Vector3 } from 'three';
import overlayMarkup from './guidance.html?raw';
import './guidance.css';

export function createGuidance({ mount, canvas }) {
  const overlay = document.createElement('div');
  overlay.className = 'game-overlay';
  overlay.innerHTML = overlayMarkup;
  mount.append(overlay);
  const objective = overlay.querySelector('[data-objective]');
  const objectiveText = overlay.querySelector('[data-objective-text]');
  const prompt = overlay.querySelector('[data-prompt]');
  const label = prompt.querySelector('span');
  const arrow = overlay.querySelector('[data-arrow]');
  const point = new Vector3();
  const viewPoint = new Vector3();
  let hasPoint = false;

  return {
    objective(text, target) {
      objective.hidden = !text;
      if (objectiveText.textContent !== (text ?? '')) objectiveText.textContent = text ?? '';
      hasPoint = Boolean(text && target);
      if (hasPoint) point.copy(target);
      else arrow.hidden = true;
    },
    prompt(text) {
      prompt.hidden = !text;
      if (label.textContent !== (text ?? '')) label.textContent = text ?? '';
    },
    update(camera) {
      if (!hasPoint) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) {
        arrow.hidden = true;
        return;
      }

      viewPoint.copy(point).applyMatrix4(camera.matrixWorldInverse);
      const behind = viewPoint.z >= 0;
      const depth = Math.max(Math.abs(viewPoint.z), camera.near);
      const dx = viewPoint.x * camera.projectionMatrix.elements[0] * width / (2 * depth);
      const dy = -viewPoint.y * camera.projectionMatrix.elements[5] * height / (2 * depth);
      const limitX = Math.max(1, width / 2 - 24);
      const limitY = Math.max(1, height / 2 - 52);
      const extent = Math.max(Math.abs(dx) / limitX, Math.abs(dy) / limitY);
      const offscreen = behind || extent > 1;
      const x = offscreen ? (extent > 1e-6 ? dx / extent : 0) : dx;
      const y = offscreen ? (extent > 1e-6 ? dy / extent : limitY) : dy - 16;
      const angle = offscreen ? Math.atan2(y, x) : Math.PI / 2;

      arrow.style.left = `${width / 2 + x}px`;
      arrow.style.top = `${height / 2 + y}px`;
      arrow.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
      arrow.hidden = false;
    },
    dispose() { overlay.remove(); },
  };
}
