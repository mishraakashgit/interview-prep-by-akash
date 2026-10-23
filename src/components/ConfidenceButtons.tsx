import { useStore } from '../lib/store';
import { recordAttempt } from '../lib/spacedRepetition';
import { diffDays, todayISO } from '../lib/dates';
import { useToast } from './Toast';

const LEVELS = [
  { value: 1, label: 'Shaky', title: 'Needed hints or the solution: review tomorrow' },
  { value: 2, label: 'OK', title: 'Solved, but slowly or with bugs' },
  { value: 3, label: 'Nailed it', title: 'Could do it cold in an interview' },
] as const;

/** Records a solve with a confidence rating and schedules the next review. */
/** `subtle` hides the control until the row is hovered (unless already rated today). */
export default function ConfidenceButtons({ problemId, subtle }: { problemId: string; subtle?: boolean }) {
  const { state, update } = useStore();
  const toast = useToast();
  const prog = state.problems[problemId];
  const today = todayISO();
  const ratedToday = prog?.attempts.at(-1) === today ? prog.confidence : undefined;

  const rate = (level: 1 | 2 | 3) => {
    const next = recordAttempt(state.problems[problemId], today, level);
    update((s) => ({ ...s, problems: { ...s.problems, [problemId]: next } }));
    const days = diffDays(today, next.nextReview!);
    toast(`Logged · next review in ${days} day${days === 1 ? '' : 's'}`);
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
