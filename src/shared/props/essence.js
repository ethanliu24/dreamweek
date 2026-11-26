import {
  AdditiveBlending, BufferGeometry, CanvasTexture, Float32BufferAttribute, Group,
  Mesh, MeshStandardMaterial, Points, PointsMaterial, SphereGeometry, Sprite, SpriteMaterial,
} from 'three';

const COLORS = {
  sun: { core: 0xfff6d4, glow: 0xffae38, spark: 0xffdf86 },
  moon: { core: 0xf2eeff, glow: 0xa07bff, spark: 0xcdbbff },
};

export function createEssence(kind) {
  const { core, glow, spark } = COLORS[kind];
  const root = new Group();
  const orb = new Mesh(new SphereGeometry(0.2, 24, 16), new MeshStandardMaterial({
    color: core, emissive: glow, emissiveIntensity: 0.95, roughness: 0.26,
  }));
  root.add(orb);

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, '#ffffffff');
  gradient.addColorStop(0.22, '#ffffffb0');
  gradient.addColorStop(0.55, '#ffffff35');
  gradient.addColorStop(1, '#ffffff00');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const map = new CanvasTexture(canvas);
  const halo = new Sprite(new SpriteMaterial({
    map, color: glow, blending: AdditiveBlending, transparent: true,
    opacity: 0.84, depthWrite: false, toneMapped: false,
  }));
  halo.scale.setScalar(1.15);
  root.add(halo);

  const positions = [];
  for (let i = 0; i < 17; i++) {
    const angle = i * 2.4;
    const y = (i / 16 - 0.5) * 0.62;
    const radius = Math.sqrt(0.35 ** 2 - y ** 2) * (0.84 + 0.16 * Math.sin(i * 3.1));
    positions.push(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  const sparkles = new Points(geometry, new PointsMaterial({
    map, color: spark, size: kind === 'sun' ? 0.105 : 0.08, transparent: true,
    blending: AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  root.add(sparkles);

  return {
    root,
    animate(time) {
      sparkles.rotation.set(0.35, time * (kind === 'sun' ? 1.65 : -0.95), time * 0.4);
      sparkles.material.opacity = 0.78 + Math.sin(time * 5) * 0.22;
      halo.material.opacity = 0.78 + Math.sin(time * 2.7) * 0.1;
    },
  };
}
