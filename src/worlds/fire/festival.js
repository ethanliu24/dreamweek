
import {
  AdditiveBlending, BoxGeometry, BufferGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry,
  DoubleSide, DynamicDrawUsage, EquirectangularReflectionMapping, ExtrudeGeometry, Float32BufferAttribute,
  FogExp2, Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PlaneGeometry, RepeatWrapping, Points, PointsMaterial, PointLight, Shape, SphereGeometry, Sprite,
  SpriteMaterial, SRGBColorSpace, TorusGeometry,
} from 'three';
import { addCandleStream } from './candle-stream.js';
import { batches } from './lanterns.js';

const tau = Math.PI * 2;
const FIREFLY_BOB = { amplitude: [0.13, 0.16], speed: [0.35, 0.5] };
const rand = (a,b) => a + Math.random() * (b-a);
const smooth = (a,b,x) => { const t = Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
const matte = (color, roughness = 0.92) => new MeshStandardMaterial({ color, roughness, metalness: 0.02 });

function nightSky() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; canvas.height = 768;
  const ctx = canvas.getContext('2d');
  const wash = ctx.createLinearGradient(0,0,0,768);
  for (const [y,col] of [[0,'#090e26'],[0.25,'#152044'],[0.40,'#31365a'],[0.48,'#604558'],[0.52,'#936454'],[0.62,'#47405b'],[1,'#282c46']]) wash.addColorStop(y,col);
  ctx.fillStyle=wash; ctx.fillRect(0,0,2048,768);
  for(let i=0;i<450;i++){
    const x=rand(0,2048), y=rand(216,427), w=rand(24,145), h=rand(2,14);
    ctx.save(); ctx.translate(x,y); ctx.scale(w,h);
    const cloud=ctx.createRadialGradient(0,0,0,0,0,1);
    cloud.addColorStop(0,i%3?'#f7ad9c16':'#35365b29'); cloud.addColorStop(1,'#60598100');
    ctx.fillStyle=cloud; ctx.fillRect(-1,-1,2,2); ctx.restore();
  }
  for(let i=0;i<1500;i++){
    const y=rand(8,360), r=rand(0.3,1.5);
    ctx.fillStyle=i%5?'#fff1dd93':'#e8d2ff';
    ctx.beginPath();ctx.arc(rand(0,2048),y,r,0,tau);ctx.fill();
  }
  const sky=new CanvasTexture(canvas);
  sky.colorSpace=SRGBColorSpace; sky.mapping=EquirectangularReflectionMapping;
  return sky;
}

function terrainHeight(x,z) {
  const edgeX = smooth(7.0,20.5,Math.abs(x));
  const edgeZ = smooth(20,33,Math.abs(z+13));
  const edge = Math.max(edgeX,edgeZ);
  const broad = Math.sin(x*0.37+z*0.13)*Math.sin(z*0.25-x*0.12);
  const fine = Math.sin(x*1.12+z*0.64)*Math.cos(z*0.81-x*0.38);
  return -0.13 + edge*edge*2.65 + broad*0.12 + fine*0.035*(0.35+edge);
}

function reservedGroundArea(x,z) {
  const areas=[
    [-12.5,-19.5,5.2,4.2],
    [-19,-20,3.2,3.0],
    [12.5,-21.5,4.3,3.8],
    [-17,-28,2.3,2.3],
    [-18,-36,2.6,2.6],
    [18,-36,2.6,2.6],
    [-14.5,-10.2,2.2,2.0],
    [15.2,-12,2.2,2.0],
    [18,-15,2.0,2.0],
  ];
  return areas.some(([cx,cz,rx,rz])=>((x-cx)/rx)**2+((z-cz)/rz)**2<1);
}

// Tile a fine layer of silt, leaf litter and broken blades over the broad terrain colors.
function meadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#b4b4b4';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 6800; i++) {
    const x = rand(0, 256), y = rand(0, 256);
    ctx.strokeStyle = i % 5 ? '#333d4c60' : '#ffe9bf80';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + rand(-2, 2), y + rand(1, 4));
    ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function makeTerrain() {
  const width=48, depth=68, nx=144, nz=204, positions=[], colors=[], uvs=[], indices=[];
  const low=[0.034,0.049,0.067], high=[0.12,0.095,0.112], edge=[0.055,0.085,0.095];
  for(let iz=0;iz<=nz;iz++){
    const z=18-iz/nz*depth;
    for(let ix=0;ix<=nx;ix++){
      const x=-width/2+ix/nx*width, h=terrainHeight(x,z);
      positions.push(x,h,z);
      uvs.push(x/3,z/3);
      const e=Math.max(smooth(7,20.5,Math.abs(x)),smooth(20,33,Math.abs(z+13)));
      const patch=0.5+0.5*Math.sin(x*0.28+z*0.21)*Math.cos(z*0.34);
      const rockMix=smooth(0.58,0.98,e+Math.max(0,h)*0.07);
      for(let k=0;k<3;k++){
        const grass=low[k]*(1-patch)+high[k]*patch;
        colors.push(grass*(1-rockMix)+edge[k]*rockMix);
      }
      if(ix<nx&&iz<nz){const a=iz*(nx+1)+ix,b=a+1,c=a+nx+1,d=c+1;indices.push(a,b,c,b,d,c);}
    }
  }
  const geometry=new BufferGeometry();
  geometry.setAttribute('position',new Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new Float32BufferAttribute(colors,3));
  geometry.setAttribute('uv',new Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  const mesh=new Mesh(geometry,new MeshStandardMaterial({vertexColors:true,map:meadowTexture(),roughness:0.96,metalness:0.01}));
  mesh.receiveShadow=true; mesh.frustumCulled=false;
  return mesh;
}

function mountainProfile(u,phase) {
  const peaks=[[-0.91,0.34,0.10],[-0.72,0.70,0.13],[-0.47,0.48,0.16],[-0.22,0.88,0.12],[0.08,0.57,0.16],[0.36,0.76,0.14],[0.62,0.53,0.17],[0.88,0.82,0.12]];
  let h=0.12+0.035*Math.sin(u*23+phase)+0.025*Math.sin(u*47-phase*1.7);
  for(const [center,amp,width] of peaks){const d=(u-center)/width;h+=amp*Math.exp(-d*d*1.4);}
  return Math.min(1,h);
}

function makeRidge(width,depth,z,baseY,height,color,phase) {
  const nx=220,nz=26,positions=[],colors=[],indices=[];
  const baseColor=new Color(color);
  for(let ix=0;ix<=nx;ix++){
    const u=ix/nx, x=(u-0.5)*width;
    const peak=height*mountainProfile(u,phase);
    for(let iz=0;iz<=nz;iz++){
      const t=iz/nz;
      const warp=Math.sin(u*19+phase)*t*1.8+Math.sin(u*43-phase)*t*0.55;
      const strata=0.91+0.055*Math.sin(x*0.21+t*17+phase)+0.025*Math.cos(x*0.53-t*29);
      const faceNoise=0.97+0.03*Math.sin(u*91+t*37+phase);
      const y=baseY+peak*(1-Math.pow(t,0.88))+Math.sin(u*31+t*11+phase)*0.24*Math.sin(t*Math.PI);
      positions.push(x+warp,y,z+t*depth);
      colors.push(baseColor.r*strata*faceNoise,baseColor.g*strata*faceNoise,baseColor.b*strata*faceNoise);
      if(ix<nx&&iz<nz){const a=ix*(nz+1)+iz,b=a+1,c=a+nz+1,d=c+1;indices.push(a,b,c,b,d,c);}
    }
  }
  const geometry=new BufferGeometry();
  geometry.setAttribute('position',new Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new Float32BufferAttribute(colors,3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  const material=new MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0.01,side:DoubleSide});
  const mesh=new Mesh(geometry,material); mesh.receiveShadow=true; mesh.frustumCulled=false;
  return mesh;
}

function makeRockGeometry() {
  const g=new IcosahedronGeometry(1,3), p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const n=1+0.075*Math.sin(x*8.1+y*4.7+z*6.3)+0.035*Math.sin(z*14.2-x*9.3);
    p.setXYZ(i,x*n,y*n*(0.84+0.08*Math.sin(x*5+z*4)),z*n);
  }
  g.computeVertexNormals(); return g;
}

function makeNeedleCone() {
  const g=new ConeGeometry(1,1,18,7), p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const a=Math.atan2(z,x), r=Math.sqrt(x*x+z*z);
    const ripple=1+0.055*Math.sin(a*7+y*15)+0.025*Math.sin(a*13-y*9);
    p.setXYZ(i,x*ripple,y,z*ripple);
  }
  g.computeVertexNormals(); return g;
}

function makeStepStone(seed) {
  const shape=new Shape(), n=9;
  for(let i=0;i<n;i++){
    const a=i/n*tau, r=0.78+0.13*Math.sin(i*2.1+seed)+0.07*Math.cos(i*3.7+seed*1.6);
    const x=Math.cos(a)*r, y=Math.sin(a)*r*0.78;
    if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);
  }
  shape.closePath();
  const g=new ExtrudeGeometry(shape,{depth:0.13,steps:1,bevelEnabled:true,bevelSegments:3,bevelThickness:0.045,bevelSize:0.065,curveSegments:2});
  g.rotateX(-Math.PI/2);g.computeVertexNormals();return g;
}

function makeFireflies(scene) {
  const positions=[];

  for(const [count,minY,maxY] of [[260,0.5,7],[260,6,14],[220,12,22]]){
    for(let i=0;i<count;i++){
      positions.push(rand(-8.8,8.8),rand(minY,maxY),rand(-34,8));
    }
  }

  for(let i=0;i<135;i++){
    positions.push(rand(-13,13),rand(0.35,4.8),rand(-34,9));
  }

  const geometry=new BufferGeometry();
  geometry.setAttribute('position',new Float32BufferAttribute(positions,3));

  const position = geometry.getAttribute('position').setUsage(DynamicDrawUsage);
  const motion = Array.from({ length: position.count }, (_, i) => {
    const baseY = position.getY(i);
    return {
      baseY,
      amplitude: Math.min(rand(...FIREFLY_BOB.amplitude), baseY * 0.8),
      speed: rand(...FIREFLY_BOB.speed),
      phase: rand(0, tau),
    };
  });

  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=64;
  const ctx=canvas.getContext('2d');
  const g=ctx.createRadialGradient(32,32,1,32,32,32);
  g.addColorStop(0,'rgba(255,237,184,1)');
  g.addColorStop(0.18,'rgba(255,190,112,0.7)');
  g.addColorStop(0.52,'rgba(255,139,72,0.16)');
  g.addColorStop(1,'rgba(255,139,72,0)');

  ctx.fillStyle=g;
  ctx.fillRect(0,0,64,64);

  const map=new CanvasTexture(canvas);
  map.colorSpace=SRGBColorSpace;

  const material=new PointsMaterial({
    color:0xffd3a0,
    size:0.48,
    map,
    transparent:true,
    opacity:0.82,
    depthWrite:false,
    blending:AdditiveBlending,
    sizeAttenuation:true,
  });

  const points=new Points(geometry,material);
  points.frustumCulled=false;
  scene.add(points);
  return time => {
    for (let i = 0; i < motion.length; i++) {
      const { baseY, amplitude, speed, phase } = motion[i];
      position.setY(i, baseY + Math.sin(time * speed + phase) * amplitude);
    }
    position.needsUpdate = true;
  };
}

function makeSoftGlowMap() {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(64,64,1,64,64,64);
  g.addColorStop(0,'rgba(190,235,246,0.7)');g.addColorStop(0.22,'rgba(104,191,210,0.3)');g.addColorStop(0.56,'rgba(80,150,190,0.08)');g.addColorStop(1,'rgba(80,150,190,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
  const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;return map;
}

function makeMistSprites(scene) {

  function texture(color) {
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=256;
    const ctx=canvas.getContext('2d');

    // Overlapping, irregular cloud formations.
    for(let i=0;i<34;i++){
      const x=rand(35,221),y=rand(35,221),w=rand(30,100),h=rand(10,36);
      ctx.save();ctx.translate(x,y);ctx.rotate(rand(-0.25,0.25));ctx.scale(w,h);

      const g=ctx.createRadialGradient(0,0,0,0,0,1);
      g.addColorStop(0,`rgba(${color},0.48)`);
      g.addColorStop(0.22,`rgba(${color},0.32)`);
      g.addColorStop(0.55,`rgba(${color},0.11)`);
      g.addColorStop(1,`rgba(${color},0)`);

      ctx.fillStyle=g;
      ctx.fillRect(-1,-1,2,2);
      ctx.restore();
    }

    // Fine wispy strands.
    for(let i=0;i<18;i++){
      const y=rand(35,220);
      ctx.beginPath();
      ctx.moveTo(20,y);
      ctx.bezierCurveTo(
        70,y+rand(-18,18),
        170,y+rand(-22,22),
        236,y+rand(-12,12)
      );
      ctx.strokeStyle=`rgba(${color},0.035)`;
      ctx.lineWidth=rand(6,16);
      ctx.stroke();
    }

    // Fade horizontally into complete transparency.
    ctx.globalCompositeOperation='destination-in';
    let mask=ctx.createLinearGradient(0,0,256,0);
    mask.addColorStop(0,'rgba(255,255,255,0)');
    mask.addColorStop(0.16,'rgba(255,255,255,0.75)');
    mask.addColorStop(0.35,'rgba(255,255,255,1)');
    mask.addColorStop(0.65,'rgba(255,255,255,1)');
    mask.addColorStop(0.84,'rgba(255,255,255,0.75)');
    mask.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=mask;
    ctx.fillRect(0,0,256,256);

    // Fade vertically too.
    mask=ctx.createLinearGradient(0,0,0,256);
    mask.addColorStop(0,'rgba(255,255,255,0)');
    mask.addColorStop(0.18,'rgba(255,255,255,0.75)');
    mask.addColorStop(0.4,'rgba(255,255,255,1)');
    mask.addColorStop(0.6,'rgba(255,255,255,1)');
    mask.addColorStop(0.82,'rgba(255,255,255,0.75)');
    mask.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=mask;
    ctx.fillRect(0,0,256,256);

    ctx.globalCompositeOperation='source-over';

    const map=new CanvasTexture(canvas);
    map.colorSpace=SRGBColorSpace;
    return map;
  }

  const materials=[
    new SpriteMaterial({map:texture('172,157,205'),color:0xd0c4e8,transparent:true,opacity:0.82,depthWrite:false}),
    new SpriteMaterial({map:texture('116,148,190'),color:0xb7cce5,transparent:true,opacity:0.72,depthWrite:false}),
    new SpriteMaterial({map:texture('205,153,177'),color:0xe0b5c9,transparent:true,opacity:0.62,depthWrite:false}),
  ];

  const group=new Group();
  scene.add(group);

  function add(x,y,z,w,h,layer) {
    const sprite=new Sprite(materials[layer]);
    sprite.position.set(x,y,z);
    sprite.scale.set(w*1.25,h*1.2,1);
    sprite.userData={x,y,z,phase:rand(0,tau),speed:rand(0.08,0.2),opacity:materials[layer].opacity};
    group.add(sprite);
  }

  // Foreground clouds.
  for(let i=0;i<12;i++){
    const side=i%2?1:-1;
    add(side*rand(7,13),rand(0.35,1.4),rand(-2,9),rand(5,11),rand(1.2,2.4),i%3);
  }

  // Mist alongside the parkour route, covering its full elevation.
  for(let i=0;i<32;i++){
    const side=i%2?1:-1;
    add(side*rand(6.5,12.5),rand(1.2,9.5),rand(-34,6),rand(5,9),rand(1.2,2.8),i%3);
  }

  // Large overlapping mist banks between the mountain ranges.
  for(let i=0;i<23;i++){
    add(rand(-23,23),rand(3,12),rand(-68,-35),rand(11,22),rand(2.5,5.5),i%3);
  }

  // A few higher wisps around the distant mountain peaks.
  for(let i=0;i<9;i++){
    add(rand(-27,27),rand(9,17),rand(-65,-42),rand(12,20),rand(2,4),i%3);
  }

  return group;
}

function addFestivalGroundDetails(add,scene) {
  const box=new BoxGeometry();
  const cylinder=new CylinderGeometry(1,1,1,12);
  const sphere=new SphereGeometry(1,12,10);
  const cone=new ConeGeometry(1,1,8);
  const torus=new TorusGeometry(1,0.035,8,40);
  const plane=new PlaneGeometry();

  const mat=(c,r=0.85,m=0)=>new MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const stone=mat(0x566075,0.92);
  const stoneLight=mat(0x818092,0.82);
  const darkStone=mat(0x303b51,0.95);
  const timber=mat(0x58383e,0.84);
  const red=mat(0x923d45,0.75);
  const lacquer=mat(0x71333e,0.65);
  const roof=mat(0x293e50,0.76);
  const roofLight=mat(0x405366,0.8);
  const jade=mat(0x345b50,0.64);
  const gold=new MeshStandardMaterial({color:0xd7ad76,metalness:0.52,roughness:0.44});
  const bronze=new MeshStandardMaterial({color:0x78634d,metalness:0.65,roughness:0.4});
  const paper=new MeshStandardMaterial({color:0xd97954,emissive:0xb84e2b,emissiveIntensity:1.35,roughness:0.78});
  const paperGold=new MeshStandardMaterial({color:0xe8ad69,emissive:0xd18a45,emissiveIntensity:1.1,roughness:0.72});
  const core=new MeshBasicMaterial({color:0xffe0ac});
  const windowGlow=new MeshBasicMaterial({color:0xffc57f});
  const waterMat=new MeshStandardMaterial({color:0x354b61,emissive:0x142c42,emissiveIntensity:0.34,metalness:0.48,roughness:0.2});
  const rippleMat=mat(0x91a3ae,0.2,0.55);

  // Shared soft amber halo for the new festival lights.
  const glowCanvas=document.createElement('canvas');
  glowCanvas.width=glowCanvas.height=128;
  const ctx=glowCanvas.getContext('2d');
  const gradient=ctx.createRadialGradient(64,64,1,64,64,64);
  gradient.addColorStop(0,'rgba(255,226,177,0.85)');
  gradient.addColorStop(0.16,'rgba(255,176,105,0.47)');
  gradient.addColorStop(0.42,'rgba(255,132,75,0.17)');
  gradient.addColorStop(1,'rgba(255,111,57,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const glowMap=new CanvasTexture(glowCanvas);
  const glowMat=new MeshBasicMaterial({map:glowMap,transparent:true,opacity:0.72,depthWrite:false,blending:AdditiveBlending,side:DoubleSide,toneMapped:false});

  // One reusable traditional lantern model.
  const lanternBody=new CylinderGeometry(0.19,0.19,0.38,12,1,true);
  const lanternCap=new CylinderGeometry(0.23,0.23,0.055,12);
  const lanternRib=new CylinderGeometry(0.009,0.009,0.39,5);
  const tassel=new CylinderGeometry(0.009,0.022,0.24,6);

  function lantern(x,y,z,s=1,material=paper) {
    add(lanternBody,material,x,y,z,0.90*s,0.90*s,0.90*s);
    add(lanternCap,gold,x,y+0.195*s,z,0.94*s,0.9*s,0.94*s);
    add(lanternCap,gold,x,y-0.195*s,z,0.94*s,0.9*s,0.94*s);
    add(cylinder,core,x,y,z,0.075*s,0.26*s,0.075*s);
    for(let j=0;j<8;j++){
      const a=j/8*tau;
      add(lanternRib,gold,x+Math.cos(a)*0.18*s,y,z+Math.sin(a)*0.18*s,0.7*s,0.9*s,0.7*s,0,0,0);
    }
    add(tassel,red,x,y-0.34*s,z,0.8*s,0.9*s,0.8*s);
    add(sphere,gold,x,y-0.49*s,z,0.035*s,0.045*s,0.035*s);
    add(plane,glowMat,x,y,z+0.055*s,1.25*s,1.45*s,1);
  }

  // Traditional Chinese upturned roof, reused on all buildings.
  function roofTier(x,y,z,w,d,s=1) {
    add(box,roof,x,y,z,w*s,0.15*s,d*s);
    for(const side of [-1,1]){
      add(box,roofLight,x+side*w*0.28*s,y+0.09*s,z,w*0.53*s,0.13*s,d*1.06*s,0,0,-side*0.17);
      add(box,roofLight,x,y+0.09*s,z+side*d*0.28*s,w*1.06*s,0.13*s,d*0.53*s,side*0.17);
      add(box,gold,x+side*w*0.48*s,y+0.16*s,z,w*0.055*s,0.045*s,d*0.55*s,0,0,-side*0.17);
      add(box,gold,x,y+0.16*s,z+side*d*0.48*s,w*0.55*s,0.045*s,d*0.055*s,side*0.17);
      for(const end of [-1,1]){
        add(cone,gold,x+side*w*0.49*s,y+0.22*s,z+end*d*0.49*s,0.075*s,0.2*s,0.075*s,0,0,-side*0.5);
      }
    }
    add(cylinder,gold,x,y+0.16*s,z,0.045*s,w*0.85*s,0.045*s,0,0,Math.PI/2);
  }

  // Pillared pavilion, with two layers of tiled roof and hanging lanterns.
  function pavilion(x,z,s=1) {
    const y=terrainHeight(x,z),w=4.5*s,d=3.5*s;
    add(box,stone,x,y+0.12*s,z,w,0.24*s,d);
    add(box,stoneLight,x,y+0.25*s,z,w*0.91,0.08*s,d*0.91);

    for(const ix of [-1,1])for(const iz of [-1,1]){
      const px=x+ix*w*0.39,pz=z+iz*d*0.39;
      add(cylinder,timber,px,y+1.36*s,pz,0.105*s,2.22*s,0.105*s);
      add(box,gold,px,y+2.48*s,pz,0.27*s,0.055*s,0.27*s);
      add(box,timber,px,y+0.48*s,pz,0.34*s,0.11*s,0.34*s);
      lantern(px,y+2.05*s,pz,0.72*s);
    }

    add(box,timber,x,y+2.47*s,z,w,0.16*s,0.19*s);
    add(box,timber,x,y+2.47*s,z,d*0.9,0.16*s,0.19*s,0,Math.PI/2);

    // Open railing and a raised central offering table.
    for(const side of [-1,1]){
      add(box,red,x,y+0.72*s,z+side*d*0.37,w*0.76,0.11*s,0.09*s);
      for(let i=-2;i<=2;i++)add(cylinder,gold,x+i*w*0.15,y+0.52*s,z+side*d*0.37,0.022*s,0.32*s,0.022*s);
    }

    add(box,red,x,y+0.87*s,z,w*0.43,0.15*s,d*0.28);
    add(box,gold,x,y+0.96*s,z,w*0.45,0.035*s,d*0.30);

    roofTier(x,y+2.67*s,z,w*1.25,d*1.28,s);
    add(cylinder,gold,x,y+2.91*s,z,0.08*s,0.27*s,0.08*s);
    roofTier(x,y+3.17*s,z,w*0.78,d*0.81,s*0.84);
    add(cone,gold,x,y+3.43*s,z,0.12*s,0.3*s,0.12*s);
  }

  // Lotus pond and Red-Lacquered bridge
  const px=-12.5,pz=-19.5,py=terrainHeight(px,pz)+0.08;
  const pond=new SphereGeometry(1,48,28);
  add(pond,darkStone,px,py-0.12,pz,3.9,0.18,2.65);
  add(pond,waterMat,px,py-0.025,pz,3.57,0.065,2.35);
  add(torus,stoneLight,px,py+0.015,pz,3.62,2.42,1,Math.PI/2);
  add(torus,darkStone,px,py-0.045,pz,3.78,2.55,0.9,Math.PI/2);

  // Bridge crosses the water and connects the garden to the west pavilion.
  for(let i=0;i<12;i++){
    const x=px-2.8+i*0.51;
    const arch=Math.sin(i/11*Math.PI)*0.34;
    add(box,timber,x,py+0.30+arch,pz,0.49,0.17,0.94);
    add(box,gold,x,py+0.405+arch,pz,0.46,0.024,0.87);
  }

  for(const side of [-1,1]){
    for(let i=0;i<8;i++){
      const t=i/7,x=px-2.7+t*5.4;
      const y=py+0.55+Math.sin(t*Math.PI)*0.34;
      add(cylinder,red,x,y,pz+side*0.56,0.065,0.87,0.065);
      add(sphere,gold,x,y+0.48,pz+side*0.56,0.09,0.09,0.09);
      if(i>0){
        const previousX=x-5.4/7;
        const previousY=py+0.55+Math.sin((i-1)/7*Math.PI)*0.34+0.41;
        add(box,timber,(x+previousX)/2,(y+previousY)/2+0.18,pz+side*0.56,0.88,0.10,0.09,0,0,Math.atan2(y+0.41-previousY,x-previousX));
      }
    }
  }

  // Decorative bridge lanterns.
  for(const x of [px-2.45,px,px+2.45]){
    for(const side of [-1,1]){
      const z=pz+side*0.63;
      const y=terrainHeight(x,z);
      add(cylinder,timber,x,y+0.87,z,0.07,1.65,0.07);
      add(box,gold,x,y+1.68,z,0.48,0.07,0.07);
      lantern(x,y+1.91,z,0.57);
    }
  }

  // Lily pads, lotus flowers and tiny floating candle cups.
  const pad=new SphereGeometry(1,16,10);
  const padMat=mat(0x395e4b,0.82);
  const petal=new SphereGeometry(1,12,8);
  const pink=new MeshStandardMaterial({color:0xe5a8a0,emissive:0x572d40,emissiveIntensity:0.18,roughness:0.65});
  const cream=mat(0xe5cda4,0.65);

  for(let i=0;i<13;i++){
    const a=rand(0,tau),r=rand(0.45,2.75);
    const x=px+Math.cos(a)*r,z=pz+Math.sin(a)*r*0.65;
    add(pad,padMat,x,py+0.035,z,rand(0.24,0.43),0.025,rand(0.20,0.35),0,rand(0,tau));
  }

  for(let i=0;i<6;i++){
    const a=i/6*tau+0.3,x=px+Math.cos(a)*rand(0.8,2.1),z=pz+Math.sin(a)*rand(0.55,1.45);
    const material=i%2?pink:cream;
    for(let j=0;j<9;j++){
      const q=j/9*tau;
      add(petal,material,x+Math.cos(q)*0.11,py+0.10,z+Math.sin(q)*0.11,0.07,0.045,0.16,0,q);
    }
    add(sphere,paperGold,x,py+0.13,z,0.07,0.035,0.07);
  }

  for(let i=0;i<4;i++){
    const a=i/4*tau,x=px+Math.cos(a)*2.25,z=pz+Math.sin(a)*1.42;
    add(cylinder,bronze,x,py+0.07,z,0.14,0.075,0.14);
    add(sphere,core,x,py+0.16,z,0.045,0.06,0.045);
    add(plane,glowMat,x,py+0.16,z+0.04,0.65,0.65,1);
  }


  // Waterside tea pavilon and moon gate
  pavilion(-19,-20,0.87);

  // Moon gate leads from the pavilion towards the garden bridge.
  const gx=-17.1,gz=-26.4,gy=terrainHeight(gx,gz);
  add(box,stone,gx-1.4,gy+1.0,gz,0.32,2.0,0.42);
  add(box,stone,gx+1.4,gy+1.0,gz,0.32,2.0,0.42);
  add(torus,stoneLight,gx,gy+1.68,gz,1.42,1.42,0.18);
  add(torus,gold,gx,gy+1.68,gz+0.1,1.31,1.31,0.055);
  for(const side of [-1,1]){
    add(cylinder,timber,gx+side*1.43,gy+0.16,gz,0.15,0.32,0.15);
    add(sphere,gold,gx+side*1.43,gy+2.08,gz,0.10,0.10,0.10);
  }


  // Ceremonial pavilon and incense altar
  pavilion(12.6,-22,0.95);

  const ax=12.6,az=-22,ay=terrainHeight(ax,az);

  add(box,darkStone,ax,ay+0.16,az+2.25,3.3,0.28,1.25);
  add(box,red,ax,ay+0.83,az+2.25,2.8,0.16,0.95);
  add(box,gold,ax,ay+0.94,az+2.25,2.7,0.045,0.86);

  // Three incense burners.
  for(let i=-1;i<=1;i++){
    const x=ax+i*0.75,z=az+2.15;
    add(cylinder,bronze,x,ay+1.15,z,0.24,0.24,0.24);
    add(cylinder,gold,x,ay+1.28,z,0.3,0.055,0.3);
    add(sphere,bronze,x,ay+1.39,z,0.16,0.08,0.16);
    for(let j=0;j<3;j++)add(cylinder,gold,x+(j-1)*0.07,ay+1.62,z,0.012,0.44,0.012,0.08*j,0,0);
    lantern(x,ay+2.25,z,0.42,paperGold);
  }

  // Carved screen behind the offering table.
  add(box,jade,ax,ay+1.76,az-0.42,3.35,2.7,0.15);
  add(box,timber,ax,ay+3.13,az-0.42,3.65,0.16,0.25);
  add(box,timber,ax,ay+0.39,az-0.42,3.65,0.15,0.25);
  add(torus,gold,ax,ay+1.83,az-0.31,0.85,0.85,0.05);
  for(let i=-2;i<=2;i++)add(box,gold,ax+i*0.32,ay+1.83,az-0.31,0.035,1.42,0.035);
  for(let i=-2;i<=2;i++)add(box,gold,ax,ay+1.83+i*0.32,az-0.31,1.42,0.035,0.035);


  // Pagodas
  function pagoda(x,z,s=1) {
    const y=terrainHeight(x,z);
    add(box,stone,x,y+0.13*s,z,2.8*s,0.26*s,2.8*s);
    add(box,stoneLight,x,y+0.3*s,z,2.55*s,0.1*s,2.55*s);

    for(let tier=0;tier<3;tier++){
      const fy=y+(0.55+tier*1.05)*s;
      const w=(2.0-tier*0.32)*s;
      add(box,timber,x,fy,z,w*0.77,0.92*s,w*0.77);
      for(const side of [-1,1]){
        add(box,paperGold,x+side*w*0.24,fy,z,w*0.045,0.53*s,w*0.29);
        add(box,paperGold,x,fy,z+side*w*0.24,w*0.29,0.53*s,w*0.045);
      }
      roofTier(x,fy+0.52*s,z,w*1.52,w*1.52,s);
      for(const side of [-1,1]){
        lantern(x+side*w*0.36,fy+0.15*s,z+side*w*0.36,0.36*s);
      }
    }

    add(cylinder,gold,x,y+3.8*s,z,0.09*s,0.32*s,0.09*s);
    add(cone,gold,x,y+4.05*s,z,0.15*s,0.38*s,0.15*s);
    add(sphere,core,x,y+4.26*s,z,0.06*s,0.07*s,0.06*s);
    lantern(x,y+3.2*s,z,0.52*s,paperGold);
  }

  pagoda(-18,-36,0.92);
  pagoda(18,-36,0.95);


  // Market stalls
  const signCanvas=document.createElement('canvas');
  signCanvas.width=256;signCanvas.height=128;
  const signCtx=signCanvas.getContext('2d');
  signCtx.fillStyle='#71313d';signCtx.fillRect(0,0,256,128);
  signCtx.strokeStyle='#e3b876';signCtx.lineWidth=9;signCtx.strokeRect(8,8,240,112);
  signCtx.textAlign='center';signCtx.textBaseline='middle';
  signCtx.fillStyle='#f2d4a2';signCtx.font='bold 76px serif';

  function marketStall(x,z,s,char) {
    const y=terrainHeight(x,z);
    add(box,stone,x,y+0.1*s,z,2.8*s,0.2*s,1.8*s);
    add(box,timber,x,y+0.91*s,z,2.45*s,0.18*s,1.3*s);

    for(const side of [-1,1]){
      add(cylinder,timber,x+side*1.13*s,y+1.05*s,z-0.56*s,0.075*s,2.0*s,0.075*s);
      add(cylinder,timber,x+side*1.13*s,y+1.05*s,z+0.56*s,0.075*s,2.0*s,0.075*s);
      lantern(x+side*1.15*s,y+1.94*s,z,0.55*s);
    }

    add(box,red,x,y+1.96*s,z,3.1*s,0.16*s,2.15*s);
    roofTier(x,y+2.10*s,z,3.3*s,2.35*s,s);
    add(box,timber,x,y+1.75*s,z-0.78*s,1.5*s,0.56*s,0.08*s);

    signCtx.clearRect(0,0,256,128);
    signCtx.fillStyle='#71313d';signCtx.fillRect(0,0,256,128);
    signCtx.strokeStyle='#e3b876';signCtx.lineWidth=9;signCtx.strokeRect(8,8,240,112);
    signCtx.fillStyle='#f2d4a2';signCtx.fillText(char,128,66);
    const map=new CanvasTexture(signCanvas);
    map.colorSpace=SRGBColorSpace;
    const signMat=new MeshStandardMaterial({map,roughness:0.8});
    add(box,signMat,x,y+2.28*s,z-1.09*s,1.0*s,0.54*s,0.045*s);
  }

  marketStall(-14.5,-10.2,0.82,'茶');
  marketStall(15.2,-12.0,0.86,'灯');


  // Festival drum platform
  const dx=18,dz=-15,dy=terrainHeight(dx,dz);
  add(box,stone,dx,dy+0.16,dz,2.5,0.32,2.3);
  add(box,red,dx,dy+0.35,dz,2.3,0.08,2.1);

  add(cylinder,red,dx,dy+1.0,dz,0.72,1.05,0.72,Math.PI/2);
  add(cylinder,gold,dx,dy+1.0,dz,0.76,0.055,0.76,Math.PI/2);
  add(cylinder,stoneLight,dx,dy+1.54,dz,0.72,0.07,0.72,Math.PI/2);

  for(let i=0;i<12;i++){
    const a=i/12*tau;
    add(sphere,gold,dx+Math.cos(a)*0.73,dy+1.0,dz+Math.sin(a)*0.73,0.055,0.055,0.055);
  }

  for(const side of [-1,1]){
    lantern(dx+side*0.92,dy+2.15,dz,0.62);
    add(cylinder,timber,dx+side*0.92,dy+1.15,dz,0.11,1.4,0.11);
  }


  // Latern-lit hillside settlement
  function hillsideHouse(x,z,s=0.6) {
    const y=terrainHeight(x,z);
    add(box,darkStone,x,y+0.12*s,z,3.2*s,0.24*s,2.35*s);
    add(box,red,x,y+0.96*s,z,2.65*s,1.55*s,1.75*s);

    for(const side of [-1,1]){
      add(box,timber,x+side*0.86*s,y+0.97*s,z+0.89*s,0.17*s,1.6*s,0.12*s);
      add(box,timber,x+side*0.86*s,y+0.97*s,z-0.89*s,0.17*s,1.6*s,0.12*s);
    }

    add(box,windowGlow,x,y+1.02*s,z+0.90*s,0.84*s,0.76*s,0.035*s);
    add(box,timber,x,y+1.02*s,z+0.94*s,0.95*s,0.09*s,0.05*s);
    add(box,timber,x,y+0.98*s,z+0.95*s,0.07*s,0.82*s,0.05*s);
    roofTier(x,y+1.83*s,z,3.9*s,3.0*s,s);
    lantern(x,y+1.45*s,z+1.1*s,0.55*s);
    lantern(x+1.05*s,y+1.5*s,z,0.40*s);
  }

  hillsideHouse(-21,-41,0.54);
  hillsideHouse(-10.5,-43,0.48);
  hillsideHouse(10.5,-43,0.50);
  hillsideHouse(21,-41,0.55);


  // Distant latern paths and small hilltop shrines
  for(const side of [-1,1]){
    for(let row=0;row<3;row++){
      for(let i=0;i<14;i++){
        const t=i/13;
        const x=side*(13+row*3.1+Math.sin(t*5+row)*0.65);
        const z=-42+t*12-row*1.7;
        const y=terrainHeight(x,z)+rand(1.3,3.0);
        const s=rand(0.095,0.17);

        // Small warm lamps attached to the hillside settlement.
        add(sphere,core,x,y,z,s,s*1.3,s);
        add(plane,glowMat,x,y,z+0.035,s*6.5,s*7.2,1);
      }
    }
  }

  // Additional landmark lights at key festival structures.
  const pondLight=new PointLight(0xffbb80,12,15,2);
  pondLight.position.set(px,py+3.1,pz);
  scene.add(pondLight);

  const westLight=new PointLight(0xffa969,9,12,2);
  westLight.position.set(-19,terrainHeight(-19,-20)+3,-20);
  scene.add(westLight);

  const templeLight=new PointLight(0xffbe83,13,16,2);
  templeLight.position.set(12.6,terrainHeight(12.6,-22)+4,-22);
  scene.add(templeLight);

  const pagodaLight=new PointLight(0xffbd80,8,12,2);
  pagodaLight.position.set(18,terrainHeight(18,-36)+3.5,-36);
  scene.add(pagodaLight);
}


export function dressFestival(scene) {
  scene.background=nightSky();
  scene.fog=new FogExp2(0x58506a,0.012);
  scene.add(makeTerrain());
  scene.add(
    makeRidge(150,24,-66,-13,25,0x626183,0.4),
    makeRidge(190,28,-87,-17,31,0x4c5275,1.7),
    makeRidge(230,30,-111,-21,38,0x374663,2.8)
  );

  const batch=batches(scene),add=batch.add;
  const box=new BoxGeometry(), smallLantern=new SphereGeometry(0.22,10,8);
  const rock=makeRockGeometry(), smallRock=new IcosahedronGeometry(1,2);
  const trunk=new CylinderGeometry(0.075,0.14,1,10);
  const branch=new CylinderGeometry(0.018,0.052,1,7);
  const pine=makeNeedleCone();
  const stoneMat=new MeshStandardMaterial({color:0x687183,roughness:0.34,metalness:0.18,emissive:0x101a2a,emissiveIntensity:0.12});
  const rockMat=matte(0x485568,0.94), rockLight=matte(0x667080,0.88), moss=matte(0x263f30,1);
  const bark=matte(0x564348,0.96), pineDark=matte(0x1e4140,0.96), pineMid=matte(0x2c5a4d,0.94), pineLight=matte(0x406956,0.94);
  // Detailed rocky shelves around the valley edges.
  for(let i=0;i<126;i++){
    const side=i%2?1:-1,x=side*rand(7.4,20.7),z=rand(-40,14),s=rand(0.38,1.65);
    if(reservedGroundArea(x,z))continue;
    if(Math.abs(x)<9&&z>-34&&z<8)continue;
    const y=terrainHeight(x,z);
    add(rock,rockMat,x,y+s*0.24,z,s*rand(0.8,1.35),s*rand(0.42,0.78),s*rand(0.8,1.45),rand(-0.2,0.2),rand(0,tau),rand(-0.18,0.18));
    if(i%2===0)add(smallRock,rockLight,x+side*s*0.54,y+s*0.12,z-s*0.24,s*0.58,s*0.31,s*0.65,rand(-0.2,0.2),rand(0,tau));
    if(i%4===0)add(rock,moss,x-side*s*0.32,y+s*0.35,z+s*0.25,s*0.5,s*0.18,s*0.42,0,rand(0,tau));
  }

  // Tall, layered pines with visible trunks and radiating branches.
  for(let i=0;i<108;i++){
    const side=i%2?1:-1,x=side*rand(7.5,19.5),z=rand(-42,13);
    if(reservedGroundArea(x,z))continue;
    if(Math.abs(x)<8.6&&z>-35&&z<8)continue;
    const base=terrainHeight(x,z),h=rand(2.4,5.8),r=h*rand(0.19,0.26),turn=rand(0,tau);
    add(trunk,bark,x,base+h*0.31,z,0.12,h*0.66,0.12,0,0,rand(-0.035,0.035));
    for(let tier=0;tier<5;tier++){
      const t=tier/5,cy=base+h*(0.40+t*0.115),rr=r*(1-t*0.72),hh=h*(0.43-t*0.035);
      add(pine,tier%2?pineMid:pineDark,x,cy,z,rr,hh,rr,0,turn+t*0.22);
      if(tier===1||tier===3)add(pine,pineLight,x,cy+h*0.08,z,rr*0.74,hh*0.72,rr*0.74,0,turn+0.4);
      for(let k=0;k<6;k++){
        const a=turn+k/6*tau+tier*0.29,len=rr*1.12,by=base+h*(0.29+tier*0.12);
        add(branch,bark,x+Math.cos(a)*len*0.42,by,z+Math.sin(a)*len*0.42,0.045,len,0.045,-Math.sin(a)*0.9,0,Math.cos(a)*0.9);
      }
    }
  }

  // Broken rock spires and scree at the foot of the distant ridges.
  for(let i=0;i<52;i++){
    const x=rand(-62,62),z=rand(-58,-42),s=rand(1.2,3.8);
    const y=-13+rand(-1.5,1.8);
    add(rock,i%3?rockMat:rockLight,x,y+s*0.22,z,s*rand(0.8,1.4),s*rand(0.8,1.8),s*rand(0.65,1.15),rand(-0.25,0.25),rand(0,tau),rand(-0.25,0.25));
    if(i%2===0)add(smallRock,moss,x+rand(-1.2,1.2),y+s*0.1,z+rand(-0.8,0.8),s*0.55,s*0.22,s*0.5,0,rand(0,tau));
  }

  // Irregular, beveled stepping stones winding toward the course.
  const stoneGeometries=Array.from({length:6},(_,i)=>makeStepStone(i+1));
  for(let i=0;i<11;i++){
    const z=7.8-i*0.59,x=Math.sin(i*0.43)*0.48+rand(-0.16,0.16),geo=stoneGeometries[i%stoneGeometries.length];
    const y=terrainHeight(x,z)+0.015,w=rand(0.48,0.72),d=rand(0.38,0.62);
    add(geo,stoneMat,x,y,z,w,rand(0.75,1.05),d,0,rand(-0.2,0.2),0);
    if(i%3===0)add(smallRock,rockLight,x+rand(-0.65,0.65),y+0.025,z+rand(-0.4,0.4),0.12,0.07,0.14,0,rand(0,tau));
  }

  const animateStream = addCandleStream(scene, add, terrainHeight);

  // Small luminous crystals in the rocks, with a restrained cool glow.
  const crystalGeo=new ConeGeometry(0.19,0.82,7,3);
  const crystal=new MeshStandardMaterial({color:0x8daab2,emissive:0x286f82,emissiveIntensity:1.05,metalness:0.42,roughness:0.24});
  const crystalTip=new MeshStandardMaterial({color:0xb2c6cd,emissive:0x5592a0,emissiveIntensity:1.5,metalness:0.28,roughness:0.2});
  const crystalGlowMap=makeSoftGlowMap();
  const crystalGlowMaterial=new SpriteMaterial({map:crystalGlowMap,color:0x8fc7d0,transparent:true,opacity:0.42,depthWrite:false,blending:AdditiveBlending});
  for(let i=0;i<24;i++){
    const side=i%2?1:-1,x=side*rand(8.5,17),z=rand(-38,12),y=terrainHeight(x,z);
    for(let j=0;j<3;j++){
      const px=x+rand(-0.3,0.3),pz=z+rand(-0.3,0.3),h=rand(0.45,1.05);
      add(crystalGeo,j===0?crystalTip:crystal,px,y+h*0.45,pz,rand(0.5,0.9),h,rand(0.5,0.9),rand(-0.12,0.12),rand(0,tau),rand(-0.12,0.12));
    }
    if(i%3===0){
      const glow=new Sprite(crystalGlowMaterial);
      glow.position.set(x,y+0.65,z);glow.scale.set(1.9,1.9,1);scene.add(glow);
    }
  }

  // Tiny warm flowers and cool bioluminescent ground blooms.
  const flowerGeo=new SphereGeometry(0.055,10,8), flowerStem=new CylinderGeometry(0.009,0.013,0.17,5);
  const flowerWarm=new MeshStandardMaterial({color:0xf0bd91,emissive:0x8d482c,emissiveIntensity:0.85,roughness:0.65});
  const flowerCool=new MeshStandardMaterial({color:0x9ab7bd,emissive:0x397b83,emissiveIntensity:0.8,roughness:0.6});
  const stems=matte(0x526b4d,1);
  for(let i=0;i<220;i++){
    const x=rand(-19,19),z=rand(-42,14);
    if(Math.abs(x)<5.8&&z>-34&&z<8)continue;
    const y=terrainHeight(x,z),s=rand(0.65,1.35),m=i%4===0?flowerCool:flowerWarm;
    add(flowerStem,stems,x,y+0.075*s,z,0.75,0.15*s,0.75,0,rand(0,tau));
    add(flowerGeo,m,x,y+0.17*s,z,0.75*s,0.75*s,0.75*s);
  }

  // Fallen plum petals collect in irregular drifts along the processional path.
  const petal = new SphereGeometry(1, 5, 3);
  const petals = [matte(0xc87580), matte(0xad5869), matte(0xe2a48f)];
  for (let i = 0; i < 72; i++) {
    const cx = (i%3 ? 1 : -1)*rand(1.8,8.8), cz = rand(-32,10);
    for (let j = 0; j < 22; j++) {
      const x = cx+rand(-1,1)*rand(.2,1.5), z = cz+rand(-.6,.6);
      add(petal, petals[j%3], x,terrainHeight(x,z)+.018,z,.048,.013,.085,0,rand(0,tau));
    }
  }

  // Gate, poles and decorative festival structures from the original scene.
  const pole=new CylinderGeometry(0.48,0.56,1,10);
  const wood=matte(0xa34743),roof=matte(0x314958),brass=matte(0xe3ad70),flag=matte(0xbe4349);
  const cordMat=matte(0x513d47);
  function eaves(x,y,z,w,d){
    for(let i=-5;i<=5;i++){
      const t=i/5,lift=t**4*0.42;
      for(const side of [-1,1]){
        add(box,roof,x+t*w/2,y+lift,z+side*d*0.23,w/10+0.025,0.14,d*0.58,side*0.32,0,t**3*0.2);
        add(box,brass,x+t*w/2,y-0.13+lift,z+side*d*0.49,w/10+0.025,0.055,0.07,0,0,t**3*0.2);
      }
    }
    add(box,brass,x,y+0.18,z,w,0.09,0.1);
  }
  function gate(x,z,w,pavilion){
    const height=pavilion?3.7:3.1,depth=pavilion?3.3:1.15;
    for(const side of [-1,1])for(const end of pavilion?[-1,1]:[0]){
      const px=x+side*w*0.39,pz=z+end*depth*0.36;
      add(pole,wood,px,height/2,pz,0.26,height,0.26);
      add(box,rockMat,px,0.14,pz,0.5,0.28,0.5);
      add(box,brass,px,height-0.42,pz,0.45,0.11,0.44);
    }
    add(box,wood,x,height-0.18,z,w,0.27,0.45);eaves(x,height+0.13,z,w,depth);
    if(pavilion){add(box,rockMat,x,0.14,z,w,0.28,depth);eaves(x,height+0.85,z,w*0.67,depth*0.68);}
    else for(const s of [-1,1]){add(box,flag,x+s*w*0.27,height-0.8,z,0.36,1.18,0.04);add(box,brass,x+s*w*0.27,height-1.23,z+0.028,0.32,0.05,0.02);}
  }
  gate(-6.2,-8,4.4,false);gate(7,-15,5.7,true);

  const red=matte(0xfd643c);red.emissive.setHex(0xe94f21);red.emissiveIntensity=0.7;
  for(const side of [-1,1]){
    const x=side*4.8;
    for(let span=0;span<3;span++){
      const z=3-span*6;
      add(pole,wood,x,1.95,z,0.13,3.9,0.13);
      if(span===2)add(pole,wood,x,1.95,z-6,0.13,3.9,0.13);
      for(let j=0;j<8;j++){
        const t=j/8,u=(j+1)/8,y=3.85-2.7*t*(1-t),yy=3.85-2.7*u*(1-u);
        add(box,cordMat,x,(y+yy)/2,z-3*(t+u),0.022,0.022,Math.hypot(0.75,yy-y),Math.atan2(yy-y,0.75));
        if(j%2===0)continue;
        const pz=z-6*t;add(smallLantern,red,x,y-0.22,pz,1,0.9,1);
        for(const h of [-0.12,0,0.12])add(pole,brass,x,y-0.22+h,pz,h?0.37:0.45,0.016,h?0.37:0.45);
        add(pole,brass,x,y-0.48,pz,0.035,0.17,0.035);
      }
    }
  }

  addFestivalGroundDetails(add,scene);
  batch.finish();

  // A few real lights provide nearby bounce; most glow remains emissive.
  const warmPool=new PointLight(0xffb77b,9,13,2);warmPool.position.set(-6.2,2.1,-8);scene.add(warmPool);
  const coolPool=new PointLight(0x83b8d1,4,9,2);coolPool.position.set(9,1.8,-20);scene.add(coolPool);
  const animateFireflies=makeFireflies(scene),mist=makeMistSprites(scene);

  // Original background lantern scatter, geometry, materials and drift.
  const drift=new Group();scene.add(drift);
  const lights=batches(drift);
  const ball=new SphereGeometry(1,12,8),ember=new MeshBasicMaterial({color:0xff9452}),flame=new MeshBasicMaterial({color:0xffdfa0});
  const paper=new CylinderGeometry(0.46,0.32,1,8);
  const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=64;
  const ctx=haloCanvas.getContext('2d'),g=ctx.createRadialGradient(32,32,1,32,32,32);
  g.addColorStop(0,'#ffd28fbd');g.addColorStop(0.3,'#ffa85a65');g.addColorStop(1,'#fc873000');
  ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  const halo=new MeshBasicMaterial({map:new CanvasTexture(haloCanvas),transparent:true,depthWrite:false,side:DoubleSide});
  const plane=new PlaneGeometry();
  for(let i=0;i<490;i++){
    const a=rand(0,tau),r=rand(13,57),x=r*Math.cos(a),z=r*Math.sin(a)-7;
    const y=rand(4.5,33)+3*Math.sin(a*3),s=rand(0.12,0.53);
    if(Math.abs(x)<12&&z>-35&&z<13)continue;
    lights.add(paper,ember,x,y,z,s,s*1.27,s);
    lights.add(ball,flame,x,y-s*0.46,z,s*0.32,s*0.16,s*0.32);
    lights.add(plane,halo,x,y,z,s*4.9,s*4.9,1,0,Math.PI/2-a);
  }
  lights.finish();

  return elapsed=>{
    const t=Number.isFinite(elapsed)?elapsed:0;
    animateStream(t);
    drift.position.y=Math.sin(t*0.18)*0.30;
    drift.rotation.y=Math.sin(t*0.057)*0.009;
    animateFireflies(t);
    warmPool.intensity=8.5+Math.sin(t*0.7)*0.5;
    mist.children.forEach(sprite=>{
      const p=sprite.userData;
      sprite.position.x=p.x+Math.sin(t*p.speed+p.phase)*0.38;
      sprite.position.y=p.y+Math.sin(t*p.speed*0.7+p.phase)*0.13;
      sprite.position.z=p.z+Math.cos(t*p.speed*0.6+p.phase)*0.28;
      sprite.material.opacity=p.opacity*(0.88+0.12*Math.sin(t*0.4+p.phase));
    });
  };
}
