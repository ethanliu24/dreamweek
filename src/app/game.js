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

export function createGame({ mount, registry = createWorldRegistry(), initialProgress, initialWorld }) {
  const firstWorld = import.meta.env.DEV ? initialWorld ?? 'overworld' : 'overworld';
  const shell = document.createElement('section');
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

  function start() {
    if (disposed || startButton.disabled) return;
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
    menu.hidden = true;
    stage.scrollIntoView({ block: 'start' });
    const assets = createAssets();
    const audio = createMixer({ assets });
    const input = createInput(canvas);
    const controls = createControls(input);
    const player = createPlayer();
    const camera = createCameraRig(display.camera);
    camera.follow(player);
    const ui = createHud({ mount: stage, canvas, controls });
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
        if (world.surfaces) player.step(dt, { ...actions, mode, yaw: camera.yaw }, world.surfaces);
        world.update(dt, frame);
        const target = controls.mode === 'explore' ? interactions.select(player.position) : null;
        ui.prompt(target?.label);
        if (actions.interact) {
          target?.run().catch(error => {
            if (error?.name !== 'AbortError') console.error(error);
          });
        }
      },
    });

    loop = createLoop({
      update: host.update,
      render(elapsed, dt) {
        const scene = host.scene;
        if (!scene) return;
        host.present(elapsed, dt);
        camera.update(dt);
        audio.updateListener(display.camera);
        display.render(scene);
        ui.update(display.camera);
      },
    });

    async function enableSound() {
      const unlocking = audio.unlock();
      soundButton.hidden = audio.state === 'running';
      const enabled = await unlocking;
      if (disposed) return;
      const restoreFocus = enabled && document.activeElement === soundButton && !canvas.inert;
      soundButton.hidden = enabled;
      if (restoreFocus) canvas.focus({ preventScroll: true });
    }

    soundButton.addEventListener('click', enableSound);
    disposeSession = () => {
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

    void enableSound();
    const fresh = progress.read();
    equipEarnedSword(fresh);
    loop.resume();
    const spawn = firstWorld === 'overworld' && seed ? 'wake' : 'arrival';
    host.request({ id: firstWorld, spawn, progress: fresh });
  }

  startButton.addEventListener('click', start);
  mount.replaceChildren(shell);

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
