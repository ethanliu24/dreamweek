import { Vector3 } from 'three';
import { createMixer } from '../audio/mixer.js';
import { createCameraRig } from '../player/camera.js';
import { createPlayer } from '../player/controller.js';
import { createAssets, disposeScene } from '../runtime/assets.js';
import { createControls } from '../runtime/controls.js';
import { createDisplay } from '../runtime/display.js';
import { createInput } from '../runtime/input.js';
import { createLoop } from '../runtime/loop.js';
import { createWorldHost } from '../runtime/world-host.js';
import { canReturn, createProgress, nextDream } from '../state/progress.js';
import { createHud } from '../ui/hud/hud.js';
import { createWorldRegistry } from '../worlds/registry.js';
import { createSword } from '../shared/props/sword.js';
import markup from './game.html?raw';
import './game.css';

const SHARED_AUDIO = { cues: ['shared.interaction'] };

// Latern bloom settings. Strength controls intensity, radius controls spread,
// and threshold controls which highlights glow. Set strength to 0 to disable.
const WORLD_GLOW = {
  'Overworld': { strength: 0.22, radius: 0.75, threshold: 0.97 },
  'Fire': { strength: 0.05, radius: 0.1, threshold: 0.97 },
  'Earth': { strength: 0.22, radius: 0.75, threshold: 0.97 },
  'Water': { strength: 0.22, radius: 0.75, threshold: 0.97 },
}

// Intro fade timings in milliseconds.
const TITLE_FADE_IN_MS = 1500;
const INTRO_FADE_IN_MS = 450;
const INTRO_FADE_OUT_MS = 1000;

export function createGame({ mount, registry = createWorldRegistry(), initialProgress, initialWorld }) {
  const firstWorld = import.meta.env.DEV ? initialWorld ?? 'overworld' : 'overworld';
  const liveTitle = firstWorld === 'overworld' && !initialProgress;
  const shell = document.createElement('section');
  shell.classList.add('dreamweek');
  shell.innerHTML = markup;
  const menu = shell.querySelector('.dreamweek-menu');
  const startButton = shell.querySelector('[data-start]');
  const soundButton = shell.querySelector('[data-sound]');
  const status = shell.querySelector('[data-status]');
  const stage = shell.querySelector('.dreamweek-stage');
  const canvas = stage.querySelector('canvas');
  let disposeSession;
  let loop;
  let disposed = false;
  let wake;

  if (liveTitle) {
    shell.classList.add('has-live-title', 'is-title');
    shell.style.setProperty('--title-fade-in', `${TITLE_FADE_IN_MS}ms`);
    shell.style.setProperty('--intro-fade-out', `${INTRO_FADE_OUT_MS}ms`);
    startButton.textContent = 'Start';
    startButton.disabled = true;
  }

  function boot() {
    if (disposed || disposeSession) return;
    if (!registry.has(firstWorld)) {
      status.textContent = 'The starting world is not available yet.';
      return;
    }

    stage.hidden = false;
    let display;
    try {
      display = createDisplay(canvas);
    } catch (error) {
      stage.hidden = true;
      status.textContent = 'Dreamweek needs WebGL 2 to start.';
      console.error(error);
      return;
    }

    startButton.disabled = true;
    status.textContent = '';
    if (!liveTitle) {
      menu.hidden = true;
      stage.scrollIntoView({ block: 'start' });
    }
    const assets = createAssets();
    const audio = createMixer({ assets });
    const input = createInput(canvas);
    const controls = createControls(input);
    const player = createPlayer();
    const camera = createCameraRig(display.camera);
    camera.follow(player);
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const titleCamera = liveTitle ? display.camera.clone() : null;
    const titleTarget = new Vector3(0, -0.3, 0);
    let titleScenery;
    let atTitle = liveTitle;

    function disposeTitleScenery() {
      if (!titleScenery) return;
      disposeScene(titleScenery.scene);
      titleScenery = undefined;
    }

    const ui = createHud({
      mount: stage, canvas, controls,
      plateFadeInMs: INTRO_FADE_IN_MS,
      plateFadeOutMs: INTRO_FADE_OUT_MS,
      onPlateCovered: disposeTitleScenery,
    });
    const seed = import.meta.env.DEV ? initialProgress : undefined;
    const ledger = createProgress({ getActiveWorld: () => host.activeWorld, seed });
    let sword;
    function equipEarnedSword(snapshot) {
      if (!sword && snapshot.completed.includes('metal')) {
        sword = createSword();
        player.setHeld(sword);
      }
    }
    const progress = {
      read: ledger.read,
      apply(command, payload) {
        const result = ledger.apply(command, payload);
        if (result.changed) equipEarnedSword(result.snapshot);
        return result;
      },
    };

    const host = createWorldHost({
      registry, controls, ui, assets, audio, progress, player, camera, canvas, viewCamera: display.camera,
      coverInitial: !liveTitle,
      resolveTravel({ kind, entry }) {
        const snapshot = progress.read();
        if (kind === 'enterNext' && entry.id === 'overworld') {
          const id = nextDream(snapshot);
          if (id && registry.has(id)) return { id, spawn: 'arrival', progress: snapshot };
        }
        if (kind === 'returnHome' && canReturn(entry.id, snapshot)) {
          return { id: 'overworld', spawn: 'wake', progress: snapshot };
        }
      },
      stepWorld(world, dt, frame, interactions) {
        const { mode, actions } = frame;
        camera.orbit(actions.orbitX, actions.orbitY);
        if (world.surfaces) {
          frame.playerMotion = player.step(dt, { ...actions, mode, yaw: camera.yaw }, world.surfaces);
        }
        world.update(dt, frame);
        const target = controls.mode === 'explore' ? interactions.select(player.position) : null;
        ui.prompt(target?.label);
        if (actions.interact && target) {
          audio.play('shared.interaction');
          target.run().catch(error => {
            if (error?.name !== 'AbortError') console.error(error);
          });
        }
      },
    });

    loop = createLoop({
      update: host.update,
      render(elapsed, dt) {
        camera.update(dt);
        if (titleScenery) {
          const time = reducedMotion.matches ? 0 : elapsed;
          const angle = 2.6 + time * 0.07;
          titleCamera.position.set(Math.sin(angle) * 19, 5.2 + Math.sin(time * 0.2) * 0.65, Math.cos(angle) * 19);
          titleCamera.lookAt(titleTarget);
          if (titleCamera.aspect !== display.camera.aspect) {
            titleCamera.aspect = display.camera.aspect;
            titleCamera.updateProjectionMatrix();
          }
          titleScenery.animate(time, titleTarget);
          display.render(titleScenery.scene, WORLD_GLOW['Overworld'], titleCamera);
          return;
        }
        const scene = host.scene;
        if (!scene) return;
        host.present(elapsed, dt);
        audio.updateListener(display.camera);
        display.render(scene, WORLD_GLOW[scene.name]);
        ui.update(display.camera);
      },
    });

    async function enableSound() {
      const unlocking = audio.unlock();
      soundButton.hidden = audio.state === 'running';
      const enabled = await unlocking;
      if (disposed) return;
      if (enabled) {
        void audio.prepare(SHARED_AUDIO).catch(error => {
          if (error?.name !== 'AbortError') console.error(error);
        });
      }
      const restoreFocus = enabled && document.activeElement === soundButton && !canvas.inert;
      soundButton.hidden = enabled;
      if (restoreFocus) canvas.focus({ preventScroll: true });
    }

    soundButton.addEventListener('click', enableSound);
    wake = () => {
      if (!atTitle) return;
      atTitle = false;
      shell.classList.remove('is-title');
      menu.classList.add('is-waking');
      menu.inert = true;
      canvas.focus({ preventScroll: true });
      void enableSound();
      loadFirstWorld();
    };
    disposeSession = () => {
      disposeTitleScenery();
      soundButton.removeEventListener('click', enableSound);
      loop.dispose();
      host.dispose();
      ui.dispose();
      input.dispose();
      player.dispose();
      if (sword) disposeScene(sword);
      audio.dispose();
      display.dispose();
    };

    function loadFirstWorld() {
      const fresh = progress.read();
      equipEarnedSword(fresh);
      const spawn = firstWorld === 'overworld' && seed ? 'wake' : 'arrival';
      host.request({ id: firstWorld, spawn, progress: fresh });
    }

    async function loadTitleScenery() {
      try {
        const { createScenery } = await import('../worlds/overworld/scenery.js');
        if (disposed) return;
        titleScenery = createScenery({ showContact: false });
      } catch (error) {
        console.error('Title scenery could not load', error);
      }
      if (disposed) return;
      startButton.disabled = false;
      shell.classList.add('title-ready');
    }

    loop.resume();
    if (liveTitle) {
      void loadTitleScenery();
    } else {
      void enableSound();
      loadFirstWorld();
    }
  }

  function start() {
    if (disposed || startButton.disabled) return;
    if (liveTitle) wake?.();
    else boot();
  }

  startButton.addEventListener('click', start);
  mount.replaceChildren(shell);
  if (liveTitle) boot();

  return {
    start,
    pause() { loop?.pause(); },
    resume() { loop?.resume(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      startButton.removeEventListener('click', start);
      disposeSession?.();
      shell.remove();
    },
  };
}
