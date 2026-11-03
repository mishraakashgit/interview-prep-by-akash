import { describe, expect, it } from 'vitest';
import { PATTERNS, PROBLEMS } from '../data/dsa';
import { addDays, diffDays } from './dates';
import { attemptsByDay, currentStreak } from './activity';
import { isDue, recordAttempt, REVIEW_AFTER_DAYS } from './spacedRepetition';
import { defaultState, normalize } from './storage';
import type { AppState } from '../types';

const MONDAY = '2026-10-19';

describe('data integrity', () => {
  it('has unique problem ids', () => {
    const ids = PROBLEMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every pattern has problems', () => {
    for (const p of PATTERNS) expect(PROBLEMS.some((x) => x.pattern === p.name), p.name).toBe(true);
  });
});

describe('dates', () => {
  it('adds and diffs days across month boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(diffDays('2026-10-25', '2026-11-03')).toBe(9);
  });
});

describe('review schedule', () => {
  it('brings shaky and OK attempts back after a week', () => {
    for (const level of [1, 2] as const) {
      const p = recordAttempt(undefined, MONDAY, level);
      expect(p.status).toBe('revisit');
      expect(p.nextReview).toBe(addDays(MONDAY, REVIEW_AFTER_DAYS));
    }
  });

  it('closes a problem rated nailed it, with no review', () => {
    const p = recordAttempt(undefined, MONDAY, 3);
    expect(p.status).toBe('solved');
    expect(p.nextReview).toBeUndefined();
    expect(isDue(p, addDays(MONDAY, 365))).toBe(false);
  });

  it('is due only from the review date on', () => {
    const p = recordAttempt(undefined, MONDAY, 2);
    expect(isDue(p, addDays(MONDAY, REVIEW_AFTER_DAYS - 1))).toBe(false);
    expect(isDue(p, addDays(MONDAY, REVIEW_AFTER_DAYS))).toBe(true);
  });

  it('a review rated OK again waits another week; nailed it closes it', () => {
    const first = recordAttempt(undefined, MONDAY, 1);
    const reviewDay = first.nextReview!;
    const again = recordAttempt(first, reviewDay, 2);
    expect(again.attempts).toEqual([MONDAY, reviewDay]);
    expect(again.nextReview).toBe(addDays(reviewDay, REVIEW_AFTER_DAYS));
    expect(recordAttempt(again, again.nextReview!, 3).status).toBe('solved');
  });

  it('re-rating on the same day does not add a second attempt', () => {
    const twice = recordAttempt(recordAttempt(undefined, MONDAY, 2), MONDAY, 3);
    expect(twice.attempts).toEqual([MONDAY]);
    expect(twice.status).toBe('solved');
  });
});

describe('activity', () => {
  const state: AppState = {
    ...defaultState(),
    problems: {
      a: recordAttempt(undefined, addDays(MONDAY, -2), 3),
      b: recordAttempt(recordAttempt(undefined, addDays(MONDAY, -8), 1), addDays(MONDAY, -1), 2),
      c: recordAttempt(undefined, addDays(MONDAY, -1), 3),
    },
  };

  it('counts attempts per day, reviews included', () => {
    const days = attemptsByDay(state);
    expect(days.get(addDays(MONDAY, -1))).toBe(2);
    expect(days.get(addDays(MONDAY, -2))).toBe(1);
  });

  it('streak runs back from yesterday when today is empty', () => {
    const days = attemptsByDay(state);
    expect(currentStreak(days, MONDAY)).toBe(2);
    expect(currentStreak(days, addDays(MONDAY, 1))).toBe(0);
  });
});

describe('backup import and older data', () => {
  it('fills missing fields and rejects other versions', () => {
    expect(normalize({ version: 1 }).problems).toEqual({});
    expect(() => normalize({ version: 2 })).toThrow();
    expect(() => normalize('nope')).toThrow();
  });

  it('moves old ratings onto the current schedule and keeps other fields', () => {
    const old = {
      version: 1,
      updatedAt: 5,
      topics: { scalability: { done: true } },
      problems: {
        nailed: { status: 'solved', notes: '', attempts: ['2026-10-23'], confidence: 3, nextReview: '2026-11-01' },
        ok: { status: 'solved', notes: 'two pointers', attempts: ['2026-10-24'], confidence: 2, nextReview: '2026-10-26' },
      },
    };
    const s = normalize(old);
    expect(s.problems.nailed).toMatchObject({ status: 'solved', nextReview: undefined });
    expect(s.problems.ok).toMatchObject({ status: 'revisit', nextReview: '2026-10-31', notes: 'two pointers' });
    expect((s as unknown as { topics: unknown }).topics).toEqual(old.topics);
  });
});
