import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { PROBLEMS, leetcodeUrl } from '../data/dsa';
import { SD_TOPICS } from '../data/systemDesign';
import { BEHAVIORAL_QUESTIONS } from '../data/behavioral';
import { PageHeader } from '../components/ui';

type Mode = 'coding' | 'design' | 'behavioral';

const MODES: { id: Mode; label: string; minutes: number }[] = [
  { id: 'coding', label: 'Coding (45 min)', minutes: 45 },
  { id: 'design', label: 'System design (45 min)', minutes: 45 },
  { id: 'behavioral', label: 'Behavioral (30 min)', minutes: 30 },
];

const RUBRIC: Record<Mode, string[]> = {
  coding: [
    'Clarified inputs, constraints and edge cases before coding',
    'Talked through brute force, then optimised',
    'Stated time and space complexity correctly',
    'Code was clean, with meaningful names',
    'Dry-ran with an example and tested edge cases',
  ],
  design: [
    'Gathered functional and non-functional requirements',
    'Did capacity estimates and used them',
    'Drew a clear high-level design and walked the request path',
    'Drove at least two deep dives without prompting',
    'Discussed failure modes, consistency and trade-offs',
  ],
  behavioral: [
    'Used STAR structure; answers were ~2 minutes',
    'Said "I" and made my own actions clear',
    'Quantified results',
    'Showed leadership scope beyond my own code',
    'Shared a genuine learning or what I would do differently',
  ],
};

const pick = <T,>(arr: T[], n: number): T[] => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

const fmt = (secs: number) =>
  `${String(Math.floor(Math.abs(secs) / 60)).padStart(2, '0')}:${String(Math.abs(secs) % 60).padStart(2, '0')}`;

export default function MockPage() {
  const { state } = useStore();
  const [mode, setMode] = useState<Mode>('coding');
  const [prompt, setPrompt] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(45 * 60);
  const [running, setRunning] = useState(false);
  const [rubric, setRubric] = useState<number[]>([]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const generate = (m: Mode) => {
    setMode(m);
    setRubric([]);
    setRunning(false);
    setRemaining(MODES.find((x) => x.id === m)!.minutes * 60);
    if (m === 'coding') {
      // Prefer problems you have not nailed yet, at interview difficulty.
      const pool = PROBLEMS.filter((p) => p.difficulty !== 'Easy' && state.problems[p.id]?.confidence !== 3);
      setPrompt(pick(pool.length ? pool : PROBLEMS, 1).map((p) => p.id));
    } else if (m === 'design') {
      const pool = SD_TOPICS.filter((t) => t.category === 'Case Study' || t.category === 'Fintech');
      setPrompt(pick(pool, 1).map((t) => t.id));
    } else {
      setPrompt(pick(BEHAVIORAL_QUESTIONS, 3).map((q) => q.id));
    }
  };

  return (
    <div className="stack">
      <PageHeader eyebrow="Practice under pressure" title="Mock interview">
        Pick a format, start the clock, and talk out loud as if an interviewer were in the room. Score yourself at the end.
      </PageHeader>

      <div className="segmented" style={{ alignSelf: 'flex-start' }}>
        {MODES.map((m) => (
          <button key={m.id} className={mode === m.id && prompt.length ? 'selected' : ''} onClick={() => generate(m.id)}>
            {m.label}
          </button>
        ))}
      </div>

      {prompt.length === 0 && <p className="card empty">Pick a format above to get a question and start the clock.</p>}

      {prompt.length > 0 && (
        <div className="grid-2">
          <section className="card stack">
            <div className="eyebrow">Your question</div>
            {mode === 'coding' &&
              prompt.map((id) => {
                const p = PROBLEMS.find((x) => x.id === id)!;
                return (
                  <div key={id}>
                    <a href={leetcodeUrl(id)} target="_blank" rel="noreferrer">
                      <strong>{p.title}</strong>
                    </a>{' '}
                    <span className={`badge ${p.difficulty}`}>{p.difficulty}</span>
                    <p className="muted small">Pattern is hidden in a real interview; try to identify it yourself.</p>
                  </div>
                );
              })}
            {mode === 'design' &&
              prompt.map((id) => {
                const t = SD_TOPICS.find((x) => x.id === id)!;
                return (
                  <div key={id}>
                    <strong>{t.title}</strong>
                    <details style={{ marginTop: 8 }}>
                      <summary className="small muted">Reveal what a strong answer covers (after you finish)</summary>
                      <ul className="small">
                        {t.keyPoints.map((k) => (
                          <li key={k}>{k}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                );
              })}
            {mode === 'behavioral' && (
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {prompt.map((id) => (
                  <li key={id}>{BEHAVIORAL_QUESTIONS.find((q) => q.id === id)!.question}</li>
                ))}
              </ol>
            )}
            <button className="small" onClick={() => generate(mode)}>
              Different question
            </button>
          </section>

          <section className="card stack">
            <div className="timer" style={{ color: remaining < 0 ? 'var(--bad)' : undefined }}>
              {remaining < 0 && '-'}
              {fmt(remaining)}
            </div>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="primary" onClick={() => setRunning(!running)}>
                {running ? 'Pause' : 'Start'}
              </button>
              <button onClick={() => generate(mode)}>Reset</button>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Self-assessment</div>
              <ul className="checklist">
                {RUBRIC[mode].map((r, i) => (
                  <li key={r}>
                    <label>
                      <input
                        type="checkbox"
                        checked={rubric.includes(i)}
                        onChange={() => setRubric(rubric.includes(i) ? rubric.filter((x) => x !== i) : [...rubric, i])}
                      />
                      <span>{r}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className="small muted" style={{ marginTop: 8 }}>
                Score: {rubric.length}/{RUBRIC[mode].length}. Write what to improve in today's study log.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
