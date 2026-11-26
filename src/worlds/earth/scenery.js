import {
  AdditiveBlending, BackSide, BufferGeometry, DirectionalLight, Float32BufferAttribute,
  FogExp2, Group, HemisphereLight, IcosahedronGeometry, InstancedMesh, LatheGeometry, Mesh, Object3D, PlaneGeometry,
  Points, ShaderMaterial, SphereGeometry, TorusGeometry, Vector2,
} from 'three';

const TAU = Math.PI * 2;
const noise = `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise2(vec2 p) {
    vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
  }
  float clouds(vec2 p) {
    return .52*noise2(p)+.28*noise2(p*2.12+7.)+.14*noise2(p*4.25)+.06*noise2(p*8.6);
  }`;
const output = `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>`;
const vertex = `
  varying vec3 world, face;
  void main(){
    vec4 local = vec4(position,1.);
    #ifdef USE_INSTANCING
      local = instanceMatrix * local;
    #endif
    world=(modelMatrix*local).xyz;
    face=normalize(mat3(viewMatrix)*mat3(modelMatrix)*normal);
    gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
  }`;

function skyMaterial(clock) {
  return new ShaderMaterial({
    side: BackSide, depthWrite: false, uniforms: { clock }, vertexShader: vertex,
    fragmentShader: `varying vec3 world, face; uniform float clock;
      ${noise}
      void main(){
        vec3 d=normalize(world-cameraPosition);
        float h=max(d.y,0.);
        vec2 uv=d.xz/max(.14,h+.19);
        float billow=clouds(uv*1.55+vec2(clock*.013,0.));
        float cloud=smoothstep(.46,.69,billow)*smoothstep(.0,.13,h);
        vec3 sky=mix(vec3(1.02,.55,.52),vec3(.15,.48,.76),smoothstep(-.025,.48,d.y));
        sky=mix(sky,mix(vec3(.88,.65,.72),vec3(1.6,1.31,1.06),smoothstep(.52,.72,billow)),cloud*.92);
        float sun=max(0.,dot(d,normalize(vec3(-.31,.26,-1.))));
        sky+=vec3(1.,.69,.4)*(pow(sun,12.)*.28+pow(sun,160.)*.7+smoothstep(.9986,.9994,sun)*1.8);
        gl_FragColor=vec4(sky,1.); ${output}
      }`,
  });
}

function sandstone(sand) {
  return new ShaderMaterial({
    vertexShader:vertex, uniforms:{ sand:{value:sand} },
    fragmentShader:`varying vec3 world, face; uniform bool sand;
      ${noise}
      void main() {
        vec2 p=world.xz;
        float grain=clouds(p*.38);
        float bed=world.y+sin(world.x*.46+world.z*.19)*.48+grain*.48;
        float wave=sin(bed*5.2+sin(bed*1.6))*.5+.5;
        vec3 rock=mix(vec3(.21,.048,.077),vec3(.73,.25,.15),smoothstep(.12,.86,wave));
        rock+=vec3(.32,.22,.16)*smoothstep(.88,.995,wave);
        float ripple=sin(p.y*13.+p.x*3.4+3.*sin(p.x*.83)+grain*9.);
        vec3 dune=mix(vec3(.38,.145,.11),vec3(.88,.51,.31),grain)+ripple*.016;
        // A dusty rose wash settles along shallow wind-carved channels.
        dune=mix(dune,vec3(.64,.37,.47),smoothstep(.37,.77,grain)*.44);
        vec3 n=normalize(cross(dFdx(world),dFdy(world)));
        float key=max(dot(n,normalize(vec3(-.55,.7,-.46))),0.);
        vec3 col=(sand?dune:rock)*(.62+.64*key);
        if(sand){
          float wheelShadow=exp(-dot(p,p)*1.9);
          col*=1.-.39*wheelShadow;
        }
        float fog=1.-exp(-pow(distance(world,cameraPosition)*.030,1.6));
        gl_FragColor=vec4(mix(col,vec3(.68,.39,.46),fog),1.); ${output}
      }`,
  });
}

function lightVeil() {
  return new ShaderMaterial({
    transparent:true, depthWrite:false, blending:AdditiveBlending,
    vertexShader:`varying vec2 vUv; void main(){
      vUv=uv; vec4 centre=modelViewMatrix*vec4(0,0,0,1);
      centre.xy+=position.xy*vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));
      gl_Position=projectionMatrix*centre;
    }`,
    fragmentShader:`varying vec2 vUv; void main(){
      vec2 p=vUv*2.-1.; float r=length(p);
      float halo=pow(max(0.,1.-r),3.);
      gl_FragColor=vec4(.96,.54,.95,halo*.46);
    }`,
  });
}

export function dressBasin(scene) {
  const clock={value:0};
  scene.fog=new FogExp2(0xe4aab5,.028);
  function place(geometry,material,x,y,z,w=1,h=1,d=1,parent=scene) {
    const mesh=new Mesh(geometry,material);
    mesh.position.set(x,y,z); mesh.scale.set(w,h,d); parent.add(mesh);
    return mesh;
  }
  place(new SphereGeometry(100,32,20),skyMaterial(clock),0,0,0);
  const key=new DirectionalLight(0xffdec0,2.4);
  key.position.set(-4,6,3);
  scene.add(key,new HemisphereLight(0xe0e9ff,0xc78c81,1.9));

  const ground=new PlaneGeometry(130,130,125,125);
  ground.rotateX(-Math.PI/2);
  const pos=ground.attributes.position;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i), z=pos.getZ(i);
    const edge=Math.min(1,Math.max(0,(Math.max(Math.abs(x),Math.abs(z))-10)/9));
    pos.setY(i,edge*edge*(1.2+1.05*Math.sin(x*.29+z*.17)+.83*Math.sin(z*.36-x*.09))-.012);
  }
  ground.computeVertexNormals();
  place(ground,sandstone(true),0,0,0);
  const rock=sandstone(false);
  const mesa=new LatheGeometry([[0,0],[1,0],[.96,.15],[.7,.35],[.72,.4],[.47,.59],[.46,.72],[.35,.77],[.34,.96],[.27,1],[0,1]].map(([x,y])=>new Vector2(x,y)),32);
  for(let i=0;i<28;i++){
    const a=i*2.39996, r=22+(i%4)*7;
    const mesh=place(mesa,rock,Math.cos(a)*r,-1.6,Math.sin(a)*r,4+i%5,3.4+5.2*(.5+.5*Math.cos(i*1.6)),4+i%3);
    mesh.rotation.z=.08*Math.sin(i);
  }
  // Expose only the upper sweep of an eroded stone loop above the dune.
  const arch=new TorusGeometry(1,.27,22,72);
  const rings=arch.attributes.position;
  for(let i=0;i<rings.count;i++){
    const x=rings.getX(i),y=rings.getY(i),z=rings.getZ(i);
    rings.setXYZ(i,x+.20*y+.085*Math.sin(y*4.),y+.10*Math.sin(x*3.),z+.19*x*y);
  }
  arch.computeVertexNormals();
  place(arch,rock,-3.8,.3,-13,5.2,5.8,4.3).rotation.y=-.23;
  place(arch,rock,11,.2,-22,4,7.8,3.9).rotation.y=.64;

  const quartz=new LatheGeometry([[0,-.53],[.21,-.19],[.24,.31],[.16,.48],[0,.83]].map(([x,y])=>new Vector2(x,y)),6).toNonIndexed();
  quartz.computeVertexNormals();
  const gem=new ShaderMaterial({
    vertexShader:vertex,uniforms:{clock},fragmentShader:`varying vec3 world,face; uniform float clock;
    void main(){
      vec3 n=normalize(face);
      vec3 eye=normalize((viewMatrix*vec4(cameraPosition-world,0.)).xyz);
      float rim=pow(1.-abs(dot(n,eye)),2.);
      float facet=dot(n,normalize(vec3(-.42,.63,.66)));
      float veil=.5+.5*sin(world.y*5.8+world.x*2.+facet*5.+clock*.34);
      vec3 c=mix(vec3(.23,.12,.54),vec3(.48,.86,1.17),smoothstep(-.45,.75,facet));
      c=mix(c,vec3(1.18,.47,.79),veil*.43)+rim*vec3(.59,.79,1.);
      c+=vec3(.74,.83,1.)*smoothstep(.84,.99,veil)*.43;
      gl_FragColor=vec4(c,1.); ${output}
    }`,
  });
  const gleam=lightVeil(), plane=new PlaneGeometry();
  const floating=[];
  for(const [x,z,size] of [[-5.9,-2.6,2.3],[6.3,-5.1,3.3],[-7.5,4.3,1.4],[8,3.9,1.8]]){
    for(let i=0;i<7;i++){
      const a=i*2.4, scale=size*(i===0?1:.32+.30*Math.abs(Math.sin(i)));
      const mesh=place(quartz,gem,x+Math.cos(a)*i*.13,scale*.34,z+Math.sin(a)*i*.13,scale,scale,scale);
      mesh.rotation.set(.26*Math.sin(a),a,.46*Math.cos(a));
    }
    place(plane,gleam,x,size*.5,z,size*2.4,size*2.4,1);
  }
  for(const [x,y,z,s] of [[3.6,4.9,-11,1.85],[6.4,6.4,-16,1.27],[-7,4.2,-10,.84]]){
    const group=new Group(); group.position.set(x,y,z); scene.add(group);
    place(quartz,gem,0,0,0,s,s,s,group).rotation.z=-.28;
    place(plane,gleam,0,0,0,s*2.9,s*2.9,1,group);
    floating.push({group,y});
  }

  // Scatter agate chips along two mineral seams, leaving the centre open.
  const chips = new InstancedMesh(new IcosahedronGeometry(1, 0), rock, 200);
  const chip = new Object3D();
  for (let i = 0; i < chips.count; i++) {
    const z = -12 + 20 * ((i * 0.61803) % 1);
    const side = i % 2 ? -1 : 1;
    const x = side * (3.9 + Math.sin(z * 0.54) * 0.8 + 2.6 * ((i * 0.41421) % 1));
    const size = 0.035 + 0.14 * (0.5 + 0.5 * Math.cos(i * 5.3)) ** 3;
    chip.position.set(x, size * 0.13, z);
    chip.rotation.set(0.16, i * 2.4, 0.2);
    chip.scale.set(size * 1.4, size * 0.51, size);
    chip.updateMatrix();
    chips.setMatrixAt(i, chip.matrix);
  }
  scene.add(chips);

  const grains=[];
  for(let i=0;i<150;i++) grains.push(Math.sin(i*43.8)*13,.28+((i*.618)%1)*6,Math.cos(i*23.4)*15-3);
  const dust=new BufferGeometry();
  dust.setAttribute('position',new Float32BufferAttribute(grains,3));
  const sparks=new Points(dust,new ShaderMaterial({
    uniforms:{clock},transparent:true,depthWrite:false,blending:AdditiveBlending,
    vertexShader:`uniform float clock; varying float twinkle;
      void main(){vec3 p=position; p.xy+=vec2(sin(clock*.21+p.z),sin(clock*.35+p.x))*.29;
      vec4 mv=modelViewMatrix*vec4(p,1.); twinkle=pow(.5+.5*sin(clock*1.7+p.x*5.),2.);
      gl_PointSize=clamp(46./-mv.z,2.,13.); gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float twinkle; void main(){vec2 p=abs(gl_PointCoord*2.-1.);
      float star=pow(max(0.,1.-length(p)),3.)+.45*pow(max(0.,1.-min(p.x,p.y)*9.-max(p.x,p.y)),2.);
      gl_FragColor=vec4(1.,.85,.64,star*twinkle);}`,
  }));
  scene.add(sparks);
  return elapsed=>{
    clock.value=elapsed;
    for(const {group,y} of floating){
      group.position.y=y+.16*Math.sin(elapsed*.72+y); group.rotation.y=elapsed*.13+y;
    }
  };
}
