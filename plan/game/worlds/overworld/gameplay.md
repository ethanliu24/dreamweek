# Overworld — Gameplay

## Overview

The Overworld is the central hub connecting all seven dream worlds.

The player returns here between dreams to manage collected materials and gradually prepare the magical soup.

The main interactions are:
- Sleeping in the hammock to enter the next dream.
- Interacting with the return point inside each dream to return to the Overworld.
- Manually placing materials at the cooking station.
- Preparing the final soup after collecting both magical essences.

The Overworld is primarily a progression hub, not a separate exploration or minigame level.

## 1. Dream Transitions

### Entering a Dream

The hammock serves as the entrance to the dream worlds.

1. The player approaches the hammock.
2. An interaction prompt appears.
3. The player presses E to sleep.
4. The protagonist plays a short animation of lying down.
5. A black overlay closes inward into a circle, completely covering the screen.
6. The next dream loads.
7. The circular overlay opens back up, revealing the new world.

Dreams are entered in the established progression order.

### Returning to the Overworld

Each dream has a designated return point near its spawn area.

1. The player approaches the return point.
2. An interaction prompt appears.
3. The player presses E.
4. The same circular black transition closes.
5. The Overworld loads.
6. The circle opens back up, revealing the Overworld.

Use the same transition effect for entering and leaving dreams.

The player is not automatically returned to the Overworld after completing a dream. They interact with the designated return point.

## 2. Rewards and Progression

Chapter completion records which rewards the player has earned. The pot and hearth track preparation separately.

| World | Reward | Overworld interaction |
|---|---|---|
| Fire | Candle | Use to light the firewood |
| Earth | Finished Pot | Take to Water to fill |
| Water | Filled Pot | Manually place filled pot on cooking station |
| Wood | Firewood | Place beneath pot and light using Candle |
| Metal | Sword | Automatically equip for combat and stirring |
| Sun | Sun Essence, ultimate ability | Use during final soup preparation |
| Moon | Moon Essence | Use during final soup preparation |

### Important Item Behaviour

- **Candle:** Obtained in Fire. Used to harden the pot in Earth and light the firewood in the Overworld. It is not consumed.
- **Pot:** Shaped and hardened in Earth. Carried into Water and filled there. Manually placed on the cooking station after returning from Water.
- **Firewood:** Obtained in Wood. Manually placed beneath the cooking pot and lit using the Candle.
- **Sword:** Obtained in Metal. Retained as the player's weapon and later used to stir the soup.
- **Sun Essence:** Obtained in Sun and kept until the final preparation.
- **Moon Essence:** Obtained in Moon and kept until the final preparation.

## 3. Cooking Station Progression

The cooking station is the main progression feature of the Overworld.

Initially, it is empty.

### After Water — Place the Pot

The player returns from Water carrying the filled pot.

- The player approaches the cooking station.
- An interaction prompt appears.
- The player manually places the filled pot onto the station.
- The pot remains there for the rest of the game.

This is a deliberate interaction. The pot is not automatically placed upon returning from Water.

### After Wood — Prepare the Fire

The player returns from Wood with Firewood.

- The player approaches the cooking station.
- They place the Firewood beneath the pot.
- They use the Candle to light it.
- The fire becomes active and remains lit.

The fire introduces a warm glow to the cooking area.

### After Metal — Obtain the Sword

The player receives the Sword from Clink.

The player automatically equips it for combat and later uses it to stir the soup.

No immediate interaction with the cooking station is required.

## 4. Sun and Moon Sequence

After Metal, the player enters the Sun dream.

The Sun encounter leads directly into the Moon encounter.

- The player defeats waves of mini frogs and obtains Sun Essence and an ultimate ability.
- The Frog Wizard escapes.
- The player immediately chases him into the Moon encounter.
- The player defeats the Frog Wizard and obtains Moon Essence.
- The Frog Wizard is brought back to the Overworld.

There is no return to the Overworld or additional hammock interaction between Sun and Moon.

## 5. Final Soup Preparation

After returning from Moon, the player has both essences and the Frog Wizard is present in the Overworld.

The cooking station is already prepared with the filled pot and active fire.

The player completes the final preparation:

1. Add Sun Essence to the pot.
2. Add Moon Essence.
3. Use the Sword to stir the soup.
4. Collect the finished soup.
5. Feed the soup to the Frog Wizard.

Feeding the soup triggers the ending sequence.

There is no additional cooking minigame.

## 6. Controls and Constraints

- Use E for interactions.
- Use the hammock to enter dreams.
- Use each dream's designated return point to leave.
- Use the same circular black transition for both directions.
- Items should only be placed at the cooking station through deliberate player interactions.
- Keep soup preparation to a small number of clear interactions.
- No additional Overworld minigames or quests.
