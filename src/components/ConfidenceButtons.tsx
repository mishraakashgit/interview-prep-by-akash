import { useStore } from '../lib/store';
import { recordAttempt } from '../lib/spacedRepetition';
import { todayISO } from '../lib/dates';

const LEVELS = [
  { value: 1, label: 'Shaky', title: 'Needed hints or the solution: review tomorrow' },
  { value: 2, label: 'OK', title: 'Solved, but slowly or with bugs' },
  { value: 3, label: 'Nailed it', title: 'Could do it cold in an interview' },
] as const;

/** Records a solve with a confidence rating and schedules the next review. */
export default function ConfidenceButtons({ problemId }: { problemId: string }) {
  const { state, update } = useStore();
  const prog = state.problems[problemId];
  const today = todayISO();
  const ratedToday = prog?.attempts.at(-1) === today ? prog.confidence : undefined;

  return (
    <div className="row" role="group" aria-label="Record attempt">
      {LEVELS.map((l) => (
        <button
          key={l.value}
          className={`small ${ratedToday === l.value ? 'selected' : ''}`}
          title={l.title}
          onClick={() =>
            update((s) => ({
              ...s,
              problems: { ...s.problems, [problemId]: recordAttempt(s.problems[problemId], today, l.value) },
            }))
          }
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
