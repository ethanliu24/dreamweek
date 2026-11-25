# Wood — Scenery Design

## 1. Overview

An enchanted forest clearing dominated by one enormous ancient tree.

The tree has a large natural hollow opening at its base, which serves as the guardian's home. A small clearing surrounds the tree, providing space for the cooking station and ingredient shelves.

The surrounding forest is dense, with a thick canopy that blocks much of the sunlight. This creates a slightly darker, sheltered atmosphere.

Small glowing particles, butterflies, and fireflies add a subtle magical quality to the environment.

The overall environment should feel cozy, mysterious, ancient, and enchanted.

## 2. Environment Composition

### Main Tree

One enormous ancient tree is the main visual focal point of the environment.

Elements:
- Large, thick tree trunk.
- A natural hollow opening at the bottom of the trunk.
- Large, twisted roots spreading across the surrounding terrain.
- A dense canopy with substantial branches and foliage.
- Organic, irregular tree shapes.

The hollow opening serves as the guardian's home.

The interior does not need extensive detail. It should simply look like a natural hollow where the guardian lives.

The tree should feel significantly larger than the surrounding vegetation and dominate the environment's composition.

### Clearing

A small open clearing surrounds the main tree.

This is where the cooking minigame takes place.

Elements:
- Open ground with grass and natural terrain.
- Cooking station.
- Ingredient shelves and storage.
- Space for the player to move around and interact with the cooking setup.

The exact cooking setup and its decorative details can be freely interpreted by the implementer.

Keep the clearing relatively open and functional. The player should be able to easily identify the cooking station and surrounding ingredients.

### Surrounding Forest

The clearing is surrounded by an enchanted forest.

Elements:
- Smaller trees and dense vegetation.
- Ferns, bushes, and other forest plants.
- Mushrooms scattered throughout the environment.
- Uneven natural terrain.
- Dense foliage surrounding the clearing.

The surrounding forest should frame the main tree and make the clearing feel sheltered.

## 3. Lighting and Atmosphere

The environment should have a slightly darker atmosphere because the dense forest canopy blocks much of the sunlight.

### Lighting
- Subtle natural daylight filtering through the canopy.
- Patches of warm sunlight reaching the clearing.
- Darker shadows beneath trees and dense foliage.
- Soft ambient lighting to maintain visibility.

Avoid making the environment excessively dark. The cooking area and important interactive objects should remain easy to see.

### Atmosphere
- Dense canopy creates a sheltered woodland feeling.
- Soft atmospheric depth between trees.
- Small glowing particles scattered throughout the environment.
- Subtle magical illumination from selected particles.

The magical elements should enhance the environment rather than dominate it.

## 4. Magical Decorations

Small glowing particles, butterflies, and fireflies are used as environmental decoration.

They should be treated similarly to lightweight decorative particles rather than individual characters or gameplay objects.

### Glowing Particles
- Small, faintly glowing particles distributed throughout the forest.
- Subtle floating or drifting movement.
- Sparse enough to avoid visual clutter.
- Can have slightly varied brightness and colours.

### Butterflies and Fireflies
- A few tiny butterflies and fireflies scattered around the environment.
- Gentle, simple movement.
- Small and visually insignificant.
- No interaction or gameplay functionality.

These elements primarily add life and reinforce the enchanted atmosphere.

They do not need complex individual behaviour or animation systems.

## 5. Colour Palette and Materials

Suggested visual direction:

| Element | Visual direction |
|---|---|
| Main tree | Deep brown and natural wood tones |
| Tree roots | Dark earthy brown |
| Foliage | Deep and muted greens |
| Ground | Natural grass and earthy tones |
| Mushrooms | Muted natural colours with occasional brighter accents |
| Lighting | Warm filtered sunlight |
| Magical particles | Subtle warm, green, or pale golden glow |

Materials should feel organic and slightly stylized.

Avoid overly faceted low-poly geometry. Tree trunks, roots, and vegetation should have reasonably smooth, natural silhouettes.

## 6. Technical and Performance Considerations

The environment should be achievable using Three.js meshes and lightweight assets.

| Element | Suggested approach |
|---|---|
| Main tree | Large custom mesh or imported model |
| Hollow opening | Custom trunk geometry with an actual visible opening |
| Tree roots | Reusable curved or organic meshes |
| Canopy | Layered foliage meshes or reusable models |
| Surrounding trees | Reusable models with varied scale and rotation |
| Mushrooms and plants | Lightweight reusable meshes |
| Glowing particles | Instanced meshes or particle system |
| Butterflies and fireflies | Simple lightweight meshes or sprites |
| Cooking setup | Simple reusable props |

### Performance Guidelines
- Give the main tree the most visual detail.
- Reuse models and materials for surrounding vegetation.
- Use instancing for repeated decorative elements where appropriate.
- Keep butterflies and fireflies lightweight.
- Avoid individual dynamic lights for every glowing particle.
- Keep the clearing relatively simple and open.
- Avoid excessive transparent materials and particle overdraw.

## 7. Scope and Creative Freedom

The following aspects are established and should be preserved:

- Enchanted forest setting.
- One enormous ancient tree as the main visual focal point.
- Large natural hollow opening at the bottom of the tree.
- Hollow serves as the guardian's home.
- Small clearing surrounding the tree.
- Cooking station and ingredient shelves in the clearing.
- Slightly darker atmosphere caused by dense forest foliage blocking sunlight.
- Small glowing decorative particles.
- A few tiny butterflies and fireflies.
- Subtle magical atmosphere.

The exact tree design, foliage, cooking setup, vegetation, and minor decorative details can be freely interpreted.

Do not overcomplicate the guardian's home or introduce elaborate architecture.

The goal is to create a beautiful enchanted forest with one memorable central landmark and a functional cooking area.

## Production specification

**Essential.** Frame the clearing through two dark foreground trunks. Main tree rises ≥10 units, trunk ~4 units wide, with three roots forming a cradle for a natural hollow 1.4 units high. Omit front faces below an arched loop in the trunk mesh; bridge the rim to a recessed darker inner lining so parallax reveals real depth. Sweep roots into ground with tapered rings. Place the pit two units in front and to one side of the hollow. Three prepared logs, stones and an adjacent separate gift bundle make the lighting action and reward legible. Dense overlapping opaque canopy clusters surround an open 5-unit clearing. Aim a warm patch onto Mallow and the prepared logs, moss-green ground #607256 under shadow, bark #594436, gold rim #D8B273. Add one small shelf in shade if desired. It has no interaction.

**Secondary polish.** Layer two fern silhouettes, warm airborne seeds and a fire core that grows between logs before Mallow looks up. **Optional.** A pair of butterflies near the canopy break. Study [root silhouette](references/scenary/tree_hole_house.jpeg) and [depth through foliage](references/scenary/enchanted_forest_2.jpg).
