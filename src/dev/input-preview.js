import { createControls } from '../runtime/controls.js';
import { createInput } from '../runtime/input.js';
import { createLoop } from '../runtime/loop.js';

export function createInputPreview({ mount }) {
  const fixture = document.createElement('section');
  fixture.innerHTML = `
    <h1>Input</h1>
    <p id="qa-input-help">Focus the input surface, then use WASD, Space, E, Q, Enter or the mouse.</p>
    <canvas tabindex="0" aria-label="Input surface" aria-describedby="qa-input-help" width="480" height="160"
      style="display:block;max-width:100%;background:#17243b;touch-action:none"></canvas>
    <p data-readout></p>
    <button type="button">UI click</button>
    <fieldset>
      <legend>Control locks</legend>
      <label><input type="checkbox" value="puzzle"> Puzzle</label>
      <label><input type="checkbox" value="story"> Story</label>
      <label><input type="checkbox" value="dialogue"> Dialogue</label>
      <label><input type="checkbox" value="ending"> Ending</label>
      <label><input type="checkbox" value="transition"> Transition</label>
    </fieldset>
  `;
  mount.replaceChildren(fixture);

  const input = createInput(fixture.querySelector('canvas'));
  const controls = createControls(input);
  const readout = fixture.querySelector('[data-readout]');
  const uiButton = fixture.querySelector('button');
  const fieldset = fixture.querySelector('fieldset');
  const releases = new Map();
  const counts = { interact: 0, attack: 0, jump: 0, ultimate: 0, advance: 0, primaryPressed: 0 };
  let uiClicks = 0;
  let lastDrag = '0, 0';
  let lastOrbit = '0, 0';

  function onLockChange({ target }) {
    const mode = target.value;
    if (target.checked) releases.set(mode, controls.acquire(mode));
    else {
      releases.get(mode)?.();
      releases.delete(mode);
    }
  }

  function onUiClick() {
    uiClicks++;
  }

  fieldset.addEventListener('change', onLockChange);
  uiButton.addEventListener('click', onUiClick);

  const loop = createLoop({
    update() {
      const actions = controls.sample();
      for (const action of Object.keys(counts)) {
        if (actions[action]) counts[action]++;
      }
      if (actions.dragX || actions.dragY) lastDrag = `${actions.dragX}, ${actions.dragY}`;
      if (actions.orbitX || actions.orbitY) lastOrbit = `${actions.orbitX}, ${actions.orbitY}`;

      const text = [
        `Mode ${controls.mode}`,
        `Move X ${actions.moveX}, Z ${actions.moveZ}`,
        `Primary ${actions.primaryHeld ? 'held' : 'released'}`,
        `Secondary ${actions.secondaryHeld ? 'held' : 'released'}`,
        `E presses ${counts.interact}`,
        `Attacks ${counts.attack}`,
        `Jumps ${counts.jump}`,
        `Ultimate presses ${counts.ultimate}`,
        `Advances ${counts.advance}`,
        `Puzzle presses ${counts.primaryPressed}`,
        `UI clicks ${uiClicks}`,
        `Last drag ${lastDrag}`,
        `Last orbit ${lastOrbit}`,
      ].join(' · ');
      if (readout.textContent !== text) readout.textContent = text;
    },
    render() {},
  });
  loop.resume();

  return {
    dispose() {
      loop.dispose();
      fieldset.removeEventListener('change', onLockChange);
      uiButton.removeEventListener('click', onUiClick);
      for (const release of releases.values()) release();
      input.dispose();
      fixture.remove();
    },
  };
}
