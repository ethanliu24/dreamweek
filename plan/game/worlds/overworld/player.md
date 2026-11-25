# Protagonist — Dream Spirit

## Overview

The protagonist is a small, ghost-like spirit that travels through the different dream worlds.

Its design is intentionally simple, soft, and neutral. It should feel like a little being made of light and mist rather than a traditional ghost.

The protagonist has no defined personality or detailed backstory. It serves as the player's avatar.

## Appearance

- **Body:** Small, rounded body with a slightly tapered, droplet-like silhouette.
- **Material:** Milky translucent white, similar to frosted glass or soft translucent jelly.
- **Face:** Two simple dark eyes and a tiny mouth.
- **Arms:** Two short, rounded arms that emerge naturally from the body.
- **Lower body:** No legs. The body tapers into a soft, slightly wavy wisp.
- **Details:** Very subtle luminous edges and occasional soft reflections.

## Colour and Material

White is the dominant colour. The translucent surface should pick up subtle environmental colours.

Avoid making the character completely transparent or excessively bright. Its main body should remain visible against different environments.

## Personality

The protagonist has no explicitly defined personality.

Keep its behaviour and expressions neutral and minimal. Avoid giving it an elaborate character arc or distinctive personality traits.

## Movement and Animation

The protagonist moves by floating rather than walking.

- **Idle:** Gently floats up and down.
- **Movement:** Glides smoothly just above the ground. The bottom floaty part should lag a bit and be dragged by body.
- **Jump:** Makes a small, buoyant upward hop.
- **Landing:** Slightly squashes before returning to its normal shape.
- **Interaction:** Uses its small arms to interact with objects.
- **Looking:** Slightly tilts its body when observing something.
- **Blinking:** Occasional simple eye blinks.
- **Carrying:** Can hold objects with its small arms when needed. Has an inventory of size 3 (keep it configurable)
- **Attack:** Only possible when obtained the sword from metal world. Holds on one arm and swings on left click.

Animations should be subtle, smooth, and reusable across all worlds.

## Player Capabilities

The protagonist can:
- Move in all directions.
- Jump across gaps and platforms.
- Interact with characters and environmental objects.
- Collect and store items.
- Use collected items when appropriate.
- Carry out the soup preparation interactions in the Overworld.
- Swing sword. Damage applies to the enemies in void world.

## Controls

| Input | Action |
|---|---|
| W | Move forward |
| A | Move left |
| S | Move backward |
| D | Move right |
| Space | Jump |
| E | Interact |
| Left click | Attack (when holding blade only) |
| Left drag | Orbit the camera while exploring |

## Inventory

The protagonist has an inventory for storing collected items and abilities throughout the adventure.

Collected items persist when travelling between dream worlds.

Items do not need to be permanently attached to the character or represented by a physical backpack. Relevant objects can appear in the protagonist's hands during specific interactions.

The inventory layout and interaction details are defined in the Overworld gameplay documentation.

## Character Direction

The protagonist should be recognizable through its simple silhouette and translucent white appearance.

Avoid complicated anatomy, clothing, accessories, or unnecessary decorative features.

The overall design should feel peaceful, mysterious, and naturally connected to the dreamlike world of Dreamweek.

## Production specification

**Essential.** Height 1, widest point 0.65 at mid-belly. Form a continuous off-round shell with a short domed crown and eight tapered lower rings; sinusoidally vary the hem height and trail it behind velocity. Sink the two 0.22-unit arm buds into the upper side contours. Oval charcoal eyes with one glint each and a 0.05-unit mouth sit on the upper third. Use a milky blue-white opaque core (#E8F4F5), cool underside (#B6D8ED) and a narrow pearly rim. A faint blue shaded outline at grazing angles keeps the spirit visible on white stone. Grip pivots sit just forward of the belly and accommodate Bob, Wick and the Sword one at a time.

Float ±0.04 units over 2.4 s, tilt into travel, lag the hem, stretch slightly on jump and squash on contact. Bring both arms forward to carry, one arm across the body to swing/stir. Recline along the hammock curve. Blink by compressing eyes vertically. Preserve a readable face through the bubble and every carry pose.

**Secondary polish.** Add a soft travelling edge highlight and delayed arm settle. **Optional.** Two motes at takeoff. Use the [ghost reference](references/player/dreamy_ghost.jpeg) for the hem and polish.
