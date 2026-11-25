# Dialogue, HUD and transitions

Mount accessible HTML siblings above the canvas under #app: an objective with a direction cue, a proximity prompt, inventory pager, ability indicators, dialogue with choices, audio settings and the iris. One UI instance owns DOM listeners and focus; a world owns text IDs, speaker, points and line order. Keep authored lines in a world-local data module keyed to its dialogue file. World actions, camera movement and reward writes belong to sequence callbacks.

| Interface | Behaviour |
|---|---|
| ui.objective(text, point?) / ui.prompt(label|null) | Show one current objective and one actionable E prompt. Project point into view or clamp an arrow to a safe screen edge. Hide or replace these during shots, crafting and dialogue. |
| ui.inventory(snapshot) | Read the three-cell paged inventory, show ability icons separately. Show item names and explicit prev/next buttons when needed. Inventory never spends quest items. |
| ui.say({kind, speaker, lines}, signal) → Promise | Spoken line, narrated plate or labelled Thought. Acquire dialogue mode. Each fresh E/Enter/click advances one line; ignore key repeat and opening press. Return when last line closes. |
| ui.choose({prompt, options}, signal) → Promise<id> | Native focusable buttons, with keyboard activation. Return stable clue ID, restore prior focus/mode. Wrong selections can lead to authored deflection and a fresh choice. |
| ui.plate(image, alt) / ui.clearWorld() | Cover canvas with the single intro/ending composition while text advances. clearWorld removes transient labels, listeners, directions, plates and dialogue from outgoing world. |
| ui.iris.close() / open() → Promise | Animate a black layer with a transparent circular hole centred on avatar or screen centre. Begin with radius reaching every corner; shrink to zero in 0.32 s, hold solid black during load, expand in 0.38 s. Resize recalculates radius. Use simple full-cover fade with reduced motion. |
| ui.controls(settings) | Master, music, ambience and effects volume; UI and combat use effects submix defaults. Start and retry work with a keyboard; give canvas focus back on exit. |

Interaction order: pose or visual beat, line, dismissal, then next action. Ambient idles can continue. The input press that closes a line cannot hit a pipe or swing the Sword. Story sequences pass the active world abort signal to every await. Cancellation clears a pending line/choice and releases its lock in finally. The host owns the transition cover separately so clearWorld cannot reveal a half-built scene. Ended state accepts final dialogue and settings, then leaves the concluding image visible.

For art tokens and sizes see [visual design](../visual-design.md). Inspect at wide and narrow desktop widths. Resize while viewing a long line, choosing evidence, using the wheel and entering the iris. Controls must remain keyboard reachable and text must stay within the viewport.
