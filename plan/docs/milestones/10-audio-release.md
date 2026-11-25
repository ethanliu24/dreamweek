# 10 · Hear the five recordings and verify Pages

Collect and edit the recordings while game work proceeds. Keep integration and deployment on the critical path even if secondary art is cut.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## L1 · Prepare and trace the five original takes

**Prerequisites** Can start immediately
**Required reading** [architecture/audio.md](../architecture/audio.md), [plan/game/overview.md](../../../plan/game/overview.md)
**Files in scope** `public/assets/audio/`, `plan/docs/audio-cue-sheet.md`
**Interfaces** cue ID → take ID → export path

**Requirements** Log at least five distinct original phone recordings. Trim, process and export FL Studio edits, document reuse, loop points, levels and the in-game listening location. Store production exports only in the served directory.

**Acceptance** A person can match each of five original takes to an exported sound and planned trigger.
**Verify** Audition every export in isolation including its loop seam; confirm originals with the author.
**Out of scope** Substituting generated tones for an original recording.
**Model** Fast · low for cataloguing; author supplies and edits takes.

## L2 · Mix world profiles and record listening checkpoints

**Prerequisites** L1, S3, G1
**Required reading** [architecture/audio.md](../architecture/audio.md), [architecture/world-lifecycle.md](../architecture/world-lifecycle.md)
**Files in scope** `src/audio/manifest.js`, `src/worlds/`, `src/audio/profiles.js`
**Interfaces** prepare, enter, play, leave

**Requirements** Map the real exports and synth cues to the specified world triggers and category gains. World code selects cue IDs. Add local profile selections serially with each world's owner.

**Acceptance** Five original takes are clearly audible during normal play. Muting effects, ambience or music isolates the expected sounds.
**Verify** Use the cue sheet while playing, test a positional sound and hear two travel crossfades. Hide/restore tab and check tails.
**Out of scope** Mandatory score for every world.
**Model** General · medium

## L3 · Measure final browser performance and deployable build

**Prerequisites** G2, G3, A1–A7, L2
**Required reading** [architecture/assets.md](../architecture/assets.md), [architecture/audio.md](../architecture/audio.md)
**Files in scope** `vite.config.js`, `src/runtime/display.js`, `src/worlds/`
**Interfaces** renderer.info, base URL, category gains

**Requirements** Build using npm ci. Measure a busy reef view, lantern route and Void attack on the available reference machine. Fix measured hotspots, nested-path failures and required asset errors.

**Acceptance** Record device/browser, frame time, draw and memory figures. Dist runs under /dreamweek/ with all required files loading.
**Verify** Cold-load preview, resize and run the five-cycle memory check. Compare busiest scene to budgets.
**Out of scope** Engine migration or cosmetic redesign.
**Model** General · high

## L4 · Verify the live GitHub Pages release

**Prerequisites** L3; designated repository and Pages access
**Required reading** [architecture/assets.md](../architecture/assets.md), [architecture/progression.md](../architecture/progression.md), [architecture/audio.md](../architecture/audio.md), [plan/game/overview.md](../../../plan/game/overview.md)
**Files in scope** `.github/workflows/pages.yml`
**Interfaces** npm ci, npm run build, Pages dist artifact

**Requirements** Use the authorized repository’s Pages deployment source. Build the lockfile and publish dist via Pages Actions under its actual base path. Release owner handles authorized publication. Capture the exact URL and revision.

**Acceptance** Fresh tab loads the public game, user gesture enables sound, lazy world chunks and five recordings load, and ending is reachable on the published site.
**Verify** Open the actual URL from a separate browser profile and run the human gate below. Record any blocked external step distinctly.
**Out of scope** Build-only release sign-off.
**Model** General · medium

## Human milestone acceptance

**How to test**

1. Open the live Pages link in a fresh browser profile. Refresh once, start with the keyboard, enable sound and play through to the restored Moon. Confirm the address remains usable when reopened.
2. With the cue sheet beside you, listen for all five original recordings at their named checkpoints. Reduce music volume and check the effects still play. Stand on opposite sides of a positional source and listen for the change. After travel, listen for an old loop continuing.
3. Visit the lantern climb, reef and final arena. Check the displayed image for stutter during jumps, clue pickup and attacks. Resize once. Record browser, device, public URL, revision, five heard cues and the last line seen.

**Milestone passes when** a person finishes the published build, hears every required recording, and confirms the public address and normal controls work. A local preview alone earns only the build gate.
