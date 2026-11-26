
import { AdditiveBlending, BackSide, BufferGeometry, Float32BufferAttribute, Mesh, Points, ShaderMaterial, SphereGeometry, Vector3 } from 'three';

const SKY_VERTEX = `
varying vec3 vDirection;
void main() {
  vDirection = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAGMENT = `
uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vDirection;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec3 dir = normalize(vDirection);
  float elevation = dir.y;

  vec3 horizon = vec3(0.48, 0.78, 1.00);
  vec3 middle = vec3(0.18, 0.58, 0.96);
  vec3 zenith = vec3(0.06, 0.25, 0.72);
  vec3 sky = mix(horizon, middle, smoothstep(-0.20, 0.22, elevation));
  sky = mix(sky, zenith, smoothstep(0.22, 0.95, elevation) * 0.85);

  vec2 uv = dir.xz / max(0.30, dir.y + 0.60);
  uv *= vec2(1.65, 1.15);

  float cloudBase = fbm(uv + vec2(uTime * 0.004, 0.0));
  float cloudDetail = fbm(uv * 2.5 + vec2(-uTime * 0.007, uTime * 0.002));
  float cloudShape = cloudBase * 0.76 + cloudDetail * 0.24;
  float clouds = smoothstep(0.48, 0.72, cloudShape);

  float wisps = fbm(uv * vec2(2.3, 0.55) + vec2(uTime * 0.003, 0.0));
  clouds = max(clouds, smoothstep(0.53, 0.76, wisps) * 0.48);
  clouds *= smoothstep(-0.16, 0.04, elevation);
  clouds *= 1.0 - smoothstep(0.82, 0.98, elevation);

  float sunFacing = smoothstep(-0.15, 0.90, dot(dir, uSunDirection));
  vec3 cloudColor = mix(vec3(0.60, 0.82, 1.00), vec3(0.94, 0.98, 1.00), sunFacing);
  sky = mix(sky, cloudColor, clouds * 0.86);

  float horizonGlow = exp(-abs(elevation + 0.025) * 13.0);
  sky += vec3(0.35, 0.78, 1.00) * horizonGlow * 0.16;

  float sunAngle = acos(clamp(dot(dir, normalize(uSunDirection)), -1.0, 1.0));
  float sunHalo = exp(-sunAngle * 4.5) * 0.60 + exp(-sunAngle * 16.0) * 0.34;
  sky += vec3(0.72, 0.88, 1.00) * sunHalo * 0.75;

  float sunDisc = 1.0 - smoothstep(0.009, 0.023, sunAngle);
  sky = mix(sky, vec3(1.00, 0.99, 0.91), sunDisc);

  float azimuth = atan(dir.z, dir.x);
  float rays = pow(0.5 + 0.5 * cos(azimuth * 34.0 + uTime * 0.025), 18.0);
  sky += vec3(1.00, 0.78, 0.54) * rays * exp(-sunAngle * 1.7) * 0.065;

  gl_FragColor = vec4(sky, 1.0);
  #include <colorspace_fragment>
}
`;

const SPARKLE_VERTEX = `
attribute float aSize;
attribute float aPhase;
uniform float uTime;
varying float vTwinkle;

void main() {
  float pulse = 0.5 + 0.5 * sin(uTime * 1.8 + aPhase);
  vTwinkle = 0.18 + pulse * 0.82;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float perspective = 92.0 / max(1.0, -mvPosition.z);
  gl_PointSize = clamp(aSize * (0.85 + pulse * 1.2) * perspective, 1.0, 5.5);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const SPARKLE_FRAGMENT = `
varying float vTwinkle;

void main() {
  vec2 p = gl_PointCoord - 0.5;
  float radius = length(p);
  float glow = 1.0 - smoothstep(0.08, 0.50, radius);
  float horizontal = exp(-abs(p.x) * 42.0) * exp(-abs(p.y) * 7.0);
  float vertical = exp(-abs(p.y) * 42.0) * exp(-abs(p.x) * 7.0);
  float sparkle = glow * 0.30 + (horizontal + vertical) * 0.20;
  float alpha = sparkle * vTwinkle;
  gl_FragColor = vec4(vec3(1.0, 0.85, 0.59), alpha);
  #include <colorspace_fragment>
}
`;

function random(seed) {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
}

function createSparkles() {
    const geometry = new BufferGeometry();
    const positions = [];
    const sizes = [];
    const phases = [];
    const count = 340;
    const radius = 82;

    for (let i = 0; i < count; i++) {
        const y = 0.05 + random(i + 1) * 0.92;
        const angle = random(i + 400) * Math.PI * 2;
        const horizontal = Math.sqrt(1.0 - y * y);
        positions.push(Math.cos(angle) * horizontal * radius, y * radius, Math.sin(angle) * horizontal * radius);
        sizes.push(0.8 + random(i + 800) * 2.1);
        phases.push(random(i + 1200) * Math.PI * 2);
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new Float32BufferAttribute(phases, 1));

    const material = new ShaderMaterial({ uniforms: { uTime: { value: 0 } }, vertexShader: SPARKLE_VERTEX, fragmentShader: SPARKLE_FRAGMENT, transparent: true, blending: AdditiveBlending, depthWrite: false, depthTest: true, toneMapped: false });
    const points = new Points(geometry, material);
    points.renderOrder = -999;
    points.frustumCulled = false;
    return points;
}

export function createDreamSky(scene) {
    const sunDirection = new Vector3(-0.22, 0.48, -0.85).normalize();
    const skyMaterial = new ShaderMaterial({ uniforms: { uTime: { value: 0 }, uSunDirection: { value: sunDirection } }, vertexShader: SKY_VERTEX, fragmentShader: SKY_FRAGMENT, side: BackSide, depthWrite: false, depthTest: false, toneMapped: false });
    const dome = new Mesh(new SphereGeometry(115, 64, 48), skyMaterial);
    dome.renderOrder = -1000;
    dome.frustumCulled = false;

    const sparkles = createSparkles();
    scene.add(dome, sparkles);

    return {
        update(elapsed, center) {
            skyMaterial.uniforms.uTime.value = elapsed;
            sparkles.material.uniforms.uTime.value = elapsed;
            if (center) {
                dome.position.copy(center);
                sparkles.position.copy(center);
            }
        },
        dispose() {
            scene.remove(dome, sparkles);
            dome.geometry.dispose();
            skyMaterial.dispose();
            sparkles.geometry.dispose();
            sparkles.material.dispose();
        },
    };
}
