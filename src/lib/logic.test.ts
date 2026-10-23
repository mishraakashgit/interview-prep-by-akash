import { describe, expect, it } from 'vitest';
import { PATTERNS, PROBLEMS } from '../data/dsa';
import { SD_TOPICS } from '../data/systemDesign';
import { BEHAVIORAL_QUESTIONS } from '../data/behavioral';
import { addDays, diffDays } from './dates';
import { activeDates, buildDailyPlan, currentStreak, dayStatus, MAX_REVIEWS_PER_DAY, planTasks, ROADMAP } from './plan';
import { isDue, nextInterval, recordAttempt } from './spacedRepetition';
import { defaultState, normalize } from './storage';
import type { AppState } from '../types';

const MONDAY = '2026-10-19';

function stateFrom(start: string, patch: Partial<AppState> = {}): AppState {
  return { ...defaultState(), startDate: start, ...patch };
}

describe('data integrity', () => {
  it('has unique problem, topic and question ids', () => {
    for (const ids of [PROBLEMS.map((p) => p.id), SD_TOPICS.map((t) => t.id), BEHAVIORAL_QUESTIONS.map((q) => q.id)]) {
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('roadmap only references known patterns and topics', () => {
    const patterns = new Set(PATTERNS.map((p) => p.name));
    const topics = new Set(SD_TOPICS.map((t) => t.id));
    for (const week of ROADMAP) {
      week.patterns.forEach((p) => expect(patterns.has(p), p).toBe(true));
      week.topics.forEach((t) => expect(topics.has(t), t).toBe(true));
    }
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

describe('spaced repetition', () => {
  it('low confidence reviews tomorrow and marks revisit', () => {
    const p = recordAttempt(undefined, MONDAY, 1);
    expect(p.status).toBe('revisit');
    expect(p.nextReview).toBe(addDays(MONDAY, 1));
  });

  it('high confidence grows the interval with each attempt', () => {
    expect(nextInterval(1, 3)).toBeLessThan(nextInterval(2, 3));
    expect(nextInterval(2, 3)).toBeLessThan(nextInterval(3, 3));
    expect(nextInterval(99, 3)).toBe(50);
  });

  it('re-rating on the same day does not add a second attempt', () => {
    const once = recordAttempt(undefined, MONDAY, 2);
    const twice = recordAttempt(once, MONDAY, 3);
    expect(twice.attempts).toEqual([MONDAY]);
    expect(twice.confidence).toBe(3);
  });

  it('is due on or after the review date only', () => {
    const p = recordAttempt(undefined, MONDAY, 3);
    expect(isDue(p, MONDAY)).toBe(false);
    expect(isDue(p, p.nextReview!)).toBe(true);
  });
});

describe('daily plan', () => {
  it('starts with week 1 patterns on a weekday', () => {
    const plan = buildDailyPlan(stateFrom(MONDAY), MONDAY);
    expect(plan.week).toBe(1);
    expect(plan.mockDay).toBe(false);
    expect(plan.newProblems).toHaveLength(2);
    plan.newProblems.forEach((p) => expect(ROADMAP[0].patterns).toContain(p.pattern));
    expect(plan.topic?.id).toBe('scalability');
  });

  it('keeps problems solved today in today\'s plan', () => {
    const before = buildDailyPlan(stateFrom(MONDAY), MONDAY);
    const solvedId = before.newProblems[0].id;
    const state = stateFrom(MONDAY, { problems: { [solvedId]: recordAttempt(undefined, MONDAY, 3) } });
    expect(buildDailyPlan(state, MONDAY).newProblems.map((p) => p.id)).toEqual(before.newProblems.map((p) => p.id));
    // ...but moves on the next day.
    expect(buildDailyPlan(state, addDays(MONDAY, 1)).newProblems.map((p) => p.id)).not.toContain(solvedId);
  });

  it('surfaces due reviews', () => {
    const id = PROBLEMS[0].id;
    const state = stateFrom(MONDAY, { problems: { [id]: recordAttempt(undefined, MONDAY, 1) } });
    expect(buildDailyPlan(state, addDays(MONDAY, 1)).reviews.map((p) => p.id)).toContain(id);
  });

  it('caps the week at the roadmap length', () => {
    expect(buildDailyPlan(stateFrom(MONDAY), addDays(MONDAY, 400)).week).toBe(ROADMAP.length);
  });

  it('treats weekends as mock days with a single new problem', () => {
    const saturday = addDays(MONDAY, 5);
    const plan = buildDailyPlan(stateFrom(MONDAY), saturday);
    expect(plan.mockDay).toBe(true);
    expect(plan.newProblems).toHaveLength(1);
  });
});

describe('daily goal', () => {
  it('counts a solved problem and the behavioral question as done', () => {
    let state = stateFrom(MONDAY);
    const plan = buildDailyPlan(state, MONDAY);
    state = {
      ...state,
      problems: { [plan.newProblems[0].id]: recordAttempt(undefined, MONDAY, 2) },
      planDone: { [`${MONDAY}|beh:${plan.behavioral.id}`]: true },
    };
    const tasks = planTasks(state, buildDailyPlan(state, MONDAY));
    expect(tasks).toHaveLength(4); // 2 problems + topic + behavioral
    expect(tasks.filter((t) => t.done)).toHaveLength(2);
  });

  it('only counts a topic finished that day', () => {
    const plan = buildDailyPlan(stateFrom(MONDAY), MONDAY);
    const id = plan.topic!.id;
    const state = stateFrom(MONDAY, { topics: { [id]: { done: true, checked: [], notes: '', doneOn: MONDAY } } });
    expect(planTasks(state, buildDailyPlan(state, MONDAY)).find((t) => t.key === `sd:${id}`)?.done).toBe(true);
    // Next day a new topic is planned.
    expect(buildDailyPlan(state, addDays(MONDAY, 1)).topic?.id).not.toBe(id);
  });

  it('caps reviews per day and reports the backlog', () => {
    const problems = Object.fromEntries(PROBLEMS.slice(0, 10).map((p) => [p.id, recordAttempt(undefined, MONDAY, 1)]));
    const plan = buildDailyPlan(stateFrom(MONDAY, { problems }), addDays(MONDAY, 3));
    expect(plan.reviews).toHaveLength(MAX_REVIEWS_PER_DAY);
    expect(plan.reviewBacklog).toBe(10 - MAX_REVIEWS_PER_DAY);
  });
});

describe('calendar status', () => {
  const start = addDays(MONDAY, -5);
  const state = stateFrom(start, {
    dayStats: {
      [addDays(MONDAY, -3)]: { done: 4, total: 4 },
      [addDays(MONDAY, -2)]: { done: 1, total: 4 },
      [MONDAY]: { done: 1, total: 4 },
    },
  });
  const status = (d: string) => dayStatus(state, d, MONDAY, activeDates(state));

  it('marks complete, partial, missed, today and idle days', () => {
    expect(status(addDays(MONDAY, -3))).toBe('complete');
    expect(status(addDays(MONDAY, -2))).toBe('partial');
    expect(status(addDays(MONDAY, -1))).toBe('missed');
    expect(status(MONDAY)).toBe('today');
    expect(status(addDays(start, -1))).toBe('idle');
    expect(status(addDays(MONDAY, 1))).toBe('idle');
  });
});

describe('streak', () => {
  it('counts consecutive active days and tolerates today being empty', () => {
    const logs = {
      [addDays(MONDAY, -2)]: { minutes: 30, journal: '' },
      [addDays(MONDAY, -1)]: { minutes: 45, journal: '' },
    };
    const state = stateFrom(addDays(MONDAY, -10), { logs });
    expect(currentStreak(state, MONDAY)).toBe(2);
    expect(currentStreak(state, addDays(MONDAY, 1))).toBe(0);
  });
});

describe('backup import', () => {
  it('fills missing fields and rejects other versions', () => {
    expect(normalize({ version: 1, stories: [] }).problems).toEqual({});
    expect(() => normalize({ version: 2 })).toThrow();
    expect(() => normalize('nope')).toThrow();
  });
});
