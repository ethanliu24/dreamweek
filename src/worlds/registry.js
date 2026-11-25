// Vite emits a literal lazy import for each implemented entry.
const modules = import.meta.glob([
  './overworld/index.js',
  './fire/index.js',
  './earth/index.js',
  './water/index.js',
  './wood/index.js',
  './metal/index.js',
  './void/index.js',
]);

export function createWorldRegistry(fixtures = {}) {
  return {
    async load(id) {
      const loadModule = Object.hasOwn(fixtures, id) ? fixtures[id] : modules[`./${id}/index.js`];
      if (!loadModule) throw new Error(`World is unavailable: ${id}`);

      const { createWorld } = await loadModule();
      if (typeof createWorld !== 'function') throw new Error(`World has no factory: ${id}`);
      return createWorld;
    },
  };
}
