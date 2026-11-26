# Progression

Use a single in-memory progress record for the entire play session. It survives scene disposal. Reload starts a new game. The brief requires cross-dream persistence; a disk save, mid-puzzle checkpoint or login is outside this release. Keep mutation in state/progress.js. progress.read() returns a read-only snapshot; progress.apply(command, payload?) validates preconditions, changes all effects together and returns {changed, snapshot}. Invalid or repeated commands leave the previous record intact. Refresh relevant props after a successful command. Travel calls selectors nextDream(snapshot), canReturn(world,snapshot), nextStationAction(snapshot). No world sets another world's flags.

## Record

- completed is a set of chapter IDs fire, earth, water, wood, metal, sun, moon. Current world and origin are host state. No day index is incremented on travel.
- Chapter completion records earned rewards. The pot record holds its phase (absent, empty, filled or placed) and the three normalized shape parameters from Earth. Hearth phase tracks which ingredients have been added and whether the soup has been collected. The Void boss owns finisher availability.
- hearth advances through empty, potPlaced, woodPlaced, lit, boiled, sunAdded, moonAdded, stirred, served. Wizard state is distant, unconscious, home or fed. ended becomes true on feeding; UI completes its final exchange before terminal idle. Intro and return thoughts are shown once per relevant beat. Clock, active target, cooldowns, witness choices and poses remain local.

## Destination selection

Only the hub can call enterNext. Select the first incomplete chapter in the authored order. Fire is initially available. Earth needs Candle, Water needs the empty fired pot, Wood needs potPlaced and Metal needs lit. The shared Void entry needs Sword and boiled. If the required hearth action is pending, return no destination and point the objective at the hearth. After capture, always target the next soup action or the Wizard. Feeding disables new travel. A completed Sun with Moon still pending is a Void recovery state, never a new hammock trip.

For ordinary dreams canReturn becomes true only after that chapter is complete. Put the yellow ring at the arrival point, visible but inactive until then. In Water align it with the beach exit path behind the removable barrier. Void exposes only the body capture interaction, after both essence pickups.

## Transactions and gates

| Command | Preconditions | Atomic result and next interaction |
|---|---|---|
| earnCandle | Fire resolution with Wick on ground | Candle + fire complete. E at ring, then hammock → Earth. |
| collectPot(shape) | Earth shaping and local firing finished, Candle owned | Empty pot + shape + earth complete. E at ring, hammock → Water. |
| fillPot | Water faucet with empty pot | Pot filled. The clam’s bubble, lockdown and evidence flags are local to Water. An early attempt to enter water gives the supplied thought. |
| clearBeach | Filled pot and local confession | water complete. E at reopened exit ring. Hub needs placePot before Wood. |
| placePot | water complete, filled pot, empty hearth | Pot placed, hearth potPlaced. |
| helpMallow | Wood thank-you after Candle lit local pit | Firewood + wood complete. Ring then hub. |
| placeWood / lightWood | wood complete, potPlaced and Firewood / woodPlaced and Candle | Consume bundle → woodPlaced; use reusable Candle → lit. Unlock Metal. |
| earnSword | Repaired forge, Clink reward, lit hearth | Sword + metal complete; mark water boiled during trip. On return no hearth action before Void. |
| defeatWizard | Manual finisher complete | Wizard unconscious. Keep the actual Moon in his belly. |
| takeEssences | Wizard unconscious and player near the pickup | Both essence pickups commit Sun and Moon completion together. |
| bringWizardHome | Both essences, unconscious Wizard, E capture | Wizard home; request covered hub travel. Retry arrival without replaying combat. |
| addSun / addMoon | Wizard home + boiled hearth + Sun Essence / sunAdded + Moon Essence | Consume respective essence and advance hearth once each. |
| stir / takeSoup / feed | moonAdded + Sword / stirred / served + Wizard home | Stir with retained Sword; collect Soup and set served; consume Soup, set Wizard fed and ended. Show ending image and final lines. |

World entry, active chapter and previous completion also guard reward commands. For local prerequisites the owning world checks the local phase and calls once at the named beat. Mark the Wizard unconscious on finisher completion through progress.apply('defeatWizard'); valid after the local finisher gate. On Void retry, reconstruct from progression: legacy Sun complete → boss, unconscious → both essence pickups, both chapters complete → capture, home → hub. Water retry derives the filled pot and beach completion from progression. During an unfinished investigation, the clam can restore the local bubble and uncommitted clue work restarts. Completed ordinary world rebuilt during retry enables its return ring immediately. Input queues clear on stage changes.

Read the [design decisions](decisions.md) for the Fire, Earth and reward tracking choices. Verify each blocked gate before satisfying it. Repeat E at completed interactions and check that the hearth mesh and next destination agree with the recorded chapter and hearth state.
