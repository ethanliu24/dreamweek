# Earth — Dialogue

## Presentation

Use the game's retro-inspired dialogue box at the bottom of the screen.

- Character animations play before dialogue appears.
- Keep dialogue short, ideally one line at a time.
- The protagonist's internal monologue uses the same dialogue box, but is visually distinguished from spoken dialogue.
- No voice acting or lip-sync is required.
- Most of the humour should come from the situation and animations rather than dialogue.

## EARTH_INTRO

**Trigger:** Bob approaches the player.

**Animation:** Bob waddles or slides towards the player, looks up, and gives a friendly greeting.

**Bob:**
"Hello! What brings you here?"

**Trigger:** Bob finishes speaking.

**Presentation:** The protagonist's internal monologue appears.

**Internal Monologue:**
"Wait... he's made of mud."

**Internal Monologue:**
"He'd make a perfect pot."

## EARTH_INTERACTION

**Trigger:** Player approaches Bob after the introduction.

**UI Prompt:**
`E — Pick up Bob`

Not a blocking dialog but just the text "AHH" popping beside bob and fades away as player picks it up.

No additional dialogue is necessary.

## EARTH_CRAFTING

No dialogue during pottery crafting. None blocking text "AHH" popping beside bob and fades away as player shapes the pottery periodically.

Keep the focus on the player's interaction with Bob and the pottery wheel.

## EARTH_FIRING

No dialogue during firing.

The player uses the Candle to harden the pot.

## EARTH_COMPLETION

No additional dialogue is necessary. The player collects the finished pot and the dream concludes.

## Scene References

| Identifier | Story section |
|---|---|
| `EARTH_INTRO` | Scene 2 — Meeting Bob |
| `EARTH_INTERACTION` | Scene 3 — Picking Up Bob |
| `EARTH_CRAFTING` | Scene 4 — Crafting Bob |
| `EARTH_FIRING` | Scene 5 — Firing the Pot |
| `EARTH_COMPLETION` | Scene 6 — Collection and Departure |
