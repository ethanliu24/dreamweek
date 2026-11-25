// The garden is planted once. Repeated shapes share one draw per batch.
import {
  BoxGeometry, BufferGeometry, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute,
  IcosahedronGeometry, InstancedMesh, MathUtils, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, ShaderMaterial, Vector3, Object3D, Points, PointsMaterial,
  SphereGeometry,
} from 'three';

export function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function batch(parent, geometry, capacity, options = {}) {
  const mesh = new InstancedMesh(geometry, new MeshStandardMaterial({ roughness: 0.86, ...options }), capacity);
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.count = 0;
  parent.add(mesh);
  const pose = new Object3D();
  const tint = new Color();
  return (x, y, z, sx, sy, sz, color, rx = 0, ry = 0, rz = 0) => {
    pose.position.set(x, y, z);
    pose.scale.set(sx, sy, sz);
    pose.rotation.set(rx, ry, rz);
    pose.updateMatrix();
    mesh.setMatrixAt(mesh.count, pose.matrix);
    mesh.setColorAt(mesh.count++, tint.set(color));
  };
}

export function dressCottage(cottage) {
  const random = seededRandom(428);
  const box = batch(cottage, new BoxGeometry(1, 1, 1), 300);
  const oval = batch(cottage, new SphereGeometry(1, 10, 7), 180);
  const slate = [0x305a81, 0x3a7193, 0x476f97, 0x537fa4, 0x376488];
  // Individual lapped slates follow the pitch of the swept gable.
  for (const side of [-1, 1]) {
    for (let row = 0; row < 6; row++) {
      const x = 0.15 + row * 0.39;
      const y = 3.73 - 0.79 * x + 0.026 * x * x;
      for (let tile = 0; tile < 10; tile++) {
        const z = -1.56 + tile * 0.345 + (row % 2) * 0.07;
        box(side * x, y + random() * 0.022, z, 0.56, 0.1, 0.333,
          slate[Math.floor(random() * slate.length)], 0, 0, -side * 0.62);
      }
    }
    box(side * 1.08, 2.89, 1.705, 2.67, 0.12, 0.14, 0xabcac6, 0, 0, -side * 0.61);
    box(side * 1.91, 1.09, 1.412, 0.13, 2.12, 0.11, 0x405e75);
    box(side * 1.31, 0.86, 1.56, 0.97, 0.17, 0.28, 0x9c6956);
    for (const offset of [-0.51, 0.51]) {
      const shutter = side * 1.28 + offset;
      for (let slat = 0; slat < 5; slat++) {
        box(shutter, 1.03 + slat * 0.14, 1.47, 0.18, 0.115, 0.065, 0x476983, -0.1);
      }
    }
    for (let i = 0; i < 18; i++) {
      const px = side * 1.31 + (random() - 0.5) * 0.87;
      oval(px, 0.98, 1.6, 0.11, 0.1, 0.1, 0x418574);
      oval(px, 1.05 + random() * 0.05, 1.63, 0.051, 0.047, 0.048, i % 3 ? 0xe8a6b8 : 0xffd591);
    }
  }
  // Individual foundation stones and the climbing vine give the facade a human scale.
  for (let i = 0; i < 18; i++) {
    const x = -1.93 + i * 0.225;
    if (Math.abs(x) > 0.52) oval(x, 0.13, 1.40, 0.15, 0.12 + random() * 0.06, 0.12, 0x8a9797);
  }
  for (let i = 0; i < 62; i++) {
    const t = i / 61;
    const x = -1.9 + 0.17 * Math.sin(t * 8) + 1.35 * t ** 4;
    oval(x + 0.06 * Math.sin(i * 2), 0.25 + t * 1.83, 1.53,
      0.068, 0.097, 0.026, i % 3 ? 0x659579 : 0x86a77e, 0, 0, Math.sin(i) * 0.8);
  }
  for (let i = 0; i < 9; i++) {
    box(0, 3.72, -1.54 + i * 0.38, 0.21, 0.15, 0.4, 0x6496a9);
  }
  // A lit round attic window inset into the blue gable.
  oval(0, 2.58, 1.674, 0.32, 0.32, 0.065, 0xb6d0c4);
  oval(0, 2.58, 1.732, 0.242, 0.242, 0.035, 0xffc368);
  box(0, 2.58, 1.768, 0.037, 0.48, 0.022, 0x916f57);
  box(0, 2.58, 1.768, 0.48, 0.037, 0.022, 0x916f57);
  for (let i = -2; i <= 2; i++) {
    const x = i * 0.14;
    box(x, 0.68, 1.488, 0.008, 1.18 - Math.abs(x) * 0.65, 0.018, 0x543b3d);
  }
  oval(0.26, 0.75, 1.515, 0.052, 0.052, 0.065, 0xe8ba64);
  box(-1.03, 3.51, -0.75, 0.55, 0.13, 0.55, 0x9e8190);
}

function plantMeadow(scene, floor, outline, random) {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([
    -0.5,0,0, 0.5,0,0, -0.32,0.55,0.08, 0.32,0.55,0.08, 0,1,0.22,
  ], 3));
  geometry.setIndex([0,1,2, 2,1,3, 2,3,4]);
  const time = { value: 0 };
  const walker = { value: new Vector3() };
  const grass = new InstancedMesh(geometry, new ShaderMaterial({
    uniforms: { time, walker }, side: DoubleSide,
    vertexShader: `
      uniform float time;
      uniform vec3 walker;
      varying vec3 pigment;
      void main() {
        vec3 root = instanceMatrix[3].xyz;
        vec3 p = (instanceMatrix * vec4(position,1.0)).xyz;
        float tip = position.y * position.y;
        float breeze = 0.6 * sin(root.x * 1.2 + root.z * 0.66 + time * 1.55)
                     + 0.4 * sin(root.z * 2.1 - time * 1.14);
        p.xz += vec2(0.12,0.052) * (0.55 + breeze) * tip;
        vec2 away = root.xz - walker.xz;
        float distanceToSpirit = length(away);
        float brush = (1.0 - smoothstep(0.0,0.72,distanceToSpirit))
                    * (1.0 - smoothstep(0.42,1.0,abs(walker.y-root.y)));
        p.xz += away / max(distanceToSpirit,0.01) * brush * tip * 0.19;
        p.y -= brush * tip * 0.1;
        vec3 rootTint = mix(vec3(0.075,0.29,0.28),vec3(0.16,0.38,0.31),instanceColor.r);
        vec3 tipTint = mix(vec3(0.41,0.72,0.48),vec3(0.96,0.53,0.72),instanceColor.g);
        pigment = mix(rootTint,tipTint,smoothstep(0.03,1.0,position.y));
        pigment += vec3(0.10,0.075,0.03) * tip * (0.45 + 0.4*breeze);
        gl_Position = projectionMatrix * viewMatrix * vec4(p,1.0);
      }`,
    fragmentShader: `
      varying vec3 pigment;
      void main() {
        gl_FragColor = vec4(pigment,1.0);
        #include <colorspace_fragment>
      }`,
  }), 28000);
  const pose = new Object3D(), tint = new Color();
  grass.count = 0;
  for (let i = 0; i < 28000; i++) {
    const a = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * outline(a) * 0.996;
    const x = Math.cos(a) * r * 9, z = Math.sin(a) * r * 7;
    if ((x < -1.65 && x > -5.75 && z < -2.24 && z > -5.18) || Math.hypot(x + 0.15,z - 0.05) < 1.11) continue;
    const swale = 0.5 + 0.25 * Math.sin(x * 0.86 + z * 0.47) + 0.25 * Math.sin(z * 1.12 - x * 0.25);
    const trail = Math.min(Math.abs(x - (0.65 + (4.1-z)*0.54)), Math.abs(x - (0.65 - (4.1-z)*0.67)));
    const pathScale = 0.22 + 0.78 * MathUtils.smoothstep(trail,0.15,0.85);
    const height = (0.15 + random()*0.24 + swale*0.13) * pathScale;
    pose.position.set(x, floor(x,z)-0.01, z);
    pose.rotation.y = random()*6.28;
    pose.scale.set(0.026 + height*0.05,height,height*0.72);
    pose.updateMatrix();
    grass.setMatrixAt(grass.count,pose.matrix);
    tint.setRGB(random(), MathUtils.smoothstep(swale + random()*0.26,0.78,1.17),0);
    grass.setColorAt(grass.count++,tint);
  }
  scene.add(grass);
  return (elapsed, position) => { time.value = elapsed; walker.value.copy(position); };
}

function plantGlassTrees(scene, floor, random) {
  const glass = new MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.17, transmission: 0.78, thickness: 0.53,
    ior: 1.36, clearcoat: 0.8, iridescence: 0.64, envMapIntensity: 0.95,
  });
  const crowns = new InstancedMesh(new SphereGeometry(1,32,20), glass, 24);
  const bark = new MeshStandardMaterial({ color: 0xe8d5db, roughness: 0.68 });
  const pose = new Object3D(), tint = new Color();
  const palette = [0xa2dcca,0xadc9ec,0xe6b8d9,0xbab0ee];
  crowns.count = 0;
  for (const [x,z,height,lean] of [[5.8,-3.4,3.35,-0.48],[-6.35,-1.7,2.9,0.32],[0.45,-5.5,1.95,0.34]]) {
    const y = floor(x,z);
    // A continuous tapered trunk, with a bend that carries through the crown.
    const trunk = new CylinderGeometry(0.048,height*0.053,height,16,10);
    const vertices = trunk.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const t = vertices.getY(i)/height + 0.5;
      vertices.setX(i, vertices.getX(i) + lean*t*t);
      vertices.setZ(i, vertices.getZ(i) + Math.sin(t*Math.PI)*0.13);
    }
    trunk.computeVertexNormals();
    const wood = new Mesh(trunk,bark);
    wood.position.set(x,y+height/2,z);
    wood.castShadow = true;
    scene.add(wood);
    for (let i = 0; i < 8; i++) {
      const a = i*2.4, r = i ? 0.24*height*Math.sqrt(i/7) : 0;
      const w = height * (i ? 0.14+random()*0.095 : 0.29);
      pose.position.set(x+lean+Math.cos(a)*r,y+height-r*0.65+random()*0.13,z+Math.sin(a)*r);
      pose.scale.set(w*1.12,w*(0.88+random()*0.20),w);
      pose.updateMatrix();
      crowns.setMatrixAt(crowns.count,pose.matrix);
      crowns.setColorAt(crowns.count++,tint.set(palette[(i+Math.floor(height))%palette.length]));
    }
  }
  scene.add(crowns);
}

export function plantGarden(scene, floor, outline) {
  const random = seededRandom(8072);
  const leaf = batch(scene, new SphereGeometry(1, 12, 8), 300);
  const rock = batch(scene, new IcosahedronGeometry(1, 2), 90);
  const stem = batch(scene, new CylinderGeometry(0.6, 1, 1, 8), 100);
  const swayGrass = plantMeadow(scene, floor, outline, random);
  plantGlassTrees(scene, floor, random);
  const pick = palette => palette[Math.floor(random() * palette.length)];
  function branch(x, y, z, dx, dy, dz, radius, color) {
    const length = Math.hypot(dx, dy, dz);
    stem(x + dx / 2, y + dy / 2, z + dz / 2, radius, length, radius, color,
      Math.atan2(dz, dy), 0, -Math.asin(dx / length));
  }
  // Small groups of pale flowers rise through the long grass.
  for (const [cx,cz] of [[-4,-1.5],[2.4,-2.2],[5.2,0.8],[-4.3,2.1],[1.3,2.8],[-0.8,-3.8]]) {
    for (let i=0; i<11; i++) {
      const x=cx+(random()-0.5)*1.3, z=cz+(random()-0.5)*0.9;
      const y=floor(x,z), h=0.19+random()*0.2;
      stem(x,y+h/2,z,0.008,h,0.008,0x8cb39e);
      const color=pick([0xf6d6e6,0xf6e3bb,0xd9d8fa]);
      for (let k=0; k<4; k++) {
        const a=k*Math.PI/2+i;
        leaf(x+Math.cos(a)*0.025,y+h,z+Math.sin(a)*0.025,0.037,0.029,0.022,color,0,-a);
      }
    }
  }

  // Inlaid stepping stones mark the cottage approach; the hammock path stays soft.
  for (let i = 1; i <= 9; i++) {
    const t = i / 10;
    const x = 0.55 - 4.4 * t + Math.sin(t * Math.PI * 2) * 0.25;
    const z = 4.1 - 6.2 * t;
    rock(x, floor(x, z) + 0.014, z, 0.31 + random() * 0.1, 0.063, 0.23,
      pick([0xb3aa96, 0xc1bba7, 0x959d94]), 0, t * 3);
  }

  // Rim boulders and hanging rootlets follow the same silhouette as the safe edge.
  for (let i = 0; i < 74; i++) {
    const a = i * Math.PI * 2 / 74;
    const r = outline(a);
    const x = Math.cos(a) * 9 * r, z = Math.sin(a) * 7 * r;
    const depth = 0.7 + random() * 1.1;
    rock(x * 0.98, -depth - 0.25, z * 0.98, 0.55, depth, 0.63,
      pick([0x616582, 0x797590, 0x466c75]), 0.12, a);
    if (i % 3 === 0) branch(x, -0.1, z, -0.18 * Math.cos(a), -1 - random(), -0.19, 0.07, 0x765f69);
  }
  const motePositions = [];
  for (let i = 0; i < 64; i++) motePositions.push((random() - 0.5) * 17, random() ** 2 * 3 + 0.25, (random() - 0.5) * 13);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(motePositions, 3));
  const motes = new Points(geometry, new PointsMaterial({ color: 0xffe0a4, size: 0.024 }));
  scene.add(motes);
  return (elapsed, position) => {
    swayGrass(elapsed, position);
    motes.position.set(0.28 * Math.sin(elapsed * 0.22), 0.14 * Math.sin(elapsed * 0.67), 0.19 * Math.cos(elapsed * 0.28));
  };
}
