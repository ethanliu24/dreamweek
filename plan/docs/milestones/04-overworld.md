# 04 · Make the hub playable

Use simple readable meshes for the first pass. The same island will host the ending. The world registry has one integration owner.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## H1 · Lay out the hub and implement sleep

**Prerequisites** S4
**Required reading** [architecture/world-lifecycle.md](../architecture/world-lifecycle.md), [overworld/gameplay.md](../../../plan/game/worlds/overworld/gameplay.md), [overworld/scenary.md](../../../plan/game/worlds/overworld/scenary.md), [Visual design](../visual-design.md)
**Files in scope** `src/worlds/overworld/index.js`, `src/worlds/overworld/scenery.js`, `src/worlds/registry.js`
**Interfaces** createWorld, register, enterNext

**Requirements** Build island, cloud horizon, exterior cottage, hammock, hub wake point and hearth landmark. Provide the reusable yellow return-ring prop for ordinary dream entries. Bind sleep to nextDream. Use the dev Fire fixture until the real module lands.

**Acceptance** Hammock sleep and hub wake use the same island anchors; walking to the edge is recoverable.
**Verify** Walk the perimeter, approach the hammock, sleep, return and verify camera and positions.
**Out of scope** Cottage interior, additional islands.
**Model** General · medium

## H2 · Render hearth state and enforce cooking gates

**Prerequisites** H1, S1
**Required reading** [architecture/progression.md](../architecture/progression.md), [overworld/gameplay.md](../../../plan/game/worlds/overworld/gameplay.md), [overworld/scenary.md](../../../plan/game/worlds/overworld/scenary.md)
**Files in scope** `src/worlds/overworld/hearth.js`, `src/shared/props/cooking.js`, `src/dev/hub-preview.js`
**Interfaces** nextStationAction, apply, pot shape

**Requirements** Use QA hub seeds after Water, Wood, Metal and Moon. Map each phase to visible props and exactly one valid E action, including both essences, stir, take and feed. Respect retained Candle/Sword. Model post-Metal boil.

**Acceptance** No unplaced filled pot or unlit wood can be skipped by sleeping. Rapid E never consumes two stages.
**Verify** Try hammock first at each gated arrival, then perform the station prompt and inspect hearth and inventory.
**Out of scope** A timed soup minigame.
**Model** General · medium

## H3 · Stage the introduction, reminders and ending

**Prerequisites** H1, H2, S2
**Required reading** [architecture/ui.md](../architecture/ui.md), [Visual design](../visual-design.md), [overworld/story.md](../../../plan/game/worlds/overworld/story.md), [overworld/dialogs.md](../../../plan/game/worlds/overworld/dialogs.md)
**Files in scope** `src/worlds/overworld/story.js`, `src/worlds/overworld/lines.js`, `src/worlds/overworld/plates.js`
**Interfaces** say, plate, feed, ended

**Requirements** Use one composition each for the intro and ending. Deliver the washing-machine motivation, wake thoughts at their specified triggers, and feed sequence. Reuse a basic unconscious Wizard prop until his final model arrives. Reserve OVERWORLD_SUN_RETURN for Void.

**Acceptance** Feeding ends control; the final exchange leaves one concluding image. Wake thoughts appear once after their correct action.
**Verify** Start normally, then load each hub QA seed. Feed and keep pressing E.
**Out of scope** Extra narration or epilogue.
**Model** General · medium

## Human milestone acceptance

**How to test**

1. Start a new game. Advance the intro and washing-machine lines, walk from the hammock to the empty hearth and look out over the island edge. Sleep and verify the iris closes fully.
2. In `?qa` choose Hub after Water. Try the hammock before placing the pot. Place it and check it leaves your carried inventory. In Hub after Wood, place wood and light it separately.
3. Choose Hub after Moon. Add Sun, add Moon, stir, take the soup and feed the Wizard. Read the final lines and press movement keys. The restored Moon image should stay on screen.

**Milestone passes when** the island provides the next objective, the hearth visibly tracks each manual action, and the ending stops play.
