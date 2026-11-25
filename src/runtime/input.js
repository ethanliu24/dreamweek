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
const DRAG_THRESHOLD = 5;

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
  let primaryStartX = 0;
  let primaryStartY = 0;
  let orbiting = false;

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

  function updateButtons(event) {
    if ((event.buttons & PRIMARY) && !(buttons & PRIMARY)) {
      primaryStartX = event.clientX;
      primaryStartY = event.clientY;
      orbiting = false;
      pressed.add('primary');
    }
    if ((buttons & PRIMARY) && !(event.buttons & PRIMARY) && !orbiting) pressed.add('attack');
    buttons = event.buttons;
  }

  function onPointerDown(event) {
    if (pointerId !== null || !(event.buttons & (PRIMARY | SECONDARY))) return;

    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(event.pointerId);
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    updateButtons(event);
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
      if (orbiting) {
        orbitX += dx;
        orbitY += dy;
      } else {
        const totalX = event.clientX - primaryStartX;
        const totalY = event.clientY - primaryStartY;
        if (Math.hypot(totalX, totalY) >= DRAG_THRESHOLD) {
          orbiting = true;
          orbitX += totalX;
          orbitY += totalY;
        }
      }
    }
    updateButtons(event);
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
    if (event.pointerId !== pointerId) return;
    onPointerMove(event);
    releasePointer();
  }, options);
  function onPointerCancel(event) {
    if (event.pointerId !== pointerId) return;
    pressed.delete('primary');
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
        primaryPressed: pressed.has('primary'),
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
