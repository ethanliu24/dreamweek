const STEP = 1 / 60;
const MAX_STEPS = 3;
const MAX_FRAME_TIME = 0.05;

export function createLoop({ update, render }) {
  let running = false;
  let frameId = null;
  let previousTime = null;
  let elapsed = 0;
  let debt = 0;

  function frame(time) {
    frameId = null;
    const dt = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, MAX_FRAME_TIME);
    previousTime = time;
    elapsed += dt;
    debt += dt;

    for (let steps = 0; running && debt >= STEP && steps < MAX_STEPS; steps++) {
      debt -= STEP;
      update(STEP);
    }

    if (running && !document.hidden) render(elapsed, dt);
    schedule();
  }

  function schedule() {
    if (running && !document.hidden && frameId === null) {
      frameId = requestAnimationFrame(frame);
    }
  }

  function stopFrame() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    previousTime = null;
    debt = 0;
  }

  function onVisibilityChange() {
    if (document.hidden) stopFrame();
    else schedule();
  }

  function pause() {
    running = false;
    stopFrame();
  }

  document.addEventListener('visibilitychange', onVisibilityChange);

  return {
    pause,
    resume() {
      running = true;
      schedule();
    },
    dispose() {
      pause();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}
