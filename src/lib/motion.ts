/** True when the user asked their OS for less motion; animations then stay still. */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The 3D pills are decoration, so their ~134 KB is only fetched on a desktop-class device
 * (precise pointer), with motion allowed and data saver off. Everyone else gets the SVG logo.
 */
export function allow3d(): boolean {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return !prefersReducedMotion() && !saveData && typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches;
}
