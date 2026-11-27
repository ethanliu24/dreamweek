import {
  BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial,
  SphereGeometry, Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ringSurface, TAU, woodyCurve } from './forms.js';

// Bake the little markings into their moving part so freckles, catchlights and
// embroidery follow the neck or shoulder and cost a single draw per joint.
function addPaintedParts(parent, material, build) {
  const pieces = [];
  const sphere = new SphereGeometry(1, 14, 10);
  function add(geometry, tint) {
    if (tint !== undefined) {
      const c = new Color(tint);
      const n = geometry.getAttribute('position').count;
      const rgb = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) c.toArray(rgb, i * 3);
      geometry.setAttribute('color', new Float32BufferAttribute(rgb, 3));
    }
    geometry.deleteAttribute('uv');
    pieces.push(geometry);
  }
  function oval(tint, x, y, z, sx, sy, sz, tilt = 0, lean = 0) {
    add(sphere.clone().scale(sx, sy, sz).rotateX(lean).rotateZ(tilt).translate(x, y, z), tint);
  }
  build(oval, add);
  parent.add(new Mesh(mergeGeometries(pieces), material));
}

function capHeight(r, a) {
  return 0.018 + 0.203 * Math.sqrt(Math.max(0, 1 - r * r)) - 0.031 * r * Math.sin(a)
    + 0.014 * r * r * Math.sin(3 * a + 0.5) - 0.016 * r * r * Math.cos(2 * a);
}

function spiritCap() {
  const underside = new Color(0xe1bd93), gill = new Color(0xfbe3bd);
  const crown = new Color(0xbd6c67), rim = new Color(0xd98a79), crownTop = new Color(0xd58270);
  const profile = [0.015, 0.31, 0.62, 0.88, 0.989, 1, 0.981, 0.91, 0.79, 0.64, 0.45, 0.24, 0.005];
  return ringSurface(96, profile.length - 1, (_, a, j) => {
    const r = profile[j], undersideY = -0.060 + 0.063 * r * r;
    const rib = (0.5 + 0.5 * Math.cos(a * 32 + r * 0.8)) ** 2;
    const hem = capHeight(1, a) - 0.018;
    const y = j < 5 ? undersideY + hem * r * r + rib * 0.008 * r : capHeight(r, a);
    const tint = j < 5 ? underside.clone().lerp(gill, rib) :
      rim.clone().lerp(crown, Math.min(1, (1 - r) * 7)).lerp(crownTop, (1 - r) * 0.75);
    return [0.416 * r * Math.sin(a), y, 0.347 * r * Math.cos(a), tint];
  });
}

function apron() {
  const positions = [], colors = [], indices = [];
  const hem = new Color(0x95a56e), moss = new Color(0x617d58);
  for (let j = 0; j <= 5; j++) {
    const t = j / 5;
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20 - 0.5) * (2.84 - t * 1.3);
      const y = .13 + .221 * t + .017 * Math.cos(a * 2.1);
      const r = Math.sqrt(Math.max(0, 1 - ((y - .316) / .285) ** 2));
      positions.push(Math.sin(a) * (.223 * r + .017), y, Math.cos(a) * (.183 * r + .015));
      colors.push(...(j === 0 || j === 5 ? hem : moss).toArray());
      if (j < 5 && i < 20) {
        const k = j * 21 + i;
        indices.push(k, k + 1, k + 21, k + 1, k + 22, k + 21);
      }
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function createMallow() {
  const root = new Group(), body = new Group(), head = new Group(), eyes = new Group();
  root.add(body);
  body.add(head, eyes);
  head.position.y = .615;
  eyes.position.y = .454;
  const soft = new MeshStandardMaterial({ vertexColors: true, roughness: 0.57, side: DoubleSide });
  const satin = new MeshStandardMaterial({ vertexColors: true, roughness: 0.43 });
  const cream = 0xf1dfbd, brown = 0x50323a;
  addPaintedParts(body, soft, (oval, add) => {
    oval(cream, 0, .316, 0, .223, .285, .183);
    for (const side of [-1, 1]) {
      oval(0xead6b5, side * .091, .077, .041, .087, .077, .113, -side * .08);
      oval(0xebae98, side * .142, .419, .141, .044, .017, .012, -side * .11);
      for (let i = 0; i < 3; i++) oval(0xbf8772, side * (.119 + i * .014), .426 + i % 2 * .007, .154 - i * .009, .006, .005, .004);
      add(woodyCurve([[side * .054, .519, .134], [side * .085, .529, .127], [side * .113, .520, .115]],
        [.005, .009, .004], [0x9b7664, 0xa58069], 6, 5));
      add(woodyCurve([[side * .112, .344, .156], [side * .148, .38, .125], [side * .161, .42, .081]],
        [.017, .016, .012], [0x647953, 0xa5ae72], 6, 6));
    }
    add(apron());
    oval(0x81985f, .006, .244, .197, .074, .049, .018, -.07);
    for (let i = 0; i < 7; i++) {
      const a = (i / 6) * Math.PI;
      oval(0xd3c392, .006 + .061 * Math.cos(a), .246 - .034 * Math.sin(a), .213, .004, .005, .002);
    }
    oval(0xc8bc78, .028, .266, .213, .009, .026, .004, -.53);
    oval(0x98b77b, .007, .268, .214, .008, .019, .004, .65);
  });
  const mouth = new Group();
  mouth.position.set(0, .401, .177);
  body.add(mouth);
  addPaintedParts(mouth, soft, (_, add) => {
    add(woodyCurve([[-.020, .005, 0], [-.010, -.002, .003], [.002, -.004, .003], [.013, 0, .003], [.019, .007, 0]],
      [.004, .005, .005, .004, .002], [brown, brown], 7, 7));
  });
  addPaintedParts(eyes, satin, oval => {
    for (const side of [-1, 1]) {
      oval(0x573634, side * .083, 0, .155, .036, .046, .024, -side * .05);
      oval(0x372c36, side * .084, .006, .173, .028, .033, .009);
      oval(0xa57853, side * .083, -.021, .177, .019, .008, .004);
      oval(0xfff2d7, side * .083 - .009, .019, .183, .010, .012, .004);
      oval(0xf4dbaf, side * .083 + .012, -.004, .184, .004, .005, .002);
    }
  });
  addPaintedParts(head, soft, (oval, add) => {
    add(spiritCap());
    for (const [a, r, s] of [[.1, .69, .042], [-.69, .76, .049], [1.13, .80, .038], [-1.59, .55, .045], [.66, .36, .047], [2.24, .57, .051], [3.34, .46, .031], [-2.59, .86, .036], [-.08, .94, .018], [1.69, .57, .018]]) {
      const x = .416 * r * Math.sin(a), z = .347 * r * Math.cos(a);
      const fleck = new SphereGeometry(1, 14, 8).scale(s, s * 0.19, s * .78);
      const n = new Vector3(Math.sin(a) * r / .416, Math.sqrt(1 - r * r) / .203, Math.cos(a) * r / .347).normalize();
      fleck.rotateX(Math.atan2(n.z, n.y));
      fleck.rotateZ(-Math.asin(n.x));
      add(fleck.translate(x, capHeight(r, a) + .001, z), 0xf5d9b7);
    }
    // A new leaf has taken root at the crown, like a tiny chef's feather.
    oval(0x71885b, -.090, .230, -.025, .024, .051, .013, .69);
    oval(0xacc27b, -.058, .240, -.018, .023, .052, .013, -.48);
  });
  const arms = [-1, 1].map(side => {
    const arm = new Group();
    arm.position.set(side * .171, .339, .022);
    body.add(arm);
    addPaintedParts(arm, soft, oval => oval(cream, 0, -.08, .055, .058, .114, .061));
    return arm;
  });
  let nod = 0, relief = 0, lastTime = 0;
  return {
    root,
    face(point) { root.rotation.y = Math.atan2(point.x - root.position.x, point.z - root.position.z); },
    animate(time, pose) {
      const shy = pose === 'shy', happy = pose === 'happy' || pose === 'offer';
      const ease = 1 - Math.exp(-9 * Math.max(0, time - lastTime));
      lastTime = time;
      nod += ((shy ? .26 : happy ? -.14 : .018) - nod) * ease;
      relief += ((happy ? 1 : 0) - relief) * ease;
      body.position.y = Math.sin(time * 2.4) * .006;
      body.rotation.z = Math.sin(time * 1.79) * .021;
      head.rotation.x = nod + Math.sin(time * 2.4 - .4) * .025;
      head.rotation.z = -.035 + Math.sin(time * 1.79 - .52) * .031;
      eyes.scale.y = 1 - .92 * Math.max(0, Math.cos(time * 1.65)) ** 110;
      mouth.scale.set(1 + relief * .27, 1 + relief * .60, 1);
      arms.forEach((arm, i) => {
        arm.rotation.x = shy || pose === 'offer' ? -.99 : -.38;
        arm.rotation.z = (i ? 1 : -1) * (pose === 'offer' ? -.24 : happy ? .94 : shy ? -.62 : .15);
      });
    },
  };
}
