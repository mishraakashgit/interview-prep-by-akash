import { useStore } from '../lib/store';
import { recordAttempt, REVIEW_AFTER_DAYS } from '../lib/spacedRepetition';
import { todayISO } from '../lib/dates';
import { useToast } from './Toast';
import { RATED_EVENT } from '../lib/events';

const LEVELS = [
  { value: 1, label: 'Shaky', title: `Needed hints or the solution: booster dose in ${REVIEW_AFTER_DAYS} days` },
  { value: 2, label: 'OK', title: `Solved, but slowly or with bugs: booster dose in ${REVIEW_AFTER_DAYS} days` },
  { value: 3, label: 'Nailed it', title: 'Could do it cold in an interview: digested, no booster needed' },
] as const;

/** Records an attempt with a confidence rating; shaky and OK bring the problem back for review. */
export default function ConfidenceButtons({ problemId, subtle }: { problemId: string; subtle?: boolean }) {
  const { state, update } = useStore();
  const toast = useToast();
  const prog = state.problems[problemId];
  const today = todayISO();
  const ratedToday = prog?.attempts.at(-1) === today ? prog.confidence : undefined;

  const rate = (level: 1 | 2 | 3) => {
    update((s) => ({ ...s, problems: { ...s.problems, [problemId]: recordAttempt(s.problems[problemId], today, level) } }));
    window.dispatchEvent(new CustomEvent(RATED_EVENT, { detail: { level } }));
    toast(level === 3 ? 'Digested · no booster needed' : `Swallowed · booster dose in ${REVIEW_AFTER_DAYS} days`);
  };

  return (
    <div className={`segmented ${subtle ? 'reveal' : ''} ${ratedToday ? 'keep' : ''}`} role="group" aria-label="Rate your attempt">
      {LEVELS.map((l) => (
        <button key={l.value} className={ratedToday === l.value ? 'selected' : ''} title={l.title} onClick={() => rate(l.value)}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
