import { ACESFilmicToneMapping, PerspectiveCamera, WebGLRenderer } from 'three';

export function createDisplay(canvas) {
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const camera = new PerspectiveCamera(45, 1, 0.08, 180);

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  window.addEventListener('resize', resize);
  resize();

  return {
    renderer,
    camera,
    resize,
    render(scene) {
      renderer.render(scene, camera);
    },
    dispose() {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      renderer.dispose();
    },
  };
}
