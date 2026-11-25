# Dreamweek planning index

Start with the [implementation roadmap](docs/implementation.md). Pick one task and read its listed sources. The [game overview](../plan/game/overview.md) owns the premise, weekday order, assignment and pacing targets. The [design decisions](docs/architecture/decisions.md) resolve differences in the source drafts. The [art direction](docs/visual-design.md) indexes the environment and character recipes.

| Location | What to look up |
|---|---|
| [Architecture](docs/architecture/) | Interfaces shared across worlds, ownership, runtime, audio and verification |
| [Milestones](docs/milestones/) | Ordered task cards, dependencies, files, scope and observable completion gates |
| [Worlds](../plan/game/worlds/) | Local gameplay rules, scene beats, actual lines, scenery, character construction and local reference images |
| [Original planning guide](../plan/game/REAMDME.md) | Authoring conventions and examples from the design stage |

The blueprint lives under `plan/docs/`. Original creative sources live under `plan/game/`. The files called `scenary.md` contain scenery. Fire, Earth, Water, Wood and Metal use `dialog.md`; Overworld and Void use `dialogs.md`. Sunday and Monday share the Void folder. Keep source art in the world reference folders. Ship only original or cleared production assets.

For visual tasks, use the **Production specification** in the appropriate scenery or character file and inspect the specified local reference. For mechanics, read the local gameplay rules and the applicable decision row. For story, use scene IDs, camera beats and dialogue in their original wording. Check the task gate before handing work to the next implementer.
