import { todayISO } from './dates';
import { withSchedule } from './spacedRepetition';
import type { AppState } from '../types';

export const STORAGE_KEY = 'interview-prep:v1';

export function defaultState(): AppState {
  return { version: 1, updatedAt: 0, problems: {} };
}

/**
 * Fill in missing fields and apply the current review rule to older data.
 * Fields from earlier versions of the app (topics, stories, ...) are kept as they are.
 */
export function normalize(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') throw new Error('Not a valid backup file');
  const data = raw as Partial<AppState>;
  if (data.version !== 1) throw new Error('Unsupported backup version');
  const problems = Object.fromEntries(
    Object.entries(data.problems ?? {}).map(([id, p]) => [id, withSchedule({ ...p, notes: p.notes ?? '', attempts: p.attempts ?? [] })]),
  );
  return { ...defaultState(), ...data, problems };
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
  return Object.keys(s.problems).length > 0;
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
