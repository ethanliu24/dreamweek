# Fire — Gameplay

## 1. Overview

A simple vertical platforming / parkour game inspired by *Only Up*, but significantly easier and shorter.

The player climbs a series of large rectangular floating lanterns to reach Wick, who is stranded high above the festival.

After reaching Wick, the player picks him up and carries him back down to the festival grounds.

The experience has two main gameplay portions:
1. Climbing up to rescue Wick.
2. Descending while carrying Wick.

**Target duration:**
- Upward climb: Approximately 30 seconds, absolute maximum 1 minute.
- Entire gameplay experience: Under 5 minutes.
- The descent can be faster or slower depending on the player's chosen route.

## 2. Gameplay Flow

### Part 1 — Climbing Up

**Objective:** Reach Wick at the top of the lantern platforms.

- The player starts on the festival grounds.
- Large rectangular lanterns form a vertical climbing route.
- The player jumps between lanterns to gradually climb higher.
- The route should feel tall and visually impressive.
- The climb should be short, straightforward, and forgiving.
- Reaching the top triggers the rescue interaction with Wick.

### Part 2 — Rescuing Wick

**Objective:** Pick up Wick.

- Wick is frightened and unable to descend by himself.
- The player reaches him and interacts with him.
- The player picks Wick up and carries him.
- The exact pickup animation, carrying pose, and implementation can be freely interpreted.

The player must carry Wick for the entire descent.

### Part 3 — Descending

**Objective:** Return to the festival grounds while carrying Wick.

The player can choose how to descend:

- **Lantern route:** Jump down between the large lantern platforms, gradually making their way towards the ground.
- **Direct descent:** Jump straight down from the top and fall towards the ground.

There is no required route. The player is free to choose whichever approach they prefer.

The descent should be forgiving and should not introduce additional complicated mechanics.

### Part 4 — Completion

When the player carrying Wick reaches the festival grounds:

- Trigger the resolution scene.
- Wick realizes he is safe and visibly relaxes.
- Play the resolution dialogue and animation.
- Wick gives the player the Candle.
- Mark the Fire world as completed.
- Enable the yellow return ring at spawn. E there returns the player through the circular iris.

See `story.md` for the narrative and cinematic sequence, and `dialogs.md` for dialogue.

## 3. Movement and Controls

Keep movement simple:

- Standard character movement.
- Running or walking.
- Single jumping.
- Basic platform collision.
- Interaction to pick up Wick.

No double jump, grappling hooks, dashes, climbing systems, or complicated movement abilities are required.

## 4. Falling and Recovery

Falling should never trap or frustrate the player.

### Before rescuing Wick

- If the player falls during the climb, they land on the ground.
- They do not restart the world.
- They can walk back to the starting point from anywhere on the map and attempt the climb again.
- The ground-level terrain should remain accessible from all possible landing locations.

### After rescuing Wick

- Falling becomes a valid way to descend while carrying him.
- The player can choose to land on the lower lantern platforms or fall directly to the ground.
- No fall damage or forced restart is required.
- Reaching the ground with Wick completes the gameplay portion.

## 5. Level Design Guidelines

- Use large rectangular lanterns as the primary platforms.
- Make platforms generous in size and easy to land on.
- Keep jumps straightforward and readable.
- Avoid precise or difficult platforming challenges.
- Make the climbing route visually clear.
- Create a strong sense of vertical height through the surrounding mountains and scenery.
- Ensure the ground is accessible from anywhere the player might fall.
- Keep the starting point reachable by walking from any ground-level landing location.

The main challenge should come from the feeling of climbing high, not difficult controls.

## 6. Scope and Implementation Freedom

The following decisions are established:
- The level is a vertical lantern-platforming experience.
- The player climbs upwards to reach Wick.
- The climb should take approximately 30 seconds and never exceed 1 minute under normal play.
- The player physically picks up and carries Wick during the descent.
- The player chooses between descending through lanterns or jumping directly down.
- Falling before reaching Wick does not restart the level.
- Reaching the ground with Wick triggers completion.

The exact pickup animation, carrying pose, lantern arrangement, collision implementation, and other minor details can be freely interpreted by the implementer.

Prioritize a simple, reliable implementation over complicated movement or physics systems.

## 7. Related Documents

- `character.md` — Wick's identity, personality, and visual direction.
- `scenery.md` — Festival environment and lantern platform design.
- `story.md` — Narrative sequence, character animations, camera direction, and storyboard.
- `dialogs.md` — Dialogue and triggers.
