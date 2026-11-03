import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createStage } from './stage';
import { LOGO_TILT, makePillKit } from './pill';
import { prefersReducedMotion } from '../lib/motion';
import { PillLogo } from '../components/Brand';
import { RATED_EVENT } from '../lib/events';

/**
 * The brand pill in 3D beside the page title: floats, follows the pointer a little, and spins
 * once on each rating (twice for "Nailed it").
 */
export default function HeroPill({ size = 56 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stage: ReturnType<typeof createStage>;
    try {
      stage = createStage(ref.current!, 30, 4.3);
    } catch {
      setFailed(true);
      return;
    }
    const kit = makePillKit();
    const pill = kit.makePill();
    const holder = new THREE.Group();
    holder.rotation.z = LOGO_TILT;
    holder.add(pill);
    stage.scene.add(holder);

    if (prefersReducedMotion()) {
      stage.render();
      return () => (stage.dispose(), kit.dispose());
    }

    let spin = 0; // radians still to turn
    let pop = 0; // 1 right after a rating, easing back to 0
    const tilt = new THREE.Vector2();
    const onRated = (e: Event) => {
      spin += Math.PI * 2 * ((e as CustomEvent<{ level: number }>).detail?.level === 3 ? 2 : 1);
      pop = 1;
    };
    const onPointer = (e: PointerEvent) =>
      tilt.set((e.clientY / window.innerHeight - 0.5) * 0.5, (e.clientX / window.innerWidth - 0.5) * 0.6);
    window.addEventListener(RATED_EVENT, onRated);
    window.addEventListener('pointermove', onPointer);

    stage.start((t, dt) => {
      const step = spin * Math.min(1, dt * 5);
      spin -= step;
      pill.rotation.y += dt * 0.5 + step;
      pop *= Math.exp(-dt * 5);
      holder.scale.setScalar(1 + 0.2 * pop);
      holder.position.y = Math.sin(t * 1.6) * 0.06;
      holder.rotation.x += (tilt.x - holder.rotation.x) * Math.min(1, dt * 4);
      holder.rotation.y += (tilt.y - holder.rotation.y) * Math.min(1, dt * 4);
    });

    return () => {
      window.removeEventListener(RATED_EVENT, onRated);
      window.removeEventListener('pointermove', onPointer);
      stage.dispose();
      kit.dispose();
    };
  }, []);

  if (failed) return <PillLogo size={size} />;
  return <canvas ref={ref} className="hero-pill" style={{ width: size, height: size }} aria-hidden />;
}
