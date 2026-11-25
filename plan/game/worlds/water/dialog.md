# Water — Dialogue

## Presentation

Use the game's retro-inspired dialogue box at the bottom of the screen.

- Character animations play before dialogue appears.
- Keep dialogue short, ideally one line at a time.
- Characters display their expressions while dialogue is shown.
- No voice acting or detailed lip-sync is required.
- The protagonist has no spoken dialogue. Evidence choices are presented as selectable text options.

## Dialogue Direction

The story is a lighthearted detective comedy.

Teal initially acts like a perfectly normal, professional lifeguard. As the player uncovers evidence, he becomes increasingly nervous and defensive.

Keep dialogue short and let character animations communicate most of the humour.

---

## WATER_LOCKDOWN

**Trigger:** The shell siren sounds and Teal announces the beach closure.

**Animation:** Teal blows his whistle and addresses the beachgoers.

**Teal:**
"ATTENSSION! Someone has PEED in the ocean!"

**Teal:**
"Beach is CLOSED until we find the culprit!"

**Player monolog:**
"Hmmm I need to get out of here..."

**Delivery:** Serious and authoritative.

---

## WATER_CLAM

**Trigger:** Player interacts with the sleepy giant clam.

**Animation:** The clam slowly opens, yawns, and blows a protective bubble around the player. It then closes its shell and goes back to sleep.

No dialogue necessary. If player tried to go in water without bubble, then show a dialog:

"Someone peed in it, I probably shouldn't go in like this."

---

## WATER_CRAB

**Trigger:** Player approaches the crab witness.

**Animation:** The crab gestures towards the ocean.

**Crab:**
"I saw someone swim out wearing a whistle!"

No further dialogue necessary.

---

## WATER_WHISTLE

**Trigger:** Player discovers the whistle in the coral.

No dialogue necessary when picking it up.

**Trigger:** Player presents the whistle to Teal.

**Animation:** Teal recognizes the whistle and becomes slightly uncomfortable.

**Teal:**
"That's mine! Someone must've stolen it!"

**Delivery:** Initially surprised, then defensive.

---

## WATER_JELLYFISH

**Trigger:** Player approaches the witness in the Jellyfish Garden.

**Animation:** The witness recalls what they saw.

**Jellyfish Witness:**
"I saw someone sneak back to the lifeguard stand."

**Jellyfish Witness:**
"Round little figure. Big sunglasses."

This provides the final clue pointing towards Teal.

---

## WATER_CONFRONTATION

**Trigger:** Player returns to Teal after collecting all three clues.

**Animation:** Teal initially maintains his professional posture.

**Teal:**
"Ah, back again! Find anything?"

### Evidence Presentation

The player can present the three clues through simple dialogue choices.

**Choice 1:** "Someone wearing a whistle entered the water."

**Teal:**
"Lots of people have whistles!"

**Choice 2:** "We found your whistle in the coral."

**Teal:**
"Well... Thanks for finding it?."

**Choice 3:** "Someone saw a seal with sunglasses return to your station."

**Teal:**
"..."

**Animation:** Teal adjusts his sunglasses, looks away, and becomes visibly nervous.

**Teal:**
"Okay, okay! It was me!"

**Teal:**
"I thought nobody would notice!"

### Wrong Evidence Choices

Teal should have short, humorous deflections when the player presents incomplete or incorrect evidence.

Wrong choices should not restart the investigation or block progression. Level should only be passed when all clues are found.

---

## WATER_RESOLUTION

**Trigger:** Teal confesses.

**Animation:** Teal looks embarrassed and relaxes as the investigation ends.

**Teal:**
"Can we please just reopen the beach?"

**Trigger:** Beach lockdown is lifted.

No additional dialogue necessary. The barrier is removed and beachgoers return to their activities.

---

## Scene References

| Identifier | Story section |
|---|---|
| `WATER_LOCKDOWN` | Scene 2 — Beach Lockdown |
| `WATER_CLAM` | Scene 3 — Underwater Access |
| `WATER_CRAB` | Scene 4 — First Lead |
| `WATER_WHISTLE` | Scene 5 — The Missing Whistle |
| `WATER_JELLYFISH` | Scene 6 — Jellyfish Garden |
| `WATER_CONFRONTATION` | Scene 7 — Confrontation |
| `WATER_RESOLUTION` | Scene 8 — Resolution and Departure |
