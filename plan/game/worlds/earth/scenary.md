# Earth — Scenery Design

## 1. Overview

A surreal terracotta desert / badlands environment with a peaceful, sacred atmosphere.

The landscape consists of warm orange earth, sand, rocks, rolling hills, and unusual geological formations. Scattered crystals emerge from the terrain and float above the landscape, giving the world a mystical, almost holy feeling.

The environment takes place during the day, beneath a soft pink-to-blue gradient sky.

At the centre of the map sits a simple pottery wheel. This is the main focal point of the environment and the location where the player will shape the mud guardian into a pot.

The overall environment should feel natural, ancient, peaceful, and slightly surreal.

## 2. Environment Composition

The environment consists of three visual layers.

### Foreground — Natural Terrain

The main playable area consists of:
- Terracotta soil and sandy ground.
- Small rocks and scattered stones.
- Gentle slopes and rolling hills.
- Larger sandstone outcrops.
- Occasional crystals emerging from the ground.

The terrain should feel predominantly natural, with variations in elevation and surface shape.

### Midground — Geological Formations

The landscape contains larger geological features that establish its identity.

Possible elements:
- Unusual eroded sandstone formations.
- Rounded rock towers.
- Natural stone arches.
- Layered rock formations.
- Smooth, flowing geological shapes.
- Crystal clusters emerging from rocks and hills.

Unusual formations are encouraged but should be used selectively. They should add visual interest without making the environment cluttered or distracting.

### Background — Desert Landscape

The background should establish a sense of scale.

Elements include:
- Large, layered desert hills.
- Distant mesas and sandstone formations.
- Unusual geological silhouettes.
- Sparse crystal formations.
- A clear view of the pink-and-blue sky.

Distant scenery does not need to be explorable or highly detailed.

## 3. Main Feature — Pottery Wheel

A simple standalone pottery spinner should be positioned in the middle of the map.

This is the central focal point of the environment and the location where the player will make the pot.

### Appearance
- A circular, flat spinning surface.
- A short, sturdy pedestal underneath.
- Subtle concentric grooves on the spinning surface.
- Warm terracotta, sandstone, or natural stone materials.
- Simple, slightly sculptural design.

The pottery wheel should look like a standalone traditional pottery turntable, not a complete pottery workstation.

No seat, elaborate machinery, surrounding furniture, or additional workshop structures are necessary.

There should be no clay on the wheel initially.

The wheel should be visually distinct from the surrounding terrain and easy for the player to recognize.

## 4. Crystals

Crystals are an important environmental motif that establishes the world's sacred and mystical atmosphere.

They should appear in two forms.

### Ground Crystals

Crystals emerge naturally from the terrain.

Possible placements:
- Small clusters growing out of rocks.
- Crystals emerging from hills and sandstone formations.
- Isolated crystals scattered across the landscape.
- A few larger formations near the central pottery area.

### Floating Crystals

A small number of crystals float above the landscape.

They should:
- Be distributed sparsely throughout the environment.
- Have varied sizes and orientations.
- Feel naturally suspended rather than arranged in rigid patterns.
- Use subtle floating movement where practical.

### Appearance

Suggested colours:
- Pale pink.
- Lavender.
- Soft blue.
- Translucent white.

Crystals can have subtle illumination and translucency, but should not be excessively bright.

Use restraint. They should reinforce the sacred atmosphere without competing with the pottery wheel as the main focal point.

## 5. Sky and Lighting

The world takes place during the day.

### Sky
- Soft pink-to-blue gradient.
- Pink and peach tones near the horizon.
- Light blue towards the upper sky.
- Gentle colour transitions without harsh boundaries.

The sky should feel peaceful and dreamlike rather than like a realistic desert sky.

### Lighting
- Soft natural daylight.
- Warm sunlight on the terracotta terrain.
- Gentle shadows around rocks and geological formations.
- Subtle highlights on crystals.

Avoid overly harsh sunlight or extremely dark shadows.

## 6. Colour Palette and Materials

| Element | Visual direction |
|---|---|
| Main terrain | Terracotta, burnt orange |
| Sand | Warm beige, pale ochre |
| Rocks | Sandy brown, reddish sandstone |
| Shadows | Deep reddish-brown |
| Sky | Pink, peach, light blue |
| Crystals | Pink, lavender, pale blue, translucent white |
| Pottery wheel | Natural sandstone or warm terracotta |

Materials should feel soft, natural, and slightly stylized.

Avoid overly faceted low-poly geometry. Simple geometry is acceptable, but surfaces and silhouettes should feel smooth and deliberate.

## 7. Technical and Performance Considerations

The environment should be achievable using Three.js meshes and lightweight assets.

| Element | Suggested approach |
|---|---|
| Main terrain | Displaced subdivided plane or custom terrain mesh |
| Hills | Smooth custom meshes |
| Sandstone formations | Reusable sculpted meshes |
| Rocks | Smooth deformed sphere or custom meshes |
| Distant mesas | Low-detail background meshes |
| Ground crystals | Reusable crystal meshes with varied transforms |
| Floating crystals | Reusable meshes with subtle animation |
| Sky | Sky gradient or large background shader |
| Pottery wheel | Simple custom geometry with separate rotating surface |

### Performance Guidelines

- Reuse geometry and materials wherever possible.
- Use instancing for repeated rocks and smaller crystals where appropriate.
- Keep distant geological formations low-detail.
- Avoid excessive transparent materials and overdraw.
- Keep crystal illumination subtle and avoid assigning individual dynamic lights to every crystal.
- Keep environmental animations lightweight.

The pottery wheel should receive more visual attention than minor decorative elements because it is the main focal point of the world.

## 8. Scope and Creative Freedom

The following aspects are established and should be preserved:

- Natural terracotta desert / badlands environment.
- Daytime setting.
- Pink-to-blue gradient sky.
- Sand, rocks, hills, and sandstone formations.
- Unusual geological formations used selectively.
- Crystals emerging from the ground.
- A few crystals floating above the landscape.
- Sacred, peaceful, and mystical atmosphere.
- One simple pottery wheel in the middle of the map.
- No elaborate pottery workshop or surrounding buildings.

The exact shapes and placement of geological formations, crystals, rocks, and minor environmental details can be freely interpreted.

AI-generated models and other suitable assets may be used where appropriate.

The goal is to create a beautiful, natural-feeling desert landscape with a distinct mystical identity, without unnecessary environmental complexity.

## Production specification

**Essential.** Leave a clear 5-unit basin around a central waist-high stone wheel. Place Bob within sight of the arrival ring but off the axis of the wheel so carrying him reads as movement. Set one irregular banded sandstone arch against the sky and tier distant mesas behind it. Shape sandstone with offset rounded horizontal rings, coarse strata and vertex colours (#AD654E, #D99571, #E4B48E). Pink #F0B8B8 horizon blends into #92BDDF blue. Side light makes the strata and wet clay read separately. Group two embedded crystal clusters away from the wheel and suspend three sparse faceted quartz points above the middle ridge. Tint them pale lilac with one pale face, softly bob the floaters. Keep all crystal tips below the wheel close-up sightline or outside frame.

Wheel is a 1.15-unit disk on a 0.55-unit pedestal with two inset concentric rings and an eccentric mark so spinning is obvious. Leave it empty at entry. Aim the craft camera from 15–25° above horizontal so both the profile and opening are visible; maintain a steady view through all three stages and firing.

**Secondary polish.** Offset one sandstone layer and add a thin dry dust band at the wheel base. **Optional.** A few ground pebbles. See [crystal scale](references/scenary/scenary_and_crystal.jpeg) and [turntable](references/scenary/potery_spinner.jpeg).
