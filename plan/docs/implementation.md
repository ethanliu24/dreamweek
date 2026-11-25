# Dreamweek implementation roadmap

Start from the Vite shell. Deliver a complete playable week with readable procedural scenery, then refine its presentation. The December 8 deliverable includes a public browser playthrough and audible use of at least five original field recordings. Begin collecting the recordings while building the runtime.

## Contracts by task

| When implementing | Read |
|---|---|
| Repo baseline or a disputed design detail | [Audit and decisions](architecture/decisions.md) |
| Boot, timing, input, mode ownership, animation | [Runtime](architecture/runtime.md) |
| Register, enter, retry or leave a location | [World lifecycle](architecture/world-lifecycle.md) |
| Avatar movement, camera, proximity, strikes | [Player and interactions](architecture/player.md) |
| Rewards, hammock gates, hearth or final capture | [Inventory and progression](architecture/progression.md) |
| Text, objectives, choices or iris | [UI and dialogue](architecture/ui.md) |
| Audio cues, recordings, spatial playback or mixing | [Audio](architecture/audio.md) |
| Resource budgets, loading or static deployment | [Assets and performance](architecture/assets.md) |
| Geometry, light, character or plate | [Visual design and local build sheets](visual-design.md) |

## Milestones and gates

| Order | Playable result | Depends on |
|---|---|---|
| [00 · Foundation](milestones/00-foundation.md) | Startable shell under a nested URL | Existing lockfile |
| [01 · Runtime](milestones/01-runtime.md) | Scene changes and load recovery | 00 |
| [02 · Player](milestones/02-player.md) | Traversal, orbit, actions and prompts | 01 display/input |
| [03 · Shared services](milestones/03-shared.md) | Round trip with persistent reward, dialogue, iris and sound | 01 host, 02 interactions |
| [04 · Overworld](milestones/04-overworld.md) | Sleep, wake, cook and end using seeded states | 03 |
| [05 · Fire and Earth](milestones/05-fire-earth.md) | Carry Wick, fire Bob's pot and bring it home | Hub entry plus player/services |
| [06 · Water, Wood and Metal](milestones/06-water-wood-metal.md) | Fill, investigate, ignite, repair and equip | Hub gates, Earth pot for Water |
| [07 · Final encounter](milestones/07-void.md) | One arena, two essences and captured Wizard | Metal Sword and hub ending |
| [08 · Playthrough](milestones/08-playthrough.md) | Entire game from fresh Start to restored Moon | All gameplay modules |
| [09 · Art refinement](milestones/09-art.md) | Reviewed browser views for each environment and cast | Complete normal route |
| [10 · Audio and release](milestones/10-audio-release.md) | Five audible original recordings on live Pages | Recordings can start immediately; final release needs 08–09 |

## Work assignment and handoff

Choose one task ID and use its linked reading, expected files, contracts and checks. Names designate planned modules. Register QA fixtures only in local development. Add a simple playable shape and the required states before refining silhouettes. For every visual change, inspect the running browser at gameplay scale. For each milestone, a person follows **Human milestone acceptance** from the first step and records pass/fail, last input and visible or audible result. Run npm run build at each integration gate and run existing relevant tests if available. There is currently no test script. Use human fixtures and the transaction table to check logic; the project instructions exclude writing test cases.

Tasks may overlap when their prerequisite IDs are complete. R1/R2 can run independently; S1/S2/S3 can follow their respective foundational services. Fire, Earth, Wood and the Metal board can be assigned to different implementers after their listed dependencies. Water needs the Earth pot interface. V2 follows V1, and capture precedes normal-route integration. The five-take editing and cataloguing work L1 runs independently of software development.

One integration owner edits the world registry, app bootstrap, shared UI components, QA selector, cue manifest and shared progression schema. Land registrations sequentially. A world owner can provide its factory and local fixture first; the integration owner binds it for in-game verification at that milestone. Keep the shared pot shape, Wizard factory, avatar grip and Sword mesh under one owner each. Coordinate callers against their interfaces before editing those shared files. G1 checks weekday order and production routing again after the individual joins.

Use fast models with low reasoning for the shell, static paths, cue cataloguing and narrowly specified prop/data work. General coding models at medium reasoning handle most mechanics, actor construction and UI. Use a strong model with high reasoning for R3 (cancellation and lifetime), S1 (atomic state across worlds), V2 (combat phase gates) and G1 (integration). Their acceptance checks apply even if a smaller model performs the work.

## Schedule and completion

Suggested checkpoints for the December 8 deadline: Nov 25–27 for the shell, fixtures and round trip; Nov 28–Dec 2 for the hub and ordinary dreams; Dec 3–4 for Void and the first full playthrough; Dec 5–6 for the art and recording mix; Dec 7 for a live Pages rehearsal and Dec 8 for fixes and submission. These are planning targets. Preserve the playable route, authored story beats and five recordings first. If time contracts, drop optional decoration, then secondary polish. Retain silhouettes, readable interaction surfaces and all human gates. Escalate a proposed change to mechanics or assignment scope to the author.

Completion requires all seven chapters, one uninterrupted normal playthrough, both ordered essences, visible restored Moon, reviewed browser images, stable repeated world transitions, a traceable five-take listening check and a successful playthrough at the actual Pages URL. Keep the device/browser, timing, asset errors, render observations and any remaining issues with the release handoff.
