import { Color, DoubleSide, Mesh, MeshStandardMaterial } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ringSurface, TAU, woodyCurve } from './forms.js';

const TREE_Z = -5.65;
const BARK = [0x3c2a30, 0xa07750];
const MOSS = [0x284d42, 0x92a14f];

export function growAncientTree(scene, garden) {
  const wood = [];
  const curve = (points, radii, tint = BARK, sides = 12, steps = 16) =>
    wood.push(woodyCurve(points, radii, tint, sides, steps));
  const bark = BARK.map(c => new Color(c));
  const moss = new Color(0x687747);
  const rings = [0, 0.045, 0.12, 0.25, 0.43, 0.62, 0.80, 1];
  function trunkPoint(t, a) {
    const seam = a * 9 + 1.4 * t + 0.45 * Math.sin(a * 3 - t * 5);
    const r = 1.95 - t * 1.32 + (0.21 + 0.19 * Math.exp(-t * 6)) * Math.cos(seam)
      + 0.10 * Math.sin(a * 4 - t * 8);
    const x = Math.sin(a) * r + 0.7 * t + 0.3 * Math.sin(t * 7);
    const z = Math.cos(a) * r + 0.25 * Math.sin(t * 6);
    const arch = Math.cos(a) > 0 ? 1.77 * Math.sqrt(Math.max(0, 1 - (Math.sin(a) / 0.55) ** 2)) : 0;
    return [x, 10.9 * t + arch * (1 - t) ** 2, z];
  }
  wood.push(ringSurface(96, rings.length - 1, (_, a, j) => {
    const t = rings[j];
    const ridge = 0.5 + 0.5 * Math.cos(a * 9 + t * 1.4 + 0.45 * Math.sin(a * 3 - t * 5));
    const color = bark[0].clone().lerp(bark[1], 0.13 + ridge * 0.68);
    color.lerp(moss, ridge ** 3 * (0.28 + 0.18 * Math.sin(a * 3)));
    return [...trunkPoint(t, a), color];
  }));

  // Use the same angular samples as the trunk lip, then fold the arch into the tree.
  const lip = Array.from({ length: 19 }, (_, i) => trunkPoint(0, (i - 9) * TAU / 96));
  const interior = new Color(0x2d202a), rim = new Color(0x7c5b48);
  wood.push(ringSurface(38, 3, (t, a) => {
    const i = Math.round(a / TAU * 38);
    const p = lip[i < 19 ? i : 37 - i];
    return [p[0] * (1 - 0.32 * t), i < 19 ? p[1] * (1 - 0.20 * t) : -0.09,
    p[2] * (1 - t) + 0.28 * t, rim.clone().lerp(interior, Math.min(1, t * 2.5))];
  }));
  garden.rock([0, 0.71, TREE_Z + 0.21], [1.10, 1.05, 0.17], 0x39252b);
  curve([[0.23, 1.60, 0.64], [0.20, 1.45, 0.62], [0.24, 1.13, 0.64]],
    [0.026, 0.016, 0.014], MOSS, 6, 5);
  garden.pod(0.24, 1.03, TREE_Z + 0.64, 0.105);

  for (let i = 0; i < 11; i++) {
    const a = 0.73 + i * (TAU - 1.46) / 10;
    const s = Math.sin(a), c = Math.cos(a);
    const length = 3.25 + 0.85 * Math.cos(i * 2.1);
    const p = [[s * 1.39, 3.2 + 0.7 * Math.sin(i), c * 1.39],
    [s * 1.76, 1.0, c * 1.75], [s * 2.42 + c * 0.34, 0.28, c * 2.45 - s * 0.34],
    [s * length + c * 0.55, 0.12, c * length], [s * (length + 0.83), -0.10, c * (length + 0.9)]];
    curve(p, [0.26, 0.41, 0.32, 0.19, 0.025]);
    curve(p.slice(1).map(([x, y, z], k) => [x, y + [0.29, 0.24, 0.12, 0][k], z]),
      [0.16, 0.18, 0.10, 0.01], MOSS, 8, 9);
  }
  const doorRim = lip.map(([x, y, z]) => [x * 1.035, y * 1.035 - .025, z * .988]);
  curve(doorRim, [.035, .13, .115, .16, .12, .105, .035], [0x55382e, 0xb4925b], 12, 24);

  for (let i = 0; i < 9; i++) {
    const a = i * TAU / 9 + 0.27, s = Math.sin(a), c = Math.cos(a);
    const y = 3.35 + (i % 3) * 1.07, reach = 3.8 + (i % 4) * 0.4;
    const tip = [s * reach, y + 2.3, c * reach];
    const fork = [s * 2.6, y + 1.7, c * 2.6];
    curve([[0.20, y - 0.8, 0], [s * 1.3, y + 0.65, c * 1.3], fork, tip, [tip[0] + c * 0.25, y + 3.0, tip[2] - s * 0.24]],
      [0.76, 0.56, 0.38, 0.21, 0.055]);
    curve([fork, [fork[0] + c * 0.74, y + 2.22, fork[2] - s * 0.65], [tip[0] + c * 1.35, y + 2.85, tip[2] - s * 1.35]],
      [0.27, 0.18, 0.035]);
    garden.crown(tip[0], tip[1] + 0.7, tip[2] + TREE_Z, 2.4, i);
    garden.crown(tip[0] + c * 1.35, y + 3.1, tip[2] - s * 1.35 + TREE_Z, 1.55, i + 1);
  }
  garden.crown(0.7, 10.7, TREE_Z, 3.5, 1);

  // Loose vines carry pendant seed lanterns, leaving a gap above the doorway.
  for (const [x0, y0, z0, x1, y1, z1, count] of [
    [-5.01, 4.18, 8.18, -.82, 3.78, .82, 7],
    [1.13, 3.99, .7, 5.76, 4.01, 7.79, 7],
  ]) {
    const at = t => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - 0.90 * Math.sin(Math.PI * t), z0 + (z1 - z0) * t];
    curve([at(0), at(0.25), at(0.5), at(0.75), at(1)], [0.031, 0.023, 0.024, 0.020, 0.035], MOSS, 6);
    for (let i = 0; i < count; i++) {
      const [x, y, z] = at((i + 0.52) / count), drop = 0.16 + 0.20 * (0.5 + 0.5 * Math.sin(i * 4 + x0));
      curve([[x, y, z], [x + 0.04, y - drop * 0.6, z], [x + 0.025, y - drop, z]], [0.016, 0.012, 0.009], MOSS, 5, 4);
      garden.pod(x + 0.025, y - drop - 0.08, z + TREE_Z, 0.075 + (i % 3) * 0.014);
      garden.leafSprig(x, y, z + TREE_Z, 0.23, i * 2);
      for (let j = 0; j < 4; j++) {
        const [lx, ly, lz] = at((i + .12 + j * .24) / count);
        garden.vineLeaf(lx, ly, lz + TREE_Z, 0.18 + j % 2 * .04, j * 1.84 + i);
      }
      if (i % 2 === 0) {
        const [px, py, pz] = at((i + .89) / count);
        garden.pendant(px, py, pz + TREE_Z, i);
      }
    }
  }
  // Two ivy runners follow the grain around the entrance.
  for (const side of [-1, 1]) {
    const points = [];
    for (let j = 0; j <= 16; j++) {
      const t = j / 16, a = side * (0.61 + 0.35 * Math.sin(t * 4.2 + side * .4));
      const [x, y, z] = trunkPoint(.028 + t * .40, a);
      points.push([x * 1.025, y, z * 1.04]);
      garden.vineLeaf(x * 1.025, y, z * 1.04 + TREE_Z, .16 + .06 * Math.sin(j * 1.7), side + j * 1.7);
      if (j % 3 === 0) garden.leafSprig(x * 1.025, y, z * 1.04 + TREE_Z, .26, j);
    }
    curve(points, [.039, .033, .021, .012], MOSS, 6, 25);
  }
  for (let i = 0; i < 17; i++) {
    const side = i % 3 ? 1 : -1, a = side * (0.85 + 0.29 * Math.sin(i * 2.4));
    const t = 0.047 + (i % 6) * 0.035 + 0.09 * (i % 2);
    const [x, y, z] = trunkPoint(t, a);
    garden.bracket(x, y, TREE_Z + z - 0.025, 0.10 + 0.09 * Math.sin(i) ** 2, i);
  }
  const barkMaterial = new MeshStandardMaterial({ vertexColors: true, side: DoubleSide, roughness: 0.91 });
  barkMaterial.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 grainPoint;\n' + shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\ngrainPoint = position;');
    shader.fragmentShader = 'varying vec3 grainPoint;\n' + shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec3 p = grainPoint;
      float a = atan(p.x, p.z);
      float twist = a + .086*sin(p.y*1.23+3.*a) + .094*sin(.83*p.y-4.*a);
      float furrow = .5+.5*sin(twist*62.+1.6*sin(twist*17.+p.y*.82));
      float fissure = smoothstep(.80,.99,furrow);
      float fibre = .5+.5*sin(twist*173.+2.4*sin(p.y*1.14+twist*27.));
      float lichen = sin(a*18.+p.y*2.+sin(a*5.))*sin(p.y*1.75-a*9.);
      diffuseColor.rgb *= .86+.12*fibre+.14*furrow-.21*fissure;
      diffuseColor.rgb = mix(diffuseColor.rgb,vec3(.13,.19,.068),smoothstep(.28,.81,lichen)*.47);
    `);
  };
  const mesh = new Mesh(mergeGeometries(wood), barkMaterial);
  mesh.position.z = TREE_Z;
  scene.add(mesh);
}
