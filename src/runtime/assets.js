export function createAssets() {
  const entries = new Map();

  function evict(key, entry) {
    if (entries.get(key) === entry) entries.delete(key);
  }

  return {
    get size() { return entries.size; },
    // Loaders return { value, dispose }. A resolved lease belongs to its caller.
    async acquire(key, load, signal) {
      signal?.throwIfAborted();
      let entry = entries.get(key);
      if (!entry) {
        const controller = new AbortController();
        entry = { controller, claims: 0, resource: null };
        const loading = entry;
        entries.set(key, loading);
        loading.promise = Promise.resolve().then(() => {
          controller.signal.throwIfAborted();
          return load(controller.signal);
        }).then(resource => {
          if (loading.claims === 0) resource.dispose(resource.value);
          else loading.resource = resource;
          return resource.value;
        }).catch(error => {
          evict(key, loading);
          throw error;
        });
      }

      entry.claims++;
      return new Promise((resolve, reject) => {
        let released = false;

        function release() {
          if (released) return;
          released = true;
          signal?.removeEventListener('abort', cancel);
          if (--entry.claims !== 0) return;

          evict(key, entry);
          if (entry.resource) {
            const { value, dispose } = entry.resource;
            entry.resource = null;
            dispose(value);
          } else {
            entry.controller.abort();
          }
        }

        function cancel() {
          release();
          reject(signal.reason);
        }

        signal?.addEventListener('abort', cancel, { once: true });
        entry.promise.then(value => {
          if (released) return;
          signal?.removeEventListener('abort', cancel);
          resolve({ value, release });
        }, error => {
          release();
          reject(error);
        });
      });
    },
  };
}

export function disposeScene(scene, leased = new Set()) {
  const shared = new Set(leased);
  const resources = new Set();

  function collect(resource) {
    if (resource && !shared.has(resource)) resources.add(resource);
  }

  function visitTextures(value, visit) {
    if (Array.isArray(value)) value.forEach(item => visitTextures(item, visit));
    else if (value?.isTexture) visit(value);
  }

  function visitMaterialTextures(material, visit) {
    for (const value of Object.values(material)) visitTextures(value, visit);
    for (const uniform of Object.values(material.uniforms ?? {})) visitTextures(uniform.value, visit);
  }

  for (const resource of leased) {
    if (resource.isMaterial) visitMaterialTextures(resource, texture => shared.add(texture));
  }

  scene.traverse(object => {
    if (object.shadow) collect(object.shadow);
    if (object.isInstancedMesh) collect(object);
    collect(object.geometry);
    if (!object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material || shared.has(material) || resources.has(material)) continue;
      collect(material);
      visitMaterialTextures(material, collect);
    }
  });
  visitTextures(scene.background, collect);
  visitTextures(scene.environment, collect);

  scene.clear();
  scene.background = null;
  scene.environment = null;
  for (const resource of resources) resource.dispose();
}
