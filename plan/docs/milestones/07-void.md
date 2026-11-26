# 07 · Play Sunday and Monday on one arena

Three separate cues matter here: completing the wave, manually triggering the finisher and collecting both essences. Each must remain observable.

Read the [root instructions](../../../AGENTS.md) once. Each card lists its additional reading. Module paths are repository-relative and describe the intended implementation.

## V1 · Stage the arena and three-hit cube wave

**Prerequisites** WM5, S3
**Required reading** [architecture/player.md](../architecture/player.md), [Visual design](../visual-design.md), [void/scenary.md](../../../plan/game/worlds/void/scenary.md), [void/minions.md](../../../plan/game/worlds/void/minions.md), [void/gameplay.md](../../../plan/game/worlds/void/gameplay.md), [void/dialogs.md](../../../plan/game/worlds/void/dialogs.md)
**Files in scope** `src/worlds/void/index.js`, `src/worlds/void/minions.js`, `src/worlds/void/lines.js`
**Interfaces** strikeWindow, knockback, enter, say

**Requirements** Start with eight cubes in one wave. Per cube alternate hover, 0.5 s telegraph, charge to sampled position and recover. Record last swingId; third valid swing defeats that cube. Contact causes modest knockback. The player is invincible.

**Acceptance** A single swing overlapping many frames counts once per target.
**Verify** Isolate one cube, count three deliberate swings; stand still through two charges. Check no death or edge fall.
**Out of scope** Multi-wave combat, health or lives.
**Model** General · high

## V2 · Hand off Sun to the Wizard’s attack cycle

**Prerequisites** V1
**Required reading** [architecture/progression.md](../architecture/progression.md), [architecture/player.md](../architecture/player.md), [void/grand_wizard.md](../../../plan/game/worlds/void/grand_wizard.md), [void/story.md](../../../plan/game/worlds/void/story.md), [void/gameplay.md](../../../plan/game/worlds/void/gameplay.md), [overworld/dialogs.md](../../../plan/game/worlds/overworld/dialogs.md)
**Files in scope** `src/worlds/void/boss.js`, `src/worlds/void/index.js`, `src/shared/actors/wizard.js`
**Interfaces** strikeWindow, player.knockback

**Requirements** After the wave and the Wizard’s reaction, step the Wizard forward. Cycle crouch/belly bounce/ring, raised-hand/single burst, open-mouth/straight tongue. Use 300 boss HP and 10 damage per swing. Leave 10 HP on the last hit, pause ordinary damage, enable the finisher and display Q. Ignore Q outside that phase. Gate contact once per attack; preserve a visible recovery beat after each.

**Acceptance** Same arena and camera root throughout. All three telegraphs can be observed. No input can reduce boss below the finisher threshold before manual activation.
**Verify** Try Q before threshold and keep swinging at threshold. Stand in each attack once.
**Out of scope** Additional boss phases, respawn or early finisher.
**Model** Strong · high, attack windows and one-way phase changes interact.

## V3 · Finish, collect both essences and capture

**Prerequisites** V2, H3
**Required reading** [architecture/progression.md](../architecture/progression.md), [architecture/world-lifecycle.md](../architecture/world-lifecycle.md), [Visual design](../visual-design.md), [void/scenary.md](../../../plan/game/worlds/void/scenary.md), [void/story.md](../../../plan/game/worlds/void/story.md), [void/dialogs.md](../../../plan/game/worlds/void/dialogs.md)
**Files in scope** `src/worlds/void/finish.js`, `src/worlds/overworld/story.js`
**Interfaces** defeatWizard, takeEssences, bringWizardHome, returnHome

**Requirements** On Q lock combat, play gold sword arc and collapse. Show gold Sun Essence and silver-lavender Moon Essence together. Keep the actual Moon in the belly. Press E to collect both, then E beside body for short grab, covered return and same model at hearth. Handle retry from each committed phase.

**Acceptance** Early capture fails. Both essences reach hub once and the Wizard remains unconscious until feeding.
**Verify** Collect both essences then move away, come back, hold E on capture and confirm the hub prompts you to add Sun Essence first.
**Out of scope** Long dragging mechanic or Sun-to-hub transition.
**Model** General · medium

## Human milestone acceptance

**How to test**

1. Choose Void arrival in `?qa`. Watch a cube wind up, take its charge, and check for brief knockback. Count three separate successful swings against one cube. Defeat the rest and watch the Wizard step forward.
2. Stay in the arena long enough to see the crouch and shock ring, raised-hand projectile and straight tongue. Attack until Q appears, then keep swinging. The Wizard should remain at the finisher threshold until you press Q.
3. Use Q, look for both essences and the Moon still glowing inside the Wizard. Try grabbing him before taking the essences, then collect both and press E beside him. Inspect both essences and the unconscious Wizard at home.

**Milestone passes when** both encounters share one arena, only the manual finisher defeats the Wizard, and both distinct essences come home with him.
