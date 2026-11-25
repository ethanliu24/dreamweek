# Art direction

At the hammock the eye should find three things in order: the spirit lying against blue sky, the warm cottage window, then the empty hearth below. On the last visit, keep this same composition and put the brightest warm accent at the pot. Reusing a view lets a player see what their work changed.

## Shared construction and lighting

Use spirit height as one unit, Y up. Give each place one distant silhouette, one middle-distance landmark and an unobstructed near-field action. Reserve the strongest local value contrast for the actor's face, landing surface or interaction. Reduce distant saturation and shadow contrast in two or three steps. Keep the brightest effects small enough to preserve colour and outlines. Give each actor a full profile, three-quarter and front read at actual follow-camera distance.

Build soft bodies from shaped lathe profiles or displaced ring meshes (24–40 radial samples on hero contours), compute smooth normals, then bury limb roots beneath a changing shoulder or belly contour. Put pivot groups at neck, shoulder, eyelid and prop grip. Use compressed poses, eye direction and a held reaction to communicate the joke. Begin with 0.12–0.25 s anticipation, a quicker action and a readable 0.4–0.8 s settle. Use matte surfaces for cloth, bark and stone (roughness 0.7–0.95), soft broad highlights for clay/skin (0.35–0.6), satin bronze with restrained metalness (0.55–0.75). Give metal a broad light shape to reflect, even in the cavern. Treat hex swatches as sRGB art inputs. Use one renderer exposure and tone mapping choice (ACES filmic, exposure 1) across locations; tune scene lights by eye.

A broad key at roughly 35–55° above the actor shapes cheeks and rims. Hemisphere fill borrows sky and ground hues. Use fog that approaches the horizon colour; retain a clean silhouette for the spirit even in white clouds and on the Void floor. Opaque tinted forms, soft normal gradients and short edge glints convey most magic. Reserve transparency for thin surfaces such as the outer bubble. Yellow rings identify ordinary return points. Differentiate essence pickups by profile and motion as well as colour. Use the [asset budgets](architecture/assets.md) for crowds, lights and particles.

## World sheets

Each **Production specification** at the end of the linked file defines essential construction, secondary polish and optional decoration. Local reference images provide shape, posture or atmosphere cues. Build original meshes.

| Place | Palette and first read | Build sheets |
|---|---|---|
| Overworld | Cobalt sky, muted teal island, warm cottage and hearth | [Island](../../plan/game/worlds/overworld/scenary.md), [spirit](../../plan/game/worlds/overworld/player.md) |
| Fire | Indigo mountain folds, vermilion paper, gold horizontal landing edges | [Lantern festival](../../plan/game/worlds/fire/scenary.md), [Wick](../../plan/game/worlds/fire/character.md) |
| Earth | Pink horizon, pale blue zenith, banded terracotta framing a wet brown silhouette | [Badlands and wheel](../../plan/game/worlds/earth/scenary.md), [Bob and pot](../../plan/game/worlds/earth/character.md) |
| Water | Sand and turquoise at the shore, descending into blue with peach and lilac coral | [Beach, reef and witnesses](../../plan/game/worlds/water/scenary.md), [Teal](../../plan/game/worlds/water/character.md) |
| Wood | Dark green canopy, warm shaft on cream stalk and dusty rose cap | [Hollow and fire pit](../../plan/game/worlds/wood/scenary.md), [Mallow](../../plan/game/worlds/wood/character.md) |
| Metal | Blue-black cavern, old copper turns, turquoise flow arriving at an amber forge | [Forge and grid](../../plan/game/worlds/metal/scenary.md), [Clink](../../plan/game/worlds/metal/character.md) |
| Void | Near-black space, purple limb of a gas planet, white porcelain stage | [Arena and finisher](../../plan/game/worlds/void/scenary.md), [cubes](../../plan/game/worlds/void/minions.md), [Wizard](../../plan/game/worlds/void/grand_wizard.md) |

## Interface and image plates

Use an ink-blue panel (#17243B at ~94% opacity), soft ivory text (#FFF3DC), pale gold focus ring and compact rounded keycap. Use a system sans-serif, 18–22 px for dialogue at desktop, 16 px minimum at smaller widths. A thin inset border and a small Continue chevron give a classic adventure-game reading rhythm. Keep speaker above the body, label player thoughts “Thought”, keep 2–3 lines comfortable and allow long lines to wrap. Anchor the panel bottom-centre with side gutters, maximum width 48rem and space above for faces. Show the objective top-left, inventory top-right, interaction prompt near the avatar but above the dialogue safety zone. A short text label accompanies every icon; keyboard focus remains visible. Aim for 4.5:1 text contrast and ≥40 px pointer targets.

Use a thin ground ring with a break toward the path, two low chevrons for nearby guidance and a clamped arrow for off-screen targets. Reward handoff briefly frames the item before showing its name. In Void, place the boss bar above the action, display the Q prompt at threshold and use a distinct broken bubble icon while recharging. Hide combat UI after the finisher. Keep the black circular iris and reduced-motion full cover in the UI layer.

**Opening plate.** Compose seven small dream vignettes on a loose spiral against ultramarine, the two Void days sharing a white arc. Give the spiral a gap where Monday should sit. Keep the lower quarter quiet for the narrator. **Ending plate.** Repeat the cottage skyline, overstuffed Wizard lower left, spirit by the empty bowl and a newly restored Moon upper right. Cold moonlight picks out roof and clouds. Use two original stills, which can be captured from procedural compositions; each remains fixed through its exchange.

## Visual acceptance

Capture the normal approach, character three-quarter and interaction close-up in a running browser for each world. Check a narrow and wide viewport. At ordinary play distance a person should be able to point to the next interaction, distinguish the character silhouette from the landmark, and see both feet/landing contact or the full puzzle surface. At the iris midpoint every corner is black. Keep secondary effects only after the complete game is playable; optional details can be dropped independently.
