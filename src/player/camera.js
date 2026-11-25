import { MathUtils, Ray, Spherical, Vector3 } from 'three';

const DEFAULT_PITCH = Math.atan2(2.5 - 0.65, 4.8);
const FOLLOW_DISTANCE = Math.hypot(4.8, 2.5 - 0.65);
const FOLLOW_HEIGHT = 0.65;
const YAW_PER_PIXEL = 0.003;
const PITCH_PER_PIXEL = 0.0022;
const EYE_DAMPING = 7;
const TARGET_DAMPING = 12;
const RETURN_SECONDS = 0.45;

function angleDelta(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export function createCameraRig(camera, { obstructions = [] } = {}) {
  const bounds = obstructions.map(box => box.clone().expandByScalar(0.15));
  const focus = new Vector3();
  const eyeAnchor = new Vector3();
  const followTarget = new Vector3();
  const viewTarget = new Vector3();
  const offset = new Vector3();
  const direction = new Vector3();
  const hit = new Vector3();
  const ray = new Ray(viewTarget, direction);
  const view = new Spherical();
  const destination = new Spherical();
  const transitionTarget = new Vector3();
  const transitionView = new Spherical();
  let player;
  let teleportRevision;
  let yaw = 0;
  let pitch = DEFAULT_PITCH;
  let orbitYaw = 0;
  let orbitPitch = DEFAULT_PITCH;
  let distance = FOLLOW_DISTANCE;
  let scriptedShot = null;
  let elapsed = 0;
  let duration = 0;

  camera.fov = 48;
  camera.updateProjectionMatrix();

  function reset() {
    teleportRevision = player.teleportRevision;
    focus.copy(player.position);
    focus.y += FOLLOW_HEIGHT;
    eyeAnchor.copy(focus);
    orbitYaw = yaw;
    orbitPitch = pitch;
    distance = FOLLOW_DISTANCE;
    scriptedShot = null;
    duration = 0;
  }

  function beginTransition(seconds) {
    transitionTarget.copy(viewTarget);
    transitionView.copy(view);
    duration = seconds;
    elapsed = 0;
  }

  function update(dt) {
    if (!player) return;
    if (teleportRevision !== player.teleportRevision) reset();

    const eyeBlend = 1 - Math.exp(-EYE_DAMPING * dt);
    const targetBlend = 1 - Math.exp(-TARGET_DAMPING * dt);
    followTarget.copy(player.position);
    followTarget.y += FOLLOW_HEIGHT;
    focus.lerp(followTarget, targetBlend);
    eyeAnchor.lerp(followTarget, eyeBlend);
    orbitYaw += angleDelta(orbitYaw, yaw) * eyeBlend;
    orbitPitch = MathUtils.lerp(orbitPitch, pitch, eyeBlend);

    if (scriptedShot) {
      offset.subVectors(scriptedShot.eye, scriptedShot.lookAt);
      destination.setFromVector3(offset);
    } else {
      offset.setFromSphericalCoords(FOLLOW_DISTANCE, Math.PI / 2 - orbitPitch, orbitYaw);
      offset.add(eyeAnchor).sub(focus);
      destination.setFromVector3(offset);
    }

    elapsed = Math.min(duration, elapsed + dt);
    const progress = duration > 0 ? MathUtils.smoothstep(elapsed, 0, duration) : 1;
    viewTarget.lerpVectors(transitionTarget, scriptedShot?.lookAt ?? focus, progress);
    view.set(
      MathUtils.lerp(transitionView.radius, destination.radius, progress),
      MathUtils.lerp(transitionView.phi, destination.phi, progress),
      transitionView.theta + angleDelta(transitionView.theta, destination.theta) * progress,
    );

    if (!scriptedShot) {
      direction.setFromSphericalCoords(1, view.phi, view.theta);
      let clearance = view.radius;
      for (const box of bounds) {
        if (ray.intersectBox(box, hit)) {
          clearance = Math.min(clearance, hit.distanceTo(viewTarget));
        }
      }
      distance = Math.min(clearance, MathUtils.lerp(distance, view.radius, targetBlend));
      view.radius = distance;
    } else {
      distance = view.radius;
    }

    camera.position.copy(viewTarget).add(offset.setFromSpherical(view));
    camera.lookAt(viewTarget);
  }

  return {
    get yaw() { return orbitYaw; },
    follow(target) {
      if (player === target) return;
      player = target;
      reset();
      update(0);
    },
    orbit(dx, dy) {
      if (scriptedShot) return;
      yaw -= dx * YAW_PER_PIXEL;
      pitch = MathUtils.clamp(pitch + dy * PITCH_PER_PIXEL, 0.18, 1.05);
    },
    shot({ eye, lookAt, seconds = RETURN_SECONDS }) {
      beginTransition(seconds);
      scriptedShot = { eye: new Vector3().copy(eye), lookAt: new Vector3().copy(lookAt) };
    },
    releaseShot() {
      if (!scriptedShot) return;
      beginTransition(RETURN_SECONDS);
      scriptedShot = null;
    },
    update,
  };
}
