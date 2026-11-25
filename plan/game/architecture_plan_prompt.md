# Dreamweek — Technical Architecture, Art Direction & Implementation Roadmap

You are the principal game architect, technical lead, and art director for Dreamweek.

Your assignment is to turn the existing game concept and planning documents into a complete, cohesive technical and visual blueprint, followed by a granular implementation roadmap.

You are designing the foundation that other, smaller coding models will use to implement the game.

Your output must be sufficiently detailed that a model with less reasoning capability can implement individual tasks without having to make major architectural, gameplay, or artistic decisions itself.

This is a planning and design task. Do not start implementing the game or modifying source code.

---

# 1. Project Context

Dreamweek is a single-player, browser-based 3D game built with Three.js and deployed through GitHub Pages.

The game consists of a central Overworld and seven interconnected dream worlds, one for each day of the week.

The overall aesthetic is dreamy, mysterious, whimsical, and atmospheric, inspired by the visual qualities of Sky: Children of the Light, but with original characters, environments, and storytelling.

The game should prioritize:

- Visually beautiful and cohesive environments.
- Distinctive, charming characters.
- Straightforward but engaging gameplay.
- Smooth, polished presentation.
- Modular and maintainable code.
- Independent world implementations.
- A complete playable experience without unnecessary complexity.

The project has a limited development timeline. Technical and artistic decisions must account for realistic implementation effort.

## Important working assumptions

- Three.js is the primary 3D engine.
- The game is hosted statically on GitHub Pages.
- The default 3D modelling workflow is entirely code-based using Three.js geometry, materials, shaders, and animations.
- I do not plan to learn Blender or establish a Blender modelling workflow.
- Procedural geometry and custom meshes should be the default for characters and environments.
- External assets can be considered where genuinely beneficial, but should not become a dependency of the entire development workflow.
- Most implementation will be performed by Codex using smaller and faster coding models.
- I can manually run the game, inspect visual results, and debug occasionally, but the implementation should be designed to minimize manual debugging requirements.

Your recommendations should be practical for this environment.

# 2. Repository and Planning Audit

_Side note: Check `plan/game/README.md` for game design, storyline and decisions see if anything in there would help you during this stage of planning - note that its a big plan so might bloat your context, so only look at it if you don't have it in your memory._

Before designing anything:

1. Inspect the existing repository structure.
2. Inspect `package.json`, dependencies, build tooling, Three.js version, and deployment configuration.
3. Inspect the existing source code and identify what is already implemented.
4. Inspect the current Git status. Preserve existing user work.
5. Read `plan/README.md`.
6. Read `plan/docs/overview.md`.
7. Read the existing world documents under `plan/worlds/`.

Do not assume anything is already implemented simply because it appears in the plans.

Treat the planning documents as the primary source of truth for established creative and gameplay decisions.

If documents contradict one another, identify the conflict and recommend a resolution.

Do not silently replace established decisions with your own preferences.

# 3. Technical Architecture

Design an architecture that is:

- Modular and cohesive.
- Easy to understand.
- Easy to extend and modify.
- Consistent across the project.
- Implementable by smaller coding models.
- Free of unnecessary abstractions.

Do not over-engineer a relatively small browser game.

## 3.1 Global systems

Evaluate and establish the responsibility and boundaries of the following systems:

- Application bootstrap and game lifecycle.
- Three.js renderer, scene, camera, and lighting.
- Game loop and timing.
- Input management.
- Player character and movement controller.
- Camera controller.
- Interaction detection and interaction prompts.
- Inventory and persistent progression.
- Dialogue and internal monologue.
- UI and HUD.
- Circular screen transitions.
- World management and lifecycle.
- Combat and enemy behaviour.
- Animation management.
- Asset loading and caching.
- Audio management.

Do not blindly create a separate manager or class for everything. Determine which abstractions are genuinely useful.

For each important system, specify:

- Its responsibilities.
- What it owns.
- What it does not own.
- Its public interface.
- Its dependencies.
- How other systems communicate with it.
- How it is initialized and cleaned up.

Define clear contracts between systems.

A smaller coding model should not need to redesign an interface merely to implement an individual feature.

## 3.2 World architecture

Worlds must remain largely independent.

Each world should own its:

- Environment and scenery.
- World-specific characters and meshes.
- Animations.
- Gameplay mechanics.
- Interactions.
- Local state.
- Music, ambience, and sound effects.

Shared functionality should be provided by global systems where appropriate.

Design a small and clear world lifecycle contract, including:

- Initialization.
- Asset preparation.
- Entering a world.
- Updating.
- Exiting.
- Disposing resources.

Do not introduce a large universal framework, ECS, or event bus without demonstrating a concrete need.

The goal is to make it easy to implement a world independently without breaking another world.

## 3.3 State, inventory, and progression

Design how the game represents:

- Collected items.
- Abilities.
- World completion.
- Persistent inventory.
- Dream entrance and return.
- Cooking station state.
- Sun and Moon Essences.
- Final game completion.

Avoid unnecessary save-system complexity unless existing requirements justify it.

Clearly distinguish global persistent state from temporary world state.

## 3.4 Three.js performance and asset management

Consider:

- Geometry and material reuse.
- InstancedMesh where appropriate.
- Lighting and shadow budgets.
- Transparent materials and overdraw.
- Particles and magical effects.
- Animation performance.
- Resource disposal.
- Asset loading and error handling.
- Browser performance.
- Memory usage during world transitions.

The architecture must remain compatible with static hosting.

# 4. Complete Visual Art Direction — Your Responsibility

This is one of the most important parts of the assignment.

I want you to act as the actual art director of Dreamweek.

Do not simply summarize the scenery documents or give high-level descriptions like "make it dreamy and magical."

Design the visual implementation of the entire game, including every important visible element.

The existing scenery and character descriptions establish the creative direction. Your job is to turn them into sufficiently detailed, cohesive, reproducible visual specifications.

## 4.1 Global visual identity

Establish:

- Global visual style.
- Colour relationships across worlds.
- Shape language.
- Geometry and sculptural style.
- Materials and surface qualities.
- Lighting philosophy.
- Atmospheric effects.
- Camera composition.
- Character visual language.
- Environmental detail level.
- Magical effects.
- UI appearance.
- Visual feedback and transitions.

The worlds should feel like parts of the same game without looking identical.

## 4.2 Every world

Develop visual specifications for all of the following.

### Overworld
A small floating island suspended above an endless sea of clouds.

- Blue-dominant pre-sunset sky with pink, purple, and magenta accents.
- Cozy blue cottage, exterior only.
- Hammock as the dream entrance.
- Central cooking station.
- Soft grass, vegetation, floating details, and magical atmosphere.

### Fire
Traditional Chinese lantern festival in a natural mountainous landscape at night.

- Large rectangular lanterns used as parkour platforms.
- Smaller decorative lanterns.
- Natural mountainous terrain.
- Warm lantern light against cool night surroundings.
- Wick, the Fire Salamander.

### Earth
Surreal terracotta desert and badlands.

- Soft pink-to-blue gradient sky.
- Sandstone formations and rolling terrain.
- Floating and embedded crystals.
- Central pottery wheel.
- Bob, the living clay creature.

### Water
Beach and magical underwater coral garden.

- Simple beach and lifeguard area.
- Turquoise ocean.
- Magical coral formations.
- Swimming jellyfish.
- Teal, the seal lifeguard.

### Wood
Enchanted forest dominated by an enormous ancient tree.

- Natural hollow serving as Mallow's home.
- Clearing with fire pit.
- Dense forest vegetation.
- Warm filtered sunlight and subtle magical details.
- Mallow, the mushroom spirit.

### Metal
Ancient underground magical forge.

- Large cavern.
- Central ancient forge.
- Magical pipe network.
- Wall-mounted 4-row × 5-column pipe puzzle.
- Glowing turquoise magical energy.
- Clink, the bronze beetle.

### Void
Dark cosmic environment.

- Enormous purple celestial background object.
- White floating arena.
- Very limited floating debris.
- Dark black and cosmic-purple palette.
- Magical cube minions.
- The Grand Wizard.

## 4.3 Procedural character design

All main characters and enemies should be designed to be achievable directly in Three.js.

For each character, establish:

- Silhouette.
- Proportions.
- Main body shapes.
- Supporting geometry.
- Facial features.
- Material and surface qualities.
- Colour palette.
- Distinctive visual details.
- Essential animations.
- How the character can be constructed from procedural or custom geometry.

The result should look cohesive and sculptural, not like disconnected primitive shapes.

Use built-in geometry, custom BufferGeometry, smooth shading, material variation, vertex deformation, and shaders where appropriate.

Avoid unnecessarily complicated anatomy, rigging, or animation systems.

## 4.4 Visual implementation specifications

For each important environment and character, describe:

- Main geometry and shape.
- Relative proportions.
- Visual focal points.
- Composition and camera framing.
- Materials.
- Lighting.
- Atmosphere.
- Effects.
- Animation.
- Important interactions.

Use concrete descriptions that can be translated into code.

Separate requirements into:

1. Essential visual features.
2. Secondary polish.
3. Optional decorative details.

Do not let optional features become mandatory implementation work.

## 4.5 Visual consistency

Establish shared principles for:

- Smooth geometry.
- Material quality.
- Lighting.
- Environmental atmosphere.
- Character proportions.
- Emissive materials.
- Particles.
- UI.
- Camera composition.

Individual worlds should retain their own visual identities.

Do not force every world into the same colour palette or environment style.

# 5. Audio Architecture

Design a flexible audio module that supports both procedural browser audio and uploaded audio assets.

Both approaches must coexist.

## 5.1 Web Audio API

The game should be able to generate or manipulate audio using the Web Audio API where appropriate.

Consider:
- Procedural sound effects.
- Oscillators and generated tones.
- Filters and effects.
- Volume envelopes.
- Audio nodes and routing.
- Simple synthesized magical effects.

## 5.2 Uploaded Audio Assets

I will provide audio files, including:

- Background music.
- Environmental ambience.
- Sound effects.
- UI sounds.
- Combat sounds.

I will have at least five original field recordings that I intend to edit and process in FL Studio. They can be reused across different worlds and transformed into multiple sounds.

The system should not assume that one sound file belongs to only one world or one purpose.

## 5.3 Required audio capabilities

Design support for:

- Background music.
- Ambient loops.
- One-shot effects.
- Positional audio.
- Music transitions and crossfades.
- Audio category volume controls.
- Master volume.
- Looping and non-looping playback.
- Audio loading and caching.
- Resource cleanup.
- Browser autoplay restrictions.
- Audio context initialization.
- Per-world audio configurations.

Evaluate the suitability of Three.js audio classes, native Web Audio API, or a small combination of both.

Keep the interface simple.

Do not introduce a large audio framework without a strong reason.

The resulting architecture should allow me to add or replace audio files without changing world logic.

# 6. Documentation Structure — Keep It Modular

Do NOT create one enormous implementation.md.

I want a documentation system with focused files so smaller models only need to read the documents relevant to their current task.

Use the following as a proposed structure. Adjust it after repository inspection if a different organization is more appropriate.

<escape>plan/
├── README.md
│
├── docs/
│   ├── overview.md
│   ├── implementation.md
│   ├── visual-design.md
│   │
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── core-systems.md
│   │   ├── world-lifecycle.md
│   │   ├── player-and-interactions.md
│   │   ├── inventory-and-progression.md
│   │   ├── ui-and-dialogue.md
│   │   ├── audio.md
│   │   └── assets-and-performance.md
│   │
│   └── milestones/
│       ├── 00-repository-foundation.md
│       ├── 01-core-runtime.md
│       ├── 02-player-and-worlds.md
│       ├── 03-shared-game-systems.md
│       ├── 04-overworld.md
│       ├── 05-dream-worlds.md
│       ├── 06-final-encounter.md
│       ├── 07-visual-polish.md
│       └── 08-audio-and-release.md>
</escape>

These names are suggestions, not mandatory files.

### 6.1 `implementation.md`

This is an index and roadmap overview, not the entire implementation specification.

Keep it concise.

Include:
- Short implementation overview.
- Architecture document links.
- Milestone links.
- Implementation order.
- Dependencies.
- Overall completion criteria.
- How agents should use the documentation.

### 6.2 Architecture documents

Split technical specifications into coherent subjects.

Each architecture document should explain the responsibilities, interfaces, ownership, dependencies, and important implementation constraints of its subject.

Avoid excessive detail about trivial code-level decisions.

### 6.3 Milestone documents

Each milestone should contain a manageable group of related tasks.

Avoid creating a separate Markdown file for every small task.

Group related tasks into approximately 3–7 tasks per milestone where appropriate.

Each task must include:

- Unique task ID.
- Objective.
- Scope.
- Prerequisites.
- Exact required reading.
- Expected files or modules.
- Relevant interfaces.
- Explicit requirements.
- Acceptance criteria.
- Verification instructions.
- Non-goals.
- Recommended model and reasoning level.

Tasks should be independently implementable wherever possible.

A task should be small enough for one focused coding session by a smaller model.

### 6.4 Document responsibilities

Avoid duplicating information.

Use clear sources of truth:

- `overview.md`: Game concept and global gameplay progression.
- `implementation.md`: Implementation roadmap index.
- `architecture/`: Technical architecture and contracts.
- `milestones/`: Executable implementation tasks.
- `visual-design.md`: Global art direction and visual principles.
- `worlds/`: World-specific scenery, characters, story, gameplay, and dialogue.

Every document should explain or reference its dependencies where necessary.

### 6.5 Context efficiency

Design the documentation for economical model usage.

A coding model implementing Bob's pottery interaction should not need to read every world document or the entire visual design bible.

Every task should explicitly identify the documents it requires.

`AGENTS.md` should remain concise and contain only global instructions.

Do not duplicate the architecture, milestone roadmap, or visual design specifications in `AGENTS.md`.

# 7. Implementation Roadmap

Design a practical implementation order based on the existing codebase.

Consider:

1. Repository audit and foundation.
2. Application and Three.js runtime.
3. Player movement, camera, and controls.
4. Interactions and world lifecycle.
5. UI, dialogue, inventory, and transitions.
6. Audio foundation.
7. Basic playable Overworld.
8. Individual dream-world implementation.
9. Void combat and final encounter.
10. Progression and full-game integration.
11. Visual refinement.
12. Audio integration and release verification.

Adjust this order where appropriate.

The most important milestone is getting the entire game playable before spending extensive effort polishing individual environments.

Each milestone must have measurable completion criteria.

## 7.1 Task granularity

Avoid vague tasks such as:
- Implement the Overworld.
- Make the character.
- Add audio.
- Finish combat.

Instead, break them down into independently verifiable implementation units.

A smaller coding model should know exactly what to implement and how to tell when it is finished.

## 7.2 Dependencies and parallelization

Identify:
- Tasks that must be completed sequentially.
- Tasks that can be developed independently.
- Tasks that can be delegated to separate Codex agents.
- Shared files that should not be edited in parallel.
- Integration points that require later verification.

Do not recommend parallel work merely for the sake of using multiple agents.

## 7.3 Model recommendations

For each task, recommend a suitable model class and reasoning level.

Use a distinction such as:

- Strong reasoning model: architecture, difficult integration, complex visual design.
- General coding model: ordinary world mechanics and system implementation.
- Fast smaller model: repetitive, well-specified tasks and simple modifications.

Explain why a task requires a stronger model when it does.

Design the task descriptions so they remain executable if a smaller model is used.

# 8. Testing and Verification

Design a practical testing strategy for a browser-based Three.js game.

Include:

- Build verification.
- Unit tests where genuinely useful.
- World lifecycle checks.
- Inventory and progression checks.
- Interaction checks.
- Transition checks.
- Audio cleanup checks.
- Full-game playthrough.
- GitHub Pages deployment verification.

For visual features, require an actual browser render and inspection where possible.

Do not claim that a visual result is correct simply because the code compiles.

Keep tests focused. Do not introduce unnecessary testing infrastructure.

# 9. Required Deliverables

Create or update the following documentation.

## A. Technical architecture and implementation documentation

Create:
- `plan/docs/implementation.md`
- Necessary files under `plan/docs/architecture/`
- Necessary files under `plan/docs/milestones/`

Do not put all technical details into a single file.

## B. Visual design documentation

Create:
- `plan/docs/visual-design.md`

Also update existing world scenery and character documents only where necessary to make the visual direction actionable, resolve gaps, or establish missing important details.

Do not duplicate whole world documents.

## C. Codex instructions

Create or update the root `AGENTS.md`.

Keep it concise. It should direct agents to the relevant planning documentation and establish global implementation conventions.

Preserve useful existing instructions.

## D. Planning documentation index

Update `plan/README.md` to explain the new documentation organization and how future agents should use it.

# 10. Quality Review

Before finishing, review all deliverables as though you were handing the project to another developer who has never participated in the planning process.

Check:

### Architecture
- Are responsibilities clear?
- Are interfaces well-defined?
- Can individual worlds be implemented independently?
- Is the architecture appropriately simple?
- Can it accommodate future extensions?

### Visual design
- Is every important visible feature designed?
- Are character silhouettes and proportions concrete?
- Can the models be constructed using the intended Three.js-only workflow?
- Are environments visually cohesive?
- Are world identities distinct?
- Are material, lighting, and animation directions actionable?

### Audio
- Can uploaded music, field recordings, ambience, and SFX coexist with generated Web Audio effects?
- Can audio be reused across worlds?
- Are loading, looping, transitions, and cleanup addressed?

### Implementation
- Can smaller models implement the tasks without redesigning architecture?
- Are tasks focused and independently verifiable?
- Are dependencies explicit?
- Are acceptance criteria observable?
- Is documentation reading scoped to each task?

### Scope
- Have unnecessary systems been introduced?
- Are optional visual features separated from essential requirements?
- Is the implementation roadmap realistic for the game's limited development timeline?

# 11. Final Response

Once the documentation is complete, provide:

1. Summary of the repository audit.
2. Summary of the proposed architecture.
3. Summary of the complete visual art direction.
4. Documentation structure and files created or updated.
5. Milestone sequence and dependencies.
6. Which tasks can use smaller models.
7. Which tasks warrant a stronger reasoning model.
8. Major technical and artistic trade-offs.
9. Unresolved decisions that genuinely require my input.

Do not implement the game.

The end result should be a complete, coherent technical and visual blueprint, with a modular implementation roadmap that smaller coding models can follow reliably without repeatedly reinventing the architecture or artistic direction.
