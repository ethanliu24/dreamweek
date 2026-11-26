import {
  DoubleSide, Group, MathUtils, Mesh, MeshBasicMaterial,
  RingGeometry, Vector3,
} from 'three';
import { WIZARD_COLLAPSE_ANGLE } from '../../shared/actors/wizard.js';
import { createEssence } from '../../shared/props/essence.js';
import { VOID_BOSS_END } from './lines.js';

export function createFinish(scene, wizard, { camera, controls, interactions, player, progress, signal, travel, ui }, keepInside) {
  const slash = new Mesh(new RingGeometry(0.95, 1.13, 32, 1, 0, Math.PI * 1.45),
    new MeshBasicMaterial({ color: 0xffdd70, transparent: true, side: DoubleSide, depthWrite: false, toneMapped: false }));
  const essences = new Group();
  const sun = createEssence('sun');
  const moon = createEssence('moon');
  sun.root.position.x = -0.37;
  moon.root.position.x = 0.37;
  essences.add(sun.root, moon.root);
  slash.visible = essences.visible = false;
  scene.add(slash, essences);

  const pickup = new Vector3();
  const unregister = [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let phase = 'waiting';
  let elapsed = 0;
  let release;

  function setPhase(next) {
    phase = next;
    elapsed = 0;
  }

  function showPickup() {
    setPhase('pickup');
    pickup.set(0, 0, 1.38).applyAxisAngle(wizard.up, wizard.rotation.y).add(wizard.position).setY(0);
    keepInside(pickup);
    essences.position.copy(pickup).setY(0.72);
    essences.rotation.y = wizard.rotation.y;
    essences.visible = true;
    ui.objective('Collect Sun and Moon Essence', pickup);
  }

  function showCapture() {
    setPhase('capture');
    essences.visible = false;
    ui.objective('Bring the Wizard home', wizard.position);
  }

  function stopPose() {
    player.setPose('idle');
    release?.();
    release = undefined;
  }

  return {
    enter() {
      unregister.push(
        interactions.register({
          id: 'void-essences', point: pickup, label: 'Collect both essences', enabled: () => phase === 'pickup',
          run() { if (progress.apply('takeEssences').changed) showCapture(); },
        }),
        interactions.register({
          id: 'void-capture', point: wizard.position, label: 'Grab the Wizard', enabled: () => phase === 'capture',
          run() {
            setPhase('grab');
            release = controls.acquire('story');
            player.setPose('interact');
            ui.objective(null);
          },
        }),
      );
      const snapshot = progress.read();
      if (snapshot.wizard === 'unconscious' || snapshot.wizard === 'home') {
        wizard.position.set(0, 0, -1.8);
        wizard.rotation.z = WIZARD_COLLAPSE_ANGLE;
        if (snapshot.wizard === 'home') setPhase('return');
        else if (snapshot.completed.includes('moon')) showCapture();
        else showPickup();
        return true;
      }
      return false;
    },
    start() {
      release = controls.acquire('story');
      player.setPose('interact');
      slash.position.copy(wizard.position).add(new Vector3(0, 1, 0));
      setPhase('slash');
    },
    update(dt) {
      elapsed += dt;
      if (phase === 'slash') {
        const amount = Math.min(elapsed / 0.66, 1);
        const arc = MathUtils.smoothstep(amount, 0, 0.55);
        slash.visible = amount < 0.68;
        slash.rotation.set(0, wizard.rotation.y, reducedMotion ? 0.4 : -1.1 + arc * 2.2);
        slash.material.opacity = 1 - arc * 0.7;
        wizard.rotation.z = WIZARD_COLLAPSE_ANGLE * MathUtils.smoothstep(amount, 0.23, 1);
        if (amount < 1) return;
        camera.releaseShot();
        stopPose();
        setPhase('thought');
        if (!progress.apply('defeatWizard').changed) return;
        void ui.say(VOID_BOSS_END, signal).then(() => {
          if (!signal.aborted) showPickup();
        }).catch(error => {
          if (!signal.aborted) console.error('Void finisher thought failed', error);
        });
      } else if (phase === 'pickup') {
        essences.position.y = 0.72 + Math.sin(elapsed * 3) * 0.09;
        sun.root.position.y = Math.sin(elapsed * 2.4) * 0.045;
        moon.root.position.y = Math.sin(elapsed * 1.8 + 1.4) * 0.06;
        sun.animate(elapsed);
        moon.animate(elapsed + 0.9);
      } else if (phase === 'grab' && elapsed >= 0.34) {
        stopPose();
        if (progress.apply('bringWizardHome').changed) setPhase('return');
        else showCapture();
      } else if (phase === 'return' && travel.returnHome()) {
        setPhase('leaving');
      }
    },
    exit() {
      for (const remove of unregister) remove();
      stopPose();
    },
  };
}
