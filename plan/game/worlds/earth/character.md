# Bob — The Puddle

## 1. Overview

Bob is a small living mud creature found in the Earth world.

He is essentially a sentient puddle of mud. The player encounters him and eventually reshapes him into a pot using the pottery wheel.

His existence is completely unexplained. There is no particular reason for him to be there.

The humour comes from the deadpan absurdity of finding a living mud creature and abruptly picking it up and reshaping him into a cooking pot.

## 2. Character Identity

- **Name:** Bob
- **Type:** Living mud creature
- **Reference name:** The Puddle
- **Role:** Guardian and pottery subject of the Earth world.
- **Material:** Entirely made of mud and wet clay.

Bob is an innocent, passive little creature. He does not need an elaborate personality or backstory.

## 3. Appearance and Visual Direction

### Overall Shape
- Heavily similar to Alien pou, see references.
- Simple, rounded blob-like silhouette.
- Slightly triangular or domed upper shape with a wide base.
- Low and somewhat puddle-like rather than humanoid.
- Slightly asymmetrical, with soft melted edges.
- A few subtle rounded bumps and irregularities.

### Face
- Two large, simple, expressive eyes.
- White eyeballs with dark pupils.
- Eyes embedded directly into the mud.
- Tiny, minimal mouth.
- Simple expressions with little facial complexity.

### Material
- Natural muddy brown and terracotta tones.
- Smooth, wet clay appearance.
- Subtle surface imperfections.
- Soft highlights, without excessive gloss.

### Modeling Requirements
- The entire character should appear to be one continuous mass of mud.
- No separate geometric body parts.
- No arms or legs are necessary.
- Smooth, organic geometry rather than faceted low-poly geometry.
- Preserve a simple, recognizable silhouette.

The visual direction takes inspiration from simple, expressive alien-blob character designs, while retaining Bob's own puddle-like silhouette and muddy material.

## 4. Animation

Keep animation minimal.

Possible animations:
- Subtle wobbling and squishing.
- Gentle body deformation.
- Blinking.
- Simple eye movements.
- Small facial reactions.
- Spreading or compressing when interacted with.

Bob does not require complicated locomotion or elaborate animation systems.

## 5. Transformation

Bob is eventually reshaped into a pot on the pottery wheel.

The transformation is the main interaction involving his character.

The pot should visibly retain the impression that it was made from Bob's mud.

The exact deformation and animation will be specified in `story.md` and `gameplay.md`.

## 6. Related Documents

- `scenery.md` — Earth environment and pottery wheel.
- `story.md` — Narrative sequence and Bob's transformation.
- `gameplay.md` — Pottery-wheel interaction and crafting mechanics.
- `dialogs.md` — Dialogue, if any.

## Production specification

**Essential.** Bob is 0.56 units high, width 0.82, depth 0.66. Make one flattened bell-shaped ring mesh, offset the apex to one side, broaden the bottom two rings into a puddle skirt. Embed cream eye whites and dark pupils into the upper front with a tiny nearly level mouth below. Warm brown #87543D, roughness ~0.38 and a broad wet highlight. Wobble horizontally after stopping, look up at the spirit and sag between its arms. On the wheel interpolate the same silhouette through a compressed base, raised belly and open rolled rim. Retract face details as the walls rise. Use an inner wall and floor so the opening reads in the shaping view. Retain normalized body height, base and rim variation in the pot builder used by Water and the hub. Firing changes dark wet clay into lighter rough terracotta #C87951 from bottom up.

**Secondary polish.** Offset one lip sector slightly and add two shallow wheel grooves. **Optional.** A tiny dried slip mark beneath the rim. See [Bob's proportions](references/bob/bob.jpeg) and [pot belly and lip](references/items/cooking_pot_clay.jpg).
