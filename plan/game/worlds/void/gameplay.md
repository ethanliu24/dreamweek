# The Void — Gameplay

## Overview

The Void contains the final combat encounter of Dreamweek.

The player fights one wave of magical cube minions summoned by the Grand Wizard, followed by a boss fight against the Grand Wizard himself.

Both encounters take place on the same white floating arena.

The player is invincible throughout both encounters. There is no player health management, death, or game-over state.

**Target duration:** Approximately 30 seconds per combat stage.

## 1. Minion Wave — Sun

### Objective

Defeat all magical cube minions summoned by the Grand Wizard.

### Enemy Behaviour

The minions are small floating magical cubes.

- Float above the arena.
- Rotate continuously.
- Briefly stop and spin faster before attacking.
- Charge directly towards the player's position.
- Slow down after charging and repeat.

The faster rotation acts as a visual warning before an attack.

### Combat Rules

- The player attacks using the Sword.
- Each minion requires exactly **3 successful hits** to defeat.
- Defeated minions disappear in a short magical effect.
- A small group of minions appears in one continuous wave.
- No additional enemy types or combat stages are required.

### Completion and Reward

After all minions are defeated:

- A glowing golden-white orb appears in the arena.
- The orb represents **Sun Essence**.
- The player collects the orb.

The encounter then transitions directly into the Grand Wizard boss fight.

## 2. Boss Fight — Moon

### Objective

Defeat the Grand Wizard.

### Boss Combat

The player attacks the Grand Wizard using the Sword.

The Grand Wizard has a health value that decreases when the player successfully attacks him.

He uses three attacks throughout the encounter.

### Attack 1 — Belly Bounce

- The Grand Wizard briefly crouches.
- Jumps towards the player's position.
- Lands heavily on the arena.
- Produces a circular purple shockwave.
- Returns to his normal stance.

### Attack 2 — Magic Burst

- The Grand Wizard raises one hand.
- A glowing purple orb forms.
- Launches the orb towards the player's position.
- Briefly recovers before attacking again.

Only one projectile is launched at a time.

### Attack 3 — Tongue Swipe

- The Grand Wizard opens his mouth.
- Extends his tongue directly forward.
- Holds it extended briefly.
- Retracts it and returns to his normal stance.

### Combat Rules

- The player is invincible and cannot die.
- Boss attacks apply a small amount of knockback when they connect.
- There is no player health system or damage management.
- All attacks should have clear visual warnings.
- The encounter should be relatively easy to complete.
- The player can continue attacking between the Grand Wizard's attacks.

### Ultimate Ability

The boss encounter enables the ultimate only for the final blow.

During the boss fight:

- The player continues attacking the Grand Wizard.
- When the Grand Wizard reaches **5% remaining health**, the ultimate becomes available.
- The Q finisher prompt appears.
- The player activates the ultimate manually.
- The ultimate performs a cinematic finishing attack that defeats the Grand Wizard.

The exact ultimate animation and visual presentation will be designed separately.

After the ultimate, the Grand Wizard collapses unconscious onto the arena.

## 3. Moon Essence

After the Grand Wizard is defeated:

- A glowing silver-white orb with purple and lavender light appears near him.
- The orb represents **Moon Essence**.
- The player collects the orb.

The Moon Essence is separate from the actual Moon.

The actual Moon remains inside the Grand Wizard and will only be released after he eats the completed soup in the Overworld.

## 4. Bringing Back the Grand Wizard

After collecting Moon Essence, the player approaches the unconscious Grand Wizard.

- An interaction prompt appears.
- The player presses E to grab and drag him.
- A short interaction animation plays.
- The return transition begins.

The player and Grand Wizard return to the Overworld together.

No extended dragging sequence or additional transportation mechanics are needed.

Use the established circular black transition.

## 5. Player Controls

| Input | Action |
|---|---|
| WASD | Movement |
| Space | Jump |
| E | Interact |
| Attack | Sword attack |
| Ultimate | Activate ultimate ability when available |

The Attack and Ultimate actions use the bindings defined in the player controls.

## 6. Essences and Abilities

### Sun Essence

- Unique golden-white glowing orb.
- Collected after defeating the minion wave.

### Moon Essence

- Unique silver-white glowing orb with purple and lavender highlights.
- Collected after defeating the Grand Wizard.
- Required for the final soup preparation.

### Ultimate Ability

- Becomes available when the Grand Wizard reaches 5% remaining health.
- Activated manually by the player.
- Performs a cinematic finishing move.

## Constraints

- Use one continuous environment for both combat stages.
- Use the same white floating arena throughout.
- One wave of magical cube minions.
- Each minion takes exactly three successful hits.
- Only three boss attacks: Belly Bounce, Magic Burst, and Tongue Swipe.
- The player is invincible throughout both encounters.
- Boss attacks apply only small knockback.
- No player health system, death, or game-over state.
- Void displays the Q prompt and accepts a fresh Q press only during the finisher phase at 5% boss health.
- Keep the Frog Wizard unconscious after defeat.
- Keep the return interaction short.
- Avoid additional combat mechanics or stages.

## Acceptance Criteria

- The player can attack using the configured Attack input.
- The player can defeat the magical cube minions.
- Each minion requires three successful hits.
- Sun Essence appears after the minion wave and can be collected.
- The Grand Wizard enters the arena for the boss encounter.
- All three boss attacks function with clear warnings.
- Boss attacks produce small knockback without damaging player health.
- The ultimate becomes available at 5% remaining boss health.
- The ultimate defeats the Grand Wizard.
- Moon Essence appears and can be collected.
- Both essence pickups unlock the Wizard capture interaction.
- The player can interact with the unconscious Grand Wizard using E.
- The player and Grand Wizard return to the Overworld through the established transition.
