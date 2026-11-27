import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

function mesh(parent, geometry, color, x, y, z, options) {
  const object = new Mesh(geometry, new MeshStandardMaterial({ color, ...options }));
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

function joint(parent, name, x, y, z) {
  const pivot = new Group();
  pivot.name = name;
  pivot.position.set(x, y, z);
  parent.add(pivot);
  return pivot;
}

export function createWizard() {
  const frog = new Group();
  const body = joint(frog, 'Body', 0, 0, 0);
  const sphere = new SphereGeometry(1, 22, 16);
  mesh(body, sphere, 0x6d9a76, 0, 0.31, 0).scale.set(0.42, 0.34, 0.34);
  const belly = joint(body, 'Belly', 0, 0.31, 0.23);
  mesh(belly, sphere, 0xa9bc85, 0, 0, 0).scale.set(0.30, 0.23, 0.16);
  for (const side of [-1, 1]) {
    const x = side * 0.2;
    mesh(body, sphere, 0x7da57a, x, 0.55, 0.18).scale.set(0.13, 0.12, 0.1);
    mesh(body, new BoxGeometry(0.12, 0.018, 0.014), 0x334447, x, 0.553, 0.280);
    const arm = joint(body, 'Arm ' + side, side * 0.32, 0.36, 0.12);
    mesh(arm, sphere, 0x6d9a76, side * 0.09, -0.09, 0).scale.set(0.16, 0.082, 0.09);
    joint(arm, 'Hand ' + side, side * 0.23, -0.09, 0);
    mesh(frog, sphere, 0x749773, side * 0.24, 0.085, 0.07).scale.set(0.17, 0.083, 0.19);
  }
  const hat = joint(body, 'Hat', 0, 0.65, -0.06);
  mesh(hat, new CylinderGeometry(0.39, 0.39, 0.045, 32), 0x57547f, 0, 0, 0);
  mesh(hat, new ConeGeometry(0.24, 0.52, 32), 0x69638a, 0, 0.25, 0);
  mesh(hat, new CylinderGeometry(0.207, 0.224, 0.04, 32), 0xb8a384, 0, 0.054, 0);
  const mouth = mesh(body, sphere, 0x371d39, 0, 0.457, 0.326);
  mouth.name = 'Mouth';
  mouth.scale.set(0.22, 0.018, 0.05);
  const moon = mesh(belly, sphere, 0xe8e3f8, 0, -0.03, 0.137, {
    emissive: 0xc6a1ed, emissiveIntensity: 0.52,
  });
  moon.material.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 lunarSurface;\n' + shader.vertexShader.replace(
      '#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n lunarSurface = normal;',
    );
    shader.fragmentShader = 'varying vec3 lunarSurface;\n' + shader.fragmentShader.replace(
      '#include <opaque_fragment>', `
      vec3 nMoon = normalize(lunarSurface);
      float craters = min(length(nMoon-vec3(-0.37,0.39,0.84))/0.23,
                      min(length(nMoon-vec3(0.36,-0.12,0.93))/0.15,
                          length(nMoon-vec3(-0.03,-0.58,0.81))/0.10));
      outgoingLight *= mix(vec3(0.68,0.66,0.84),vec3(1.0),smoothstep(0.68,1.0,craters));
      #include <opaque_fragment>`);
  };
  moon.scale.set(0.116, 0.116, 0.035);
  moon.name = 'Belly Moon';
  return frog;
}

export const WIZARD_COLLAPSE_ANGLE = -0.58;

export function addWizardCombatPose(frog) {
  const body = frog.getObjectByName('Body');
  const belly = frog.getObjectByName('Belly');
  const hat = frog.getObjectByName('Hat');
  const mouth = frog.getObjectByName('Mouth');
  const moon = frog.getObjectByName('Belly Moon');
  const arms = [-1, 1].map(side => frog.getObjectByName('Arm ' + side));
  const sphere = new SphereGeometry(1, 16, 12);
  const eyes = [-1, 1].map(side => {
    const eye = joint(body, 'Open eye', side * 0.2, 0.564, 0.266);
    mesh(eye, sphere, 0xf5e7bc, 0, 0, 0).scale.set(0.086, 0.071, 0.031);
    const iris = joint(eye, 'Gaze', side * 0.018, 0.004, 0.028);
    mesh(iris, sphere, 0x2e4541, 0, 0, 0).scale.set(0.036, 0.043, 0.013);
    mesh(iris, sphere, 0xfff7df, -0.009, 0.016, 0.012).scale.setScalar(0.009);
    return { eye, iris, side };
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let crouch = 0, cast = 0, open = 0;
  return {
    hand: frog.getObjectByName('Hand 1'),
    mouth,
    set(pose = {}) {
      crouch = pose.crouch ?? 0;
      cast = pose.cast ?? 0;
      open = pose.open ?? 0;
      body.scale.set(1 + crouch * 0.15, 1 - crouch * 0.3, 1);
      arms[1].rotation.z = 1.7 * cast;
      mouth.scale.y = 0.018 + 0.076 * open;
    },
    animate(time, hit, fallen) {
      const awake = fallen ? 0 : 1;
      const motion = awake * (reduced ? 0.38 : 1);
      const breath = Math.sin(time * 2.4);
      const croak = Math.max(0, Math.sin(time * 1.08 - 0.4)) ** 7;
      // Idle and recoil ride on the visual joints, leaving the attack and collapse roots free.
      body.position.y = motion * (0.008 + 0.008 * breath);
      body.rotation.set(-hit * 0.18 * awake, 0, motion * Math.sin(time * 1.25) * 0.021 + hit * 0.075 * awake);
      body.scale.set(1 + crouch * 0.15 + hit * 0.09, 1 - crouch * 0.3 - hit * 0.09, 1 + hit * 0.04);
      belly.scale.set(1 + 0.034 * breath * motion, 1 + 0.028 * breath * motion, 1 + 0.11 * croak * motion);
      hat.rotation.set(motion * (breath * 0.035 + croak * 0.06) + hit * 0.23, 0, motion * 0.045 * Math.sin(time * 1.25 - 0.65));
      arms[0].rotation.z = motion * (0.07 + 0.09 * Math.sin(time * 2.4 - 0.8));
      arms[1].rotation.z = 1.7 * cast - motion * 0.08 * breath * (1 - cast);
      mouth.scale.y = 0.018 + 0.076 * open + 0.014 * croak * motion * (1 - open);
      moon.material.emissiveIntensity = 0.55 + 0.14 * breath * motion + 0.32 * hit;
      for (const { eye, iris, side } of eyes) {
        eye.visible = !fallen;
        const blink = Math.max(0, 1 - Math.abs((time + side * 0.04) % 3.8 - 1.8) / 0.15);
        eye.scale.y = Math.max(0.045, 1 - blink * blink - hit * 0.38);
        iris.position.x = side * 0.016 + 0.017 * Math.sin(time * 0.81 + side) * motion;
      }
    },
  };
}
