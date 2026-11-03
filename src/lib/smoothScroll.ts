import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { prefersReducedMotion } from './motion';

/**
 * Smooth wheel scrolling for the whole page. It keeps native scroll underneath, so sticky
 * elements and keyboard scrolling work as usual; touch scrolling stays native on phones.
 * Add `data-lenis-prevent` to anything that scrolls on its own (e.g. a textarea).
 */
export function initSmoothScroll(): void {
  if (prefersReducedMotion()) return;
  new Lenis({ autoRaf: true, lerp: 0.12 });
}
