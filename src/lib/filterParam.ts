import { useSyncExternalStore } from 'react';

/*
 * The list filter lives in the URL hash (#/?filter=due) so it survives a reload and can be
 * shared, without pulling in a router for what is now a single page.
 */
const CHANGE = 'pillsdev:filter';

const read = () => new URLSearchParams(location.hash.split('?')[1] ?? '').get('filter');

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

export function setFilterParam(value: string | null): void {
  history.replaceState(null, '', value ? `#/?filter=${encodeURIComponent(value)}` : '#/');
  window.dispatchEvent(new Event(CHANGE));
}

export function useFilterParam(): string | null {
  return useSyncExternalStore(subscribe, read);
}
