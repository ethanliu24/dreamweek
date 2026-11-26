import {
  AdditiveBlending, BackSide, BufferGeometry, Float32BufferAttribute, Mesh, Points,
  ShaderMaterial, SphereGeometry, UniformsLib, UniformsUtils,
} from 'three';

const finish = `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>`;
const noise = `
  float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7))) * 43758.5453); }
  float noise2(vec2 p) {
    vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
  }`;

export function createLagoon(scene) {
  const time = { value: 0 };
  const depth = { value: 0 };
  const vertexShader = `
    varying vec3 world;
    #include <fog_pars_vertex>
    void main(){
      world=(modelMatrix*vec4(position,1.)).xyz;
      vec4 mvPosition=viewMatrix*vec4(world,1.);
      gl_Position=projectionMatrix*mvPosition;
      #include <fog_vertex>
    }`;
  const sky = new Mesh(new SphereGeometry(85, 32, 16), new ShaderMaterial({
    side: BackSide, depthWrite: false, uniforms: { time, depth }, vertexShader,
    fragmentShader: `uniform float time, depth; varying vec3 world;
    ${noise}
    void main(){
      vec3 d=normalize(world-cameraPosition);
      vec2 p=d.xz/max(.14,d.y+.23);
      float clouds=noise2(p*2.+time*.008)*.67+noise2(p*5.)*.33;
      vec3 coast=mix(vec3(.83,.87,.76),vec3(.10,.55,.85),smoothstep(-.04,.46,d.y));
      coast=mix(coast,vec3(1.,.94,.87),smoothstep(.55,.78,clouds)*smoothstep(.01,.18,d.y)*.84);
      float sun=max(0.,dot(d,normalize(vec3(-.52,.24,-1.))));
      coast+=vec3(1.,.73,.38)*(.19*pow(sun,12.)+.75*pow(sun,370.)+smoothstep(.999,.9997,sun));
      vec3 deep=mix(vec3(.018,.14,.245),vec3(.09,.56,.62),smoothstep(-.1,.82,d.y));
      float rays=noise2(vec2(p.x*8.+p.y*3.+time*.06,p.y*.8));
      deep+=vec3(.025,.09,.08)*smoothstep(.38,.88,rays)*smoothstep(-.15,.38,d.y);
      gl_FragColor=vec4(mix(coast,deep,depth),1.);
      ${finish}
    }`,
  }));
  scene.add(sky);

  function surface(fragment, transparent = false) {
    return new ShaderMaterial({
      uniforms: { ...UniformsUtils.clone(UniformsLib.fog), time }, fog: true,
      vertexShader, transparent, depthWrite: !transparent,
      fragmentShader: `uniform float time; varying vec3 world;
      #include <fog_pars_fragment>
      ${noise}
      void main(){
        vec2 p=world.xz;
        ${fragment}
        ${finish}
        #include <fog_fragment>
      }`,
    });
  }
  const sand = surface(`
    float dune=noise2(p*.45);
    float ripple=sin(p.y*5.+2.8*dune+p.x*.62);
    vec3 beach=mix(vec3(.74,.52,.28),vec3(.93,.76,.49),dune+.07*ripple);
    beach+=vec3(.11,.065,.031)*(noise2(p*77.)-.5);
    beach+=vec3(.29,.22,.13)*smoothstep(.85,.98,noise2(p*34.));
    beach*=.81+.19*smoothstep(0.,1.3,p.y);
    vec2 chair=(p-vec2(.6,3.2))*vec2(1.2,1.6);
    vec2 shell=(p-vec2(3.5,2.7))*vec2(1.05,1.6);
    vec2 leftShade=p-vec2(-5.1,3.7),rightShade=p-vec2(5.8,3.9);
    float shade=.32*exp(-dot(chair,chair))+.39*exp(-dot(shell,shell))
      +.33*exp(-dot(leftShade,leftShade))+.33*exp(-dot(rightShade,rightShade));
    gl_FragColor=vec4(beach*(1.-shade),1.);
  `);
  const seabed = surface(`
    float sand=noise2(p*.3)*.7+noise2(p*1.2)*.3;
    vec2 q=p*.98+vec2(time*.13,-time*.10);
    q+=.7*vec2(sin(q.y+q.x*.31),cos(q.x*.88-q.y*.29));
    float net=abs(sin(q.x+sin(q.y))+.74*cos(q.y*1.37));
    float light=1.-smoothstep(.025,.22,net);
    vec3 floorColor=mix(vec3(.025,.14,.21),vec3(.17,.44,.41),sand);
    floorColor+=vec3(.57,.38,.2)*(.6*exp(-.24*dot(p-vec2(4.7,-19.4),p-vec2(4.7,-19.4))));
    gl_FragColor=vec4(floorColor+vec3(.095,.19,.16)*light*(.22+.78*sand),1.);
  `);
  const water = surface(`
    float n=noise2(p*vec2(.6,1.5)+vec2(0.,time*.17));
    float waves=sin(p.y*3.5+time*1.1+n*4.+sin(p.x*.65));
    float edge=p.y+.23*sin(p.x*1.2+time);
    float foam=(1.-smoothstep(.045,.16,abs(edge+.37)))*.8+
               (1.-smoothstep(.02,.1,abs(edge+.88)))*.34;
    vec3 sea=mix(vec3(.045,.68,.64),vec3(.034,.35,.57),smoothstep(.0,17.,-p.y));
    sea+=vec3(.64,.87,.75)*(smoothstep(.82,.99,waves)*smoothstep(.42,.76,n)+foam);
    gl_FragColor=vec4(sea,.72+foam*.23);
  `, true);

  const coords = [];
  for (let i = 1; i <= 96; i++) {
    const frac = n => n - Math.floor(n);
    const z = -6 - 38 * frac(i * .754878);
    coords.push((frac(i * .618034) - .5) * 36, Math.max(-12,z*2/3) + .5 + frac(i*.414214)*5, z);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(coords, 3));
  scene.add(new Points(geometry, new ShaderMaterial({
    uniforms: { time, depth }, blending: AdditiveBlending, transparent: true, depthWrite: false,
    vertexShader: `uniform float time; varying float pulse;
      void main(){vec3 p=position; p.y+=.34*sin(time*.44+p.z); p.x+=.45*sin(time*.3+p.y);
      vec4 eye=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*eye;
      gl_PointSize=clamp(48./max(1.,-eye.z),2.,10.);
      pulse=.22+.78*pow(.5+.5*sin(time*1.4+p.z*3.),3.);}`,
    fragmentShader: `uniform float depth; varying float pulse;
      void main(){vec2 uv=abs(gl_PointCoord*2.-1.);
      float star=pow(max(0.,1.-sqrt(uv.x)-sqrt(uv.y)),1.3);
      gl_FragColor=vec4(.65,1.,.91,depth*pulse*(star+.17*exp(-4.*dot(uv,uv))));
      ${finish}
      }`,
  })));
  return { sand, seabed, water, animate(elapsed, immersion) { time.value = elapsed; depth.value = immersion; } };
}
