import { CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Shape, TorusGeometry } from 'three';

export function createSword() {
  const root = new Group();
  root.name = 'Sword';
  root.userData.kind = 'sword';
  const silver = new MeshStandardMaterial({ color: 0xb2c8d4, metalness: 0.55, roughness: 0.31 });
  const edge = new MeshStandardMaterial({ color: 0xe2f1f4, metalness: 0.48, roughness: 0.22 });
  const bronze = new MeshStandardMaterial({ color: 0xb28756, metalness: 0.38, roughness: 0.42 });
  const trim = new MeshStandardMaterial({ color: 0xe9c580, metalness: 0.4, roughness: 0.28 });
  const leather = new MeshStandardMaterial({ color: 0x3b3033, roughness: 0.85 });
  const wrap = new MeshStandardMaterial({ color: 0x644548, roughness: 0.8 });

  const blade = new Shape();
  blade.moveTo(-0.052, 0.12);
  blade.lineTo(-0.035, 0.79);
  blade.lineTo(0, 0.963);
  blade.lineTo(0.035, 0.79);
  blade.lineTo(0.052, 0.12);
  blade.closePath();
  const geometry = new ExtrudeGeometry(blade, {
    depth: 0.012, bevelEnabled: true, bevelSize: 0.009, bevelThickness: 0.007, bevelSegments: 2,
  });
  geometry.translate(0, 0, -0.006);
  root.add(new Mesh(geometry, [silver, edge]));

  const inlay = new Shape();
  inlay.moveTo(0, 0.75);
  inlay.lineTo(-0.009, 0.2);
  inlay.lineTo(0, 0.16);
  inlay.lineTo(0.009, 0.2);
  inlay.closePath();
  const inlayGeometry = new ExtrudeGeometry(inlay, { depth: 0.001, bevelEnabled: false });
  for (const side of [-1, 1]) {
    const detail = new Mesh(inlayGeometry, edge);
    detail.position.z = side * 0.014;
    root.add(detail);
  }

  const guard = new Shape();
  guard.moveTo(-0.139, 0.153);
  guard.quadraticCurveTo(-0.07, 0.126, 0, 0.134);
  guard.quadraticCurveTo(0.07, 0.126, 0.139, 0.153);
  guard.quadraticCurveTo(0.132, 0.105, 0, 0.089);
  guard.quadraticCurveTo(-0.132, 0.105, -0.139, 0.153);
  const guardGeometry = new ExtrudeGeometry(guard, {
    depth: 0.038, bevelEnabled: true, bevelSegments: 2, bevelThickness: 0.005, bevelSize: 0.005,
  });
  guardGeometry.translate(0, 0, -0.019);
  root.add(new Mesh(guardGeometry, [bronze, trim]));

  root.add(new Mesh(new CylinderGeometry(0.028, 0.032, 0.19, 16), leather));
  const wrapGeometry = new TorusGeometry(0.029, 0.003, 6, 16);
  for (let i = 0; i < 6; i++) {
    const binding = new Mesh(wrapGeometry, wrap);
    binding.rotation.x = Math.PI / 2 + 0.19;
    binding.position.y = -0.072 + i * 0.027;
    root.add(binding);
  }
  const pommel = new Mesh(new CylinderGeometry(0.043, 0.032, 0.039, 12), bronze);
  pommel.position.y = -0.106;
  const cap = new Mesh(new CylinderGeometry(0.033, 0.021, 0.012, 12), trim);
  cap.position.y = -0.128;
  root.add(pommel, cap);
  return root;
}
