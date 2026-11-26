import {
  BackSide, BoxGeometry, Color, DirectionalLight, Fog, HemisphereLight, IcosahedronGeometry,
  Mesh, MeshStandardMaterial, Scene, ShaderMaterial, SphereGeometry, Vector3,
} from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { canReturn } from '../../state/progress.js';
import { createReturnRing } from '../../shared/props/return-ring.js';
import { createBob, createReaction } from './bob.js';
import { createPotStory } from './story.js';
import { createWheel } from './wheel.js';

const ARRIVAL = new Vector3(0, 0, 4.8);
const WALK_BOUNDS = { minX: -9, maxX: 9, minZ: -9, maxZ: 7 };

function dressBasin(scene) {
  scene.fog = new Fog(0xefbaaf, 13, 46);
  scene.add(new Mesh(new SphereGeometry(70, 24, 16), new ShaderMaterial({
    side: BackSide,
    uniforms: { horizon: { value: new Color(0xf0b8b8) }, sky: { value: new Color(0x92bddf) } },
    vertexShader: 'varying float altitude; void main(){ altitude=position.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `
      varying float altitude;
      uniform vec3 horizon;
      uniform vec3 sky;
      void main(){
        gl_FragColor=vec4(mix(horizon,sky,smoothstep(-5.,35.,altitude)),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })));
  const key = new DirectionalLight(0xffdab7, 2.45);
  key.position.set(-4, 7, 3);
  scene.add(key, new HemisphereLight(0xe3ebff, 0xb66c55, 1.75));
  const material = color => new MeshStandardMaterial({ color, roughness: 0.85 });
  const floor = new Mesh(new BoxGeometry(35, 0.6, 35), material(0xca8868));
  floor.position.y = -0.3;
  scene.add(floor);

  const rock = new IcosahedronGeometry(1, 1);
  const bands = [0xad654e, 0xd99571, 0xe4b48e].map(material);
  function place(geometry, surface, x, y, z, w, h, d) {
    const mesh = new Mesh(geometry, surface);
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    scene.add(mesh);
    return mesh;
  }
  for (let i = 0; i < 13; i++) {
    const angle = i * Math.PI * 2 / 13;
    const x = 19 * Math.cos(angle), z = 17 * Math.sin(angle) - 2;
    for (let j = 0; j < 3; j++) {
      place(rock, bands[j], x + 0.35 * j, j * 1.14, z, 4 - j * 0.57,
        1.05 + 0.31 * (i % 3), 3.5 - j * 0.28);
    }
  }
  for (let i = 0; i < 11; i++) {
    const angle = i * Math.PI / 10;
    place(rock, bands[i % 3], 3.3 * Math.cos(angle) - 2, 3.9 * Math.sin(angle) + 0.1,
      -11.7 + Math.sin(i * 1.2) * 0.33, 0.94, 1.14, 1.02);
  }

  const quartz = new MeshStandardMaterial({ color: 0xc1b1e6, roughness: 0.27, flatShading: true });
  for (const x of [-6.8, 6.5]) {
    for (let i = -1; i <= 1; i++) {
      place(rock, quartz, x + i * 0.44, 0.35, -3 + i * 0.42, 0.22, 0.64 - Math.abs(i) * 0.18, 0.24)
        .rotation.z = i * 0.34;
    }
  }
  const floaters = Array.from({ length: 3 }, (_, i) =>
    place(rock, quartz, 4.25 + i * 1.36, 2.4, -8.8 - i * 0.6, 0.19, 0.51, 0.19));
  return elapsed => floaters.forEach((mesh, i) => {
    mesh.position.y = 2.4 + 0.27 * Math.sin(elapsed * 0.9 + i);
    mesh.rotation.y = elapsed * 0.22 + i;
  });
}

export function createWorld({ canvas, player, camera, controls, interactions, ui, signal, progress, travel }) {
  const scene = new Scene();
  scene.name = 'Earth';
  const animateBasin = dressBasin(scene);
  const bob = createBob();
  bob.root.position.set(-2.6, 0, 2.65);
  const reaction = createReaction();
  const ring = createReturnRing(ARRIVAL);
  let phase = 'meet';
  const wheel = createWheel({
    canvas, controls, camera,
    onShape: reaction.pop,
    onFinish(shape) {
      phase = 'wet';
      player.root.visible = true;
      potStory.shaped(shape);
    },
  });
  const potStory = createPotStory({ wheel, ring, scene, camera, controls, interactions, player, progress, travel, ui });
  scene.add(wheel.root, bob.root, ring, reaction.sprite);
  const reactionPoint = new Vector3();
  const unregister = [];

  function greet() {
    phase = 'greeting';
    const release = controls.acquire('story');
    void (async () => {
      try {
        await ui.say({ speaker: 'Bob', lines: ['Hiii my name is Bob, nice to meet you :)'] }, signal);
        await ui.say({ kind: 'thought', lines: ["This thing would make a great pot."] }, signal);
        phase = 'pickup';
        ui.objective('Pick up Bob', bob.root.position);
      } catch (error) {
        if (!signal.aborted) console.error('Earth greeting failed', error);
      } finally {
        release();
      }
    })();
  }

  return {
    scene,
    surfaces: { floorHeight: () => 0, walkBounds: WALK_BOUNDS, safeSpawn: ARRIVAL },
    prepare() {},
    enter() {
      player.root.rotation.set(0, Math.PI, 0);
      player.setPose('idle');
      player.teleport(ARRIVAL);
      camera.resetOrbit();
      scene.add(player.root);
      potStory.enter();
      if (canReturn('earth', progress.read())) {
        phase = 'complete';
        bob.root.visible = false;
        return;
      }
      ui.objective('Meet Bob', bob.root.position);
      unregister.push(interactions.register({
        id: 'bob', point: bob.root.position, enabled: () => phase === 'pickup', label: 'Pick up Bob',
        run() {
          phase = 'carry';
          bob.root.position.set(0.01, -0.18, 0.16);
          bob.root.rotation.y = 0.4;
          player.setHeld(bob.root);
          reaction.pop();
          ui.objective('Take Bob to the pottery wheel', wheel.root.position);
        },
      }));
      unregister.push(interactions.register({
        id: 'wheel', point: wheel.root.position, enabled: () => phase === 'carry',
        label: 'Place Bob on the wheel',
        run() {
          phase = 'shape';
          player.setHeld(null);
          player.root.visible = false;
          ui.objective('');
          wheel.start(bob.root);
        },
      }));
    },
    update(dt, { actions }) {
      wheel.keepOutside(player.position);
      if (phase === 'meet' && player.position.distanceToSquared(bob.root.position) <= 4) {
        bob.root.rotation.y = Math.atan2(player.position.x - bob.root.position.x, player.position.z - bob.root.position.z);
        greet();
      }
      wheel.update(dt, actions);
      potStory.update(dt);
      const subject = phase === 'shape' || phase === 'wet' ? wheel.turntable : bob.root;
      subject.getWorldPosition(reactionPoint);
      reactionPoint.add(new Vector3(0.47, phase === 'shape' ? 0.45 : 0.56, 0));
      reaction.update(dt, reactionPoint);
    },
    present(elapsed) {
      animateBasin(elapsed);
      if (phase !== 'shape' && phase !== 'wet') bob.animate(elapsed, phase === 'carry');
    },
    exit() {
      for (const remove of unregister) remove();
      wheel.exit();
      potStory.exit();
      camera.releaseShot();
      player.root.visible = true;
      if (phase === 'carry') {
        player.setHeld(null);
        scene.add(bob.root);
      }
      player.root.removeFromParent();
    },
    dispose() { disposeScene(scene); },
  };
}
