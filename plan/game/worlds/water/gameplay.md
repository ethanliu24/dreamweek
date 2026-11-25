# Water — Gameplay

## 1. Overview

A short investigation and exploration experience set on a beach and in a magical underwater coral garden.

The player arrives carrying the empty pot from Earth. They collect water from a beach faucet, but before they can leave, the beach is placed under lockdown because someone has peed in the ocean.

The player must investigate to identify the culprit, who turns out to be Teal, the lifeguard.

The gameplay consists of:
1. Collecting water.
2. Exploring a compact underwater environment.
3. Finding three pieces of evidence.
4. Presenting the evidence to Teal.
5. Resolving the lockdown and completing the world.

**Target duration:** 3–5 minutes.

## 2. Gameplay Flow

### Part 1 — Collect Water

**Objective:** Fill the pot before leaving the beach.

- The player arrives at the beach carrying the empty pot from Earth.
- A small outdoor faucet is available near the beach.
- The player interacts with the faucet to fill the pot.
- Once the pot is filled, a shell siren sounds.
- The beach is immediately placed under lockdown.

The filled pot remains with the player throughout the investigation.

### Part 2 — Beach Lockdown

**Objective:** Find out what happened and regain permission to leave.

- Teal announces that someone has peed in the ocean.
- The beach is closed until the culprit is found.
- A barrier and BEACH CLOSED sign block the beach exit.
- The player must investigate before being allowed to leave.

The player can talk to Teal for information about the incident.

### Part 3 — Underwater Access

**Objective:** Obtain protection and explore underwater.

The player encounters a large, sleepy clam near the lifeguard station.

- Interacting with the clam causes it to wake up slightly.
- The clam blows a large protective bubble around the player.
- The bubble allows the player to explore underwater without directly touching the water.
- The clam immediately goes back to sleep.

This interaction introduces and grants the Bubble Shield ability.

#### Underwater Movement

- Use simple underwater movement.
- Allow the player to move through the underwater environment and approach objects and characters.
- No oxygen meter, underwater timer, or complicated swimming physics.
- No bubble physics are required.

#### Bubble Shield Ability

- Absorbs one incoming hit.
- Pops after absorbing a hit.
- Recharges automatically after a short cooldown.
- The ability is retained after completing the Water world.

This is primarily a future gameplay ability; the Water investigation itself does not require combat.

### Part 4 — Investigation

**Objective:** Collect three pieces of evidence identifying the culprit.

All investigation takes place within one compact underwater map.

There are no separate levels or complicated branching paths.

#### Evidence 1 — The Crab

The player encounters a crab witness.

- The crab saw someone wearing a whistle enter the water.
- The crab tells the player what it witnessed.
- This suggests that someone associated with the beach staff may be involved.

**Interaction:** Talk to the crab to register the first clue.

#### Evidence 2 — The Missing Whistle

The player discovers a lifeguard whistle among the coral.

- The player recognizes that the whistle belongs to Teal.
- The whistle is collected as evidence.
- The player returns to Teal and presents it.
- Teal claims that someone stole it from him.

**Interaction:** Pick up the whistle and present it to Teal.

#### Evidence 3 — Jellyfish Garden

The player explores the Jellyfish Garden and encounters another witness.

- The witness saw the swimmer return to the lifeguard station.
- They remember a distinctive silhouette.
- They describe a round figure wearing large sunglasses.
- This strongly implicates Teal.

**Interaction:** Talk to the witness to register the final clue.

Once all three clues are collected, the player can return to Teal for the final confrontation.

### Part 5 — Confront Teal

**Objective:** Present the evidence and identify the culprit.

- The player returns to Teal after collecting all three clues.
- Interact with him to begin the confrontation.
- Evidence is presented through simple dialogue choices.
- Each piece of evidence triggers a corresponding reaction.
- Teal becomes increasingly nervous as the evidence accumulates.
- After all three clues have been presented, Teal confesses.

#### Investigation Logic

Keep the evidence system simple:
- Each clue is represented by a boolean or simple collected state.
- The confrontation checks which clues have been collected and presented.
- Evidence can be presented in any order.
- Once all three have been presented, the confession triggers.
- Incorrect or unrelated choices produce humorous responses, not a restart.
- No complex deduction system, inventory management, or branching investigation tree is required.

See `dialogs.md` for dialogue and evidence responses.

### Part 6 — Resolution

**Objective:** Reopen the beach and complete the dream.

After Teal confesses:

- The lockdown is lifted.
- The barrier is removed.
- The BEACH CLOSED sign is removed.
- Beachgoers return to their activities.
- The player retains the filled pot and Bubble Shield ability.
- The Water world is marked as completed.
- The screen fades to black and the player returns to the overworld.

Upon returning, the player can interact with the cooking station to place the filled pot.

## 3. Environment and Navigation

The world consists of two connected areas:

### Beach
- Small, simple above-water environment.
- Contains the faucet, lifeguard stand, clam station, beachgoers, and beach exit.
- The exit is blocked during lockdown.

### Underwater
- One compact, continuous environment.
- Contains the crab, missing whistle, and Jellyfish Garden witness.
- Coral formations serve as the main terrain and landmarks.
- The player can freely explore and move between investigation locations.

No separate underwater sublevels or loading transitions are needed.

## 4. Controls and Interactions

Use simple, consistent interaction controls.

| Interaction | Action |
|---|---|
| Faucet | Fill the carried pot |
| Teal | Talk and present evidence |
| Giant clam | Receive protective bubble |
| Crab | Obtain first clue |
| Whistle | Collect evidence |
| Jellyfish witness | Obtain final clue |
| Beach exit | Leave after lockdown is lifted |

Use contextual interaction prompts where appropriate.

The player should always have a clear indication when an object or character can be interacted with.

## 5. Scope and Implementation Constraints

Keep the investigation straightforward and inexpensive to implement.

- One beach environment.
- One underwater environment.
- One continuous underwater map.
- Three pieces of evidence.
- Three witness / evidence interactions.
- One final confrontation.
- Simple dialogue choices.
- Boolean-based investigation progression.
- No complex branching or deduction system.
- No oxygen meter or underwater timer.
- No combat or bubble physics.
- No inventory management system beyond tracking the collected clues and progression rewards.

The underwater environment should feel open enough to explore but small enough that players can find everything quickly.

The investigation should guide the player naturally between locations without requiring extensive navigation.

## 6. Completion Criteria

The Water world is completed when:

- The player has filled the pot with water.
- All three clues have been collected and presented.
- Teal has confessed.
- The beach lockdown has been lifted.
- The Bubble Shield ability has been granted.
- The player returns to the overworld carrying the filled pot.

## 7. Related Documents

- `character.md` — Teal's identity, appearance, and personality.
- `scenery.md` — Beach and underwater coral garden.
- `story.md` — Narrative sequence, character animations, camera direction, and storyboard.
- `dialogs.md` — Dialogue, evidence responses, and confrontation.
