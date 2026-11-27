import {
  BackSide, BoxGeometry, CubeCamera, Color, DoubleSide, Group, HalfFloatType, Mesh, PMREMGenerator, Points, RingGeometry, Scene,
  ShaderMaterial, SphereGeometry, UnsignedByteType, Vector3, WebGLCubeRenderTarget,
  BufferGeometry,
  BufferAttribute,
  AdditiveBlending,
  LineSegments,
} from 'three';

export const SUN_DIR = new Vector3(0.56, 0.3, -0.77).normalize();

const NOISE = /* glsl */ `
float hash13(vec3 p){ p = fract(p*0.1031); p += dot(p, p.zyx+31.32); return fract((p.x+p.y)*p.z); }
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(
    mix(
      mix(hash13(i), hash13(i+vec3(1,0,0)), f.x),
      mix(hash13(i+vec3(0,1,0)), hash13(i+vec3(1,1,0)), f.x),
      f.y
    ),
    mix(
      mix(hash13(i+vec3(0,0,1)), hash13(i+vec3(1,0,1)), f.x),
      mix(hash13(i+vec3(0,1,1)), hash13(i+vec3(1,1,1)), f.x),
      f.y
    ),
    f.z
  );
}
float fbm(vec3 p){ float a=.5, s=0.; for(int i=0; i<5; i++) { s+=a*vnoise(p); p=p*2.03+vec3(17.1,3.7,9.2); a*=.5; } return s; }
`;

export function createSky(renderer, scene) {
  const mat = new ShaderMaterial({
    side: BackSide,
    uniforms: { uSun: { value: SUN_DIR }, uSunAmt: { value: 1 }},
    vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: /* glsl */ `
      varying vec3 vDir; uniform vec3 uSun; uniform float uSunAmt;
      ${NOISE}
      void main() {
        vec3 d = normalize(vDir);
        vec3 q = d*1.7;
        vec3 w = vec3(fbm(q+1.7), fbm(q+vec3(5.2,1.3,2.8)), fbm(q+vec3(9.1,4.4,7.7)));
        float n = fbm(q*1.3 + 2.4*w);
        float n2 = fbm(q*2.7 + 1.9*w + 11.);
        float n3 = fbm(q*5.5 + 3.0*w + 23.);
        float bd = dot(d, normalize(vec3(0.3,1.,0.2)))*2.4; float band = exp(-bd*bd);
        vec3 col = vec3(0.003,0.005,0.014);
        float c1 = smoothstep(0.36,0.8,n);
        col += vec3(0.10,0.035,0.26) * c1 * 1.1;
        col += vec3(0.015,0.17,0.27) * smoothstep(0.42,0.85,n2) * (0.35 + 1.1 * band);
        col += vec3(0.55,0.09,0.24) * smoothstep(0.38,0.72,w.x);
        col += vec3(1.0,0.5,0.22) * pow(smoothstep(0.24,0.5,n*n2),2.) * 0.5;
        col += band * vec3(0.06,0.055,0.085) * (0.3+1.4*n3);
        float dust = smoothstep(0.4,0.68,fbm(q*3.3+w*3.+4.));
        col *= 1.-0.8*dust*(0.35+band);
        col *= (0.75+0.5*n3)*0.72;
        float sd = max(dot(d, uSun), 0.);
        vec3 sc = vec3(1.,0.86,0.66);
        col += sc * (pow(sd,900.) * 1.4 + pow(sd,60.) * 0.16 + pow(sd,7.) * 0.05);
        col += sc * smoothstep(0.99955, 0.99975, sd) * 16.0 * uSunAmt;
        gl_FragColor = vec4(col, 1.);
      }
    `,
  });
  const skyScene = new Scene();
  const geometry = new BoxGeometry(10, 10, 10);
  skyScene.add(new Mesh(geometry, mat));

  const type = renderer.extensions.has('EXT_color_buffer_float') ? HalfFloatType : UnsignedByteType;
  const background = new WebGLCubeRenderTarget(1024, { type });
  const reflections = new WebGLCubeRenderTarget(256, { type });
  const pmrem = new PMREMGenerator(renderer);
  let environment;
  try {
    new CubeCamera(0.1, 100, background).update(renderer, skyScene);
    mat.uniforms.uSunAmt.value = 0;
    new CubeCamera(0.1, 100, reflections).update(renderer, skyScene);
    environment = pmrem.fromCubemap(reflections.texture);
  } catch (error) {
    background.dispose();
    throw error;
  } finally {
    pmrem.dispose();
    reflections.dispose();
    geometry.dispose();
    mat.dispose();
  }

  scene.background = background.texture;
  scene.environment = environment.texture;
  return () => {
    scene.background = null;
    scene.environment = null;
    background.dispose();
    environment.dispose();
  };
}

export function createStars(n = 9000) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), misc = new Float32Array(n * 3);
  const bandN = new Vector3(0.3, 1, 0.2).normalize(), v = new Vector3(), c = new Color();

  for (let i = 0; i < n; i++) {
    v.randomDirection();
    if (i % 5 < 3) v.addScaledVector(bandN, -v.dot(bandN) * (0.6 + 0.4 * Math.random())).normalize();
    // Place the stars beyond the planet and within the gameplay camera's far plane.
    v.multiplyScalar(155);
    pos.set([v.x, v.y, v.z], i * 3);
    const t = Math.random();
    c.setHSL(t < 0.6 ? 0.58 + Math.random() * 0.08 : 0.04 + Math.random() * 0.09, 0.35 + Math.random() * 0.5, 0.72);
    const big = Math.pow(Math.random(), 9);
    const lum = 0.5 + Math.random() * 1.2 + big * 9;
    col.set([c.r * lum, c.g * lum, c.b * lum], i * 3);
    misc.set([1.1 + big * 2.2, 0.6 + Math.random() * 2, Math.random() * 2 * Math.PI], i * 3);
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new BufferAttribute(col, 3));
  geo.setAttribute('aMisc', new BufferAttribute(misc, 3));

  const mat = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uDpr: { value: 1 } },
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 aColor; attribute vec3 aMisc; uniform float uTime, uDpr; varying vec3 vC;
      void main() {
        float tw = 0.72 + 0.28 * sin(uTime * aMisc.y + aMisc.z);
        vC = aColor * tw;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        gl_PointSize = aMisc.x * uDpr;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vC;
      void main() {
        float d = length(gl_PointCoord-.5) * 2.;
        float a = 1. - smoothstep(0., 1., d);
        gl_FragColor = vec4(vC * a * a, 1.);
      }
    `
  });

  const pts = new Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = -2;
  return pts;
}

const RING_FN = /* glsl */ `
float ringDens(float t) {
  float d = 0.55 + 0.45 * sin(t * 41. + sin(t * 9.) * 3.2);
  d *= 0.55+0.45 * vnoise(vec3(t*95.,0.3,0.));
  d *= 0.72+0.28 * vnoise(vec3(t*460.,1.7,0.));
  d *= smoothstep(0.,.05,t) * (1. - smoothstep(.9,1.,t));
  d *= 1.-0.92*(1. - smoothstep(0.,.012,abs(t-.6)-.022));
  d *= 1.-0.7*(1. - smoothstep(0.,.012,abs(t-.83)-.006));
  return d;
}
`

export function createPlanet() {
  const R = 1700, RI = R * 1.28, RO = R * 2.25;
  const group = new Group();
  // Keep the authored proportions inside the shared gameplay camera's far plane.
  const scale = 0.018;
  group.scale.setScalar(scale);
  group.position.set(-22, 12, -65);
  group.rotation.set(0.44, 0.3, -0.36);
  const sunLocal = SUN_DIR.clone().applyQuaternion(group.quaternion.clone().invert());
  const uniforms = { uTime: { value: 0 }, uSun: { value: sunLocal }, uR: { value: R }, uRI: { value: RI }, uRO: { value: RO } };
  const vs = /* glsl */ `
    varying vec3 vP; varying vec3 vN; varying vec3 vWN; varying vec3 vWP;
    void main() {
      vP = position; vN = normal; vWN = normalize(mat3(modelMatrix)*normal);
      vec4 wp = modelMatrix*vec4(position,1.); vWP = wp.xyz;
      gl_Position = projectionMatrix*viewMatrix*wp;
    }
  `;

  const planet = new Mesh(new SphereGeometry(R, 160, 110), new ShaderMaterial({
    uniforms, vertexShader: vs,
    fragmentShader: /* glsl */ `
      varying vec3 vP; varying vec3 vN; varying vec3 vWN; varying vec3 vWP;
      uniform float uTime, uR, uRI, uRO; uniform vec3 uSun;
      ${NOISE} ${RING_FN}
      void main() {
        vec3 n = normalize(vN);
        float a = uTime * 0.004; float ca = cos(a), sa = sin(a);
        vec3 s = vec3(n.x*ca - n.z*sa, n.y, n.x*sa + n.z*ca);
        float lat = s.y;
        float turb = fbm(vec3(s.x*2.2, s.y*10., s.z*2.2) + vec3(uTime*0.005,0.,0.));
        float warp = fbm(s*6. + turb*1.8 + vec3(0.,0.,uTime*0.004));
        float b = lat*15. + (warp-.5)*1.7 + (turb-.5)*1.1;
        float bands = sin(b)*.5+.5, fine = sin(b*3.7+warp*5.)*.5+.5;
        vec3 col = mix(vec3(0.36,0.13,0.06), vec3(0.78,0.47,0.22), smoothstep(0.15,0.85,bands));
        col = mix(col, vec3(0.02,0.78,0.58), smoothstep(.55,.95,fine)*.4);
        col = mix(col, vec3(0.2,0.08,0.07), smoothstep(.5,.8,fbm(s*vec3(2.,22.,2.)+7.))*.6);
        vec3 sp = s - normalize(vec3(0.55,-0.32,0.77));
        float storm = 1. - smoothstep(0.,0.26,length(sp*vec3(1.,2.1,1.)));
        col = mix(col, vec3(0.95,0.42,0.2)*(0.6+0.8*fbm(sp*22.+warp*3.)), storm*.85);
        col = mix(col, vec3(0.22,0.32,0.48), smoothstep(0.62,1.,abs(lat))*0.75);
        float ndl = dot(n, uSun);
        float diff = smoothstep(-0.12,0.75,ndl);
        // ring shadow cast on planet
        float sh = 1.;
        float t = -vP.y/uSun.y;
        if (t > 0.) {
          vec3 h = vP+uSun *t;
          float rt = (length(h.xz)-uRI)/(uRO-uRI);
          if (rt > 0. && rt < 1.) sh = 1.-0.85 * ringDens(rt);
        }
        vec3 lit = col*diff*sh*vec3(1.05,0.93,0.8);
        vec3 V = normalize(cameraPosition - vWP);
        float fres = pow(1. - clamp(dot(normalize(vWN), V), 0., 1.), 3.2);
        lit += vec3(0.16,0.42,1.0)*fres*smoothstep(-0.3,0.35,ndl)*0.9;
        lit += col*vec3(0.02,0.03,0.06)*0.5;
        gl_FragColor = vec4(lit,1.);
        #include <colorspace_fragment>
      }
    `
  }));
  group.add(planet);

  const ring = new Mesh(new RingGeometry(RI, RO, 160), new ShaderMaterial({
    uniforms, side: DoubleSide, transparent: true, depthWrite: false,
    vertexShader: `varying vec3 vL; varying vec3 vWP; void main() { vL = vec3(position.x,0.,-position.y); vec4 wp = modelMatrix*vec4(position,1.); vWP = wp.xyz; gl_Position = projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: /* glsl */ `
      varying vec3 vL; varying vec3 vWP; uniform float uR, uRI, uRO; uniform vec3 uSun;
      ${NOISE} ${RING_FN}
      void main() {
        float r = length(vL); float t = (r-uRI)/(uRO-uRI);
        float d = ringDens(clamp(t,0.,1.));
        float b = dot(vL,uSun); float disc = b*b-(dot(vL,vL)-uR*uR);
        float shadow = step(b,0.)*smoothstep(0.,uR*uR*0.06,disc);
        vec3 tint = mix(vec3(0.9,0.66,0.4), vec3(0.5,0.68,0.95), smoothstep(0.3,0.7,vnoise(vec3(t*23.,4.,9.))));
        vec3 col = tint*(0.03+0.8*(1.-shadow))*(0.5+0.6*d);
        gl_FragColor = vec4(col, d*0.9);
        #include <colorspace_fragment>
      }
    `
  }));
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);
  return { group, uniforms };
}

export function createDust(n = 900) {
  const pos = new Float32Array(n * 6);
  const end = new Float32Array(n * 2);

  for (let i = 0; i < n; i++) {
    const x = (Math.random() - 0.5) * 160;
    const y = (Math.random() - 0.5) * 100;
    const z = Math.random() * 180;

    pos.set([x, y, z, x, y, z], i * 6);
    end.set([0, 1], i * 2);
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3));
  geo.setAttribute('aEnd', new BufferAttribute(end, 1));

  const mat = new ShaderMaterial({
    uniforms: { uScroll: { value: 0 }, uLen: { value: 2 }, uGain: { value: 0.5 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aEnd; uniform float uScroll, uLen; varying float vA;
      void main() {
        vec3 p = position; p.z = mod(p.z + uScroll, 180.) - 160.;
        vA = (1.-aEnd) * smoothstep(-160., -95., p.z) * (1. - smoothstep(0., 20., p.z));
        p.z -= aEnd * uLen;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vA; uniform float uGain;
      void main() {
        gl_FragColor = vec4(vec3(0.55, 0.8, 1.2) * vA * uGain, 1.);
      }
    `,
  });

  const lines = new LineSegments(geo, mat);
  lines.frustumCulled = false;
  return lines;
}
