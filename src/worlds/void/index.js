import {
  CircleGeometry, Color, DirectionalLight, HemisphereLight, LatheGeometry,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, RingGeometry, Scene, ShaderMaterial,
  SphereGeometry, Vector2, Vector3,
} from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { createWizard } from '../../shared/actors/wizard.js';
import { createBoss } from './boss.js';
import { VOID_AFTER_MINIONS, VOID_INTRO } from './lines.js';
import { createMinions } from './minions.js';

const ARRIVAL = new Vector3(0, 0, 5);
const ARENA_SCALE = 1.1;
const WALK_RADIUS = 8.35 * ARENA_SCALE;

function keepInside(position) {
  const radius = Math.hypot(position.x, position.z);
  if (radius <= WALK_RADIUS) return;
  position.x *= WALK_RADIUS / radius;
  position.z *= WALK_RADIUS / radius;
}

function addArena(scene) {
  const profile = [
    [0, -0.57], [7.78, -0.57], [8.54, -0.44], [8.87, -0.29],
    [9, -0.14], [8.96, -0.06], [8.77, 0], [0, 0],
  ].map(([radius, height]) => new Vector2(radius, height));
  const disc = new LatheGeometry(profile, 72);
  disc.scale(ARENA_SCALE, 1, ARENA_SCALE);
  const points = disc.attributes.position;
  const undersideColors = [];
  const lavender = new Color(0xac8fd0);
  const white = new Color(0xe4deef);
  const shade = new Color();
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i);
    const z = points.getZ(i);
    const angle = Math.atan2(z, x);
    const ripple = 1 + 0.016 * Math.cos(angle * 3) + 0.01 * Math.sin(angle * 5);
    points.setX(i, x * ripple);
    points.setZ(i, z * ripple);
    shade.lerpColors(lavender, white, 1 + points.getY(i) / 0.57);
    undersideColors.push(shade.r, shade.g, shade.b);
  }
  const colors = points.clone();
  colors.array.set(undersideColors);
  disc.setAttribute('color', colors);
  scene.add(new Mesh(disc, new MeshStandardMaterial({ vertexColors: true, roughness: 0.68 })));

  const engraving = new MeshBasicMaterial({ color: 0xc9bfdb, transparent: true, opacity: 0.38, depthWrite: false });
  for (const [inner, outer] of [[1.05, 1.08], [5.78, 5.81], [8.38, 8.42]]) {
    const ring = new Mesh(new RingGeometry(inner, outer, 72).rotateX(-Math.PI / 2), engraving);
    ring.scale.set(ARENA_SCALE, 1, ARENA_SCALE);
    ring.position.y = 0.008;
    scene.add(ring);
  }
}

function addPlanet(scene) {
  const material = new ShaderMaterial({
    vertexShader: `
      varying vec3 vLocal;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 eye = modelViewMatrix * vec4(position, 1.0);
        vLocal = normal;
        vNormal = normalMatrix * normal;
        vView = -eye.xyz;
        gl_Position = projectionMatrix * eye;
      }
    `,
    fragmentShader: `
      varying vec3 vLocal;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 local = normalize(vLocal);
        float latitude = dot(local, normalize(vec3(0.24, 1.0, 0.0)));
        float band = 0.5 + 0.5 * sin(23.0 * latitude + sin(local.x * 8.0) * 0.4);
        float limb = 1.0 - max(0.0, dot(normalize(vNormal), normalize(vView)));
        float glow = pow(limb, 4.0) * smoothstep(-0.85, 0.85, -local.x + local.y * 0.4);
        vec3 ink = mix(vec3(0.014, 0.006, 0.034), vec3(0.045, 0.013, 0.086), band);
        gl_FragColor = vec4(ink + vec3(0.48, 0.065, 0.39) * glow, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
  const planet = new Mesh(new SphereGeometry(23, 48, 32), material);
  planet.position.set(17, 6, -48);
  scene.add(planet);
}

export function createWorld({ camera, player, progress, signal, ui, startAtBoss = false }) {
  const scene = new Scene();
  scene.name = 'Void';
  scene.background = new Color(0x070511);
  scene.add(new HemisphereLight(0xe7d6ff, 0x6c4b94, 1.65));
  const key = new DirectionalLight(0xf3e8ff, 1.9);
  key.position.set(4, 7, 4);
  scene.add(key);
  addArena(scene);
  addPlanet(scene);
  const wizard = createWizard();
  wizard.position.set(0, 0, -6.25);
  wizard.scale.setScalar(1.95);
  const shadow = new Mesh(
    new CircleGeometry(0.39, 24).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({ color: 0x352641, transparent: true, opacity: 0.42, depthWrite: false }),
  );
  const skipWave = startAtBoss || progress.read().completed.includes('sun');
  const minions = skipWave ? null : createMinions(scene, keepInside);
  const boss = createBoss(scene, wizard, player, keepInside);
  scene.add(wizard, shadow);

  let phase = 'arrival';
  let elapsed = 0;

  function say(lines, done) {
    void ui.say({ speaker: 'Frog Wizard', lines }, signal).then(() => {
      if (!signal.aborted) done();
    }).catch(error => {
      if (!signal.aborted) console.error('Void dialogue failed', error);
    });
  }

  function startBoss() {
    phase = 'boss';
    boss.start();
    ui.bossHealth(boss.health, { max: boss.maxHealth });
  }

  function frameFinisher() {
    const eye = new Vector3(0.65, 0.24, 3.15)
      .applyAxisAngle(new Vector3(0, 1, 0), wizard.rotation.y)
      .add(wizard.position);
    const lookAt = wizard.position.clone().add(new Vector3(0, 1.05, 0));
    camera.shot({ eye, lookAt, seconds: 0.65 });
  }

  return {
    scene,
    surfaces: {
      floorHeight: () => 0,
      safeSpawn: ARRIVAL,
      walkBounds: { minX: -WALK_RADIUS, maxX: WALK_RADIUS, minZ: -WALK_RADIUS, maxZ: WALK_RADIUS },
    },
    prepare() {},
    enter() {
      player.teleport(ARRIVAL);
      player.root.rotation.set(0, Math.PI, 0);
      player.setPose('idle');
      camera.resetOrbit({ pitch: 0.3, distance: 7 });
      scene.add(player.root);
      if (skipWave) startBoss();
    },
    update(dt, { mode, actions }) {
      keepInside(player.position);
      boss.updateFeedback(dt);
      if (mode !== 'explore') return;
      elapsed += dt;
      if (phase === 'arrival' && elapsed >= 0.5) {
        phase = 'intro';
        say(VOID_INTRO, () => {
          phase = 'wave';
          ui.objective('Defeat the cubes with the Sword');
        });
      } else if (phase === 'wave' && minions.update(dt, player)) {
        phase = 'settling';
        ui.objective(null);
        elapsed = 0;
      } else if (phase === 'settling') {
        minions.update(dt, player);
        if (elapsed < 0.65) return;
        phase = 'reaction';
        say(VOID_AFTER_MINIONS, startBoss);
      } else if (phase === 'boss') {
        const previousHealth = boss.health;
        if (boss.update(dt, actions.ultimate)) {
          phase = 'finisher';
          ui.bossHealth(null);
          camera.releaseShot();
        } else if (boss.health !== previousHealth) {
          if (boss.finisherReady) frameFinisher();
          ui.bossHealth(boss.health, { max: boss.maxHealth, finisherReady: boss.finisherReady });
        }
      }
    },
    present() {
      const { x, y, z } = player.position;
      shadow.position.set(x, 0.015, z);
      shadow.material.opacity = 0.42 / (1 + y);
      if (phase === 'arrival' || phase === 'intro') {
        wizard.scale.y = wizard.scale.x * (1 + 0.055 * Math.sin(Math.PI * Math.min(elapsed, 0.5) / 0.5));
      }
    },
    exit() {
      camera.releaseShot();
      player.root.removeFromParent();
    },
    dispose() { disposeScene(scene); },
  };
}
