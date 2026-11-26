import { CanvasTexture, DoubleSide, MathUtils, Mesh, MeshBasicMaterial, RingGeometry, Sprite, SpriteMaterial } from 'three';

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
  spark.visible = false;
  scene.add(sprite, spark);
  let remaining = 0;
  let height = 0;

  return {
    show(position, hitHeight, forward) {
      const damage = MathUtils.randInt(50, 120);
      const critical = Math.random() < 0.15;
      const label = critical ? `${damage}` : String(damage);
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
      height = sprite.position.y += 1.05;
      sprite.material.opacity = 1;
      sprite.visible = true;
      spark.position.copy(position).addScaledVector(forward, -0.36);
      spark.position.y = position.y + hitHeight;
      spark.rotation.y = Math.atan2(forward.x, forward.z);
      spark.material.opacity = 1;
      spark.scale.setScalar(0.12);
      spark.visible = true;
      remaining = DAMAGE_TEXT_TIME;
    },
    update(dt) {
      if (!sprite.visible) return;
      remaining = Math.max(0, remaining - dt);
      const age = DAMAGE_TEXT_TIME - remaining;
      spark.visible = age < 0.19;
      spark.scale.setScalar(0.12 + age * 2.5);
      spark.material.opacity = Math.max(0, 1 - age / 0.19);
      sprite.position.y = height + (DAMAGE_TEXT_TIME - remaining) * 0.85;
      sprite.material.opacity = Math.min(1, remaining / 0.24);
      sprite.visible = remaining > 0;
    },
  };
}
