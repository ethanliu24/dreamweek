import {
  BufferGeometry, DoubleSide, Float32BufferAttribute, Group, MathUtils, Mesh, MeshBasicMaterial,
  RingGeometry, Vector3,
} from 'three';
import { WIZARD_COLLAPSE_ANGLE } from '../../shared/actors/wizard.js';
import { createEssence } from '../../shared/props/essence.js';
import { VOID_BOSS_END } from './lines.js';

const SWEEP_SEGMENTS = 40;

function swordRibbon() {
  const positions = [], colors = [], indices = [];
  for (let i = 0; i <= SWEEP_SEGMENTS; i++) {
    const t = i / SWEEP_SEGMENTS;
    const angle = -2.4 + 3.95 * t;
    const width = 0.095 * Math.sin(t * Math.PI) ** 0.8;
    for (const radius of [1 - width, 1]) {
      positions.push(1.25 * radius * Math.cos(angle), 0.52 * radius * Math.sin(angle), 0);
    }
    colors.push(1, 0.42, 0.12, 1, 0.94, 0.64);
    if (i === SWEEP_SEGMENTS) continue;
    const start = i * 2;
    indices.push(start, start+1, start+2, start+1, start+3, start+2);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  return new Mesh(geometry, new MeshBasicMaterial({
    vertexColors: true, transparent: true, side: DoubleSide, depthWrite: false, toneMapped: false,
  }));
}

export function createFinish(scene, wizard, { camera, controls, interactions, player, progress, signal, travel, ui, viewCamera }, keepInside) {
  const slash = swordRibbon();
  const grip = player.root.getObjectByName('grip');
  const restingGrip = grip?.rotation.clone();
  const gold = new MeshBasicMaterial({
    color: 0xffdf87, transparent: true, side: DoubleSide, depthWrite: false, toneMapped: false,
  });
  const gather = new Mesh(new RingGeometry(0.92, 1, 40), gold);
  const echo = new Mesh(new RingGeometry(0.92, 1, 64).rotateX(-Math.PI / 2), gold.clone());
  echo.material.color.setHex(0xb98bed);
  const essences = new Group();
  const sun = createEssence('sun');
  const moon = createEssence('moon');
  sun.root.position.x = -0.37;
  moon.root.position.x = 0.37;
  essences.add(sun.root, moon.root);
  slash.visible = gather.visible = echo.visible = essences.visible = false;
  scene.add(slash, gather, echo, essences);

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
    if (grip) grip.rotation.copy(restingGrip);
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
      slash.position.copy(wizard.position).lerp(player.position, 0.24);
      slash.position.y = 0.96;
      const towardLens = viewCamera.position.clone().sub(slash.position).normalize();
      slash.position.addScaledVector(towardLens, 0.42);
      echo.position.copy(wizard.position).setY(0.034);
      setPhase('slash');
    },
    update(dt) {
      elapsed += dt;
      if (phase === 'slash') {
        const draw = MathUtils.clamp(elapsed / 0.35, 0, 1);
        const sweep = MathUtils.clamp((elapsed - 0.35) / 0.30, 0, 1);
        const fall = MathUtils.clamp((elapsed - 0.65) / 0.65, 0, 1);
        if (grip) {
          const lift = draw * (1 - fall);
          grip.rotation.z = restingGrip.z + lift * (0.88 - 2.1 * sweep);
          grip.rotation.x = restingGrip.x - lift * 0.38;
        }
        gather.visible = draw < 1 && Boolean(grip);
        if (gather.visible) {
          grip.getWorldPosition(gather.position);
          gather.quaternion.copy(viewCamera.quaternion);
          gather.scale.setScalar(0.32 - 0.23 * draw);
          gather.material.opacity = Math.sin(draw * Math.PI);
        }
        slash.visible = sweep > 0 && sweep < 1;
        slash.quaternion.copy(viewCamera.quaternion);
        slash.rotateZ(0.45 + sweep * (reducedMotion ? 0.1 : 0.34));
        const head = Math.ceil(SWEEP_SEGMENTS * sweep);
        const tail = Math.floor(SWEEP_SEGMENTS * Math.max(0, sweep - 0.62));
        slash.geometry.setDrawRange(tail * 6, (head - tail) * 6);
        slash.material.opacity = 1 - MathUtils.smoothstep(sweep, 0.65, 1);
        echo.visible = fall > 0 && fall < 1;
        echo.scale.setScalar(0.58 + 1.75 * fall);
        echo.material.opacity = 0.65 * (1 - fall) ** 2;
        wizard.rotation.z = WIZARD_COLLAPSE_ANGLE * MathUtils.smoothstep(fall, 0, 1);
        if (fall < 1) return;
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
