import {
  CircleGeometry, DirectionalLight, HemisphereLight,
  Mesh, MeshBasicMaterial, Scene,
  Vector3,
} from 'three';
import { disposeScene } from '../../runtime/assets.js';
import { createWizard } from '../../shared/actors/wizard.js';
import { addArena, ARENA_SCALE, createShadowMap } from './arena.js';
import { createBoss } from './boss.js';
import { createFinish } from './finish.js';
import { VOID_AFTER_MINIONS, VOID_INTRO } from './lines.js';
import { createMinions } from './minions.js';
import { createDust, createPlanet, createSky, createStars, SUN_DIR } from './space.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FinalShader } from './shader.js';

const ARRIVAL = new Vector3(0, 0, 5);
const WALK_RADIUS = 8.35 * ARENA_SCALE;

function keepInside(position) {
  const radius = Math.hypot(position.x, position.z);
  if (radius <= WALK_RADIUS) return;
  position.x *= WALK_RADIUS / radius;
  position.z *= WALK_RADIUS / radius;
}

export function createWorld(ctx) {
  const { camera, viewCamera, renderer, player, progress, signal, ui, startAtBoss = false, startAtFinisher = false } = ctx;
  const scene = new Scene();
  scene.name = 'Void';
  scene.add(new HemisphereLight(0xe1e5ff, 0x88799d, 1.35));

  const key = new DirectionalLight(0xffeee1, 1.65);
  key.position.set(-4, 6, 3);
  scene.add(key);

  addArena(scene);

  const planet = createPlanet();
  scene.add(planet.group);

  const stars = createStars();
  scene.add(stars);

  const dust = createDust();
  scene.add(dust);

  const wizard = createWizard();
  wizard.position.set(0, 0, -6.25);
  wizard.scale.setScalar(1.95);

  const shadowMap = createShadowMap();
  const shadow = new Mesh(
    new CircleGeometry(0.51, 32).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.42, depthWrite: false }),
  );
  const snapshot = progress.read();
  const skipWave = startAtBoss || startAtFinisher || snapshot.wizard !== 'distant' || snapshot.completed.includes('sun');
  const minions = skipWave ? null : createMinions(scene, keepInside, shadowMap);
  const boss = createBoss(scene, wizard, player, keepInside, shadowMap);
  const finish = createFinish(scene, wizard, ctx, keepInside);
  scene.add(wizard, shadow);

  const postProcess = new ShaderPass(FinalShader);
  postProcess.material.depthTest = false;
  postProcess.material.depthWrite = false;
  const sunPoint = new Vector3();

  let phase = 'arrival';
  let elapsed = 0;
  let disposeSky;

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
    const across = player.position.clone().sub(wizard.position).setY(0);
    if (across.lengthSq() < 0.001) across.set(0, 0, 1);
    across.normalize();
    const lookAt = wizard.position.clone().lerp(player.position, 0.35);
    lookAt.y = 0.98;
    const distance = Math.max(4.3, player.position.distanceTo(wizard.position) + 2.1);
    const eye = new Vector3(across.z, 0, -across.x).multiplyScalar(distance * 0.84)
      .addScaledVector(across, distance * 0.6).add(lookAt);
    eye.y = 1.15;
    camera.shot({ eye, lookAt, seconds: 0.65 });
  }

  return {
    scene,
    postProcess,
    surfaces: {
      floorHeight: () => 0,
      safeSpawn: ARRIVAL,
      walkBounds: { minX: -WALK_RADIUS, maxX: WALK_RADIUS, minZ: -WALK_RADIUS, maxZ: WALK_RADIUS },
    },
    prepare() {
      disposeSky = createSky(renderer, scene);
    },
    enter() {
      player.teleport(ARRIVAL);
      player.root.rotation.set(0, Math.PI, 0);
      player.setPose('idle');
      camera.resetOrbit({ pitch: 0.24, distance: 7.6 });
      scene.add(player.root);
      if (finish.enter()) phase = 'finisher';
      else if (startAtFinisher) {
        phase = 'boss';
        boss.stageFinisher();
        frameFinisher();
        ui.bossHealth(boss.health, { max: boss.maxHealth, finisherReady: true });
      } else if (skipWave) startBoss();
    },
    update(dt, { mode, actions }) {
      keepInside(player.position);
      boss.updateFeedback(dt);
      if (phase === 'finisher') finish.update(dt);
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
          finish.start();
        } else if (boss.health !== previousHealth) {
          if (boss.finisherReady) frameFinisher();
          ui.bossHealth(boss.health, { max: boss.maxHealth, finisherReady: boss.finisherReady });
        }
      }
    },
    present(time) {
      const { uAspect, uSun, uSunVis } = postProcess.uniforms;
      viewCamera.updateMatrixWorld();
      sunPoint.copy(SUN_DIR).multiplyScalar(100).add(viewCamera.position).project(viewCamera);
      uAspect.value = viewCamera.aspect;
      uSun.value.set(sunPoint.x * 0.5 + 0.5, sunPoint.y * 0.5 + 0.5);
      uSunVis.value = Number(Math.abs(sunPoint.x) < 1 && Math.abs(sunPoint.y) < 1 && Math.abs(sunPoint.z) < 1);
      planet.uniforms.uTime.value = time;
      dust.material.uniforms.uScroll.value = time * 5;
      stars.material.uniforms.uTime.value = time;
      stars.material.uniforms.uDpr.value = renderer.getPixelRatio();
      const { x, y, z } = player.position;
      shadow.position.set(x, 0.015, z);
      shadow.material.opacity = 0.68 / (1 + y);
      shadow.scale.setScalar(1 + y * 0.18);
      boss.animate(time, phase === 'finisher' && Math.abs(wizard.rotation.z) > 0.05);
    },
    exit() {
      finish.exit();
      camera.releaseShot();
      player.root.removeFromParent();
    },
    dispose() {
      postProcess.dispose();
      disposeSky?.();
      disposeSky = undefined;
      disposeScene(scene);
    },
  };
}
