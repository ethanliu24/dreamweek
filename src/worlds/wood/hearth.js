import {
  BoxGeometry, Color, Group, MathUtils, Mesh, MeshStandardMaterial, PointLight, SphereGeometry, TorusGeometry,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ringSurface } from './forms.js';
import { createCandle } from '../../shared/props/candle.js';

import { flameGeometry } from '../../shared/props/flame.js';

export function createFirePit(scene) {
  const sphere = new SphereGeometry(1, 12, 8);
  const standard = color => new MeshStandardMaterial({ color });
  const endgrain = [0xd8a66e, 0xb28857, 0xe3b77d, 0xc4915e, 0xdeab71, 0xa8794f];
  const rings = [0.008, 0.31, 0.37, 0.65, 0.72, 0.96, 1];
  const log = ringSurface(12, 13, (_, a, j) => {
    const k = j < 7 ? j : 13 - j, r = rings[k] * .082;
    const bark = Math.cos(a * 6) > .1 ? 0x614533 : 0x76503b;
    return [r * Math.sin(a), j < 7 ? -.34 : .34, r * Math.cos(a), new Color(k === 6 ? bark : endgrain[k])];
  });
  const timber = standard(0xffffff);
  timber.vertexColors = true;
  function mesh(parent, geometry, material, position, scale) {
    const part = new Mesh(geometry, material);
    part.position.set(...position);
    part.scale.set(...scale);
    parent.add(part);
    return part;
  }

  const pit = new Group();
  pit.position.set(1.18, 0, -1.65);
  scene.add(pit);
  const fire = new Group();
  pit.add(fire);
  mesh(pit, sphere, standard(0x443832), [0, 0.013, 0], [0.50, 0.025, 0.42]);
  const stones = [], prepared = [];
  for (let i = 0; i < 9; i++) {
    const angle = i / 9 * Math.PI * 2;
    stones.push(sphere.clone().scale(.16, .10, .136).rotateY(angle)
      .translate(.49 * Math.cos(angle), .06, .43 * Math.sin(angle)));
  }
  pit.add(new Mesh(mergeGeometries(stones), standard(0x737868)));
  for (let i = 0; i < 3; i++) {
    prepared.push(log.clone().rotateX(Math.PI / 2).rotateY(i * 1.04).translate(0, .105 + i * .058, 0));
  }
  pit.add(new Mesh(mergeGeometries(prepared), timber));

  const gift = new Group();
  gift.position.set(-1.95, 0.075, -1.4);
  gift.rotation.y = -0.3;
  scene.add(gift);
  const bundle = [[-.083, 0], [.083, 0], [0, .126]].map(([x, y]) =>
    log.clone().scale(.94, .8, .94).rotateX(Math.PI / 2).translate(x, y, 0));
  gift.add(new Mesh(mergeGeometries(bundle), timber));
  const twine = standard(0xc8af79);
  const binding = new TorusGeometry(0.145, 0.015, 6, 20);
  for (const z of [-0.15, 0.15]) mesh(gift, binding, twine, [0, 0.045, z], [1.2, 1, 1]);
  const tag = mesh(gift, new BoxGeometry(), standard(0x98ac69), [0.11, 0.19, 0.13], [0.10, 0.024, 0.15]);
  tag.rotation.z = -0.38;

  const ember = new MeshStandardMaterial({ color: 0xf69249, emissive: 0xf9531c, emissiveIntensity: 1.3 });
  const core = new MeshStandardMaterial({ color: 0xffd887, emissive: 0xf89c40, emissiveIntensity: 1.4 });
  const flameShape = flameGeometry();
  const flames = [ember, core, ember].map((material, i) =>
    mesh(fire, flameShape, material, [(i - 1) * 0.11, 0.15, i === 1 ? 0.035 : 0], [0.14, 0.50, 0.13]));
  const glow = new PointLight(0xff964e, 0, 4.5);
  glow.position.y = 0.65;
  pit.add(glow);

  const candle = createCandle();
  candle.scale.setScalar(0.72);
  candle.visible = false;
  pit.add(candle);
  mesh(candle, sphere, core, [0, 0.24, 0], [0.028, 0.053, 0.028]);

  return {
    pit: pit.position,
    gift,
    animate(time, burn) {
      const growth = MathUtils.smoothstep(burn, 0.15, 0.75);
      fire.visible = burn > 0.15;
      fire.scale.setScalar(growth);
      glow.intensity = growth * (3.2 + Math.sin(time * 12) * 0.37);
      flames.forEach((flame, i) => {
        flame.scale.y = (i === 1 ? 0.47 : 0.39) + Math.sin(time * 13 + i * 2) * 0.063;
        flame.rotation.z = (i - 1) * 0.24 + Math.sin(time * 8 + i) * 0.12;
      });
      candle.visible = burn > 0 && burn < 0.72;
      if (candle.visible) candle.position.set(0.53 - burn * 0.57, 0.29 - burn * 0.15, 0.12);
    },
  };
}
