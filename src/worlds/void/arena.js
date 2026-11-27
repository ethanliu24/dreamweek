import {
  CanvasTexture, Color, Float32BufferAttribute, LatheGeometry, Mesh, MeshStandardMaterial,
  SRGBColorSpace, Vector2,
} from 'three';

const TAU = 2 * Math.PI;
const SUN_GLOW = '#ff9409';
const MOON_GLOW = '#9c32ff';

// Paint the inlaid astronomical dial once in plan view. Mipmaps keep the far edge quiet.
function porcelainDial() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  ctx.translate(1024, 1024);

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = canvas.width;
  const glow = glowCanvas.getContext('2d');
  glow.fillStyle = '#000';
  glow.fillRect(0, 0, glowCanvas.width, glowCanvas.height);
  glow.translate(1024, 1024);
  glow.shadowBlur = 18;
  const glaze = ctx.createLinearGradient(-800, -650, 780, 770);
  for (const [at, tint] of [[0, '#f5f1e9'], [0.33, '#eff1f4'], [0.61, '#e8e2ec'], [0.83, '#f7f2ec'], [1, '#e4dde8']]) {
    glaze.addColorStop(at, tint);
  }
  ctx.fillStyle = glaze;
  ctx.fillRect(-1024, -1024, 2048, 2048);

  function arc(radius, color, width, start = 0, end = TAU, glowColor) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, start, end);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    if (glowColor) {
      glow.beginPath();
      glow.arc(0, 0, radius, start, end);
      glow.strokeStyle = glow.shadowColor = glowColor;
      glow.lineWidth = width + 3;
      glow.stroke();
    }
  }
  function facet(vertices, color, glowColor) {
    const path = new Path2D();
    path.moveTo(...vertices[0]);
    for (const vertex of vertices.slice(1)) path.lineTo(...vertex);
    path.closePath();
    ctx.fillStyle = color;
    ctx.fill(path);
    if (glowColor) {
      glow.fillStyle = glow.shadowColor = glowColor;
      glow.fill(path);
    }
  }

  // The nacre has broad translucent veins beneath the metalwork.
  // Sample them once into the pigment so they filter with the engraving at a distance.
  const wash = document.createElement('canvas');
  wash.width = wash.height = 512;
  const paint = wash.getContext('2d');
  const pigment = paint.createImageData(512, 512);
  const lattice = new Float32Array(64 * 64);
  for (let i = 0; i < lattice.length; i++) {
    const hash = Math.sin(i * 71.19 + 8.1) * 41793.13;
    lattice[i] = hash - Math.floor(hash);
  }
  function noise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    let fx = x - ix, fy = y - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const row = (iy & 63) * 64, nextRow = ((iy + 1) & 63) * 64;
    const left = ix & 63, right = (ix + 1) & 63;
    const a = lattice[row + left] * (1 - fx) + lattice[row + right] * fx;
    const b = lattice[nextRow + left] * (1 - fx) + lattice[nextRow + right] * fx;
    return a + (b - a) * fy;
  }
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const u = x / 80, v = y / 80;
      const drift = noise(u, v) + 0.24 * noise(u * 3.1, v * 3.1);
      const fold = noise(u * 0.76 + drift * 2, v * 1.9 + drift);
      const vein = Math.max(0, 1 - Math.abs(fold - 0.5) * 24) ** 2;
      const opacity = 34 * (1 - fold) ** 2 + 22 * vein;
      const offset = (y * 512 + x) * 4;
      pigment.data[offset] = 142;
      pigment.data[offset + 1] = 142;
      pigment.data[offset + 2] = 171;
      pigment.data[offset + 3] = opacity;
    }
  }
  paint.putImageData(pigment, 0, 0);
  ctx.drawImage(wash, -1024, -1024, 2048, 2048);

  // Eight pale stone leaves surround a small, two-tone compass rose.
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate(i * TAU / 8);
    glow.save();
    glow.rotate(i * TAU / 8);
    ctx.beginPath();
    ctx.moveTo(0, -140);
    ctx.bezierCurveTo(-105, -254, -120, -430, 0, -582);
    ctx.bezierCurveTo(110, -427, 104, -259, 0, -140);
    ctx.strokeStyle = '#d2cad7';
    ctx.lineWidth = 2.8;
    ctx.stroke();
    const tip = i % 2 ? 221 : 320;
    facet([[0, -tip], [-23, -79], [0, -94]], '#b5aabe', MOON_GLOW);
    facet([[0, -tip], [0, -94], [23, -79]], '#cdbfab', SUN_GLOW);
    glow.restore();
    ctx.restore();
  }
  for (const [r, tint, width, glowColor] of [
    [69, '#b1a3b9', 4, MOON_GLOW], [82, '#c6b38f', 5, SUN_GLOW], [109, '#c5bccb', 3],
    [579, '#c9bfce', 3], [590, '#cec2cc', 5, MOON_GLOW], [604, '#cdc5d0', 2],
    [805, '#cfbfd0', 2], [821, '#b7aab7', 6, MOON_GLOW], [828, '#cfbe9e', 3, SUN_GLOW],
    [903, '#bbafbf', 4], [918, '#cabda9', 6, SUN_GLOW], [926, '#b7b0c2', 3],
  ]) arc(r, tint, width, 0, TAU, glowColor);

  // Longer gilded division marks and kite-shaped settings mark the hours.
  for (let i = 0; i < 144; i++) {
    ctx.save();
    ctx.rotate(i * TAU / 144);
    const major = i % 12 === 0;
    const length = i % 3 === 0 ? 28 : 13;
    ctx.fillStyle = '#b6a8b3';
    ctx.fillRect(-1.5, -902, 3, length);
    if (major) {
      glow.save();
      glow.rotate(i * TAU / 144);
      facet([[0, -842], [-12, -866], [0, -894], [12, -866]], '#b8ab9d');
      facet([[0, -849], [-7, -866], [0, -884], [7, -866]], '#9ebdbc', SUN_GLOW);
      facet([[0, -624], [-5, -645], [0, -670], [5, -645]], '#c5b9c2', MOON_GLOW);
      glow.restore();
      arc(861, '#c8becb', 2, -Math.PI / 2 + 0.025, -Math.PI / 2 + TAU / 12 - 0.025);
      ctx.beginPath();
      ctx.moveTo(0, -681);
      ctx.lineTo(0, -804);
      ctx.strokeStyle = '#d5cdd5';
      ctx.lineWidth = 2.3;
      ctx.stroke();
    }
    ctx.restore();
  }
  for (let i = 0; i < 4; i++) {
    ctx.rotate(TAU / 4);
    glow.rotate(TAU / 4);
    facet([[0, -57], [-9, -10], [0, 0]], '#b5bfc5', MOON_GLOW);
    facet([[0, -57], [0, 0], [9, -10]], '#cbb69e', SUN_GLOW);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  const emissiveMap = new CanvasTexture(glowCanvas);
  emissiveMap.colorSpace = SRGBColorSpace;
  emissiveMap.anisotropy = texture.anisotropy;
  return { map: texture, emissiveMap };
}

export const ARENA_SCALE = 1.1;

export function addArena(scene) {
  // Each step in the turned lip catches a different strip of the sky.
  const profile = [
    [0, -0.93, 0x78668f], [6.8, -0.86, 0xbab0ca], [7.98, -0.66, 0xaca1c4],
    [8.43, -0.53, 0xd7c3e9], [8.55, -0.44, 0x846d9f], [8.63, -0.37, 0xb299cb],
    [8.71, -0.36, 0xe7ccff], [8.77, -0.32, 0xcab8e1], [8.78, -0.27, 0x91889c],
    [8.90, -0.24, 0xc5b69f], [8.96, -0.20, 0xf2e8d6], [9.0, -0.14, 0xe4dbe6],
    [8.99, -0.09, 0xe4deeb], [8.93, -0.038, 0xfdf9f1], [8.76, 0, 0xffffff], [0, 0, 0xffffff],
  ];
  const geometry = new LatheGeometry(profile.map(([r, h]) => new Vector2(r, h)), 384);
  const { position, uv } = geometry.attributes;
  const colors = [];
  const color = new Color();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), z = position.getZ(i);
    const angle = Math.atan2(z, x);
    const row = i % profile.length;
    const flute = row > 1 && row < 7 ? 0.009 * Math.cos(48 * angle) : 0;
    const ripple = 1 + 0.012 * Math.cos(3 * angle) + 0.008 * Math.sin(5 * angle);
    position.setX(i, x * (ripple + flute) * ARENA_SCALE);
    position.setZ(i, z * (ripple + flute) * ARENA_SCALE);
    uv.setXY(i, 0.5 + x / 18.8, 0.5 + z / 18.8);
    color.setHex(profile[row][2]);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  // LatheGeometry supplies smooth analytic normals, including the coincident centre vertices.
  const stone = new MeshStandardMaterial({
    ...porcelainDial(), emissive: 0xffffff, emissiveIntensity: 1.65,
    vertexColors: true, roughness: 0.41, metalness: 0.035,
  });
  // A broad reflection of the jade and violet sky follows the viewing angle across the glaze.
  stone.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      vec3 glance = reflect(-normalize(vViewPosition), normal);
      vec3 worldGlance = inverseTransformDirection(glance, viewMatrix);
      float sheen = pow(1.0 - saturate(dot(normalize(vViewPosition), normal)), 2.0);
      vec3 skyTint = mix(vec3(0.14,0.35,0.32),vec3(0.32,0.17,0.39),smoothstep(-0.6,0.5,worldGlance.x));
      outgoingLight += skyTint * sheen;
      #include <opaque_fragment>`);
  };
  const disc = new Mesh(geometry, stone);
  scene.add(disc);
}

// A feathered contact patch ties each floating silhouette to its height above the dial.
export function createShadowMap() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 96;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
  gradient.addColorStop(0, 'rgba(53,41,72,0.88)');
  gradient.addColorStop(0.44, 'rgba(67,51,80,0.65)');
  gradient.addColorStop(0.75, 'rgba(77,63,91,0.26)');
  gradient.addColorStop(1, 'rgba(77,63,91,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 96, 96);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  return map;
}
