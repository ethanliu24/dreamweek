import {
  BufferGeometry, CatmullRomCurve3, Color, DoubleSide, Float32BufferAttribute,
  InstancedMesh, LatheGeometry, MeshStandardMaterial, Object3D, TubeGeometry, Vector2, Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;

// Fold the rim and tint successive growth rings directly on the coral surface.
function colony(profile, lobes, folds, segments = 32) {
  const geometry = new LatheGeometry(profile.map(([r, y]) => new Vector2(r, y)), segments);
  const positions = geometry.attributes.position;
  const colors = [];
  for (let i = 0; i < positions.count; i++) {
    const angle = Math.floor(i / profile.length) * TAU / segments;
    const row = i % profile.length;
    const [r, y, light] = profile[row];
    const ripple = Math.cos(lobes * angle + r) + 0.48 * Math.sin(3 * angle);
    const radius = r * (1 + ripple * 0.085);
    positions.setXYZ(i, Math.sin(angle) * radius, y + folds * ripple * r, Math.cos(angle) * radius);
    colors.push(light, light * (0.83 + 0.17 * light), 0.23 + light * 0.77);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function seaFan() {
  const pieces = [];
  function sprout(start, angle, length, radius, depth) {
    const direction = new Vector3(Math.sin(angle), Math.cos(angle), 0.13 * Math.sin(angle * 4));
    const end = start.clone().addScaledVector(direction, length);
    const mid = start.clone().lerp(end, 0.5);
    mid.x -= length * 0.065;
    const tube = new TubeGeometry(new CatmullRomCurve3([start, mid, end]), 4, radius, 6);
    pieces.push(tube);
    if (depth) {
      sprout(end, angle * 0.73 - 0.53, length * 0.74, radius * 0.69, depth - 1);
      sprout(end, angle * 0.84 + 0.57, length * 0.81, radius * 0.72, depth - 1);
    }
  }
  sprout(new Vector3(), 0, 0.64, 0.115, 4);
  return mergeGeometries(pieces);
}

export function buildReef(scene, floorHeight) {
  const plate = colony([[0,0,.38],[.27,.09,.43],[.62,.2,.64],[.94,.32,.95],[1,.38,1],
    [.93,.4,.96],[.78,.35,.64],[.68,.32,.83],[.55,.29,.59],[.43,.26,.74],[0,.19,.52]], 7, .105);
  const sponge = colony([[0,0,.38],[.29,.05,.47],[.23,.58,.65],[.33,.94,.94],[.28,1,1],
    [.21,.93,.9],[.16,.68,.33],[0,.61,.17]], 6, .07, 14);
  const fan = seaFan();
  const batches = new Map();
  const transform = new Object3D();
  let seed = 7143;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function place(shape, x, y, z, width, height, turn, tint, tilt = 0) {
    transform.position.set(x, y, z);
    transform.scale.set(width, height, width);
    transform.rotation.set(tilt, turn, 0, 'YXZ');
    transform.updateMatrix();
    if (!batches.has(shape)) batches.set(shape, []);
    batches.get(shape).push([transform.matrix.clone(), new Color(tint)]);
  }

  const shelves = [0x31c5b8, 0x528cc3, 0x7f75bc, 0xc475aa];
  const tips = [0xff9a83, 0xff7899, 0xe6a2ff, 0x70eee1];
  // Banks overlap down the ramp; the broad central lane holds the clues.
  for (let i = 0; i < 40; i++) {
    const z = -11 - random() * 40;
    const x = (i % 2 ? 1 : -1) * (8 + random() * 16);
    const y = floorHeight(x, z) - .4;
    const width = 1.1 + random() * 2;
    const layers = 2 + Math.floor(random() * 3);
    const tone = shelves[Math.floor(random() * shelves.length)];
    for (let j = 0; j < layers; j++) {
      place(plate, x + j * .21, y + j * .48, z, width * (1 - .1 * j), 2, random() * TAU, tone);
    }
    const top = y + (layers - 1) * .48 + .4;
    const accent = tips[Math.floor(random() * tips.length)];
    if (i % 3 === 0) place(fan, x, top, z, width * .63, width, random() * Math.PI, accent);
    else for (let j = 0; j < 4; j++) {
      place(sponge, x + Math.cos(j * 2) * .55, top, z + Math.sin(j * 2) * .48,
        .63 + random(), .58 + random() * 1.35, j, accent, .22);
    }
  }
  // Shallow rosettes break up the sand; give each evidence point a clear apron.
  for (let i = 0; i < 44; i++) {
    const z = -10 - random() * 30;
    const x = (i % 2 ? -1 : 1) * (3.2 + random() * 5.3);
    if ([[-3.4,-12.2],[4.7,-19.4],[-3.4,-31.5]].some(([cx, cz]) => Math.hypot(x-cx,z-cz) < 2.4)) continue;
    const y = floorHeight(x, z);
    const size = .28 + random() * .72;
    place(plate, x, y - .04, z, size, size, random() * TAU, tips[i % tips.length]);
    for (let j = 0; j < 3; j++) {
      place(sponge, x + Math.cos(j*2)*size*.45, y + .12, z + Math.sin(j*2)*size*.45,
        size*.64, size*(.55+random()), j, tips[i % tips.length], .28);
    }
  }
  for (let i = 0; i < 12; i++) {
    const x = -22 + i * 4;
    const z = -44 + Math.cos(i * .7) * 1.4;
    for (let h = 0; h < 3; h++) {
      place(plate, x + h*.42, -12.4 + h*.76, z, 3.5 - h*.48, 2.6, i+h, shelves[i%4]);
    }
    place(fan, x, -10.4, z, 1.4, 2.1, i*.58, tips[i%4]);
  }
  // Giant coiled tube-worm colonies form a sequence of curled silhouettes.
  const coils=[];
  for(let j=0;j<=64;j++){
    const angle=j/64*Math.PI*3.1, r=.14+1.55*j/64;
    coils.push(new Vector3(Math.cos(angle)*r,1.57+Math.sin(angle)*r,j*.006));
  }
  const coil=new TubeGeometry(new CatmullRomCurve3(coils),90,.18,12);
  const glow=new Color(0xffe7b3),violet=new Color(0xb679da),bands=[];
  for(let j=0;j<coil.attributes.position.count;j++){
    const t=Math.floor(j/13)/90;
    const c=violet.clone().lerp(glow,Math.pow(.5+.5*Math.cos(t*170),3));
    bands.push(c.r,c.g,c.b);
  }
  coil.setAttribute('color',new Float32BufferAttribute(bands,3));
  for(const [x,z,size,turn] of [[-6,-17,1.25,.3],[8,-26,1.7,-.7],[-8,-34,1.65,.5],[4,-39,1.4,.2]]){
    place(coil,x,floorHeight(x,z),z,size,size,turn,0xffc9e5);
    place(plate,x,floorHeight(x,z),z,2,1.8,turn,0xba84cb);
  }
  place(fan, -4.7, floorHeight(-4.7, -13.6), -13.6, 1.7, 1.6, .35, 0xffaa79);
  place(plate, 4.7, -12.06, -19.4, 1.3, .72, .5, 0xff86ab);
  for (const [shape, placements] of batches) {
    const material = new MeshStandardMaterial({ vertexColors: shape !== fan, side: DoubleSide,
      roughness: .34, metalness: .08, emissive: 0x13273a, emissiveIntensity: .42 });
    // Calcareous growth lines and tiny contrasting polyp mouths follow each colony.
    material.onBeforeCompile = shader => {
      shader.vertexShader = 'varying vec3 tissue;\n' + shader.vertexShader.replace(
        '#include <begin_vertex>', '#include <begin_vertex>\n tissue=position;');
      shader.fragmentShader = 'varying vec3 tissue;\n' + shader.fragmentShader.replace(
        '#include <color_fragment>', `#include <color_fragment>
        vec2 shell=vec2(atan(tissue.x,tissue.z)*3.82,length(tissue.xz)*11.+tissue.y*6.);
        float ridges=.5+.5*cos(shell.y*5.+sin(shell.x*2.));
        vec2 cell=fract(shell+vec2(.5*mod(floor(shell.y),2.),0.))-.5;
        float polyp=1.-smoothstep(.09,.18,length(cell));
        diffuseColor.rgb*=.80+.29*ridges;
        diffuseColor.rgb+=vec3(.27,.18,.14)*polyp;`);
    };
    const mesh = new InstancedMesh(shape, material, placements.length);
    placements.forEach(([matrix, color], i) => { mesh.setMatrixAt(i, matrix); mesh.setColorAt(i, color); });
    scene.add(mesh);
  }
}
