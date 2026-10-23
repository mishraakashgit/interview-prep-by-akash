import { todayISO } from './dates';
import type { AppState } from '../types';

export const STORAGE_KEY = 'interview-prep:v1';

export function defaultState(): AppState {
  return {
    version: 1,
    startDate: todayISO(),
    problems: {},
    topics: {},
    stories: [],
    applications: [],
    companyNotes: {},
    logs: {},
    planDone: {},
  };
}

/** Fill in any fields missing from older or hand-edited data. */
export function normalize(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') throw new Error('Not a valid backup file');
  const data = raw as Partial<AppState>;
  if (data.version !== 1) throw new Error('Unsupported backup version');
  return { ...defaultState(), ...data };
}

export function loadState(): AppState {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    return text ? normalize(JSON.parse(text)) : defaultState();
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
