import { PerspectiveCamera, Vector3 } from 'three';
import { audioManifest } from '../audio/manifest.js';
import { createMixer } from '../audio/mixer.js';
import { createAssets } from '../runtime/assets.js';

const QA_CUES = {
  'qa.music.a': { category: 'music', gain: 0.16, synth: { type: 'sine', hz: 196 } },
  'qa.music.b': { category: 'music', gain: 0.14, synth: { type: 'sine', hz: 261.63 } },
  'qa.emitter': { category: 'effects', gain: 0.24, synth: { type: 'triangle', hz: 415, duration: 0.55 } },
  'qa.missing': { category: 'effects', file: 'assets/audio/qa-intentionally-missing.ogg', fallback: 'shared.obtain' },
};

export function createAudioPreview({ mount }) {
  const panel = document.createElement('section');
  panel.innerHTML = `
    <style>
      .audio-preview { max-width: 44rem; margin: 1rem auto; padding: 0.75rem; }
      .audio-preview fieldset { display: grid; gap: 0.5rem; margin: 0.75rem 0; }
      .audio-preview [data-orbit-map] {
        position: relative; width: min(11rem, 90vw); aspect-ratio: 1; border: 1px solid;
        border-radius: 50%; margin: 0.5rem 0;
      }
      .audio-preview [data-emitter], .audio-preview [data-listener] {
        position: absolute; top: 50%; left: 50%; translate: -50% -50%; white-space: nowrap;
      }
    </style>
    <h1>Audio</h1>
    <button type="button" data-start>Start sound</button>
    <p role="status" data-status>Sound is locked.</p>
    <p data-counts></p>
    <fieldset>
      <legend>World profile</legend>
      <label><input type="radio" name="audio-profile" value="a" checked> A</label>
      <label><input type="radio" name="audio-profile" value="b"> B</label>
      <label><input type="radio" name="audio-profile" value="silent"> Silent</label>
    </fieldset>
    <fieldset>
      <legend>Local sample</legend>
      <label>Choose audio file <input type="file" accept="audio/*" data-file></label>
      <div>
        <button type="button" data-action="sample" disabled>Play sample</button>
        <button type="button" data-action="loop" disabled>Loop sample</button>
        <button type="button" data-action="stop" disabled>Stop sample loop</button>
      </div>
    </fieldset>
    <fieldset>
      <legend>Positional sound</legend>
      <div>
        <button type="button" data-action="emitter" disabled>Start emitter</button>
        <button type="button" data-action="missing" disabled>Play missing cue</button>
      </div>
      <label>Orbit listener <input type="range" min="0" max="360" value="45" data-orbit></label>
      <div data-orbit-map aria-hidden="true"><span data-emitter>●</span><span data-listener>▲</span></div>
    </fieldset>
    <fieldset>
      <legend>Volumes</legend>
      <label>Master <input type="range" min="0" max="1" step="0.01" value="0.8" data-volume="master"></label>
      <label>Music <input type="range" min="0" max="1" step="0.01" value="0.65" data-volume="music"></label>
      <label>Ambience <input type="range" min="0" max="1" step="0.01" value="0.7" data-volume="ambience"></label>
      <label>Effects <input type="range" min="0" max="1" step="0.01" value="0.8" data-volume="effects"></label>
    </fieldset>
  `;
  panel.className = 'audio-preview';
  mount.replaceChildren(panel);

  const manifest = { ...audioManifest, ...QA_CUES };
  const assets = createAssets();
  const mixer = createMixer({ assets, manifest });
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const start = panel.querySelector('[data-start]');
  const status = panel.querySelector('[data-status]');
  const counts = panel.querySelector('[data-counts]');
  const fileInput = panel.querySelector('[data-file]');
  const orbit = panel.querySelector('[data-orbit]');
  const marker = panel.querySelector('[data-listener]');
  const camera = new PerspectiveCamera();
  const emitterPosition = new Vector3();
  const buttons = Object.fromEntries([...panel.querySelectorAll('[data-action]')].map(
    button => [button.dataset.action, button],
  ));
  let owner;
  let pending;
  let url;
  let emitter;
  let loop;
  let started = false;

  function positionListener() {
    const angle = Number(orbit.value) * Math.PI / 180;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    camera.position.set(x * 4, 0, z * 4);
    // Keep facing a fixed direction so orbiting changes which ear hears the emitter.
    mixer.updateListener(camera);
    marker.style.left = `${50 + x * 44}%`;
    marker.style.top = `${50 + z * 44}%`;
  }

  function refreshButtons() {
    const available = mixer.state === 'running' && Boolean(owner);
    buttons.sample.disabled = !available || !owner.sample;
    buttons.loop.disabled = !available || !owner.sample || Boolean(loop);
    buttons.stop.disabled = !loop;
    buttons.emitter.disabled = !available;
    buttons.emitter.textContent = emitter ? 'Stop emitter' : 'Start emitter';
    buttons.missing.disabled = !available;
    start.disabled = mixer.state === 'running';
    start.textContent = started ? 'Enable sound' : 'Start sound';
  }

  async function changeProfile() {
    if (!started || mixer.state !== 'running') return;
    if (pending) mixer.leave(pending.id, { crossfade: false });

    const name = panel.querySelector('[name="audio-profile"]:checked').value;
    const id = Symbol(name);
    const scope = mixer.scope(id);
    const draft = { id, scope, sample: Boolean(url) };
    pending = draft;
    const profile = {
      music: name === 'silent' ? undefined : `qa.music.${name}`,
      cues: draft.sample ? ['qa.sample', 'qa.sample.loop', 'qa.missing'] : ['qa.missing'],
    };
    status.textContent = 'Preparing audio…';
    try {
      const playable = await scope.prepare(profile);
      if (pending !== draft) return;
      if (owner) mixer.leave(owner.id);
      loop = undefined;
      emitter = undefined;
      draft.sample = playable.has('qa.sample');
      owner = draft;
      scope.enter(profile);
      const profileStatus = name === 'silent' ? 'Silent profile active.' : `Profile ${name.toUpperCase()} active.`;
      status.textContent = url && !draft.sample ? `${profileStatus} This sample could not be decoded.` : profileStatus;
    } catch (error) {
      if (pending === draft && error.name !== 'AbortError') status.textContent = 'Audio preparation was interrupted.';
    } finally {
      if (pending === draft) pending = undefined;
      refreshButtons();
    }
  }

  start.addEventListener('click', async () => {
    if (!await mixer.unlock()) {
      status.textContent = 'Sound is unavailable. Enable sound to try again.';
      start.textContent = 'Enable sound';
      return;
    }
    started = true;
    positionListener();
    await changeProfile();
  }, options);

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(file);
    manifest['qa.sample'] = { category: 'effects', gain: 0.65, file: url };
    manifest['qa.sample.loop'] = { category: 'ambience', gain: 0.40, file: url, loop: true };
    void changeProfile();
  }, options);

  panel.addEventListener('input', event => {
    const { volume } = event.target.dataset;
    if (volume) mixer.setVolume(volume, Number(event.target.value));
    if (event.target === orbit) positionListener();
  }, options);
  panel.addEventListener('change', event => {
    if (event.target.name === 'audio-profile') void changeProfile();
  }, options);
  panel.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action || !owner) return;
    switch (action) {
      case 'sample': owner.scope.play('qa.sample'); break;
      case 'loop': loop = owner.scope.play('qa.sample.loop'); break;
      case 'stop': loop?.stop(); loop = undefined; break;
      case 'emitter':
        if (emitter) {
          emitter.stop();
          emitter = undefined;
        } else {
          emitter = owner.scope.play('qa.emitter', { position: emitterPosition, loop: true, gain: 0.35 });
        }
        break;
      case 'missing':
        owner.scope.play('qa.missing');
        status.textContent = 'Missing cue requested. Playing the fallback chime.';
        break;
    }
    refreshButtons();
  }, options);

  let frame;
  let display = '';
  let lastState;
  function monitor() {
    const next = `Audio ${mixer.state} · Voices ${mixer.voiceCount} · Cached buffers ${assets.size}`;
    if (next !== display) counts.textContent = display = next;
    if (lastState !== mixer.state) {
      lastState = mixer.state;
      refreshButtons();
    }
    frame = requestAnimationFrame(monitor);
  }
  positionListener();
  monitor();

  return {
    dispose() {
      listeners.abort();
      cancelAnimationFrame(frame);
      pending = undefined;
      mixer.dispose();
      if (url) URL.revokeObjectURL(url);
      panel.remove();
    },
  };
}
