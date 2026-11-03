import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { allow3d } from '../lib/motion';
import type PillFieldType from './PillField';

const HeroPill = lazy(() => import('./HeroPill'));
const PillField = lazy(() => import('./PillField'));

/** Renders `fallback` until the browser is idle, then the 3D scene, if this device should get one. */
function useIdle(): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (!allow3d()) return;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => setIdle(true));
    return () => cancel(id);
  }, []);
  return idle;
}

export function HeroPillSlot({ size, fallback }: { size: number; fallback: ReactNode }) {
  const idle = useIdle();
  if (!idle) return <>{fallback}</>;
  return (
    <Suspense fallback={fallback}>
      <HeroPill size={size} />
    </Suspense>
  );
}

export function PillFieldSlot(props: Parameters<typeof PillFieldType>[0]) {
  const idle = useIdle();
  if (!idle) return null;
  return (
    <Suspense fallback={null}>
      <PillField {...props} />
    </Suspense>
  );
}
