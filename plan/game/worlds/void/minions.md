# Void Minions — Magical Cubes

## Overview

Small magical cube constructs summoned by the Grand Wizard to attack the player.

They are simple geometric magical entities, with no faces or recognizable anatomy.

## Appearance

- **Shape:** Small floating cubes with slightly beveled edges.
- **Surface:** Dark purple or near-black material, with a subtle crystalline appearance.
- **Markings:** Glowing violet magical runes or patterns across their faces.
- **Core:** A faint purple glow emanating from within.
- **Movement:** Constantly rotate while floating above the arena.

Their design should be simple, mysterious, and visually consistent with the cosmic aesthetic of The Void.

## Ability — Spin and Charge

The cubes attack by charging directly towards the player.

1. The cube briefly stops moving.
2. It begins spinning faster, with its magical markings glowing brighter.
3. It charges in a straight line towards the player's position.
4. After the charge, it slows down and resumes floating.

The faster rotation serves as a visual warning before the attack.

## Design Direction

- Keep all minions visually consistent.
- Use simple geometric shapes and glowing materials.
- Avoid faces, limbs, or additional mechanical details.
- They should feel like magical constructs created by the Grand Wizard, not independent characters.
- Killable in 3 hits.

## Production specification

**Essential.** A 0.5-unit-wide bevelled cube hangs about 0.35 units above its shadow. Use dark amethyst #332543 faces, narrow bevel highlights and one broken violet diamond line on each face. Keep centre of mass and collision box independent of spin. In idle rotate slowly; before charging hold position, increase angular speed and brighten the lines for 0.5 s. Charge along the sampled direction, coast and settle. Flash one face on each valid hit and dissolve into three shrinking slivers on hit three. Keep corners recognisable against the white floor. There are no eyes or limbs.

**Secondary polish.** Shift rune brightness toward white in the final windup. **Optional.** A short fading trail on charge. Study the [crystalline facets](references/minions/minion_1.jpeg).
