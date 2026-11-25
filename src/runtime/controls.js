const PRIORITY = ['explore', 'puzzle', 'story', 'dialogue', 'ending', 'transition'];

export function createControls(input) {
  const locks = new Map();
  let mode = 'explore';

  function updateMode() {
    let next = 0;
    for (const priority of locks.values()) next = Math.max(next, priority);
    if (mode === PRIORITY[next]) return;

    mode = PRIORITY[next];
    input.clear();
  }

  return {
    get mode() { return mode; },
    acquire(requestedMode) {
      const priority = PRIORITY.indexOf(requestedMode);
      if (priority <= 0) throw new RangeError(`Invalid control lock: ${requestedMode}`);

      const token = Symbol(requestedMode);
      locks.set(token, priority);
      updateMode();
      return () => {
        if (locks.delete(token)) updateMode();
      };
    },
    sample() {
      const raw = input.sample();
      const exploring = mode === 'explore';
      const puzzle = mode === 'puzzle';
      const canAdvance = mode === 'dialogue' || mode === 'story' || mode === 'ending';
      return {
        moveX: exploring ? raw.moveX : 0,
        moveZ: exploring ? raw.moveZ : 0,
        primaryHeld: (exploring || puzzle) && raw.primaryHeld,
        secondaryHeld: exploring && raw.secondaryHeld,
        dragX: exploring || puzzle ? raw.dragX : 0,
        dragY: exploring || puzzle ? raw.dragY : 0,
        orbitX: exploring ? raw.orbitX : 0,
        orbitY: exploring ? raw.orbitY : 0,
        primaryPressed: puzzle && raw.attack,
        jump: exploring && raw.jump,
        interact: exploring && raw.interact,
        attack: exploring && raw.attack,
        ultimate: exploring && raw.ultimate,
        advance: canAdvance && (raw.advance || raw.interact),
      };
    },
  };
}
