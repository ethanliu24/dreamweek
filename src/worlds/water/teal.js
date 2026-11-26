import { BoxGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry } from 'three';

export function createTeal() {
  const ivory = new MeshStandardMaterial({ color: 0xf2e4cb });
  const dark = new MeshStandardMaterial({ color: 0x203541 });
  const red = new MeshStandardMaterial({ color: 0xbb413b });
  const sphere = new SphereGeometry(1, 24, 16);
  const box = new BoxGeometry();

  function prop(parent, geometry, material, position, scale) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }

  const root = new Group();
  root.position.set(0, 1.3, 0.05);
  prop(root, sphere, ivory, [0, 0.43, 0], [0.39, 0.46, 0.34]);
  let flipperByGlasses;
  for (const x of [-0.32, 0.32]) {
    const flipper = prop(root, sphere, ivory, [x, 0.24, 0.11], [0.09, 0.2, 0.075]);
    flipper.rotation.z = x * 1.5;
    if (x > 0) flipperByGlasses = flipper;
  }
  for (const x of [-0.17, 0.17]) prop(root, sphere, dark, [x, 0.59, 0.279], [0.18, 0.11, 0.065]);
  prop(root, box, dark, [0, 0.61, 0.31], [0.15, 0.025, 0.03]);
  prop(root, sphere, ivory, [0, 0.44, 0.3], [0.15, 0.075, 0.08]);
  const trim=new MeshStandardMaterial({color:0xe5b95e,metalness:.32,roughness:.3});
  const reflection=new MeshStandardMaterial({color:0x8ddadd,emissive:0x214557});
  for(const side of [-1,1]){
    const rim=prop(root,new TorusGeometry(1,.076,8,32),trim,[side*.17,.59,.306],[.18,.113,.11]);
    rim.rotation.z=side*.065;
    prop(root,sphere,reflection,[side*.17-.045,.625,.339],[.059,.013,.01]).rotation.z=.33;
    prop(root,sphere,ivory,[side*.073,.438,.346],[.10,.067,.071]);
    prop(root,sphere,ivory,[side*.19,.10,-.20],[.14,.08,.19]).rotation.y=side*.48;
    for(let j=0;j<3;j++)prop(root,sphere,dark,[side*(.08+.025*j),.438+.012*(j%2),.405-.009*j],[.009,.009,.006]);
  }
  prop(root,sphere,dark,[0,.485,.385],[.066,.041,.045]);
  const lanyard = prop(root, new TorusGeometry(0.115, 0.012, 6, 20), red, [0, 0.28, 0.29], [1, 1.3, 1]);
  lanyard.rotation.x = -0.27;

  let reaction = 0;
  let embarrassed = false;

  return {
    root,
    react(count) { reaction = count; },
    confess() { embarrassed = true; },
    settle() {
      reaction = 0;
      embarrassed = false;
    },
    animate(elapsed, announcing) {
      root.rotation.x = announcing ? -0.18 : embarrassed ? 0.27 : -0.055 * reaction;
      root.rotation.y = reaction * (0.12 + Math.sin(elapsed * 6) * 0.022);
      flipperByGlasses.rotation.z = reaction >= 2 && !embarrassed ? 0.98 : 0.48;
      flipperByGlasses.position.y = reaction >= 2 && !embarrassed ? 0.42 : 0.24;
    },
  };
}
