# 06 · Investigate the beach, light the pit and repair the forge

Water, Wood and Metal use separate modules. Run all three in sequence to check their hub gates.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## WM1 · Lock the beach and open the reef

**Prerequisites** H2, FE3
**Required reading** [architecture/progression.md](../architecture/progression.md), [Visual design](../visual-design.md), [water/gameplay.md](../../../plan/game/worlds/water/gameplay.md), [water/scenary.md](../../../plan/game/worlds/water/scenary.md), [water/story.md](../../../plan/game/worlds/water/story.md), [water/dialog.md](../../../plan/game/worlds/water/dialog.md)
**Files in scope** `src/worlds/water/index.js`, `src/worlds/water/shore.js`, `src/worlds/water/lines.js`
**Interfaces** fillPot, grantBubble, floorHeight, register

**Requirements** Load the carried pot profile. Implement faucet, shell siren, barrier/sign, Teal announcement and sleepy clam bubble. Gate the continuous reef route and beach exit independently.

**Acceptance** Filled pot stays carried; without a bubble the authored message appears. With it the coast opens and the exit stays closed.
**Verify** Walk to water before/after clam, return to beach and try exit.
**Out of scope** Oxygen, swimming simulation, combat.
**Model** General · medium

## WM2 · Collect and present three independent clues

**Prerequisites** WM1
**Required reading** [architecture/ui.md](../architecture/ui.md), [architecture/progression.md](../architecture/progression.md), [water/gameplay.md](../../../plan/game/worlds/water/gameplay.md), [water/dialog.md](../../../plan/game/worlds/water/dialog.md), [water/character.md](../../../plan/game/worlds/water/character.md)
**Files in scope** `src/worlds/water/investigation.js`, `src/worlds/water/teal.js`
**Interfaces** choose, clearBeach, returnHome

**Requirements** Use sets for found/presented IDs (crab, whistle, jellyfish). Play denial when showing whistle early. With all clues allow any presentation order; distinguish the earlier denial from final presentation. Allow humorous incomplete responses. After all three, confess, reopen and enable ring.

**Acceptance** Duplicate choices never count twice. Resolution retains filled pot and shield.
**Verify** Try confronting early, then choose clues in two different orders on separate runs.
**Out of scope** Branching mystery or clue inventory slots.
**Model** General · medium

## WM3 · Light Mallow’s prepared fire

**Prerequisites** H2, S2
**Required reading** [architecture/decisions.md](../architecture/decisions.md), [architecture/progression.md](../architecture/progression.md), [Visual design](../visual-design.md), [wood/scenary.md](../../../plan/game/worlds/wood/scenary.md), [wood/gameplay.md](../../../plan/game/worlds/wood/gameplay.md), [wood/character.md](../../../plan/game/worlds/wood/character.md), [wood/dialog.md](../../../plan/game/worlds/wood/dialog.md), [wood/story.md](../../../plan/game/worlds/wood/story.md)
**Files in scope** `src/worlds/wood/index.js`, `src/worlds/wood/mallow.js`, `src/worlds/wood/lines.js`
**Interfaces** register, say, helpMallow

**Requirements** Stage hollow, Mallow and prepared pit. Greet, receive request, light with Candle, then talk again for Firewood. Keep hub hearth independent.

**Acceptance** Clear the scene in about 30–60 s. Hub still requires manually placing the newly awarded bundle and lighting it.
**Verify** Try pit before request and reward twice, watch bag and hub fire state.
**Out of scope** Ingredient collection and shelf interactions.
**Model** General · medium

## WM4 · Build the fixed rotatable pipe board

**Prerequisites** H1, P2
**Required reading** [architecture/player.md](../architecture/player.md), [metal/scenary.md](../../../plan/game/worlds/metal/scenary.md), [metal/gameplay.md](../../../plan/game/worlds/metal/gameplay.md)
**Files in scope** `src/worlds/metal/board.js`, `src/worlds/metal/layout.js`, `src/dev/board-preview.js`
**Interfaces** puzzle camera, pointer, connectedPath()

**Requirements** Number rows/columns from 1. Source enters (2,1) from west. Solution follows (2,1)→(2,2)→(1,2)→(1,3)→(2,3)→(3,3)→(3,4)→(3,5)→east outlet. Give each occupied cell its required opposing or adjacent ports, scramble by fixed quarter turns; add detached decoys at (4,1),(4,5). Leave other cells empty. Traverse reciprocal ports with a visited set and require the correct exit side.

**Acceptance** A full path returns ordered cells. Adjacent mismatched ports, a disconnected loop or an empty click cannot solve it.
**Verify** In QA board rotate pieces 90° per click; align all except last, then connect it. Resize and check every cell is visible.
**Out of scope** Tile swaps, random generation.
**Model** General · medium

## WM5 · Connect Clink’s promise to the Sword

**Prerequisites** WM4, H2
**Required reading** [architecture/progression.md](../architecture/progression.md), [Visual design](../visual-design.md), [metal/gameplay.md](../../../plan/game/worlds/metal/gameplay.md), [metal/story.md](../../../plan/game/worlds/metal/story.md), [metal/dialog.md](../../../plan/game/worlds/metal/dialog.md), [metal/character.md](../../../plan/game/worlds/metal/character.md), [metal/scenary.md](../../../plan/game/worlds/metal/scenary.md)
**Files in scope** `src/worlds/metal/index.js`, `src/worlds/metal/clink.js`, `src/worlds/metal/lines.js`
**Interfaces** connectedPath, shot, earnSword

**Requirements** Call from spawn, talk to Clink, enter board with E. Show flow along solved sequence into dim forge; return camera, talk for Sword and unlock ring. Hub water boils during trip.

**Acceptance** Turning the last pipe restores the forge; only Clink hands over the Sword. Swing is available after reward.
**Verify** Try collecting Sword early, repair, talk, return and inspect hearth.
**Out of scope** Additional pipe rooms or enemies.
**Model** General · medium

## Human milestone acceptance

**How to test**

1. Starting after Earth, fill the pot, try to leave, talk to the clam and explore underwater. Show Teal the whistle early. Collect both witnesses and present all three clues in your chosen order. Check the rope comes down.
2. Return with the filled pot, place it at the hub, then enter Wood. Talk to Mallow, light the prepared fire and speak again. Look for both gifts. Back home, place and light the separate wood bundle.
3. Enter Metal. Listen to Clink, use E at the wall and rotate the pipes until the inlet connects to the outlet. Watch energy reach the forge. Collect the Sword from Clink, return and check the boiling water and unlocked swing.

**Milestone passes when** the player reaches Void eligibility through ordinary inputs, with the beach reopened, hub pot boiling, Sword equipped and both Wood rewards accounted for.
