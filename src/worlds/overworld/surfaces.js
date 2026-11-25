import { CanvasTexture, SRGBColorSpace } from 'three';

function paint(size, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  draw(canvas.getContext('2d'), size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function wovenTexture() {
  return paint(256, (ctx, size) => {
    ctx.fillStyle = '#e2b391';
    ctx.fillRect(0, 0, size, size);
    for (const edge of [0, 1]) {
      ctx.save();
      if (edge) { ctx.translate(0, size); ctx.scale(1, -1); }
      for (const [y, h, tint] of [[0,10,'#465e78'],[10,4,'#edcb92'],[14,15,'#a05c6a'],[31,3,'#fff0bb']]) {
        ctx.fillStyle = tint;
        ctx.fillRect(0, y, size, h);
      }
      ctx.fillStyle = '#ffe1a3';
      for (let x = 0; x < size; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 21); ctx.lineTo(x + 6, 16); ctx.lineTo(x + 12, 21); ctx.lineTo(x + 6, 26);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(76,48,59,.15)';
    for (let i = 0; i < size; i += 4) {
      ctx.fillRect(i, 0, 1, size); ctx.fillRect(0, i, size, 1);
    }
  });
}

export function contactTexture() {
  return paint(64, (ctx, size) => {
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, '#304455');
    gradient.addColorStop(0.55, 'rgba(48,68,85,.62)');
    gradient.addColorStop(1, 'rgba(48,68,85,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  });
}
