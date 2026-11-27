import {
  BoxGeometry, BufferGeometry, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute,
  IcosahedronGeometry, MeshStandardMaterial, SphereGeometry,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createBatches, forestRandom, ringSurface, TAU, woodyCurve } from './forms.js';

// Each leaf has a curved spine, a raised midrib and differently lit halves.
function foliageClump(fern) {
  const vertices = [], colors = [], indices = [];
  const dark = new Color(0x6b967c), tip = new Color(0xf4ffbc);
  function blade(start, end, width, angle, bend) {
    const k = vertices.length / 3;
    const mid = start.map((v, i) => v + (end[i] - v) * 0.52);
    mid[1] += bend;
    const dx = width * Math.cos(angle), dz = -width * Math.sin(angle);
    vertices.push(...start, mid[0] - dx, mid[1] - width * 0.32, mid[2] - dz,
      mid[0], mid[1], mid[2], mid[0] + dx, mid[1] - width * 0.32, mid[2] + dz, ...end);
    colors.push(...dark.toArray(), .48, .68, .49, .73, .88, .62, .59, .79, .52, ...tip.toArray());
    indices.push(k, k + 1, k + 2, k, k + 2, k + 3, k + 1, k + 4, k + 2, k + 2, k + 4, k + 3);
  }
  for (let i = 0; i < (fern ? 6 : 8); i++) {
    const a = i * 2.4, s = Math.sin(a), c = Math.cos(a);
    const h = 0.54 + 0.25 * Math.cos(i * 1.9), l = 0.58 + 0.23 * Math.sin(i * 1.6);
    blade([0, 0, 0], [s * l, h, c * l], fern ? 0.013 : 0.105, a, 0.16);
    if (!fern) continue;
    for (let j = 1; j <= 6; j++) {
      const t = j / 7, spread = 0.16 * Math.sin(Math.PI * t) ** 0.54;
      const start = [s * l * t, h * t + 0.16 * Math.sin(t * Math.PI), c * l * t];
      for (const side of [-1, 1]) {
        const dx = s * 0.13 + c * spread * side, dz = c * 0.13 - s * spread * side;
        blade(start, [start[0] + dx, start[1] + 0.045, start[2] + dz], 0.033 * (1 - t * 0.46), Math.atan2(dx, dz), 0.02);
      }
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function mushroomCap() {
  const profile = [[0.02, -0.12], [1, 0.01], [0.92, 0.24], [0.57, 0.50], [0.012, 0.60]];
  return ringSurface(14, profile.length - 1, (_, a, j) => {
    const [r, y] = profile[j];
    const tint = new Color([0xffdebf, 0xffedcd, 0xcbd6cb, 0xecf3df, 0xffffff][j]);
    return [r * Math.sin(a), y + 0.047 * Math.sin(a * 3) * r, r * Math.cos(a), tint];
  });
}

function canopyCluster(sides = 14, rings = 5) {
  const bottom = new Color(0x597e79), top = new Color(0xffffaa);
  return ringSurface(sides, rings, (t, a) => {
    const r = Math.max(0.001, Math.sin(Math.PI * t) ** 0.65) *
      (1 + 0.12 * Math.sin(a * 5 + 3 * t) + 0.085 * Math.sin(a * 7 - t * 4));
    return [r * Math.sin(a), 0.95 * (t - 0.5) + 0.12 * r * Math.sin(a * 4 + 3 * t),
    r * Math.cos(a), bottom.clone().lerp(top, t ** 1.6)];
  });
}

export function plantForest(scene, glints, shade) {
  const random = forestRandom(85739);
  const choose = list => list[Math.floor(random() * list.length)];
  const batches = createBatches(scene);
  const solid = new MeshStandardMaterial({ roughness: 0.84 });
  const leafMat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.76, side: DoubleSide });
  const luminous = new MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000, roughness: 0.48 });
  luminous.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * 1.85;');
  };
  const satin = new MeshStandardMaterial({ vertexColors: true, roughness: 0.40, side: DoubleSide });
  const sphere = new SphereGeometry(1, 10, 7);
  const rockGeo = new IcosahedronGeometry(1, 1);
  const bell = ringSurface(8, 2, (t, a, j) => {
    const r = [0.92, 0.83, 0.025][j];
    return [r * Math.sin(a), t * .91 + (j === 0 ? .13 * Math.cos(a * 4) : 0), r * Math.cos(a), new Color(j === 0 ? 0xffe2c0 : 0xfffbef)];
  });
  const board = new BoxGeometry();
  const stalk = new CylinderGeometry(0.68, 1, 1, 6, 1, true);
  const leaf = new BufferGeometry();
  leaf.setAttribute('position', new Float32BufferAttribute([
    0, 0, 0, -.31, -.30, .12, -.28, -.60, .22, 0, -1, .32, .28, -.60, .22, .31, -.30, .12, 0, -.44, .29,
  ], 3));
  leaf.setIndex([0, 1, 6, 1, 2, 6, 2, 3, 6, 3, 4, 6, 4, 5, 6, 5, 0, 6]);
  leaf.setAttribute('color', new Float32BufferAttribute([
    .49, .61, .34, .48, .74, .46, .56, .79, .49, .90, .95, .56, .74, .86, .48, .64, .80, .43, .84, .92, .56,
  ], 3));
  leaf.computeVertexNormals();
  function vineLeaf(x, y, z, size, yaw) {
    place(leaf, leafMat, choose(shrub), x, y, z, size, size, size, [.34 * Math.cos(yaw), yaw, .68 * Math.sin(yaw)]);
  }
  const cap = mushroomCap();
  const paintedCap = satin.clone();
  const fairyCap = satin.clone();
  function capSpots(shader) {
    shader.vertexShader = 'varying vec3 capPoint;\n' + shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\ncapPoint=position;');
    shader.fragmentShader = 'varying vec3 capPoint;\n' + shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec2 p=capPoint.xz;
      float dots=min(length(p-vec2(.26,.32))-.108,length(p+vec2(.47,.17))-.115);
      dots=min(dots,min(length(p-vec2(.40,-.39))-.067,length(p+vec2(.21,-.59))-.074));
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.96,.83,.58),
        smoothstep(.0,.022,-dots)*smoothstep(.13,.24,capPoint.y)*.84);
    `);
  }
  paintedCap.onBeforeCompile = capSpots;
  fairyCap.onBeforeCompile = shader => {
    capSpots(shader);
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * 1.10;');
  };
  const broad = foliageClump(false), fern = foliageClump(true), crownGeo = canopyCluster();
  const canopyMat = leafMat.clone();
  canopyMat.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 crownPoint;\n' + shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\ncrownPoint = position;');
    shader.fragmentShader = 'varying vec3 crownPoint;\n' + shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec3 p=crownPoint;
      float a=atan(p.x,p.z);
      float layer=sin(14.*a+3.*sin(4.*a)+p.y*8.)*.46 + sin(a*9.-p.y*18.)*.28 + sin(17.*p.y+a*21.)*.26;
      float leafLight=smoothstep(.08,.68,layer)*smoothstep(-.53,.23,p.y);
      diffuseColor.rgb *= .77+.22*layer+.28*leafLight;
      diffuseColor.rgb += vec3(.030,.062,.014)*leafLight;
    `);
  };
  const shrub = [0x418c55, 0x2d916d, 0x69963f, 0x218367, 0x90b05f, 0x369c84];
  const crowns = [0x396448, 0x438256, 0x558750, 0x38765c, 0x718e47, 0x4e8a61];
  const caps = [0x38d7cb, 0x8de994, 0xe27e80, 0xb883ee, 0xffba68];
  const place = (g, m, c, x, y, z, sx, sy, sz, rot) => batches.place(g, m, c, [x, y, z], [sx, sy, sz], rot);
  function leaves(x, y, z, size, yaw, geometry = broad) {
    place(geometry, leafMat, choose(shrub), x, y, z, size, size, size, [0, yaw, 0]);
  }
  function crown(x, y, z, size, index) {
    place(crownGeo, canopyMat, crowns[index % crowns.length], x, y, z, size, size * 0.98, size * 0.84, [0, index * 1.2, 0.12 * Math.sin(index)]);
    // Leaf sprays break up the lower silhouette against the mist.
    const sprays = Math.hypot(x, z) > 19 ? 1 : 3;
    for (let i = 0; i < sprays; i++) {
      const a = i * 2.09 + index, r = size * 0.83;
      leaves(x + Math.sin(a) * r, y - size * 0.20, z + Math.cos(a) * r, size * 0.58, a + 2);
    }
  }
  function pod(x, y, z, size) {
    const lanterns = [0xffca70, 0xa9f1ab, 0xffae91, 0xc6acff, 0x7ce8dc];
    const tint = lanterns[Math.abs(Math.round(x * 3 + z)) % lanterns.length];
    glints.push([x, y, z, size * 5.6, tint]);
    place(sphere, luminous, tint, x, y, z, size * 0.72, size * 1.26, size * 0.72);
    place(cap, satin, 0x72905b, x, y + size * 0.92, z, size * 0.88, size * 0.77, size * 0.88);
  }
  function pendant(x, y, z, i) {
    // Pendant bracts overlap like little wisteria flowers on the canopy edge.
    const length = 0.53 + 0.16 * Math.sin(i * 2);
    place(stalk, solid, 0x497751, x, y - length * .42, z, .016, length, .016);
    for (let j = 0; j < 7; j++) {
      const t = j / 7, a = j * 2.4 + i, r = (1 - t) * .13;
      place(bell, satin, i % 3 === 0 ? 0xafb5d6 : 0x9fc89e, x + Math.sin(a) * r, y - t * length, z + Math.cos(a) * r,
        .082 * (1 - t * .51), .19 * (1 - t * .41), .082 * (1 - t * .51), [.24 * Math.cos(a), 0, .28 * Math.sin(a)]);
    }
  }
  function bracket(x, y, z, size, i) {
    place(cap, satin, i % 3 === 0 ? 0xf7b779 : 0xd39369, x, y, z, size, size * 0.56, size * 1.08, [0, i * 2, 0.08]);
  }
  function mushroom(x, z, size, color) {
    const y = size * 1.35;
    shade(x + size * .32, z - size * .28, size * 1.47, size * 1.14, .67);
    place(stalk, solid, 0xe4d7ad, x, y / 2, z, size * 0.21, y, size * 0.21, [0, 0, 0.07]);
    const magic = color === caps[0] || color === caps[1] || color === caps[3];
    if (magic && size > 0.15 && Math.hypot(x, z) < 15) glints.push([x, y + size * .16, z, size * 3.15, color]);
    place(cap, magic ? fairyCap : paintedCap, color, x - size * 0.04, y, z, size, size * 1.18, size, [0, random() * TAU, 0.08]);

  }
  function kitchen() {
    for (const x of [-2.91, -1.92]) {
      place(stalk, solid, 0x644634, x, 0.40, -2.95, 0.064, 0.8, 0.06);
    }
    for (const y of [0.30, 0.72]) place(board, solid, 0x956a46, -2.43, y, -2.95, 1.30, 0.08, 0.44, [0, -0.05, 0.018]);
    for (const [x, y, z, size, color] of [
      [-2.88, 0.76, -2.92, 0.14, 0xcb936c], [-2.53, 0.76, -2.97, 0.12, 0x669e93],
      [-2.16, 0.76, -2.94, 0.145, 0xcc9b66], [-2.65, 0.34, -2.92, 0.11, 0x879c8d],
    ]) {
      place(sphere, solid, color, x, y + size * 0.74, z, size, size * 0.91, size);
      place(stalk, solid, color, x, y + size * 1.52, z, size * 0.71, size * 0.57, size * 0.71);
      place(sphere, solid, 0x68523e, x, y + size * 1.81, z, size * 0.60, size * 0.12, size * 0.60);
      if (x < -2.8) leaves(x, y + size * 1.77, z, 0.36, 0.8);
    }
    // Mallow keeps her copper pot and wooden spoon by the ingredient shelves.
    const cookware = ringSurface(20, 6, (_, a, j) => {
      const [r, y] = [[.02, 0], [.18, .025], [.24, .13], [.22, .24], [.195, .255], [.177, .241], [.15, .07]][j];
      return [r * Math.sin(a), y, r * Math.cos(a), new Color(j === 4 ? 0xffdeb0 : j > 4 ? 0x604d45 : 0xcba58d)];
    });
    place(cookware, satin, 0xc78967, -1.84, 0, -2.72, 1, 1, 1);
    for (const side of [-1, 1]) place(sphere, solid, 0xb28b65, -1.84 + side * .234, .185, -2.72, .075, .036, .035);
    place(stalk, solid, 0xb08c60, -1.77, .28, -2.72, .019, .43, .019, [0, 0, -.36]);
    // A woven produce basket tucked beside the shelves.
    place(sphere, solid, 0xb48852, -3.16, 0.16, -2.50, 0.30, 0.19, 0.24);
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4, r = Math.sqrt(i / 9) * 0.21;
      place(sphere, solid, i % 3 ? 0x9a5f84 : 0xd08a82, -3.16 + Math.sin(a) * r, 0.30, -2.50 + Math.cos(a) * r, 0.071, 0.062, 0.072);
    }
  }
  const sapling = mergeGeometries([
    woodyCurve([[0, -0.06, 0], [-0.16, 0.35, 0.1], [-0.08, 0.74, 0.13], [0.12, 1, 0]], [0.12, 0.08, 0.052, 0.024], [0x494043, 0x919260], 8, 5),
    woodyCurve([[-0.15, 0.39, 0.10], [0.04, 0.62, 0.1], [0.33, 0.74, 0.12], [0.42, 0.86, 0.08]], [0.073, 0.045, 0.029, 0.012], [0x534547, 0x888d66], 6, 4),
    woodyCurve([[-0.1, 0.58, 0.13], [-0.25, 0.77, 0.10], [-0.28, 0.84, -0.10]], [0.05, 0.035, 0.012], [0x534547, 0x888d66], 6, 4),
  ]);
  // Trunk, forks and crowns form one instance per background tree. The tips
  // meet their crowns even after non-uniform scaling and rotation.
  function tintGeometry(geometry, tint) {
    const c = new Color(tint), colors = geometry.attributes.color;
    for (let i = 0; i < colors.count; i++) {
      colors.setXYZ(i, colors.getX(i) * c.r, colors.getY(i) * c.g, colors.getZ(i) * c.b);
    }
    return geometry;
  }
  const distantCrown = canopyCluster(11, 4);
  const trees = [0, 1, 2].map(i => {
    const canopy = (x, y, z, w, h, color) => tintGeometry(distantCrown.clone(), color)
      .scale(w, h, w * .86).rotateY(i * 1.7).translate(x, y, z);
    const trunk = sapling.clone().scale(.70, 1, .70);
    return mergeGeometries([trunk,
      canopy(.084, 1.00, 0, .36, .36, crowns[i + 1]),
      canopy(.288, .86, .056, .21, .19, crowns[i]),
      canopy(-.19, .85, -.07, .19, .17, crowns[i + 2]),
    ]);
  });
  function tree(x, z, height, yaw, index, width = height) {
    shade(x, z, width * .22, width * .19, .72);
    shade(x + height * .39, z - height * .32, width * .54, width * .43, .43);
    place(trees[index % trees.length], leafMat, 0xf0f2dd, x, 0, z, width, height, width, [0, yaw, 0]);
  }
  tree(-4.8, 1.8, 6.5, 0.4, 0);
  tree(5.0, 2.4, 6.8, 2.4, 1);
  for (const [radius, count] of [[10.7, 14], [17.5, 20], [25, 23], [32, 21]]) {
    for (let i = 0; i < count; i++) {
      const a = (i + random() * 0.67) * TAU / count, r = radius + random() * 2;
      const x = Math.sin(a) * r, z = Math.cos(a) * r - 2;
      if (z > 3 && z < 12 && Math.abs(x) < 4) continue;
      tree(x, z, 6.75 + random() * 4.6, random() * TAU, i);
    }
  }
  function clearRoute(x, z) {
    if (Math.abs(x) < 1.6 && z > -6.8 && z < -2.38) return true;
    return Math.abs(x - 0.32 * Math.sin(z * 0.92)) < (z < 0 ? 2.5 : 1.46) && z > -4.4 && z < 8.0;
  }
  // Colonies share colours and scale, with open space between them.
  for (let i = 0; i < 280; i++) {
    const a = random() * TAU, r = 2.8 + Math.sqrt(random()) * 22.0;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 1.8;
    if (clearRoute(x, z)) continue;
    const size = 0.44 + random() * 0.86;
    if (Math.hypot(x, z - 4.7) < 1.15 + size * 1.47) continue;
    shade(x + .16, z - .11, size * 1.76, size * 1.34, .71);
    place(rockGeo, solid, choose([0x477651, 0x638450, 0x467561, 0x758361]), x, 0, z, size * 1.47, size * 0.41, size, [0, random() * TAU, 0.08]);
    leaves(x, 0.11 * size, z, size * 1.14, random() * TAU);
    if (i % 5 === 0 && r < 17) leaves(x + size * 0.35, 0, z + size * 0.33, size * 1.18, random() * TAU, fern);
  }
  for (const [cx, cz, size] of [[-3.2, 2.5, 1.12], [3.3, 1.0, 1.2], [-3.3, -1.3, 0.91], [2.8, -2.8, 0.80],
  [-2.3, 5.2, 0.82], [2.9, 5.65, 1.05], [-4.3, -3.0, 1.2], [3.6, 3.9, 0.86]]) {
    leaves(cx, 0, cz, size, random() * TAU, fern);
    leaves(cx + 0.42, 0, cz - 0.32, size * 0.81, random() * TAU);
  }
  for (let i = 0; i < 78; i++) {
    const a = random() * TAU, r = 2.5 + random() * 14;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 0.8;
    if (clearRoute(x, z) || Math.hypot(x, z + 5.65) < 2) continue;
    const tint = choose(caps), size = 0.10 + random() * 0.14;
    for (let j = 0; j < 3 + i % 3; j++) {
      const angle = a + j * 2.4, offset = Math.sqrt(j) * size * 2.12;
      mushroom(x + Math.cos(angle) * offset, z + Math.sin(angle) * offset, size * (.65 + random() * .69), tint);
    }
  }
  // Pale bluebells and amber pollen tips recur in little drifts alongside the trail.
  for (let i = 0; i < 94; i++) {
    const a = random() * TAU, r = 2 + random() * 16, x = Math.sin(a) * r, z = Math.cos(a) * r + 0.5;
    if (clearRoute(x, z)) continue;
    const height = 0.31 + random() * 0.46;
    const tint = choose([0x91dbcd, 0xb7b1dc, 0xebbd88]);
    for (let j = 0; j < 2 + i % 2; j++) {
      const dx = x + random() * 0.32, dz = z + random() * 0.25, h = height * (0.72 + random() * 0.38);
      place(stalk, solid, 0x497d60, dx, h * 0.50, dz, 0.015, h, 0.014, [0, 0, -0.09]);
      for (let k = 0; k < 3; k++) {
        const sign = k % 2 ? 1 : -1;
        place(bell, satin, tint, dx + 0.046 + sign * 0.045, h * (0.60 + k * 0.19), dz, 0.048, 0.088, 0.048, [0, 0, sign * 0.44]);
      }
    }
  }
  // The lower story breaks up the horizon between mature tree trunks.
  for (let i = 0; i < 48; i++) {
    const a = i * 2.4, r = 13 + random() * 14, x = Math.sin(a) * r, z = Math.cos(a) * r;
    const h = 1.7 + random() * 2.3;
    tree(x, z, h, a, i, h * (1.65 + random() * .43));
  }
  kitchen();
  return {
    crown, pod, bracket, pendant, vineLeaf, leafSprig: leaves,
    rock: (p, s, c) => batches.place(rockGeo, solid, c, p, s),
    finish: () => batches.finish()
  };
}
