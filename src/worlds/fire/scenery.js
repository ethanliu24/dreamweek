import {
  BoxGeometry, Color, ConeGeometry, CylinderGeometry, DirectionalLight, Fog,
  HemisphereLight, Mesh, MeshStandardMaterial, PlaneGeometry, PointLight, Scene, SphereGeometry,
} from 'three';

const STEPS_X = [0, 0.3, 0.85, 1.45, 1.85, 1.8, 1.4, 0.75, 0, -0.65, -1.1, -1.25];

export function createScenery() {
  const scene = new Scene();
  scene.name = 'Fire';
  scene.background = new Color(0x182743);
  scene.fog = new Fog(0x182743, 22, 86);

  const timber = new MeshStandardMaterial({ color: 0x47232e });
  const paper = new MeshStandardMaterial({ color: 0xd85236, emissive: 0xb83119, emissiveIntensity: 0.45 });
  const gold = new MeshStandardMaterial({ color: 0xf8bf61, emissive: 0xb3712a, emissiveIntensity: 0.28 });
  const grass = new MeshStandardMaterial({ color: 0x354e50 });
  const path = new MeshStandardMaterial({ color: 0x76645e, polygonOffset: true, polygonOffsetFactor: -1 });
  const pine = new MeshStandardMaterial({ color: 0x243a40 });
  const box = new BoxGeometry(1, 1, 1);

  function place(geometry, material, x, y, z, width, height, depth) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(width, height, depth);
    scene.add(mesh);
  }

  const walkBounds = { minX: -9, maxX: 9, minZ: -33, maxZ: 7 };
  place(box, grass, 0, -0.75, -13, 24, 1.5, 46);
  const approach = new Mesh(new PlaneGeometry(2.6, 8), path);
  approach.rotation.x = -Math.PI / 2;
  approach.position.z = 2;
  scene.add(approach);

  const tassel = new CylinderGeometry(0.035, 0.055, 0.22, 6);
  const platforms = STEPS_X.map((x, index) => {
    const summit = index === STEPS_X.length - 1;
    const z = -index * 2.52;
    const y = (index + 1) * 0.65;
    const width = summit ? 3.4 : 2.4;
    const depth = summit ? 2.2 : 1.8;
    const body = summit ? 0.95 : 0.42;

    place(box, gold, x, y - 0.05, z, width, 0.1, depth);
    place(box, paper, x, y - 0.1 - body / 2, z, width - 0.14, body, depth - 0.14);
    place(box, timber, x, y - body - 0.135, z, width, 0.07, depth);
    for (const side of [-1, 1]) {
      for (const end of [-1, 1]) {
        place(box, timber, x + side * (width / 2 - 0.07), y - 0.1 - body / 2,
          z + end * (depth / 2 - 0.07), 0.1, body, 0.1);
      }
      place(tassel, gold, x + side * width * 0.26, y - body - 0.28, z, 1, 1, 1);
    }

    return { y, minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 };
  });

  const ridge = new SphereGeometry(1, 18, 10);
  for (const [layer, color] of [0x303753, 0x3b4161, 0x4a5072].entries()) {
    const rock = new MeshStandardMaterial({ color });
    for (let peak = 0; peak < 7; peak++) {
      const x = (peak - 3) * (10 + 3 * layer) + 3 * layer;
      const z = -40 - layer * 13 + Math.abs(peak - 3) * 3;
      place(ridge, rock, x, -4, z, 8 + layer * 3, 12 + (peak * 7 % 5) + layer * 3, 7);
    }
  }

  const crown = new ConeGeometry(1, 1, 7);
  const lantern = new SphereGeometry(1, 10, 8);
  for (const side of [-1, 1]) {
    for (let index = 0; index < 6; index++) {
      const z = 2 - index * 6;
      const x = side * (7 + index % 3);
      place(crown, pine, x, 1.25, z, 0.85, 2.5, 0.85);
      place(crown, pine, x, 2.15, z, 0.62, 1.8, 0.62);
      if (index > 2) continue;
      const poleX = side * (2.8 + index);
      place(box, timber, poleX, 1.1, z, 0.1, 2.2, 0.1);
      place(box, timber, poleX - side * 0.23, 2.15, z, 0.56, 0.07, 0.07);
      place(lantern, paper, poleX - side * 0.46, 1.9, z, 0.22, 0.19, 0.22);
      place(tassel, gold, poleX - side * 0.46, 1.66, z, 0.6, 0.55, 0.6);
    }
  }

  const key = new DirectionalLight(0xc1d4ff, 1.5);
  key.position.set(-4, 8, 5);
  const glow = new PointLight(0xffa24d, 32, 10);
  glow.position.set(0, 2, 2);
  scene.add(new HemisphereLight(0xa6b9ee, 0x54354a, 1.5), key, glow);
  return { scene, platforms, walkBounds };
}
