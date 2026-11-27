import { ACESFilmicToneMapping, PCFShadowMap, PerspectiveCamera, Vector2, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export function createDisplay(canvas) {
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const camera = new PerspectiveCamera(45, 1, 0.08, 180);
  let effects;
  let width = 0;
  let height = 0;
  let resizePending = false;

  function resizeEffects(width, height, pixelRatio) {
    if (!effects) return;
    if (effects.pixelRatio !== pixelRatio) {
      effects.composer.setPixelRatio(pixelRatio);
      effects.pixelRatio = pixelRatio;
    }
    effects.composer.setSize(width, height);
  }

  function resize() {
    resizePending = false;
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    if (!nextWidth || !nextHeight) return;

    const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
    const pixelRatioChanged = renderer.getPixelRatio() !== pixelRatio;
    const sizeChanged = width !== nextWidth || height !== nextHeight;
    if (!sizeChanged && !pixelRatioChanged) return;

    width = nextWidth;
    height = nextHeight;
    if (pixelRatioChanged) renderer.setPixelRatio(pixelRatio);
    if (sizeChanged) renderer.setSize(width, height, false);
    resizeEffects(width, height, pixelRatio);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  // Setting the canvas dimensions clears the drawing buffer. Do it just before drawing.
  function queueResize() {
    resizePending = true;
  }

  const observer = new ResizeObserver(queueResize);
  observer.observe(canvas);
  window.addEventListener('resize', queueResize);
  resize();

  return {
    renderer,
    camera,
    resize: queueResize,
    render(scene, glow, viewCamera = camera, postProcess) {
      if (resizePending) resize();
      if (!postProcess && (!glow || glow.strength <= 0)) {
        renderer.render(scene, viewCamera);
        return;
      }
      if (!effects) {
        const composer = new EffectComposer(renderer);
        const render = new RenderPass(scene, viewCamera);
        const bloom = new UnrealBloomPass(new Vector2(256, 256));
        const output = new OutputPass();
        composer.addPass(render);
        composer.addPass(bloom);
        composer.addPass(output);
        effects = { composer, render, bloom, output, pixelRatio: renderer.getPixelRatio() };
        resizeEffects(canvas.clientWidth, canvas.clientHeight, renderer.getPixelRatio());
      }
      effects.render.scene = scene;
      effects.render.camera = viewCamera;
      effects.bloom.enabled = Boolean(glow?.strength > 0);
      if (effects.bloom.enabled) {
        effects.bloom.strength = glow.strength;
        effects.bloom.radius = glow.radius;
        effects.bloom.threshold = glow.threshold;
      }
      // World shaders that perform output conversion draw directly to the canvas.
      effects.output.enabled = !postProcess;
      if (postProcess) effects.composer.insertPass(postProcess, 2);
      try {
        effects.composer.render();
      } finally {
        if (postProcess) effects.composer.removePass(postProcess);
      }
    },
    dispose() {
      observer.disconnect();
      window.removeEventListener('resize', queueResize);
      effects?.composer.dispose();
      effects?.bloom.dispose();
      effects?.output.dispose();
      renderer.dispose();
    },
  };
}
