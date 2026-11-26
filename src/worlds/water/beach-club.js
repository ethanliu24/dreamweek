import { BoxGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry, DoubleSide,
  Group, Mesh, MeshStandardMaterial, PlaneGeometry, SphereGeometry, SRGBColorSpace, TorusGeometry } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Painted timber and canvas use the same handful of sun-faded resort colours.
export function dressBeach(scene) {
  const batches=new Map(), cube=new BoxGeometry(), orb=new SphereGeometry(1,24,16);
  const post=new CylinderGeometry(1,1,1,16), flag=new ConeGeometry(1,1,3);
  const ring=new TorusGeometry(1,.28,12,40);
  function piece(parent,geometry,color,x,y,z,w,h,d,rx=0,ry=0,rz=0) {
    const obj=new Group();obj.position.set(x,y,z);obj.scale.set(w,h,d);obj.rotation.set(rx,ry,rz);
    parent.add(obj);obj.updateWorldMatrix(true,false);
    const g=geometry.index?geometry.toNonIndexed():geometry.clone();
    g.applyMatrix4(obj.matrixWorld);
    if(!batches.has(color)) batches.set(color,[]);
    batches.get(color).push(g);parent.remove(obj);
  }
  const red=0xfb695f, yellow=0xffcf56, teal=0x21b7bb, white=0xffedd0, wood=0xb87548;
  const palette=[red,yellow,teal,white];
  const beach=new Group();
  function print(label) {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#186c76';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#ffe5ac';ctx.lineWidth=7;ctx.strokeRect(9,9,494,110);
    ctx.font='bold 52px Georgia';ctx.textAlign='center';ctx.fillStyle='#fff3c9';ctx.fillText(label,256,83);
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
    return new MeshStandardMaterial({map:texture});
  }
  // A timber surf shack with a striped canvas awning and boards in its rack.
  const shack=new Group();shack.position.set(-6.6,0,.8);shack.rotation.y=.28;
  for(let i=0;i<13;i++)piece(shack,cube,i%2?teal:0x51c5bd,-1.5+i*.25,.85,0,.24,1.7,.8);
  for(const x of [-1.65,1.65])piece(shack,post,wood,x,1.06,.82,.075,2.12,.075);
  for(let i=0;i<12;i++){
    const x=-1.65+i*.30;
    piece(shack,cube,i%2?red:white,x,2.15,.28,.305,.08,1.68,.13);
    piece(shack,orb,i%2?red:white,x,1.99,1.1,.154,.16,.046);
  }
  piece(shack,cube,wood,0,.94,.65,3.4,.12,.45);
  const sign=new Mesh(new PlaneGeometry(2.45,.61),print('SURF CLUB'));
  sign.position.set(0,1.53,.42);shack.add(sign);scene.add(shack);
  for(let i=0;i<3;i++){
    const x=-4.65+i*.35;
    piece(beach,orb,palette[i],x,.85,1.9,.225,.92,.072,0,.15,-.23);
    piece(beach,orb,white,x,.85,1.96,.026,.84,.021,0,.15,-.23);
  }
  // Dressing cabanas, pennant lines, fringed picnic rugs and beach toys.
  for(let i=0;i<3;i++){
    const x=6.6+i*1.9,z=.45-i*.55;
    piece(beach,cube,palette[i],x,.82,z,1.55,1.64,1.3);
    for(let j=0;j<5;j++)piece(beach,cube,white,x-.68+j*.33,.83,z+.66,.115,1.63,.026);
    piece(beach,cube,wood,x,.65,z+.69,.68,1.3,.045);
    for(const s of [-1,1])piece(beach,cube,white,x+s*.42,1.88,z,.99,.105,1.58,0,0,-s*.46);
  }
  for(const side of [-1,1]){
    for(const dist of [3.65,8.8])piece(beach,post,wood,side*dist,1.45,2.3,.047,2.9,.047);
    for(let j=0;j<16;j++){
      const t=j/15, x=side*(3.65+5.15*t), y=2.86-.5*Math.sin(Math.PI*t);
      piece(beach,cube,white,x,y,2.3,.36,.023,.025,0,0,-side*.3*Math.cos(t*Math.PI));
      piece(beach,flag,palette[j%4],x,y-.14,2.3,.14,.29,.028,0,0,Math.PI);
    }
    const mat=new Group();mat.position.set(side*3.95,.025,5.2);mat.rotation.y=side*.48;
    piece(mat,cube,teal,0,0,0,1,.035,1.8);
    for(let j=0;j<7;j++)piece(mat,cube,j%2?white:yellow,0,.022,-.8+j*.25,.99,.012,.07);
    for(const end of [-1,1])for(let j=0;j<10;j++)piece(mat,cube,white,-.46+j*.1,0,end*.94,.023,.016,.1);
    const ball=new Group();ball.position.set(side*3.55,.27,4.44);
    for(let j=0;j<8;j++)piece(ball,new SphereGeometry(.28,5,14,j*Math.PI/4,Math.PI/4),palette[j%4],0,0,0,1,1,1,.3);
    piece(beach,ring,red,side*6,.14,5.7,.49,.49,.49,Math.PI/2);
  }
  // A half-built sand palace and its bucket sit beside the return lane.
  const castle=new Group();castle.position.set(-2.8,0,6.6);castle.rotation.y=.28;
  const ochre=0xd8af77;
  piece(castle,cube,ochre,0,.22,0,.81,.42,.69);
  const tower=new CylinderGeometry(.18,.235,1,18);
  for(const x of [-.42,.42])for(const z of [-.36,.36]){
    piece(castle,tower,ochre,x,.32,z,1,.64,1);
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      piece(castle,cube,ochre,x+.15*Math.cos(a),.67,z+.15*Math.sin(a),.10,.12,.09,0,-a);
    }
  }
  piece(castle,post,wood,0,.62,0,.012,.72,.012);
  piece(castle,flag,red,.10,.92,0,.11,.25,.013,0,0,-Math.PI/2);
  piece(castle,tower,teal,.79,.145,.1,.8,.29,.8,Math.PI);
  piece(castle,ring,yellow,.79,.31,.1,.14,.14,.075);
  const starArm=new SphereGeometry(1,10,6);
  for(let i=0;i<24;i++){
    const side=i%2?1:-1,x=side*(2.2+(i*.618%1)*5),z=.4+(i*.754%1)*7.3;
    const star=new Group();star.position.set(x,.032,z);
    for(let j=0;j<5;j++){
      const angle=j*2*Math.PI/5+i;
      piece(star,starArm,i%3?0xf8c596:0xfa9286,.074*Math.sin(angle),0,.074*Math.cos(angle),
        .033,.024,.095,0,angle);
    }
  }
  // Silhouettes on the horizon give the shallow cove a far shore.
  for(let i=0;i<5;i++){
    const x=-26+i*13,z=-29-(i%2)*8;
    piece(beach,orb,wood,x,.13,z,1.35,.27,.45);
    piece(beach,post,wood,x,1.55,z,.047,3.05,.047);
    for(const side of [-1,1]){
      const sail=new PlaneGeometry(1,1,8,10);
      const pos=sail.attributes.position;
      for(let n=0;n<pos.count;n++){
        const u=pos.getX(n)+.5,v=pos.getY(n)+.5;
        pos.setXYZ(n,side*(.06+u*(1-v)*1.08),.46+v*(side>0?2.52:1.93),
          .27*Math.sin(Math.PI*u)*(1-v));
      }
      sail.computeVertexNormals();
      piece(beach,sail,side>0?palette[i%4]:white,x,0,z,1,1,1);
    }
  }
  for(const [color,parts] of batches){
    scene.add(new Mesh(mergeGeometries(parts),new MeshStandardMaterial({color:new Color(color),roughness:.58,side:DoubleSide})));
  }
}
