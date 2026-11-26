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

  function resizeEffects(width, height, pixelRatio) {
    if (!effects) return;
    effects.composer.setPixelRatio(pixelRatio);
    effects.composer.setSize(width, height);
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    resizeEffects(width, height, pixelRatio);
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
    render(scene, glow, viewCamera = camera) {
      if (!glow || glow.strength <= 0) {
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
        effects = { composer, render, bloom, output };
        resizeEffects(canvas.clientWidth, canvas.clientHeight, renderer.getPixelRatio());
      }
      effects.render.scene = scene;
      effects.render.camera = viewCamera;
      effects.bloom.strength = glow.strength;
      effects.bloom.radius = glow.radius;
      effects.bloom.threshold = glow.threshold;
      effects.composer.render();
    },
    dispose() {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      effects?.composer.dispose();
      effects?.bloom.dispose();
      effects?.output.dispose();
      renderer.dispose();
    },
  };
}
