import { BufferGeometry, CanvasTexture, Color, DoubleSide, Float32BufferAttribute, Group, MathUtils, Mesh, MeshBasicMaterial, RingGeometry, Sprite, SpriteMaterial } from 'three';

const DAMAGE_TEXT_TIME = 0.62;

export function createHitFeedback(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  const texture = new CanvasTexture(canvas);
  const sprite = new Sprite(new SpriteMaterial({ map: texture, depthTest: false, depthWrite: false, toneMapped: false }));
  sprite.visible = false;
  const spark = new Mesh(new RingGeometry(0.65, 1, 8), new MeshBasicMaterial({
    color: 0xffe7b0, transparent: true, depthTest: false, depthWrite: false, side: DoubleSide,
  }));
  // Tapered rays have an amber edge and a hot core that also reads over white stone.
  const rays = new BufferGeometry();
  const vertices = [], colors = [], indices = [];
  const tint = new Color();
  for (let i = 0; i < 11; i++) {
    const angle = i * 2.4;
    const x = Math.cos(angle), y = Math.sin(angle);
    const length = 0.4 + 0.41 * Math.sin(i * 1.7 + 0.8) ** 2;
    const halfWidth = i % 3 === 0 ? 0.038 : 0.019;
    const start = i * 4;
    vertices.push(x * 0.1, y * 0.1, 0, x * 0.25 - y * halfWidth, y * 0.25 + x * halfWidth, 0,
      x * length, y * length, 0, x * 0.25 + y * halfWidth, y * 0.25 - x * halfWidth, 0);
    for (const color of [0xfff3c0, 0xffc385, 0xdb8d5f, 0xfff9dc]) {
      tint.setHex(color);
      colors.push(tint.r, tint.g, tint.b);
    }
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }
  rays.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  rays.setAttribute('color', new Float32BufferAttribute(colors, 3));
  rays.setIndex(indices);
  const spray = new Mesh(rays, new MeshBasicMaterial({
    vertexColors: true, side: DoubleSide, transparent: true, depthWrite: false, toneMapped: false,
  }));
  const impact = new Group();
  impact.add(spark, spray);
  impact.visible = false;
  scene.add(sprite, impact);
  let strength = 1;
  let remaining = 0;
  let height = 0;

  return {
    show(position, hitHeight, forward, size = 1) {
      const damage = MathUtils.randInt(50, 120);
      const critical = Math.random() < 0.15;
      const label = String(damage);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = 'bold 46px system-ui';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.lineWidth = 7;
      context.strokeStyle = '#201629';
      context.fillStyle = critical ? '#ffd166' : '#fff5ff';
      context.strokeText(label, 128, 48);
      context.fillText(label, 128, 48);
      texture.needsUpdate = true;
      sprite.scale.set(critical ? 1.9 : 1.6, critical ? 0.71 : 0.6, 1);
      sprite.position.copy(position);
      height = sprite.position.y += hitHeight + 0.46;
      sprite.material.opacity = 1;
      sprite.visible = true;
      strength = size;
      impact.position.copy(position).addScaledVector(forward, -0.34 * size);
      impact.position.y += hitHeight;
      impact.rotation.set(-0.22, Math.atan2(forward.x, forward.z), 0, 'YXZ');
      spray.rotation.z += 1.25;
      impact.visible = spark.visible = true;
      spark.material.opacity = spray.material.opacity = 1;
      spark.scale.setScalar(0.09 * size);
      spray.scale.setScalar(0.65 * size);
      remaining = DAMAGE_TEXT_TIME;
    },
    update(dt) {
      if (!sprite.visible) return;
      remaining = Math.max(0, remaining - dt);
      const age = DAMAGE_TEXT_TIME - remaining;
      impact.visible = age < 0.28;
      const burst = Math.min(age / 0.28, 1);
      spray.scale.setScalar(strength * (0.65 + 0.74 * (1 - (1 - burst) ** 3)));
      spray.material.opacity = (1 - burst) ** 1.4;
      spark.visible = age < 0.19;
      spark.scale.setScalar(strength * (0.09 + age * 2.2));
      spark.material.opacity = Math.max(0, 1 - age / 0.19);
      sprite.position.y = height + (DAMAGE_TEXT_TIME - remaining) * 0.85;
      sprite.material.opacity = Math.min(1, remaining / 0.24);
      sprite.visible = remaining > 0;
    },
  };
}
