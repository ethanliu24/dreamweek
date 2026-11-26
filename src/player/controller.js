import { Group, Vector3, MathUtils } from 'three';
import { createSpirit } from './spirit.js';

const SPEED = 4;
const JUMP_SPEED = 5.6;
const GRAVITY = 14;
const SWING_DURATION = 0.45;
const STRIKE_START = 0.12;
const STRIKE_END = 0.25;
const KNOCKBACK_DAMPING = 14;
const EPSILON = 1e-6;

function withinPlatform(platform, x, z) {
  return x >= platform.minX && x <= platform.maxX && z >= platform.minZ && z <= platform.maxZ;
}

function platformTop(platforms, x, z, fromY, toY) {
  let top = -Infinity;
  for (const platform of platforms) {
    if (withinPlatform(platform, x, z) &&
        (platform.previousY ?? platform.y) <= fromY + EPSILON && platform.y >= toY - EPSILON) {
      top = Math.max(top, platform.y);
    }
  }
  return top;
}

function swingAngle(time) {
  if (time < STRIKE_START) return MathUtils.smoothstep(time, 0, STRIKE_START) * 1.4;
  if (time <= STRIKE_END) return MathUtils.lerp(1.4, -1.65, MathUtils.smoothstep(time, STRIKE_START, STRIKE_END));
  return -1.65 * (1 - MathUtils.smoothstep(time, STRIKE_END, SWING_DURATION));
}

export function createPlayer() {
  const root = new Group();
  root.name = 'Spirit';
  const position = root.position;
  const spirit = createSpirit();
  root.add(spirit.model);

  const velocity = new Vector3();
  const pushVelocity = new Vector3();
  const move = new Vector3();
  let teleportRevision = 0;
  let held = null;
  let pose = 'idle';
  let squash = 0;
  let swingTime = SWING_DURATION;
  let swingId = 0;
  let exploring = true;

  function present(dt, moving) {
    const yaw = root.rotation.y;
    spirit.update(dt, {
      localX: moving ? velocity.x * Math.cos(yaw) - velocity.z * Math.sin(yaw) : 0,
      localZ: moving ? velocity.x * Math.sin(yaw) + velocity.z * Math.cos(yaw) : 0,
      rise: velocity.y,
      squash,
      pose,
      holding: held !== null,
      heldKind: held?.userData.kind,
      swing: swingTime < SWING_DURATION ? swingAngle(swingTime) : null,
    });
  }

  function teleport(point) {
    teleportRevision++;
    position.copy(point);
    velocity.set(0, 0, 0);
    pushVelocity.set(0, 0, 0);
    swingTime = SWING_DURATION;
    squash = 0;
    spirit.reset();
    present(0, false);
  }

  // Platforms are one-way tops { y, minX, maxX, minZ, maxZ }.
  // Moving surfaces advance once per step and record previousY for landing checks.
  // walkBounds uses the same X/Z extents; floorHeight describes a continuous floor.
  function step(dt, actions, { floorHeight, platforms = [], advancePlatforms, walkBounds, safeSpawn }) {
    if (!Number.isFinite(position.x) || !Number.isFinite(position.y) || !Number.isFinite(position.z)) {
      teleport(safeSpawn);
    }

    squash *= Math.exp(-11 * dt);
    exploring = (actions.mode ?? 'explore') === 'explore';
    const startY = position.y;
    const support = velocity.y <= 0 && platforms.find(platform =>
      Math.abs(platform.y - startY) <= EPSILON && withinPlatform(platform, position.x, position.z),
    );
    if (advancePlatforms) {
      advancePlatforms(dt);
      if (support) position.y = support.y;
    }
    if (!exploring) {
      present(dt, false);
      return;
    }

    const previousFloor = floorHeight(position.x, position.z);
    if (position.y < previousFloor - EPSILON) {
      teleport(safeSpawn);
      return;
    }
    const previousY = position.y;
    const onFloor = velocity.y <= 0 && Math.abs(previousY - previousFloor) <= EPSILON;
    const onPlatform = Boolean(support);
    const jumping = actions.jump && (onFloor || onPlatform);
    if (jumping) {
      velocity.y = JUMP_SPEED;
      squash = 0;
    }

    const x = actions.moveX ?? 0;
    const z = actions.moveZ ?? 0;
    const yaw = actions.yaw ?? 0;
    const scale = SPEED / Math.max(1, Math.hypot(x, z));
    move.set((x * Math.cos(yaw) + z * Math.sin(yaw)) * scale, 0,
      (z * Math.cos(yaw) - x * Math.sin(yaw)) * scale);
    const blend = 1 - Math.exp(-12 * dt);
    velocity.x = MathUtils.lerp(velocity.x, move.x, blend);
    velocity.z = MathUtils.lerp(velocity.z, move.z, blend);

    if (swingTime < SWING_DURATION) swingTime += dt;
    if (swingTime >= SWING_DURATION - EPSILON) {
      swingTime = SWING_DURATION;
      if (move.lengthSq() > EPSILON) {
        const target = Math.atan2(move.x, move.z) - root.rotation.y;
        root.rotation.y += Math.atan2(Math.sin(target), Math.cos(target)) * (1 - Math.exp(-18 * dt));
      }
      if (actions.attack && held?.userData.kind === 'sword') {
        swingTime = 0;
        swingId++;
      }
    }

    const pushDecay = Math.exp(-KNOCKBACK_DAMPING * dt);
    const pushStep = (1 - pushDecay) / KNOCKBACK_DAMPING;
    position.x = MathUtils.clamp(position.x + velocity.x * dt + pushVelocity.x * pushStep, walkBounds.minX, walkBounds.maxX);
    position.z = MathUtils.clamp(position.z + velocity.z * dt + pushVelocity.z * pushStep, walkBounds.minZ, walkBounds.maxZ);
    pushVelocity.multiplyScalar(pushDecay);
    velocity.y -= GRAVITY * dt;
    const nextY = previousY + velocity.y * dt;
    if (velocity.y <= 0) {
      const top = platformTop(platforms, position.x, position.z, startY, nextY);
      const floor = floorHeight(position.x, position.z);
      const landing = Math.max(top, floor);
      if (nextY <= landing || (onFloor && !jumping && Number.isFinite(floor))) {
        position.y = landing;
        if (!onFloor && !onPlatform) squash = Math.min(0.17, -velocity.y * 0.023);
        velocity.y = 0;
      } else {
        position.y = nextY;
      }
    } else {
      position.y = nextY;
    }

    present(dt, true);
  }

  function setHeld(prop) {
    if (held === prop) return;
    held?.removeFromParent();
    held = prop;
    swingTime = SWING_DURATION;
    // Props supply their grip-local transform. A sword marks userData.kind as 'sword'.
    if (held) spirit.grip.add(held);
    present(0, false);
  }

  return {
    root, position, teleport, step, setHeld,
    get teleportRevision() { return teleportRevision; },
    setPose(name) { pose = name; },
    knockback(direction, distance) {
      pushVelocity.set(direction.x, 0, direction.z).normalize().multiplyScalar(distance * KNOCKBACK_DAMPING);
    },
    attachPoint(name) { return name === 'grip' ? spirit.grip : undefined; },
    strikeWindow() {
      return {
        swingId,
        active: exploring && swingTime >= STRIKE_START - EPSILON && swingTime <= STRIKE_END + EPSILON,
        forward: new Vector3(Math.sin(root.rotation.y), 0, Math.cos(root.rotation.y)),
      };
    },
    dispose() {
      setHeld(null);
      root.removeFromParent();
      spirit.dispose();
    },
  };
}
