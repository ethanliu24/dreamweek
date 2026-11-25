# Assets, performance and static delivery

## Ownership

Keep procedural builders next to the world using them. Cache reusable geometry/material per owner or shared asset key. All instances of a lantern frame can reference the same geometry. Build world materials once. Modify shared values only when all users should change together. Per-actor expression, rotation and wobble belong on transforms/uniforms. External assets are exceptional, small, licensed and locally bundled. Build sky gradients, ground colour variation and hero meshes in code. The reference folders are art direction only.

assets.acquire(key, load, signal) → Promise<{value, release}> shares a load and tracks ownership. Define a disposal callback with each asset type. Last release evicts world-only textures, buffers and geometry. The app separately owns long-lived avatar/prop templates. A failed load evicts its promise; a canceled caller releases its claim even if decode finishes later. Traverse local mesh resources once using identity sets, skip leased shared resources, dispose textures/materials/geometries and detach scene children. Removing a mesh alone leaves GPU allocations live.

## Starting budgets to measure in a production build

| Measure | Target and fallback |
|---|---|
| Frame time | Target 60 fps at 1280×720 on the development laptop; record browser/device and median/worst busy scene. Investigate sustained frames over 33 ms. Cap pixel ratio at 1.5, reduce to 1 before cutting core silhouettes. |
| Draw and triangles | Start around ≤120 draws and ≤200k visible triangles per world. Inspect renderer.info.render. Instance repeated plants, pipes, lanterns, coral or distant props by material. |
| Lighting | One hemisphere fill, one directional key, up to two local lights. At most one shadow caster light with a 1024 map cropped to the play area. Blob contact shadows are the baseline. |
| Transparency | One bubble rim or hero veil in the foreground, bounded sprite batches and fog. Keep full-screen alpha layers rare. Use an opaque gradient sky and emissive opaque cutouts for distant detail. |
| Particles | Start with ≤100 small points/sprites in one or two draws, seeded positions and reusable arrays. Reduce count before touching gameplay cues. |
| Memory | One resident world, shared avatar, bounded audio tail. After warmup, repeat a hub/dream cycle five times. Compare renderer.info.memory textures/geometries and active audio voices at the same settled point; investigate monotonic growth. Track resources, not a literal zero baseline. |

Use elapsed-time sinusoids, a few parent joints and reusable vectors. Recompute lathe positions only on shaping changes. Avoid per-frame mesh/material creation, per-lantern lights and full-screen bloom as a dependency. Draw call and GPU counters guide tuning; only an actual browser render validates appearance.

## Pages

Use Vite base './' for the single HTML entry with no client-side routes. Registry uses literal imports. For runtime fetches join import.meta.env.BASE_URL with assets/... under public; imported module assets can use new URL(relative, import.meta.url). Avoid root-absolute runtime URLs. Deliver dist/ to Pages using a Pages build artifact and deployment workflow when a repository is available. Use the lockfile with npm ci and a supported Node (24 in the audited environment). No backend or secrets in the client.

Future release check: build, serve dist under a nested /dreamweek/ URL, then cold-load the real Pages URL. Inspect network statuses for JS chunks, each used audio file, favicon and illustrations. Test refresh at entry, sound unlock and completed playthrough. Include a failed optional sound and delayed world load in local QA; neither should reveal an empty canvas or strand progression.
