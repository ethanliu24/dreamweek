import {
  BufferGeometry, Color, ConeGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, ShaderMaterial, SphereGeometry, UniformsLib, UniformsUtils,
} from 'three';

// Follow the terrain so shallow water and candle boats stay on the recovery floor.
export function addCandleStream(scene, add, height) {
  const center = z => -4.7 + 2.1 * Math.sin(z * 0.17) + 0.7 * Math.sin(z * 0.37);
  const width = z => 1.65 + 0.4 * Math.sin(z * 0.27);
  const positions = [], uvs = [], indices = [];
  const rows = 252, columns = 16;
  for (let i = 0; i <= rows; i++) {
    const z = 17 - i * 0.25;
    for (let j = 0; j <= columns; j++) {
      const u = j / columns * 2 - 1;
      const x = center(z) + u * width(z);
      positions.push(x, height(x, z) + 0.028, z);
      uvs.push(u, z);
      if (i < rows && j < columns) {
        const a = i * (columns + 1) + j, b = a + columns + 1;
        indices.push(a, a+1, b, b, a+1, b+1);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  const material = new ShaderMaterial({
    fog: true,
    uniforms: UniformsUtils.merge([UniformsLib.fog, { time: { value: 0 } }]),
    vertexShader: `
      #include <fog_pars_vertex>
      varying vec2 river;
      void main() {
        river = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `
      #include <fog_pars_fragment>
      varying vec2 river;
      uniform float time;
      void main() {
        float u = river.x, z = river.y;
        float wave = sin(z*22. + time*1.7 + 2.*sin(u*7. + z));
        float glint = smoothstep(.25,.98,wave);
        float lampZ = floor(z/3. + .5)*3.;
        float dx = u - .55*sin(lampZ*1.7);
        float reflection = exp(-dx*dx*19. - abs(z-lampZ)*1.8);
        vec3 water = mix(vec3(.013,.031,.067), vec3(.055,.126,.16), .5+.5*sin(z*2.+u*3.+wave*.18));
        water += reflection * vec3(1.,.31,.065) * (.16+glint*.94);
        water += vec3(.11,.19,.21)*glint*smoothstep(.68,1.,abs(u));
        gl_FragColor = vec4(water,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  scene.add(new Mesh(geometry, material));

  const petal = new SphereGeometry(1, 8, 5), reed = new ConeGeometry(1, 1, 4);
  const paper = new MeshBasicMaterial({ color: 0xf18c75 });
  const flame = new MeshBasicMaterial({ color: new Color(2.4, 1.5, 0.54) });
  const leaf = new MeshStandardMaterial({ color: 0x476269, roughness: 0.62 });
  for (let z = -42; z <= 15; z += 3) {
    const x = center(z) + width(z) * 0.55 * Math.sin(z * 1.7);
    const y = height(x, z) + 0.055;
    for (let j = 0; j < 7; j++) {
      const a = j * Math.PI * 2 / 7;
      add(petal, paper, x + .13*Math.sin(a), y+.06, z+.13*Math.cos(a), .09,.06,.17,-.44,a,0);
    }
    add(petal, flame, x,y+.16,z,.07,.13,.07);
  }
  for (let i = 0; i < 320; i++) {
    const z = 15 - Math.random()*60;
    const side = i%2 ? 1 : -1;
    const x = center(z) + side*(width(z)+Math.random()*.65);
    for (let j = -1; j <= 1; j++) {
      const h = .16 + Math.random()*.29;
      add(reed, leaf, x+j*.06,height(x,z)+h*.43,z,.04,h,.047,0,0,-j*.32);
    }
  }
  return time => { material.uniforms.time.value = time; };
}
