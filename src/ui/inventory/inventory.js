import { INVENTORY_CAPACITY, inventoryItems } from '../../state/progress.js';
import markup from './inventory.html?raw';
import './inventory.css';

export function createInventory({ mount, canvas, controls }) {
  mount.insertAdjacentHTML('beforeend', markup);
  const panel = mount.querySelector('.dream-inventory');
  const template = panel.querySelector('template');
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  let items = [];
  let selected = null;

  const slots = Array.from({ length: INVENTORY_CAPACITY }, (_, index) => {
    const button = template.content.firstElementChild.cloneNode(true);
    button.querySelector('kbd').textContent = index + 1;
    panel.append(button);
    button.addEventListener('click', () => {
      if (toggleSlot(index)) canvas.focus({ preventScroll: true });
    }, options);
    return { button, name: button.querySelector('[data-item-name]') };
  });

  function render() {
    slots.forEach(({ button, name }, index) => {
      const item = items[index];
      button.disabled = !item;
      button.setAttribute('aria-label', `Slot ${index + 1}: ${item ?? 'Empty'}`);
      button.setAttribute('aria-pressed', String(Boolean(item && item === selected)));
      name.textContent = item ?? 'Empty';
    });
  }

  function toggleSlot(index) {
    const item = items[index];
    if (!item || panel.closest('[inert]') || controls.mode !== 'explore') return false;
    selected = selected === item ? null : item;
    render();
    return true;
  }

  function onKeyDown(event) {
    if (event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey ||
        !/^[1-4]$/.test(event.key)) return;
    if (toggleSlot(Number(event.key) - 1)) event.preventDefault();
  }
  canvas.addEventListener('keydown', onKeyDown, options);
  panel.addEventListener('keydown', onKeyDown, options);
  render();

  return {
    update(snapshot) {
      items = inventoryItems(snapshot);
      if (!items.includes(selected)) selected = null;
      render();
    },
    selectedItem: () => selected,
    setInert(value) { panel.inert = value; },
    dispose() { listeners.abort(); panel.remove(); },
  };
}
