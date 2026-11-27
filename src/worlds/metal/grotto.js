import {
  BufferGeometry, CatmullRomCurve3, Color, CylinderGeometry, DodecahedronGeometry,
  EquirectangularReflectionMapping, Float32BufferAttribute, InstancedMesh, LatheGeometry, Mesh,
  MeshStandardMaterial, Object3D, PlaneGeometry, Points, ShaderMaterial, TorusGeometry,
  TubeGeometry, Vector2, Vector3, DataTexture, RGBAFormat, SRGBColorSpace,
} from 'three';

// Broad mint and honey reflections give polished minerals a readable edge in the dark.
function cavernReflections() {
  const w = 128, h = 64;
  const pixels = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h;
      const mint = Math.exp(-45 * (v - 0.66) ** 2) * (0.5 + 0.5 * Math.cos(u * 12)) ** 6;
      const amber = Math.exp(-95 * ((u - 0.72) ** 2 + (v - 0.4) ** 2));
      pixels.set([30 + 146 * mint + 75 * amber, 53 + 160 * mint + 34 * amber, 54 + 132 * mint, 255], 4 * (y * w + x));
    }
  }
  const tex = new DataTexture(pixels, w, h, RGBAFormat);
  tex.colorSpace = SRGBColorSpace;
  tex.mapping = EquirectangularReflectionMapping;
  tex.needsUpdate = true;
  return tex;
}

function mineralFloor(scene) {
  const geo = new PlaneGeometry(51, 51, 175, 175).rotateX(-Math.PI / 2);
  const positions = geo.attributes.position;
  const colors = [];
  const slate = new Color(0x283f42), jade = new Color(0x517c66), seam = new Color(0x8b9e78);
  const tint = new Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getZ(i);
    const fold = 0.53 * x + 0.23 * z + 2.2 * Math.sin(z * 0.38 + Math.sin(x * 0.4)) + Math.sin(x * 0.83 + z * 0.32);
    const band = 0.5 + 0.5 * Math.sin(fold);
    tint.copy(slate).lerp(jade, 0.7 * band).lerp(seam, 0.31 * Math.pow(band, 26));
    const grain = Math.sin(x*3.8 + Math.sin(z*4)) * Math.cos(z*2.8 + x*.9);
    const fissure = Math.abs(Math.sin(fold*2.1 + grain*.18));
    tint.multiplyScalar(.97 + .06*grain + .09*Math.cos(z*.81-x*1.18));
    tint.lerp(seam, .24*Math.max(0,1-fissure/.10));
    colors.push(tint.r, tint.g, tint.b);
    positions.setY(i, -0.033 + 0.023 * band);
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  scene.add(new Mesh(geo, new MeshStandardMaterial({ vertexColors: true, roughness: 0.52, metalness: 0.17 })));
}

function driftingDust(scene, rand) {
  const positions = [], phases = [];
  for (let i = 0; i < 96; i++) {
    const nearby = i < 48;
    positions.push((rand() - 0.5) * (nearby ? 13 : 27), rand() * (nearby ? 3.3 : 7), (rand() - 0.5) * (nearby ? 11 : 25));
    phases.push(rand() * 6.28);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.setAttribute('phase', new Float32BufferAttribute(phases, 1));
  const material = new ShaderMaterial({
    uniforms: { time: { value: 0 } }, transparent: true, depthWrite: false,
    vertexShader: `uniform float time; attribute float phase; varying float pulse;
      void main() {
        vec3 p = position + vec3(sin(time*.31+phase), sin(time*.48+phase), cos(time*.23+phase))*.31;
        vec4 mv = modelViewMatrix*vec4(p,1.);
        pulse = .28+.72*pow(.5+.5*sin(time*1.5+phase*4.),3.);
        gl_PointSize = clamp((27.+41.*pulse)/max(1.,-mv.z),2.,10.);
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `varying float pulse; void main() {
      vec2 d=abs(gl_PointCoord-.5)*2.;
      float star=max(0.,1.-sqrt(d.x)-sqrt(d.y)) + .32*exp(-7.*dot(d,d));
      gl_FragColor=vec4(mix(vec3(.50,.90,.72), vec3(1.,.87,.51),pulse),star*pulse);
      #include <colorspace_fragment>
    }`,
  });
  scene.add(new Points(geo, material));
  return time => { material.uniforms.time.value = time; };
}

export function buildGrotto(scene, forge) {
  scene.environment = cavernReflections();
  mineralFloor(scene);
  let seed = 19231;
  const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const batches = new Map();
  const dummy = new Object3D();
  const stone = new MeshStandardMaterial({ flatShading: true, roughness: 0.82 });
  const mineral = new MeshStandardMaterial({ flatShading: true, roughness: 0.23, metalness: 0.48 });
  const bronze = new MeshStandardMaterial({ metalness: 0.66, roughness: 0.32 });
  const luminous = new MeshStandardMaterial({ roughness: 0.28, emissive: 0x498e72, emissiveIntensity: 0.48 });
  const rock = new DodecahedronGeometry(1);
  const profile = (pairs, sides) => new LatheGeometry(pairs.map(([r,y]) => new Vector2(r,y)), sides);
  const shard = profile([[0,0],[0.7,0],[1,0.18],[0.78,0.78],[0,1]], 5);
  const disk = new CylinderGeometry(1, 0.94, 1, 12);
  const loop = new TorusGeometry(1, 0.031, 6, 64);
  const vial = profile([[0,0],[0.65,0],[0.94,0.12],[1,0.33],[0.82,0.53],[0.29,0.71],[0.25,0.89],[0.34,0.94],[0.33,1],[0.2,1]], 18);
  const moss = [0x294946,0x375957,0x466957,0x31564a,0x394854];
  const jewels = [0x39987f,0x76be94,0xb5d99a,0x369a9c,0x929cb3];
  const pick = list => list[Math.floor(rand() * list.length)];
  function place(geo, mat, color, x,y,z, sx,sy,sz, rx=0,ry=0,rz=0) {
    const key = geo.uuid + mat.uuid;
    if (!batches.has(key)) batches.set(key, { geo, mat, items: [] });
    dummy.position.set(x,y,z);
    dummy.scale.set(sx,sy,sz);
    dummy.rotation.set(rx,ry,rz);
    dummy.updateMatrix();
    batches.get(key).items.push([dummy.matrix.clone(), new Color(color)]);
  }
  function geode(x,y,z,size) {
    place(rock,stone,pick(moss),x,y,z,size,0.32*size,size*0.71,0,rand()*5);
    for (let j=0;j<8;j++) {
      const angle = j * 2.4, radius = Math.sqrt(j/8)*size*0.58;
      const h = size * (1.5-j*0.09)*(0.73+rand()*0.42);
      place(shard,mineral,pick(jewels),x+radius*Math.cos(angle),y+0.06,z+radius*Math.sin(angle),
        h*0.18,h,h*0.21,Math.sin(angle)*0.43,angle,-Math.cos(angle)*0.43);
    }
  }
  // Layered shelves and overhead teeth enclose the playable floor on every side.
  for (let i=0;i<96;i++) {
    const a = i * Math.PI/48, c = Math.cos(a), s = Math.sin(a);
    const radius = 20 / Math.max(Math.abs(c),Math.abs(s));
    const x = c*radius, z = s*radius;
    place(rock,stone,pick(moss),x,3,z,2+rand()*2,6+rand()*4,2+rand()*2,0,a,rand()*0.22);
    place(rock,stone,pick(moss),x*0.93,8.8,z*0.93,4,2.4,4.5,0,a);
    place(shard,stone,pick(moss),x*0.81,9.6,z*0.81,0.5+rand(),1+rand()*4,0.85,Math.PI,a);
    if(i%3===0) geode(x*0.89,0.15,z*0.89,0.8+rand()*1.3);
  }
  for (let i=0;i<38;i++) {
    const x=(rand()-.5)*37, z=(rand()-.5)*36;
    place(rock,stone,pick(moss),x,13+rand()*2,z,5+rand()*3,2.7,4+rand()*3,0,rand()*4);
    if(i%2===0) place(shard,stone,pick(moss),x,12,z,1.15,2+rand()*3,0.8,Math.PI,rand()*5);
  }
  // Exposed mineral strata soften the masonry shoulders around the sanctuary.
  for (const x of [-9,-8,-7.7,7.1,8.2,9.0]) {
    place(rock,stone,pick(moss),x,2.1,-6.75,1.35,3.7+rand()*2,1.6,0,rand());
    geode(x,0.19,-5.8,1+rand());
  }
  // Low mineral gardens leave the middle aisle and the puzzle camera clear.
  for(const [x,z,size] of [[-7,2,1.1],[7.5,3,1.15],[-8,8,1.55],[8.8,9,1.65],[-11,-1,1.8],[11,-2,1.35],[-6.6,-3.7,0.68],[5.95,-3.45,0.65],[-10,-11,1.5],[8,-12,1.8],[-5,12,.75]]) geode(x,0.1,z,size);

  // Split flagstones follow the gentle bend from the arrival ring to the workbench.
  for (let i = 0; i < 11; i++) {
    const z = 3.65 - i * 0.57;
    const center = 0.68 * Math.sin(i * 0.38);
    for (const side of [-1, 1]) {
      const x = center + side * (0.42 + rand() * 0.24);
      place(rock, stone, pick([0x65766b,0x586d66,0x677c70]), x,-0.062,z,
        .57+rand()*.32,.094+rand()*.026,.35+rand()*.12,0,rand()*.5);
    }
  }
  // Sulphur-lime caps, tiny calcite splinters and unfurling mineral fronds.
  const cap = profile([[0,0],[.65,.13],[1,.24],[.96,.36],[.65,.68],[.22,.87],[0,.89]], 14);
  const leaf = profile([[0,0],[.24,.13],[1,.48],[.72,.74],[0,1]], 4);
  const stem = profile([[.9,0],[.65,.14],[.48,.8],[.7,1]], 9);
  for (const [cx,cz,spread] of [[-4.3,3.5,1.5],[4.7,2.3,1.4],[-4.6,7.1,1.2],[4.8,7.4,1.4],
    [-6.1,-1,1.2],[5.8,-2.1,.9],[-8,-9,2],[9,-9,2],[.8,-2.8,.42]]) {
    for (let j = 0; j < 17; j++) {
      const a = rand()*Math.PI*2, r = Math.sqrt(rand())*spread;
      const x = cx + Math.cos(a)*r, z = cz + Math.sin(a)*r;
      const h = (0.24 + rand()*.37)*Math.min(1,spread);
      place(rock,stone,pick(moss),x,.025,z,h*.8,h*.25,h*.62,0,a);
      if (j % 3 === 0) {
        place(stem,mineral,0x9da985,x,0,z,h*.15,h*.75,h*.15);
        place(cap,luminous,pick([0xa8cf87,0x86bb90,0xe0c68c]),x,h*.68,z,h*.51,h*.39,h*.51);
      } else {
        for (let k = 0; k < 5; k++) {
          const angle = a + k*1.257;
          place(leaf,mineral,pick(jewels),x,.035,z,h*.17,h*(.8+rand()*.48),h*.058,.48+rand()*.35,angle,0);
        }
      }
    }
  }
  // Chiseled voussoirs set the furnace into an old shrine.
  for (let j = 0; j <= 16; j++) {
    const a = Math.PI*j/16;
    place(rock,stone,pick(moss),forge.x+2.72*Math.cos(a),2.72+3.79*Math.sin(a),-5.54,
      .53,.57,.34,0,0,a);
  }
  // Faults striate the exposed crown of the puzzle wall.
  for (let j=0; j<40; j++) {
    const x=-9.2 + j*.44, y=7.7 + .51*Math.sin(j*.43);
    place(rock,stone,pick(moss),x,y,-5.77, .72+rand()*.65,.47+rand()*.9,.48+rand()*.24,0,rand(),.2);
    if(j%3===0) place(shard,mineral,pick(jewels),x,y-.2,-5.48,.17,.52+rand()*.9,.18,Math.PI,.18,.22);
  }
  // A graduated solar dial and a crown of patinated copper leaves above the crucible.
  const fx=forge.x, fz=forge.z;
  place(disk,stone,0x283d40,fx,3.62,-5.47,2.48,0.25,2.48,Math.PI/2);
  for(const r of [1.48,1.72,2.27]) place(loop,bronze,0xc39662,fx,3.62,-5.28,r,r,1.8);
  for(let i=0;i<36;i++) {
    const a=i*Math.PI/18;
    place(shard,i%3===0?luminous:bronze,i%3===0?0xc6cc85:0xb18960,fx+Math.sin(a)*1.84,3.62+Math.cos(a)*1.84,-5.24,
      i%3===0?.10:.048,i%3===0?.32:.16,.07,0,0,-a);
  }
  for(let i=-3;i<=3;i++) {
    const a=i*.31;
    place(shard,bronze,i%2===0?0x9b7657:0x6e9780,fx+Math.sin(a)*.48,2.71,fz-.24,.26,1.83-Math.abs(i)*.17,.17,0,0,-a);
  }
  place(shard,luminous,0xe1b26f,fx,2.72,fz-.10,.19,1.25,.13);
  for (const [x,z] of [[-7.65,-4.9],[6.8,-4.85],[-9.4,2.4],[10.2,1.8],[-9,9.1],[10,9.6]]) {
    // Hanging oil lamps with a laid-bronze lip and a cut mint glass pendant.
    const y=3.6+rand()*1.5;
    place(disk,bronze,0x907952,x,(y+12)*.5,z,.023,12-y,.023);
    place(disk,bronze,0xc59761,x,y,z,.34,.12,.34);
    place(shard,luminous,0xbbdf95,x,y-.02,z,.27,.61,.27,Math.PI);
    place(loop,bronze,0xbf9c67,x,y-.29,z,.39,.55,.8);
  }
  for(const [x,z] of [[1.62,-2.05],[4.24,-2.28],[-7.85,-4.1],[6.55,-4.04]]) {
    const display = x<0 || x>6;
    const y = display ? .43 : x<2 ? .21 : .62;
    if(display) place(disk,stone,0x3d514e,x,y/2,z,.83,y,.64);
    for(let j=0;j<(display?6:2);j++){
      const h=(display?.35:.14)*(1+rand()*.9);
      const vx=x+(display?(j%3-1)*.33:(j===0?-.29:.27)), vz=z-(j>2?.24:0);
      place(vial,mineral,pick(jewels),vx,y,vz,h*.42,h,h*.42);
      place(disk,bronze,0xc49b69,vx,y+h,vz,h*.14,.05,h*.14);
    }
  }
  function pipe(coords,radius) {
    const curve=new CatmullRomCurve3(coords.map(p=>new Vector3(...p)));
    scene.add(new Mesh(new TubeGeometry(curve,64,radius,10,false),new MeshStandardMaterial({color:0x95715c,metalness:.61,roughness:.36})));
    for(let j=1;j<16;j++){
      const t=j/16, p=curve.getPointAt(t), dir=curve.getTangentAt(t);
      dummy.quaternion.setFromUnitVectors(new Vector3(0,1,0),dir);
      const {x,y,z}=dummy.rotation;
      place(disk,bronze,0xc1a173,p.x,p.y,p.z,radius*1.32,.10,radius*1.32,x,y,z);
    }
  }
  pipe([[-16,7,5],[-13,7.5,-3],[-9,7.34,-5.45],[-7.32,6.66,-5],[-7.15,4.18,-4.71],[-6.19,3.78,-4.69]],.14);
  pipe([[15,6.7,5],[13,7,-5],[8,6.42,-5.50],[6.73,5.4,-5.54],[6.52,2.65,-5.41],[5.07,1.07,-5.02]],.21);
  for (const {geo,mat,items} of batches.values()) {
    const group = new InstancedMesh(geo,mat,items.length);
    items.forEach(([matrix,color],i)=>{group.setMatrixAt(i,matrix);group.setColorAt(i,color);});
    scene.add(group);
  }
  return driftingDust(scene,rand);
}
