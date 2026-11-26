import {
  BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, PointLight,
  SphereGeometry, TorusGeometry, Vector3,
} from 'three';
import { createWizard } from '../../shared/actors/wizard.js';
import { createCookingPot, createSoupBowl } from '../../shared/props/cooking.js';
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
  wizard.rotation.z = -0.58;
  scene.add(wizard);
  const wood = new Group();
  const fire = new Group();
  hearth.add(wood, fire);
  const log = new CylinderGeometry(0.067, 0.08, 0.64, 9);
  const flame = new SphereGeometry(1, 12, 8);
  for (let i = 0; i < 4; i++) {
    const piece = mesh(wood, log, i % 2 ? 0x8b5942 : 0x6c4537, 0, 0.13 + i * 0.045, 0);
    piece.rotation.set(Math.PI / 2, 0, i * 0.79);
    const tongue = mesh(fire, flame, i % 2 ? 0xffc267 : 0xfa6d42, (i - 1.5) * 0.11, 0.29, 0, {
      emissive: i % 2 ? 0xff8c37 : 0xd53c22, emissiveIntensity: 1.2,
    });
    tongue.scale.set(0.098, 0.19, 0.11);
  }
  const glow = new PointLight(0xff8f48, 3.3, 4);
  glow.position.y = 0.48;
  fire.add(glow);

  const bowl = createSoupBowl();
  hearth.add(bowl);
  bowl.position.set(0.85, 0.24, 0.25);
  const sword = new Group();
  mesh(sword, new BoxGeometry(0.076, 0.52, 0.025), 0xc0d5de, 0, 0.26, 0);
  mesh(sword, new BoxGeometry(0.22, 0.045, 0.048), 0xd8ad64, 0, 0.53, 0);
  mesh(sword, new CylinderGeometry(0.027, 0.032, 0.17, 8), 0x573b48, 0, 0.62, 0);
  hearth.add(sword);

  const bubbles = new Group();
  hearth.add(bubbles);
  for (let i = 0; i < 7; i++) mesh(bubbles, new SphereGeometry(0.032, 8, 6), 0xffe4ba, 0, 0, 0);
  const essenceRing = new TorusGeometry(0.22, 0.022, 6, 32);
  const sun = mesh(hearth, essenceRing, 0xffce62, 0, 0, 0, { emissive: 0xffa844, emissiveIntensity: 0.8 });
  const moon = mesh(hearth, essenceRing, 0xc5a2ef, 0, 0, 0, { emissive: 0x9b76da, emissiveIntensity: 0.75 });

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
    sun.visible = golden || phase === 'moonAdded';
    moon.visible = phase === 'moonAdded';
    sword.visible = phase === 'stirred' && remaining > 0;
    bowl.visible = phase === 'stirred' || snapshot.wizard === 'fed';
    if (snapshot.wizard === 'fed') bowl.position.copy(wizardPoint).sub(point).add(new Vector3(0, 0.11, 0.42));
    wizard.visible = snapshot.wizard === 'home' || snapshot.wizard === 'fed';
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
        for (let i = 0; i < 4; i++) fire.children[i].scale.y = 0.16 + Math.sin(time * 11 + i * 2) * 0.045;
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
      sun.position.y = surface + 0.065;
      moon.position.y = surface + 0.085;
      sun.rotation.set(-1.25, 0.14, time * 1.4);
      moon.rotation.set(-1.9, -0.23, -time * 1.9);
      sword.position.set(Math.cos(time * 12) * 0.16, surface - 0.17, Math.sin(time * 12) * 0.16);
      sword.rotation.set(0.34, -time * 12, 0.24);
    },
    exit() { releaseEnding?.(); },
  };
}
