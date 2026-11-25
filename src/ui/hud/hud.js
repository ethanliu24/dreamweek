import { inventoryPages } from '../../state/progress.js';
import { createDialogue } from '../dialogue/dialogue.js';
import { createGuidance } from '../guidance/guidance.js';
import { createIris } from '../iris/iris.js';
import markup from './hud.html?raw';
import './hud.css';

export function createHud({ mount, canvas, controls, cellsPerPage = 3 }) {
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
  const inventory = content.querySelector('[data-inventory]');
  const list = inventory.querySelector('[data-items]');
  const itemTemplate = inventory.querySelector('[data-item]');
  const abilities = inventory.querySelector('[data-abilities]');
  const pager = inventory.querySelector('[data-pager]');
  const previous = pager.querySelector('[data-prev]');
  const next = pager.querySelector('[data-next]');
  const pageStatus = pager.querySelector('[data-page]');
  const wasInert = canvas.inert;
  let pages = [[]];
  let page = 0;
  let covered = false;

  const dialogue = createDialogue({
    mount: content,
    controls,
    onVisibility(visible) {
      guidanceLayer.hidden = visible;
      inventory.inert = visible;
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

  function renderPage() {
    const cells = pages[page].map(name => {
      const cell = itemTemplate.content.firstElementChild.cloneNode(true);
      cell.textContent = name;
      return cell;
    });
    if (!cells.length) {
      const empty = itemTemplate.content.firstElementChild.cloneNode(true);
      empty.textContent = 'Empty';
      cells.push(empty);
    }
    list.replaceChildren(...cells);
    pager.hidden = pages.length < 2;
    previous.setAttribute('aria-disabled', String(page === 0));
    next.setAttribute('aria-disabled', String(page === pages.length - 1));
    pageStatus.textContent = `Page ${page + 1} of ${pages.length}`;
  }

  previous.addEventListener('click', () => {
    if (page > 0) {
      page -= 1;
      renderPage();
    }
  });
  next.addEventListener('click', () => {
    if (page < pages.length - 1) {
      page += 1;
      renderPage();
    }
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
    showPlate(null);
    iris.clearError();
  }

  return {
    objective: guidance.objective,
    prompt: guidance.prompt,
    update: guidance.update,
    say: dialogue.say,
    choose: dialogue.choose,
    plate: showPlate,
    iris,
    showLoadError: iris.showLoadError,
    inventory(snapshot) {
      pages = inventoryPages(snapshot, cellsPerPage);
      page = Math.min(page, pages.length - 1);
      for (const ability of abilities.children) ability.hidden = !snapshot.abilities[ability.dataset.ability];
      abilities.hidden = [...abilities.children].every(ability => ability.hidden);
      inventory.hidden = false;
      renderPage();
    },
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
