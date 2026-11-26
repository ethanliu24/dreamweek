import { LatheGeometry, MathUtils, Vector2 } from 'three';

export function potDimensions({ base, height, rim }) {
  const unit = value => MathUtils.clamp(value, 0, 1);
  return {
    foot: MathUtils.lerp(0.18, 0.28, unit(base)),
    top: MathUtils.lerp(0.32, 0.55, unit(height)),
    lip: MathUtils.lerp(0.21, 0.35, unit(rim)),
  };
}

export function potGeometry(shape, { compression = 1, lift = 1 } = {}) {
  const { foot, lip, top } = potDimensions(shape);
  const height = MathUtils.lerp(0.11, top, lift);
  const bottom = foot + (1 - compression) * 0.095;
  const mouth = MathUtils.lerp(bottom * 0.91, lip, lift);
  const belly = Math.max(bottom, mouth) + 0.032;
  return new LatheGeometry([
    [0, 0], [bottom * 0.89, 0], [bottom, 0.025],
    [belly, height * 0.44], [mouth + 0.028, height * 0.85],
    [mouth + 0.027, height * 0.97], [mouth + 0.016, height],
    [mouth, height - 0.006], [mouth - 0.009, height * 0.86],
    [belly - 0.039, height * 0.44], [bottom - 0.041, 0.043], [0, 0.043],
  ].map(([x, y]) => new Vector2(x, y)), 36);
}
