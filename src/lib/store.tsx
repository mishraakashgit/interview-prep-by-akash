import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { saveState } from './storage';
import { CloudSaver, type CloudAdapter, type SyncStatus } from './sync';
import type { AppState } from '../types';

export interface Account {
  email: string;
  signOut: () => void;
}

interface Store {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  replace: (s: AppState) => void;
  sync: { status: SyncStatus; savedAt?: number };
  account?: Account;
}

const StoreContext = createContext<Store | null>(null);

interface Props {
  initial: AppState;
  storageKey: string;
  adapter?: CloudAdapter;
  /** Push `initial` to the cloud right away (e.g. first sign-in, or unsynced local changes). */
  uploadInitial?: boolean;
  account?: Account;
  children: ReactNode;
}

export function StoreProvider({ initial, storageKey, adapter, uploadInitial, account, children }: Props) {
  const [state, setState] = useState<AppState>(initial);
  const [sync, setSync] = useState<Store['sync']>({ status: adapter ? 'saved' : 'local' });
  const saver = useRef<CloudSaver | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!adapter) return;
    const s = new CloudSaver(adapter, (status, savedAt) => setSync((prev) => ({ status, savedAt: savedAt ?? prev.savedAt })));
    saver.current = s;
    // Flush unsaved edits when the tab is hidden or closed, and retry when back online.
    const flush = () => void s.flush();
    const onHidden = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', flush);
    window.addEventListener('online', flush);
    return () => {
      flush();
      s.dispose();
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('online', flush);
    };
  }, [adapter]);

  useEffect(() => {
    saveState(state, storageKey);
    const skip = first.current && !uploadInitial;
    first.current = false;
    if (!skip) saver.current?.schedule(state);
  }, [state, storageKey, uploadInitial]);

  const update = useCallback(
    (fn: (s: AppState) => AppState) =>
      setState((s) => {
        const next = fn(s);
        return next === s ? s : { ...next, updatedAt: Date.now() };
      }),
    [],
  );
  const replace = useCallback((s: AppState) => setState({ ...s, updatedAt: Date.now() }), []);

  // Save pending edits before the session (and its credentials) goes away.
  const accountWithFlush = useMemo(
    () => account && { ...account, signOut: () => void (saver.current?.flush() ?? Promise.resolve()).finally(account.signOut) },
    [account],
  );

  return (
    <StoreContext.Provider value={{ state, update, replace, sync, account: accountWithFlush }}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
