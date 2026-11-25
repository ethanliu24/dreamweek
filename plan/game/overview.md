# Dreamweek: High-Level Game Plan

## 1. Project Overview

**Project:** A single-player 3D adventure game built with Three.js and hosted on GitHub Pages.

**Assignment:** Create an artistic project around a theme using original field recordings. The goal of the assignment is to actually use the sounds, and game is just a medium to use the recordings.

**Deadline:** December 8.

**Audio:** Music and sound effects will primarily be created from original phone field recordings, edited and processed in FL Studio. At least five original field recordings are required. Recordings can be transformed and reused across the game; they do not need to correspond one-to-one with worlds.

**Technologies**: Native web project in HTML, CSS and JavaScript, using libraries 3JS and WebGL. Open to other libraries or tecnologies, but the game needs to be optimized. Goal is to deploy on GitHub. If a technology is neccessary such that it must need a server to serve something or bundled with Docker, it needs to be discussed.

## 2. Creative Direction

### Aesthetic
- Dreamlike environments inspired by *Sky: Children of the Light*.
- Each dream has its own distinct visual identity.
- Beautiful, atmospheric scenery contrasted with silly characters, situations, and storytelling.
- Smooth, sculptural creature designs, potentially luminous or translucent.
- Avoid faceted, low-poly aesthetics - doesn't have to be perfect but should be detailed enough, as to the reference image.

### Structure
- One central overworld (the protagonist's world).
- Seven dream chapters, one for each day of the week.
- Dreams are self-contained and cannot be seen from the overworld.
- The overworld acts as the central hub, connecting all dreams and showing the player's progress.
- Sunday and Monday share the same world/environment.

### Gameplay and Scope
- Each dream should be completable in a short amount of time, with an absolute maximum of 5 minutes.
- Total game completion target: 30–40 minutes of pure gameplay.
- Players can spend additional time exploring and interacting with the environment.
- Prioritize engaging but straightforward mechanics that can realistically be implemented and polished within the available development time.
- Avoid unnecessary systems and complicated mechanics.
- For gameplay, there should be guiding ui to help player know what to do next. E.g. if player needs to go to a certain place, draw arrows from player to the destination.

### Animations and dialogs
- Animations will likely be done in 3JS with camera pans and disabled user controls, but open to generating gifs or slideshow-slides like things if they are good enough.
- Dialogs during the animations should be more like a classic adventure game, e.g.:
> Rick
> Hi!                                                          continue >
- The animation does the storytelling, and the dialogue box adds a little personality.
- Keep it simple, we don't need voice acting, elaborate lip-sync, or long conversations. This also makes implementation much easier.

## 3. Story

A frog wizard from another world hates Mondays. Since Monday is Moon-day, he swallows the Moon to get rid of Mondays.

Without Monday, the calendar collapses and the world falls into a void. The frog becomes extremely chubby, with the Moon visible inside his stomach.

The protagonist also has a personal reason to be upset: they wanted to use the BFCM sale to buy a washing machine for their laundry. With the calendar gone, BFCM no longer exists.

The protagonist discovers that a magical soup can restore the week. To make it, they must travel through seven dreams, collecting the necessary components and abilities.

The final step is to feed the soup to the frog, making him spit the Moon back out.

## World Progression

The play order is based on the progression of the soup rather than the chronological order of the weekdays.

| Play order | Day | Element | Reward |
|---|---|---|---|
| 1 | Tuesday | Fire | Candle |
| 2 | Saturday | Earth | Finished Pot |
| 3 | Wednesday | Water | Filled Pot |
| 4 | Thursday | Wood | Firewood |
| 5 | Friday | Metal | Sword |
| 6 | Sunday | Sun | Sun Essence + Ultimate |
| 7 | Monday | Moon | Moon Essence |

## Overall Story and Gameplay Flow

### Act I — Introduction

1. Introduce the frog wizard swallowing the Moon.
2. Monday disappears, causing the calendar and world to collapse.
3. Establish the protagonist's personal BFCM motivation as a brief comedic aside.
4. The protagonist discovers that a magical soup can restore the week and must be fed to the frog.
5. The protagonist goes to sleep, entering the first dream.

### Act II — Gathering the Components

Every dream is entered by interacting with the bed in the overworld.

Completing a dream normally triggers a fade-to-black transition, returning the player to the overworld.

| Dream | Reward | Overworld progression |
|---|---|---|
| Fire | Candle | No mandatory interaction. |
| Earth | Finished Pot | Carry the empty pot out of the dream. |
| Water | Filled Pot | Fill the carried pot using the beach faucet. On return, interact with the cooking station to place the filled pot. |
| Wood | Firewood | Place firewood beneath the pot and light it with the Candle. |
| Metal | Sword | No mandatory interaction. The water becomes boiled while the player is away. |
| Sun | Sun Essence + Ultimate | Fight waves of mini frogs. The frog escapes. |
| Moon | Moon Essence | Chase the frog directly into the final boss encounter. Defeat and capture him. |

Sunday and Monday form one continuous sequence in the same environment. The player does not return to the overworld between them.

### Act III — Making the Soup

After defeating the frog and returning to the overworld:

1. Add Sun Essence to the pot.
2. Add Moon Essence to the pot.
3. Stir the soup using the Sword.
4. Take the completed soup from the pot.
5. Feed the soup to the frog.
6. The frog becomes so full that he spits the actual Moon back out.

### Act IV — Ending

The Moon returns to the sky.

Monday is restored, the calendar is repaired, and the world returns to normal.

## 6. Overworld and Transitions

The overworld is the central connective space and should remain consistent throughout the game.

### Entering a dream
- The player interacts with the bed.
- A sleeping animation or transition takes place.
- The dream world loads.

### Returning from a dream
- When player spawns in the game, that's the place where the players will interact with (by pressing E) to return.
- Interaction triggers a quick black overlay that closes in to a circle, and opens back up after transition finished, like cartoon.
- The player wakes up in the overworld when the screen fades back in.
- The reward is retained and progression is updated.
- Player can stay at the worlds for exploration however long they want generally, until they interact with their spawn point.
- The spawn point can just be a small glowing yellow ring on the ground that encloses the player

### Overworld interactions
- The player is free to explore the overworld between dreams.
- Mandatory interactions only occur when needed for soup progression.
- The bed is the primary progression point for entering the next dream.
- The overworld visually reflects the player's progress, especially through the changing state of the soup and cooking station.

## 7. Scope and Development Principles

- Build the overworld as the central progression framework.
- Treat each dream as a relatively independent scene.
- Keep shared progression state for collected rewards and completed dreams.
- Focus on one memorable gameplay idea per dream.
- Reuse common systems where practical.
- Keep transitions and overworld interactions simple.
- Prioritize completing and polishing the full experience over adding extra features.

**Fallback:** If exploration proves too difficult to implement within the deadline, simplify the project into an arena-style game while preserving the story, characters, and progression structure.
