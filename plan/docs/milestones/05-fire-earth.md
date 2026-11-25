# 05 · Rescue Wick and make Bob’s pot

These two world teams can work from valid QA entries independently. Join them in weekday order for the milestone gate.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## FE1 · Build the lantern climb and recovery floor

**Prerequisites** H1, P1
**Required reading** [architecture/player.md](../architecture/player.md), [Visual design](../visual-design.md), [fire/gameplay.md](../../../plan/game/worlds/fire/gameplay.md), [fire/scenary.md](../../../plan/game/worlds/fire/scenary.md)
**Files in scope** `src/worlds/fire/index.js`, `src/worlds/fire/scenery.js`
**Interfaces** floorHeight, platform tops, safeSpawn

**Requirements** Implement the ground, rectangular step tops and fixed top lantern; make the route apparent from spawn. Expose an arrival QA entry.

**Acceptance** A normal ascent takes about 30 s and under one minute; every miss lands on accessible terrain.
**Verify** Time two climbs and deliberately miss from three heights.
**Out of scope** Wick dialogue or moving platforms during climb.
**Model** General · medium

## FE2 · Stage Wick’s fright, carry and reward

**Prerequisites** FE1, H2
**Required reading** [architecture/decisions.md](../architecture/decisions.md), [architecture/progression.md](../architecture/progression.md), [fire/character.md](../../../plan/game/worlds/fire/character.md), [fire/story.md](../../../plan/game/worlds/fire/story.md), [fire/dialog.md](../../../plan/game/worlds/fire/dialog.md)
**Files in scope** `src/worlds/fire/wick.js`, `src/worlds/fire/story.js`, `src/worlds/fire/lines.js`
**Interfaces** setHeld, say, earnCandle, canReturn

**Requirements** Block out adult Wick, rising lantern, seagull pass and downward gaze. At the summit use E to carry Wick. Resolve only on ground contact; hand over Candle and enable the ring.

**Acceptance** Both descent routes keep Wick attached. The ground reaction and single gift precede optional departure.
**Verify** Complete a direct drop and a platform descent on separate fresh entries; wait after reward.
**Out of scope** Controllable gondola.
**Model** General · medium

## FE3 · Carry Bob and shape a bounded vessel

**Prerequisites** H1, S2
**Required reading** [architecture/player.md](../architecture/player.md), [Visual design](../visual-design.md), [earth/character.md](../../../plan/game/worlds/earth/character.md), [earth/scenary.md](../../../plan/game/worlds/earth/scenary.md), [earth/gameplay.md](../../../plan/game/worlds/earth/gameplay.md), [earth/dialog.md](../../../plan/game/worlds/earth/dialog.md)
**Files in scope** `src/worlds/earth/index.js`, `src/worlds/earth/bob.js`, `src/worlds/earth/wheel.js`, `src/shared/props/pot.js`
**Interfaces** register, setHeld, puzzle lock, pot shape

**Requirements** Start with an empty wheel, let Bob greet, pick up and carry him, then place him. Hold/drag to compress base; upward drag raises walls; horizontal drag shapes rim. Use an explicit Finish stage control after meaningful input. Clamp normalized values to [0,1], mapping base radius 0.18–0.28, wall height 0.32–0.55 and lip radius 0.21–0.35 units. Spin automatically; fade nonblocking AHH by Bob.

**Acceptance** All three stages visibly reshape the pot, including extreme drags. End with a hollow stable form and no failure state.
**Verify** Shape a squat wide pot and a tall narrow one from two Earth entries. Release pointer outside canvas.
**Out of scope** Clay simulation or scoring.
**Model** General · medium

## FE4 · Fire and collect the pot at the wheel

**Prerequisites** FE3, S1
**Required reading** [architecture/decisions.md](../architecture/decisions.md), [architecture/progression.md](../architecture/progression.md), [earth/story.md](../../../plan/game/worlds/earth/story.md), [earth/dialog.md](../../../plan/game/worlds/earth/dialog.md)
**Files in scope** `src/worlds/earth/story.js`, `src/worlds/earth/lines.js`, `src/worlds/earth/index.js`
**Interfaces** collectPot(shape), E, returnHome

**Requirements** Use the Candle at the wheel after shaping. Show hardening, enable collection, retain shape and Candle and unlock manual return. Consume the opening press only once.

**Acceptance** A shaped wet pot cannot be carried out. The fired pot leaves Earth empty and the station in the hub stays empty.
**Verify** Try the ring before firing, then collect and return. Inspect pot proportions in inventory/held view.
**Out of scope** Firing in the hub.
**Model** General · low

## Human milestone acceptance

**How to test**

1. Start from the hub and enter Fire. Time the climb, miss a lantern on purpose and walk back. Reach Wick and carry him straight off the top. Wait after receiving the Candle, then use the yellow ring.
2. Replay Fire through `?qa` and carry Wick down across several lanterns. He should stay in your arms until you reach the ground.
3. Enter Earth with the Candle. Carry Bob to the wheel, make a broad base, tall walls and a narrow opening. Try to leave before firing. Use the Candle at the wheel, collect the pot, then use the ring. Look for the empty pot and Candle in inventory.

**Milestone passes when** both descents resolve correctly, Earth accepts the three shaping gestures, and the hub offers Water only after the fired pot is collected.
