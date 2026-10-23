import { addDays } from './dates';
import type { ProblemProgress } from '../types';

/** Review intervals in days after the 1st, 2nd, 3rd... successful attempt. */
export const INTERVALS = [2, 5, 12, 25, 50];

/**
 * Days until the next review. Low confidence resets to the shortest interval,
 * medium repeats the current step, high confidence advances to the next one.
 */
export function nextInterval(attemptCount: number, confidence: 1 | 2 | 3): number {
  if (confidence === 1) return 1;
  const step = Math.max(0, attemptCount - 1);
  const idx = confidence === 3 ? step : Math.max(0, step - 1);
  return INTERVALS[Math.min(idx, INTERVALS.length - 1)];
}

/** Record a successful attempt on `date` and schedule the next review. */
export function recordAttempt(
  prev: ProblemProgress | undefined,
  date: string,
  confidence: 1 | 2 | 3,
): ProblemProgress {
  const base: ProblemProgress = prev ?? { status: 'todo', notes: '', attempts: [] };
  // Re-rating on the same day replaces that day's attempt instead of counting twice.
  const attempts = base.attempts.at(-1) === date ? base.attempts : [...base.attempts, date];
  return {
    ...base,
    status: confidence === 1 ? 'revisit' : 'solved',
    attempts,
    confidence,
    nextReview: addDays(date, nextInterval(attempts.length, confidence)),
  };
}

export function isDue(p: ProblemProgress | undefined, today: string): boolean {
  return !!p && p.status !== 'todo' && !!p.nextReview && p.nextReview <= today;
}
