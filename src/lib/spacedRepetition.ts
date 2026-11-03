import { addDays } from './dates';
import type { ProblemProgress } from '../types';

/** Problems rated shaky or OK come back for review this many days later. */
export const REVIEW_AFTER_DAYS = 7;

/** Record an attempt on `date`: nailing it closes the problem, anything less schedules a review. */
export function recordAttempt(
  prev: ProblemProgress | undefined,
  date: string,
  confidence: 1 | 2 | 3,
): ProblemProgress {
  const base: ProblemProgress = prev ?? { status: 'todo', notes: '', attempts: [] };
  // Re-rating on the same day replaces that day's attempt instead of counting twice.
  const attempts = base.attempts.at(-1) === date ? base.attempts : [...base.attempts, date];
  return withSchedule({ ...base, attempts, confidence });
}

/** Derives status and next review from the latest rating. */
export function withSchedule(p: ProblemProgress): ProblemProgress {
  const last = p.attempts.at(-1);
  if (!last || !p.confidence) return { ...p, status: 'todo', nextReview: undefined };
  if (p.confidence === 3) return { ...p, status: 'solved', nextReview: undefined };
  return { ...p, status: 'revisit', nextReview: addDays(last, REVIEW_AFTER_DAYS) };
}

export function isDue(p: ProblemProgress | undefined, today: string): boolean {
  return p?.status === 'revisit' && !!p.nextReview && p.nextReview <= today;
}
