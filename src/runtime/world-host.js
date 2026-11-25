function copyEntry({ id, spawn, progress }) {
  return { id, spawn, progress: structuredClone(progress) };
}

export function createWorldHost({ registry, controls, ui, resolveTravel, ...services }) {
  let active = null;
  let attempt = null;
  let failure = null;
  let releaseTransition = null;
  let disposed = false;

  function retire(instance) {
    if (!instance || instance.controller.signal.aborted) return;
    instance.controller.abort();
    try {
      try {
        if (instance.entered) instance.world.exit();
      } finally {
        instance.world?.dispose();
      }
    } catch (error) {
      console.error('World cleanup failed', error);
    } finally {
      for (const release of instance.locks) release();
    }
  }

  function unlock() {
    releaseTransition?.();
    releaseTransition = null;
  }

  function worldContext(instance) {
    const signal = instance.controller.signal;
    function travel(kind) {
      if (active !== instance || attempt || failure || signal.aborted) return false;
      const next = resolveTravel?.({ kind, entry: instance.entry, world: instance.world });
      return next ? request(next) : false;
    }

    return {
      ...services,
      ui,
      signal,
      controls: {
        acquire(mode) {
          signal.throwIfAborted();
          const release = controls.acquire(mode);
          function releaseLock() {
            if (instance.locks.delete(releaseLock)) release();
          }
          instance.locks.add(releaseLock);
          return releaseLock;
        },
      },
      travel: {
        enterNext: () => travel('enterNext'),
        returnHome: () => travel('returnHome'),
      },
    };
  }

  async function swap(instance, covered) {
    const { controller: { signal }, entry, previousEntry } = instance;

    try {
      if (!covered) await ui.iris.close(signal);
      signal.throwIfAborted();

      const outgoing = active;
      active = null;
      retire(outgoing);
      ui.clearWorld();
      signal.throwIfAborted();

      const createWorld = await registry.load(entry.id);
      signal.throwIfAborted();
      instance.world = createWorld(worldContext(instance));
      await instance.world.prepare(signal);
      signal.throwIfAborted();

      instance.entered = true;
      const { spawn, progress } = copyEntry(entry);
      await instance.world.enter({ spawn, progress });
      signal.throwIfAborted();

      instance.ready = true;
      await ui.iris.open(signal);
      signal.throwIfAborted();
      active = instance;
      attempt = null;
      unlock();
    } catch (error) {
      // Every attempt has its own signal. Teardown invalidates continuations that finish late.
      if (signal.aborted) return;
      if (active) {
        retire(active);
        active = null;
      }
      retire(instance);
      ui.clearWorld();
      attempt = null;
      failure = { entry, previousEntry };
      const home = resolveTravel?.({ kind: 'returnHome', entry, previousEntry, world: null });
      const failed = failure;
      ui.showLoadError(error, {
        retry: () => failure === failed && retry(),
        returnHome: home ? () => failure === failed && begin(copyEntry(home), previousEntry, true) : undefined,
      });
    }
  }

  function begin(entry, previousEntry, covered) {
    const instance = {
      entry, previousEntry,
      controller: new AbortController(),
      locks: new Set(),
      world: null,
      entered: false,
      ready: false,
    };
    attempt = instance;
    failure = null;
    releaseTransition ??= controls.acquire('transition');
    void swap(instance, covered);
    return true;
  }

  function request(entry) {
    if (disposed || attempt || failure || entry.id === active?.entry.id) return false;
    return begin(copyEntry(entry), active?.entry, false);
  }

  function retry() {
    if (!failure) return false;
    return begin(failure.entry, failure.previousEntry, true);
  }

  function visibleWorld() {
    return attempt?.ready ? attempt.world : active?.world;
  }

  return {
    request,
    get scene() { return visibleWorld()?.scene ?? null; },
    update(dt) {
      if (active && !attempt) {
        active.world.update(dt, { mode: controls.mode, actions: controls.sample(), playerPosition: services.player?.position });
      }
    },
    present(elapsed, dt) {
      visibleWorld()?.present?.(elapsed, dt);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      retire(attempt);
      retire(active);
      attempt = null;
      active = null;
      failure = null;
      ui.clearWorld();
      unlock();
    },
  };
}
