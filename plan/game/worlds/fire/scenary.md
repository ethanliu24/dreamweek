# Fire — Scenery Design

## 1. Overview

A traditional Chinese lantern festival taking place in a surreal mountainous natural landscape at night.

The festival itself should remain recognizable, with traditional Chinese lanterns and decorative elements. The surrounding landscape provides the dreamlike atmosphere through its unusual scale, dramatic mountains, mist, and distant scenery.

The environment should feel beautiful, peaceful, festive, and slightly mysterious.

The primary visual feature is a collection of large, rectangular Chinese lanterns that serve as platforms for the player's parkour traversal.

## 2. Environment and Composition

The environment consists of three visual layers:

### Foreground — Playable Environment

The main land is natural mountainous terrain rather than a built-up town.

Elements include:
- Grassy hills and uneven terrain.
- Rocky outcrops and small cliffs.
- Pine trees and other vegetation.
- Natural paths and clearings.
- Large rectangular lanterns suspended at different heights.

The playable area should be relatively compact. The surrounding scenery should create a sense of scale without requiring a large explorable landscape.

### Midground — Festival Decorations

Traditional Chinese festival elements are scattered throughout the natural environment.

Possible elements:
- Traditional red and gold lanterns.
- Lantern poles and hanging lantern strings.
- Decorative Chinese gates and wooden structures.
- Festival banners, ropes, and ornaments.
- Small pavilions or viewing platforms.

These elements are primarily decorative. Their exact placement and design can be freely interpreted as long as they reinforce the traditional Chinese lantern festival identity.

AI-generated models or other suitable asset sources can be used for decorative elements where appropriate.

### Background — Mountain Landscape

The background should establish the scale and atmosphere of the world.

Elements include:
- Large, layered mountain ranges.
- Distant valleys and unusual rock formations.
- Atmospheric mist and fog between mountains.
- Small glowing lanterns scattered across the landscape.
- A dark nighttime sky.

The landscape can have surreal proportions and unusual formations, but should still feel like a natural environment rather than an entirely floating celestial world.

Distant scenery does not need to be explorable or highly detailed.

## 3. Main Feature — Lantern Platforms

Large rectangular Chinese lanterns are the defining feature of this world.

Unlike ordinary decorative lanterns, these are large enough for the player to stand and jump on. They form the primary visual elements of the parkour environment.

### Appearance
- Rectangular, box-like lantern shape.
- Traditional red or warm orange paper panels.
- Decorative wooden or golden frames.
- Warm internal illumination.
- Traditional ornamental details such as tassels and trim.
- A sufficiently flat and sturdy-looking top surface for standing.

### Variation
- Lanterns can have different sizes and proportions.
- Some can be wider or taller than others.
- Different decorative patterns can be used while retaining a consistent visual identity.
- Lanterns should be visually distinct from smaller decorative lanterns.

Their exact placement, spacing, heights, and traversal sequence will be decided separately during gameplay and level layout design.

## 4. Decorative Lanterns

Smaller lanterns should populate the foreground, midground, and background to create a dense festival atmosphere.

Examples include:
- Hanging lanterns between trees.
- Clusters of lanterns attached to poles and festival structures.
- Small lanterns floating in the distance.
- Lanterns suspended above valleys and near mountain silhouettes.

These lanterns are purely decorative and do not need collision or interaction.

They should create visual depth without competing with the large parkour lanterns for attention.

They can be placed randomly, but spaced at enough distance (not perfectly such that everything has same distance). Can have a random amount X that is configurable.

## 5. Lighting and Atmosphere

The world takes place at night.

### Colour Palette
- Deep navy and dark blue for the sky.
- Cool blue and purple tones for distant mountains and shadows.
- Warm red, orange, and gold for lanterns.
- Dark greens and muted natural colours for vegetation.

### Lighting
- Lanterns provide the primary warm visual lighting.
- The surrounding environment uses cool, subtle ambient illumination.
- Nearby lanterns can provide localized warm lighting.
- Distant mountains should gradually become darker and less detailed.

The contrast between warm lantern light and cool nighttime surroundings is an important part of the visual identity.

The Moon should not be visible in the sky, reflecting the game's central story.

### Atmosphere
- Soft atmospheric fog around distant mountains.
- Subtle mist in valleys.
- Gentle glowing effects around lanterns.
- Optional sparse particles, such as drifting firefly-like lights.

Avoid excessive particles, bloom, or visual effects that obscure the environment.

## 6. Materials and Visual Style

The environment should feel soft, atmospheric, and slightly stylized rather than photorealistic.

Suggested material characteristics:
- Lanterns: Translucent-looking or softly illuminated paper, with wooden or golden frames.
- Terrain: Natural grass, earth, and rock materials.
- Mountains: Smooth, organic surfaces with atmospheric shading.
- Trees: Stylized natural foliage.
- Decorative structures: Warm wooden materials with red and gold accents.

Avoid an overly faceted low-poly appearance. Geometry can remain simple, but silhouettes and shading should feel smooth and deliberate.

## 7. Technical and Performance Considerations

The environment should be achievable using Three.js meshes and relatively lightweight assets.

Suggested implementation approaches:

| Element | Suggested approach |
|---|---|
| Terrain | Displaced subdivided plane or custom terrain mesh |
| Hills and cliffs | Smooth custom meshes |
| Distant mountains | Reusable low-detail mountain meshes |
| Trees | Reusable models or simple mesh combinations |
| Main lanterns | Shared geometry and materials with varied transforms |
| Decorative lanterns | InstancedMesh |
| Distant lanterns | InstancedMesh or billboard sprites |
| Lantern illumination | Emissive materials with a limited number of actual lights |
| Mist | Scene fog and atmospheric layers |
| Decorative structures | Reusable meshes or imported assets |

### Performance Guidelines
- Reuse geometry and materials wherever possible.
- Use `InstancedMesh` for repeated decorative lanterns and vegetation.
- Avoid assigning a separate PointLight to every lantern.
- Use emissive materials for most lanterns, reserving actual lights for selected nearby lanterns.
- Keep distant scenery low-detail.
- Use bloom sparingly, if available.
- Keep decorative assets lightweight and avoid unnecessary transparency and overdraw.

The main lantern platforms should receive more attention than decorative scenery because they are both visually prominent and gameplay-critical.

## 8. Scope and Creative Freedom

The following aspects are established and should be preserved:

- Traditional Chinese lantern festival identity.
- Natural mountainous landscape.
- Nighttime setting.
- Large rectangular lanterns as the main parkour platforms.
- Smaller decorative lanterns throughout the environment.
- Warm lantern illumination against cool nighttime scenery.
- Dreamlike atmospheric presentation.

The exact design and placement of decorative structures, vegetation, mountain formations, and other background details can be freely interpreted.

Do not spend excessive development time on decorative elements that do not contribute to gameplay or the overall visual composition.

The primary goal is to create a beautiful, recognizable environment that supports the lantern-platforming experience without requiring an unnecessarily complex scene.

## Production specification

**Essential.** Build a broad valley floor under the entire route. Make a curved staircase of about 12 rectangular lanterns, mostly 2.4 × 1.8 units with fixed flat tops; tune rises around 0.55–0.75 and gaps around 0.5–0.9 units against the actual single jump. Change heading in shallow bends so the next top stays visible. Reserve an open landing area below Wick's ceremonial lantern. Box each paper core in dark timber rails, red-orange (#D85236) sides and gold top trim; the landing plane coincides with the upper rim. Short tassels hang below the platform. Decorative ribbed lanterns are smaller than half a unit, suspended to the sides. Layer three smooth indigo mountain profiles, muted pines, distant dark valley fog and moonless navy sky (#182743). Use a shared emissive paper material, one warm pool at the festival floor and cool fill on Wick's face.

Frame the opening from low in the valley, follow the lantern up, then leave room screen-right for the seagull to cross. Model it with a tapered ivory spindle, two black-tipped cambered wings and a yellow beak. Hinge wings at shoulders. One falling pale speck passes clear of Wick and draws his gaze down. During play keep the drop and the next landing visible; the top remains stationary after the intro.

**Secondary polish.** Add two sagging ropes of instanced round lanterns behind the course and a slow tassel sway independent of collision. **Optional.** A single distant pavilion. Use [lantern depth](references/scenary/laterns.jpeg) and [ridge overlap](references/scenary/landscape.jpeg).
