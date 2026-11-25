# Fire — Story

## 1. Overview

The story follows Wick, the Fire Salamander, during his first-ever lantern festival as a grown salamander.

Wick is extremely proud and cocky. He has always held his head high and chest out, looking upwards and never bothering to look down.

During the festival, he stands on a large ceremonial flying lantern and rises high above the mountains. A seagull flies past and poops, causing Wick to follow it with his eyes. He eventually follows the falling poop downwards, looks down for the first time, and realizes that he is terrified of heights.

The player helps him safely descend. Wick is relieved and comes away from the experience a little more humble.

As a thank-you, he gives the player a Candle, which is needed to light the firewood in the overworld.

## 2. Presentation Conventions

The Fire world is one environment. Its story is divided into narrative scenes, each containing one or more camera shots.

- **Story scene:** A group of related events, such as the introduction or seagull incident.
- **Shot:** A particular camera angle or framing used to present an event.
- **Beat:** An individual action or animation within a shot.

Camera shots do not need to correspond to separate Three.js scenes. They can be implemented by moving or repositioning the camera within the existing world.

### Camera principles

- Use wide shots to establish environments and show scale.
- Use medium shots to show character interactions and body language.
- Use close-ups for important expressions and comedic reactions.
- Use tracking shots when following moving objects or characters.
- Keep camera movements smooth and deliberate.
- Avoid excessive cuts and unnecessary camera movement.
- During gameplay, retain the normal gameplay camera.
- Cinematic camera movements should blend smoothly back into gameplay.

Exact camera coordinates and timing can be determined during implementation.

## 3. Story Scenes

### Scene 1 — The First Lantern Festival

**Type:** Opening cinematic.

**Purpose:** Introduce Wick, his personality, and the festival environment.

Wick has recently become a grown salamander and is conducting his first-ever lantern festival.

He is extremely proud of himself and wants to show everyone how capable he is.

- Wick stands on a large ceremonial flying lantern.
- He holds his head high and chest out, looking upwards with an exaggeratedly proud expression.
- The lantern begins ascending into the night sky.
- Wick confidently poses as he rises above the festival grounds.
- The camera reveals the surrounding mountains, festival, and other floating lanterns.
- The lantern continues climbing until Wick is very high above the ground.

**Animation:**
- Exaggerated proud posture.
- Chest puffed out and head held high.
- Confident facial expressions and gestures.
- Lantern gradually ascending.
- Wick posing confidently during the ascent.

**Camera direction:**
- Begin with a wide establishing shot of the festival and surrounding mountains.
- Slowly move towards Wick as the lantern rises.
- Use a low-angle medium shot to emphasize his proud posture.
- Finish with a wider shot showing the lantern high above the landscape.

**Player control:** Disabled during the opening cinematic. Control is given to the player after the lantern reaches its destination.

**Dialogue:** See `dialogs.md`.

### Scene 2 — The Seagull Incident

**Type:** Scripted cinematic during the level.

**Purpose:** Reveal Wick's unexpected fear of heights.

The lantern has reached a considerable height. Wick is still enjoying himself, completely unaware of how high he is.

A seagull appears.

**Sequence:**

1. A seagull flies across the space in front of and above Wick, moving from right to left from his perspective.
2. Wick notices the bird and follows it with his eyes.
3. While flying past, the seagull poops.
4. The poop falls between Wick and the bird.
5. Wick follows the falling poop with his eyes, gradually moving his gaze downwards.
6. His head follows his gaze, eventually making him look down for the first time.
7. He sees the enormous distance between himself and the ground.
8. His expression changes from curiosity to confusion, then absolute terror.
9. He freezes and becomes visibly frightened.

The poop does not hit Wick. The humour comes from him innocently following the bird and then its poop until he accidentally looks down.

**Animation:**
- Seagull flies from right to left across the foreground, above and in front of Wick.
- Wick's pupils track the bird.
- His eyes shift towards the falling poop.
- His head gradually tilts downwards.
- His expression changes as he realizes how high he is.
- His proud posture collapses.
- He freezes and clutches the lantern.

**Camera direction:**
- Start with a medium side shot of Wick, leaving room above him for the approaching bird.
- Briefly frame the seagull as it crosses from right to left.
- Cut or transition to a closer shot of Wick's face as his eyes track the bird.
- Include the falling poop in the same general viewing direction.
- Follow its descent with a gradual downward camera tilt.
- Transition into Wick's downward point of view, revealing the enormous height and distant ground.
- Cut to a close-up of Wick's face as he realizes what he is seeing.
- Hold briefly on his frightened expression.

The camera should make it obvious that the bird and falling poop are what cause Wick to look down.

**Player control:** Temporarily disabled during the incident. Control returns after Wick reacts.

**Dialogue:** See `dialogs.md`.

### Scene 3 — The Rescue

**Type:** Gameplay with a short scripted interaction.

**Purpose:** Give the player an opportunity to help Wick.

Wick is now too frightened to operate or guide his lantern down.

- He keeps his eyes closed because looking down makes him panic.
- The player climbs the large lantern platforms to reach him.
- Wick remains visibly frightened throughout the climb.
- The player eventually reaches Wick's lantern.
- Wick is unable to operate its controls.
- The player offers to help him descend.

**Animation:**
- Wick keeps his eyes closed or tightly avoids looking down.
- He clings to the lantern and trembles.
- He nervously reacts to the player's arrival.
- During the rescue interaction, the player picks Wick up and he tucks his tail close.

**Camera direction:**
- Use the normal third-person gameplay camera during the climb.
- Once the player reaches Wick, smoothly adjust the camera to frame both characters.
- Use a medium two-shot for their interaction.
- Briefly focus on Wick's frightened expression when appropriate.
- Return to the gameplay camera when the player begins carrying Wick.

**Player control:** Active throughout the climb. A short interaction initiates the descent.

**Dialogue:** See `dialogs.md`.

### Scene 4 — The Descent

**Type:** Player-controlled descent.

Wick shuts his eyes and holds onto the protagonist. Play his descent line after pickup, then return control. The player can jump between lanterns or drop straight to the festival floor. Keep the camera on the player so the next landing is visible. On the first ground contact, frame the pair together and let Wick open his eyes.

### Scene 5 — Resolution

**Type:** Scripted character interaction.

**Purpose:** Resolve Wick's character arc and reward the player.

The player reaches the festival grounds carrying Wick.

- Wick realizes that he is finally safe.
- He slowly opens his eyes and looks around.
- He notices that he is back on solid ground.
- He visibly relaxes and feels relieved.
- He thanks the player for helping him.
- He gives the player a Candle as a thank-you gift.
- Wick is no longer quite as cocky as before. His experience has made him a little more humble.

**Animation:**
- Wick initially remains tense after landing.
- His shoulders relax as he realizes he is safe.
- He slowly opens his eyes.
- His expression changes from fear to relief.
- He presents the Candle to the player.
- His final posture is more relaxed and less exaggeratedly proud than at the beginning.

**Camera direction:**
- Start with a wide shot showing the player landing with Wick.
- Move to a medium shot of Wick as he recovers.
- Use a close-up for his expression as he realizes he is safe.
- Frame Wick and the player together during the thank-you interaction.
- Briefly focus on the Candle when it is presented.
- End with a wider shot of both characters.

**Player control:** Temporarily disabled during the reward presentation.

**Dialogue:** See `dialogs.md`.

### Scene 6 — Departure

**Type:** Transition.

**Purpose:** Conclude the dream and return the player to the overworld.

- The player receives the Candle.
- The Fire dream is marked as completed.
- The player can explore until they press E at the yellow return ring. The black iris closes.
- When the screen fades back in, the player has returned to the overworld.
- The Candle is retained as a permanent progression reward.

**Camera direction:** No special camera work is required. Use the standard circular return transition.

**Player control:** Disabled during the transition.

## 4. Storyboard Summary

| Shot | Scene | Framing / Movement | Main Action |
|---|---|---|---|
| 01 | Festival | Wide establishing shot | Reveal festival and mountains |
| 02 | Festival | Low-angle medium shot | Wick poses proudly |
| 03 | Festival | Wide tracking shot | Lantern ascends |
| 04 | Seagull | Medium side shot | Bird enters from above/right |
| 05 | Seagull | Close-up | Wick tracks bird with his eyes |
| 06 | Seagull | Medium / insert | Bird poops; poop falls |
| 07 | Seagull | Downward tracking tilt | Wick follows falling poop |
| 08 | Seagull | First-person downward view | Reveal enormous height |
| 09 | Seagull | Close-up | Wick realizes he is terrified |
| 10 | Rescue | Third-person gameplay | Player climbs lanterns |
| 11 | Rescue | Medium two-shot | Player reaches Wick |
| 12 | Descent | Gameplay camera | Player starts down carrying Wick |
| 13 | Descent | Medium character shot | Wick clings on nervously |
| 14 | Descent | Wide ground-level shot | Player lands with Wick |
| 15 | Resolution | Medium shot | Wick recovers |
| 16 | Resolution | Close-up | Wick opens his eyes and relaxes |
| 17 | Resolution | Two-shot / insert | Wick gives player the Candle |
| 18 | Departure | Circular iris at return ring | Return to overworld |

The storyboard describes the intended visual sequence, not a requirement to create a unique camera setup for every row. Adjacent shots can share camera setups where appropriate.

## 5. Character Arc

**Pride → Fear → Vulnerability → Relief → Humility**

Wick begins the story extremely proud of himself and his first lantern festival.

His encounter with the seagull accidentally makes him look down for the first time, revealing a fear he never knew he had.

Through the player's help, he safely returns to the ground. He ends the experience relieved, grateful, and a little less arrogant.

He does not lose his confidence entirely. Instead, he learns to be more humble and appreciative of others.

## 6. Dialogue References

All actual dialogue belongs in `dialogs.md`.

Use the following scene identifiers:

- `FIRE_INTRO` — Wick's introduction and his first festival.
- `FIRE_SEAGULL` — Reactions to the bird and discovery of his fear.
- `FIRE_RESCUE` — Wick's reaction to the player's arrival and offer to help.
- `FIRE_DESCENT` — Wick's reactions during the descent.
- `FIRE_RESOLUTION` — Relief, gratitude, and presentation of the Candle.

Dialogue should complement the animations rather than explain everything that is already visually obvious.

## 7. Related Documents

- `character.md` — Wick's identity, personality, creature design, and visual direction.
- `scenery.md` — Festival environment and visual composition.
- `gameplay.md` — Platforming, player objectives, lantern traversal, and controls.
- `dialogs.md` — Actual dialogue, triggers, and delivery.

