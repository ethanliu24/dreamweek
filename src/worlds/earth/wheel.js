import { CylinderGeometry, Group, MathUtils, Mesh, MeshStandardMaterial, TorusGeometry } from 'three';
import { potGeometry } from '../../shared/props/pot.js';
import './wheel.css';

const DISK_RADIUS = 0.575;
const DISK_HEIGHT = 0.65;
const PLAYER_CLEARANCE = 0.25;

const STAGES = [
  ['Shape the base', 'Hold or drag the clay to compress the base.'],
  ['Raise the walls', 'Drag upward to raise the walls. Drag down to lower them.'],
  ['Shape the rim', 'Drag left to narrow the rim or right to widen it.'],
];

export function createWheel({ canvas, controls, camera, onFinish, onShape }) {
  const root = new Group();
  const turntable = new Group();
  const stone = new MeshStandardMaterial({ color: 0xa97768, roughness: 0.86 });
  const groove = new MeshStandardMaterial({ color: 0x764f48, roughness: 0.88 });
  const pedestal = new Mesh(new CylinderGeometry(0.34, 0.49, 0.55, 28), stone);
  pedestal.position.y = 0.275;
  const disk = new Mesh(new CylinderGeometry(DISK_RADIUS, 0.56, 0.10, 40), stone);
  disk.position.y = -0.05;
  turntable.position.y = DISK_HEIGHT;
  turntable.add(disk);
  for (const radius of [0.46, 0.53]) {
    const ring = new Mesh(new TorusGeometry(radius, 0.008, 6, 40), groove);
    ring.rotation.x = -Math.PI / 2;
    turntable.add(ring);
  }
  const mark = new Mesh(new CylinderGeometry(0.025, 0.025, 0.009, 12), groove);
  mark.position.set(0.495, 0, 0);
  turntable.add(mark);
  const clay = new Mesh(potGeometry({base: 1, height: 0, rim: 0.5}),
    new MeshStandardMaterial({ color: 0x87543d, roughness: 0.38 }));
  clay.name = 'Wet pot';
  clay.visible = false;
  turntable.add(clay);
  root.add(pedestal, turntable);

  const panel = document.createElement('section');
  panel.className = 'earth-wheel-controls dream-dialogue overlay-glass-dark';
  panel.hidden = true;
  panel.innerHTML = '<p data-dialogue-label></p><p></p><button type="button" data-continue>Finish stage <span aria-hidden="true">›››</span></button>';
  const [title, hint, finish] = panel.children;
  canvas.parentElement.append(panel);

  let bob, release;
  let stage = 0;
  let compression = 0;
  let lift = 0;
  let rimInput = 0;
  let reactionCooldown = 0;
  const shape = { base: 1, height: 0, rim: 0.5 };

  function focus() {
    camera.shot({ eye: root.position.clone().add({ x: 0.91, y: 1.57, z: 1.92 }),
      lookAt: root.position.clone().add({ x: 0, y: 0.88, z: 0 }) });
  }

  function refresh() {
    const old = clay.geometry;
    clay.geometry = potGeometry(shape, { compression, lift });
    old.dispose();
  }

  function showStage() {
    [title.textContent, hint.textContent] = STAGES[stage];
    finish.disabled = true;
    rimInput = 0;
    canvas.focus({ preventScroll: true });
  }

  finish.addEventListener('click', () => {
    if (finish.disabled || !release) return;
    stage++;
    if (stage < STAGES.length) {
      showStage();
      return;
    }
    compression = 1;
    refresh();
    panel.hidden = true;
    release();
    release = undefined;
    camera.releaseShot();
    onFinish({ ...shape });
    canvas.focus({ preventScroll: true });
  });

  return {
    root, turntable, clay, focus,
    keepOutside(position) {
      if (position.y >= root.position.y + DISK_HEIGHT) return;
      const x = position.x - root.position.x;
      const z = position.z - root.position.z;
      const distance = Math.hypot(x, z);
      const radius = DISK_RADIUS + PLAYER_CLEARANCE;
      if (distance >= radius) return;
      position.x = root.position.x + (distance ? x / distance * radius : 0);
      position.z = root.position.z + (distance ? z / distance * radius : radius);
    },
    start(model) {
      bob = model;
      turntable.add(bob);
      bob.position.set(0, 0, 0);
      bob.rotation.set(0, 0, 0);
      bob.scale.setScalar(1);
      release = controls.acquire('puzzle');
      focus();
      panel.hidden = false;
      showStage();
    },
    update(dt, { primaryHeld, dragX, dragY }) {
      if (stage === STAGES.length) return;
      if (!release) return;
      turntable.rotation.y += dt * 2.6;
      reactionCooldown -= dt;
      const effort = stage === 0 ? (primaryHeld ? dt * 1.3 : 0) + Math.abs(dragX) / 260 + Math.abs(dragY) / 260 :
        stage === 1 ? -dragY / 155 : dragX / 155;
      if (!effort) return;
      if (stage === 0) {
        compression = MathUtils.clamp(compression + effort, 0, 1);
        shape.base = 1 - MathUtils.smoothstep(compression, 0.42, 1);
        bob.scale.set(1 - 0.23 * compression, Math.max(0.3, 1 - 1.65 * compression), 1 - 0.23 * compression);
        if (compression >= 0.42) {
          bob.visible = false;
          clay.visible = true;
        }
      } else if (stage === 1) {
        shape.height = MathUtils.clamp(shape.height + effort, 0, 1);
        lift = Math.max(lift, MathUtils.clamp(lift + effort * 5, 0, 1));
      } else {
        shape.rim = MathUtils.clamp(shape.rim + effort, 0, 1);
      }
      if (stage === 2) rimInput += Math.abs(effort);
      if (stage === 0 ? compression >= 0.42 : stage === 1 ? lift === 1 : rimInput >= 0.12) finish.disabled = false;
      if (reactionCooldown <= 0) {
        onShape();
        reactionCooldown = 2.2;
      }
      refresh();
    },
    exit() {
      release?.();
      release = undefined;
      panel.remove();
    },
  };
}
