import {
  BufferAttribute, Color, MathUtils, Mesh, MeshBasicMaterial, PointLight, SphereGeometry,
} from 'three';
import { createCandle } from '../../shared/props/candle.js';
import { potDimensions } from '../../shared/props/pot.js';
import { canReturn } from '../../state/progress.js';

const FIRING_SECONDS = 1.8;
const WET = new Color(0x87543d);
const FIRED = new Color(0xc87951);

export function createPotStory({ wheel, ring, scene, camera, controls, interactions, player, progress, travel, ui }) {
  const candle = createCandle();
  const flame = new Mesh(new SphereGeometry(0.036, 12, 8), new MeshBasicMaterial({ color: 0xffbf55 }));
  flame.position.y = 0.21;
  flame.scale.y = 1.7;
  const light = new PointLight(0xff9d4b, 1.6, 1.8);
  light.position.copy(flame.position);
  candle.add(flame, light);
  candle.scale.setScalar(0.78);
  candle.visible = false;
  wheel.root.add(candle);

  const { clay } = wheel;
  const ringColor = ring.material.color.clone();
  ring.material.color.setHex(0x9d7a40);
  const complete = () => canReturn('earth', progress.read());
  const hasCandle = () => progress.read().items.includes('Candle');
  const color = new Color();
  const unregister = [];
  let phase = 'empty';
  let shape;
  let elapsed = 0;
  let release;
  let holdingPot = false;

  function showReturn() {
    phase = 'complete';
    ring.material.color.copy(ringColor);
    ui.objective('Return through the yellow ring when ready', ring.position);
  }

  function beginFiring() {
    phase = 'firing';
    elapsed = 0;
    release = controls.acquire('story');
    player.root.visible = false;
    wheel.focus();
    const positions = clay.geometry.attributes.position;
    clay.geometry.setAttribute('color', new BufferAttribute(new Float32Array(positions.count * 3), 3));
    clay.material.color.setHex(0xffffff);
    clay.material.vertexColors = true;
    clay.material.needsUpdate = true;
    stain(0);
    candle.position.set(0.9, 0.49, 0.26);
    candle.visible = true;
    ui.objective('Firing the pot');
  }

  function stain(fraction) {
    const { position, color: colors } = clay.geometry.attributes;
    const top = potDimensions(shape).top;
    for (let i = 0; i < colors.count; i++) {
      const edge = fraction * 1.3 - 0.15 - position.getY(i) / top;
      color.copy(WET).lerp(FIRED, MathUtils.smoothstep(edge, -0.1, 0.1));
      colors.setXYZ(i, color.r, color.g, color.b);
    }
    colors.needsUpdate = true;
    clay.material.roughness = MathUtils.lerp(0.38, 0.7, fraction);
  }

  function collect() {
    if (!progress.apply('collectPot', shape).changed) return;
    clay.position.set(-0.03, -0.13, 0.20);
    clay.rotation.set(0, 0, 0);
    player.setHeld(clay);
    holdingPot = true;
    showReturn();
  }

  return {
    enter() {
      const point = wheel.root.position;
      unregister.push(interactions.register({
        id: 'fire-pot', point, label: 'Use Candle',
        enabled: () => phase === 'wet' && hasCandle(), run: beginFiring,
      }));
      unregister.push(interactions.register({
        id: 'collect-pot', point, label: 'Collect pot', enabled: () => phase === 'fired', run: collect,
      }));
      unregister.push(interactions.register({
        id: 'return', point: ring.position, enabled: complete,
        label: 'Return to the Overworld', run: travel.returnHome,
      }));
      if (complete()) showReturn();
    },
    shaped(profile) {
      phase = 'wet';
      shape = profile;
      ui.objective(hasCandle() ? 'Use the Candle at the pottery wheel' : 'Bring the Candle to the pottery wheel',
        wheel.root.position);
    },
    update(dt) {
      if (phase !== 'firing') return;
      elapsed += dt;
      candle.position.x = MathUtils.lerp(0.9, 0.39, MathUtils.smoothstep(elapsed, 0, 0.42));
      flame.scale.y = 1.7 + Math.sin(elapsed * 31) * 0.22;
      stain(MathUtils.smoothstep(elapsed, 0.35, FIRING_SECONDS));
      if (elapsed < FIRING_SECONDS) return;
      candle.visible = false;
      player.root.visible = true;
      camera.releaseShot();
      release();
      release = undefined;
      phase = 'fired';
      ui.objective('Collect the fired pot', wheel.root.position);
    },
    exit() {
      for (const remove of unregister) remove();
      release?.();
      if (holdingPot) {
        player.setHeld(null);
        scene.add(clay);
      }
    },
  };
}
