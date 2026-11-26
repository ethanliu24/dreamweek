# Overworld — Story

## Overview

The Overworld is the central hub of Dreamweek. It serves as the starting and ending point of the adventure, connecting the player's journey through the seven dream worlds.

The story is presented primarily through short narration, internal monologues, character interactions, and simple animations.

The introduction and ending use a single representative image each, rather than elaborate cinematic sequences.

## Scene 1 — The Multiverse

**Scene ID:** `OVERWORLD_INTRO`

**Presentation:** Single-image storybook introduction with narration.

The game opens with one representative image showing the multiverse: a collection of interconnected dream worlds.

The narrator introduces the world and its structure:

- The world consists of seven interconnected dream worlds.
- Each world represents one day of the week.
- Each day is associated with a different element.
- Together, the seven worlds form the calendar and the cycle of the week.

The narration then introduces the Grand Wizard, a frog wizard who absolutely despises Mondays.

The Grand Wizard discovers a technique in an ancient historical book. According to the book, eating the Moon will destroy the calendar and eliminate Monday.

The wizard decides to perform the technique and swallows the Moon.

With the Moon gone, the calendar collapses and the order of the week is disrupted.

The ancient historical book also contains instructions for restoring the calendar. It explains that two magical essences are needed:

- Sun Essence
- Moon Essence

The essences must be combined into a special soup and fed to the one who swallowed the Moon.

The player must travel through the dream worlds, gather both essences, prepare the soup, and restore the calendar.

**Presentation notes:**
- Use only one image throughout the entire introduction.
- The image represents the interconnected multiverse.
- Narration is presented through the standard dialogue or text presentation.
- No character animation or elaborate cinematic sequence is required.
- Once the introduction finishes, transition to the playable Overworld.

**Player control:** Disabled during the introduction. Enabled when the player enters the Overworld.

## Scene 2 — The Journey

**Scene ID:** `OVERWORLD_JOURNEY`

**Presentation:** Gameplay with occasional short internal monologues.

The player uses the hammock to enter the different dream worlds.

After returning from certain worlds, the protagonist has a brief internal monologue reflecting on the materials collected and what is needed next.

These thoughts should be very short, usually one line. They serve as gentle reminders of the player's objective and help connect the different worlds into one continuous journey.

### After Fire — `OVERWORLD_FIRE_RETURN`

The player returns with Wick's Candle.

The protagonist reflects on needing a suitable container for the soup.

### After Earth — `OVERWORLD_EARTH_RETURN`

The player returns with the finished empty pot.

The protagonist realizes that the pot needs water.

### After Water — `OVERWORLD_WATER_RETURN`

The player returns carrying the filled pot.

The player manually places the filled pot onto the cooking station.

After placing it, the protagonist reflects on needing firewood to prepare the soup.

### After Wood — `OVERWORLD_WOOD_RETURN`

The player returns with Firewood.

The player places the firewood beneath the pot and uses Wick's Candle to light the cooking fire.

After lighting the fire, the protagonist reflects on needing something to stir the soup with.

### After Metal — `OVERWORLD_METAL_RETURN`

The player returns with the Sword.

The protagonist now has the required tool for stirring the soup, but still needs the magical essences.

### Sun and Moon — `OVERWORLD_SUN_MOON_SEQUENCE`

The Sun and Moon encounters form one continuous sequence.

After obtaining Sun Essence, the Frog Wizard escapes. The player immediately chases him into the Moon encounter.

There is no return to the Overworld or additional hammock interaction between these two encounters.

After defeating the Frog Wizard, the player obtains Moon Essence and brings him back to the Overworld.

## Scene 3 — Preparing the Final Soup

**Scene ID:** `OVERWORLD_FINAL_PREPARATION`

**Presentation:** Gameplay and short character animations.

The player has returned from the Moon encounter with the Frog Wizard and both magical essences.

The cooking station is already prepared:
- The filled pot is on the station.
- Firewood is beneath it.
- The fire has been lit.
- The Sword is available.

The player completes the final preparation:

1. Add Sun Essence to the pot.
2. Add Moon Essence.
3. Use the Sword to stir the soup.
4. Collect the finished soup.
5. Feed the soup to the Frog Wizard.

The feeding interaction triggers the conclusion.

**Player control:** Enabled during the preparation interactions. Temporarily disabled for the feeding sequence.

## Scene 4 — The Moon Returns

**Scene ID:** `OVERWORLD_ENDING`

**Presentation:** Single-image ending with dialogue.

Immediately after the player feeds the soup to the Frog Wizard, show one concluding illustration.

The image should depict the result of the adventure:

- The Frog Wizard is comically overstuffed after eating the soup.
- The Moon has returned to the sky.
- The floating island and its surroundings are illuminated by the restored Moon.
- The protagonist is present in the scene.

The precise image composition is tentative and can be decided later.

The ending dialogue provides a final comedic reaction from the Frog Wizard and a closing thought from the protagonist.

The Moon's return signifies that Monday has been restored and the calendar is whole again.

**Presentation notes:**
- Use one representative image.
- Keep the dialogue brief.
- No additional gameplay or epilogue.
- End the game immediately after the concluding exchange.

**Player control:** Disabled during the ending.

## Story Structure Summary

1. A single-image introduction establishes the multiverse, seven dream worlds, Grand Wizard, missing Moon, and the solution.
2. The player travels through the dream worlds, collecting materials.
3. Short internal monologues connect the journey and remind the player of the next objective.
4. Sun and Moon encounters happen consecutively.
5. The player returns with both essences and the Frog Wizard.
6. The player prepares and feeds him the magical soup.
7. A single concluding image and short dialogue show the Moon restored.

## Notes

- Keep the narrative presentation simple and concise.
- The introduction and ending are image-based, not fully animated cinematics.
- Actual narration, dialogue, and internal monologue text belong in `dialogs.md`.
- Individual dream-world stories belong in their respective world documents.
- Story scenes do not necessarily correspond to separate Three.js scenes.
- Dream entrance and return interactions, cooking station mechanics, and item progression are documented in `gameplay.md`.
