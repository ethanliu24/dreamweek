import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Mesh, MeshStandardMaterial,
  PlaneGeometry, ShaderMaterial, CylinderGeometry } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Each palm leaflet folds along a raised midrib. Underwater the same folds
// broaden into continuous, scalloped blades with bright tips and dark roots.
export function dressLagoon(scene, floorHeight) {
  const vertices = [], colors = [], indices = [];
  function blade(rows, sample, base, tip) {
    const first = vertices.length / 3;
    const tint = new Color();
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      for (const side of [-1, 0, 1]) {
        vertices.push(...sample(t, side));
        tint.copy(base).lerp(tip, t*.8 + (side === 0 ? .2 : 0));
        colors.push(tint.r,tint.g,tint.b);
      }
      if (i) for (let k = 0; k < 2; k++) {
        const j = first + i*3 + k;
        indices.push(j-3,j,j-2,j,j+1,j-2);
      }
    }
  }
  const trunks = [];
  const green = new Color(0x176c62), lime = new Color(0xb7e991);
  for (const [x,z,h] of [[-5,7,4.1],[5.8,6,4.7],[-5.1,.7,2.7],[5.7,.4,3.1]]) {
    const lean = Math.sign(x)*-.9;
    for (let i=0;i<15;i++) {
      const t=i/15;
      const trunk=new CylinderGeometry(.13+.11*(1-t),.16+.12*(1-t),h/15+.03,12);
      trunk.translate(x+lean*t*t,h*(t+1/30),z);
      trunks.push(trunk);
    }
    for (let n=0;n<10;n++) {
      const angle=n*2.4+x, dx=Math.cos(angle), dz=Math.sin(angle);
      const stem=t=>[x+lean+dx*t*2.25,h+.65*Math.sin(t*3.4)-.36*t,z+dz*t*2.25];
      blade(14,(t,s)=>{const [a,b,c]=stem(t);return [a-dz*s*.035,b,c+dx*s*.035];},green,lime);
      for(let k=1;k<13;k++) for(const hand of [-1,1]) {
        const [a,b,c]=stem(k/14);
        const length=.53*Math.sin(k/15*Math.PI)+.13;
        blade(3,(t,s)=>{
          const width=.073*Math.sin(Math.PI*t)*s;
          return [a+dx*(t*.39+width)-dz*hand*t*length,b-.26*t*t+.025*(1-Math.abs(s)),
            c+dz*(t*.39+width)+dx*hand*t*length];
        },green,lime);
      }
    }
  }
  scene.add(new Mesh(mergeGeometries(trunks),new MeshStandardMaterial({color:0xa77850})));
  const roots=new Color(0x174969);
  const tips=[0x58ffe1,0xff95c4,0xf1c1ff].map(c=>new Color(c));
  for(let i=0;i<82;i++) {
    const z=-10-(i*.754877%1)*34;
    const x=(i%2?1:-1)*(5.9+(i*.618034%1)*11);
    const y=floorHeight(x,z);
    for(let j=0;j<7;j++) {
      const a=j*2.4+i, dx=Math.cos(a), dz=Math.sin(a), height=.8+1.8*(.5+.5*Math.sin(i+j));
      blade(18,(t,s)=>{
        const reach=t*t*(.6+height*.28)+.12*Math.sin(t*6+i)*t;
        const w=(.18+.06*Math.sin(t*27))*Math.sin(Math.PI*t)*s;
        return [x+dx*reach-dz*w,y+t*height+.055*(1-Math.abs(s)),z+dz*reach+dx*w];
      },roots,tips[i%3]);
    }
  }
  const leaves=new BufferGeometry();
  leaves.setAttribute('position',new Float32BufferAttribute(vertices,3));
  leaves.setAttribute('color',new Float32BufferAttribute(colors,3));
  leaves.setIndex(indices); leaves.computeVertexNormals();
  scene.add(new Mesh(leaves,new MeshStandardMaterial({vertexColors:true,side:DoubleSide,roughness:.42})));

  const clock={value:0};
  const veil=new ShaderMaterial({transparent:true, depthWrite:false, side:DoubleSide, uniforms:{clock},
    vertexShader:'varying vec2 p; void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform float clock; varying vec2 p; void main(){
      float bend=.12*sin(p.x*9.+clock*.14)+.07*sin(p.x*19.-clock*.2);
      float mist=exp(-19.*abs(p.y-.48-bend))*sin(p.x*3.14159);
      gl_FragColor=vec4(.48,.93,.91,.21*mist);
      #include <colorspace_fragment>
    }`});
  const sheet=new PlaneGeometry(1,1);
  for(const [x,y,z,w,h] of [[0,.5,-12,36,1.3],[-8,-9,-23,13,3],[7,-8,-31,15,4],[0,-8,-40,30,5]]) {
    const mesh=new Mesh(sheet,veil);mesh.position.set(x,y,z);mesh.scale.set(w,h,1);scene.add(mesh);
  }
  return elapsed=>{clock.value=elapsed;};
}
