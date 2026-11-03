import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createStage } from './stage';
import { makePillKit } from './pill';
import { prefersReducedMotion } from '../lib/motion';

const COUNT = 12;
const SPREAD = { x: 7.5, y: 5, zNear: -1, zFar: -10 };

/** Small seeded random generator, so the field looks the same on every visit. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Brand pills drifting slowly upward behind the login card, fading into the page with distance.
 * Calls `onReady` after the first frame so the flat SVG pills can step aside; if WebGL is
 * unavailable it renders nothing and the SVG pills stay.
 */
export default function PillField({ onReady }: { onReady: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stage: ReturnType<typeof createStage>;
    try {
      stage = createStage(ref.current!, 45, 9);
    } catch {
      return;
    }
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0e1116';
    stage.scene.fog = new THREE.Fog(bg, 7, 19);

    const kit = makePillKit();
    const rand = seeded(7);
    const pills = Array.from({ length: COUNT }, () => {
      const pill = kit.makePill();
      let x = (rand() * 2 - 1) * SPREAD.x;
      const z = SPREAD.zFar + rand() * (SPREAD.zNear - SPREAD.zFar);
      // Keep the area behind the login card clear.
      if (Math.abs(x) < 2.6 && z > -4) x = Math.sign(x || 1) * (2.6 + rand() * 3);
      pill.position.set(x, (rand() * 2 - 1) * SPREAD.y, z);
      pill.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
      pill.scale.setScalar(0.45 + rand() * 0.4);
      stage.scene.add(pill);
      const axis = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
      return { pill, axis, spin: 0.15 + rand() * 0.35, rise: 0.12 + rand() * 0.2 };
    });

    if (prefersReducedMotion()) {
      stage.render();
      onReady();
      return () => (stage.dispose(), kit.dispose());
    }

    const look = new THREE.Vector2();
    const onPointer = (e: PointerEvent) =>
      look.set((e.clientX / window.innerWidth - 0.5) * 1.2, -(e.clientY / window.innerHeight - 0.5) * 0.8);
    window.addEventListener('pointermove', onPointer);

    let ready = false;
    stage.start((_t, dt) => {
      for (const p of pills) {
        p.pill.rotateOnAxis(p.axis, p.spin * dt);
        p.pill.position.y += p.rise * dt;
        if (p.pill.position.y > SPREAD.y + 1.5) p.pill.position.y = -SPREAD.y - 1.5;
      }
      stage.camera.position.x += (look.x - stage.camera.position.x) * Math.min(1, dt * 2);
      stage.camera.position.y += (look.y - stage.camera.position.y) * Math.min(1, dt * 2);
      stage.camera.lookAt(0, 0, 0);
      if (!ready) {
        ready = true;
        onReady();
      }
    });

    return () => {
      window.removeEventListener('pointermove', onPointer);
      stage.dispose();
      kit.dispose();
    };
  }, [onReady]);

  return <canvas ref={ref} className="pill-field" aria-hidden />;
}
