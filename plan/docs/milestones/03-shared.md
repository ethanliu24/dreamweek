# 03 · Connect progression, dialogue, travel and sound

Finish the services the dream modules consume. Use human-operable fixtures for state and audio checks until the game can supply each trigger.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## S1 · Encode the progression ledger

**Prerequisites** R3  
**Required reading** [architecture/progression.md](../architecture/progression.md), [architecture/decisions.md](../architecture/decisions.md)  
**Files in scope** `src/state/progress.js`, `src/dev/progress-preview.js`  
**Interfaces** read, apply, nextDream, canReturn, nextStationAction

**Requirements** Implement the transaction table and derived inventory. QA panel offers named valid starting snapshots, active world and command buttons.

**Acceptance** Locked, repeated and out-of-order commands preserve state. Both essence pickups fit with all retained items.  
**Verify** Step through water→potPlaced, woodPlaced→lit and the entire final sequence twice where possible.  
**Out of scope** Disk persistence, gameplay bypasses in production.  
**Model** Strong · high, gates and item ownership cross world boundaries.

## S2 · Deliver the dialogue and circular cover

**Prerequisites** R3, P3  
**Required reading** [architecture/ui.md](../architecture/ui.md), [Visual design](../visual-design.md)  
**Files in scope** `src/ui/hud/`, `src/ui/dialogue/`, `src/ui/iris/`, `src/dev/ui-preview.js`\
**Interfaces** say, choose, iris.close/open, inventory, clearWorld

**Requirements** Add text, Thought, choices and a four-slot inventory view, focus handling and reduced motion. Wire host cover to iris. Include a long line, full inventory and delayed load fixture.

**Acceptance** One press finishes the current reveal or advances one fully visible line; choices retain focus; the fully closed iris covers all corners on resize.\
**Verify** Try keyboard and pointer, cancel a line by a QA scene switch and inspect delayed travel.  
**Out of scope** Authored scene scripts.  
**Model** General · medium

## S3 · Route synthesized and file-based audio

**Prerequisites** R3  
**Required reading** [architecture/audio.md](../architecture/audio.md), [architecture/assets.md](../architecture/assets.md)  
**Files in scope** `src/audio/mixer.js`, `src/audio/manifest.js`, `src/dev/audio-preview.js`  
**Interfaces** unlock, prepare, enter, play, setVolume, leave, dispose

**Requirements** Implement native mixer, owner handles, PannerNode, crossfade and buffer reuse. QA can audition a local uploaded sample plus a procedural cue; include an intentional missing cue with fallback.

**Acceptance** One Start unlocks sound, a sample can loop and play as a one-shot, repeated world changes retire old voices.  
**Verify** Listen in headphones, orbit a QA emitter, lower each category and inspect the voice count after a fade.  
**Out of scope** Final arrangement or original recordings as a development prerequisite.  
**Model** General · high

## S4 · Connect the services in one round trip

**Prerequisites** S1, S2, S3  
**Required reading** [architecture/world-lifecycle.md](../architecture/world-lifecycle.md), [architecture/runtime.md](../architecture/runtime.md), [architecture/progression.md](../architecture/progression.md)  
**Files in scope** `src/app/game.js` and its shell markup/styles, `src/runtime/world-host.js`, `src/worlds/registry.js`, `src/dev/preview.js`, `src/dev/round-trip-preview.js`\
**Interfaces** ctx, enterNext, returnHome

**Requirements** Use dev hub and Fire fixtures to exercise sleep, one reward, an optional wait and manual return. Wire display, camera, UI and mixer to one host.

**Acceptance** A held key cannot retrigger travel. Returning keeps the Candle and guidance points to Earth.  
**Verify** Try locked return, take reward, wait, return and inspect inventory and next destination.  
**Out of scope** Finished hub art.  
**Model** General · medium

## Human milestone acceptance

**How to test**

1. In `?qa` choose Round trip. Try to return before collecting the fixture reward. Collect it, stay for a moment, then use E at the ring. Confirm the top-right inventory shows exactly one Candle and the objective points to Earth.
2. Choose Dialogue. Advance a line, select an option with the keyboard, resize while the iris is closed and check all four corners for leaks. Select occupied inventory slots with 1–4 and verify that empty slots leave the selection unchanged.
3. Choose Audio, press Start sound, audition a local sample and a synth, move around the emitter, then switch profiles twice. Turn music down and confirm effects still play. Try the missing cue and keep playing.

**Milestone passes when** the round trip preserves progress, the interface responds once per action, and sound can transition, fail and recover without interrupting play.
