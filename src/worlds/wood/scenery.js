import {
  AdditiveBlending, BackSide, BufferGeometry, CanvasTexture, Color, DirectionalLight, DoubleSide, Float32BufferAttribute,
  FogExp2, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PlaneGeometry, PointLight, Points, ShaderMaterial, SphereGeometry, Vector2,
} from 'three';
import { growAncientTree } from './ancient-tree.js';
import { createBatches, forestRandom, TAU } from './forms.js';
import { plantForest } from './undergrowth.js';

const noise = `
  float hash(vec2 p) {
    vec3 v = fract(vec3(p.xyx) * .1031);
    v += dot(v, v.yzx + 33.33);
    return fract((v.x + v.y) * v.z);
  }
  float noise2(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
  }`;

function forestFloor(scene, time) {
  // Paint soft contact and canopy shadows once, at the actual plant positions.
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const width = 94;
  const pixels = canvas.width / width;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(pixels, pixels);
  const stamp = document.createElement('canvas');
  stamp.width = stamp.height = 64;
  const brush = stamp.getContext('2d');
  const penumbra = brush.createRadialGradient(32, 32, 1, 32, 32, 32);
  penumbra.addColorStop(0, '#18333c');
  penumbra.addColorStop(.46, '#18333cb0');
  penumbra.addColorStop(1, '#18333c00');
  brush.fillStyle = penumbra;
  brush.fillRect(0, 0, 64, 64);
  function shade(x, z, rx, rz, opacity) {
    ctx.globalAlpha = opacity;
    ctx.drawImage(stamp, x - rx, z - rz, 2 * rx, 2 * rz);
  }
  shade(-1.04, -1.17, .44, .32, .78);
  shade(-1.9, -1.42, .35, .52, .77);
  shade(-2.45, -2.96, 1.03, .51, .71);
  shade(.38, -5.5, 3.28, 2.21, .79);
  const material = new MeshStandardMaterial({ map: new CanvasTexture(canvas), roughness: .94 });
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec2 floorPoint;\n' + shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nfloorPoint = position.xz;');
    shader.fragmentShader = 'varying vec2 floorPoint;\n' + noise + '\n' + shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec2 p = floorPoint;
      float moss = .56*noise2(p*.45)+.29*noise2(p*1.7)+.15*noise2(p*6.);
      float leaves = noise2(p*4.5)*.65 + noise2(p*1.5)*.35;
      float path = abs(p.x-.46*sin(p.y*.84)-.32*sin(p.y*1.44));
      float clearing = min(length((p-vec2(.10,-1.38))*vec2(.91,1.03))-1.5,
          max(path-.68, max(-p.y-2.,p.y-8.)));
      float bank = smoothstep(-.36,.75,clearing+(moss-.5)*1.9);
      vec3 grass = mix(vec3(.012,.079,.063),vec3(.096,.27,.102),smoothstep(.20,.78,moss));
      vec3 trail = mix(vec3(.134,.096,.067),vec3(.35,.30,.169),moss);
      vec3 col = mix(trail,grass,bank);
      float sun = smoothstep(.46,.74,.53*noise2(p*.72)+.29*noise2(p*1.8)+.18*noise2(p*4.3));
      col *= .77+.32*moss;
      col += sun * vec3(.14,.14,.052);
      float grit=noise2(p*18.)*.65+noise2(p*57.)*.35;
      col *= .79 + .40*grit;
      col += smoothstep(.71,.85,grit)*vec3(.044,.049,.026);
      col += smoothstep(.68,.85,leaves) * vec3(.042,.041,.013);
      float sunPool=exp(-dot(p-vec2(-.5,-1.4),p-vec2(-.5,-1.4))*.13);
      col *= mix(.76,1.16,sunPool);
      float trunkShadow = smoothstep(.84,3.5,length((p-vec2(.20,-5.42))*vec2(.93,.82)));
      col *= mix(.42,1.,trunkShadow);
      // Settle the characters and work area into the dappled ground.
      col *= .51+.49*smoothstep(.0,.43,length((p-vec2(-1.04,-1.17))*vec2(.82,1.2)));
      col *= .71+.29*smoothstep(.25,.81,length(p-vec2(1.18,-1.65)));
      diffuseColor.rgb *= col;`);
  };
  scene.add(new Mesh(new PlaneGeometry(width, width).rotateX(-Math.PI / 2).translate(0, -0.018, 0), material));

  const random = forestRandom(301);
  const vertices = [], colors = [], indices = [];
  for (let i = 0; i < 7; i++) {
    const a = random() * TAU, x = (random() - 0.5) * 0.4, z = (random() - 0.5) * 0.4;
    const h = 0.12 + random() * 0.22, w = 0.016 + random() * 0.014;
    const s = Math.sin(a), c = Math.cos(a), k = vertices.length / 3;
    vertices.push(x - c * w, 0, z + s * w, x + c * w, 0, z - s * w, x + s * 0.06 - c * w, h * 0.64, z + c * 0.06 + s * w,
      x + s * 0.06 + c * w, h * 0.64, z + c * 0.06 - s * w, x + s * 0.16, h, z + c * 0.16);
    colors.push(.29, .40, .32, .29, .40, .32, .67, .83, .57, .67, .83, .57, .99, 1, .73);
    indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3, k + 2, k + 4, k + 3);
  }
  const blades = new BufferGeometry();
  blades.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  blades.setAttribute('color', new Float32BufferAttribute(colors, 3));
  blades.setIndex(indices);
  blades.computeVertexNormals();
  const grass = new MeshStandardMaterial({ side: DoubleSide, vertexColors: true });
  grass.onBeforeCompile = shader => {
    shader.uniforms.forestTime = time;
    shader.vertexShader = 'uniform float forestTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vec2 root=instanceMatrix[3].xz;
      float breeze=sin(forestTime*1.22+dot(root,vec2(.45,.72)))+.37*sin(forestTime*2.1+root.x);
      transformed.x += position.y*position.y*.48*breeze;
    `);
  };
  const batches = createBatches(scene);
  const pebbles = new SphereGeometry(1, 7, 4);
  const pebbleMat = new MeshStandardMaterial({ roughness: 0.98 });
  const grassPalette = [0x668e46, 0x589652, 0x438569, 0xa0a25c, 0x62956e];
  for (let i = 0; i < 1680; i++) {
    const a = random() * TAU, r = Math.sqrt(random()) * 21;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const path = Math.abs(x - 0.46 * Math.sin(z * .84) - .32 * Math.sin(z * 1.44));
    const isTrail = (z > -3 && z < 8 && path < 0.92) || Math.hypot(x, -1.38 - z) < 2.1;
    if (Math.abs(x) < 1.16 && z < -3 && z > -6.7) continue;
    if (isTrail) {
      if (i % 4 === 0) {
        const s = 0.024 + random() * 0.048;
        batches.place(pebbles, pebbleMat, i % 3 ? 0x94886b : 0xbda888, [x, 0, z], [s * 1.4, s * .37, s], [0, a, 0]);
      }
      continue;
    }
    const s = 0.5 + random() * 1.3;
    batches.place(blades, grass, grassPalette[i % grassPalette.length], [x, 0, z], [s, s, s], [0, a * 3, 0]);
  }
  // Worn, irregular steps lead from the footpath up to the warm hollow.
  for (const [x, z, w, d, yaw] of [[-.21, 3.63, .44, .22, .16], [.04, 3.01, .37, .22, -.22],
  [.11, 2.46, .48, .22, .18], [-.18, 1.84, .34, .20, -.10], [-.46, 1.25, .32, .18, .34],
  [-.16, -2.60, .43, .19, -.21], [.08, -3.02, .48, .23, .14], [-.06, -3.44, .50, .24, -.14],
  [.03, -3.83, .56, .26, .19]]) {
    batches.place(pebbles, pebbleMat, random() > .5 ? 0x929079 : 0xa59a7f, [x, .009, z], [w, .043, d], [0, yaw, 0]);
  }
  batches.finish();
  return shade;
}

function daylight(scene) {
  scene.fog = new FogExp2(0x447d74, 0.052);
  scene.background = scene.fog.color;
  const sky = new Mesh(new SphereGeometry(76, 24, 12), new ShaderMaterial({
    side: BackSide, depthWrite: false,
    vertexShader: `varying vec3 dir; void main(){dir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec3 dir; void main(){
      vec3 d=normalize(dir);
      vec3 sky=mix(vec3(.058,.205,.175),vec3(.35,.69,.58),smoothstep(-.1,.6,d.y));
      float sun=max(0.,dot(d,normalize(vec3(-.6,.48,-1.))));
      sky+=vec3(.55,.43,.16)*pow(sun,9.)*smoothstep(-.01,.25,d.y);
      gl_FragColor=vec4(sky,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
  }));
  sky.renderOrder = -2;
  scene.add(sky, new HemisphereLight(0xcde9ef, 0x8a8464, 1.16));
  const sun = new DirectionalLight(0xffddac, 2.27);
  sun.position.set(-5, 9, 4);
  scene.add(sun);
  const hollowLight = new PointLight(0xffad68, 1.55, 3.0);
  hollowLight.position.set(-0.14, 0.86, -4.63);
  scene.add(hollowLight);

  // Soft ribbons have feathered edges and disappear at both ends of the shaft.
  const rays = new ShaderMaterial({
    transparent: true, depthWrite: false, side: DoubleSide, blending: AdditiveBlending,
    vertexShader: `varying vec2 st;void main(){st=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 st;void main(){
      float soft=pow(max(0.,sin(st.x*3.14159)),2.8)*sin(st.y*3.14159);
      gl_FragColor=vec4(.84,.91,.49,.084*soft*soft);
      #include <colorspace_fragment>
    }`,
  });
  const plane = new PlaneGeometry();
  for (const [x, y, z, w, h] of [[-3.6, 3.3, -2.0, 1.35, 8.8], [-2.75, 4.1, -3.3, 0.53, 9.5], [2.4, 4.1, -7, 1.8, 10], [-7.5, 3.9, -7, 2.5, 9], [6.5, 3.1, -4, 0.87, 7]]) {
    const beam = new Mesh(plane, rays);
    beam.position.set(x, y, z);
    beam.rotation.z = -0.40;
    beam.scale.set(w, h, 1);
    scene.add(beam);
  }
}

function forestLights(scene, glints, time) {
  const random = forestRandom(955);
  const positions = [], seeds = [];
  for (let i = 0; i < 100; i++) {
    const a = random() * TAU, r = 0.8 + random() * (i % 3 ? 12 : 6.5);
    positions.push(Math.sin(a) * r, 0.31 + random() ** 1.85 * 4.3, Math.cos(a) * r - 2.1);
    seeds.push(random() * 109);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(positions, 3));
  g.setAttribute('seed', new Float32BufferAttribute(seeds, 1));
  const height = { value: 720 };
  const dust = new Points(g, new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending, uniforms: { time, height },
    vertexShader: `attribute float seed;uniform float time,height;varying float pulse;varying float hue;
      void main(){
        vec3 p=position+vec3(sin(time*.39+seed)*.39,sin(time*.73+seed*1.7)*.23,cos(time*.28+seed)*.32);
        vec4 mv=modelViewMatrix*vec4(p,1.);
        hue=fract(seed);pulse=.35+.65*pow(.5+.5*sin(seed+time*1.75),2.);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp(height*(.108+.08*hue)/max(.2,-mv.z),2.,39.);
      }`,
    fragmentShader: `varying float pulse,hue;void main(){
      vec2 p=abs(gl_PointCoord*2.-1.);
      float r=length(p);
      float halo=exp(-r*r*5.)*.34;
      float core=exp(-r*r*69.);
      float star=exp(-min(p.x,p.y)*20.)*exp(-max(p.x,p.y)*4.);
      vec3 col=mix(vec3(.41,1.,.78),vec3(1.,.79,.31),step(.36,hue));
      gl_FragColor=vec4(col*(1.+core),pulse*(core+halo+star*.80)*(1.-smoothstep(.62,1.,r)));
      #include <colorspace_fragment>
    }`,
  }));
  const viewport = new Vector2();
  dust.onBeforeRender = renderer => { height.value = renderer.getDrawingBufferSize(viewport).y; };
  scene.add(dust);

  // A soft halo sits around each bright seed and selected mint-coloured caps.
  // These share one depth-tested draw regardless of the number of lanterns.
  const halos = new BufferGeometry();
  halos.setAttribute('position', new Float32BufferAttribute(glints.flatMap(p => p.slice(0, 3)), 3));
  halos.setAttribute('radius', new Float32BufferAttribute(glints.map(p => p[3]), 1));
  halos.setAttribute('color', new Float32BufferAttribute(glints.flatMap(p => new Color(p[4]).toArray()), 3));
  const lights = new Points(halos, new ShaderMaterial({
    transparent: true, depthWrite: false, vertexColors: true, blending: AdditiveBlending, uniforms: { height, time },
    vertexShader: `attribute float radius; uniform float height,time; varying vec3 tint;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.); mv.z+=radius*.25;
        gl_Position=projectionMatrix*mv;gl_PointSize=clamp(height*radius/max(.1,-mv.z),1.,156.);
        tint=color*(.9+.1*sin(time*1.2+position.x*9.));}`,
    fragmentShader: `varying vec3 tint; void main(){
      vec2 p=abs(gl_PointCoord*2.-1.);float r=length(p);
      float halo=exp(-4.5*r*r)*.23;float core=exp(-46.*r*r)*.19;
      gl_FragColor=vec4(tint,(halo+core)*(1.-smoothstep(.73,1.,r)));
      #include <colorspace_fragment>
    }`,
  }));
  lights.onBeforeRender = dust.onBeforeRender;
  scene.add(lights);

  // Broken ribbons of mist drift through the understory beyond the playable clearing.
  const veil = new PlaneGeometry();
  for (const [x, y, z, yaw, tint] of [
    [-7, 1.15, -9, .28, 0x84e9da], [6, 1.45, -13, -.22, 0xd0b3eb],
    [-12, .95, 3, 1.48, 0x94dac6], [13, 1.1, 3, -1.45, 0x91c8df], [0, 1.4, 16, 0, 0xb7cbe8],
  ]) {
    const mist = new Mesh(veil, new ShaderMaterial({
      transparent: true, depthWrite: false, side: DoubleSide, forceSinglePass: true,
      uniforms: { time, tint: { value: new Color(tint) } },
      vertexShader: `varying vec2 st; void main(){st=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: noise + `
        varying vec2 st; uniform float time; uniform vec3 tint;
        void main(){
          vec2 p=vec2(st.x*5.-time*.047,st.y*2.);
          float cloud=.69*noise2(p)+.31*noise2(p*2.7+.8);
          float ridge=.42+.21*sin(st.x*6.+time*.095)+.25*(cloud-.5);
          float edge=sin(3.14159*st.x)*sin(3.14159*st.y);
          float alpha=exp(-19.*pow(st.y-ridge,2.))*edge*smoothstep(.25,.76,cloud);
          gl_FragColor=vec4(tint,alpha*.43);
          #include <colorspace_fragment>
        }`,
    }));
    mist.position.set(x,y,z);
    mist.rotation.y=yaw;
    mist.scale.set(17,3.8,1);
    scene.add(mist);
  }

  const wing = new BufferGeometry();
  wing.setAttribute('position', new Float32BufferAttribute([
    0, 0, 0, .12, .10, -.08, .16, .12, -.01, .14, .08, .045, .09, .05, .054,
    .098, .045, .095, .069, .02, .11, .022, .007, .08,
  ], 3));
  wing.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 7]);
  const colors = [0x715998, 0xc8fbdb, 0xc7ffd9, 0x69e1d0, 0x9969a4, 0xffca9a, 0xf8a889, 0x9171b2];
  wing.setAttribute('color', new Float32BufferAttribute(colors.flatMap(c => new Color(c).toArray()), 3));
  const pigment = new MeshBasicMaterial({ vertexColors: true, side: DoubleSide });
  pigment.transparent = true;
  pigment.depthWrite = false;
  pigment.forceSinglePass = true;
  pigment.onBeforeCompile = shader => {
    shader.vertexShader = 'varying float wingDepth;\n' + shader.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\nwingDepth = -mvPosition.z;');
    shader.fragmentShader = 'varying float wingDepth;\n' + shader.fragmentShader.replace('#include <color_fragment>',
      '#include <color_fragment>\ndiffuseColor.a *= smoothstep(.76, 1.45, wingDepth);');
  };
  const butterflies = [[-2.9, 1.2, 0.6], [2.75, 1.04, -0.2], [-3, 1.8, -3.8], [4.6, 1.2, 4.7]].map((p, i) => {
    const body = new Group();
    const wings = [-1, 1].map(side => {
      const mesh = new Mesh(wing, pigment);
      mesh.scale.x = side;
      body.add(mesh);
      return mesh;
    });
    scene.add(body);
    return t => {
      const a = t * .65 + i * 2;
      body.position.set(p[0] + .44 * Math.sin(a), p[1] + .16 * Math.sin(a * 2.31), p[2] + .36 * Math.cos(a));
      body.rotation.y = a + Math.PI / 2;
      body.rotation.x = .26 * Math.sin(a);
      const fold = .65 + .60 * Math.sin(t * 14 + i);
      wings[0].rotation.z = -fold;
      wings[1].rotation.z = fold;
    };
  });
  return t => { time.value = t; butterflies.forEach(fly => fly(t)); };
}

export function dressForest(scene) {
  daylight(scene);
  const time = { value: 0 };
  const shade = forestFloor(scene, time);
  const glints = [];
  const forest = plantForest(scene, glints, shade);
  growAncientTree(scene, forest);
  forest.finish();
  return forestLights(scene, glints, time);
}
