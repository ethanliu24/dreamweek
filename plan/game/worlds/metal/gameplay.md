# Metal — Gameplay

## Overview

The player helps Clink repair the ancient forge by reconnecting its broken magical pipe network.

The puzzle is presented as a wall-mounted 3D grid. The player rotates individual pipe pieces to create a continuous path for magical energy to flow from the source to the forge.

**Target duration:** 1–2 minutes.

## Objective

Reconnect the magical pipes to restore the ancient forge.

## Gameplay Flow

### 1. Meet Clink

- The player enters the underground chamber.
- Clink immediately calls the player over and promises a Sword in exchange for help.
- The player approaches Clink.
- Clink explains that the magical pipe network is broken and asks the player to repair it.

### 2. Interact with the Pipe Network

- The player approaches the wall-mounted pipe puzzle.
- Pressing E enters the puzzle interaction.
- The camera moves closer and faces the pipe grid directly.
- The entire puzzle remains visible during gameplay.

### 3. Solve the Puzzle

The puzzle uses a fixed **4-row × 5-column grid** containing pipe segments.

- Each occupied cell contains a pipe piece.
- Some cells are intentionally empty.
- Pipe pieces cannot be moved or replaced.
- The player clicks a pipe piece to rotate it by 90 degrees.
- Only straight pipes and elbow pipes are used.
- The starting point and endpoint are fixed.
- The player must create a continuous path connecting the magical energy source to the forge.

There is no timer, move limit, or failure state.

### 4. Restore the Forge

Once the correct path is connected:

- Magical energy begins flowing from the starting point.
- The energy travels through the connected pipes.
- The flow reaches the forge.
- The ancient forge activates and lights up.

The camera briefly shows the restored pipe network and the forge activating.

### 5. Receive the Reward

- The player returns to Clink.
- Clink celebrates the successful repair and fulfils his promise.
- He gives the player the Sword.
- The player explains that they are gathering materials to brew a special soup.
- Clink comments that the Sword should be useful for stirring it.

### 6. Return to the Overworld

- The player receives the Sword.
- The Metal world is completed.
- Fade back to the overworld.

## Interaction and Camera

### Puzzle Presentation

The pipe network is mounted onto a stone wall near the ancient forge.

The surrounding environment can have larger pipes running along the walls and ceiling, making the puzzle feel like part of a much larger system.

However, the actual puzzle is a compact, readable grid.

### Camera Behaviour

- The player approaches the puzzle and interacts with it.
- The camera moves to a front-facing view of the entire grid.
- The grid remains fully visible throughout the puzzle.
- After completion, the camera shows the magical energy flowing through the environment and reaching the forge.
- Return control to the player after the completion sequence.

## Puzzle Rules

- Grid dimensions: 4 rows × 5 columns.
- Pipe pieces occupy fixed cells.
- Empty cells are allowed.
- Pieces can only rotate in 90-degree increments.
- Supported pipe shapes:
  - Straight pipe: connects two opposite sides.
  - Elbow pipe: connects two adjacent sides.
- Starting point emits magical energy.
- Endpoint connects to the forge.
- A valid solution requires one continuous connection from the source to the endpoint.
- No dragging, moving, replacing, or collecting pipe pieces.

## Rewards

**Sword**

Given by Clink after the forge is restored.

The Sword serves two purposes:
- Weapon for the upcoming arena encounters.
- Tool for stirring the magical soup in the overworld.

## Constraints

- Keep the puzzle to one wall-mounted grid.
- Use a fixed 4 × 5
