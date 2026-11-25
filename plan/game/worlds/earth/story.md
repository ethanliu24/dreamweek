# Earth — Story

## 1. Overview

The player enters a peaceful, surreal terracotta desert and discovers a pottery wheel in the middle of the environment.

Shortly after arriving, Bob, a small living mud creature, approaches the player and greets them.

After Bob asks why the player is there, the protagonist realizes that Bob would make a perfect pot.

The player picks Bob up and places him on the pottery wheel, beginning the crafting gameplay.

After shaping Bob into a pot, the player uses the Candle obtained from Fire to heat and harden the clay. The finished pot is collected as the reward for completing the dream.

The story is intentionally simple and deadpan. Bob is an innocent creature, and the player treats turning him into a pot as a perfectly reasonable solution.

## 2. Narrative Sequence

### Scene 1 — Arrival

**Type:** Environment introduction.

**Purpose:** Establish the Earth environment and introduce the pottery wheel.

- The player enters the dream.
- A short transition reveals the terracotta desert.
- The pottery wheel is visible in the middle of the map.
- The player regains control and can look around.

**Camera direction:**
- Begin with a wide establishing shot of the desert.
- Frame the pottery wheel as a prominent focal point.
- Gradually return to the normal gameplay camera.

**Player control:** Disabled during the brief transition, then enabled.

### Scene 2 — Meeting Bob

**Type:** Scripted character interaction.

**Purpose:** Introduce Bob and establish the absurd premise.

- Bob approaches the player.
- He greets the player casually.
- Bob asks why the player is here.
- The protagonist considers the situation and realizes Bob would make a perfect pot.
- This thought is presented as the protagonist's internal monologue using the game's dialogue text box.

**Animation:**
- Bob approaches with a simple wobbling or sliding movement.
- He looks up at the player.
- Bob displays a simple, innocent expression.
- Bob reacts casually while greeting the player.
- The protagonist's internal monologue follows.

**Camera direction:**
- Use the normal gameplay camera as Bob approaches.
- Briefly frame Bob and the player together.
- Use a closer shot of Bob when he greets the player.
- Keep the camera simple; no elaborate cinematic sequence is needed.

**Player control:** Temporarily paused while Bob introduces himself and the internal monologue appears. Control returns after the interaction.

**Dialogue:** See `dialogs.md` → `EARTH_INTRO`.

### Scene 3 — Picking Up Bob

**Type:** Player interaction.

**Purpose:** Transition naturally into the pottery gameplay.

- A contextual prompt appears: `E — Pick up Bob`.
- The player presses E to pick him up.
- A simple pickup animation plays.
- The player carries Bob to the pottery wheel.
- A placement prompt appears when the player reaches the wheel.
- The player places Bob onto the spinning surface.

**Animation:**
- Bob is lifted from the ground.
- His soft mud body slightly deforms while being carried.
- Bob is placed on the centre of the pottery wheel.

The exact pickup and carrying animations can be freely interpreted by the implementer.

**Camera direction:**
- Retain the normal gameplay camera.
- Briefly frame the pottery wheel when the player approaches it.
- No camera cuts are necessary during pickup and placement.

**Player control:** Enabled throughout the interaction, except during brief pickup and placement animations.

### Scene 4 — Crafting Bob

**Type:** Gameplay.

**Purpose:** Transform Bob into a pot.

- Bob is positioned on the pottery wheel.
- The wheel begins spinning.
- The crafting interface or interaction instructions appear.
- The player completes the three pottery-shaping stages:
  1. Shape the base.
  2. Pull up the walls.
  3. Shape the opening.
- Bob gradually transforms into a recognizable pot.

**Camera direction:**
- Transition to a closer view of the pottery wheel.
- Frame Bob and the rotating surface clearly.
- Keep the camera focused on the crafting interaction.

**Player control:** The player controls the pottery-shaping interaction.

See `gameplay.md` for the complete crafting mechanics.

### Scene 5 — Firing the Pot

**Type:** Player interaction and short animation.

**Purpose:** Harden the finished clay pot using the Candle obtained from Fire.

After completing the pottery stages, the player has a shaped but unfinished clay pot.

- The player receives a prompt to use the Candle on the pot.
- The player interacts with the pot using the Candle.
- A short heating animation plays.
- The flame heats the clay, gradually solidifying it.
- The pot's appearance changes to indicate that it has hardened.
- The finished pot is now ready to be collected.

**Animation:**
- The player brings the Candle close to the pot.
- Warm light from the flame illuminates the clay.
- The pot gradually changes from soft, unfinished clay to hardened terracotta.
- A subtle visual effect can indicate that the firing process is complete.

**Camera direction:**
- Keep the pottery wheel as the focal point.
- Use a slightly closer view during the heating interaction.
- Briefly focus on the pot as its appearance changes.
- Return to the normal camera once the process finishes.

**Player control:** Temporarily paused during the short firing animation. The player initiates the interaction.

### Scene 6 — Collection and Departure

**Type:** Completion and transition.

**Purpose:** Conclude the dream and provide the Pot reward.

- The player collects the hardened pot.
- The Earth dream is marked as completed.
- The player now has the finished Pot as a progression reward.
- The screen gradually fades to black.
- When the screen fades back in, the player has returned to the overworld.

The pot is retained as a permanent progression reward.

## 3. Storyboard Summary

| Shot | Scene | Camera | Main Action |
|---|---|---|---|
| 01 | Arrival | Wide establishing shot | Reveal desert and pottery wheel |
| 02 | Meeting Bob | Medium two-shot | Bob approaches the player |
| 03 | Meeting Bob | Closer character shot | Bob greets the player |
| 04 | Meeting Bob | Dialogue presentation | Player realizes Bob would make a perfect pot |
| 05 | Pickup | Gameplay camera | Player picks up Bob |
| 06 | Pickup | Medium shot | Player places Bob on the wheel |
| 07 | Crafting | Close wheel framing | Player shapes Bob into a pot |
| 08 | Firing | Close wheel framing | Player uses Candle to heat the pot |
| 09 | Firing | Close-up | Pot gradually hardens |
| 10 | Departure | Gameplay camera / fade | Player collects the pot and returns to overworld |

These are presentation guidelines, not requirements for ten separate camera setups. Adjacent shots can share camera positions where appropriate.

## 4. Dialogue References

All actual dialogue belongs in `dialogs.md`.

- `EARTH_INTRO` — Bob greets the player and asks why they are here.
- `EARTH_MONOLOGUE` — The protagonist's internal thought about turning Bob into a pot.

The protagonist's internal monologue should be presented in the same retro-inspired dialogue box, distinguished from Bob's spoken dialogue.

No additional dialogue is necessary during pickup, crafting, or firing.

## 5. Story and Presentation Notes

- Keep the introduction very short.
- Bob should appear completely innocent and unsuspecting.
- The protagonist's decision to turn Bob into a pot should be presented casually, without treating it as a major moral dilemma.
- Most of the humour should come from the contrast between Bob's innocent greeting and the protagonist's immediate realization.
- Avoid unnecessary cutscenes or complicated animations.
- The pottery and firing interactions should be the main experience.
- The Candle obtained from Fire must be used to harden the pot before leaving the dream.

## 6. Related Documents

- `character.md` — Bob's identity, appearance, and visual direction.
- `scenery.md` — Desert environment and pottery wheel.
- `gameplay.md` — Pickup, placement, pottery crafting, and firing mechanics.
- `dialogs.md` — Bob's dialogue and protagonist's internal monologue.
