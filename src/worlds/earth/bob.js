import {
  CanvasTexture, Group, LatheGeometry, Mesh, MeshStandardMaterial, SphereGeometry,
  Sprite, SpriteMaterial, SRGBColorSpace, Vector2,
} from 'three';

export function createBob() {
  const root = new Group();
  root.name = 'Bob';
  root.userData.kind = 'bob';
  const geometry = new LatheGeometry([
    [0, 0], [0.32, 0], [0.41, 0.035], [0.39, 0.12], [0.31, 0.26],
    [0.23, 0.43], [0.14, 0.52], [0.055, 0.55], [0, 0.56],
  ].map(([x, y]) => new Vector2(x, y)), 36);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const ripple = 1 + 0.055 * Math.cos(3 * Math.atan2(z, x) + y * 5);
    positions.setXYZ(i, x * ripple + y * y * 0.26, y, z * ripple * 0.8);
  }
  geometry.computeVertexNormals();
  const clay = new MeshStandardMaterial({ color: 0x87543d, roughness: 0.38 });
  root.add(new Mesh(geometry, clay));

  const sphere = new SphereGeometry(1, 20, 12);
  const ivory = new MeshStandardMaterial({ color: 0xffebcf });
  const ink = new MeshStandardMaterial({ color: 0x2c2226 });
  function oval(parent, material, x, y, z, w, h, d) {
    const mesh = new Mesh(sphere, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    parent.add(mesh);
  }
  const eyes = [-1, 1].map(side => {
    const eye = new Group();
    eye.position.set(0.105 * side + 0.025, 0.365, 0.168);
    root.add(eye);
    oval(eye, ivory, 0, 0, 0, 0.085, 0.094, 0.065);
    oval(eye, ink, 0.012, 0.015, 0.054, 0.038, 0.052, 0.027);
    oval(eye, ivory, 0.003, 0.042, 0.076, 0.012, 0.014, 0.006);
    return eye;
  });
  oval(root, ink, 0.025, 0.239, 0.246, 0.029, 0.011, 0.012);

  return {
    root,
    animate(elapsed, carried) {
      const wobble = Math.sin(elapsed * 4.5) * 0.025;
      root.scale.set(1 + wobble, (carried ? 0.82 : 1) - wobble, 1 + wobble);
      const blink = Math.max(0.08, Math.min(1, Math.abs((elapsed % 3.7) - 3.3) / 0.095));
      for (const eye of eyes) eye.scale.y = blink;
    },
  };
}

export function createReaction() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 74px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#412532';
  ctx.fillStyle = '#fff0d7';
  ctx.strokeText('AHH', 128, 64);
  ctx.fillText('AHH', 128, 64);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  const sprite = new Sprite(new SpriteMaterial({ map, transparent: true, depthWrite: false }));
  sprite.scale.set(0.65, 0.325, 1);
  sprite.visible = false;
  let time = 0;

  return {
    sprite,
    pop() { time = 0.85; },
    update(dt, point) {
      time = Math.max(0, time - dt);
      sprite.visible = time > 0;
      if (!sprite.visible) return;
      sprite.material.opacity = Math.min(1, time * 2.3);
      sprite.position.copy(point);
      sprite.position.y += (0.85 - time) * 0.23;
    },
  };
}
