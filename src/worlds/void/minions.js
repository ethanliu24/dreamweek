import {
  BoxGeometry, BufferGeometry, CanvasTexture, CircleGeometry, Group, LineBasicMaterial, LineSegments,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, Sprite, SpriteMaterial, Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const TELEGRAPH_TIME = 0.5;
const RECOVER_TIME = 0.85;
const DISSOLVE_TIME = 0.32;
const HOVER_HEIGHT = 0.61;
const STRIKE_REACH = 1.5;
const STRIKE_ARC = Math.cos(MathUtils.degToRad(55));
const CONTACT_RADIUS = 0.58;
const CUBE_HALF_HEIGHT = 0.32;
const PLAYER_HEIGHT = 0.9;
const DAMAGE_TEXT_TIME = 0.62;

function createDamageText(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  const texture = new CanvasTexture(canvas);
  const sprite = new Sprite(new SpriteMaterial({ map: texture, depthTest: false, depthWrite: false, toneMapped: false }));
  sprite.visible = false;
  scene.add(sprite);
  let remaining = 0;
  let height = 0;

  return {
    show(position) {
      const damage = MathUtils.randInt(300, 800);
      const critical = Math.random() < 0.15;
      const label = critical ? `${damage}` : String(damage);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = 'bold 46px system-ui';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.lineWidth = 7;
      context.strokeStyle = '#201629';
      context.fillStyle = critical ? '#ffd166' : '#fff5ff';
      context.strokeText(label, 128, 48);
      context.fillText(label, 128, 48);
      texture.needsUpdate = true;
      sprite.scale.set(critical ? 1.9 : 1.6, critical ? 0.71 : 0.6, 1);
      sprite.position.copy(position);
      height = sprite.position.y += 1.05;
      sprite.material.opacity = 1;
      sprite.visible = true;
      remaining = DAMAGE_TEXT_TIME;
    },
    update(dt) {
      if (!sprite.visible) return;
      remaining = Math.max(0, remaining - dt);
      sprite.position.y = height + (DAMAGE_TEXT_TIME - remaining) * 0.85;
      sprite.material.opacity = Math.min(1, remaining / 0.24);
      sprite.visible = remaining > 0;
    },
  };
}

function createRuneGeometry() {
  const outline = [
    [0, 0.16], [0.13, 0.03], [0.13, -0.03], [0, -0.16],
    [0, -0.16], [-0.13, -0.03], [-0.13, 0.03], [0, 0.16],
  ];
  const axes = [new Vector3(0, 1, 0), new Vector3(1, 0, 0)];
  const faces = [[0, 0], [0, Math.PI / 2], [0, Math.PI], [0, -Math.PI / 2],
    [1, Math.PI / 2], [1, -Math.PI / 2]];
  return new BufferGeometry().setFromPoints(faces.flatMap(([axis, angle]) =>
    outline.map(([x, y]) => new Vector3(x, y, 0.252).applyAxisAngle(axes[axis], angle)),
  ));
}

export function createMinions(scene, keepInside) {
  const core = new MeshBasicMaterial({ color: 0xb572ff });
  const shadowMaterial = new MeshBasicMaterial({ color: 0x332543, transparent: true, opacity: 0.28, depthWrite: false });
  const box = new RoundedBoxGeometry(0.5, 0.5, 0.5, 1, 0.028);
  const runeGeometry = createRuneGeometry();
  const sliver = new BoxGeometry(0.08, 0.32, 0.07);
  const shadowGeometry = new CircleGeometry(0.29, 24).rotateX(-Math.PI / 2);
  const idleViolet = 0x9b57e2;
  const brightViolet = 0xf6b7ff;

  function createCube(x, z, index) {
    const root = new Group();
    const cube = new Mesh(box, new MeshStandardMaterial({
      color: 0x332543, roughness: 0.4, metalness: 0.14, emissive: 0xe9caff, emissiveIntensity: 0,
    }));
    const runes = new LineSegments(runeGeometry, new LineBasicMaterial({ color: idleViolet }));
    cube.add(runes);
    const damageText = createDamageText(scene);
    cube.rotation.set(0.2, index, 0.2);
    const shadow = new Mesh(shadowGeometry, shadowMaterial);
    shadow.position.y = 0.014;
    const pieces = Array.from({ length: 3 }, () => {
      const piece = new Mesh(sliver, core);
      piece.visible = false;
      return piece;
    });
    root.position.set(x, 0, z);
    cube.position.y = HOVER_HEIGHT;
    root.add(shadow, cube, ...pieces);
    scene.add(root);

    const home = root.position.clone();
    const from = new Vector3();
    const target = new Vector3();
    const direction = new Vector3();
    const offset = new Vector3();
    let phase = 'hover';
    let time = 0;
    let hoverTime = 1.3 + index * 0.55;
    let chargeTime = 0;
    let age = index;
    let hits = 0;
    let lastSwingId;
    let hitTime = 0;
    let madeContact = false;

    function start(next) {
      phase = next;
      time = 0;
    }

    function update(dt, player, strike) {
      damageText.update(dt);
      time += dt;
      if (phase === 'defeated') {
        const amount = Math.min(time / DISSOLVE_TIME, 1);
        for (const [i, piece] of pieces.entries()) {
          const angle = i * Math.PI * 2 / pieces.length;
          piece.position.set(Math.cos(angle) * amount * 0.42, HOVER_HEIGHT + amount * 0.24, Math.sin(angle) * amount * 0.42);
          piece.rotation.set(angle + amount * 2, 0, amount * 2);
          piece.scale.setScalar(1 - amount);
          piece.visible = amount < 1;
        }
        return;
      }

      age += dt;
      if (phase === 'hover') {
        cube.position.y = HOVER_HEIGHT + Math.sin(age * 4) * 0.06;
        if (time >= hoverTime) start('telegraph');
      } else if (phase === 'telegraph' && time >= TELEGRAPH_TIME) {
        from.copy(root.position);
        target.copy(player.position).setY(0);
        direction.subVectors(target, from);
        chargeTime = MathUtils.clamp(direction.length() / 11, 0.27, 0.85);
        if (direction.lengthSq() === 0) direction.set(0, 0, 1);
        direction.normalize();
        madeContact = false;
        start('charge');
      } else if (phase === 'charge') {
        root.position.lerpVectors(from, target, Math.min(time / chargeTime, 1));
      } else if (phase === 'recover') {
        root.position.lerpVectors(from, target, MathUtils.smoothstep(time, 0, RECOVER_TIME));
        if (time >= RECOVER_TIME) {
          hoverTime = 1.45 + index * 0.32;
          start('hover');
        }
      }

      const windingUp = phase === 'telegraph';
      cube.rotation.x += dt * 0.85;
      cube.rotation.y += dt * (windingUp ? 14 : phase === 'charge' ? 6 : 1.25);
      hitTime = Math.max(0, hitTime - dt);
      cube.material.emissiveIntensity = hitTime * 12;
      cube.scale.setScalar(1 + hitTime * 1.5);
      runes.material.color.setHex(hitTime > 0 || windingUp ? brightViolet : idleViolet);

      offset.subVectors(root.position, player.position).setY(0);
      const distance = offset.length();
      const withinHeight = Math.abs(player.position.y + 0.48 - cube.position.y) <= 0.54;
      if (strike.active && lastSwingId !== strike.swingId && withinHeight &&
          distance <= STRIKE_REACH && strike.forward.dot(offset) >= STRIKE_ARC * distance) {
        lastSwingId = strike.swingId;
        hits++;
        hitTime = 0.14;
        damageText.show(root.position);
        if (hits === 3) {
          cube.visible = false;
          shadow.visible = false;
          start('defeated');
          return;
        }
      }

      const bodyOverlap = player.position.y < cube.position.y + CUBE_HALF_HEIGHT &&
        player.position.y + PLAYER_HEIGHT > cube.position.y - CUBE_HALF_HEIGHT;
      if (bodyOverlap && distance <= CONTACT_RADIUS) {
        if (distance > 0) offset.multiplyScalar(-1 / distance);
        else offset.copy(strike.forward).negate();
        player.position.addScaledVector(offset, CONTACT_RADIUS - distance);
        keepInside(player.position);
        if (phase === 'charge' && !madeContact) {
          madeContact = true;
          player.knockback(direction, 0.7);
        }
      }
      if (phase === 'charge' && time >= chargeTime) {
        from.copy(root.position);
        target.copy(from).addScaledVector(direction, -1.12).lerp(home, 0.25);
        keepInside(target);
        start('recover');
      }
    }

    return { update, get defeated() { return phase === 'defeated'; } };
  }

  const positions = [
    [0, 1.75], [-2.8, 1], [2.8, 1], [-4, -1.5], [4, -1.5],
    [-2.4, -3.8], [2.4, -3.8], [0, -2.2],
  ];
  const cubes = positions.map(([x, z], i) => createCube(x, z, i));
  return {
    update(dt, player) {
      const strike = player.strikeWindow();
      for (const cube of cubes) cube.update(dt, player, strike);
      return cubes.every(cube => cube.defeated);
    },
  };
}
