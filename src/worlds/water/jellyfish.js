import { Color, DoubleSide, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial,
  PlaneGeometry, ShaderMaterial, SphereGeometry } from 'three';

// A scalloped glass bell over a luminous stomach and a crown of trailing ribbons.
export function createJellyfish(hue, phase = 0) {
  const root = new Group();
  const tint = { value: new Color(hue) };
  const time = { value: 0 };
  const shell = new ShaderMaterial({
    uniforms: { tint, time }, transparent: true, depthWrite: false, side: DoubleSide,
    vertexShader: `varying vec2 st; varying float rim;
      void main(){ st=uv; vec3 p=position;
      float skirt=pow(1.-uv.y,4.); p.y+=.08*cos(uv.x*75.398)*skirt;
      vec4 eye=modelViewMatrix*vec4(p,1.);
      rim=pow(1.-abs(dot(normalize(normalMatrix*normal),normalize(-eye.xyz))),2.);
      gl_Position=projectionMatrix*eye; }`,
    fragmentShader: `uniform vec3 tint; uniform float time; varying vec2 st; varying float rim;
      void main(){float vein=pow(.5+.5*cos(st.x*75.398+sin(st.y*9.)*.45),9.);
      float lace=exp(-32.*abs(st.y-.075-.023*cos(st.x*75.398)));
      vec3 c=mix(tint,vec3(.8,1.,1.),rim*.8+lace*.2);
      gl_FragColor=vec4(c*(1.+vein*.65+lace),.20+rim*.42+vein*.15+lace*.22);
      #include <colorspace_fragment>
      }`,
  });
  const bell = new Mesh(new SphereGeometry(.76,60,20,0,Math.PI*2,0,1.83),shell);
  root.add(bell);
  const heart = new Mesh(new SphereGeometry(.27,24,16),new MeshStandardMaterial({color:0xffa0c9,emissive:0xfa578b,emissiveIntensity:.38,roughness:.26}));
  heart.position.y=.12;
  heart.scale.set(1,.67,1);
  const body=heart.geometry.attributes.position;
  for(let i=0;i<body.count;i++){
    const x=body.getX(i),z=body.getZ(i);
    const petal=.82+.18*Math.cos(Math.atan2(z,x)*4.);
    body.setXYZ(i,x*petal,body.getY(i),z*petal);
  }
  heart.geometry.computeVertexNormals();
  root.add(heart);
  const silk = new ShaderMaterial({ uniforms:{time,tint}, side:DoubleSide, transparent:true,depthWrite:false,
    vertexShader:`uniform float time; varying vec2 st;
      void main(){st=uv;float t=1.-uv.y;vec4 p=instanceMatrix*vec4(position,1.);
      float ph=instanceMatrix[3].x*9.;p.x+=sin(time*2.2+t*5.+ph)*.23*t;
      p.z+=cos(time*1.8+t*4.+ph)*.23*t;
      gl_Position=projectionMatrix*modelViewMatrix*p;}`,
    fragmentShader:`uniform vec3 tint;varying vec2 st;void main(){
      gl_FragColor=vec4(mix(tint,vec3(1.,.53,.74),1.-st.y),(.4+.55*st.y)*sin(st.x*3.14159));
      #include <colorspace_fragment>
      }` });
  const ribbon = new PlaneGeometry(.13,1.45,2,20).translate(0,-.725,0);
  const strands = new InstancedMesh(ribbon,silk,14);
  for(let i=0;i<14;i++){
    const angle=i*2.39996, radius=i%3?.53:.24;
    const m=new Matrix4().makeRotationY(angle);
    m.scale({x:i%3?.8:1.9,y:.72+.25*Math.cos(i),z:1});
    m.setPosition(Math.cos(angle)*radius,-.08,Math.sin(angle)*radius);
    strands.setMatrixAt(i,m);
  }
  root.add(strands);
  return { root, animate(elapsed, attention=0){
    time.value=elapsed+phase;
    const pulse=Math.sin(time.value*2.4);
    bell.scale.set(1+pulse*.075,.75-pulse*.095,1+pulse*.075);
    root.rotation.y=time.value*.24;
    heart.scale.y=.67+pulse*.1+attention*.14;
  }};
}
