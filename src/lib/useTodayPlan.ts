import { useEffect, useMemo, useRef } from 'react';
import { useStore } from './store';
import { buildDailyPlan, planTasks } from './plan';
import { todayISO } from './dates';
import { useToast } from '../components/Toast';

export function useTodayPlan() {
  const { state } = useStore();
  const today = todayISO();
  return useMemo(() => {
    const plan = buildDailyPlan(state, today);
    const tasks = planTasks(state, plan);
    return { plan, tasks, done: tasks.filter((t) => t.done).length, total: tasks.length };
  }, [state, today]);
}

/** Records today's goal progress for the calendar and celebrates when it's hit. */
export function DailyGoalTracker() {
  const { state, update } = useStore();
  const toast = useToast();
  const { plan, done, total } = useTodayPlan();
  const wasComplete = useRef<boolean | null>(null);

  useEffect(() => {
    const stat = state.dayStats[plan.date];
    if (stat?.done !== done || stat?.total !== total) {
      update((s) => ({ ...s, dayStats: { ...s.dayStats, [plan.date]: { done, total } } }));
    }
    const complete = total > 0 && done >= total;
    if (wasComplete.current === false && complete) toast('🎉 Daily goal complete. See you tomorrow!');
    wasComplete.current = complete;
  }, [plan.date, done, total, state.dayStats, update, toast]);

  return null;
}
