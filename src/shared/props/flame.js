import { SphereGeometry } from 'three';

// Taper the upper half and curl its tip away from the base.
export function flameGeometry() {
  const geometry = new SphereGeometry(1, 16, 12);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const height = (position.getY(i) + 1) / 2;
    const width = 1.4 - height;
    position.setXYZ(i, position.getX(i) * width + height ** 3 * 0.55,
      height, position.getZ(i) * width);
  }
  geometry.computeVertexNormals();
  return geometry;
}
