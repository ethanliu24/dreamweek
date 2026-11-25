# Water — Scenery Design

## 1. Overview

The Water world begins on a simple beach before transitioning into a magical underwater coral garden.

The beach is primarily an introductory environment where the player encounters the lifeguard and other beachgoers. It does not need extensive environmental detail.

The underwater environment is the main visual attraction. It should feel beautiful, colourful, mysterious, and dreamlike, with large organic coral formations making up the surrounding terrain and jellyfish swimming throughout the environment.

## 2. Above Water — Beach

### Environment
A simple sunny beach overlooking the ocean.

Elements:
- Sandy shoreline.
- Clear turquoise ocean.
- A few beachgoers scattered around.
- One lifeguard stand.
- Simple coastal scenery.

The beach should feel bright, peaceful, and relatively ordinary compared to the underwater environment.

Keep the environment small and lightweight. It primarily serves as an introduction before the player explores underwater.

## 3. Underwater — Magical Coral Garden

### Environment

The underwater area is the main visual focus of the Water world.

The terrain should consist primarily of beautiful coral formations rather than ordinary sand or rocks.

### Coral Formations
- Large organic coral structures.
- Smaller colourful coral clusters.
- Different shapes, sizes, and silhouettes.
- Coral formations emerging naturally from the seabed.
- Occasional unusual or oversized formations to establish a dreamlike atmosphere.

Corals should feel like part of the natural terrain rather than decorative objects placed on top of a flat surface.

### Jellyfish
Jellyfish swim gently throughout the underwater environment.

- Different sizes and colours.
- Slow, floating movement.
- Soft, translucent bodies.
- Subtle bioluminescent appearance.
- Gentle trailing tentacles.

### Lockdown Barrier

When the beach is placed under lockdown:
- A temporary barrier line is placed across the beach exit / access path.
- Include a simple "BEACH CLOSED" sign.
- The barrier visually communicates that the beach is temporarily inaccessible.
- The barrier is removed once the investigation is resolved.

Keep it simple, using a rope, poles, or lightweight barricades.

### Water Faucet

A small outdoor faucet is placed on the beach.

- Simple, recognizable tap design.
- Attached to a short pipe or small stand.
- Can have a small basin underneath, but this is optional.
- Should look like an ordinary beach fixture rather than elaborate infrastructure.

The player interacts with the faucet to collect water for the soup.

Keep the model simple and easy to implement. It is a functional prop, not a major environmental feature.

They primarily provide atmosphere and a sense of life. They do not need complicated behaviour.

## 4. Lighting and Atmosphere

The underwater environment should have a soft, dreamlike atmosphere.

Suggested elements:
- Blue and turquoise ambient lighting.
- Soft sunlight filtering down from the surface.
- Atmospheric depth and underwater fog.
- Subtle light rays.
- Gentle floating particles.
- Softly glowing coral and jellyfish.

Avoid excessive visual effects that obscure the environment.

## 5. Colour Palette and Materials

| Element | Visual direction |
|---|---|
| Beach | Warm sand, blue sky, turquoise water |
| Underwater | Deep blue, cyan, turquoise |
| Coral | Various colourful marine-inspired tones |
| Jellyfish | Translucent pastel colours with subtle glow |
| Lighting | Soft blue ambient light and sunlight rays |

Coral and environmental shapes should feel organic and smooth rather than faceted or low-poly.

## 6. Technical and Performance Considerations

The environment should be achievable using relatively lightweight Three.js meshes and materials.

Suggested approaches:
- Reusable coral meshes with varied scales and rotations.
- Organic custom meshes for larger coral formations.
- Instanced meshes for repeated smaller coral elements where appropriate.
- Simple animated jellyfish models.
- Shader-based or emissive materials for subtle glowing effects.
- Scene fog and restrained particle effects for underwater atmosphere.

Avoid excessive transparent materials, overdraw, and dynamic lights.

## 7. Scope and Creative Freedom

The following aspects are established:

- Small, simple beach introduction.
- A few beachgoers and one lifeguard stand.
- Underwater environment is the main visual focus.
- Magical coral garden aesthetic.
- Beautiful organic coral terrain.
- Jellyfish swimming throughout the environment.
- Dreamlike blue and turquoise underwater atmosphere.

The exact coral shapes, colours, distribution, and minor environmental details can be freely interpreted.

Do not introduce unnecessary decorative structures or objects. The coral formations and jellyfish should provide most of the visual interest.

Prioritize beautiful environmental composition over environmental complexity.

## Production specification

**Essential.** From spawn show a brass T-handle faucet on a short blue pipe, Teal's raised red-and-ivory chair and the turquoise shore. Frame the station between faucet and clam. Use two poles, sagging rope and a legible BEACH CLOSED board at the return exit. Two simple seated beachgoer silhouettes turn toward the shell siren, then settle on reopening. A continuous shallow ramp leads into a compact coral loop; shift fog from #B2E3DD to #286A88 with depth. Form coral terrain as interlocking rounded shelves. Use a forked peach fan for the crab, a cup of pink coral for the metal whistle, and lavender bells for the jellyfish witness. Keep an open lane between them. A moving narrow highlight on the whistle and a light sand patch behind it identify this small clue.

Clam: hinge two fluted fan shells around the rear edge, 1.5 units wide. Inflate a nose bubble, rotate upper valve open, expand one thin Fresnel rim around the spirit, close and droop back to sleep. Crab: low orange oval, two raised eye stalks, one oversized pointing claw. Jellyfish: pastel bell over 4–6 tapered ribbons; pulse the bell before the ribbons settle. Make the witness larger and stationary at conversation height while other bells drift high across the path. Broad cast light on shore, cyan fill and slower falloff below. Keep text and clues clear through the shield.

**Secondary polish.** Animate two waterline bands, slow caustic colour patches and muted beachgoer reactions. **Optional.** A few distant rays and small bubbles. See [reef light](references/scenary/underwater_scenary_and_jelly_fish.jpeg) and [sleepy shell](references/scenary/sleepy_clam.jpeg).
