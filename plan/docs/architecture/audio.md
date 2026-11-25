# Audio production and playback

The original recordings are a core game deliverable. The author owns the phone takes and FL Studio edits. Keep a cue sheet for the release with source take ID, processing, export path, cue IDs, world/trigger and a listening checkpoint. One recording may feed several cues. Preserve a dry master outside the shipped build. The following are suggested assignments until actual recordings arrive.

| Original take | Example FL Studio export | Where to hear it |
|---|---|---|
| F01 cloth or paper | Trim a close rustle, pitch a second copy down | Hammock lowering, Fire lantern paper |
| F02 tap or stream | Crossfade a water loop; trim one bright drop | Beach faucet, underwater ambience |
| F03 brushed leaves | Layer quiet loop and a short dry transient | Wood canopy, firewood placement |
| F04 struck metal | Gentle ring and separately pitched impact | Metal turn detent, Sword accent |
| F05 ceramic or spoon | Isolate scrape and bowl tap | Earth wheel, final soup stir |

## One context and a small mixer

Use native Web Audio for decoded files, oscillators and position in the same AudioContext. Three supplies camera/world transforms each frame. A separate Three audio listener/context is unnecessary. audio.unlock() creates/resumes the context inside the Start button gesture. Suspended or denied audio leaves the game playable with a visible Enable sound control. On visibility loss suspend; resume only when allowed. Never replay a backlog of effects.

Path: BufferSource or oscillator → optional filter → per-voice gain/envelope → optional PannerNode → category gain → master gain → destination. Categories music, ambience and effects; UI/combat are cue families in effects. Stereo music stays centred; use mono positional samples, modest distance rolloff and update listener position/forward/up from the camera. Ramp master and category controls over 30 ms. Stop releases envelopes before disconnecting nodes.

| Public call | Contract |
|---|---|
| prepare(profile, signal) | Profile lists reusable cue IDs and world music/ambience. Manifest maps each ID to a relative file key or a procedural recipe, category, gain, loop, optional loop points, optional fallback. Many IDs can use the same buffer. |
| enter(profile) | Start its ambient loops and music. Crossfade old and new music with separate voice gains over ~0.8 s. Keep common music if the ID matches. Fade old ambience out. |
| play(id, {position?, loop?, gain?}) → handle | New one-shot source per play. handle.stop(fadeSeconds) and handle.setPosition(vec3). Resolve the cue from the manifest so changing a file never changes world logic. |
| setVolume(categoryOrMaster, value) | Clamp 0–1. Keep settings for the session. |
| leave(owner) / dispose() | Stop owner loops, positional emitters and unneeded one-shots. Mixer retains only a fading music tail until transition completes; stop/disconnect on ended or timeout of active audio clock. Dispose closes the context and releases all decoded buffers. |

assets resolves files against Vite's base. Cache fetch/decode promises by canonical URL; clear failed promises to permit retry. Hold decoded buffers while an active or fading voice uses them, then release unreferenced world files. Reference-count shared loads so an outgoing world's abort cannot cancel a new owner's acquire. Decode once, create sources per play. Loop points are measured in seconds within a particular export. Start with Ogg or MP3 files tested in the target browsers. For missing or undecodable audio log the cue ID once; select the declared generated fallback or silence. The story clock never waits for a sound to finish.

The host gives each world a scoped audio view. Its prepare, enter and play calls bind the active instance ID as owner. leave(owner) is a host call during exit. During a normal swap, the mixer keeps the outgoing music voice until the incoming profile crossfades it. If travel fails or the app is torn down, fade it to silence and release the lease. UI sounds use an app-owned handle.

## Cue map and listening checks

Hub has wind, fabric on sleep, dry logs, low boil and spoon scrape. Fire has paper flutter, ascent and Candle chime. Earth has granular wheel friction under dragging, soft taps and a firing hiss. Water has surf switching to low-passed ambience at the shoreline, siren, bubble and three short clue ticks. Wood has leaf rustle, ignition and warm crackle. Metal has hollow pipe detents, fluid movement and a forge swell. Void has sparse drone, spin riser, impact, separate Sun/Moon intervals and a resolved chord on the finisher. Keep dialogue readable over steady loops; leave silence between important cues. A simple procedural cue can use a sine partial plus filtered noise and a 5 ms attack/150 ms release.

Listen through two consecutive transitions and hide/restore the tab. Check centre music, moving local sound, smooth loops, no stacked ambience, no click at stop and independent sliders. Mute music and still locate the five distinct original takes at their cue-sheet checkpoints. Temporary generated audio can pass development gates; release requires the actual recordings.
