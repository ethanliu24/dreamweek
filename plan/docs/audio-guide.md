# Adding audio to Dreamweek

Register each sound in the cue manifest, prepare file-backed cues in the world that uses them, and trigger the cue where the gameplay or dialogue beat actually happens. The game already has a Web Audio mixer for music, ambience, and effects, including positional sounds. World code selects cue IDs and the mixer owns playback and cleanup.

## Make a recording audible in Fire

1. Export a short one-shot or a clean loop from FL Studio. Keep the dry phone recording with your source material. Put the edited export in `public/assets/audio/fire/`, for example `public/assets/audio/fire/lantern-paper.ogg`. Use lowercase filenames and audition the export in the browsers you plan to support.
2. Add a cue in [`src/audio/manifest.js`](../../src/audio/manifest.js). A cue ID is a stable name for what the sound does. The file can change later while callers keep using the same ID.
3. Add the file-backed cue to the world's audio profile. Return or await `audio.prepare(profile, signal)` from the world’s `prepare` method so the host can wait for loading. Call `audio.enter(profile)` in `enter` to start the background layers.
4. Trigger the cue from the action that owns the sound. For a one-shot, call `audio.play(id, options)`. Run `npm run dev`, open the printed address with `?qa`, and choose **Fire arrival** to reach the world directly.

These are example additions to the manifest. Supply the named exports before using the file entries.

```js
'fire.score': { category: 'music', gain: 0.32, file: 'assets/audio/fire/score.ogg' },
'fire.festival-bed': {
  category: 'ambience',
  gain: 0.4,
  file: 'assets/audio/fire/festival-bed.ogg',
},
'fire.lantern-paper': {
  category: 'effects',
  gain: 0.5,
  file: 'assets/audio/fire/lantern-paper.ogg',
},
'fire.wick-voice-low': {
  category: 'effects',
  gain: 0.16,
  synth: { type: 'triangle', hz: 320, duration: 0.045 },
},
'fire.wick-voice-high': {
  category: 'effects',
  gain: 0.16,
  synth: { type: 'triangle', hz: 410, duration: 0.05 },
},
```

For files in `public/`, use a manifest path starting with `assets/audio/`. The mixer resolves it against Vite’s base, so the same path works under the GitHub Pages project directory. The repository currently supplies generated cues for the hammock, Candle, and shell siren. The file and voice snippets here are examples to add when authoring.

In [Fire’s world entry](../../src/worlds/fire/index.js), replace the small `AUDIO` object with your selection. Keep Fire’s existing `prepare` and `enter` calls.

```js
const AUDIO = {
  music: 'fire.score',
  ambience: ['fire.festival-bed'],
  cues: ['candle.chime', 'fire.lantern-paper', 'fire.wick-voice-low', 'fire.wick-voice-high'],
};
```

A profile supports one music cue and any number of ambience cues. Use a single ambience cue for one continuous background track, and add music only if the scene calls for both. The mixer loops profile music and ambience automatically. Keep the same music ID across adjacent worlds to continue playing it without restarting. Different tracks crossfade over about 0.8 seconds. When an incoming world has no music, including worlds with no declared profile, travel fades the outgoing track to silence. Old ambience and world-owned effects fade on departure.

## Audio API reference

| API | Where to call it | Behaviour |
| --- | --- | --- |
| `audio.prepare(profile, signal)` | World `prepare(signal)` | Loads the union of `profile.music`, `profile.ambience`, and `profile.cues` for this world. Resolves to a Set of resolved IDs on a successful live scope. Use it for every file-backed sound the world can trigger. |
| `audio.enter(profile)` | World `enter()`, or when switching beds within the world | Selects music and ambience. Can switch between already prepared cue IDs. Omit `music` for silence or use an empty `ambience` array to fade the old bed. |
| `audio.play(id, { position, loop, gain })` | World action, update, or story code | Starts immediately and returns a handle. All options are optional. `position` is a Three.js world-space vector or an object with `x`, `y`, and `z`. `loop` overrides the cue’s default. `gain` multiplies the cue’s gain. |
| `handle.stop(fadeSeconds)` | End of a manual loop or an interrupted sound | Fades out the voice. Default release is 0.15 s. |
| `handle.setPosition(point)` | While a positional emitter is moving | Moves a voice that was started with `position`. Keep the handle and provide a fresh world-space point when the emitter moves. |
| `audio.unlock()`, `audio.state` | App shell | Start or Enable sound unlocks the mixer from a user gesture. `unlock()` resolves to a boolean and state starts at `locked`. |
| `audio.setVolume(name, value)` | App shell or audio QA | Controls `master`, `music`, `ambience`, or `effects`. Values are clamped to 0–1 and changes ramp over 30 ms. Settings live for the session. The four sliders are in Audio QA. |
| `audio.updateListener(camera)`, `audio.voiceCount` | App render loop or QA | The camera is the listener. `voiceCount` includes voices that are fading. |
| `audio.scope(owner)`, `audio.leave(owner)`, `audio.dispose()` | Runtime ownership | The world host supplies each world its scoped `audio`, retires the scope on travel, and cleans up its voices. The app disposes the mixer at session end. |
| `audio.ensureProfile(owner)`, `audio.fadeMusic()` | World host | The host supplies an empty profile if a world has no profile after entering. On a failed travel attempt it fades music out. |

Use the world-scoped `audio` from `createWorld({ audio, ... })` or pass it to its local story module. The world’s scope exposes `prepare`, `enter`, and `play`. The app mixer exposes those same calls with app ownership. An effect attempted before playback is running or after the owning world leaves yields a silent handle, with the same `stop` and `setPosition` methods. One-shots are dropped while sound is unavailable. A selected background profile can start when sound becomes available, and the mixer suspends while the tab is hidden.

### Cue fields

- **`category`** routes the sound to `music`, `ambience`, or `effects`. Put UI, dialogue chirps, and combat in `effects`.
- **`file` or `synth`** selects a recording or an oscillator recipe. Synth fields are `hz`, `type` such as `'sine'` or `'triangle'`, `duration` in seconds, and optional `filterHz` for a low-pass filter.
- **`gain`** sets the cue’s level before the category and master gains. Choose a value between 0 and 1, start low, and listen with the other layers playing.
- **`loop`, `loopStart`, and `loopEnd`** set a cue’s default repeat behaviour and a file’s optional loop boundaries in seconds. Valid points satisfy `0 <= loopStart < loopEnd <= duration`. Profile music and ambience force looping. With no points the full file loops. Edit the seam in the export, since profile fades happen on travel and the loop itself repeats at the selected boundaries.
- **`fallback`** is another manifest cue ID for a file that fails to load or decode. The mixer logs the unavailable cue and tries the fallback. Use a fallback in the intended category, with a suitable volume and loop behaviour.

You can reuse a single export under multiple cue IDs with different gains or loop settings. The mixer shares decoded buffers by URL. For a world that switches background layers, list every possible file ID under `cues` when preparing, then pass only the desired music and ambience IDs to `enter`.

## Place effects at the moment they belong

| Sound | Trigger to use | Example in the game |
| --- | --- | --- |
| Item pickup or reward | Confirm the state change and play once | Fire already gates the Candle chime on `progress.apply('earnCandle').changed`. |
| Confirmed interaction | Inside the accepted interaction or phase change | The Overworld hammock uses its registered interaction. The Water shell siren plays as lockdown starts. |
| Click or button activation | After the handler accepts the action | In Metal, add the pipe detent after `board.rotateAtPointer(...)` returns true and before checking for a completed route. HTML button `click` handlers also accept native keyboard activation. |
| Attack whoosh or collision | Swing start or the damage check that succeeds | Use `frame.playerMotion.swingStarted` for the start. Use the accepted hit branch in Void’s [minions](../../src/worlds/void/minions.js) or [boss](../../src/worlds/void/boss.js) for impact. |
| A particular animation beat | Change of phase or crossing a marker in the controlling clock | Use Metal’s phase change to `'forge'` when the flow reaches its destination, or a marker in the same timeline that drives a pose. |
| Continuous machine, flame, or movement | Start the loop on entering its active state and stop it on exit | Keep a handle while shaping on Earth’s wheel. Stop on release, finish, or cancellation. |

Start with the existing examples in the [Fire story](../../src/worlds/fire/story.js), [Overworld entry](../../src/worlds/overworld/index.js), [Water entry](../../src/worlds/water/index.js), and [Metal entry](../../src/worlds/metal/index.js).

For a pipe detent, add `audio` to Metal’s `createWorld` arguments and prepare a `metal.pipe-detent` cue. In the existing `click(event)` function, insert the playback call between the guard and the route check.

```js
if (phase !== 'puzzle' || elapsed < 0.45 || !board.rotateAtPointer(event, canvas, viewCamera)) return;
audio.play('metal.pipe-detent');
route = board.connectedPath();
```

The guard already checks whether a pipe actually turned. This placement also plays the detent on the turn that solves the puzzle.

### Jump, landing, and movement

During full game play, `world.update(dt, frame)` receives optional `frame.playerMotion` after the shared player step. It contains boolean `jumped`, `landed`, and `swingStarted` flags on steps that have one or more events. Landings use the player controller’s ground-contact transition, so standing on a platform and teleporting to a spawn do not generate landing cues. The flags describe the current simulation step. In Fire, you can replace `update: story.update` with this method after registering and preparing the sample.

```js
update(dt, frame) {
  if (frame.playerMotion?.landed) {
    audio.play('fire.lantern-paper', { position: player.position });
  }
  story.update(dt, frame);
},
```

For repeated movement sounds, use distance actually travelled while the relevant movement state is active, or a contact marker in the movement animation. The movement input itself can remain held while the player is blocked. The shared Spirit has no generic footstep cycle or surface-material API. Add a local distance counter or contact marker where the effect belongs, and reset its accumulator on stopping or teleporting. `player.teleportRevision` identifies a teleport so a large position delta can be skipped. For the sword’s actual sweep, `player.strikeWindow()` supplies `active` and `swingId`. If you place a whoosh there, remember the last played ID because the strike window spans multiple steps.

### Animation markers and positions

Use the clock that moves the object. For a timed sequence that owns `elapsed`, capture the previous value before stepping and fire when it crosses the marker. Example from an update where `elapsed` resets at sequence start and `emitter` is a Three.js object.

```js
const previous = elapsed;
elapsed += dt;
if (previous < 0.32 && elapsed >= 0.32) {
  audio.play('fire.lantern-paper', { position: emitter.getWorldPosition(soundPoint) });
}
```

Create `soundPoint` once as a `Vector3` for that sequence. Use the same marker to drive the on-screen action when possible. The comparison catches skipped threshold values and fires once per run. Keep the cue in the same sequence rather than scheduling a separate timer. For reactive events such as a collision, use the accepted event branch directly. Story and control flow can continue immediately after `play`, even if playback is unavailable.

Use mono exports for positional emitters. A one-shot samples its position when played. To follow a moving emitter, store the loop’s handle and call `setPosition(emitter.getWorldPosition(soundPoint))` in its update or presentation method. Start the loop once, stop it when the action ends, and clear the stored handle so the next action can start it again. World retirement also stops its remaining voices. Leave `position` unset for centered sounds such as music, menu clicks, and dialogue heard at a consistent level. A Water surface-to-underwater bed change can use two prepared files and a new `audio.enter` profile on the shoreline transition. The current mixer has no public per-voice filter control for a playing file.

### App-wide UI sounds

For a menu or shell button, the mixer in [`src/app/game.js`](../../src/app/game.js) is app-owned, so a short cue can cross a world transition. Use its existing accepted activation handler to avoid double-playing on keydown and click. A synthesized cue can play as soon as the Start gesture unlocks sound. For file-backed app UI cues, prepare an app-owned `{ cues: [...] }` after a successful unlock and before the first button that uses them. An effect needed on the very first Start press is easiest to keep synthesized.

## Add character speech chirps

Pass an optional `voice(grapheme)` function in the object you give to `ui.say`. The function should return the handle from the world’s `audio.play` call. Keep it synchronous. Each voiced character can have a small bank of original short sounds or synth cues, varied by pitch or timbre. Put file-backed variants in the world profile.

In [`src/worlds/fire/story.js`](../../src/worlds/fire/story.js), this version of Fire’s `say` helper gives Wick two short synth pitches while keeping the existing world signal and authored lines.

```js
let wickVoiceIndex = 0;
const wickVoice = ['fire.wick-voice-low', 'fire.wick-voice-high'];
const say = (...lines) => ui.say({
  speaker: 'Wick',
  lines,
  voice: () => {
    const cue = wickVoice[wickVoiceIndex % wickVoice.length];
    wickVoiceIndex += 1;
    return audio.play(cue);
  },
}, signal);
```

Start with variants around 30–60 ms. Dialogue checks newly revealed letters and numbers and calls the function at most once every 65 ms per line. Whitespace and punctuation alone stay quiet. The callback receives a whole displayed character, including any accent marks, if you want to choose variants by character. The UI stops the active chirp when the line completes or is skipped, when dialogue is canceled, or when a subsequent chirp starts. With reduced motion the full line appears immediately and the voice callback is skipped. Omitting `voice` keeps a line silent, which suits thoughts, narration, or selected quiet moments. Choices use `ui.choose`; put any confirmation sound in the accepted choice handling.

## Listen, mix, and check the release

1. In local **Audio** QA, press **Start sound**, audition the synth and a local file, and move around the emitter. Switch profiles twice and lower Music to check that Effects still plays. Try **Play missing cue** and check for a fallback.
2. In the actual world, play the normal route and trigger each added cue. Jump and land on a platform, then stand still. For a click effect check a valid target and an empty location. For voice, listen through a long line, skip in the middle, advance, leave the world, and repeat with reduced motion. Record the last input and what you heard.
3. After two consecutive world changes, confirm the new beds are audible and the old loops have stopped. Include a destination with no music and a pair sharing the same ID if you use one. Hide and restore the tab during play, then check that an earlier one-shot is not replayed. Listen both with headphones and at normal speaker volume.
4. In `plan/docs/audio-cue-sheet.md`, log take ID, processing, export path, cue ID, level and loop points, world trigger, and a listening checkpoint. The release calls for five distinct original phone takes audible in normal play. A dry master can feed multiple edits and still counts as one take.
5. Run `npm run build` and verify sound under the site’s nested path. On the actual Pages release, refresh in a fresh browser profile, unlock sound with Start, and follow the live milestone walkthrough from Start to the restored Moon.

See the [audio contract](architecture/audio.md) for design goals and the [audio and release milestone](milestones/10-audio-release.md) for the full human acceptance gate.
