import { addDays } from './dates';
import type { AppState } from '../types';

/** Number of problems attempted (new or review) on each ISO date. */
export function attemptsByDay(state: AppState): Map<string, number> {
  const days = new Map<string, number>();
  for (const p of Object.values(state.problems)) {
    for (const d of p.attempts) days.set(d, (days.get(d) ?? 0) + 1);
  }
  return days;
}

/** Consecutive days with at least one attempt, ending today (or yesterday, so it survives until you practise today). */
export function currentStreak(days: Map<string, number>, today: string): number {
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
