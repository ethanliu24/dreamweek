import {
  CylinderGeometry, MathUtils, Mesh, MeshBasicMaterial, RingGeometry, SphereGeometry, Vector3,
} from 'three';
import { createHitFeedback } from './hit-feedback.js';
import { addWizardCombatPose } from '../../shared/actors/wizard.js';

const ATTACKS = [
  { name: 'bounce', windup: 0.72, duration: 1.22, recovery: 0.85 },
  { name: 'burst', windup: 0.65, duration: 1.25, recovery: 0.72 },
  { name: 'tongue', windup: 0.62, duration: 0.78, recovery: 0.85 },
];
const FINISHER_HP = 10;
const MAX_HEALTH = 300;
const SWORD_DAMAGE = 10;
const ATTACK_KNOCKBACK = 5;
const BODY_RADIUS = 0.96;
const STRIKE_ARC = Math.cos(MathUtils.degToRad(55));

export function createBoss(scene, wizard, player, keepInside) {
  const feedback = createHitFeedback(scene);
  const pose = addWizardCombatPose(wizard);
  const ring = new Mesh(new RingGeometry(0.84, 1, 48).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({ color: 0xa454ed, transparent: true, depthWrite: false }));
  const orb = new Mesh(new SphereGeometry(0.2, 16, 10), new MeshBasicMaterial({ color: 0xb04cfa }));
  const tongue = new Mesh(new CylinderGeometry(0.11, 0.15, 1, 12).rotateX(Math.PI / 2),
    new MeshBasicMaterial({ color: 0xe461a7 }));
  const shadow = new Mesh(new RingGeometry(0, 0.65, 24).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({ color: 0x342540, transparent: true, opacity: 0.28, depthWrite: false }));
  scene.add(ring, orb, tongue, shadow);

  const from = new Vector3();
  const target = new Vector3();
  const forward = new Vector3(0, 0, 1);
  const direction = new Vector3();
  const offset = new Vector3();
  let phase = 'waiting';
  let elapsed = 0;
  let attackIndex = 0;
  let health = MAX_HEALTH;
  let lastSwing;
  let hitTime = 0;
  let hitPlayer = false;

  function hideAttacks() {
    ring.visible = orb.visible = tongue.visible = false;
  }
  hideAttacks();
  shadow.visible = false;
  pose.set();

  function enter(next) {
    phase = next;
    elapsed = 0;
  }

  function aim() {
    offset.subVectors(player.position, wizard.position).setY(0);
    if (offset.lengthSq() > 0.001) {
      forward.copy(offset).normalize();
      wizard.rotation.y = Math.atan2(forward.x, forward.z);
    }
  }

  function strikePlayer(push) {
    if (hitPlayer) return;
    hitPlayer = true;
    player.knockback(push, ATTACK_KNOCKBACK);
  }

  function windup(attack) {
    aim();
    const amount = MathUtils.smoothstep(elapsed, 0, attack.windup);
    if (attack.name === 'bounce') pose.set({ crouch: amount });
    if (attack.name === 'burst') {
      pose.set({ cast: amount });
      pose.hand.getWorldPosition(orb.position);
      orb.position.y += 0.22;
      orb.scale.setScalar(0.3 + amount * 0.85);
      orb.visible = true;
    }
    if (attack.name === 'tongue') pose.set({ open: amount });
    if (elapsed < attack.windup) return;

    hitPlayer = false;
    from.copy(wizard.position);
    target.copy(player.position).setY(0).lerp(from, 0.15);
    if (attack.name === 'burst') {
      from.copy(orb.position);
      direction.subVectors(player.position, from);
      direction.y += 0.55;
      direction.normalize();
    }
    enter('attack');
  }

  function attackMove(attack) {
    if (attack.name === 'bounce') {
      const landTime = 0.56;
      const jump = Math.min(elapsed / landTime, 1);
      wizard.position.lerpVectors(from, target, jump);
      wizard.position.y = Math.sin(jump * Math.PI) * 1.75;
      const wave = Math.max(0, (elapsed - landTime) / (attack.duration - landTime));
      pose.set({ crouch: jump === 1 ? 0.8 * Math.max(0, 1 - wave * 4) : 0 });
      if (elapsed >= landTime) {
        const radius = 0.6 + wave * 2.8;
        ring.position.copy(target).setY(0.035);
        ring.scale.set(radius, 1, radius);
        ring.material.opacity = Math.max(0, 1 - wave * 0.78);
        ring.visible = true;
        offset.subVectors(player.position, target).setY(0);
        if (player.position.y < 0.25 && Math.abs(offset.length() - radius) <= 0.52) {
          strikePlayer(offset.lengthSq() > 0.001 ? offset : forward);
        }
      }
    } else if (attack.name === 'burst') {
      pose.set({ cast: 1 - MathUtils.smoothstep(elapsed, 0, 0.45) });
      orb.position.copy(from).addScaledVector(direction, elapsed * 7.8);
      offset.subVectors(player.position, orb.position);
      offset.y += 0.55;
      if (offset.lengthSq() < 0.5 ** 2) {
        strikePlayer(direction);
        orb.visible = false;
      }
    } else {
      pose.set({ open: 1 });
      const length = 3.15 * Math.min(elapsed / 0.14, 1, Math.max(0, (attack.duration - elapsed) / 0.22));
      pose.mouth.getWorldPosition(tongue.position);
      offset.subVectors(player.position, tongue.position).setY(0);
      const along = offset.dot(forward);
      if (player.position.y < 0.74 && along >= 0 && along <= length + 0.18 &&
          offset.addScaledVector(forward, -along).lengthSq() < 0.39 ** 2) strikePlayer(forward);
      tongue.position.addScaledVector(forward, length / 2);
      tongue.rotation.y = wizard.rotation.y;
      tongue.scale.z = length;
      tongue.visible = length > 0;
    }

    if (elapsed >= attack.duration) {
      hideAttacks();
      wizard.position.y = 0;
      enter('recovery');
    }
  }

  function resolveContact(dt) {
    const strike = player.strikeWindow();
    const height = player.position.y - wizard.position.y;
    offset.subVectors(wizard.position, player.position).setY(0);
    const distance = offset.length();
    if (strike.active && strike.swingId !== lastSwing && height >= -0.65 && height < 1.15 &&
        distance <= 1.5 && strike.forward.dot(offset) >= STRIKE_ARC * distance) {
      lastSwing = strike.swingId;
      health = Math.max(FINISHER_HP, health - SWORD_DAMAGE);
      hitTime = 0.18;
      feedback.show(wizard.position, 0.68, strike.forward);
    }
    if (height > -0.8 && height < 0.95 && distance < BODY_RADIUS) {
      if (distance > 0.001) offset.multiplyScalar(-1 / distance);
      else offset.copy(forward);
      player.position.addScaledVector(offset, BODY_RADIUS - distance);
      keepInside(player.position);
    }
    hitTime = Math.max(0, hitTime - dt);
  }

  return {
    maxHealth: MAX_HEALTH,
    updateFeedback: feedback.update,
    get health() { return health; },
    get finisherReady() { return phase === 'ready'; },
    stageFinisher() {
      wizard.position.set(0, 0, 1.6);
      health = FINISHER_HP;
      pose.set({ crouch: 0.35 });
      enter('ready');
    },
    start() {
      from.copy(wizard.position);
      target.set(0, 0, -1.8);
      shadow.visible = true;
      enter('approach');
    },
    update(dt, ultimate) {
      if (phase === 'ready') {
        if (!ultimate) return false;
        enter('finisher');
        return true;
      }
      elapsed += dt;
      const attack = ATTACKS[attackIndex];
      if (phase === 'approach') {
        aim();
        const amount = MathUtils.smoothstep(elapsed, 0, 0.95);
        wizard.position.lerpVectors(from, target, amount);
        wizard.position.y = Math.abs(Math.sin(amount * Math.PI * 3)) * 0.15;
        if (elapsed >= 0.95) enter('windup');
      } else {
        pose.set({ hit: hitTime / 0.18 });
        if (phase === 'windup') windup(attack);
        else if (phase === 'attack') attackMove(attack);
        else if (phase === 'recovery' && elapsed >= attack.recovery) {
          attackIndex = (attackIndex + 1) % ATTACKS.length;
          enter('windup');
        }
      }
      resolveContact(dt);
      shadow.position.copy(wizard.position).setY(0.022);
      if (health === FINISHER_HP) {
        enter('ready');
        hideAttacks();
        wizard.position.y = 0;
        pose.set({ crouch: 0.35 });
      }
      return false;
    },
  };
}
