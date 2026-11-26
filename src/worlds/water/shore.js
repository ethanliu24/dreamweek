import { createTeal } from './teal.js';
import {
  BoxGeometry, CanvasTexture, Color, CylinderGeometry, DirectionalLight, Fog,
  Group, HemisphereLight, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry,
  ShaderMaterial, SphereGeometry, SRGBColorSpace, TorusGeometry, Vector3,
} from 'three';

export const BEACH_END = 10;
export const REEF_END = -40;
const COAST_FOG = new Color(0xb2e3dd);
const REEF_FOG = new Color(0x286a88);

export function floorHeight(_x, z) {
  return MathUtils.clamp(z * (2 / 3), -12, 0);
}

export function buildShore(scene) {
  const sand = new MeshStandardMaterial({ color: 0xe7c68b });
  const seabed = new MeshStandardMaterial({ color: 0x72b7af });
  const water = new MeshBasicMaterial({ color: 0x28babc, transparent: true, opacity: 0.54, depthWrite: false });
  const blue = new MeshStandardMaterial({ color: 0x3880a2 });
  const brass = new MeshStandardMaterial({ color: 0xdca747, metalness: 0.28, roughness: 0.38 });
  const red = new MeshStandardMaterial({ color: 0xbb413b });
  const ivory = new MeshStandardMaterial({ color: 0xf2e4cb });
  const dark = new MeshStandardMaterial({ color: 0x203541 });
  const pink = new MeshStandardMaterial({ color: 0xd58f9e });
  const lilac = new MeshStandardMaterial({ color: 0xa59ad6 });
  const peach = new MeshStandardMaterial({ color: 0xe5a17b });
  const sphere = new SphereGeometry(1, 24, 16);
  const box = new BoxGeometry();
  const pipe = new CylinderGeometry(1, 1, 1, 12);

  function prop(parent, geometry, material, position, scale) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }

  function group(x, y, z) {
    const root = new Group();
    root.position.set(x, y, z);
    scene.add(root);
    return root;
  }

  function ground(start, end, material) {
    const mesh = new Mesh(new PlaneGeometry(56, start - end, 1, Math.ceil(start - end)), material);
    mesh.geometry.rotateX(-Math.PI / 2).translate(0, 0, (start + end) / 2);
    const p = mesh.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, floorHeight(p.getX(i), p.getZ(i)));
    mesh.geometry.computeVertexNormals();
    scene.add(mesh);
  }

  ground(BEACH_END + 6, 0, sand);
  ground(0, REEF_END - 16, seabed);
  // The surface faces up so an underwater camera sees the reef directly.
  const surface = new Mesh(new PlaneGeometry(180, 100), water);
  surface.rotation.x = -Math.PI / 2;
  surface.position.set(0, -0.04, -50);
  scene.add(surface);

  scene.background = COAST_FOG.clone();
  scene.fog = new Fog(COAST_FOG, 14, 65);
  const sky = new HemisphereLight(0xe3f9ff, 0x949368, 2);
  const sun = new DirectionalLight(0xffedcf, 1.55);
  sun.position.set(-6, 10, 4);
  scene.add(sky, sun);

  const faucet = group(-2, 0, 4.8);
  prop(faucet, pipe, blue, [0, 0.5, 0], [0.09, 1, 0.09]);
  prop(faucet, box, brass, [0, 1, 0.16], [0.17, 0.16, 0.36]);
  prop(faucet, pipe, brass, [0, 0.92, 0.32], [0.08, 0.19, 0.08]);
  prop(faucet, box, brass, [0, 1.17, 0.04], [0.32, 0.045, 0.055]);
  prop(faucet, pipe, brass, [0, 1.1, 0.04], [0.035, 0.15, 0.035]);

  const station = group(0.6, 0, 3.2);
  for (const x of [-0.52, 0.52]) {
    for (const z of [-0.38, 0.38]) prop(station, box, red, [x, 0.65, z], [0.09, 1.3, 0.09]);
  }
  prop(station, box, ivory, [0, 1.24, 0], [1.3, 0.13, 1]);
  prop(station, box, red, [0, 1.57, -0.42], [1.3, 0.56, 0.1]);
  prop(station, sphere, peach, [-0.68, 1.28, 0.18], [0.22, 0.16, 0.12]);
  const teal = createTeal();
  station.add(teal.root);

  const beachgoers = [-5.2, 5.4].map((x, i) => {
    const guest = group(x, 0, 3.9 + i * 1.4);
    prop(guest, sphere, i ? lilac : peach, [0, 0.33, 0], [0.34, 0.34, 0.29]);
    prop(guest, sphere, ivory, [0, 0.65, -0.02], [0.22, 0.22, 0.21]);
    prop(guest, sphere, dark, [0, 0.63, -0.21], [0.12, 0.04, 0.04]);
    return guest;
  });

  const clam = group(3.5, 0, 2.7);
  const lid = new Group();
  clam.add(lid);
  lid.position.set(0, 0.29, -0.35);
  for (let rib = -2; rib <= 2; rib++) {
    const x = rib * 0.265;
    const length = 0.51 - Math.abs(rib) * 0.065;
    prop(clam, sphere, lilac, [x, 0.16, 0], [0.24, 0.17, length]);
    prop(lid, sphere, pink, [x, 0.025, 0.32], [0.24, 0.14, length]);
  }
  for (const x of [-0.18, 0.18]) prop(lid, sphere, dark, [x, 0.015, 0.78], [0.075, 0.015, 0.025]);

  const barrier = group(0, 0, 8);
  for (const x of [-1.85, 1.85]) prop(barrier, pipe, ivory, [x, 0.65, 0], [0.09, 1.3, 0.09]);
  const rope = prop(barrier, new TorusGeometry(1.85, 0.028, 6, 32, Math.PI), red,
    [0, 1.14, 0], [1, 0.13, 1]);
  rope.rotation.z = Math.PI;
  const board = document.createElement('canvas');
  board.width = 256;
  board.height = 64;
  const pen = board.getContext('2d');
  pen.fillStyle = '#fff0d4';
  pen.fillRect(0, 0, 256, 64);
  pen.fillStyle = '#982e28';
  pen.font = 'bold 28px sans-serif';
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  pen.fillText('BEACH CLOSED', 128, 32);
  const sign = new CanvasTexture(board);
  sign.colorSpace = SRGBColorSpace;
  const signFace = new PlaneGeometry(1.3, 0.325);
  const signMaterial = new MeshBasicMaterial({ map: sign });
  for (const side of [-1, 1]) {
    const face = prop(barrier, signFace, signMaterial, [0.33, 1.02, side * 0.034], [1, 1, 1]);
    face.rotation.y = side < 0 ? Math.PI : 0;
  }

  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      prop(scene, sphere, sand, [side * (3.9 + i * 3.55), -0.47, 9.8], [2.2, 1.2 + i * 0.13, 1.7]);
    }
  }

  const corals = [
    [-5, -8, peach], [6, -11, pink], [-7, -17, pink], [7, -20, lilac],
    [-6, -26, peach], [9, -29, pink], [-10, -34, lilac], [2, -36, lilac],
    [15, -17, peach], [-15, -22, lilac], [16, -36, peach],
  ];
  for (const [x, z, material] of corals) {
    const y = floorHeight(x, z);
    for (let i = 0; i < 3; i++) {
      const shelf = prop(scene, sphere, material, [x + i * 0.42, y + 0.13 + i * 0.68, z - i * 0.3],
        [2.35 - i * 0.49, 0.64, 1.46 - i * 0.19]);
      shelf.rotation.y = i * 0.6 + x;
    }
  }

  const bellShell = new SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const bellMaterial = new MeshStandardMaterial({
    color: 0xc9b9f1, emissive: 0x5f3b80, emissiveIntensity: 0.4,
    transparent: true, opacity: 0.82, depthWrite: false,
  });
  const bells = [[-4, -27], [5, -32], [-7, -37]].map(([x, z]) => {
    const bell = group(x, floorHeight(x, z) + 2.1, z);
    prop(bell, bellShell, bellMaterial,
      [0, 0, 0], [0.58, 0.43, 0.58]);
    for (const dx of [-0.26, 0, 0.26]) prop(bell, sphere, pink, [dx, -0.29, 0], [0.047, 0.37, 0.047]);
    return { bell, x, y: bell.position.y };
  });

  const bubble = new Mesh(sphere, new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { tint: { value: new Color(0xa8fcff) } },
    vertexShader: `
      varying vec3 eye;
      varying vec3 facing;
      void main() {
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        eye = -p.xyz;
        facing = normalMatrix * normal;
        gl_Position = projectionMatrix * p;
      }`,
    fragmentShader: `
      uniform vec3 tint;
      varying vec3 eye;
      varying vec3 facing;
      void main() {
        float rim = pow(1.0 - max(dot(normalize(facing), normalize(eye)), 0.0), 3.0);
        gl_FragColor = vec4(tint, 0.025 + 0.56 * rim);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  bubble.visible = false;
  scene.add(bubble);
  const mouth = new Vector3(clam.position.x, 0.45, clam.position.z + 0.5);
  const bubbleCenter = new Vector3();

  return {
    faucet: faucet.position,
    station: station.position,
    teal,
    clam: clam.position,
    barrier,
    animate(elapsed, position, bubbleTime, announcing) {
      const depth = MathUtils.smoothstep(-position.y, 0.2, 5.4);
      scene.background.copy(COAST_FOG).lerp(REEF_FOG, depth);
      scene.fog.color.copy(scene.background);
      scene.fog.near = MathUtils.lerp(14, 4, depth);
      scene.fog.far = MathUtils.lerp(65, 30, depth);
      sun.intensity = MathUtils.lerp(1.55, 0.58, depth);

      teal.animate(elapsed, announcing);
      for (const guest of beachgoers) {
        guest.rotation.y = barrier.visible
          ? Math.atan2(station.position.x - guest.position.x, station.position.z - guest.position.z)
          : 0;
      }
      lid.rotation.x = -0.66 * Math.sin(Math.PI * bubbleTime);
      bubble.visible = bubbleTime > 0.2;
      if (bubble.visible) {
        const expansion = MathUtils.smoothstep(bubbleTime, 0.2, 0.86);
        bubbleCenter.copy(position);
        bubbleCenter.y += 0.67;
        bubble.position.lerpVectors(mouth, bubbleCenter, expansion);
        bubble.scale.setScalar(MathUtils.lerp(0.08, 0.87, expansion));
      }

      for (const [i, { bell, x, y }] of bells.entries()) {
        bell.position.x = x + Math.sin(elapsed * 0.38 + i) * 0.75;
        bell.position.y = y + Math.sin(elapsed * 0.7 + i) * 0.45;
      }
    },
  };
}
