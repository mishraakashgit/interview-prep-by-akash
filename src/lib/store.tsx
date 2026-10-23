import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadState, saveState } from './storage';
import type { AppState } from '../types';

interface Store {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  replace: (s: AppState) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => saveState(state), [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);
  const replace = useCallback((s: AppState) => setState(s), []);

  return <StoreContext.Provider value={{ state, update, replace }}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
