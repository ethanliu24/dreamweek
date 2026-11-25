# 02 · Move, frame and interact

Deliver a spirit that can traverse a floor and platforms, use contextual actions and temporarily yield its camera to a puzzle.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## P1 · Build the spirit and surface controller

**Prerequisites** R1, R2
**Required reading** [architecture/player.md](../architecture/player.md), [Visual design](../visual-design.md), [overworld/player.md](../../../plan/game/worlds/overworld/player.md)
**Files in scope** `src/player/spirit.js`, `src/player/controller.js`, `src/dev/traversal.js`
**Interfaces** step, teleport, setHeld, strikeWindow

**Requirements** Add procedural body, float/glide/jump/land and grip. Provide QA floor, steps, drop and sword toggle. Implement the timed swing data.

**Acceptance** Diagonal and straight travel speed match; each landing permits one next jump; carried mesh follows its grip.
**Verify** Cross steps then drop from top. Compare equipped and empty-handed clicks.
**Out of scope** Enemies and ornate materials.
**Model** General · medium

## P2 · Frame follow, orbit and scripted shots

**Prerequisites** P1
**Required reading** [architecture/player.md](../architecture/player.md), [architecture/runtime.md](../architecture/runtime.md)
**Files in scope** `src/player/camera.js`, `src/dev/traversal.js`
**Interfaces** follow, shot, releaseShot

**Requirements** Implement orbit, damping, obstruction shortening and a switchable front-facing shot. Reset on teleport.

**Acceptance** Spirit and next landing stay visible; releasing shot returns smoothly to follow.
**Verify** Walk beside the QA wall, orbit, enter shot, resize and exit.
**Out of scope** World-specific cinematics.
**Model** General · medium

## P3 · Select one interaction and guide the approach

**Prerequisites** P1, P2
**Required reading** [architecture/player.md](../architecture/player.md), [architecture/ui.md](../architecture/ui.md)
**Files in scope** `src/player/interactions.js`, `src/ui/guidance.js`, `src/dev/traversal.js`
**Interfaces** register, select, prompt, objective

**Requirements** Add two overlapping test props as manual QA fixtures; select deterministically, show E only in range, guide when distant and clear on exit.

**Acceptance** The labelled prop is the one that responds, exactly once per press.
**Verify** Approach both, hold E, leave range, swap fixture and inspect for stale prompts.
**Out of scope** Reward and dialogue logic.
**Model** General · medium

## Human milestone acceptance

**How to test**

1. In `?qa` choose Traversal. Use WASD and Space to cross the steps. Spam Space midair, then drop to the floor. Land, jump again and walk back to the start.
2. Left-drag near the wall to orbit. With the sword equipped, verify the drag leaves the swing count unchanged and a left click adds one swing. Enter and leave the QA camera shot; the camera should recover behind the spirit and keep the floor visible.
3. Follow the guidance arrow to the two props. Press and hold E. Only the named prop should respond once. Step away and make sure the prompt goes away.

**Milestone passes when** a person can traverse, orient the camera and activate a chosen prop without a stuck jump, camera or prompt.
