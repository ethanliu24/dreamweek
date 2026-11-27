import {
  BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, InstancedMesh,
  Object3D, Vector3,
} from 'three';

export const TAU = Math.PI * 2;

export function forestRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// Contours run from the foot to the crown. Each sample supplies position and linear colour.
export function ringSurface(sides, rows, sample) {
  const positions = [], colors = [], indices = [];
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i < sides; i++) {
      const [x, y, z, tint] = sample(j / rows, i * TAU / sides, j);
      positions.push(x, y, z);
      colors.push(tint.r, tint.g, tint.b);
      if (j === rows) continue;
      const a = j * sides + i, b = j * sides + (i + 1) % sides;
      indices.push(a, b, a + sides, b, b + sides, a + sides);
    }
  }
  const shape = new BufferGeometry();
  shape.setAttribute('position', new Float32BufferAttribute(positions, 3));
  shape.setAttribute('color', new Float32BufferAttribute(colors, 3));
  shape.setIndex(indices);
  shape.computeVertexNormals();
  return shape;
}

// Tapered, fluted sweeps for roots, boughs, and the slim stems of climbing plants.
export function woodyCurve(points, radii, palette, sides = 10, steps = 14) {
  const curve = new CatmullRomCurve3(points.map(p => new Vector3(...p)));
  const frames = curve.computeFrenetFrames(steps, false);
  const [shade, light] = palette.map(c => new Color(c));
  return ringSurface(sides, steps, (t, a, j) => {
    const position = curve.getPointAt(t);
    const k = t * (radii.length - 1), i = Math.min(Math.floor(k), radii.length - 2);
    const radius = (radii[i] + (radii[i + 1] - radii[i]) * (k - i)) * (1 + 0.085 * Math.cos(a * 5 + t * 2));
    const normal = frames.normals[j].clone().multiplyScalar(Math.cos(a))
      .addScaledVector(frames.binormals[j], Math.sin(a));
    position.addScaledVector(normal, radius);
    return [...position.toArray(), shade.clone().lerp(light, 0.35 + normal.y * 0.27 + 0.14 * Math.cos(a * 5 + t * 2))];
  });
}

export function createBatches(scene) {
  const geometries = new Map();
  const pose = new Object3D();
  return {
    place(geometry, material, color, position, scale, rotation = [0, 0, 0]) {
      if (!geometries.has(geometry)) geometries.set(geometry, new Map());
      const variants = geometries.get(geometry);
      if (!variants.has(material)) variants.set(material, []);
      pose.position.set(...position);
      pose.scale.set(...scale);
      pose.rotation.set(...rotation);
      pose.updateMatrix();
      variants.get(material).push([pose.matrix.clone(), new Color(color)]);
    },
    finish() {
      for (const [geometry, variants] of geometries) {
        for (const [material, placements] of variants) {
          // Keep dense beds in spatial tiles so an orbit culls plants behind the camera.
          const tiles = new Map();
          const triangles = geometry.index?.count / 3 || geometry.attributes.position.count / 3;
          const subdivide = placements.length * triangles > 16000;
          for (const placement of placements) {
            const e = placement[0].elements;
            const tile = subdivide ? Math.floor(e[12] / 12) + ',' + Math.floor(e[14] / 12) : 'all';
            if (!tiles.has(tile)) tiles.set(tile, []);
            tiles.get(tile).push(placement);
          }
          for (const tile of tiles.values()) {
            const mesh = new InstancedMesh(geometry, material, tile.length);
            tile.forEach(([matrix, color], i) => {
              mesh.setMatrixAt(i, matrix);
              mesh.setColorAt(i, color);
            });
            scene.add(mesh);
          }
        }
      }
      geometries.clear();
    },
  };
}
