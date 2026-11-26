import { createInteractions } from '../player/interactions.js';

const MIN_COVER_MS = 1000;

function waitForCover(coveredAt, signal) {
  const remaining = MIN_COVER_MS - (performance.now() - coveredAt);
  if (remaining <= 0) return;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      resolve();
    }, Math.ceil(remaining));
    function cancel() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener('abort', cancel, { once: true });
  });
}

function copyEntry({ id, spawn, progress }) {
  return { id, spawn, progress: structuredClone(progress) };
}

export function createWorldHost({
  registry, controls, ui, resolveTravel, stepWorld, audio, progress, coverInitial = true, ...services
}) {
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
      audio?.leave(instance);
    }
  }

  function unlock() {
    releaseTransition?.();
    releaseTransition = null;
  }

  function worldContext(instance) {
    const signal = instance.controller.signal;
    function destination(kind) {
      return resolveTravel?.({ kind, entry: instance.entry, world: instance.world });
    }
    function travel(kind) {
      if (active !== instance || attempt || failure || signal.aborted) return false;
      const next = destination(kind);
      return next ? request(next) : false;
    }

    return {
      ...services,
      ui,
      signal,
      interactions: instance.interactions,
      audio: audio?.scope(instance),
      progress: progress && {
        read: progress.read,
        apply(command, payload) {
          if (active !== instance || attempt || signal.aborted) {
            return { changed: false, snapshot: progress.read() };
          }
          return progress.apply(command, payload);
        },
      },
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
        canEnterNext: () => !signal.aborted && Boolean(destination('enterNext')),
        enterNext: () => travel('enterNext'),
        returnHome: () => travel('returnHome'),
      },
    };
  }

  async function swap(instance, coveredAt) {
    const { controller: { signal }, entry, previousEntry } = instance;
    const coveredTravel = coverInitial || Boolean(previousEntry);

    try {
      if (coveredTravel && coveredAt === undefined) {
        await ui.iris.close(signal);
        coveredAt = performance.now();
      }
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
      audio?.ensureProfile(instance);

      instance.ready = true;
      if (coveredTravel) {
        await waitForCover(coveredAt, signal);
        signal.throwIfAborted();
        await ui.iris.open(signal);
      } else if (coveredAt !== undefined) {
        ui.iris.reveal();
      }
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
      audio?.fadeMusic();
      ui.clearWorld();
      attempt = null;
      failure = { entry, previousEntry, coveredAt: coveredAt ?? performance.now() };
      const home = resolveTravel?.({ kind: 'returnHome', entry, previousEntry, world: null });
      const failed = failure;
      ui.showLoadError(error, {
        retry: () => failure === failed && retry(),
        returnHome: home ? () => failure === failed && begin(copyEntry(home), previousEntry, failed.coveredAt) : undefined,
      });
    }
  }

  function begin(entry, previousEntry, coveredAt) {
    const instance = {
      entry, previousEntry,
      controller: new AbortController(),
      locks: new Set(),
      interactions: createInteractions(),
      world: null,
      entered: false,
      ready: false,
    };
    attempt = instance;
    failure = null;
    releaseTransition ??= controls.acquire('transition');
    void swap(instance, coveredAt);
    return true;
  }

  function request(entry) {
    if (disposed || attempt || failure || entry.id === active?.entry.id) return false;
    return begin(copyEntry(entry), active?.entry);
  }

  function retry() {
    if (!failure) return false;
    return begin(failure.entry, failure.previousEntry, failure.coveredAt);
  }

  function visibleWorld() {
    return attempt?.ready ? attempt.world : active?.world;
  }

  return {
    request,
    get activeWorld() { return active?.entry.id ?? null; },
    get scene() { return visibleWorld()?.scene ?? null; },
    update(dt) {
      if (active && !attempt) {
        const frame = { mode: controls.mode, actions: controls.sample(), playerPosition: services.player?.position };
        if (stepWorld) stepWorld(active.world, dt, frame, active.interactions);
        else active.world.update(dt, frame);
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
