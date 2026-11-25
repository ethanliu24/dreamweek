import { Mesh, MeshBasicMaterial, RingGeometry } from 'three';

export function createReturnRing(position) {
  const ring = new Mesh(
    new RingGeometry(0.85, 0.98, 40),
    new MeshBasicMaterial({ color: 0xffdf61 }),
  );
  ring.name = 'Return ring';
  ring.position.copy(position);
  ring.position.y += 0.012;
  ring.rotation.x = -Math.PI / 2;
  return ring;
}
