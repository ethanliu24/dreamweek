import { Quaternion, Vector3 } from 'three';
import { createAssets } from '../runtime/assets.js';
import { audioManifest } from './manifest.js';

const CATEGORIES = ['music', 'ambience', 'effects'];
const CROSSFADE = 0.8;
const RELEASE = 0.15;
const ATTACK = 0.005;
const NO_VOICE = Object.freeze({ stop() {}, setPosition() {} });

function clamp(value) {
  return Math.max(0, Math.min(1, value));
}

function setVector(node, prefix, { x, y, z }, time) {
  node[`${prefix}X`].setValueAtTime(x, time);
  node[`${prefix}Y`].setValueAtTime(y, time);
  node[`${prefix}Z`].setValueAtTime(z, time);
}

// Track scheduled ramps so an interrupted fade starts at the current level.
function createEnvelope(param, start, initial) {
  let points = [[start, initial]];
  param.setValueAtTime(initial, start);

  return {
    to(value, time) {
      points.push([time, value]);
      param.linearRampToValueAtTime(value, time);
    },
    hold(time) {
      let [at, value] = points[0];
      for (const [end, target] of points.slice(1)) {
        if (time < end) {
          value += (target - value) * Math.max(0, (time - at) / (end - at));
          break;
        }
        at = end;
        value = target;
      }
      param.cancelScheduledValues(time);
      param.setValueAtTime(value, time);
      points = [[time, value]];
    },
  };
}

export function createMixer({ assets = createAssets(), manifest = audioManifest } = {}) {
  const appOwner = Symbol('app audio');
  const worldOwners = new Map();
  const voices = new Set();
  const warnings = new Set();
  const volumes = { master: 0.8, music: 0.65, ambience: 0.7, effects: 0.8 };
  const gains = {};
  const cameraPosition = new Vector3();
  const cameraForward = new Vector3();
  const cameraUp = new Vector3();
  const cameraRotation = new Quaternion();
  let context;
  let disposed = false;
  let permitted = false;
  let current;
  let music;
  let musicTail;

  function getOwner(id) {
    if (!worldOwners.has(id)) {
      worldOwners.set(id, { id, cues: new Map(), leases: [], pending: null, profile: null, needsDecode: false });
    }
    return worldOwners.get(id);
  }

  function isRunning() {
    return !disposed && !document.hidden && context?.state === 'running';
  }

  async function resume() {
    if (!permitted || disposed || document.hidden) return false;
    try {
      await context.resume();
    } catch {
      return false;
    }
    if (!isRunning()) return false;
    if (current?.needsDecode && !current.pending) {
      const owner = current;
      void prepareFor(owner, owner.profile).then(() => {
        if (current === owner) syncProfile();
      }).catch(() => {});
    }
    syncProfile();
    return true;
  }

  async function unlock() {
    if (disposed) return false;
    try {
      if (!context) {
        context = new AudioContext();
        for (const name of Object.keys(volumes)) {
          gains[name] = context.createGain();
          gains[name].gain.value = volumes[name];
          gains[name].connect(name === 'master' ? context.destination : gains.master);
        }
      }
      permitted = true;
      // Call resume synchronously from the Start gesture. A blocked context stays playable in silence.
      return await resume();
    } catch {
      return false;
    }
  }

  function onVisibility() {
    if (!context || disposed) return;
    if (document.hidden) {
      for (const voice of voices) if (!voice.loop) voice.finish();
      void context.suspend().catch(() => {});
    } else {
      void resume();
    }
  }

  document.addEventListener('visibilitychange', onVisibility);

  function warn(id, error) {
    if (warnings.has(id)) return;
    warnings.add(id);
    console.warn(`Audio cue "${id}" is unavailable`, error);
  }

  function bufferKey(file) {
    const base = new URL(import.meta.env.BASE_URL, document.baseURI);
    return new URL(file, base).href;
  }

  async function loadBuffer(url, signal) {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    signal.throwIfAborted();
    const value = await context.decodeAudioData(bytes);
    return { value, dispose() {} };
  }

  async function loadCue(id, signal, leases, trail = []) {
    const cue = Object.hasOwn(manifest, id) ? manifest[id] : undefined;
    if (!cue || trail.includes(id)) {
      warn(id, 'Missing cue or circular fallback');
      return null;
    }
    if (cue.synth) return { cue };
    if (!context) return null;
    try {
      const url = bufferKey(cue.file);
      const load = loadSignal => loadBuffer(url, loadSignal);
      const lease = await assets.acquire(url, load, signal);
      if (signal.aborted) {
        lease.release();
        signal.throwIfAborted();
      }
      leases.push(lease);
      return { cue, buffer: lease.value, url, load };
    } catch (error) {
      signal.throwIfAborted();
      warn(id, error);
      return cue.fallback ? loadCue(cue.fallback, signal, leases, [...trail, id]) : null;
    }
  }

  function cueIds(profile) {
    return new Set([profile.music, ...(profile.ambience ?? []), ...(profile.cues ?? [])].filter(Boolean));
  }

  async function prepareFor(owner, profile, signal) {
    if (disposed) return;
    signal?.throwIfAborted();
    owner.pending?.abort();
    const pending = new AbortController();
    owner.pending = pending;
    const loading = signal ? AbortSignal.any([signal, pending.signal]) : pending.signal;
    const leases = [];
    const hadContext = Boolean(context);
    try {
      const entries = await Promise.all([...cueIds(profile)].map(async id => [
        id, await loadCue(id, loading, leases),
      ]));
      loading.throwIfAborted();
      const previous = owner.leases;
      owner.leases = leases;
      owner.cues = new Map(entries);
      owner.needsDecode = !hadContext;
      for (const lease of previous) lease.release();
      return new Set(entries.filter(([, resolved]) => resolved).map(([id]) => id));
    } catch (error) {
      // Abort other cue loads before releasing this batch; there may be shared claims.
      pending.abort();
      for (const lease of leases) lease.release();
      throw error;
    } finally {
      if (owner.pending === pending) owner.pending = null;
    }
  }

  function resolveCue(owner, id) {
    if (owner.cues.has(id)) return owner.cues.get(id);
    const cue = Object.hasOwn(manifest, id) ? manifest[id] : undefined;
    if (!cue) warn(id, 'Unknown cue');
    return cue?.synth ? { cue } : null;
  }

  function playFor(owner, id, options = {}, fadeIn = ATTACK, profileLoop = false) {
    if (!isRunning()) return NO_VOICE;
    const resolved = resolveCue(owner, id);
    if (!resolved || !CATEGORIES.includes(resolved.cue.category)) return NO_VOICE;
    const { cue, buffer, url, load } = resolved;
    const { position, loop = cue.loop ?? false, gain = 1 } = options;
    const now = context.currentTime;
    const source = buffer ? context.createBufferSource() : context.createOscillator();
    const voiceGain = context.createGain();
    const panner = position ? context.createPanner() : null;
    const filter = cue.synth?.filterHz ? context.createBiquadFilter() : null;
    const nodes = [source, filter, voiceGain, panner].filter(Boolean);
    let bufferLease;
    let finished = false;
    let stopping = false;

    if (buffer) {
      source.buffer = buffer;
      source.loop = loop;
      const start = cue.loopStart ?? 0;
      const end = cue.loopEnd ?? buffer.duration;
      if (loop && start >= 0 && start < end && end <= buffer.duration) {
        source.loopStart = start;
        source.loopEnd = end;
      }
      // Keep the canonical asset resident until this particular source has ended.
      void assets.acquire(url, load).then(lease => {
        if (finished) lease.release();
        else bufferLease = lease;
      }).catch(() => {});
    } else {
      source.type = cue.synth.type ?? 'sine';
      source.frequency.value = cue.synth.hz;
      if (filter) filter.frequency.value = cue.synth.filterHz;
    }

    if (panner) {
      panner.distanceModel = 'inverse';
      panner.refDistance = 2;
      panner.rolloffFactor = 0.7;
      setVector(panner, 'position', position, now);
    }

    nodes.forEach((node, index) => node.connect(nodes[index + 1] ?? gains[cue.category]));

    const envelope = createEnvelope(voiceGain.gain, now, 0);
    const level = clamp((cue.gain ?? 1) * gain);
    const duration = loop ? Infinity : buffer?.duration ?? cue.synth.duration ?? 0.3;
    const attackEnd = now + Math.min(fadeIn, duration / 2);
    envelope.to(level, attackEnd);
    if (!loop) {
      const end = now + duration;
      const releaseAt = Math.max(attackEnd, end - Math.min(RELEASE, duration / 2));
      if (releaseAt > attackEnd) envelope.to(level, releaseAt);
      envelope.to(0, end);
    }

    function finish() {
      if (finished) return;
      finished = true;
      source.onended = null;
      try { source.stop(); } catch { /* An unstarted source has no scheduled playback. */ }
      for (const node of nodes) node.disconnect();
      bufferLease?.release();
      voices.delete(voice);
      if (music === voice) music = null;
      if (musicTail === voice) musicTail = null;
    }

    const voice = {
      id, owner, loop, profileLoop, finish,
      get stopping() { return stopping; },
      stop(seconds = RELEASE) {
        if (finished || stopping) return;
        stopping = true;
        const time = context.currentTime;
        const end = time + Math.max(ATTACK, seconds);
        envelope.hold(time);
        envelope.to(0, end);
        source.stop(end);
      },
      setPosition(value) {
        if (panner && !finished) setVector(panner, 'position', value, context.currentTime);
      },
    };

    source.onended = finish;
    voices.add(voice);
    try {
      source.start(now);
      if (!loop && !buffer) source.stop(now + duration);
    } catch (error) {
      finish();
      warn(id, error);
      return NO_VOICE;
    }
    return voice;
  }

  function retireMusic() {
    if (!music) return;
    musicTail?.finish();
    musicTail = music;
    music = null;
    musicTail.stop(CROSSFADE);
  }

  function syncProfile() {
    if (!isRunning() || !current) return;
    const { profile } = current;
    if (music && music.id !== profile.music) retireMusic();
    if (profile.music && !music) {
      const voice = playFor(current, profile.music, { loop: true }, CROSSFADE);
      if (voice !== NO_VOICE) music = voice;
    }
    if (music) music.owner = current;
    for (const id of new Set(profile.ambience ?? [])) {
      if (![...voices].some(voice => voice.owner === current && voice.id === id && voice.profileLoop && !voice.stopping)) {
        playFor(current, id, { loop: true }, RELEASE, true);
      }
    }
  }

  function leave(id, { crossfade = true } = {}) {
    const owner = worldOwners.get(id);
    if (!owner) return;
    if (current === owner) current = null;
    worldOwners.delete(id);
    owner.pending?.abort();
    for (const lease of owner.leases) lease.release();
    owner.leases = [];
    owner.cues.clear();
    for (const voice of voices) {
      if (voice.owner !== owner) continue;
      if (voice === music) {
        voice.owner = null;
        if (!crossfade) retireMusic();
      } else {
        voice.stop();
      }
    }
  }

  function enter(id, profile) {
    if (disposed) return;
    if (current && current.id !== id) leave(current.id);
    current = getOwner(id);
    current.profile = profile;
    const ambient = new Set(profile.ambience ?? []);
    for (const voice of voices) {
      if (voice !== music && voice.owner === current && voice.profileLoop && !ambient.has(voice.id)) voice.stop();
    }
    syncProfile();
  }

  function scope(id) {
    // A retired scope stays retired, even if an old callback runs after travel.
    const owner = disposed ? null : getOwner(id);
    function activeOwner() {
      return !disposed && worldOwners.get(id) === owner ? owner : null;
    }
    return {
      prepare(profile, signal) {
        const active = activeOwner();
        return active ? prepareFor(active, profile, signal) : Promise.resolve();
      },
      enter(profile) {
        if (activeOwner()) enter(id, profile);
      },
      play(cue, options) {
        const active = activeOwner();
        if (!active) return NO_VOICE;
        const voice = playFor(active, cue, options);
        return voice === NO_VOICE ? voice : { stop: voice.stop, setPosition: voice.setPosition };
      },
    };
  }

  return {
    ...scope(appOwner),
    scope,
    unlock,
    get state() { return context?.state ?? 'locked'; },
    get voiceCount() { return voices.size; },
    setVolume(name, value) {
      if (!Object.hasOwn(volumes, name) || !Number.isFinite(value)) return;
      volumes[name] = clamp(value);
      if (!context || disposed) return;
      const param = gains[name].gain;
      const now = context.currentTime;
      if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
      else {
        const currentLevel = param.value;
        param.cancelScheduledValues(now);
        param.setValueAtTime(currentLevel, now);
      }
      param.linearRampToValueAtTime(volumes[name], now + 0.03);
    },
    updateListener(camera) {
      if (!isRunning()) return;
      camera.getWorldPosition(cameraPosition);
      camera.getWorldDirection(cameraForward);
      camera.getWorldQuaternion(cameraRotation);
      cameraUp.set(0, 1, 0).applyQuaternion(cameraRotation);
      const now = context.currentTime;
      setVector(context.listener, 'position', cameraPosition, now);
      setVector(context.listener, 'forward', cameraForward, now);
      setVector(context.listener, 'up', cameraUp, now);
    },
    leave,
    fadeMusic: retireMusic,
    dispose() {
      if (disposed) return;
      disposed = true;
      document.removeEventListener('visibilitychange', onVisibility);
      for (const id of worldOwners.keys()) leave(id);
      for (const voice of voices) voice.finish();
      if (context) {
        for (const gain of Object.values(gains)) gain.disconnect();
        void context.close().catch(() => {});
      }
    },
  };
}
