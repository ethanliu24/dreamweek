# Dreamweek — Planning Documentation

For the current file layout, resolved design decisions and executable milestones, start with the [planning index](../plan/README.md). The directory sketches and planning status below record the original design-stage proposal.

This directory contains the design specifications and planning documents for Dreamweek.

It serves as the source of truth for understanding the game's concept, story, individual worlds, visual direction, gameplay, and implementation requirements.

**This documentation is intended to be consumed by both humans and AI coding agents.** Documents should provide enough detail for an implementer to understand what needs to be created without having to infer important design decisions.

---

# 1. Directory Structure

```text
plan/
├── README.md
│
├── docs/
│   └── overview.md
│
└── worlds/
    ├── overworld/
    │
    ├── fire/
    │   ├── character.md
    │   ├── scenery.md
    │   ├── story.md
    │   ├── gameplay.md
    │   ├── dialogs.md
    │   └── references/
    │
    ├── earth/
    ├── water/
    ├── wood/
    ├── metal/
    ├── sun/
    └── moon/
```

Not every world needs every document. Create documents when there is enough design information to justify them.

Additional files can be introduced when a world requires them, such as `audio.md`, `assets.md`, or `animations.md`.

Do not create unnecessary empty documents.

# 2. Global Documentation

## `docs/overview.md`

**Purpose:** Describe the game as a whole.

This is the starting point for understanding Dreamweek. It should contain information that applies across multiple worlds or affects the overall game.

### Contents

- Project overview and assignment requirements.
- Overall creative and artistic direction.
- Main story premise.
- Overall story progression.
- World order and relationships between worlds.
- Rewards, abilities, and shared progression.
- Overworld and dream transitions.
- Overall gameplay duration and development constraints.
- High-level game flow diagram (Mermaid).

### Guidelines

Keep this document relatively concise and high-level.

Do not put detailed character descriptions, individual world stories, dialogue, level layouts, or world-specific implementation instructions here.

Those belong in their respective world directories.

When a global decision changes, update this document and any affected world specifications.

---

# 3. World Documentation

Each world has its own directory under `worlds/`.

A world should be treated as an independent design and implementation unit.

**Do not force all worlds to share the same gameplay mechanics, scripts, assets, audio, or internal implementation.**

Different worlds can have completely different gameplay and technical requirements.

The only necessary global integration is that worlds participate in the overall game progression:
- The player can enter the world.
- The player can complete its objective.
- The world provides its reward.
- Completion is communicated to the overall game.
- The player returns to the overworld, unless the story explicitly connects it to another world.

World-specific scripts, assets, dialogue, and audio should belong to that world rather than being unnecessarily grouped into global categories.

## 3.1 `character.md`

**Purpose:** Define the identity and design of important characters in the world.

### Contents

- Name and species.
- Role in the world.
- Personality and behaviour.
- Character background.
- Physical appearance and visual direction.
- Distinctive features.
- Important mannerisms and expressions.
- General animation characteristics.

### Guidelines

Describe the character as a cohesive creature or design rather than a collection of disconnected geometric parts.

Include enough visual information for an artist or AI model generator to understand the intended design.

Detailed animation sequences belong in `story.md`. Actual spoken lines belong in `dialogs.md`.

A world can have multiple characters. Organize them under separate headings rather than creating a separate file for every character unless necessary.

---

## 3.2 `scenery.md`

**Purpose:** Define the world's environmental and visual direction.

This document should give an implementer enough information to construct the environment.

### Contents

- Overall environment concept.
- Geographic and environmental setting.
- Environmental composition.
- Foreground, midground, and background elements.
- Important visual landmarks.
- Main environmental features.
- Colour palette.
- Lighting and atmosphere.
- Materials and visual style.
- Environmental decoration.
- Technical and performance considerations.
- Scope and creative freedom.

### Guidelines

Describe the environment visually and spatially.

Distinguish between:
- **Gameplay-critical elements:** Objects and structures that affect player movement or interactions.
- **Decorative elements:** Objects that provide atmosphere but do not require collision or interaction.
- **Background elements:** Distant scenery that creates depth and establishes scale.

Include implementation suggestions when they help achieve the intended result, especially when performance is relevant.

Avoid specifying exact gameplay sequences or player objectives. Those belong in `gameplay.md`.

It is acceptable to give implementers creative freedom over minor decorative details, provided the main visual identity is preserved.

---

## 3.3 `story.md`

**Purpose:** Define the complete narrative and cinematic presentation of the world.

This is the main reference for understanding what happens throughout the world, how the story is presented, what characters do, and how the camera communicates events.

It should be detailed enough for an implementer to reproduce the intended narrative experience without inventing missing story events or presentation details.

### Contents

- Story overview.
- Chronological story progression.
- Narrative scenes and their purposes.
- Events and actions within each scene.
- Character animation cues.
- Camera angles and movements.
- Player-control states.
- Scene transitions.
- Storyboard.
- References to dialogue identifiers in `dialogs.md`.
- Related documentation.

### Organization

Organize the story chronologically, dividing it into meaningful narrative scenes.

A story scene is a group of related events. It does **not** necessarily represent a separate Three.js scene.

Each story scene should contain:

1. **Scene title and identifier:** A stable identifier for referencing the scene elsewhere.
2. **Purpose:** What the scene communicates or accomplishes.
3. **Presentation type:** Cinematic, gameplay, scripted interaction, transition, etc.
4. **Sequence of events:** What happens, in chronological order.
5. **Animation cues:** Character movements, expressions, and environmental animations.
6. **Camera direction:** How the scene should be framed and presented.
7. **Player control:** Whether the player can move, interact, or is temporarily watching.
8. **Dialogue references:** Identifiers pointing to relevant sections in `dialogs.md`.
9. **Transition:** How the scene ends and what happens next.

### Camera and storyboard conventions

Camera direction is important and should not be omitted.

For every significant cinematic event, describe:
- Camera framing (wide, medium, close-up, etc.).
- Camera angle and perspective.
- Camera movement (tracking, panning, tilting, dolly, stationary, etc.).
- What the camera should focus on.
- What visual information the shot should communicate.
- How the camera transitions to the next shot.

Include a storyboard showing the important shots in chronological order.

A recommended format:

| Shot | Scene | Camera | Action | Purpose |
|---|---|---|---|---|
| 01 | Introduction | Wide establishing shot | Reveal environment | Establish setting |
| 02 | Introduction | Medium shot | Character performs an action | Introduce character |
| 03 | Incident | Close-up | Character reacts | Communicate emotion |

Not every small animation requires a new shot. Combine actions within the same shot when appropriate.

Exact camera coordinates and timings are not required unless they are important to the intended composition. Describe the intended result clearly enough that an implementer can translate it into actual camera movements.

### Player control and cinematic conventions

Clearly distinguish between:
- Scripted animations.
- Player-controlled gameplay.
- Scripted events that occur during gameplay.
- Interactions that temporarily pause player control.
- Guided sequences where the player initiates an event but does not actively control it.
- Transitions between sections.

The story should not become a sequence of unnecessary cutscenes. Preserve player agency wherever appropriate.

### Dialogue references

Do not write actual dialogue in `story.md`.

Instead, reference stable dialogue identifiers from `dialogs.md`.

For example:

```markdown
**Dialogue:** See `dialogs.md` → `FIRE_SEAGULL`.
```

This keeps the story, camera direction, and animations independent from the actual dialogue wording.

---

## 3.4 `gameplay.md`

**Purpose:** Define the actual gameplay experience and mechanics of the world, may point to sections from story to anchor its position with the dialogs and animations.

An implementer should be able to understand what the player does, what controls are needed, and what constitutes completing the world.

### Contents

- Gameplay overview.
- Player objectives.
- Gameplay flow.
- Player movement and controls.
- Main mechanics.
- Interactions and environmental rules.
- Obstacles and challenges.
- Failure states and recovery.
- Checkpoints and respawning.
- Reward acquisition.
- World completion conditions.
- Integration with overall progression.
- Target duration.
- Acceptance criteria.

### Guidelines

Be specific about mechanics.

For example, avoid saying only that the player performs platforming. Explain:
- How the player moves and jumps.
- What platforms can be interacted with.
- What happens when the player falls.
- Whether checkpoints exist.
- How the player reaches the objective.
- How completion is detected.

Keep mechanics appropriate to the world's intended scope.

A world should prioritize a small number of memorable gameplay ideas over unnecessary complexity.

Story events should be referenced from `story.md` rather than duplicated in full.

---

## 3.5 `dialogs.md`

**Purpose:** Contain all actual spoken dialogue for the world.

This is the source of truth for dialogue wording.

### Contents

- Dialogue grouped by story scene.
- Dialogue identifiers.
- Speaker.
- Dialogue text.
- Trigger conditions.
- Delivery and emotional tone.
- Optional animation or expression cues.
- Branching dialogue, where applicable.
- Dialogue completion conditions.

### Organization

Group dialogue using the stable scene identifiers defined in `story.md`.

Example:

```markdown
# Fire — Dialogue

## FIRE_INTRO

**Trigger:** During the introduction, when Wick presents himself.

**Speaker:** Wick

**Delivery:** Extremely proud and confident.

- "Example dialogue..."

## FIRE_SEAGULL

**Trigger:** Immediately after Wick notices the seagull.

**Speaker:** Wick

**Delivery:** Casual curiosity, followed by confusion.

- "Example dialogue..."

## FIRE_RESCUE

...

```

### Guidelines

- Keep dialogue consistent with the character's personality.
- Specify delivery and emotional tone where relevant.
- Specify when dialogue plays relative to animations and events.
- Use stable identifiers so `story.md` can reference dialogue reliably.
- Keep dialogue reasonably short, especially during gameplay.
- Avoid repeating narrative information that is already obvious through animation.

Do not describe the entire story again in this document.

---

## 3.6 `references/`

**Purpose:** Store visual and audio references relevant to the world.

Possible contents:
- Environment inspiration.
- Character references.
- Architecture and decoration references.
- Lighting references.
- Material and texture references.
- Animation references.
- Audio inspiration.

Use descriptive filenames rather than generic names such as `image1.png`.

When useful, annotate references with their intended purpose and which part of the design they support.

References are inspiration and visual guidance, not necessarily assets to reproduce exactly.

Keep reference material separate from finished production assets.

---

# 4. Additional World-Specific Documents

Worlds are not required to follow a rigid set of documents.

Create additional documents when the design genuinely needs them.

Examples:

| File | Purpose |
|---|---|
| `audio.md` | World-specific sound design, music, and audio cues |
| `assets.md` | Required models, textures, effects, and asset specifications |
| `animations.md` | Detailed animation specifications when too extensive for `story.md` |
| `puzzles.md` | Detailed rules for complex puzzles |
| `interactions.md` | Detailed interaction specifications |
| `ui.md` | World-specific user interface requirements |

Do not create additional documents just to split content unnecessarily.

If the information is small, keep it in the appropriate existing document.

---

# 5. Documentation Principles

All planning documents should follow these principles.

## 5.1 One source of truth

Avoid duplicating information across multiple documents.

For example:
- Character identity and personality belong in `character.md`.
- Environment design belongs in `scenery.md`.
- Narrative sequence and camera direction belong in `story.md`.
- Actual dialogue belongs in `dialogs.md`.
- Player mechanics belong in `gameplay.md`.
- Game-wide decisions belong in `docs/overview.md`.

Other documents should reference the relevant source rather than reproduce its entire contents.

## 5.2 Be implementation-oriented

Plans should describe intended behaviour, not just ideas.

Prefer:

"After the lantern reaches the ground, Wick closes his eyes briefly, then slowly opens them and realizes he is safe."

Instead of:

"Wick gets scared and eventually feels better."

Describe actions, conditions, transitions, camera framing, and expected outcomes where relevant.

## 5.3 Separate established decisions from creative freedom

Make it clear which details must be preserved and which can be interpreted by the implementer.

Use distinctions such as:

- **Established:** Must be implemented as described.
- **Suggested:** Recommended approach, but alternatives are acceptable.
- **Creative freedom:** The implementer can decide the details as long as the overall direction is preserved.

Do not leave important decisions as open questions in implementation-ready documents.

Resolve them during planning or explicitly delegate a decision to the implementer with clear constraints.

## 5.4 Keep worlds independent

Do not force shared mechanics or implementation patterns between worlds simply because they belong to the same game.

For example, one world may use platforming, another investigation, and another a crafting minigame.

They can have completely different internal scripts, assets, models, audio, and mechanics.

Only share functionality when there is a genuine benefit. Overall game progression and world transitions should remain compatible with the global plan.

## 5.5 Keep documentation synchronized

When a design decision changes:
1. Update its authoritative document.
2. Check whether other documents reference the old decision.
3. Update affected references.
4. Remove outdated or contradictory descriptions.

Do not maintain multiple conflicting versions of the same decision.

---

# 6. Working With AI Coding Agents

When continuing work in a new session, use this reading order.

### Step 1 — Understand the project

Read:
1. `plan/README.md`
2. `plan/docs/overview.md`

This establishes the documentation conventions and the overall game.

### Step 2 — Understand the target world

Read the relevant world documents.

For example, when implementing Fire:

1. `plan/worlds/fire/character.md`
2. `plan/worlds/fire/scenery.md`
3. `plan/worlds/fire/story.md`
4. `plan/worlds/fire/dialogs.md`
5. `plan/worlds/fire/gameplay.md`
6. Relevant references.

Do not assume that every world has the same implementation requirements.

### Step 3 — Implement the world

Use its documents as the implementation specification.

- Preserve established decisions.
- Use creative freedom where explicitly permitted.
- Avoid introducing unnecessary shared abstractions.
- Keep world-specific code and assets with that world.
- Ensure the world integrates with the global game progression.

### Step 4 — Verify and update

After implementation:
- Verify that the required gameplay and story flow work.
- Check that rewards and completion states are correctly integrated.
- Check that camera movements and animations match the story specification.
- Update documentation if an implementation decision changes the design.

Do not silently change established story or gameplay decisions during implementation.

When an unavoidable design change is needed, document it and check for affected dependencies.

---

# 7. Current Planning Status

The current focus is designing the worlds before moving into full implementation.

**Overall game plan**
- `docs/overview.md`: High-level game concept, story progression, world order, rewards, and transitions.

**Fire world**
- `character.md`: Wick, the Fire Salamander.
- `scenery.md`: Traditional Chinese lantern festival in a mountainous natural landscape at night.
- `story.md`: Narrative sequence, character animations, camera direction, and storyboard.
- `gameplay.md`: To be designed.
- `dialogs.md`: To be written.

The Fire world is the first world being developed in detail. The remaining worlds will follow the same documentation principles while retaining their own distinct requirements.

---

# 8. Priority

The purpose of this directory is to make the game implementable without requiring the implementer to invent the design.

Prioritize:
1. Clear overall game progression.
2. Distinct and understandable world designs.
3. Concrete gameplay specifications.
4. Explicit narrative sequences and presentation.
5. Clear asset and audio requirements.
6. Practical implementation constraints.

Avoid over-designing details that do not materially affect the player experience.

**The goal is a complete, cohesive game with seven distinct dream experiences, not seven unnecessarily complicated projects.**
