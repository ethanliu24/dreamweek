const MOVEMENT_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
const KEY_ACTIONS = new Map([
  ['Space', 'jump'],
  ['KeyE', 'interact'],
  ['KeyQ', 'ultimate'],
  ['Enter', 'advance'],
  ['NumpadEnter', 'advance'],
]);
const PRIMARY = 1;
const SECONDARY = 2;

export function createInput(canvas) {
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const keys = new Set();
  const pressed = new Set();
  let pointerId = null;
  let buttons = 0;
  let lastX = 0;
  let lastY = 0;
  let dragX = 0;
  let dragY = 0;
  let orbitX = 0;
  let orbitY = 0;

  function onKeyDown(event) {
    const { code } = event;
    const action = KEY_ACTIONS.get(code);
    if ((!action && !MOVEMENT_KEYS.has(code)) || event.isComposing ||
        event.altKey || event.ctrlKey || event.metaKey) return;

    event.preventDefault();
    if (event.repeat || keys.has(code)) return;
    keys.add(code);
    if (action) pressed.add(action);
  }

  function updateButtons(nextButtons) {
    if ((nextButtons & PRIMARY) && !(buttons & PRIMARY)) pressed.add('attack');
    buttons = nextButtons;
  }

  function onPointerDown(event) {
    if (pointerId !== null || !(event.buttons & (PRIMARY | SECONDARY))) return;

    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(event.pointerId);
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    updateButtons(event.buttons);
  }

  function onPointerMove(event) {
    if (event.pointerId !== pointerId) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    if (buttons & PRIMARY) {
      dragX += dx;
      dragY += dy;
    }
    if (buttons & SECONDARY) {
      orbitX += dx;
      orbitY += dy;
    }
    updateButtons(event.buttons);
  }

  function releasePointer() {
    const captured = pointerId;
    pointerId = null;
    buttons = 0;
    if (captured !== null && canvas.hasPointerCapture(captured)) {
      canvas.releasePointerCapture(captured);
    }
  }

  function resetDeltas() {
    dragX = 0;
    dragY = 0;
    orbitX = 0;
    orbitY = 0;
  }

  function clear() {
    keys.clear();
    pressed.clear();
    resetDeltas();
    releasePointer();
  }

  canvas.addEventListener('keydown', onKeyDown, options);
  window.addEventListener('keyup', event => keys.delete(event.code), options);
  canvas.addEventListener('pointerdown', onPointerDown, options);
  canvas.addEventListener('pointermove', onPointerMove, options);
  canvas.addEventListener('pointerup', event => {
    if (event.pointerId === pointerId) releasePointer();
  }, options);
  function onPointerCancel(event) {
    if (event.pointerId !== pointerId) return;
    pressed.delete('attack');
    resetDeltas();
    releasePointer();
  }
  canvas.addEventListener('pointercancel', onPointerCancel, options);
  canvas.addEventListener('lostpointercapture', onPointerCancel, options);
  canvas.addEventListener('contextmenu', event => event.preventDefault(), options);
  canvas.addEventListener('blur', clear, options);
  window.addEventListener('blur', clear, options);
  document.addEventListener('visibilitychange', clear, options);

  return {
    sample() {
      const actions = {
        moveX: Number(keys.has('KeyD')) - Number(keys.has('KeyA')),
        moveZ: Number(keys.has('KeyS')) - Number(keys.has('KeyW')),
        primaryHeld: Boolean(buttons & PRIMARY),
        secondaryHeld: Boolean(buttons & SECONDARY),
        dragX, dragY, orbitX, orbitY,
        jump: pressed.has('jump'),
        interact: pressed.has('interact'),
        attack: pressed.has('attack'),
        ultimate: pressed.has('ultimate'),
        advance: pressed.has('advance'),
      };
      pressed.clear();
      resetDeltas();
      return actions;
    },
    clear,
    dispose() {
      listeners.abort();
      clear();
    },
  };
}
