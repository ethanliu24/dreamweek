import markup from './dialogue.html?raw';
import './dialogue.css';

export function createDialogue({ mount, controls, onVisibility }) {
  mount.insertAdjacentHTML('beforeend', markup);
  const panel = mount.querySelector('[data-dialogue]');
  const label = panel.querySelector('[data-dialogue-label]');
  const line = panel.querySelector('[data-line]');
  const advance = panel.querySelector('[data-continue]');
  const choices = panel.querySelector('[data-choices]');
  const choiceTemplate = panel.querySelector('[data-choice]');
  let active;

  function focus() {
    (choices.firstElementChild ?? advance).focus({ preventScroll: true });
  }

  function run(signal, setup) {
    if (signal?.aborted) return Promise.reject(signal.reason);
    cancel();
    const release = controls.acquire('dialogue');
    const previous = document.activeElement;
    const listeners = new AbortController();
    const options = { signal: listeners.signal };

    return new Promise((resolve, reject) => {
      function finish(settle, value) {
        const restore = panel.contains(document.activeElement);
        active = undefined;
        listeners.abort();
        panel.hidden = true;
        choices.replaceChildren();
        release();
        onVisibility(false);
        if (restore && previous?.isConnected) previous.focus({ preventScroll: true });
        settle(value);
      }

      function abort() {
        finish(reject, signal.reason);
      }

      active = reason => finish(reject, reason);
      signal?.addEventListener('abort', abort, { once: true, ...options });
      const next = setup(value => finish(resolve, value), options);

      panel.addEventListener('keydown', event => {
        if (event.key === 'Tab') {
          const buttons = advance.hidden ? [...choices.children] : [advance];
          const edge = event.shiftKey ? buttons[0] : buttons.at(-1);
          if (event.target === edge) {
            event.preventDefault();
            (event.shiftKey ? buttons.at(-1) : buttons[0]).focus();
          }
          return;
        }

        if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
        const isAdvance = next && ['KeyE', 'Enter', 'NumpadEnter'].includes(event.code);
        const isActivation = event.key === 'Enter' || event.code === 'Space';
        if (!isAdvance && !(event.repeat && isActivation)) return;
        event.preventDefault();
        event.stopPropagation();
        if (isAdvance && !event.repeat) next();
      }, options);

      panel.hidden = false;
      onVisibility(true);
      focus();
    });
  }

  function cancel() {
    active?.(new DOMException('Dialogue cancelled', 'AbortError'));
  }

  return {
    focus() { if (active) focus(); },
    get active() { return Boolean(active); },
    cancel,
    say({ kind, speaker, lines }, signal) {
      if (!lines.length) return signal?.aborted ? Promise.reject(signal.reason) : Promise.resolve();
      return run(signal, (done, options) => {
        let index = 0;
        label.textContent = kind === 'thought' ? 'Thought' : speaker || 'Dreamweek';
        line.textContent = lines[index];
        advance.hidden = false;
        function next() {
          index += 1;
          if (index === lines.length) done();
          else {
            line.textContent = lines[index];
            line.scrollTop = 0;
            panel.scrollTop = 0;
          }
        }
        advance.addEventListener('click', next, options);
        return next;
      });
    },
    choose({ prompt, options: answers }, signal) {
      if (!answers.length) return Promise.reject(new RangeError('At least one choice is required'));
      return run(signal, (done, options) => {
        label.textContent = prompt;
        line.textContent = '';
        advance.hidden = true;
        for (const { id, label: text } of answers) {
          const button = choiceTemplate.content.firstElementChild.cloneNode(true);
          button.textContent = text;
          button.addEventListener('click', () => done(id), options);
          choices.append(button);
        }
      });
    },
  };
}
