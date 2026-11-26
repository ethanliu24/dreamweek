import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three';

export function createWick() {
  const root = new Group();
  root.name = 'Wick';
  root.userData.kind = 'wick';
  const sphere = new SphereGeometry(1, 24, 16);
  const charcoal = new MeshStandardMaterial({ color: 0x483646 });
  const saffron = new MeshStandardMaterial({ color: 0xf2aa36 });
  const blush = new MeshStandardMaterial({ color: 0xe97c69 });
  const flame = new MeshStandardMaterial({color:0xffad42, emissive:0xff772c, emissiveIntensity:0.85});
  const cream = new MeshStandardMaterial({ color: 0xffddad });

  function oval(parent, material, x, y, z, width, height, length) {
    const mesh = new Mesh(sphere, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(width, height, length);
    parent.add(mesh);
    return mesh;
  }

  const torso = new Group();
  root.add(torso);
  oval(torso, charcoal, 0, 0.38, 0, 0.22, 0.32, 0.15);
  oval(torso, saffron, 0, 0.43, 0.098, 0.15, 0.21, 0.073);

  const arms = [];
  for (const side of [-1, 1]) {
    oval(root, charcoal, 0.105 * side, 0.13, 0.04, 0.08, 0.13, 0.13);
    arms.push(oval(torso, charcoal, 0.19 * side, 0.44, 0.075, 0.062, 0.15, 0.065));
  }

  const tail = new Group();
  tail.position.set(0, 0.24, -0.09);
  torso.add(tail);
  oval(tail, charcoal, 0, -0.02, -0.17, 0.10, 0.10, 0.25).rotation.x = -0.25;
  oval(tail, saffron, 0.045, 0.065, -0.36, 0.07, 0.07, 0.14).rotation.y = -0.55;

  oval(tail, flame, 0.11, 0.12, -0.46, 0.044, 0.085, 0.047).rotation.z = -0.44;
  const head = new Group();
  head.position.set(0, 0.65, 0.05);
  torso.add(head);
  head.scale.set(1.17,1.08,1.13);
  oval(head, charcoal, 0, 0.075, 0.025, 0.21, 0.15, 0.17);
  oval(head, cream, 0, 0.018, 0.14, 0.15, 0.055, 0.10);
  const eyes = [-1, 1].map(side => {
    oval(head, blush, side*0.157, 0.061, 0.155, 0.041, 0.018, 0.015);
    oval(head, saffron, side*0.15, 0.17, 0.097, 0.049, 0.018, 0.038).rotation.z = side*0.32;
    oval(head, charcoal, side*0.052, 0.046, 0.228, 0.012, 0.008, 0.009);
    const eye = new Group();
    eye.position.set(0.128 * side, 0.12, 0.145);
    head.add(eye);
    oval(eye, saffron, 0, 0, 0, 0.056, 0.063, 0.027);
    const pupil = oval(eye, charcoal, 0, 0, 0.024, 0.024, 0.033, 0.012);
    oval(eye, cream, -0.008, 0.018, 0.035, 0.011, 0.013, 0.006);
    return { eye, pupil };
  });
  oval(head, cream, 0, 0.216, 0.008, 0.039, 0.047, 0.038);
  oval(head, flame, 0.008, 0.286, 0.008, 0.036, 0.068, 0.033).rotation.z = -0.21;

  return {
    root,
    pose(name, time = 0, gazeX = 0, gazeDown = 0) {
      const tense = name === 'scared' || name === 'carried';
      const recovering = name === 'recovering';
      const curled = tense || recovering;
      torso.position.y = tense ? -0.08 : recovering ? -0.037 : 0;
      torso.rotation.z = tense ? Math.sin(time * 46) * 0.05 : 0;
      head.rotation.set(curled ? 0.51 : -0.21 + gazeDown * 1.07, gazeX * 0.72, 0);
      tail.rotation.y = curled ? -1.32 : -0.22;
      arms.forEach((arm, i) => {
        arm.rotation.x = curled ? -0.9 : -0.12;
        arm.rotation.z = (i === 0 ? -1 : 1) * (curled ? -0.25 : 0.25);
      });
      eyes.forEach(({ eye, pupil }, i) => {
        eye.scale.y = tense ? 0.08 : recovering && i === 1 ? 0.08 : 1;
        pupil.position.x = gazeX * 0.018;
        pupil.position.y = -gazeDown * 0.021;
      });
    },
  };
}

export function createCandle() {
  const root = new Group();
  root.name = 'Candle gift';
  const wax = new MeshStandardMaterial({ color: 0xffeed0 });
  root.add(new Mesh(new CylinderGeometry(0.095, 0.11, 0.25, 12), wax));
  const wick = new Mesh(new CylinderGeometry(0.014, 0.016, 0.06, 6),
    new MeshStandardMaterial({ color: 0x3b2830 }));
  wick.position.y = 0.148;
  root.add(wick);
  const drip = new Mesh(new SphereGeometry(1, 12, 8), wax);
  drip.scale.set(0.028,0.055,0.018);
  drip.position.set(0.022,0.087,0.089);
  root.add(drip);
  return root;
}

export function createSeagull() {
  const root = new Group();
  root.name = 'Seagull';
  const feather = new MeshStandardMaterial({ color: 0xfff8df });
  const tip = new MeshStandardMaterial({ color: 0x292637 });
  const sphere = new SphereGeometry(1, 12, 8);
  const body = new Mesh(sphere, feather);
  body.scale.set(0.18, 0.085, 0.095);
  root.add(body);
  const wings = [-1, 1].map(side => {
    const pivot = new Group();
    for (const [material, distance, length] of [[feather, 0.16, 0.22], [tip, 0.35, 0.095]]) {
      const mesh = new Mesh(sphere, material);
      mesh.scale.set(0.11, 0.031, length);
      mesh.position.z = side * distance;
      pivot.add(mesh);
    }
    root.add(pivot);
    return pivot;
  });
  const speck = new Mesh(sphere, feather);
  speck.name = 'Falling speck';
  speck.scale.setScalar(0.047);
  return {
    root, speck,
    fly(origin, time) {
      root.position.copy(origin).add(new Vector3(3.1 - time * 2.8, 1.62, 1.35));
      wings.forEach((wing, i) => { wing.rotation.x = (i === 0 ? -1 : 1) * Math.sin(time * 21) * 0.72; });
      const fall = Math.max(0, time - 0.95);
      speck.visible = fall > 0 && fall < 1.22;
      speck.position.set(origin.x + 0.44, origin.y + 1.53 - fall * fall * 2.5, origin.z + 1.35);
    },
  };
}
