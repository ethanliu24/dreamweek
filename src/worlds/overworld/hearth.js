import {
  CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, SphereGeometry, Vector3,
} from 'three';
import { createWizard, WIZARD_COLLAPSE_ANGLE } from '../../shared/actors/wizard.js';
import { createCookingPot, createSoupBowl } from '../../shared/props/cooking.js';
import { createEssence } from '../../shared/props/essence.js';
import { flameGeometry } from '../../shared/props/flame.js';
import { createSword } from '../../shared/props/sword.js';
import { nextStationAction } from '../../state/progress.js';

const LABELS = {
  placePot: 'Place the Filled Pot',
  placeWood: 'Place the Firewood',
  lightWood: 'Light the wood with the Candle',
  addSun: 'Add Sun Essence',
  addMoon: 'Add Moon Essence',
  stir: 'Stir with the Sword',
  takeSoup: 'Take the soup',
  feed: 'Feed the Wizard',
};

function mesh(parent, geometry, color, x, y, z, options) {
  const object = new Mesh(geometry, new MeshStandardMaterial({ color, ...options }));
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

export function createHearthStation({ scene, hearth, progress, interactions, controls, floorHeight }) {
  const point = hearth.position;
  const wizardPoint = new Vector3(point.x + 2.3, 0, point.z - 0.35);
  wizardPoint.y = floorHeight(wizardPoint.x, wizardPoint.z);
  const wizard = createWizard();
  wizard.position.copy(wizardPoint);
  wizard.rotation.z = WIZARD_COLLAPSE_ANGLE;
  const bellyMoon = wizard.getObjectByName('Belly Moon');
  scene.add(wizard);
  const wood = new Group();
  const fire = new Group();
  hearth.add(wood, fire);
  const log = new CylinderGeometry(0.067, 0.08, 0.64, 9);
  for (let i = 0; i < 4; i++) {
    const piece = mesh(wood, log, i % 2 ? 0x8b5942 : 0x6c4537, 0, 0.13 + i * 0.045, 0);
    piece.rotation.set(Math.PI / 2, 0, i * 0.79);
  }

  const flame = flameGeometry();
  const tongues = [
    [-0.16, 0.02, 0.089, 0.29], [0.13, -0.07, 0.081, 0.31],
    [0, -0.05, 0.11, 0.35], [0.04, 0.105, 0.086, 0.25], [-0.07, 0.055, 0.052, 0.21],
  ].map(([x, z, width, height], i) => {
    const outer = mesh(fire, flame, 0xff842b, x, 0.235, z, {
      emissive: i % 2 ? 0xff6421 : 0xf13f10, emissiveIntensity: 1.35,
    });
    outer.scale.set(width, height, width);
    outer.rotation.y = i * 2.4;
    const core = mesh(fire, flame, 0xffdfa0, x * 0.85, 0.24, z + 0.028, {
      emissive: 0xffad43, emissiveIntensity: 2,
    });
    core.scale.set(width * 0.53, height * 0.66, width * 0.57);
    return { outer, core, height };
  });

  const emberGeometry = new SphereGeometry(0.013, 6, 4);
  const emberMaterial = new MeshBasicMaterial({ color: 0xffae54, toneMapped: false });
  const embers = Array.from({ length: 9 }, () => {
    const ember = new Mesh(emberGeometry, emberMaterial);
    fire.add(ember);
    return ember;
  });
  const glow = new PointLight(0xff8f48, 3.3, 4);
  glow.position.y = 0.48;
  fire.add(glow);

  const bowl = createSoupBowl();
  hearth.add(bowl);
  bowl.position.set(0.85, 0.24, 0.25);
  const sword = createSword();
  sword.scale.setScalar(0.62);
  hearth.add(sword);

  const bubbles = new Group();
  hearth.add(bubbles);
  for (let i = 0; i < 7; i++) mesh(bubbles, new SphereGeometry(0.032, 8, 6), 0xffe4ba, 0, 0, 0);
  const sun = createEssence('sun');
  const moon = createEssence('moon');
  sun.root.scale.setScalar(0.43);
  moon.root.scale.setScalar(0.39);
  hearth.add(sun.root, moon.root);

  let pot;
  let remaining = 0;
  let releaseEnding;
  let action;

  function sync(snapshot) {
    const phase = snapshot.hearth;
    const lit = !['empty', 'potPlaced', 'woodPlaced'].includes(phase);
    const combined = ['moonAdded', 'stirred', 'served'].includes(phase);
    const golden = phase === 'sunAdded';
    if (!pot && snapshot.pot.phase === 'placed') {
      pot = createCookingPot(snapshot.pot.shape);
      pot.root.position.y = 0.64;
      hearth.add(pot.root);
    }
    wood.visible = !['empty', 'potPlaced'].includes(phase);
    fire.visible = lit;
    bubbles.visible = lit && phase !== 'lit' && phase !== 'served';
    sun.root.visible = golden || phase === 'moonAdded';
    moon.root.visible = phase === 'moonAdded';
    sword.visible = phase === 'stirred' && remaining > 0;
    bowl.visible = phase === 'stirred' || snapshot.wizard === 'fed';
    if (snapshot.wizard === 'fed') bowl.position.copy(wizardPoint).sub(point).add(new Vector3(0, 0.11, 0.42));
    wizard.visible = snapshot.wizard === 'home' || snapshot.wizard === 'fed';
    bellyMoon.visible = snapshot.wizard !== 'fed';
    if (pot) {
      pot.liquid.visible = phase !== 'served';
      pot.liquid.material.color.setHex(combined ? 0xda9da9 : golden ? 0xf2b64e : 0x70b9d2);
    }
    action = nextStationAction(snapshot);
    if (snapshot.ended) releaseEnding ??= controls.acquire('ending');
  }

  function target() { return action === 'feed' ? wizardPoint : point; }
  function label() { return LABELS[action]; }

  return {
    target, label,
    enter() {
      sync(progress.read());
      return interactions.register({
        id: 'hearth', point: target, radius: 2, label,
        enabled: () => Boolean(action) && remaining <= 0,
        run() {
          const result = progress.apply(action);
          if (!result.changed) return;
          remaining = 0.45;
          sync(result.snapshot);
        },
      });
    },
    update(dt) {
      remaining -= dt;
      if (remaining <= 0) sword.visible = false;
    },
    present(time) {
      if (fire.visible) {
        for (const [i, { outer, core, height }] of tongues.entries()) {
          const phase = time * (8 + i * 0.71) + i * 2.4;
          outer.scale.y = height * (1 + Math.sin(phase) * 0.13);
          outer.rotation.z = Math.sin(phase * 0.7) * 0.16;
          core.scale.y = outer.scale.y * 0.66;
          core.rotation.z = outer.rotation.z;
        }
        for (const [i, ember] of embers.entries()) {
          const age = (time * (0.62 + (i % 3) * 0.18) + i / embers.length) % 1;
          const angle = i * 2.4 + age * 1.3;
          const radius = 0.09 + age * 0.29;
          ember.position.set(Math.cos(angle) * radius, 0.31 + age * 0.37, Math.sin(angle) * radius);
          ember.scale.setScalar(Math.sin(Math.PI * age) * (0.55 + (i % 3) * 0.2));
        }
        glow.intensity = 3.3 + Math.sin(time * 12) * 0.45;
      }
      if (!pot) return;
      const surface = pot.root.position.y + pot.liquid.position.y;
      for (const [i, bubble] of bubbles.children.entries()) {
        const age = (time * 0.9 + i / 7) % 1;
        const angle = i * 2.4;
        bubble.position.set(Math.cos(angle) * pot.radius * 0.7, surface + age * 0.17,
          Math.sin(angle) * pot.radius * 0.7);
        bubble.scale.setScalar(Math.sin(age * Math.PI));
      }
      sun.root.position.set(moon.root.visible ? -0.12 : 0, surface + 0.10, 0);
      moon.root.position.set(0.12, surface + 0.12, 0);
      if (sun.root.visible) sun.animate(time);
      if (moon.root.visible) moon.animate(time + 0.9);
      sword.position.set(Math.cos(time * 12) * 0.16, surface + 0.30, Math.sin(time * 12) * 0.16);
      sword.rotation.set(Math.PI + 0.34, -time * 12, 0.24);
    },
    exit() { releaseEnding?.(); },
  };
}
