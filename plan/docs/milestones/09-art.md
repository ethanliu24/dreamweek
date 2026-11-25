# 09 · Refine silhouettes, lighting and interaction shots

Work from the existing playable scene. Each card owns one world's finish and its local actor. Review the result at real gameplay scale before adding optional decoration.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## A1 · Resolve the island skyline and two plates

**Prerequisites** G1, H3
**Required reading** [Visual design](../visual-design.md), [overworld/scenary.md](../../../plan/game/worlds/overworld/scenary.md), [overworld/player.md](../../../plan/game/worlds/overworld/player.md), [overworld/story.md](../../../plan/game/worlds/overworld/story.md)
**Files in scope** `src/worlds/overworld/scenery.js`, `src/worlds/overworld/plates.js`, `src/player/spirit.js`
**Interfaces** pot phase, setPose, plate

**Requirements** Implement the island and spirit finish recipes and the two static compositions. Keep Moon absent in the hub sky through capture.

**Acceptance** Hammock, cottage and hearth read at spawn; spirit remains legible against cloud and ground.
**Verify** Capture first wake, lit hearth and last plate at two sizes.
**Out of scope** Extra islands.
**Model** General · medium

## A2 · Light the lantern route and finish Wick

**Prerequisites** G1, FE2
**Required reading** [Visual design](../visual-design.md), [fire/scenary.md](../../../plan/game/worlds/fire/scenary.md), [fire/character.md](../../../plan/game/worlds/fire/character.md), [fire/story.md](../../../plan/game/worlds/fire/story.md)
**Files in scope** `src/worlds/fire/scenery.js`, `src/worlds/fire/wick.js`
**Interfaces** setHeld, shot, platform tops

**Requirements** Finish paper, rails, tassels, mountain depth and Wick's pose sequence. Keep moving decoration clear of landing surfaces.

**Acceptance** A human can identify the next landing and trace Wick's gaze to the falling speck.
**Verify** Inspect a climb, pickup close-up and ground reaction.
**Out of scope** Festival crowd simulation.
**Model** General · medium

## A3 · Finish the clay silhouette and desert

**Prerequisites** G1, FE4
**Required reading** [Visual design](../visual-design.md), [earth/scenary.md](../../../plan/game/worlds/earth/scenary.md), [earth/character.md](../../../plan/game/worlds/earth/character.md)
**Files in scope** `src/worlds/earth/scenery.js`, `src/worlds/earth/bob.js`, `src/shared/props/pot.js`
**Interfaces** pot shape, wheel camera

**Requirements** Shape strata, quartz, puddle skirt, eyes, inner vessel wall and fired finish. Preserve shape parameters across scenes.

**Acceptance** Bob reads in three-quarter view, opening stays visible during crafting and the same pot appears on the hearth.
**Verify** Capture Bob, the wet and fired pot and hub at matched parameters.
**Out of scope** Extra recipes.
**Model** General · medium

## A4 · Light the reef and stage the witnesses

**Prerequisites** G1, WM2
**Required reading** [Visual design](../visual-design.md), [water/scenary.md](../../../plan/game/worlds/water/scenary.md), [water/character.md](../../../plan/game/worlds/water/character.md)
**Files in scope** `src/worlds/water/shore.js`, `src/worlds/water/reef.js`, `src/worlds/water/teal.js`
**Interfaces** clue IDs, bubble visual, camera follow

**Requirements** Build three coral landmark silhouettes, clam opening, crab point, pulsing bells and Teal's increasing discomfort. Keep shell and shield layers inexpensive.

**Acceptance** Whistle and stationary witness stand out in the reef; Teal's face and glasses read from the chair.
**Verify** Follow the clue loop and inspect beach, bubble and confession at two sizes.
**Out of scope** Additional areas.
**Model** General · medium

## A5 · Shape the hollow and Mallow’s reaction

**Prerequisites** G1, WM3
**Required reading** [Visual design](../visual-design.md), [wood/scenary.md](../../../plan/game/worlds/wood/scenary.md), [wood/character.md](../../../plan/game/worlds/wood/character.md)
**Files in scope** `src/worlds/wood/scenery.js`, `src/worlds/wood/mallow.js`
**Interfaces** shot, pit phase, setPose

**Requirements** Make the hollow physically recessed, group roots around the clearing and light the ignition pose. Finish cap, apron and gift bundle.

**Acceptance** Person can point to hollow, pit and Mallow from arrival and distinguish unlit/lit states.
**Verify** Orbit the hollow, inspect Mallow before and after lighting.
**Out of scope** Interior level.
**Model** General · medium

## A6 · Finish the pipe wall, forge and Clink

**Prerequisites** G1, WM5
**Required reading** [Visual design](../visual-design.md), [metal/scenary.md](../../../plan/game/worlds/metal/scenary.md), [metal/character.md](../../../plan/game/worlds/metal/character.md)
**Files in scope** `src/worlds/metal/scenery.js`, `src/worlds/metal/board.js`, `src/worlds/metal/clink.js`
**Interfaces** connectedPath, shot, forge state

**Requirements** Shape tube collars, dormant source/sink, flow stripe and amber forge light. Keep Clink visible against bronze pipes.

**Acceptance** The full grid remains visible and the player can follow the flow from source past Clink to the furnace.
**Verify** Inspect unsolved, solved and Sword handoff in browser.
**Out of scope** Extra cells.
**Model** General · medium

## A7 · Distinguish the belly Moon, essence and planet

**Prerequisites** G1, V3
**Required reading** [Visual design](../visual-design.md), [void/scenary.md](../../../plan/game/worlds/void/scenary.md), [void/minions.md](../../../plan/game/worlds/void/minions.md), [void/grand_wizard.md](../../../plan/game/worlds/void/grand_wizard.md)
**Files in scope** `src/worlds/void/scenery.js`, `src/worlds/void/finish.js`, `src/shared/actors/wizard.js`
**Interfaces** boss phase, shot, setPose

**Requirements** Finish gas bands, clean platform lip, cube runes, frog anatomy and finisher shot. Use separate colour, scale, placement and motion for the three lunar-looking objects.

**Acceptance** A viewer can identify the purple planet, belly Moon and portable Moon Essence after collapse. Both the spirit and strike warnings read on white.
**Verify** Watch all three attack anticipations, one finisher and capture. Review the hub instance of the Wizard too.
**Out of scope** Crowded debris or additional attacks.
**Model** General · high

## Human milestone acceptance

**How to test**

1. Use each world’s `?qa` entry. At its first playable view, point to the main landmark and next objective without opening a design file. Walk close and check the protagonist’s face against the brightest surface.
2. Watch each guardian’s key reaction. Check the Fire landing tops, Earth pot opening, Water whistle, Wood hollow, all twenty Metal cells and the Moon in the fallen Wizard. Capture one wide and one interaction view per world.
3. Repeat the busiest views at a narrow and wide desktop window. Watch for clipping, unreadable prompts, missing silhouettes or effects hiding the target. Compare early and late hub shots from the same place.

**Milestone passes when** all seven settings and their principal characters are recognisable in browser captures, each required interaction remains readable, and opening and ending plates match the story.
