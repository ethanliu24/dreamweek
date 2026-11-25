import { canReturn, createProgress, inventoryPages, nextDream, nextStationAction } from '../state/progress.js';
const panelMarkup = `
<style>
.progress-preview {
  max-width: 64rem;
  margin: 1rem auto;
  padding: clamp(0.75rem, 3vw, 1.75rem);
  border-radius: 0.75rem;
  background: #17243b;
  color: #fff3dc;
  font: 1rem / 1.5 system-ui, sans-serif;
}

.progress-preview h1,
.progress-preview h2 {
  margin: 0 0 0.75rem;
  line-height: 1.2;
}

.progress-preview button,
.progress-preview select {
  min-height: 40px;
  padding: 0.35rem 0.65rem;
  border: 1px solid #aec2de;
  border-radius: 0.35rem;
  background: #253956;
  color: inherit;
  font: inherit;
}

.progress-preview :focus-visible {
  outline: 2px solid #f3cb82;
  outline-offset: 2px;
}

.progress-preview button:disabled {
  opacity: 0.55;
}

.progress-controls,
.progress-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.65rem;
}

.progress-controls {
  margin-bottom: 1.5rem;
}

.progress-controls label {
  display: grid;
  gap: 0.25rem;
}

.progress-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
  gap: 1.5rem;
}

.progress-preview dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 0.8rem;
  margin: 0 0 1.5rem;
}

.progress-preview dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.progress-preview [data-inventory] {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.4rem;
  list-style: none;
  padding: 0;
}

.progress-preview [data-inventory] li {
  display: grid;
  place-items: center;
  min-height: 3.5rem;
  padding: 0.25rem;
  border: 1px solid #aec2de;
  border-radius: 0.35rem;
  text-align: center;
  overflow-wrap: anywhere;
}

.progress-pager {
  align-items: center;
}

.progress-preview fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-inline-size: 0;
  margin: 0 0 0.75rem;
  border: 1px solid #aec2de;
  border-radius: 0.35rem;
}

.progress-preview [data-result] {
  min-height: 1.5em;
  margin: 0 0 0.75rem;
}
</style>

<h1>Progression ledger</h1>

<div class="progress-controls">
  <label>
    Starting snapshot
    <select data-seed>
      <option value="" data-world="overworld">New game</option>
      <option value="earnCandle" data-world="earth">Earth after Fire</option>
      <option value="collectPot" data-world="water">Water before filling</option>
      <option value="fillPot" data-world="water">Water after filling</option>
      <option value="clearBeach" data-world="overworld">Hub after Water</option>
      <option value="helpMallow" data-world="overworld">Hub after Wood</option>
      <option value="earnSword" data-world="overworld">Hub after Metal</option>
      <option value="takeSun" data-world="void">Void after Sun</option>
      <option value="defeatWizard" data-world="void">Void after finisher</option>
      <option value="takeMoon" data-world="void">Void after Moon</option>
      <option value="bringWizardHome" data-world="overworld">Hub after capture</option>
    </select>
  </label>
  <button type="button" data-reload>Reload snapshot</button>
  <label>
    Active world
    <select data-world-select>
      <option value="overworld">Overworld</option>
      <option value="fire">Fire</option>
      <option value="earth">Earth</option>
      <option value="water">Water</option>
      <option value="wood">Wood</option>
      <option value="metal">Metal</option>
      <option value="void">Void</option>
    </select>
  </label>
</div>

<div class="progress-columns">
  <section aria-labelledby="progress-state-title">
    <h2 id="progress-state-title">State</h2>
    <dl>
      <dt>Next dream</dt><dd data-value="dream"></dd>
      <dt>Return allowed</dt><dd data-value="canReturn"></dd>
      <dt>Next station action</dt><dd data-value="station"></dd>
      <dt>Completed chapters</dt><dd data-value="completed"></dd>
      <dt>Pot</dt><dd data-value="pot"></dd>
      <dt>Hearth</dt><dd data-value="hearth"></dd>
      <dt>Wizard</dt><dd data-value="wizard"></dd>
      <dt>Ended</dt><dd data-value="ended"></dd>
      <dt>Abilities</dt><dd data-value="abilities"></dd>
      <dt>Thoughts seen</dt><dd data-value="thoughts"></dd>
    </dl>

    <h2>Inventory</h2>
    <ol data-inventory>
      <li></li>
      <li></li>
      <li></li>
    </ol>
    <div class="progress-pager">
      <button type="button" data-page-step="-1">Previous</button>
      <span data-page aria-live="polite"></span>
      <button type="button" data-page-step="1">Next</button>
    </div>
  </section>

  <section aria-labelledby="progress-commands-title">
    <h2 id="progress-commands-title">Commands</h2>
    <p data-result role="status"></p>
    <fieldset>
      <legend>Ordinary dreams</legend>
      <button type="button" data-command="earnCandle">earnCandle</button>
      <button type="button" data-command="collectPot">collectPot</button>
      <button type="button" data-command="fillPot">fillPot</button>
      <button type="button" data-command="grantBubble">grantBubble</button>
      <button type="button" data-command="clearBeach">clearBeach</button>
      <button type="button" data-command="helpMallow">helpMallow</button>
      <button type="button" data-command="earnSword">earnSword</button>
    </fieldset>
    <fieldset>
      <legend>Void</legend>
      <button type="button" data-command="takeSun">takeSun</button>
      <button type="button" data-command="defeatWizard">defeatWizard</button>
      <button type="button" data-command="takeMoon">takeMoon</button>
      <button type="button" data-command="bringWizardHome">bringWizardHome</button>
    </fieldset>
    <fieldset>
      <legend>Overworld</legend>
      <button type="button" data-command="placePot">placePot</button>
      <button type="button" data-command="placeWood">placeWood</button>
      <button type="button" data-command="lightWood">lightWood</button>
      <button type="button" data-command="addSun">addSun</button>
      <button type="button" data-command="addMoon">addMoon</button>
      <button type="button" data-command="stir">stir</button>
      <button type="button" data-command="takeSoup">takeSoup</button>
      <button type="button" data-command="feed">feed</button>
    </fieldset>
    <fieldset>
      <legend>Story</legend>
      <button type="button" data-command="markThoughtSeen">markThoughtSeen</button>
    </fieldset>
  </section>
</div>
`;

const POT_SHAPE = { base: 0.35, height: 0.75, rim: 0.5 };
const PAYLOADS = {
  collectPot: POT_SHAPE,
  markThoughtSeen: 'QA_THOUGHT',
};

// Replay committed steps so every starting snapshot uses the same rules as live commands.
const JOURNEY = [
  ['fire', 'earnCandle'],
  ['earth', 'collectPot'],
  ['water', 'fillPot'],
  ['water', 'grantBubble'],
  ['water', 'clearBeach'],
  ['overworld', 'placePot'],
  ['wood', 'helpMallow'],
  ['overworld', 'placeWood'],
  ['overworld', 'lightWood'],
  ['metal', 'earnSword'],
  ['void', 'takeSun'],
  ['void', 'defeatWizard'],
  ['void', 'takeMoon'],
  ['void', 'bringWizardHome'],
];

const list = entries => entries.join(', ') || 'None';

export function createProgressPreview({ mount }) {
  const panel = document.createElement('section');
  panel.className = 'progress-preview';
  panel.innerHTML = panelMarkup;

  const seed = panel.querySelector('[data-seed]');
  const activeWorld = panel.querySelector('[data-world-select]');
  const result = panel.querySelector('[data-result]');
  const cells = [...panel.querySelectorAll('[data-inventory] li')];
  const pageLabel = panel.querySelector('[data-page]');
  const [previous, next] = panel.querySelectorAll('[data-page-step]');
  const fields = Object.fromEntries([...panel.querySelectorAll('[data-value]')].map(
    element => [element.dataset.value, element],
  ));
  let progress;
  let page;

  function render() {
    const snapshot = progress.read();
    const shape = snapshot.pot.shape;
    const pot = shape
      ? `${snapshot.pot.phase} (base ${shape.base}, height ${shape.height}, rim ${shape.rim})`
      : snapshot.pot.phase;
    const values = {
      dream: nextDream(snapshot) ?? 'None',
      canReturn: canReturn(activeWorld.value, snapshot) ? 'Yes' : 'No',
      station: nextStationAction(snapshot) ?? 'None',
      completed: list(snapshot.completed),
      pot,
      hearth: snapshot.hearth,
      wizard: snapshot.wizard,
      ended: snapshot.ended ? 'Yes' : 'No',
      abilities: list(Object.keys(snapshot.abilities).filter(ability => snapshot.abilities[ability])),
      thoughts: list(snapshot.thoughtsSeen),
    };
    for (const [key, value] of Object.entries(values)) fields[key].textContent = value;

    const pages = inventoryPages(snapshot, cells.length);
    page = Math.min(Math.max(0, page), pages.length - 1);
    cells.forEach((cell, index) => {
      cell.textContent = pages[page][index] ?? 'Empty';
    });
    previous.disabled = page === 0;
    next.disabled = page === pages.length - 1;
    pageLabel.textContent = `Page ${page + 1} of ${pages.length}`;
  }

  function loadSeed() {
    progress = createProgress({ getActiveWorld: () => activeWorld.value });
    const option = seed.selectedOptions[0];
    if (option.value) {
      for (const [world, command] of JOURNEY) {
        activeWorld.value = world;
        if (!progress.apply(command, PAYLOADS[command]).changed) {
          throw new Error(`Cannot seed the progression preview at ${command}`);
        }
        if (command === option.value) break;
      }
    }
    activeWorld.value = option.dataset.world;
    page = 0;
    result.textContent = `Loaded ${option.label}.`;
    render();
  }

  function onClick(event) {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.hasAttribute('data-reload')) {
      loadSeed();
      return;
    }

    const { command, pageStep } = button.dataset;
    if (command) {
      const { changed } = progress.apply(command, PAYLOADS[command]);
      result.textContent = changed ? `${command} applied.` : `${command} blocked. State unchanged.`;
    }
    if (pageStep) page += Number(pageStep);
    render();
  }

  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  seed.addEventListener('change', loadSeed, options);
  activeWorld.addEventListener('change', render, options);
  panel.addEventListener('click', onClick, options);
  loadSeed();
  mount.replaceChildren(panel);

  return {
    dispose() {
      listeners.abort();
      panel.remove();
    },
  };
}
