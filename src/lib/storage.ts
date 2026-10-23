import { todayISO } from './dates';
import type { AppState } from '../types';

export const STORAGE_KEY = 'interview-prep:v1';

export function defaultState(): AppState {
  return {
    version: 1,
    updatedAt: 0,
    startDate: todayISO(),
    problems: {},
    topics: {},
    stories: [],
    applications: [],
    companyNotes: {},
    logs: {},
    planDone: {},
    dayStats: {},
  };
}

/** Fill in any fields missing from older or hand-edited data. */
export function normalize(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') throw new Error('Not a valid backup file');
  const data = raw as Partial<AppState>;
  if (data.version !== 1) throw new Error('Unsupported backup version');
  return { ...defaultState(), ...data };
}

/** Per-user cache key when signed in, so two accounts on one browser never mix. */
export const userStorageKey = (userId: string) => `${STORAGE_KEY}:${userId}`;

export function loadState(key = STORAGE_KEY): AppState | null {
  try {
    const text = localStorage.getItem(key);
    return text ? normalize(JSON.parse(text)) : null;
  } catch {
    return null;
  }
}

/** True once the user has recorded anything worth keeping. */
export function hasProgress(s: AppState): boolean {
  return (
    Object.keys(s.problems).length > 0 ||
    Object.keys(s.topics).length > 0 ||
    s.stories.length > 0 ||
    s.applications.length > 0 ||
    Object.keys(s.logs).length > 0
  );
}

export function saveState(state: AppState, key = STORAGE_KEY): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode): the app keeps working in memory.
  }
}

export function downloadBackup(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-prep-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
