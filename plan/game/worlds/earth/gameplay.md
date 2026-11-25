# Earth — Gameplay

## 1. Overview

A simple pottery-crafting experience.

The player encounters Bob, the living mud creature, and reshapes him into a pot using a pottery wheel.

The crafting process consists of three stages:
1. Shape the base.
2. Pull up the walls.
3. Shape the opening.

The pottery wheel spins automatically while the player interacts with the clay.

The goal is to make the player feel like they are crafting a pot without requiring realistic pottery simulation or precise controls.

**Target duration:** Approximately 2–3 minutes.

## 2. Gameplay Flow

### Part 1 — Find Bob

- The player explores the terracotta desert.
- Bob is found somewhere in the environment.
- The player discovers the pottery wheel in the middle of the map.
- Interacting with Bob places him onto the pottery wheel.
- The wheel starts spinning.

### Part 2 — Crafting

The pottery process has three stages.

#### Stage 1 — Shape the Base

**Objective:** Compress and centre the mud to create the base of the pot.

- The wheel spins automatically.
- The player clicks or drags on the clay to shape it.
- The clay gradually becomes flatter and more centred.
- Once the stage is complete, the base automatically settles into a valid shape.

#### Stage 2 — Shape the Walls

**Objective:** Pull the mud upwards to create the body of the pot.

- The player drags upwards on the clay to raise its walls.
- The pot gradually becomes taller.
- The player has some freedom over its height and width.
- The resulting dimensions must stay within predefined minimum and maximum bounds.
- Once the stage is complete, the walls automatically smooth into a valid pot shape.

#### Stage 3 — Shape the Opening

**Objective:** Shape the top of the pot.

- The player adjusts the width of the opening by clicking or dragging.
- The opening can become wider or narrower within predefined limits.
- The player can create a slightly flared or narrower opening.
- Once the stage is complete, the rim automatically smooths into a finished shape.

### Part 3 — Finish the Pot

- Once all three stages are complete, the final pot shape is displayed.
- The game automatically normalizes and smooths the resulting geometry.
- The finished pot should always be recognizable, stable, and usable.
- The player fires the shaped pot at the wheel with the Candle, then collects it.
- Bob's transformation is complete.
- The Earth dream is marked as completed.
- The yellow ring at spawn enables manual return through the circular iris.

## 3. Controls and Shaping Mechanics

The pottery wheel rotates automatically throughout crafting.

The player interacts directly with the clay using the mouse.

Possible interactions:
- Click and hold to shape.
- Drag to adjust the current shaping parameter.
- Release to stop shaping.

The exact input implementation can be chosen by the implementer, provided the three stages remain intuitive and easy to use.

### Shape Constraints

The pot should have predefined minimum and maximum dimensions.

Important constraints:
- The base must have a valid width.
- The body must remain within acceptable width and height ranges.
- The opening must not become excessively narrow or wide.
- The overall shape must remain recognizable as a pot.

**Validation should be extremely forgiving.**

The objective is not to evaluate pottery quality. The player should not be punished for making an unusual or imperfect shape.

When a shaping value approaches or exceeds its allowed range:
- Clamp it to the nearest valid value.
- Gently guide the geometry towards a usable shape.
- Avoid sudden or jarring shape corrections.

### Automatic Shape Correction

When each stage is completed, automatically smooth and normalize the result.

When all stages are finished:
- Ensure the base is stable.
- Smooth the walls.
- Ensure the opening is properly formed.
- Preserve some variation from the player's input.

The finished pot can look slightly different depending on how the player shaped it, but it must always be usable.

Do not implement strict quality checks, scoring, or failure conditions.

## 4. Firing the pot at the Earth wheel

After shaping, keep the wet pot on the wheel. Approach and press E to bring Wick's Candle close. Hold the camera on the clay as it dries to fired terracotta. Enable collection once the heating animation ends. Keep the Candle and record the finished pot's profile for the Water faucet and the hub hearth.

## 5. Implementation Constraints

- One pottery wheel.
- One pot shape.
- Three crafting stages.
- Automatic wheel rotation.
- Simple click-and-drag interaction.
- Predefined minimum and maximum dimensions.
- Generous and forgiving validation.
- Automatic smoothing and shape correction.
- No realistic clay physics or simulation.
- No pot-breaking or failure states.
- No scoring, quality ratings, or multiple recipes.

The geometry can be generated using a rotational profile around the wheel's vertical axis. A Three.js `LatheGeometry`-based approach or an equivalent procedural mesh is suitable.

Keep the shaping system simple and lightweight. The player should see the mud visibly change shape as they interact with it.

## 6. Scope and Creative Freedom

The following decisions are established:

- Bob is placed on the pottery wheel.
- The wheel spins automatically.
- Crafting has three stages: base, walls, and opening.
- The player shapes the mud through clicking or dragging.
- Pot dimensions have minimum and maximum bounds.
- Validation is forgiving.
- The game automatically corrects and smooths the shape.
- The finished pot is always usable.
- The pot is fired using the Candle at the Earth wheel before collection.

The exact deformation algorithm, input mapping, visual feedback, and minor interface details can be freely interpreted by the implementer.

Prioritize a satisfying and responsive crafting interaction over realistic pottery simulation.

## 7. Related Documents

- `character.md` — Bob's identity and visual direction.
- `scenery.md` — Desert environment and pottery wheel.
- `story.md` — Narrative sequence and Bob's transformation.
- `dialogs.md` — Dialogue, if any.
