import { createControls } from '../runtime/controls.js';
import { createInput } from '../runtime/input.js';
import { createWorldHost } from '../runtime/world-host.js';
import { createHud } from '../ui/hud/hud.js';

const LONG_LINE = 'The light on the island looks close enough to touch, but every time I take a step toward it, the whole horizon seems to drift a little farther away. I think I’ll stay here a moment and watch the sky change before I decide where to go.';
const INVENTORY_ITEMS = ['Candle', 'Sword', 'Sun Essence', 'Moon Essence'];
const CHOICES = [
  { id: 'shell', label: 'The shell siren' },
  { id: 'whistle', label: 'The missing whistle' },
  { id: 'coral', label: 'The coral reef' },
];

function waitForLoad(signal) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, 2500);
    function abort() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener('abort', abort, { once: true });
  });
}

export function createUiPreview({ mount }) {
  const fixture = document.createElement('section');
  fixture.innerHTML = `
    <h1>Dialogue</h1>
    <p>
      <button type="button" data-action="speak">Long dialogue</button>
      <button type="button" data-action="think">Thought</button>
      <button type="button" data-action="choose">Choices</button>
      <button type="button" data-action="travel">Switch scene</button>
      <button type="button" data-action="inventory" aria-pressed="false">Toggle full inventory</button>
    </p>
    <p>Toggle full inventory, then press <kbd>1</kbd>–<kbd>4</kbd> to select a slot.</p>
    <p data-selection role="status">Selected slot: None</p>
    <p data-status role="status">Opening scene…</p>
    <div data-stage style="position:relative;height:clamp(240px, 68vh, 650px)">
      <canvas tabindex="0" aria-label="Dialogue fixture scene"
        style="display:block;width:100%;height:100%;background:#426687"></canvas>
    </div>
  `;
  mount.replaceChildren(fixture);

  const canvas = fixture.querySelector('canvas');
  const stage = fixture.querySelector('[data-stage]');
  const status = fixture.querySelector('[data-status]');
  const selection = fixture.querySelector('[data-selection]');
  const inventoryToggle = fixture.querySelector('[data-action="inventory"]');
  const input = createInput(canvas);
  const controls = createControls(input);
  const ui = createHud({ mount: stage, canvas, controls });
  let current;

  const host = createWorldHost({
    controls,
    ui,
    registry: {
      async load(id) {
        const arrival = id === 'arrival';
        return ({ signal }) => ({
          async prepare() {
            if (!arrival) await waitForLoad(signal);
          },
          enter() {
            current = { id, signal };
            canvas.style.background = arrival ? '#426687' : '#826987';
            status.textContent = arrival ? 'Arrival scene' : 'Dusk scene';
            ui.objective(arrival ? 'Look out over the island' : 'Watch the dusk sky');
          },
          exit() { current = undefined; },
          dispose() {},
        });
      },
    },
  });

  let fullInventory = false;
  function showSelection() {
    const item = ui.selectedItem();
    const text = item ? `Selected slot: ${INVENTORY_ITEMS.indexOf(item) + 1} · ${item}` : 'Selected slot: None';
    if (selection.textContent !== text) selection.textContent = text;
  }

  function showInventory() {
    ui.inventory({
      items: fullInventory ? INVENTORY_ITEMS : [],
      pot: { phase: 'placed' },
    });
    inventoryToggle.setAttribute('aria-pressed', String(fullInventory));
    showSelection();
  }

  function travel() {
    const id = current?.id === 'arrival' ? 'dusk' : 'arrival';
    if (host.request({ id, spawn: 'arrival' })) status.textContent = 'Switching scene…';
  }

  function onClick(event) {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'inventory') {
      fullInventory = !fullInventory;
      showInventory();
      canvas.focus({ preventScroll: true });
      return;
    }
    if (action === 'travel') {
      travel();
      return;
    }
    if (!action || !current || controls.mode === 'transition') return;

    const { signal } = current;
    // In-game dialogue starts from the canvas, so return focus there in QA too.
    canvas.focus({ preventScroll: true });
    let response;
    if (action === 'speak') {
      response = ui.say({ speaker: 'Spirit', lines: [LONG_LINE, 'The stars are coming out.', 'Time to go.'] }, signal);
    } else if (action === 'think') {
      response = ui.say({ kind: 'thought', lines: ['Where did the Moon go?'] }, signal);
    } else {
      response = ui.choose({ prompt: 'Which clue would you show Teal?', options: CHOICES }, signal);
    }
    response.then(
      id => { status.textContent = id ? `Selected: ${id}` : 'Dialogue finished.'; },
      error => {
        if (error.name !== 'AbortError') console.error(error);
      },
    );
  }

  fixture.addEventListener('click', onClick);
  stage.addEventListener('keydown', showSelection);
  stage.addEventListener('click', showSelection);
  host.request({ id: 'arrival', spawn: 'arrival' });

  return {
    dispose() {
      host.dispose();
      ui.dispose();
      input.dispose();
      fixture.remove();
    },
  };
}
