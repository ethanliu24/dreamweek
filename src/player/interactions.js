function read(value) {
  return typeof value === 'function' ? value() : value;
}

export function createInteractions() {
  const targets = new Map();
  let pending = false;

  return {
    register({ id, point, radius = 1.6, priority = 0, enabled = true, label, run }) {
      if (targets.has(id)) throw new Error(`Interaction already registered: ${id}`);
      const target = { id, point, radius, priority, enabled, label, run };
      targets.set(id, target);
      return () => {
        if (targets.get(id) === target) targets.delete(id);
      };
    },
    select(position) {
      if (pending) return null;

      let best = null;
      let bestDistance = Infinity;
      for (const target of targets.values()) {
        if (!read(target.enabled)) continue;
        const distance = position.distanceToSquared(read(target.point));
        if (distance > target.radius ** 2) continue;
        if (!best || target.priority > best.priority || (target.priority === best.priority &&
          (distance < bestDistance || (distance === bestDistance && target.id < best.id)))) {
          best = target;
          bestDistance = distance;
        }
      }
      if (!best) return null;

      return {
        id: best.id,
        label: read(best.label),
        async run() {
          if (pending || targets.get(best.id) !== best || !read(best.enabled)) return;
          pending = true;
          try {
            await best.run();
          } finally {
            pending = false;
          }
        },
      };
    },
  };
}
