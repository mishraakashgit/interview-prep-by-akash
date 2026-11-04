import * as THREE from 'three';

export interface Stage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Renders one frame; used when animation is off. */
  render(): void;
  /** Starts the loop; `frame` gets elapsed and delta seconds. */
  start(frame: (t: number, dt: number) => void): void;
  dispose(): void;
}

/**
 * A transparent WebGL canvas with soft studio lighting that sizes itself to its CSS box.
 * Throws when WebGL is unavailable, so callers can fall back to the flat SVG logo.
 */
export function createStage(canvas: HTMLCanvasElement, fov: number, distance: number): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  camera.position.set(0, 0, distance);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1f27, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(0x34d399, 1.2); // brand mint from behind
  rim.position.set(4, -2, -4);
  scene.add(key, rim);

  const render = () => renderer.render(scene, camera);
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const clock = new THREE.Timer();
  return {
    scene,
    camera,
    render,
    start(frame) {
      renderer.setAnimationLoop((now) => {
        clock.update(now);
        frame(clock.getElapsed(), Math.min(clock.getDelta(), 0.05));
        render();
      });
    },
    dispose() {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      renderer.dispose();
    },
  };
}
