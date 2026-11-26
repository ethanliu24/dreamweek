import {
  BoxGeometry, BufferGeometry, CanvasTexture, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute,
  InstancedMesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, SRGBColorSpace,
} from 'three';

// Share static details by geometry/material and keep the ceremonial lantern on its own moving parent.
export function batches(parent) {
  const groups = new Map();
  const transform = new Object3D();
  return {
    add(geometry, material, x, y, z, w, h, d, rx = 0, ry = 0, rz = 0) {
      const key = geometry.id + '/' + material.id;
      if (!groups.has(key)) groups.set(key, { geometry, material, matrices: [] });
      transform.position.set(x, y, z);
      transform.scale.set(w, h, d);
      transform.rotation.set(rx, ry, rz);
      transform.updateMatrix();
      groups.get(key).matrices.push(transform.matrix.clone());
    },
    finish() {
      for (const { geometry, material, matrices } of groups.values()) {
        const mesh = new InstancedMesh(geometry, material, matrices.length);
        matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
        parent.add(mesh);
      }
      groups.clear();
    },
  };
}


function paperTexture() {
  const canvas=document.createElement('canvas');
  canvas.width=256;canvas.height=192;
  const ctx=canvas.getContext('2d');
  const glow=ctx.createRadialGradient(128,137,4,128,97,155);

  for(const [stop,tint] of [[0,'#fff9eb'],[0.32,'#fff1d9'],[0.68,'#e9dfd0'],[1,'#c9c4c8']])glow.addColorStop(stop,tint);

  ctx.fillStyle=glow;ctx.fillRect(0,0,256,192);

  for(let i=0;i<4200;i++){
    ctx.fillStyle=i%2?'#ffffff38':'#887b6818';
    ctx.fillRect(Math.random()*256,Math.random()*192,1+Math.random()*3,1);
  }

  ctx.fillStyle='#aa967c30';
  for(let i=1;i<8;i++)ctx.fillRect(32*i,0,2,192);

  ctx.lineWidth=3;
  ctx.strokeStyle='#e9d5aecc';
  ctx.strokeRect(8,10,240,172);

  ctx.beginPath();
  ctx.moveTo(48,112);
  ctx.bezierCurveTo(85,118,76,88,108,92);
  ctx.bezierCurveTo(114,62,158,67,151,91);
  ctx.bezierCurveTo(145,108,124,97,135,87);
  ctx.moveTo(143,111);
  ctx.bezierCurveTo(173,107,167,83,207,87);
  ctx.stroke();

  const texture=new CanvasTexture(canvas);
  texture.colorSpace=SRGBColorSpace;
  return texture;
}

// Rounded square sections swell between the neck and foot like folded paper.
function envelope() {
  const positions = [], uv = [], indices = [];
  const rings = [[0, 0.58], [0.12, 0.74], [0.47, 1], [0.8, 0.98], [1, 0.79]];
  for (let face = 0; face < 4; face++) {
    const angle = face * Math.PI / 2;
    const start = positions.length / 3;
    for (const [y, r] of rings) {
      for (let k = 0; k <= 10; k++) {
        const t = (k / 10 - 0.5) * Math.PI / 2;
        const x = Math.sign(t) * Math.pow(Math.abs(Math.sin(t)), 0.56) * 0.53 * r;
        const z = Math.pow(Math.cos(t), 0.56) * 0.53 * r;
        positions.push(x * Math.cos(angle) + z * Math.sin(angle), y, z * Math.cos(angle) - x * Math.sin(angle));
        uv.push(k / 10, y);
      }
    }
    for (let j = 0; j < rings.length - 1; j++) for (let k = 0; k < 10; k++) {
      const a = start + j * 11 + k;
      indices.push(a, a + 1, a + 11, a + 1, a + 12, a + 11);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  g.setIndex(indices); g.computeVertexNormals();
  return g;
}

export function lanternKit() {
  const skin=envelope(),box=new BoxGeometry(),tube=new CylinderGeometry(0.5,0.5,1,10);
  const map=paperTexture();

  const paper=new MeshStandardMaterial({map,emissive:new Color(0xffe6c5),emissiveMap:map,emissiveIntensity:0.48,roughness:0.94});
  const topPaper=new MeshStandardMaterial({map,emissive:new Color(0xffe6c5),emissiveMap:map,emissiveIntensity:0.36,roughness:1});
  const bamboo=new MeshStandardMaterial({color:0xa58a65,roughness:0.88});
  const gold=new MeshStandardMaterial({color:0xd8b47e,emissive:0x65452e,emissiveIntensity:0.16,metalness:0.22,roughness:0.58});
  const burner=new MeshStandardMaterial({color:0x493b37,metalness:0.35,roughness:0.65});
  const flame=new MeshBasicMaterial({color:0xffd49b});

  return (batch,x,y,z,w,h,d) => {
    const bodyH=Math.max(h,Math.min(0.94,d*0.52));
    const bottom=y-bodyH-0.025,center=(bottom+y)/2;
    const px=w*0.425,pz=d*0.425;

    // Full, softly inflated paper envelope.
    batch.add(skin,paper,x,bottom,z,w,bodyH,d);

    // Fine vertical bamboo supports.
    for(const sx of [-1,1]){
      for(const sz of [-1,1]){
        batch.add(tube,bamboo,x+sx*px,center,z+sz*pz,0.025,bodyH*0.98,0.025);
      }
    }

    // Slim upper frame.
    for(const side of [-1,1]){
      batch.add(box,bamboo,x,y-0.045,z+side*pz,w*0.84,0.028,0.028);
      batch.add(box,bamboo,x+side*px,y-0.045,z,0.028,0.028,d*0.84);
    }

    // Flat translucent walking surface.
    batch.add(box,topPaper,x,y-0.018,z,w*0.79,0.036,d*0.79);

    // Delicate golden trim.
    for(const side of [-1,1]){
      batch.add(box,gold,x,y-0.008,z+side*d*0.385,w*0.74,0.012,0.012);
      batch.add(box,gold,x+side*w*0.385,y-0.008,z,0.012,0.012,d*0.74);
    }

    // Open lower aperture: only four thin bamboo rails, no bottom plate.
    for(const side of [-1,1]){
      batch.add(box,bamboo,x,bottom+0.025,z+side*d*0.265,w*0.53,0.025,0.025);
      batch.add(box,bamboo,x+side*w*0.265,bottom+0.025,z,0.025,0.025,d*0.53);
    }

    // Exposed burner suspended inside the opening.
    const by=bottom-0.045;
    batch.add(tube,burner,x,by,z,0.18,0.035,0.18);

    for(const side of [-1,1]){
      batch.add(tube,bamboo,x+side*0.13,by+0.035,z,0.012,0.13,0.012);
      batch.add(tube,bamboo,x,by+0.035,z+side*0.13,0.012,0.13,0.012);
    }

    batch.add(tube,flame,x,bottom+0.035,z,0.055,0.13,0.055);
  };
}
