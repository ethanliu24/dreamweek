import markup from './dialogue.html?raw';
import './dialogue.css';

const CHARACTERS_PER_SECOND = 55;
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export function createDialogue({ mount, controls, onVisibility }) {
  mount.insertAdjacentHTML('beforeend', markup);
  const panel = mount.querySelector('[data-dialogue]');
  const label = panel.querySelector('[data-dialogue-label]');
  const line = panel.querySelector('[data-line]');
  const revealed = line.querySelector('[data-revealed]');
  const unrevealed = line.querySelector('[data-unrevealed]');
  const announcement = panel.querySelector('[data-announcement]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
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
        let frame;
        let text;
        label.textContent = kind === 'thought' ? `Player (Thought)` : speaker || 'Dreamweek';
        advance.hidden = false;
        line.hidden = false;

        function completeLine() {
          cancelAnimationFrame(frame);
          frame = undefined;
          revealed.textContent = text;
          unrevealed.textContent = '';
        }

        function showLine() {
          text = lines[index];
          announcement.textContent = text;
          panel.scrollTop = 0;
          if (motion.matches || !text) {
            completeLine();
            return;
          }

          const offsets = Array.from(segmenter.segment(text), part => part.index);
          const start = performance.now();
          revealed.textContent = '';
          unrevealed.textContent = text;

          function reveal(now) {
            const count = Math.max(0, Math.floor((now - start) * CHARACTERS_PER_SECOND / 1000));
            if (motion.matches || count >= offsets.length) {
              completeLine();
              return;
            }
            const end = offsets[count];
            revealed.textContent = text.slice(0, end);
            unrevealed.textContent = text.slice(end);
            frame = requestAnimationFrame(reveal);
          }

          frame = requestAnimationFrame(reveal);
        }

        function next() {
          if (frame !== undefined) {
            completeLine();
            return;
          }
          index += 1;
          if (index === lines.length) done();
          else showLine();
        }

        options.signal.addEventListener('abort', () => {
          cancelAnimationFrame(frame);
          announcement.textContent = '';
        }, { once: true });
        showLine();
        advance.addEventListener('click', next, options);
        return next;
      });
    },
    choose({ prompt, options: answers }, signal) {
      if (!answers.length) return Promise.reject(new RangeError('At least one choice is required'));
      return run(signal, (done, options) => {
        label.textContent = prompt;
        line.hidden = true;
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
