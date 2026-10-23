import { PROBLEMS } from '../data/dsa';
import { SD_TOPICS } from '../data/systemDesign';
import { BEHAVIORAL_QUESTIONS } from '../data/behavioral';
import { addDays, diffDays, isWeekend } from './dates';
import { isDue } from './spacedRepetition';
import type { AppState, BehavioralQuestion, DsaProblem, SdTopic } from '../types';

export interface PlanWeek {
  title: string;
  patterns: string[];
  topics: string[]; // SD topic ids
}

/** 12-week roadmap. After week 12 the plan stays in revision mode. */
export const ROADMAP: PlanWeek[] = [
  { title: 'Foundations', patterns: ['Arrays & Hashing', 'Two Pointers'], topics: ['scalability', 'latency-numbers', 'cap'] },
  { title: 'Windows & stacks; data stores', patterns: ['Sliding Window', 'Stack'], topics: ['databases', 'sharding', 'replication'] },
  { title: 'Search & lists; building blocks', patterns: ['Binary Search', 'Linked List'], topics: ['caching', 'load-balancer', 'message-queues'] },
  { title: 'Trees; distributed systems', patterns: ['Trees'], topics: ['distributed-txn', 'reliability', 'microservices'] },
  { title: 'Tries & heaps; first case studies', patterns: ['Tries', 'Heap / Priority Queue'], topics: ['url-shortener', 'rate-limiter', 'security'] },
  { title: 'Backtracking & graphs', patterns: ['Backtracking', 'Graphs'], topics: ['notification', 'news-feed', 'observability'] },
  { title: 'Graphs; payments core', patterns: ['Graphs', 'Advanced Graphs'], topics: ['payment-system', 'ledger'] },
  { title: 'DP I; card networks & fraud', patterns: ['1-D Dynamic Programming'], topics: ['card-authorization', 'fraud-detection'] },
  { title: 'DP II; classic case studies', patterns: ['2-D Dynamic Programming'], topics: ['chat', 'distributed-cache', 'job-scheduler'] },
  { title: 'Greedy & intervals; money movement', patterns: ['Greedy', 'Intervals'], topics: ['money-transfer', 'reconciliation'] },
  { title: 'Math, bits & LLD; banking platforms', patterns: ['Math & Geometry', 'Bit Manipulation', 'Design (LLD)'], topics: ['trading', 'api-gateway-bank', 'file-storage', 'search', 'cdn-storage'] },
  { title: 'Revision & mocks', patterns: [], topics: [] },
];

export const NEW_PROBLEMS_PER_DAY = 2;

export interface DailyPlan {
  date: string;
  dayNumber: number; // 1-based
  week: number; // 1-based, capped at ROADMAP.length
  weekInfo: PlanWeek;
  mockDay: boolean;
  newProblems: DsaProblem[];
  reviews: DsaProblem[];
  topic?: SdTopic;
  behavioral: BehavioralQuestion;
}

function lastAttempt(state: AppState, id: string): string | undefined {
  return state.problems[id]?.attempts.at(-1);
}

/**
 * Builds the plan for `date`. It is stable through the day: items completed on
 * `date` stay in the plan (shown as done) instead of being replaced.
 */
export function buildDailyPlan(state: AppState, date: string): DailyPlan {
  const dayNumber = Math.max(0, diffDays(state.startDate, date)) + 1;
  const week = Math.min(Math.ceil(dayNumber / 7), ROADMAP.length);
  const weekInfo = ROADMAP[week - 1];
  const mockDay = isWeekend(date);

  // A problem is still "open" for planning if it was never attempted, or its first attempt was today.
  const openForNew = (p: DsaProblem) => {
    const attempts = state.problems[p.id]?.attempts ?? [];
    return attempts.length === 0 || (attempts.length === 1 && attempts[0] === date);
  };

  const inFocus = PROBLEMS.filter((p) => weekInfo.patterns.includes(p.pattern) && openForNew(p));
  // Fall back to any remaining core problem, then anything at all (revision weeks / ahead of schedule).
  const fallbacks = [
    ...PROBLEMS.filter((p) => p.core && openForNew(p)),
    ...PROBLEMS.filter((p) => !p.core && openForNew(p)),
  ];
  const pool = [...inFocus, ...fallbacks.filter((p) => !inFocus.includes(p))];
  const newCount = mockDay ? 1 : NEW_PROBLEMS_PER_DAY;
  const newProblems = pool.slice(0, newCount);

  const reviews = PROBLEMS.filter((p) => {
    const prog = state.problems[p.id];
    if (!prog || newProblems.includes(p)) return false;
    const reviewedToday = prog.attempts.length >= 2 && lastAttempt(state, p.id) === date;
    return isDue(prog, date) || reviewedToday;
  });

  const openTopic = (t: SdTopic) => {
    const prog = state.topics[t.id];
    return !prog?.done || prog.lastStudied === date;
  };
  const weekTopics = weekInfo.topics.map((id) => SD_TOPICS.find((t) => t.id === id)!).filter(Boolean);
  const topic = weekTopics.find(openTopic) ?? SD_TOPICS.find(openTopic);

  const behavioral = BEHAVIORAL_QUESTIONS[(dayNumber - 1) % BEHAVIORAL_QUESTIONS.length];

  return { date, dayNumber, week, weekInfo, mockDay, newProblems, reviews, topic, behavioral };
}

/** Every date with any recorded activity. */
export function activeDates(state: AppState): Set<string> {
  const dates = new Set<string>();
  Object.values(state.problems).forEach((p) => p.attempts.forEach((d) => dates.add(d)));
  Object.values(state.topics).forEach((t) => t.lastStudied && dates.add(t.lastStudied));
  Object.entries(state.logs).forEach(([d, log]) => (log.minutes > 0 || log.journal.trim()) && dates.add(d));
  Object.entries(state.planDone).forEach(([key, done]) => done && dates.add(key.split('|')[0]));
  return dates;
}

/** Consecutive active days ending today (or yesterday, so the streak survives until you study today). */
export function currentStreak(state: AppState, today: string): number {
  const dates = activeDates(state);
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (dates.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
