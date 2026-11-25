# World host and scene lifetime

## Contract

The registry maps overworld, fire, earth, water, wood, metal and void to literal dynamic imports. Both final chapters resolve to void. Each module exports createWorld(ctx). The factory allocates fresh local state and a Scene; it does no network work and attaches nothing globally.

| World member | Call and owner |
|---|---|
| scene | Host renders this scene when active. The world owns its children, lights and fog. |
| prepare(signal) → Promise<void> | Acquire mandatory procedural assets and any selected audio leases. Keep optional files recoverable through cue or prop fallbacks. Observe cancellation. |
| enter({spawn, progress}) | Bind world surfaces and interactables, position shared player at the named spawn, start the local sequence and select cue profile. Ordinary dream entry uses arrival; hub returns use wake. |
| update(dt, frame) | Fixed-step mechanics and story state. Use frame.mode for allowed input. Keep puzzle, witness, combat and cinematic state inside this instance. |
| exit() | Stop accepting input. Release sequence locks, remove targets, cancel dialogue, detach player and relinquish the world's sound handles. Safe after partial enter. |
| dispose() | Release meshes, render resources, timers and acquired asset leases. Safe after partial prepare, repeated calls and failed entry. |

ctx provides player, camera, input through frame, controls, interactions, ui, audio, assets, progress and travel. Calls go directly to the service that owns the data. ctx.travel.enterNext() computes destination from progression; ctx.travel.returnHome() requires the active world's return predicate. Neither takes an arbitrary destination from gameplay. The host validates active instance and ignores duplicate travel requests. A dev-only registry selector may seed a valid entry snapshot for an isolated local world.

The Overworld owns the text for its Sun-pickup thought even though it is shown in Void. Register that single line in the shared journey text data at composition time. Void requests it by ID through UI. Shared props and this line can cross world boundaries without either world loading another world's scene.

## Transaction under the iris

1. On eligible E latch a single travel request and block further input. Play the hammock lie-down or capture pose. Close the UI iris over the current scene.
2. At fully black, keep a compact copy of the current progress, previous world ID and entry kind. Abort the outgoing instance signal, exit/dispose it, release scene leases and clear its UI. The shared avatar survives. Release old visuals before building the next scene.
3. Create, prepare and enter the destination with its own abort signal and generation number. Check the generation after awaits. Queue arrival story until the iris opens. Reconstruct hub props from progress.
4. Open iris and enable its initial mode. Drop the latch only after reveal. Travel never grants a second copy of a reward.
5. On failure dispose the partial destination, show Retry inside the covered view and keep progress in memory. Retry the same destination from its entry snapshot. For an ordinary completed dream allow a return to hub. During Void preserve the completed Sun/Moon stage when rebuilding. Hide old callbacks by invalidating their generation. Abort on app disposal.

Every registration returns an unregister function scoped to the instance. Collect these and call them on exit even if an intro is interrupted. For QA cycle a dream and the hub repeatedly, including an injected load failure in local dev. Count one avatar, one RAF and one active prompt, and check old music fades out. See [resource budgets](assets.md).
