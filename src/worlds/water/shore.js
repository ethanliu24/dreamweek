import { dressBeach } from './beach-club.js';
import { createJellyfish } from './jellyfish.js';
import { createLagoon } from './lagoon.js';
import { dressLagoon } from './foliage.js';
import { buildReef } from './reef.js';
import { createShoreDetails } from './shore-details.js';
import { createTeal } from './teal.js';
import {
  BoxGeometry, CanvasTexture, Color, CylinderGeometry, DirectionalLight, DoubleSide, Float32BufferAttribute, Fog,
  Group, HemisphereLight, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry,
  ShaderMaterial, SphereGeometry, SRGBColorSpace, TorusGeometry, Vector3,
} from 'three';

export const BEACH_END = 10;
export const REEF_END = -40;
const COAST_FOG = new Color(0xb2e3dd);
const REEF_FOG = new Color(0x286a88);

export function floorHeight(_x, z) {
  return MathUtils.clamp(z * (2 / 3), -12, 0);
}

export function buildShore(scene) {
  const sand = new MeshStandardMaterial({ color: 0xe7c68b });
  const lagoon = createLagoon(scene);
  const shoreDetails = createShoreDetails(scene, floorHeight);
  const { seabed, water } = lagoon;
  const blue = new MeshStandardMaterial({ color: 0x3880a2 });
  const brass = new MeshStandardMaterial({ color: 0xdca747, metalness: 0.28, roughness: 0.38 });
  const red = new MeshStandardMaterial({ color: 0xbb413b });
  const ivory = new MeshStandardMaterial({ color: 0xf2e4cb });
  const dark = new MeshStandardMaterial({ color: 0x203541 });
  const lilac = new MeshStandardMaterial({ color: 0xa59ad6 });
  const peach = new MeshStandardMaterial({ color: 0xe5a17b });
  const sphere = new SphereGeometry(1, 24, 16);
  const box = new BoxGeometry();
  const pipe = new CylinderGeometry(1, 1, 1, 12);

  function prop(parent, geometry, material, position, scale) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }

  function group(x, y, z) {
    const root = new Group();
    root.position.set(x, y, z);
    scene.add(root);
    return root;
  }

  function ground(start, end, material) {
    const mesh = new Mesh(new PlaneGeometry(56, start - end, 1, Math.ceil(start - end)), material);
    mesh.geometry.rotateX(-Math.PI / 2).translate(0, 0, (start + end) / 2);
    const p = mesh.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, floorHeight(p.getX(i), p.getZ(i)));
    mesh.geometry.computeVertexNormals();
    scene.add(mesh);
  }

  ground(BEACH_END + 6, 0, lagoon.sand);
  ground(0, REEF_END - 16, seabed);
  // The surface faces up so an underwater camera sees the reef directly.
  const surface = new Mesh(new PlaneGeometry(180, 100), water);
  surface.rotation.x = -Math.PI / 2;
  surface.position.set(0, -0.04, -50);
  scene.add(surface);

  scene.background = COAST_FOG.clone();
  scene.fog = new Fog(COAST_FOG, 14, 65);
  const sky = new HemisphereLight(0xe3f9ff, 0x949368, 2);
  const sun = new DirectionalLight(0xffedcf, 1.55);
  sun.position.set(-6, 10, 4);
  scene.add(sky, sun);

  dressBeach(scene);
  const faucet = group(-2, 0, 4.8);
  prop(faucet, pipe, blue, [0, 0.5, 0], [0.09, 1, 0.09]);
  prop(faucet, box, brass, [0, 1, 0.16], [0.17, 0.16, 0.36]);
  prop(faucet, pipe, brass, [0, 0.92, 0.32], [0.08, 0.19, 0.08]);
  prop(faucet, box, brass, [0, 1.17, 0.04], [0.32, 0.045, 0.055]);
  prop(faucet, pipe, brass, [0, 1.1, 0.04], [0.035, 0.15, 0.035]);

  prop(faucet,pipe,ivory,[0,.055,0],[.33,.11,.33]);
  for (const h of [.17,.62,.87]) prop(faucet,pipe,brass,[0,h,0],[.117,.055,.117]);
  for (const x of [-.17,.17]) prop(faucet,sphere,brass,[x,1.17,.04],[.047,.04,.04]);
  prop(faucet,pipe,dark,[0,.83,.32],[.054,.018,.054]);

  const station = group(0.6, 0, 3.2);
  for (const x of [-0.52, 0.52]) {
    for (const z of [-0.38, 0.38]) prop(station, box, red, [x, 0.65, z], [0.09, 1.3, 0.09]);
  }
  prop(station, box, ivory, [0, 1.24, 0], [1.3, 0.13, 1]);
  prop(station, box, red, [0, 1.57, -0.42], [1.3, 0.56, 0.1]);
  prop(station, sphere, peach, [-0.68, 1.28, 0.18], [0.22, 0.16, 0.12]);
  for (const x of [-.34, .34]) {
    prop(station, box, ivory, [x,.57,.57],[.053,1.25,.064]).rotation.x=-.25;
  }
  for (let rung=0;rung<4;rung++) {
    prop(station, box, red,[0,.19+rung*.25,.67-rung*.065],[.69,.055,.075]);
  }
  const buoy = new Group();
  buoy.position.set(.63,1.04,.36);
  station.add(buoy);
  for(let arc=0;arc<8;arc++) {
    prop(buoy,new TorusGeometry(.24,.065,10,9,Math.PI/4),arc%2 ? ivory : red,
      [0,0,0],[1,1,1]).rotation.z=arc*Math.PI/4;
  }
  const teal = createTeal();
  station.add(teal.root);

  const beachgoers = [-5.2, 5.4].map((x, i) => {
    const guest = group(x, 0, 3.9 + i * 1.4);
    prop(guest, sphere, i ? lilac : peach, [0, 0.33, 0], [0.34, 0.34, 0.29]);
    prop(guest, sphere, ivory, [0, 0.65, -0.02], [0.22, 0.22, 0.21]);
    prop(guest, sphere, dark, [0, 0.63, -0.21], [0.12, 0.04, 0.04]);
    prop(guest,sphere,brass,[0,.80,-.025],[.33,.044,.29]);
    prop(guest,sphere,brass,[0,.83,-.025],[.19,.135,.18]);
    for(const side of [-1,1]){
      prop(guest,sphere,dark,[side*.083,.67,-.207],[.025,.031,.017]);
      prop(guest,sphere,ivory,[side*.23,.37,.02],[.11,.18,.085]).rotation.z=side*.48;
      prop(guest,sphere,ivory,[side*.14,.095,-.16],[.13,.075,.18]);
    }
    return guest;
  });

  // Scalloped canvas parasols flank the lifeguard station.
  for (const [x, z, trim] of [[-5.2, 3.6, red], [5.8, 3.8, blue]]) {
    const parasol = group(x, 0, z);
    prop(parasol, pipe, brass, [0, 1, 0], [.035, 2, .035]);
    const canopy = new SphereGeometry(1, 36, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const pos = canopy.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const a = Math.atan2(pos.getZ(i), pos.getX(i));
      pos.setY(i, pos.getY(i) - .16 * (1 - pos.getY(i)) * Math.cos(6 * a));
    }
    const colors = [];
    const panels = canopy.toNonIndexed();
    for (let i = 0; i < panels.attributes.position.count; i += 3) {
      const point = panels.attributes.position;
      const angle = Math.atan2(point.getZ(i)+point.getZ(i+1)+point.getZ(i+2),
        point.getX(i)+point.getX(i+1)+point.getX(i+2));
      const color = Math.sin(angle*6) > 0 ? trim.color : ivory.color;
      for (let j = 0; j < 3; j++) colors.push(color.r, color.g, color.b);
    }
    panels.setAttribute('color', new Float32BufferAttribute(colors, 3));
    prop(parasol, panels, new MeshStandardMaterial({ vertexColors: true, side: DoubleSide }),
      [0, 1.73, 0], [1.16, .49, 1.16]);
  }

  const clam = group(3.5, 0, 2.7);
  const lid = new Group();
  clam.add(lid);
  lid.position.set(0, 0.29, -0.35);
  const valve = new SphereGeometry(1,72,28);
  const verts = valve.attributes.position;
  const nacre = [];
  for(let i=0;i<verts.count;i++){
    const x=verts.getX(i),y=verts.getY(i),z=verts.getZ(i);
    const angle=Math.atan2(x,z+1.05), ridge=.5+.5*Math.cos(42*angle);
    verts.setXYZ(i,x*(.84+.16*z)*(1+.045*ridge),y*(.67+.33*ridge),z+.045*ridge);
    const c=new Color(0xcd78ad).lerp(new Color(0xffe3c9),ridge*.48+.28*(1-Math.abs(y)));
    nacre.push(c.r,c.g,c.b);
  }
  valve.setAttribute('color',new Float32BufferAttribute(nacre,3));
  valve.computeVertexNormals();
  const motherOfPearl=new MeshStandardMaterial({vertexColors:true,metalness:.21,roughness:.25});
  prop(clam,valve,motherOfPearl,[0,.17,.04],[.92,.19,.56]);
  prop(lid,valve,motherOfPearl,[0,.045,.38],[.94,.18,.55]);
  prop(clam,sphere,ivory,[0,.33,.34],[.22,.17,.19]);
  for (const x of [-0.18, 0.18]) prop(lid, sphere, dark, [x, 0.015, 0.78], [0.075, 0.015, 0.025]);

  const barrier = group(0, 0, 8);
  for (const x of [-1.85, 1.85]) prop(barrier, pipe, ivory, [x, 0.65, 0], [0.09, 1.3, 0.09]);
  for(const x of [-1.85,1.85]){
    prop(barrier,sphere,brass,[x,1.32,0],[.095,.083,.095]);
    for(const h of [.12,.96,1.11])prop(barrier,pipe,red,[x,h,0],[.094,.042,.094]);
  }
  const rope = prop(barrier, new TorusGeometry(1.85, 0.028, 6, 32, Math.PI), red,
    [0, 1.14, 0], [1, 0.13, 1]);
  rope.rotation.z = Math.PI;
  const board = document.createElement('canvas');
  board.width = 256;
  board.height = 64;
  const pen = board.getContext('2d');
  pen.fillStyle = '#fff0d4';
  pen.fillRect(0, 0, 256, 64);
  pen.fillStyle = '#982e28';
  pen.font = 'bold 28px sans-serif';
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  pen.fillText('BEACH CLOSED', 128, 32);
  const sign = new CanvasTexture(board);
  sign.colorSpace = SRGBColorSpace;
  const signFace = new PlaneGeometry(1.3, 0.325);
  const signMaterial = new MeshBasicMaterial({ map: sign });
  for (const side of [-1, 1]) {
    const face = prop(barrier, signFace, signMaterial, [0.33, 1.02, side * 0.034], [1, 1, 1]);
    face.rotation.y = side < 0 ? Math.PI : 0;
  }

  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      prop(scene, sphere, sand, [side * (3.9 + i * 3.55), -0.47, 9.8], [2.2, 1.2 + i * 0.13, 1.7]);
    }
  }

  buildReef(scene, floorHeight);
  const animateMist = dressLagoon(scene, floorHeight);

  const bells = [[-8,-16],[7,-24],[-6,-27],[5,-32],[-7,-37],[2,-40]].map(([x,z],i)=>{
    const animal=createJellyfish([0xb8a0ff,0x86fff2,0xff99d3][i%3],i);
    scene.add(animal.root);
    return {animal,x,z,y:floorHeight(x,z)+3.35+Math.cos(z)};
  });

  const bubble = new Mesh(sphere, new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { tint: { value: new Color(0xa8fcff) } },
    vertexShader: `
      varying vec3 eye;
      varying vec3 facing;
      void main() {
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        eye = -p.xyz;
        facing = normalMatrix * normal;
        gl_Position = projectionMatrix * p;
      }`,
    fragmentShader: `
      uniform vec3 tint;
      varying vec3 eye;
      varying vec3 facing;
      void main() {
        float rim = pow(1.0 - max(dot(normalize(facing), normalize(eye)), 0.0), 3.0);
        vec3 n=normalize(facing);
        vec3 pearl=.7+.3*cos(vec3(0.,2.,4.)+n.y*6.+n.x*2.);
        float glint=pow(max(dot(n,normalize(vec3(-.4,.7,.5))),0.),92.);
        gl_FragColor = vec4(mix(tint,pearl,rim)+glint, 0.022 + 0.57 * rim + .32*glint);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  bubble.visible = false;
  scene.add(bubble);
  const mouth = new Vector3(clam.position.x, 0.45, clam.position.z + 0.5);
  const bubbleCenter = new Vector3();

  return {
    faucet: faucet.position,
    station: station.position,
    teal,
    clam: clam.position,
    barrier,
    animate(elapsed, position, bubbleTime, announcing) {
      const depth = MathUtils.smoothstep(-position.y, 0.2, 5.4);
      animateMist(elapsed);
      shoreDetails.animate(elapsed);
      lagoon.animate(elapsed, depth);
      scene.background.copy(COAST_FOG).lerp(REEF_FOG, depth);
      scene.fog.color.copy(scene.background);
      scene.fog.near = MathUtils.lerp(14, 4, depth);
      scene.fog.far = MathUtils.lerp(65, 42, depth);
      sun.intensity = MathUtils.lerp(1.55, 1.15, depth);

      teal.animate(elapsed, announcing);
      for (const guest of beachgoers) {
        guest.rotation.y = barrier.visible
          ? Math.atan2(station.position.x - guest.position.x, station.position.z - guest.position.z)
          : 0;
      }
      lid.rotation.x = -0.66 * Math.sin(Math.PI * bubbleTime);
      bubble.visible = bubbleTime > 0.2;
      if (bubble.visible) {
        const expansion = MathUtils.smoothstep(bubbleTime, 0.2, 0.86);
        bubbleCenter.copy(position);
        bubbleCenter.y += 0.67;
        bubble.position.lerpVectors(mouth, bubbleCenter, expansion);
        bubble.scale.setScalar(MathUtils.lerp(0.08, 0.87, expansion));
      }

      for (const [i,{animal,x,y,z}] of bells.entries()) {
        const dx=position.x-x, dz=position.z-z;
        const attention=1-MathUtils.smoothstep(Math.hypot(dx,dz),2,7);
        animal.root.position.set(x+Math.cos(elapsed*.35+i)*1.1+dx*attention*.27,
          y+Math.sin(elapsed*.9+i)*.36-attention*.35,z+Math.sin(elapsed*.35+i)*.85+dz*attention*.27);
        animal.animate(elapsed,attention);
      }
    },
  };
}
