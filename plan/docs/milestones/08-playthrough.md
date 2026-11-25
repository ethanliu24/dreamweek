# 08 · Complete the uninterrupted game

This is the gate before extended visual refinement. A complete route includes the introduction, the five ordinary returns, the shared final arena and the last dialogue.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## G1 · Connect all production entries and exit gates

**Prerequisites** FE4, WM2, WM3, WM5, V3, H3
**Required reading** [architecture/world-lifecycle.md](../architecture/world-lifecycle.md), [architecture/progression.md](../architecture/progression.md), [architecture/decisions.md](../architecture/decisions.md), [plan/game/overview.md](../../../plan/game/overview.md)
**Files in scope** `src/worlds/registry.js`, `src/app/game.js`, `src/worlds/overworld/index.js`
**Interfaces** nextDream, canReturn, createWorld

**Requirements** Register real modules in authored order; remove development substitutes from the normal route. Resolve import and ownership issues at the registry, keep QA entries behind dev mode.

**Acceptance** A fresh normal Start reaches every weekday and ends at the single restored-Moon plate.
**Verify** Play through without fixture selectors, timing each dream and checking each manual station gate.
**Out of scope** Additional mechanics to pad duration.
**Model** Strong · high, integrating asynchronous travel and progression across all modules.

## G2 · Verify repeated inputs, recovery and cleanup

**Prerequisites** G1
**Required reading** [architecture/world-lifecycle.md](../architecture/world-lifecycle.md), [architecture/assets.md](../architecture/assets.md), [architecture/ui.md](../architecture/ui.md), [architecture/audio.md](../architecture/audio.md)
**Files in scope** `src/runtime/world-host.js`, `src/runtime/assets.js`, `src/dev/preview.js`
**Interfaces** retry, exit, dispose, leave

**Requirements** Investigate observed failures from repeated E, delayed loads, blur mid-puzzle and failed optional audio. Use dev QA to revisit cold/warm worlds; compare settled GPU/voice counts.

**Acceptance** Retry can always reach the intended world, with one player, one prompt, valid camera mode and one chapter reward.
**Verify** Perform five hub/dream cycles, one failed prepare, one hidden tab and one mid-shot resize. Record counts and specific fixes.
**Out of scope** New testing framework.
**Model** General · high

## G3 · Review the story and pacing as a player

**Prerequisites** G1
**Required reading** [architecture/decisions.md](../architecture/decisions.md), [plan/game/overview.md](../../../plan/game/overview.md), [overworld/story.md](../../../plan/game/worlds/overworld/story.md), [overworld/dialogs.md](../../../plan/game/worlds/overworld/dialogs.md)
**Files in scope** `src/ui/guidance.js`, `src/worlds/overworld/story.js`
**Interfaces** objective, prompt, say, plate

**Requirements** Have a person follow in-game guidance without instructions. Record time at each chapter, unreadable prompts and points where the next action was unclear. Fix local cue timing and target placement. Record duration mismatch separately.

**Acceptance** Player understands why to sleep, when to use the ring, which station step comes next and how to finish.
**Verify** Compare active chapter times with local targets and full elapsed time with the 30–40 minute goal; report both.
**Out of scope** New quests, extra dialogue or mandatory waits.
**Model** General · medium

## Human milestone acceptance

**How to test**

1. Run the production preview. Open a fresh tab, press Start and finish the game without `?qa`. Keep a note of elapsed time at every return. Include a pause to explore after one reward; the game should wait for you.
2. Look for one visible change at each return. In particular, bring back a fired empty pot, fill and place it, light the wood, then return from Metal to a boil. Verify Sunday goes straight into Monday.
3. After the Wizard comes home, use Sun, Moon, Sword and soup in order. Read the final exchange. Record any stuck point, duplicated reward, abrupt camera cut or unexpected silence with its world and last input.

**Milestone passes when** a person completes the entire story from a fresh Start without developer controls, a reload or outside instructions. Chapter and full-game timings are recorded.
