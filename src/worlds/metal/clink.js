import { CatmullRomCurve3, TubeGeometry, Vector3, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

export function createClink() {
  const root = new Group();
  root.name = 'Clink';
  const body = new Group();
  root.add(body);
  const oval = new SphereGeometry(1, 24, 16);
  const shell = new MeshStandardMaterial({ color: 0x9e674b, metalness: 0.59, roughness: 0.36 });
  const gold = new MeshStandardMaterial({ color: 0xc29256, metalness: 0.4, roughness: 0.4 });
  const dark = new MeshStandardMaterial({ color: 0x3a2928 });
  const teal = new MeshStandardMaterial({ color: 0x5fddce, emissive: 0x35b6a4, emissiveIntensity: 0.9 });

  function part(parent, geometry, material, position, scale) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }

  part(body, oval, dark, [0, 0.22, 0.01], [0.27, 0.19, 0.35]);
  part(body, oval, shell, [0, 0.32, -0.09], [0.29, 0.22, 0.37]);
  part(body, oval, dark, [0, 0.407, -0.1], [0.015, 0.135, 0.334]);
  part(body, oval, gold, [0, 0.24, 0.25], [0.2, 0.175, 0.165]);
  part(body, oval, dark, [0, 0.18, 0.402], [0.045, 0.014, 0.014]);
  const pearl = new MeshStandardMaterial({ color: 0xffefcc, emissive: 0xe8d4a1, emissiveIntensity: 0.45 });
  const patina = new MeshStandardMaterial({ color: 0x65a590, metalness: 0.44, roughness: 0.38 });
  function line(points, radius) {
    const curve = new CatmullRomCurve3(points.map(point => new Vector3(...point)));
    return new TubeGeometry(curve, 18, radius, 7, false);
  }
  const antenna = line([[0,0,0],[0,0.068,-0.008],[0.023,0.126,0.009],[0.047,0.151,0.034]], 0.012);
  const stalks = [];
  const eyes = [];
  for (const side of [-1, 1]) {
    // Follow the shell curvature so the enamel lines read as inlaid wing markings.
    const wing = [[0.047,-0.38],[0.105,-0.29],[0.165,-0.20],[0.21,-0.13],[0.225,0.015]];
    const ridge = wing.map(([x,z]) => [side*x,0.323+0.22*Math.sqrt(1-(x/.29)**2-((z+.09)/.37)**2),z]);
    part(body,line(ridge,.0075),patina,[0,0,0],[1,1,1]);
    part(body,oval,gold,[side*.18,.46,-.26],[.026,.011,.033]);
  }
  const arms = [];
  for (const side of [-1, 1]) {
    const eye = new Group();
    eye.position.set(side * .091,.284,.388);
    body.add(eye);
    eyes.push(eye);
    part(eye,oval,dark,[0,0,0],[.067,.075,.033]);
    part(eye,oval,teal,[0,.002,.018],[.056,.062,.029]);
    part(eye,oval,dark,[-side*.006,.004,.043],[.025,.037,.012]);
    part(eye,oval,pearl,[-.013,.028,.054],[.013,.014,.006]);
    part(body,oval,shell,[side*.146,.23,.36],[.023,.012,.016]);
    const stalk = new Group();
    stalk.position.set(side * 0.095, 0.387, 0.23);
    stalk.rotation.z = -side * 0.36;
    body.add(stalk);
    stalks.push({ stalk, side });
    part(stalk, antenna, gold, [0, 0, 0], [side, 1, 1]);
    part(stalk, oval, teal, [side*.047, .151, .034], [.031, .039, .033]);
    for (const z of [-0.24, -0.025, 0.19]) {
      const leg = part(body, oval, dark, [side * 0.25, 0.095, z], [0.145, 0.059, 0.053]);
      leg.rotation.z = -side * 0.49;
      if (z > 0) arms.push({ leg, side });
    }
  }

  return {
    root,
    animate(time, phase) {
      const calling = phase === 'calling';
      const pleased = ['flow', 'repaired', 'reward', 'complete'].includes(phase);
      body.rotation.x = calling || pleased ? -0.16 : 0;
      body.position.y = (calling ? 0.055 : 0) + 0.012 * Math.sin(time * 5);
      const blink = Math.max(0, 1 - Math.abs(time % 3.9 - 3.62) / .13);
      for(const eye of eyes) eye.scale.y = 1 - .88 * blink;
      for(const {stalk, side} of stalks) {
        stalk.rotation.z = -side * (.35 + .13*Math.sin(time*(calling?5:2.2)+side));
        stalk.rotation.x = .10*Math.cos(time*2.6+side) - (pleased?.18:0);
      }
      for (const { leg, side } of arms) {
        const wave = calling ? 0.66 + 0.38 * Math.sin(time * 12) : pleased ? 0.43 : phase === 'explaining' && side < 0 ? 0.77 : 0;
        leg.rotation.z = side * (wave - 0.49);
      }
    },
  };
}
