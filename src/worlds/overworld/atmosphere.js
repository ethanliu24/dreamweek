import {
  BackSide, CanvasTexture, Color, EquirectangularReflectionMapping, FogExp2, Mesh,
  PlaneGeometry, ShaderMaterial, SphereGeometry, SRGBColorSpace,
} from 'three';

const noise = `
  float hash(vec2 p) {
    p = fract(p * vec2(0.1031, 0.11369));
    p += dot(p, p.yx + 19.19);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 cell = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(cell), hash(cell + vec2(1,0)), f.x),
               mix(hash(cell + vec2(0,1)), hash(cell + 1.0), f.x), f.y);
  }
  float billow(vec2 p) {
    return 0.55 * noise(p) + 0.27 * noise(p * 2.07 + 7.0) +
           0.13 * noise(p * 4.17) + 0.05 * noise(p * 8.3);
  }
`;

// A small painted environment supplies the cool dome and warm horizon reflected by the glass canopy.
function reflectedSky() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, 128);
  for (const [stop, tint] of [[0,'#6375bd'],[0.28,'#abbfe6'],[0.45,'#fff0df'],[0.53,'#e8b9d4'],[0.66,'#97b8be'],[1,'#608486']]) sky.addColorStop(stop, tint);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 256, 128);
  const glow = ctx.createRadialGradient(90, 49, 1, 90, 49, 29);
  glow.addColorStop(0, '#fffdf4');
  glow.addColorStop(1, 'rgba(255,234,216,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(60, 19, 60, 60);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.mapping = EquirectangularReflectionMapping;
  return map;
}

export function createAtmosphere(scene) {
  const time = { value: 0 };
  const uniforms = { time, haze: { value: new Color(0xf0d8e8) } };
  scene.environment = reflectedSky();
  scene.environmentIntensity = 0.38;
  scene.fog = new FogExp2(0xe2d4e9, 0.025);
  const sky = new Mesh(new SphereGeometry(115, 32, 20), new ShaderMaterial({
    side: BackSide, depthWrite: false, uniforms,
    vertexShader: `
      varying vec3 skyPoint;
      void main() {
        skyPoint = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float time;
      uniform vec3 haze;
      varying vec3 skyPoint;
      ${noise}
      void main() {
        vec3 d = normalize(skyPoint);
        float sunset = max(dot(d, normalize(vec3(0.37,0.12,-1.0))), 0.0);
        vec3 horizon = mix(vec3(0.43,0.68,0.90), haze, pow(sunset, 4.0));
        vec3 col = mix(horizon, vec3(0.30,0.36,0.73), smoothstep(-0.07,0.39,d.y));
        col = mix(col, vec3(0.13,0.23,0.58), smoothstep(0.29,0.95,d.y));
        vec2 p = d.xz / max(0.19, d.y + 0.29);
        float wisps = billow(p * vec2(1.4,3.5) + vec2(time * 0.009,0.0));
        col = mix(col, vec3(0.95,0.81,0.89), smoothstep(0.42,0.81,wisps) * 0.37);
        col += vec3(0.24,0.12,0.045) * pow(sunset, 24.0);
        col += vec3(0.58,0.38,0.19) * pow(sunset, 480.0);
        float ribbon = billow(p * vec2(2.0,0.45) + time * 0.006);
        col += vec3(0.06,0.14,0.14) * smoothstep(0.52,0.77,ribbon) * smoothstep(0.12,0.52,d.y);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  }));
  sky.renderOrder = -1;
  scene.add(sky);

  const sheet = new PlaneGeometry(164, 164, 112, 112).rotateX(-Math.PI / 2);
  const clouds = new Mesh(sheet, new ShaderMaterial({
    uniforms,
    vertexShader: `
      uniform float time;
      varying vec3 bank;
      ${noise}
      void main() {
        bank = position;
        bank.y = -7.5 + 6.2 * billow(position.xz * 0.088 + vec2(time * 0.007,0.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(bank,1.0);
      }`,
    fragmentShader: `
      uniform float time;
      uniform vec3 haze;
      varying vec3 bank;
      ${noise}
      void main() {
        vec2 uv = bank.xz * 0.088 + vec2(time * 0.007,0.0);
        float detail = billow(uv * 3.8);
        float light = smoothstep(-6.7,-3.2, bank.y + detail * 0.95);
        vec3 col = mix(vec3(0.48,0.53,0.77), vec3(0.99,0.91,0.89), light);
        col = mix(col, haze, smoothstep(18.0,72.0,length(bank.xz)) * 0.94);
        gl_FragColor = vec4(col,1.0);
        #include <colorspace_fragment>
      }`,
  }));
  scene.add(clouds);
  return elapsed => { time.value = elapsed; };
}
