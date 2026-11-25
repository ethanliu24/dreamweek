# 01 · Run and exchange scenes

Use a floor and a coloured landmark as temporary development fixtures until a real world can exercise the same interfaces.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## R1 · Render a timed scene

**Prerequisites** F2, F3  
**Required reading** [architecture/runtime.md](../architecture/runtime.md), [architecture/assets.md](../architecture/assets.md)  
**Files in scope** `src/runtime/display.js`, `src/runtime/loop.js`, `src/dev/preview.js`  
**Interfaces** createDisplay, game frame

**Requirements** Render a lit floor and landmark in QA fixture A. Fit canvas, cap DPR, pause the clock on hide, expose draw and resource counts in QA.

**Acceptance** Landmark motion stays smooth after resize, hide and restore.  
**Verify** Hide for 10 s, return and compare its motion with the previous speed.  
**Out of scope** Production scenery.  
**Model** General · medium

## R2 · Capture actions and manage control modes

**Prerequisites** F3  
**Required reading** [architecture/runtime.md](../architecture/runtime.md), [architecture/ui.md](../architecture/ui.md)  
**Files in scope** `src/runtime/input.js`, `src/runtime/controls.js`, `src/dev/input-preview.js`  
**Interfaces** sample, clear, acquire(mode)

**Requirements** Map keyboard, pointer, blur, priority locks and edge consumption. QA shows held actions and press count.

**Acceptance** Holding E counts once. UI click cannot also attack; release after blur clears movement.  
**Verify** Hold W while switching tabs, then release outside the canvas and return.  
**Out of scope** Character physics.  
**Model** General · medium

## R3 · Swap and dispose world instances

**Prerequisites** R1, R2  
**Required reading** [architecture/world-lifecycle.md](../architecture/world-lifecycle.md), [architecture/assets.md](../architecture/assets.md)  
**Files in scope** `src/runtime/world-host.js`, `src/worlds/registry.js`, `src/runtime/assets.js`, `src/dev/preview.js`  
**Interfaces** createWorld, prepare, enter, exit, dispose

**Requirements** Implement registry, ownership, cache leases and serial swap. Register QA fixtures A/B, one delayed prepare and a fail-once retry. Use a solid black cover until S2.

**Acceptance** Repeated requests produce one destination; retries leave one active fixture and return counts to a plateau.  
**Verify** Switch A↔B five times and force one failed load, retry and compare counters.  
**Out of scope** Game-specific rewards and iris art.  
**Model** Strong · high, partial preparation and disposal must agree on ownership.

## Human milestone acceptance

**How to test**

1. Open `?qa`, choose Scene A and enlarge and shrink the browser. Look for a lit moving landmark that keeps its shape. Switch tabs for ten seconds and come back.
2. Open the QA input readout. Hold E, release it, then press again. The press count should increase exactly twice. Switch tabs while holding W and release it there; the held indicator should clear.
3. Use the QA switch to alternate A and B five times. Trigger Fail next load. While the screen is covered, choose Retry. Look for one landmark, working controls, and settled resource counts similar to the previous visit.

**Milestone passes when** resize and tab switching are smooth, input clears, and both repeated travel and a failed load recover.
